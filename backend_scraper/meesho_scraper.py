import time
import os
import urllib.parse
import threading
from queue import Queue
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# Global driver pool for parallel scraping
_driver_pool = Queue(maxsize=4)  # Maximum 4 concurrent drivers
_pool_lock = threading.Lock()
_drivers_created = 0

def setup_driver():
    """Setup Chrome driver with options to avoid detection"""
    chrome_options = Options()
    
    # Add arguments to make it less detectable as a bot
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--allow-running-insecure-content')
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36")
    
    # Run in headless mode
    chrome_options.add_argument("--headless=new")
    
    try:
        service = Service(ChromeDriverManager().install())
        print("ChromeDriver path:", service.path)
        
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Execute script to remove webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        print("Chrome driver setup successfully")
        return driver
    except Exception as e:
        print(f"Error setting up driver: {e}")
        # Print more detailed error information
        import traceback
        print("Full error traceback:")
        print(traceback.format_exc())
        return None

def get_driver_from_pool():
    """Get a driver from the pool or create a new one if pool is empty"""
    global _drivers_created
    
    try:
        # Try to get an existing driver from pool (non-blocking)
        return _driver_pool.get_nowait()
    except:
        # Pool is empty, create a new driver if we haven't reached the limit
        with _pool_lock:
            if _drivers_created < 4:  # Limit concurrent drivers
                driver = setup_driver()
                if driver:
                    _drivers_created += 1
                    print(f"Created new driver #{_drivers_created} for thread {threading.current_thread().name}")
                    return driver
        
        # If we can't create more drivers, wait for one to become available
        print(f"Waiting for available driver in thread {threading.current_thread().name}")
        return _driver_pool.get(timeout=30)  # Wait up to 30 seconds

def return_driver_to_pool(driver):
    """Return a driver to the pool for reuse"""
    if driver:
        try:
            # Clear any existing page state
            driver.delete_all_cookies()
            # Return to pool if there's space
            _driver_pool.put_nowait(driver)
            print(f"Returned driver to pool from thread {threading.current_thread().name}")
        except:
            # Pool is full, just quit the driver
            driver.quit()
            print(f"Pool full, closed driver from thread {threading.current_thread().name}")

