from typing import Any
import json
import re
from google import genai
from google.genai import types
from app.config import settings

class YouTubeClient:
    def __init__(self) -> None:
        if not settings.gemini_api_key:
            print("WARNING: Gemini API Key not configured. Search will fail.")
            self.client = None
        else:
            self.client = genai.Client(
                api_key=settings.gemini_api_key,
                http_options={'api_version': 'v1beta'}
            )
            self.model_id = settings.gemini_model

    def search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        if not self.client:
            return []
            
        results: list[dict[str, Any]] = []
        
        try:
            # Prompt Gemini to provide video links
            prompt = f"""
            Find {limit} relevant and popular YouTube videos matching the query: "{query}".
            Return a pure JSON list of objects, where each object has:
            - "title": The video title
            - "url": The full YouTube watch URL (must start with https://www.youtube.com/watch?v=)
            
            Return ONLY the JSON. No markdown, no explanations.
            """
            
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Use the same JSON parsing logic as in GeminiClient (implicitly via response.text and json.loads)
            text = response.text.strip()
            # Clean up potential markdown code blocks if the SDK didn't handle it
            if text.startswith("```"):
                text = re.sub(r"^```json\s*", "", text)
                text = re.sub(r"```$", "", text)
                text = text.strip()
            
            data = json.loads(text)
            
            for item in data:
                if len(results) >= limit:
                    break
                
                url = item.get("url")
                title = item.get("title", "Unknown Title")
                
                if url and "youtube.com/watch" in url:
                    results.append({
                        "title": title,
                        "url": url,
                        "channel": None,
                        "published_at": None,
                    })

        except Exception as e:
            print(f"Error generating video links with Gemini: {e}")
            return []

        return results
