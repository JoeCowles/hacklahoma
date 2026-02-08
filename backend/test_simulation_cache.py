import asyncio
import os
import sys
from pathlib import Path

# Add backend to path so we can import app
sys.path.append(str(Path(__file__).parent))

from app.config import settings
from app.services.simulation import SimulationService
from app.services.gemini import GeminiClient
from pymongo import MongoClient

async def test_cache_retrieval():
    print("--- Testing Simulation Cache Retrieval ---")
    
    if not settings.mongo_connection_string:
        print("ERROR: mongo_connection_string not found in settings.")
        return

    client = MongoClient(settings.mongo_connection_string)
    db = client.get_database("hacklahoma_db")
    
    # Initialize Service
    gemini = GeminiClient(api_key=settings.gemini_api_key, model=settings.gemini_model)
    service = SimulationService(gemini)
    
    concept_to_test = "Breadth-First Search (BFS)"
    print(f"Testing retrieval for: '{concept_to_test}'")
    
    # Test 1: Direct Cache Retrieval
    print("\nAttempting get_cached_simulation...")
    cached = await service.get_cached_simulation(db, concept_to_test)
    
    if cached:
        print("✅ SUCCESS: Found cached simulation!")
        print(f"Concept: {cached.get('concept')}")
        print(f"Description: {cached.get('description')}")
        print(f"Code snippet: {cached.get('code')[:100]}...")
    else:
        print("❌ FAILURE: Could not find cached simulation for BFS.")
        # Check if anything is in the collection at all
        count = db.simulation_cache.count_documents({})
        print(f"Total documents in simulation_cache: {count}")
        if count > 0:
            sample = db.simulation_cache.find_one()
            print(f"Sample concept in cache: '{sample.get('concept')}'")

    # Test 2: Invisible Cache Retrieval via generate_simulation
    print("\nAttempting generate_simulation (should hit cache invisibly)...")
    code = await service.generate_simulation(db, concept_to_test, "Testing cache", "context")
    
    if code and "<!-- Error" not in code:
        if cached and code == cached["code"]:
            print("✅ SUCCESS: generate_simulation returned cached code matching get_cached_simulation.")
        else:
            print("ℹ️ INFO: generate_simulation returned code, but check if it was newly generated or from a broader match.")
    else:
        print("❌ FAILURE: generate_simulation failed.")

    client.close()

if __name__ == "__main__":
    asyncio.run(test_cache_retrieval())