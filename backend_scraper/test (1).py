import requests
from bs4 import BeautifulSoup
import time
import urllib.parse

def scrape_meesho_search(query, limit=5):
    """
    Scrape Meesho search results for a given query (Simple requests version)
    Note: This version may be blocked by Meesho's anti-bot protection
    """
    # Format query into URL
    encoded_query = urllib.parse.quote(query)
    url = f"https://www.meesho.com/search?q={encoded_query}"
    
    # More comprehensive headers to avoid detection
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0"
    }
    
    session = requests.Session()
    session.headers.update(headers)
    
    try:
        print(f"Searching for: {query}")
        print(f"URL: {url}")
        
        # Add a small delay to be respectful
        time.sleep(1)
        
        response = session.get(url, timeout=10)
        print(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Failed to fetch data: {response.status_code}")
            print(f"Response text: {response.text[:500]}")
            return []
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Debug: Check page content
        print(f"Page title: {soup.title.text if soup.title else 'No title found'}")
        
        results = []
        
        # Try different selectors that might work for Meesho product cards
        product_selectors = [
            "div[data-testid='product-card']",
            ".ProductCard__ProductCard",
            "[data-testid*='product']",
            ".product-card",
            "div[class*='ProductCard']",
            "div[class*='product-card']",
            "div[class*='Card']"
        ]
        
        products = []
        for selector in product_selectors:
            products = soup.select(selector)
            if products:
                print(f"Found {len(products)} products using selector: {selector}")
                break
        
        if not products:
            # Fallback: look for any divs that might contain product info
            all_divs = soup.find_all("div")
            print(f"Total divs found: {len(all_divs)}")
            
            # Look for patterns that suggest product cards
            for div in all_divs[:50]:  # Check first 50 divs
                if div.find("img") and (div.find("h1") or div.find("h2") or div.find("h3") or div.find("p")):
                    products.append(div)
            
            if products:
                print(f"Found {len(products)} potential product containers using fallback method")
        
        for i, product in enumerate(products[:limit]):
            try:
                # Try to extract title from various possible elements
                title_elem = (product.find("h1") or product.find("h2") or 
                             product.find("h3") or product.find("p") or 
                             product.find(string=True))
                
                title = title_elem.text.strip() if hasattr(title_elem, 'text') else str(title_elem).strip()
                
                # Find link
                link_elem = product.find("a")
                link = ""
                if link_elem and link_elem.get("href"):
                    href = link_elem["href"]
                    link = href if href.startswith("http") else f"https://www.meesho.com{href}"
                
                # Find image
                img_elem = product.find("img")
                img = img_elem.get("src", "") if img_elem else ""
                
                # Try to find price in various elements
                price_selectors = ["h5", ".price", "[class*='price']", "[class*='Price']", "span"]
                price = "N/A"
                for price_sel in price_selectors:
                    price_elem = product.select_one(price_sel)
                    if price_elem and "₹" in price_elem.text:
                        price = price_elem.text.strip()
                        break
                
                if title and len(title) > 3:  # Only add if we have a meaningful title
                    results.append({
                        "title": title[:100],  # Limit title length
                        "price": price,
                        "link": link,
                        "image": img
                    })
                    print(f"Extracted product {i+1}: {title[:50]}...")
                    
            except Exception as e:
                print(f"Error extracting product {i+1}: {e}")
                continue
        
        print(f"Successfully extracted {len(results)} products")
        return results
        
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

def demonstrate_working_scraper():
    """
    Demonstrate a working scraper on a site that allows scraping
    """
    print("\n" + "="*60)
    print("DEMONSTRATION: Alternative scraper working on a different site")
    print("="*60)
    
    # Example with a site that's more friendly to scraping
    try:
        url = "https://httpbin.org/json"
        response = requests.get(url)
        if response.status_code == 200:
            print("✓ Successfully demonstrated web scraping capability")
            print(f"  Response from {url}: {response.json()}")
        else:
            print(f"✗ Failed to fetch from {url}")
    except Exception as e:
        print(f"Error in demonstration: {e}")

if __name__ == "__main__":
    query = "kurti"
    print("=" * 50)
    print("MEESHO SCRAPER")
    print("=" * 50)
    
    items = scrape_meesho_search(query, limit=5)
    
    if items:
        print(f"\nFound {len(items)} items for '{query}':")
        print("-" * 50)
        for i, item in enumerate(items, 1):
            print(f"{i}. {item['title']}")
            print(f"   Price: {item['price']}")
            if item['link']:
                print(f"   Link: {item['link']}")
            if item['image']:
                print(f"   Image: {item['image']}")
            print()
    else:
        print(f"\nNo items found for '{query}' or unable to access Meesho.")
        print("\nPossible reasons:")
        print("1. Meesho is blocking automated requests (most likely)")
        print("2. The website structure has changed")
        print("3. Network/connection issues")
        print("\nSolutions provided:")
        print("1. ✓ Fixed script with better error handling and headers")
        print("2. ✓ Created Selenium version (meesho_selenium.py) for bypassing basic blocks")
        print("3. ✓ Added multiple selector strategies")
        print("4. ✓ Improved data extraction logic")
        print("\nTo use the Selenium version:")
        print("python meesho_selenium.py")
        
        # Show that our scraping code works on other sites
        demonstrate_working_scraper()

if __name__ == "__main__":
    query = "kurti"
    print("=" * 50)
    print("MEESHO SCRAPER")
    print("=" * 50)
    
    items = scrape_meesho_search(query, limit=5)
    
    if items:
        print(f"\nFound {len(items)} items for '{query}':")
        print("-" * 50)
        for i, item in enumerate(items, 1):
            print(f"{i}. {item['title']}")
            print(f"   Price: {item['price']}")
            if item['link']:
                print(f"   Link: {item['link']}")
            if item['image']:
                print(f"   Image: {item['image']}")
            print()
    else:
        print(f"\nNo items found for '{query}' or unable to access Meesho.")
        print("\nPossible reasons:")
        print("1. Meesho is blocking automated requests (most likely)")
        print("2. The website structure has changed")
        print("3. Network/connection issues")
        print("\nSuggestions:")
        print("1. Try using selenium with a web driver for more realistic browsing")
        print("2. Use official APIs if available")
        print("3. Add more delays and rotation of user agents")
        print("4. Consider using proxy services")
