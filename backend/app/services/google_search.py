from typing import Any
from .gemini import GeminiClient, parse_json_from_text
import re

class GoogleSearchService:
    HIGH_QUALITY_SIGNALS = [
        "libretexts.org",
        "wikipedia.org",
        "mit.edu",
        "stanford.edu",
        "harvard.edu",
        "berkeley.edu",
        "khanacademy.org",
        "britannica.com",
        "nature.com",
        "sciencedirect.com",
        "arxiv.org",
        "openstax.org"
    ]

    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client

    async def search_references(self, query: str) -> list[dict[str, Any]]:
        """
        Uses Gemini with Google Search tool to find and rank high-quality reference texts.
        """
        # 1. Ask Gemini to perform a search with grounding
        # We use a prompt that encourages finding authoritative sources
        prompt = f"Find authoritative educational resources, textbooks, and in-depth articles about: {query}. Focus on sources like LibreTexts, university sites, and academic journals."
        
        response = await self.gemini.search_google_async(prompt)
        if not response:
            return []

        # 2. Extract Grounding Metadata (the actual search results used by Gemini)
        results = []
        try:
            # Check for grounding metadata in the response
            # Based on Google GenAI SDK structure for GenerateContentResponse
            metadata = getattr(response.candidates[0], 'grounding_metadata', None)
            if metadata and hasattr(metadata, 'grounding_chunks'):
                for chunk in metadata.grounding_chunks:
                    if hasattr(chunk, 'web') and chunk.web:
                        results.append({
                            "title": chunk.web.title,
                            "url": chunk.web.uri,
                            "snippet": None, # Will try to populate if available elsewhere
                            "source": self._extract_source_name(chunk.web.uri, chunk.web.title)
                        })
        except Exception as e:
            print(f"Error extracting grounding metadata: {e}")

        # 3. Fallback: If no metadata chunks, try to parse from the text response
        if not results:
             # Sometimes the model might list them in text if grounding chunks aren't exposed cleanly
             results = self._parse_from_text(response.text)

        # 4. Rank and Filter
        ranked_results = self._rank_results(results)

        return ranked_results[:3] # Return top 3 high quality matches

    def _extract_source_name(self, url: str, title: str) -> str:
        # Try to get a clean name from common domains
        for signal in self.HIGH_QUALITY_SIGNALS:
            if signal in url.lower():
                return signal.split('.')[0].capitalize()
        
        # Fallback to domain name
        match = re.search(r'https?://(?:www\.)?([^/]+)', url)
        if match:
            return match.group(1)
        return "Educational Resource"

    def _rank_results(self, results: list[dict[str, Any]]) -> list[dict[str, Any]]:
        def score(res):
            url = res['url'].lower()
            s = 0
            # Boost high quality signals
            for signal in self.HIGH_QUALITY_SIGNALS:
                if signal in url:
                    s += 10
            # Boost .edu and .org
            if ".edu" in url: s += 5
            if ".org" in url: s += 3
            # Avoid commercial/low-quality noise if possible (lower priority)
            if "ads" in url or "promo" in url: s -= 5
            return s

        return sorted(results, key=score, reverse=True)

    def _parse_from_text(self, text: str) -> list[dict[str, Any]]:
        # Simple regex to find URLs and Titles if model just wrote them out
        found = []
        # Look for patterns like [Title](URL) or Title: URL
        markdown_links = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', text)
        for title, url in markdown_links:
            found.append({
                "title": title,
                "url": url,
                "snippet": None,
                "source": self._extract_source_name(url, title)
            })
        
        if not found:
            # Look for raw URLs
            urls = re.findall(r'(https?://[^\s\)]+)', text)
            for url in urls:
                # Filter out obvious non-resource links
                if any(x in url for x in ['google.com/search', 'gstatic.com']): continue
                found.append({
                    "title": "Reference Article",
                    "url": url,
                    "snippet": None,
                    "source": self._extract_source_name(url, "")
                })
        return found