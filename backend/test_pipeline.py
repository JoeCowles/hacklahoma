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
            else:
                print("\n❌ Error: Unexpected response type.")
                
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())