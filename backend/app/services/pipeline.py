import json
import time
from typing import Any
from app.services.gemini import GeminiClient
from app.services.youtube import YouTubeClient
from app.services.simulation import SimulationService
from app.schemas import Concept, VideoResult
from pathlib import Path

PROMPT_DIR = Path(__file__).parent.parent / "prompts"

def load_prompt(name: str) -> str:
    path = PROMPT_DIR / f"{name}.md"
    return path.read_text(encoding="utf-8")

class PipelineService:
    def __init__(self, gemini_client: GeminiClient, youtube_client: YouTubeClient, simulation_service: SimulationService):
        self.gemini = gemini_client
        self.youtube = youtube_client
        self.simulation = simulation_service

    async def process_chunk(self, text: str, previous_context: str, lecture_id: str, existing_concepts: dict[str, str] = None) -> dict[str, Any]:
        prompt_template = load_prompt("pipeline_decision")
        
        context_concepts = ", ".join(existing_concepts.keys()) if existing_concepts else "None"
        if not context_concepts:
            context_concepts = "None"
        
        prompt = (
            prompt_template.replace("{{previous_context}}", previous_context)
            .replace("{{transcript_chunk}}", text)
            .replace("{{existing_concepts}}", context_concepts)
        )

        try:
            # Async call to Gemini
            data = await self.gemini.generate_json_async(prompt)
            print(f"DEBUG: Pipeline raw output: {json.dumps(data)}")
            print(f"DEBUG: Pipeline received actions: {[a.get('type') for a in (data or {}).get('actions', [])]}")
        except Exception as e:
            print(f"Pipeline Gemini Error: {e}")
            return {"error": str(e)}

        actions = (data or {}).get("actions", [])
        results = {
            "concepts": [],
            "videos": [],
            "simulations": []
        }

        for action in actions:
            a_type = action.get("type")
            payload = action.get("payload", {})

            if a_type == "EXTRACT_CONCEPT":
                keyword = payload.get("keyword")
                definition = payload.get("definition")
                if keyword:
                    # Basic determination of STEM vs not (simplified)
                    stem = True 
                    import time
                    unique_id = f"concept_{lecture_id}_{int(time.time()*1000)}_{len(results['concepts'])}"
                    results["concepts"].append({
                        "id": unique_id,
                        "keyword": keyword,
                        "definition": definition,
                        "stem_concept": stem
                    })

            elif a_type == "SEARCH_REFERENCE":
                query = payload.get("query")
                context_concept = payload.get("context_concept")
                if query:
                    # Try to find the matching concept ID from this same chunk processing or existing concepts
                    matching_concept = next((c for c in results["concepts"] if c["keyword"] == context_concept), None)
                    if matching_concept:
                        context_id = matching_concept["id"]
                    elif existing_concepts and context_concept in existing_concepts:
                        context_id = existing_concepts[context_concept]
                    else:
                        context_id = f"ref_{int(time.time()*1000)}"
                    
                    video_results = self.youtube.search(query, limit=2)
                    for v in video_results:
                        v["context_concept"] = context_concept
                        v["context_concept_id"] = context_id
                        results["videos"].append(v)

            elif a_type == "GENERATE_SIMULATION":
                concept = payload.get("concept")
                desc = payload.get("description")
                if concept:
                    # Try to find the matching concept ID from this same chunk processing
                    matching_concept = next((c for c in results["concepts"] if c["keyword"].lower() == concept.lower()), None)
                    
                    # If it's a new concept in this chunk, use its generated ID.
                    # If it's an existing concept from previous chunks, use its known ID.
                    # Otherwise, generate a deterministic-ish ID based on keyword.
                    if matching_concept:
                        concept_id = matching_concept["id"]
                    elif existing_concepts and concept in existing_concepts:
                        concept_id = existing_concepts[concept]
                    else:
                        # Fallback to a keyword-based ID that the frontend can use to link
                        slug = concept.lower().replace(" ", "_")
                        concept_id = f"sim_link_{slug}"

                    results["simulations"].append({
                        "concept": concept,
                        "concept_id": concept_id,
                        "description": desc,
                        "status": "pending",
                        "code": None
                    })

        # Fallback: Ensure every concept extracted has a corresponding simulation (now also pending)
        extracted_keywords = [c["keyword"] for c in results["concepts"]]
        simulated_keywords = [s["concept"] for s in results["simulations"]]
        
        for concept_obj in results["concepts"]:
            if concept_obj["keyword"] not in simulated_keywords:
                results["simulations"].append({
                    "concept": concept_obj["keyword"],
                    "concept_id": concept_obj["id"],
                    "description": f"Mandatory simulation for {concept_obj['keyword']}",
                    "status": "pending",
                    "code": None
                })

        return results
