import json
from pathlib import Path
from pydantic import BaseModel
from app.services.gemini import GeminiClient
from app.schemas import Question, Flashcard

PROMPT_DIR = Path(__file__).parent.parent / "prompts"

def load_prompt(name: str) -> str:
    path = PROMPT_DIR / f"{name}.md"
    return path.read_text(encoding="utf-8")

class QuizResponse(BaseModel):
    questions: list[Question]

class FlashcardResponse(BaseModel):
    flashcards: list[Flashcard]

class QuizService:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.quiz_prompt = load_prompt("quiz_generation")
        self.flashcard_prompt = load_prompt("flashcard_generation")

    async def generate_quiz(self, topic: str, context: str, num_questions: int = 3) -> dict:
        """
        Generates a JSON quiz for the given topic.
        """
        prompt = (
            self.quiz_prompt
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

    async def generate_flashcards(self, concept: str, context: str, count: int = 2) -> list[dict]:
        """
        Generates flashcards for a specific concept.
        """
        prompt = (
            self.flashcard_prompt
            .replace("{{concept}}", concept)
            .replace("{{context}}", context)
            .replace("{{count}}", str(count))
        )
        
        try:
            data = await self.gemini.generate_json_async(prompt, schema=FlashcardResponse)
            return data.get("flashcards", []) if isinstance(data, dict) else []
        except Exception as e:
            print(f"Flashcard Generation Error: {e}")
            return []
