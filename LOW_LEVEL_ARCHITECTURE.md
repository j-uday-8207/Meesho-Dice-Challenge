# Low-Level Technical Implementation Guide

## 🔧 Detailed Component Breakdown

### Frontend Architecture (React + TypeScript)

#### Core Components Structure
```typescript
src/
├── components/
│   ├── HomePage.tsx           // Landing page with hero banner
│   ├── SearchBar.tsx          // Multi-mode search interface
│   ├── ProductCard.tsx        // Individual product display
│   ├── ProductListPage.tsx    // Search results grid
│   ├── ProductDetailPage.tsx  // Detailed product view
│   ├── WishlistPage.tsx       // User collections management
│   └── WishlistModal.tsx      // Outfit completion interface
├── services/
│   ├── llmService.ts          // AI search orchestration
│   └── meeshoService.ts       // API communication layer
├── types.ts                   // TypeScript type definitions
└── main.tsx                   // Application entry point
```

#### Key Implementation Details

**Search Bar Component (`SearchBar.tsx`)**
```typescript
// Multi-modal search interface
interface SearchMode {
  text: boolean;      // Natural language search
  image: boolean;     // Visual search upload
}

// Event handlers
const handleTextSearch = async (query: string) => {
  const response = await searchWithNaturalLanguage(query);
  // Process and display results
}

const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  // Send to Flask image search endpoint
}
```

**Product Service Layer (`meeshoService.ts`)**
```typescript
// API communication with type safety
export const searchWithNaturalLanguage = async (prompt: string): Promise<SearchResponse> => {
  const response = await fetch(`http://localhost:5002/api/llmsearch?prompt=${encodeURIComponent(prompt)}`);
  const data: LLMSearchResponse = await response.json();
  
  // Transform backend data to frontend types
  return transformApiResponse(data);
}
```

#### State Management Strategy
- **Local State**: React useState for component-level data
- **Props Drilling**: Parent-child communication via props
- **Service Layer**: Centralized API calls in service files
- **Browser Storage**: localStorage for wishlist persistence

---

### Backend Architecture (Flask + Python)

#### Flask Application Structure
```python
backend_scraper/
├── app.py                 // Main Flask application
├── meesho_scraper.py      // Selenium scraping engine
├── gemini_service.py      // AI integration service
├── test_scrapers.py       // Testing utilities
└── .env                   // Environment configuration
```

#### API Endpoint Implementation

**Main Application (`app.py`)**
```python
from flask import Flask, jsonify, request
from flask_cors import CORS
from meesho_scraper import scrape_meesho_selenium
from gemini_service import GeminiService

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Initialize AI service
gemini_service = GeminiService()

@app.route('/api/llmsearch', methods=['GET'])
def llm_search():
    """AI-enhanced search with parallel scraping"""
    prompt = request.args.get('prompt', '').strip()
    
    # Generate search queries using Gemini
    search_queries = gemini_service.generate_search_queries(prompt)
    
    # Parallel scraping with ThreadPoolExecutor
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        # Submit all scraping tasks
        future_to_query = {
            executor.submit(scrape_single_query, query, 10): query 
            for query in search_queries
        }
        
        # Collect results as they complete
        for future in concurrent.futures.as_completed(future_to_query):
            query, results, success, error_msg = future.result()
            # Process results...
```

**Selenium Scraper (`meesho_scraper.py`)**
```python
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from queue import Queue
import threading

# Global driver pool for efficiency
_driver_pool = Queue(maxsize=4)
_pool_lock = threading.Lock()

def setup_driver():
    """Configure Chrome with anti-detection options"""
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def scrape_meesho_selenium(query, limit=5):
    """Main scraping function with error handling"""
    driver = get_driver_from_pool()
    try:
        url = f"https://www.meesho.com/search?q={urllib.parse.quote_plus(query)}"
        driver.get(url)
        
        # Wait for dynamic content
        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid*='product']")))
        
        # Extract product data
        products = extract_product_data(driver, limit)
        return products
        
    finally:
        return_driver_to_pool(driver)
```

**Gemini AI Service (`gemini_service.py`)**
```python
import google.generativeai as genai
from PIL import Image
import io

