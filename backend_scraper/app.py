from flask import Flask, jsonify, request
from flask_cors import CORS
from meesho_scraper import scrape_meesho_selenium
from gemini_service import GeminiService
import concurrent.futures
import threading
import time
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
import logging
logging.basicConfig(level=logging.INFO)

# Initialize Gemini service
gemini_service = GeminiService()

def scrape_single_query(query, limit=10):
    """
    Scrape a single query with error handling for parallel execution.
    
    Args:
        query (str): Search query to scrape
        limit (int): Maximum number of products to scrape
        
    Returns:
        tuple: (query, results, success, error_message)
    """
    try:
        start_time = time.time()
        logging.info(f"[Thread {threading.current_thread().name}] Starting scrape for: '{query}'")
        
        results = scrape_meesho_selenium(query, limit=limit)
        
        end_time = time.time()
        logging.info(f"[Thread {threading.current_thread().name}] Completed '{query}' in {end_time - start_time:.2f}s - Found {len(results)} products")
        
        return query, results, True, None
    except Exception as e:
        logging.error(f"[Thread {threading.current_thread().name}] Error scraping '{query}': {e}")
        return query, [], False, str(e)

@app.route('/api/llmsearch', methods=['GET'])
def llm_search():
    prompt = request.args.get('prompt', '').strip()
    if not prompt:
        return jsonify({
            'success': False,
            'error': 'Query parameter "prompt" is required',
            'results': []
        }), 400

    try:
        start_total_time = time.time()
        
        # Generate search queries using Gemini
        search_queries = gemini_service.generate_search_queries(prompt)
        logging.info(f"Generated queries: {search_queries}")

        # Parallel scraping using ThreadPoolExecutor
        all_results = []
        query_results = {}  # Store results grouped by query
        scraping_stats = {
            'successful_queries': [],
            'failed_queries': [],
            'total_time': 0
        }
        
        # Use ThreadPoolExecutor for parallel scraping
        max_workers = min(len(search_queries), 4)  # Limit to 4 concurrent threads to avoid overwhelming
        logging.info(f"Starting parallel scraping with {max_workers} workers for {len(search_queries)} queries")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all scraping tasks
            future_to_query = {
                executor.submit(scrape_single_query, query, 10): query 
                for query in search_queries
            }
            
            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_query):
                query, results, success, error_msg = future.result()
                
                if success:
                    all_results.extend(results)
                    query_results[query] = results  # Group results by query
                    scraping_stats['successful_queries'].append(query)
                    logging.info(f"✓ Successfully scraped '{query}': {len(results)} products")
                else:
                    query_results[query] = []  # Empty results for failed queries
                    scraping_stats['failed_queries'].append({'query': query, 'error': error_msg})
                    logging.error(f"✗ Failed to scrape '{query}': {error_msg}")

        end_total_time = time.time()
        scraping_stats['total_time'] = round(end_total_time - start_total_time, 2)
        
        logging.info(f"Parallel scraping completed in {scraping_stats['total_time']}s")
        logging.info(f"Total raw results collected: {len(all_results)}")
        logging.info(f"Successful queries: {len(scraping_stats['successful_queries'])}/{len(search_queries)}")
        
        # Process and merge results
        final_results = gemini_service.process_results(all_results)
        
        # Create grouped results for sliders
        grouped_results = []
        for query in search_queries:
            if query in query_results:
                grouped_results.append({
                    'query': query,
                    'products': query_results[query],
                    'count': len(query_results[query])
                })
        
        logging.info(f"Final processed results: {final_results['total']}")
        
        return jsonify({
            'success': True,
            'prompt': prompt,
            'queries': search_queries,
            'total_queries': len(search_queries),
            'successful_queries': len(scraping_stats['successful_queries']),
            'failed_queries': len(scraping_stats['failed_queries']),
            'scraping_time': scraping_stats['total_time'],
            'raw_results_count': len(all_results),
            'results': final_results,  # Combined results for backward compatibility
            'grouped_results': grouped_results,  # New: Results grouped by query
            'performance': {
                'parallel_workers': max_workers,
                'avg_time_per_query': round(scraping_stats['total_time'] / len(search_queries), 2) if search_queries else 0,
                'success_rate': round(len(scraping_stats['successful_queries']) / len(search_queries) * 100, 1) if search_queries else 0
            }
        })

    except Exception as e:
        logging.error(f"Error in LLM search: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'results': []
        }), 500

