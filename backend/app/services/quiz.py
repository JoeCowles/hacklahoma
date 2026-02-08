import json
from pathlib import Path
from pydantic import BaseModel
from app.services.gemini import GeminiClient
from app.schemas import Question

PROMPT_DIR = Path(__file__).parent.parent / "prompts"

def load_prompt(name: str) -> str:
    path = PROMPT_DIR / f"{name}.md"
    return path.read_text(encoding="utf-8")

class QuizResponse(BaseModel):
    questions: list[Question]

class QuizService:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.prompt_template = load_prompt("quiz_generation")

    async def generate_quiz(self, topic: str, context: str, num_questions: int = 3) -> dict:
        """
        Generates a JSON quiz for the given topic.
        """
        prompt = (
            self.prompt_template
            .replace("{{topic}}", topic)
            .replace("{{context}}", context)
            .replace("{{num_questions}}", str(num_questions))
        )
        
        try:
            data = await self.gemini.generate_json_async(prompt, schema=QuizResponse)
            return data
        except Exception as e:
            print(f"Quiz Generation Error: {e}")
            return {"questions": []}
