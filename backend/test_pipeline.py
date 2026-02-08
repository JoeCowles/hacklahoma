import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://127.0.0.1:8000/ws/test_user"
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # Simulate a committed transcript chunk
            payload = {
                "type": "transcript_commit",
                "lecture_id": "test_lecture_123",
                "chunk_id": "chunk_001",
                "text": "Today we are discussing the Wave-Particle Duality in quantum mechanics, which suggests that every particle can be described as either a particle or a wave.",
                "previous_context": ""
            }
            
            print(f"Sending payload: {payload['text']}")
            await websocket.send(json.dumps(payload))
            
            # Wait for the pipeline result
            response = await websocket.recv()
            result = json.loads(response)
            
            print("\nReceived Response:")
            print(json.dumps(result, indent=2))
            
            if result.get("type") == "pipeline_result":
                print("\n✅ Success: Received pipeline results from Gemini!")
                
                # Check for pending simulations and wait for update
                sims = result.get("results", {}).get("simulations", [])
                pending = [s for s in sims if s.get("status") == "pending"]
                if pending:
                    print(f"\nWaiting for {len(pending)} pending simulations...")
                    # Increase timeout for generation
                    response_update = await asyncio.wait_for(websocket.recv(), timeout=60)
                    result_update = json.loads(response_update)
                    print("\nReceived Update:")
                    print(json.dumps(result_update, indent=2))
                    
                    updated_sims = result_update.get("results", {}).get("simulations", [])
                    ready = [s for s in updated_sims if s.get("status") == "ready"]
                    if ready:
                        print("\n✅ Success: Received simulation update!")
                    else:
                        print("\n❌ Error: Update did not contain ready simulations.")

            else:
                print("\n❌ Error: Unexpected response type.")
                
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())