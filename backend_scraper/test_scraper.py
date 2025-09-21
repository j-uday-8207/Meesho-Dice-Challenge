import meesho_selenium

if __name__ == "__main__":
    try:
        print("Testing Meesho scraper...")
        products = meesho_selenium.scrape_meesho_selenium("tshirt")
        print(f"Found {len(products)} products")
        for product in products:
            print(f"Name: {product['name']}")
            print(f"Price: {product['price']}")
            print("---")
    except Exception as e:
        print(f"Error: {e}")