import asyncio
import sys
import os

# Add the current directory to sys.path so it can find 'app'
sys.path.append(os.getcwd())

from unittest.mock import MagicMock
from app.services.pipeline import PipelineService
from app.services.quiz import QuizService

# Mock classes
class MockGeminiPipeline:
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
                    "type": "GENERATE_QUIZ",
                    "payload": {
                        "topic": "Test Topic",
                        "concept": "Test Concept"
                    }
                }
            ]
        }

class MockGeminiQuiz:
    async def generate_json_async(self, prompt, schema=None):
        return {
            "questions": [
                {
                    "id": "q1",
                    "text": "What is a test?",
                    "options": ["A", "B", "C", "D"],
                    "correct_option_index": 0,
                    "explanation": "Because A is correct."
                }
            ]
        }

class MockYouTube:
    def search(self, query, limit):
        return []

class MockSimulation:
    pass

async def test_pipeline_quiz():
    gemini_pipeline = MockGeminiPipeline()
    gemini_quiz = MockGeminiQuiz()
    
    youtube = MockYouTube()
    sim = MockSimulation()
    
    # Test Pipeline logic
    pipeline = PipelineService(gemini_pipeline, youtube, sim)
    result = await pipeline.process_chunk("test chunk", "", "lecture_123")
    
    print("Concepts found:", len(result["concepts"]))
    print("Quizzes found (pending):", len(result["quizzes"]))
    
    if len(result["quizzes"]) > 0:
        quiz_req = result["quizzes"][0]
        print(f"Quiz Topic: {quiz_req['topic']}")
        print(f"Quiz Status: {quiz_req['status']}")
        
        # Test Quiz Generation logic
        quiz_service = QuizService(gemini_quiz)
        quiz_data = await quiz_service.generate_quiz(quiz_req["topic"], "context")
        
        print("Generated Questions:", len(quiz_data["questions"]))
        if len(quiz_data["questions"]) > 0:
            q = quiz_data["questions"][0]
            print(f"Question: {q['text']}")
            print(f"Options: {q['options']}")

if __name__ == "__main__":
    asyncio.run(test_pipeline_quiz())
