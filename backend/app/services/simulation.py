import re
from pathlib import Path
from app.services.gemini import GeminiClient

PROMPT_DIR = Path(__file__).parent.parent / "prompts"

def load_prompt(name: str) -> str:
    path = PROMPT_DIR / f"{name}.md"
    return path.read_text(encoding="utf-8")

class SimulationService:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.system_prompt = load_prompt("system_animation")
        self.user_template = load_prompt("simulation_user")
        self.chunk_template = load_prompt("simulation_from_chunk")

    async def get_cached_simulation(self, db, concept: str) -> dict | None:
        """
        Tries to find a similar simulation in the cache using Atlas Search (Lucene).
        MongoDB Atlas handles the text search natively without needing external embeddings.
        """
        if db is None:
            return None
            
        try:
            # Native MongoDB Atlas Search (Lucene-based)
            # More cautious: maxEdits: 1 allows for minor typos only
            pipeline = [
                {
                    "$search": {
                        "index": "simulation_cache_concepts",
                        "text": {
                            "query": concept,
                            "path": "concept",
                            "fuzzy": {
                                "maxEdits": 1,
                                "prefixLength": 0
                            }
                        }
                    }
                },
                {
                    "$limit": 1
                }
            ]
            
            results = list(db.simulation_cache.aggregate(pipeline))
            if results:
                res = results[0]
                # Optional: We could add a score threshold check here if needed
                return {
                    "concept": res.get("concept"),
                    "description": res.get("description"),
                    "code": res.get("code")
                }
            else:
                # Try strict regex fallback if Atlas Search index didn't match
                # Anchored match (^ and $) for caution
                res = db.simulation_cache.find_one({"concept": {"$regex": f"^{re.escape(concept)}$", "$options": "i"}})
                if res:
                    return {
                        "concept": res.get("concept"),
                        "description": res.get("description"),
                        "code": res.get("code")
                    }
        except Exception:
            # Fallback to strict exact match
            res = db.simulation_cache.find_one({"concept": {"$regex": f"^{re.escape(concept)}$", "$options": "i"}})
            if res:
                return {
                    "concept": res.get("concept"),
                    "description": res.get("description"),
                    "code": res.get("code")
                }
            
        return None

    async def cache_simulation(self, db, concept: str, description: str, code: str):
        """
        Caches a simulation. MongoDB Atlas Vector Search index will automatically
        generate the embedding for the document based on its configuration.
        """
        if db is None:
            return

        try:
            db.simulation_cache.update_one(
                {"concept": concept},
                {
                    "$set": {
                        "concept": concept,
                        "description": description,
                        "code": code,
                        "cached_at": __import__("time").time()
                    }
                },
                upsert=True
            )
            print(f"DEBUG: Cached simulation for '{concept}'")
        except Exception as e:
            print(f"Error caching simulation: {e}")

    async def generate_simulation(self, db, concept: str, description: str, context: str) -> str:
        """
        Generates a self-contained HTML/ThreeJS simulation.
        Checks global cache first (invisible to caller).
        """
        # INVISIBLE CACHE CHECK
        cached = await self.get_cached_simulation(db, concept)
        if cached:
            return cached["code"]

        user_prompt = (
            self.user_template
            .replace("{{concept}}", concept)
            .replace("{{description}}", description)
            .replace("{{context}}", context)
        )
        
        # Prepend system prompt
        full_prompt = f"""{self.system_prompt}

---

{user_prompt}"""
        
        try:
            response_text = await self.gemini.generate_text_async(full_prompt)
            print(f"DEBUG: Simulation raw response length: {len(response_text)}")
        except Exception as e:
            print(f"Simulation Generation Error: {e}")
            return f"<!-- Error generating simulation: {str(e)} -->"
        
        # Clean up response (extract code block)
        match = re.search(r"```html\s*(.*?)```", response_text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        match_generic = re.search(r"```\s*(.*?)```", response_text, re.DOTALL)
        if match_generic:
            return match_generic.group(1).strip()
            
        if response_text.strip().startswith("<"):
            return response_text.strip()
            
        return response_text 

    async def generate_simulation_from_chunk(self, db, chunk_text: str, context: str) -> dict | None:
        """
        Generates a simulation directly from a chunk of text.
        Checks cache if a concept is identified.
        """
        prompt = (
            self.chunk_template
            .replace("{{transcript_chunk}}", chunk_text)
            .replace("{{context}}", context)
        )
        
        try:
            response_text = await self.gemini.generate_text_async(prompt)
        except Exception as e:
            print(f"Chunk Simulation Generation Error: {e}")
            return None

        try:
            concept_match = re.search(r"CONCEPT:\s*(.*?)(?:\n|$)", response_text, re.IGNORECASE)
            desc_match = re.search(r"DESCRIPTION:\s*(.*?)(?:\n|$)", response_text, re.IGNORECASE)
            
            concept = concept_match.group(1).strip() if concept_match else "Auto-Generated Concept"
            
            # INVISIBLE CACHE CHECK
            cached = await self.get_cached_simulation(db, concept)
            if cached:
                return cached

            code_match = re.search(r"CODE_START\s*(.*?)\s*CODE_END", response_text, re.DOTALL)
            if not code_match:
                 match_html = re.search(r"```html\s*(.*?)```", response_text, re.DOTALL | re.IGNORECASE)
                 if match_html:
                     code = match_html.group(1).strip()
                 else:
                     return None
            else:
                code = code_match.group(1).strip()

            description = desc_match.group(1).strip() if desc_match else "Simulation generated from transcript."
            
            return {
                "concept": concept,
                "description": description,
                "code": code
            }

        except Exception as e:
            print(f"Error parsing chunk simulation response: {e}")
            return None