def scrape_meesho_selenium(query, limit=5):
    """
    Scrape Meesho using Selenium with driver pooling for parallel execution
    """
    print(f"[Thread {threading.current_thread().name}] Starting scrape for query: {query} with limit: {limit}")
    
    driver = get_driver_from_pool()
    if not driver:
        print("Failed to set up driver")
        return []
    
    print("Driver setup successful")
    
    try:
        # Format query into URL
        encoded_query = urllib.parse.quote(query)
        url = f"https://www.meesho.com/search?q={encoded_query}"
        
        print(f"Searching for: {query}")
        print(f"URL: {url}")
        
        # Navigate to the page with retry mechanism
        max_retries = 3
        success = False
        
        for attempt in range(max_retries):
            try:
                print(f"Attempt {attempt + 1} to load the page")
                driver.get(url)
                
                # Wait for any of these selectors to be present
                product_selectors = [
                    "div[class*='ProductCard']",
                    "div[class*='ProductList']",
                    "[class*='grid']",
                    "a[href*='/product/']"
                ]
                
                # Try each selector
                for selector in product_selectors:
                    try:
                        print(f"Trying selector: {selector}")
                        WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                        )
                        print(f"Found products with selector: {selector}")
                        success = True
                        break
                    except TimeoutException:
                        continue
                
                if success:
                    break
                    
                print(f"Attempt {attempt + 1} failed to find products, retrying...")
                time.sleep(2)
                
            except Exception as e:
                print(f"Error during attempt {attempt + 1}: {e}")
                time.sleep(2)
                
        if not success:
            print("Failed to load products after all attempts")
            return []
            
        # Small additional wait for dynamic content
        time.sleep(2)
        
        # Check if we're blocked
        page_title = driver.title
        print(f"Page title: {page_title}")
        
        if not page_title or "Access Denied" in page_title or "403" in page_title:
            print("Access denied or no page title - might be blocked")
            return []
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        results = []
        
        # First find the product grid container
        product_cards = []
        print("Looking for product grid container...")
        
        # Get the raw HTML and print a sample for debugging
        html = driver.page_source
        print("Page source sample:", html[:500])
        
        # Try different container selectors
        container_selectors = [
            "div[class*='ProductList']",
            "div[class*='grid']",
            "div[class*='sc-dkrFOg']",
            "div[class*='ProductGrid']"
        ]
        
        container = None
        for selector in container_selectors:
            containers = soup.select(selector)
            if containers:
                container = containers[0]
                print(f"Found container using selector: {selector}")
                break
        
        if container:
            # Try different selectors for individual product cards
            card_selectors = [
                "div[class*='ProductCard']",
                "div[class*='gridProduct']",
                "a[href*='/p/']",
                "a[href*='/product/']"
            ]
            
            for selector in card_selectors:
                cards = container.select(selector)
                if cards:
                    print(f"Found {len(cards)} products using selector: {selector}")
                    product_cards.extend(cards)
                    break
        else:
            print("Could not find product container, trying direct card selection...")
            # Fallback to direct card selection
            product_cards = soup.select("a[href*='/p/']") or soup.select("div[class*='ProductCard']")
        
        # Remove duplicates using href as the unique identifier
        seen_links = set()
        unique_cards = []
        
        for card in product_cards:
            # For anchor tags
            if card.name == 'a' and card.get('href'):
                link = card['href']
                if link not in seen_links:
                    seen_links.add(link)
                    unique_cards.append(card)
            # For div containers
            else:
                link_elem = card.find('a') or card.find_parent('a')
                if link_elem and link_elem.get('href'):
                    link = link_elem['href']
                    if link not in seen_links:
                        seen_links.add(link)
                        unique_cards.append(card)
        
        product_cards = unique_cards
        print(f"Found {len(product_cards)} unique product cards")
        
        # Process each product card
        for i, card in enumerate(product_cards[:limit]):
            try:
                # Extract data based on card type
                card_html = str(card)
                print(f"\nProcessing card {i+1}:")
                print(f"Card HTML sample: {card_html[:200]}")
                
                # Extract title
                title = None
                # First try specific title selectors
                title_selectors = [
                    "[class*='Text_heading']",
                    "[class*='Text_title']",
                    "[class*='Text_container']",
                    "[class*='ProductTitle']",
                    "h3", "h4", "h5", "p"
                ]
                
                for selector in title_selectors:
                    elements = card.select(selector)
                    for elem in elements:
                        if elem and elem.text.strip():
                            possible_title = elem.text.strip()
                            if len(possible_title) > 5 and "₹" not in possible_title:
                                title = possible_title
                                print(f"Found title using selector {selector}: {title[:50]}")
                                break
                    if title:
                        break
                
                # Fallback: Try getting text directly from the card
                if not title:
                    text_content = card.get_text(strip=True)
                    # Try to find a suitable title in the text content
                    text_parts = text_content.split("₹")[0].strip()
                    if len(text_parts) > 5:
                        title = text_parts
                        print(f"Found title using fallback method: {title[:50]}")
                
                if not title:
                    print(f"No title found for product {i+1}")
                    continue
                
                # Extract price
                price = "Price not available"
                # First try specific price selectors
                price_selectors = [
                    "[class*='Text_price']",
                    "[class*='price']",
                    "span",
                    "h4"
                ]
                
                for selector in price_selectors:
                    elements = card.select(selector)
                    for elem in elements:
                        if elem and "₹" in elem.text:
                            price_text = elem.text.strip()
                            try:
                                # Find all prices in the text
                                all_prices = [p.strip() for p in price_text.split("₹") if p.strip()]
                                if all_prices:
                                    # Take the first valid price
                                    for p in all_prices:
                                        # Clean up the price
                                        clean_price = p.split()[0].replace(",", "")
                                        if clean_price.isdigit():
                                            price = f"₹{clean_price}"
                                            print(f"Found price: {price}")
                                            break
                            except Exception as e:
                                print(f"Error extracting price: {e}")
                                continue
                    if price != "Price not available":
                        break
                
                # Fallback: Try to find price in all text
                if price == "Price not available":
                    text_content = card.get_text(strip=True)
                    try:
                        if "₹" in text_content:
                            price_parts = text_content.split("₹")
                            for part in price_parts[1:]:  # Skip text before first ₹
                                clean_price = part.split()[0].replace(",", "")
                                if clean_price.isdigit():
                                    price = f"₹{clean_price}"
                                    print(f"Found price using fallback method: {price}")
                                    break
                    except Exception as e:
                        print(f"Error in price fallback: {e}")
                
                # Extract link
                link = "Link not available"
                # First try direct link from card
                link_selector = card.select_one("a")
                if link_selector:
                    href = link_selector.get("href")
                    if href:
                        if href.startswith("http"):
                            link = href
                        else:
                            link = "https://www.meesho.com" + href
                
                # Fallback: Find any link that points to a product
                if link == "Link not available":
                    all_links = card.select("a")
                    for a_tag in all_links:
                        href = a_tag.get("href")
                        if href:
                            # Look for typical product URL patterns
                            if any(pattern in href.lower() for pattern in ["/product/", "/catalog/", "/item/"]):
                                if href.startswith("http"):
                                    link = href
                                else:
                                    link = "https://www.meesho.com" + href
                                print(f"Found product link using fallback method: {link}")
                                break
                
                if link != "Link not available":
                    print(f"Extracted link: {link}")

                # Extract additional product details if available
                
                # Extract image
                img = ""
                img_elem = card.select_one("img[src*='products']")
                if img_elem and img_elem.get("src"):
                    img = img_elem["src"]
                
                if title and len(title) > 3:
                    results.append({
                        "title": title[:100],
                        "price": price,
                        "link": link,
                        "image": img
                    })
                    print(f"Extracted product {len(results)}: {title[:50]}...")
                
            except Exception as e:
                print(f"Error extracting product {i+1}: {e}")
                continue
        
        print(f"Successfully extracted {len(results)} products")
        return results
        
    except Exception as e:
        print(f"Error during scraping: {e}")
        return []
    
    finally:
        # Return driver to pool for reuse
        return_driver_to_pool(driver)

def cleanup_driver_pool():
    """Clean up all drivers in the pool when shutting down"""
    print("Cleaning up driver pool...")
    while not _driver_pool.empty():
        try:
            driver = _driver_pool.get_nowait()
            driver.quit()
            print("Closed a driver from pool")
        except:
            break
    print("Driver pool cleanup complete")

if __name__ == "__main__":
    query = "kurti"
    items = scrape_meesho_selenium(query, limit=5)
    
    if items:
        print("\nExtracted Products:")
        print("=" * 50)
        for i, item in enumerate(items, 1):
            print(f"\nProduct {i}:")
            print("-" * 30)
            print(f"Title: {item['title']}")
            print(f"Price: {item['price']}")
            print(f"Link:  {item['link']}")
            print(f"Image: {item['image']}")