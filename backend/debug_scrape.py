import httpx
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

def test_scrape():
    # query = "photosynthesis explained"
    # search_query = f"site:youtube.com {query}"
    # url = f"https://www.google.com/search?q={quote_plus(search_query)}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    # Using the same logic as youtube.py
    base_url = "https://www.google.com/search"
    search_query = "site:youtube.com photosynthesis explained"
    params = {"q": search_query, "num": 5}

    print(f"Fetching: {base_url} with params {params}")
    
    with httpx.Client(timeout=10.0, headers=headers) as client:
        response = client.get(base_url, params=params)
        print(f"Status Code: {response.status_code}")
        html = response.text
        
        # Save to file for inspection
        with open("debug_google.html", "w") as f:
            f.write(html)
            
    soup = BeautifulSoup(html, "html.parser")
    results = []
    
    # Updated selectors based on user snippet
    print(f"Number of 'div.MjjYud' found: {len(soup.select('div.MjjYud'))}")
    
    for item in soup.select("div.MjjYud"):
        link_tag = item.select_one("a[href*='youtube.com/watch']")
        if not link_tag:
            continue
            
        url = link_tag.get("href")
        print(f"Found URL: {url}")
        
        title_tag = link_tag.select_one("h3")
        if not title_tag:
             title_tag = item.select_one("h3")
             
        title = title_tag.get_text() if title_tag else "Unknown Title"
        print(f"  -> Valid Video: {title}")
        
if __name__ == "__main__":
    test_scrape()
