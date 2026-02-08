from typing import Any
import yt_dlp

class YouTubeClient:
    def __init__(self) -> None:
        pass

    def search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        
        ydl_opts = {
            'quiet': True,
            'extract_flat': True,
            'force_generic_extractor': False,
            'noplaylist': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # ytsearchN:query searches for N results
                search_query = f"ytsearch{limit}:{query}"
                info = ydl.extract_info(search_query, download=False)
                
                if 'entries' in info:
                    for entry in info['entries']:
                        if not entry:
                            continue
                            
                        # yt-dlp returns 'url' as the video ID sometimes or full URL
                        # For ytsearch flat extraction, it usually gives 'url' as the full URL or just the ID.
                        # Let's check.
                        video_url = entry.get('url')
                        if video_url and not video_url.startswith('http'):
                            video_url = f"https://www.youtube.com/watch?v={video_url}"
                            
                        results.append({
                            "title": entry.get('title', 'Unknown Title'),
                            "url": video_url,
                            "channel": entry.get('uploader'),
                            "published_at": entry.get('upload_date'), # Format might be YYYYMMDD
                            "thumbnail": entry.get('thumbnail'),
                            "duration": entry.get('duration')
                        })
        except Exception as e:
            print(f"Error searching YouTube with yt-dlp: {e}")
            return []

        return results
