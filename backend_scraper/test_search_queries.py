import requests
import time
from concurrent.futures import ThreadPoolExecutor
import json

# Test queries covering different categories and scenarios
TEST_QUERIES = [
    "women dress",
    "men tshirt",
    "kids toys",
    "home decor",
    "kitchen accessories",
    "mobile accessories",
    "shoes",
    "handbags",
    "jewellery",
    "beauty products"
]

def test_search_query(query):
    """Test a single search query"""
    print(f"\nTesting search query: {query}")
    try:
        response = requests.get(f"http://localhost:5001/api/search?q={query}", timeout=60)
        data = response.json()
        
        if data.get("success"):
            products = data.get("products", [])
            print(f"✅ Success! Found {len(products)} products")
            
            if products:
                # Validate first product data
                first_product = products[0]
                required_fields = ["name", "price", "image", "link"]
                missing_fields = [field for field in required_fields if not first_product.get(field)]
                
                if missing_fields:
                    print(f"⚠️  Warning: Missing fields in product data: {missing_fields}")
                else:
                    print(f"Sample product: {first_product['name'][:50]}...")
                    print(f"Price: ₹{first_product['price']}")
            
        else:
            print(f"❌ Error: {data.get('error')}")
            
        return {
            "query": query,
            "success": data.get("success", False),
            "product_count": len(data.get("products", [])),
            "error": data.get("error")
        }
        
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return {
            "query": query,
            "success": False,
            "product_count": 0,
            "error": str(e)
        }

def main():
    print("Starting search query tests...")
    results = []
    
    # Test queries sequentially to avoid overwhelming the server
    for query in TEST_QUERIES:
        result = test_search_query(query)
        results.append(result)
        time.sleep(2)  # Small delay between requests
    
    # Generate summary report
    print("\n=== Test Summary ===")
    successful_queries = sum(1 for r in results if r["success"])
    print(f"Total queries tested: {len(results)}")
    print(f"Successful queries: {successful_queries}")
    print(f"Failed queries: {len(results) - successful_queries}")
    
    # Save detailed results to file
    with open("search_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nDetailed results saved to search_test_results.json")

if __name__ == "__main__":
    main()