class GeminiService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_search_queries(self, prompt: str) -> List[str]:
        """Generate multiple search queries from natural language"""
        system_prompt = """
        You are an expert AI Fashion Stylist for Meesho...
        Generate 3-5 specific search queries for: {prompt}
        """
        
        response = self.model.generate_content(system_prompt.format(prompt=prompt))
        queries = self.extract_queries_from_response(response.text)
        return queries

    def analyze_image_and_generate_queries(self, image_data: bytes, text_prompt: str = "") -> List[str]:
        """Analyze uploaded image and generate search queries"""
        image = Image.open(io.BytesIO(image_data))
        
        vision_prompt = """
        Analyze this fashion image and generate 3-5 search queries...
        """
        
        response = self.model.generate_content([vision_prompt, image])
        return self.extract_queries_from_response(response.text)
```

---

### Database Integration (Supabase)

#### Schema Design
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist folders
CREATE TABLE wishlist_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist items
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES wishlist_folders(id),
    product_data JSONB,  -- Store complete product information
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Frontend Integration
```typescript
// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'your-project-url'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Wishlist operations
export const createWishlistFolder = async (name: string, userId: string) => {
  const { data, error } = await supabase
    .from('wishlist_folders')
    .insert([{ name, user_id: userId }])
    .select()
  
  return { data, error }
}
```

---

### Styling System (Tailwind CSS)

#### Custom Configuration (`tailwind.config.js`)
```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'meesho-purple': {
          DEFAULT: '#580A46',
          light: '#7B1458',
          dark: '#3D0731',
        },
        'meesho-orange': {
          DEFAULT: '#FF9C00',
          light: '#FFB84D',
          dark: '#CC7D00',
        }
      },
      gradients: {
        'meesho-brand': 'linear-gradient(135deg, #580A46 0%, #FF9C00 100%)',
      }
    }
  }
}
```

#### Component Styling Patterns
```typescript
// Consistent button styling
const buttonClasses = `
  bg-gradient-to-r from-meesho-purple to-meesho-orange 
  hover:from-meesho-purple-dark hover:to-meesho-orange-dark
  text-white font-semibold py-3 px-6 rounded-xl
  transition-all duration-300 transform hover:scale-105
  shadow-lg hover:shadow-xl
`

// Product card styling
const cardClasses = `
  bg-white rounded-2xl shadow-lg hover:shadow-xl
  transition-all duration-300 transform hover:-translate-y-2
  border border-gray-100 overflow-hidden
`
```

---

### Error Handling & Logging

#### Backend Error Management
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# API error responses
@app.errorhandler(500)
def internal_error(error):
    logging.error(f"Internal server error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'details': str(error) if app.debug else None
    }), 500

# Scraping error handling
def scrape_single_query(query, limit=10):
    try:
        results = scrape_meesho_selenium(query, limit=limit)
        return query, results, True, None
    except Exception as e:
        logging.error(f"Error scraping '{query}': {e}")
        return query, [], False, str(e)
```

#### Frontend Error Boundaries
```typescript
// Error handling in service calls
export const searchWithNaturalLanguage = async (prompt: string): Promise<SearchResponse> => {
  try {
    const response = await fetch(`http://localhost:5002/api/llmsearch?prompt=${encodeURIComponent(prompt)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return transformApiResponse(data);
    
  } catch (error) {
    console.error('Search API error:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
```

---

### Performance Optimization

#### Selenium Driver Pooling
```python
from queue import Queue
import threading

# Global driver pool
_driver_pool = Queue(maxsize=4)
_pool_lock = threading.Lock()
_drivers_created = 0

def get_driver_from_pool():
    """Get a driver from pool or create new one"""
    try:
        return _driver_pool.get_nowait()
    except:
        with _pool_lock:
            global _drivers_created
            if _drivers_created < 4:
                _drivers_created += 1
                return setup_driver()
            else:
                return _driver_pool.get(timeout=30)

def return_driver_to_pool(driver):
    """Return driver to pool for reuse"""
    try:
        _driver_pool.put_nowait(driver)
    except:
        driver.quit()
```

#### Frontend Performance
```typescript
// Lazy loading for images
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={() => setLoaded(true)}
      loading="lazy"
    />
  );
};

// Debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

---

### Security Implementation

#### API Security
```python
# Environment variable management
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Input validation
def validate_search_query(query):
    if not query or len(query.strip()) < 2:
        raise ValueError("Query must be at least 2 characters")
    
    if len(query) > 200:
        raise ValueError("Query too long")
    
    # Sanitize input
    return query.strip()

# CORS configuration
CORS(app, origins=['http://localhost:5173'])
```

#### Frontend Security
```typescript
// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .substring(0, 200);
};

// Safe API calls
const makeApiCall = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
```

This low-level documentation provides the technical implementation details needed for development, debugging, and future enhancements of the AI-Powered Fashion Curator system.