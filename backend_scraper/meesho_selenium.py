import time
import os
import urllib.parse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

def setup_driver():
    """Setup Chrome driver with options to avoid detection"""
    chrome_options = Options()
    
    # Add arguments to make it less detectable as a bot
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Add headless mode (optional - comment out to see the browser)
    chrome_options.add_argument("--headless=new")
    
    # Optional: Run in headless mode (comment out if you want to see the browser)
    # chrome_options.add_argument("--headless")
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Execute script to remove webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
    except Exception as e:
        print(f"Error setting up driver: {e}")
        return None

def scrape_meesho_selenium(query, limit=5):
    """
    Scrape Meesho using Selenium for better bot detection avoidance
    """
    driver = setup_driver()
    if not driver:
        return []
    
    try:
        # Format query into URL
        encoded_query = urllib.parse.quote(query)
        url = f"https://www.meesho.com/search?q={encoded_query}"
        
        print(f"Searching for: {query}")
        print(f"URL: {url}")
        
        # Navigate to the page
        driver.get(url)
        print("Page loaded, waiting for content...")
        
        # Wait for page to load
        time.sleep(10)  # Increased wait time
        
        # Check if we're blocked
        page_title = driver.title
        print(f"Page title: {page_title}")
        
        if "Access Denied" in page_title or "403" in page_title:
            print("Still being blocked by Meesho")
            return []
        
        # Try to wait for product elements to load
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div"))
            )
        except TimeoutException:
            print("Timeout waiting for page elements")
        
        # Get page source and parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        results = []
        
        # Try different selectors for Meesho product cards
        product_selectors = [
            "[data-testid='product-card']",
            ".ProductCard__ProductCard",
            "[data-testid*='product']",
            ".product-card",
            "div[class*='ProductCard']",
            "div[class*='product-card']",
            "div[class*='Card']",
            "a[href*='/p/']"  # Meesho product links usually contain /p/
        ]
        
        products = []
        for selector in product_selectors:
            products = soup.select(selector)
            if products:
                print(f"Found {len(products)} products using selector: {selector}")
                break
        
        # If no products found with specific selectors, try to find by selenium
        if not products:
            try:
                # Look for product elements using Selenium
                product_elements = driver.find_elements(By.CSS_SELECTOR, "div")
                print(f"Found {len(product_elements)} div elements")
                
                # Filter for elements that might be products
                potential_products = []
                for elem in product_elements[:100]:  # Limit to first 100 for performance
                    try:
                        # Check if element contains product-like content
                        if (elem.find_element(By.TAG_NAME, "img") and 
                            (elem.text.strip() and len(elem.text.strip()) > 10)):
                            potential_products.append(elem)
                    except NoSuchElementException:
                        continue
                
                print(f"Found {len(potential_products)} potential product elements")
                
                # Extract data from selenium elements
                for i, elem in enumerate(potential_products[:limit]):
                    try:
                        title = elem.text.strip()[:100] if elem.text.strip() else f"Product {i+1}"
                        
                        # Try to get link
                        link = ""
                        try:
                            link_elem = elem.find_element(By.TAG_NAME, "a")
                            link = link_elem.get_attribute("href")
                        except NoSuchElementException:
                            pass
                        
                        # Try to get image
                        img = ""
                        try:
                            img_elem = elem.find_element(By.TAG_NAME, "img")
                            img = img_elem.get_attribute("src")
                        except NoSuchElementException:
                            pass
                        
                        if title and len(title) > 3:
                            results.append({
                                "title": title,
                                "price": "Price not available",
                                "link": link,
                                "image": img
                            })
                            print(f"Extracted product {i+1}: {title[:50]}...")
                            
                    except Exception as e:
                        print(f"Error extracting product {i+1}: {e}")
                        continue
                
            except Exception as e:
                print(f"Error finding products with Selenium: {e}")
        
        # Try to extract from BeautifulSoup parsed content
        if not results and products:
            for i, product in enumerate(products[:limit]):
                try:
                    # Find title using common product title patterns
                    title_elem = None
                    for selector in [".Text_container__qLYSd", ".Text_heading__ZYwWr", "h3", "h4", "p"]:
                        elements = product.select(selector)
                        for elem in elements:
                            if elem and elem.text.strip():
                                title_elem = elem
                                break
                        if title_elem:
                            break
                    
                    # Extract title
                    title = title_elem.text.strip() if title_elem else ""
                    
                    # Find link from parent anchor
                    link = ""
                    parent_a = product.find_parent("a")
                    if parent_a and parent_a.get("href"):
                        href = parent_a["href"]
                        link = href if href.startswith("http") else f"https://www.meesho.com{href}"
                    
                    # Find product image
                    img = ""
                    img_elements = product.select("img")
                    for img_elem in img_elements:
                        if img_elem and img_elem.get("src"):
                            src = img_elem["src"]
                            if "products" in src or "images.meesho.com" in src:
                                img = src
                                break
                    
                    # Find price
                    price = "Price not available"
                    price_selectors = [".Text_container__qLYSd", ".Text_body__qwUDc", "span"]
                    for selector in price_selectors:
                        elements = product.select(selector)
                        for elem in elements:
                            if elem and "₹" in elem.text:
                                price = elem.text.strip()
                                break
                        if price != "Price not available":
                            break
                    
                    # Only add if we have meaningful data
                    if title and len(title) > 3 and title != f"Product {i+1}":
                        results.append({
                            "title": title[:100],
                            "price": price,
                            "link": link,
                            "image": img
                        })
                        print(f"Extracted product {len(results)}: {title[:50]}...")
                    
                except Exception as e:
                    print(f"Error extracting product {i+1}: {e}")
                    continue                    # Extract price - look for price elements more carefully
                    price = "Price not available"
                    price_patterns = [
                        lambda p: p.find(string=lambda text: text and "₹" in text and len(text.strip()) < 20),
                        lambda p: p.select_one("h5"),
                        lambda p: p.select_one("[class*='price']"),
                        lambda p: p.select_one("[data-testid*='price']"),
                        lambda p: p.select_one("span")
                    ]
                    
                    for pattern in price_patterns:
                        try:
                            price_elem = pattern(product)
                            if price_elem:
                                if hasattr(price_elem, 'text'):
                                    price_text = price_elem.text.strip()
                                else:
                                    price_text = str(price_elem).strip()
                                    
                                if "₹" in price_text and len(price_text) < 50:
                                    price = price_text
                                    break
                        except:
                            continue
                    
                    # Only add if we have meaningful data
                    if title and len(title) > 3 and title != f"Product {i+1}":
                        results.append({
                            "title": title[:100],
                            "price": price,
                            "link": link,
                            "image": img
                        })
                        print(f"Extracted product {i+1}: {title[:50]}...")
                    elif img and "products" in img:  # If we at least have a product image
                        results.append({
                            "title": title,
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
        
    except Exception as e:
        print(f"Error during scraping: {e}")
        return []
    
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    query = "kurti"
    print("=" * 60)
    print("MEESHO SCRAPER (SELENIUM VERSION)")
    print("=" * 60)
    
    items = scrape_meesho_selenium(query, limit=5)
    
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
        print("\nNote: Meesho has strong anti-bot protection.")
        print("You may need to:")
        print("1. Use residential proxies")
        print("2. Add more sophisticated anti-detection measures")
        print("3. Use their official API if available")
        print("4. Manually solve CAPTCHAs if they appear")