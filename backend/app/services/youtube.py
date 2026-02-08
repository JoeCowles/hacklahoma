from typing import Any
import json
import google.generativeai as genai
from app.config import settings

class YouTubeClient:
    def __init__(self) -> None:
        if not settings.gemini_api_key:
            print("WARNING: Gemini API Key not configured. Search will fail.")
        else:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(settings.gemini_model)

    def search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        
        try:
            # Prompt Gemini to provide video links
            # We ask for JSON to make parsing reliable
            prompt = f"""
            Find {limit} relevant and popular YouTube videos matching the query: "{query}".
            Return a pure JSON list of objects, where each object has:
            - "title": The video title
            - "url": The full YouTube watch URL (must start with https://www.youtube.com/watch?v=)
            
            Return ONLY the JSON. No markdown, no explanations.
            """
            
            response = self.model.generate_content(prompt)
            
            # Clean up potential markdown code blocks
            text = response.text.replace("```json", "").replace("```", "").strip()
            
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