@app.route('/api/image-search', methods=['POST'])
def image_search():
    """
    Handle image-based search using Gemini's vision capabilities.
    Expects multipart/form-data with 'image' file and optional 'prompt' text.
    """
    try:
        # Check if image file is provided
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided',
                'results': []
            }), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No image file selected',
                'results': []
            }), 400

        # Get optional text prompt
        text_prompt = request.form.get('prompt', '').strip()
        
        # Read and process the image
        image_data = image_file.read()
        
        # Convert to PIL Image for validation
        try:
            image = Image.open(io.BytesIO(image_data))
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Invalid image format: {str(e)}',
                'results': []
            }), 400

        logging.info(f"Processing image search with text prompt: '{text_prompt}'")
        
        # Use Gemini to analyze the image and generate search queries
        search_queries = gemini_service.analyze_image_and_generate_queries(image_data, text_prompt)
        logging.info(f"Generated queries from image: {search_queries}")

        # Parallel scraping using the generated queries
        all_results = []
        query_results = {}
        scraping_stats = {
            'successful_queries': [],
            'failed_queries': [],
            'total_time': 0
        }
        
        start_total_time = time.time()
        
        # Use ThreadPoolExecutor for parallel scraping
        max_workers = min(len(search_queries), 4)
        logging.info(f"Starting parallel scraping with {max_workers} workers for {len(search_queries)} image-based queries")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all scraping tasks
            future_to_query = {
                executor.submit(scrape_single_query, query, 10): query 
                for query in search_queries
            }
            
            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_query):
                query, results, success, error_msg = future.result()
                
                if success:
                    all_results.extend(results)
                    query_results[query] = results
                    scraping_stats['successful_queries'].append(query)
                    logging.info(f"✓ Successfully scraped '{query}': {len(results)} products")
                else:
                    query_results[query] = []
                    scraping_stats['failed_queries'].append({'query': query, 'error': error_msg})
                    logging.error(f"✗ Failed to scrape '{query}': {error_msg}")

        end_total_time = time.time()
        scraping_stats['total_time'] = round(end_total_time - start_total_time, 2)
        
        # Process and merge results
        final_results = gemini_service.process_results(all_results)
        
        # Create grouped results for sliders
        grouped_results = []
        for query in search_queries:
            if query in query_results:
                grouped_results.append({
                    'query': query,
                    'products': query_results[query],
                    'count': len(query_results[query])
                })
        
        logging.info(f"Image search completed in {scraping_stats['total_time']}s")
        logging.info(f"Total results: {final_results['total']}")
        
        return jsonify({
            'success': True,
            'type': 'image_search',
            'text_prompt': text_prompt,
            'queries': search_queries,
            'total_queries': len(search_queries),
            'successful_queries': len(scraping_stats['successful_queries']),
            'failed_queries': len(scraping_stats['failed_queries']),
            'scraping_time': scraping_stats['total_time'],
            'raw_results_count': len(all_results),
            'results': final_results,
            'grouped_results': grouped_results,
            'performance': {
                'parallel_workers': max_workers,
                'avg_time_per_query': round(scraping_stats['total_time'] / len(search_queries), 2) if search_queries else 0,
                'success_rate': round(len(scraping_stats['successful_queries']) / len(search_queries) * 100, 1) if search_queries else 0
            }
        })

    except Exception as e:
        logging.error(f"Error in image search: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'results': []
        }), 500

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({
            'success': False,
            'error': 'Query parameter "q" is required',
            'products': []
        }), 400
    
    try:
        # Get search results from Meesho
        print(f"Searching for: {query}")
        products = scrape_meesho_selenium(query, limit=12)
        
        if not products:
            print("No products found")
            return jsonify({
                'success': False,
                'error': 'No products found for the given search query',
                'products': []
            }), 404
        
        # Return successful response
        return jsonify({
            'success': True,
            'products': products
        })
            
        print(f"Found {len(results)} results")
        for idx, result in enumerate(results):
            print(f"Result {idx + 1}:")
            print(f"  Title: {result.get('title', 'No title')}")
            print(f"  Price: {result.get('price', 'No price')}")
            print(f"  Link: {result.get('link', 'No link')}")
            print(f"  Image: {result.get('image', 'No image')}")
            
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f"Failed to fetch results: {str(e)}",
            'results': []
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)