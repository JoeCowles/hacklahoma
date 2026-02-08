import asyncio
import sys
import os

# Add the current directory to sys.path so it can find 'app'
sys.path.append(os.getcwd())

from unittest.mock import MagicMock
from app.services.pipeline import PipelineService

# Mock classes
class MockGemini:
    async def generate_json_async(self, prompt):
        return {
            "actions": [
                {
                    "type": "EXTRACT_CONCEPT",
                    "payload": {
                        "keyword": "Test Concept",
                        "definition": "A test definition"
                    }
                },
                {
                    "type": "CREATE_FLASHCARD",
                    "payload": {
                        "front": "What is a test?",
                        "back": "It is a procedure to verify quality.",
                        "concept": "Test Concept"
                    }
                }
            ]
        }

class MockYouTube:
    def search(self, query, limit):
        return []

class MockSimulation:
    pass

async def test_pipeline():
    gemini = MockGemini()
    youtube = MockYouTube()
    sim = MockSimulation()
    pipeline = PipelineService(gemini, youtube, sim)

    result = await pipeline.process_chunk("test chunk", "", "lecture_123")
    
    print("Concepts found:", len(result["concepts"]))
    print("Flashcards found:", len(result["flashcards"]))
    if len(result["flashcards"]) > 0:
        fc = result["flashcards"][0]
        print(f"Flashcard Front: {fc['front']}")
        print(f"Flashcard Back: {fc['back']}")
        # Check linking
        if fc["concept_id"] == result["concepts"][0]["id"]:
            print("Linking to Concept: SUCCESS")
        else:
            print(f"Linking to Concept: FAILED (Concept ID: {result['concepts'][0]['id']}, FC Concept ID: {fc['concept_id']})")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
