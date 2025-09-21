from meesho_scraper import scrape_meesho_selenium

def test_scrapers():
    print("\n=== Testing Selenium Scraper ===")
    print("--------------------------------")
    results_selenium = scrape_meesho_selenium("kurti", limit=5)
    
    if results_selenium:
        print(f"\nFound {len(results_selenium)} products:")
        print("=" * 50)
        for i, product in enumerate(results_selenium, 1):
            print(f"\nProduct {i}:")
            print("-" * 30)
            print(f"Title: {product['title']}")
            print(f"Price: {product['price']}")
            print(f"Link:  {product['link']}")
            print(f"Image: {product['image']}")
    else:
        print("No products found")

if __name__ == "__main__":
    test_scrapers()