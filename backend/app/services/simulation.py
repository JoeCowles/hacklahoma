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

    async def generate_simulation(self, concept: str, description: str, context: str) -> str:
        """
        Generates a self-contained HTML/ThreeJS simulation for the given concept.
        Returns the raw HTML code.
        """
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
            if len(response_text) < 100:
                print(f"DEBUG: Short response: {response_text}")
        except Exception as e:
            print(f"Simulation Generation Error: {e}")
            return f"<!-- Error generating simulation: {str(e)} -->"
        
        # Clean up response (extract code block)
        # Look for ```html ... ```
        match = re.search(r"```html\s*(.*?)```", response_text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # Fallback if wrapped in generic block
        match_generic = re.search(r"```\s*(.*?)```", response_text, re.DOTALL)
        if match_generic:
            return match_generic.group(1).strip()
            
        # Fallback: assume the whole text is code if it starts with <
        if response_text.strip().startswith("<"):
            return response_text.strip()
            
        return response_text 
