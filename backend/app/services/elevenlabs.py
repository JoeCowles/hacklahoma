import httpx


class ElevenLabsClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key
        self.base_url = "https://api.elevenlabs.io/v1"

    def text_to_speech(self, text: str, voice_id: str, model_id: str | None = None) -> bytes:
        url = f"{self.base_url}/text-to-speech/{voice_id}"
        payload = {
            "text": text,
            "model_id": model_id or "eleven_multilingual_v2",
        }
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.content
