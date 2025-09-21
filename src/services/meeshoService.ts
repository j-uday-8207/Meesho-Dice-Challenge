import { Product } from '../types';

// Response from the Meesho API
interface MeeshoApiProduct {
  title: string;
  price: string;
  link: string;
  image: string;
}

interface MeeshoApiResponse {
  success: boolean;
  products: MeeshoApiProduct[];
  error?: string;
}

interface LLMSearchResponse {
  success: boolean;
  prompt: string;
  queries: string[];
  results: {
    total: number;
    results: MeeshoApiProduct[];
  };
  grouped_results?: Array<{
    query: string;
    products: MeeshoApiProduct[];
    count: number;
  }>;
  error?: string;
}

export interface SearchResponse {
  success: boolean;
  results: Product[];
  grouped_results?: Array<{
    query: string;
    products: Product[];
    count: number;
  }>;
  error?: string;
}

export const searchWithNaturalLanguage = async (prompt: string): Promise<SearchResponse> => {
  if (!prompt.trim()) {
    return {
      success: false,
      results: [],
      error: 'Prompt is required'
    };
  }

  try {
    console.log('Fetching from LLM API:', prompt);
    const response = await fetch(`http://localhost:5002/api/llmsearch?prompt=${encodeURIComponent(prompt)}`);
    console.log('LLM API Response status:', response.status);
    
    const data: LLMSearchResponse = await response.json();
    console.log('LLM API Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch results');
    }
    
    // LLM search returns results in a different format
    let resultsArray = [];
    if (data.results?.results && Array.isArray(data.results.results)) {
      resultsArray = data.results.results;
    } else if (data.results && Array.isArray(data.results)) {
      resultsArray = data.results;
    } else {
      console.error('Invalid LLM response format:', data);
      throw new Error('Invalid response format from LLM server');
    }
    
    // Transform the data to match the expected format
    const transformedProducts = resultsArray.map((product: any) => ({
      id: String(Math.random()), // Generate a random ID
      name: product.title || 'Unknown Product',
      price: parseInt(product.price?.replace('₹', '').replace(',', '') || '0'),
      originalPrice: parseInt(product.price?.replace('₹', '').replace(',', '') || '0') * 1.2,
      rating: 4.0,
      reviews: [],
      image: product.image || '',
      category: 'Meesho',
      seller: 'Meesho Seller',
      description: product.title || '',
      inStock: true,
      url: product.link || '#'
    }));

    // Transform grouped results if available
    let transformedGroupedResults;
    if (data.grouped_results && Array.isArray(data.grouped_results)) {
      transformedGroupedResults = data.grouped_results.map(group => ({
        query: group.query,
        count: group.count,
        products: group.products.map((product: any) => ({
          id: String(Math.random()),
          name: product.title || 'Unknown Product',
          price: parseInt(product.price?.replace('₹', '').replace(',', '') || '0'),
          originalPrice: parseInt(product.price?.replace('₹', '').replace(',', '') || '0') * 1.2,
          rating: 4.0,
          reviews: [],
          image: product.image || '',
          category: 'Meesho',
          seller: 'Meesho Seller',
          description: product.title || '',
          inStock: true,
          url: product.link || '#'
        }))
      }));
    }
    
    return {
      success: true,
      results: transformedProducts,
      grouped_results: transformedGroupedResults
    };
    
  } catch (error) {
    console.error('Error in LLM search:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const searchMeesho = async (query: string): Promise<SearchResponse> => {
  if (!query.trim()) {
    return {
      success: false,
      results: [],
      error: 'Search query is required'
    };
  }

  try {
    console.log('Fetching from Meesho API:', query);
    const response = await fetch(`http://localhost:5002/api/llmsearch?q=${encodeURIComponent(query)}`);
    console.log('API Response status:', response.status);
    
    const data: MeeshoApiResponse = await response.json();
    console.log('API Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch results');
    }
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from server');
    }
    
    console.log('Products from API:', data.products);
    
    // Transform the data to match the expected format
    const transformedProducts = data.products.map((product: any) => ({
      id: String(Math.random()), // Generate a random ID
      name: product.title || 'Unknown Product',
      price: parseInt(product.price?.replace('₹', '').replace(',', '') || '0'),
      originalPrice: parseInt(product.price?.replace('₹', '').replace(',', '') || '0') * 1.2,
      rating: 4.0,
      reviews: [],
      image: product.image || '',
      category: 'Meesho',
      seller: 'Meesho Seller',
      description: product.title || '',
      inStock: true,
      url: product.link || '#'
    }));
    
    console.log('Transformed products:', transformedProducts);
    
    return {
      success: true,
      results: transformedProducts
    };
  } catch (error) {
    console.error('Error searching Meesho:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'An error occurred while fetching results'
    };
  }
};

export const searchWithImage = async (imageFile: File, textPrompt?: string): Promise<SearchResponse> => {
  try {
    console.log('Searching with image:', imageFile.name, 'Text prompt:', textPrompt);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', imageFile);
    if (textPrompt?.trim()) {
      formData.append('prompt', textPrompt.trim());
    }

    console.log('Sending image to backend...');
    const response = await fetch('http://localhost:5002/api/image-search', {
      method: 'POST',
      body: formData
    });

    console.log('Image search response status:', response.status);
    
    const data: LLMSearchResponse = await response.json();
    console.log('Image search response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to process image search');
    }
    
    // Process results similar to text search
    let resultsArray = [];
    if (data.results?.results && Array.isArray(data.results.results)) {
      resultsArray = data.results.results;
    } else if (data.results && Array.isArray(data.results)) {
      resultsArray = data.results;
    } else {
      console.error('Invalid image search response format:', data);
      throw new Error('Invalid response format from image search server');
    }
    
    // Transform the data to match the expected format
    const transformedProducts = resultsArray.map((product: any) => ({
      id: String(Math.random()),
      name: product.title || 'Unknown Product',
      price: parseInt(product.price?.replace('₹', '').replace(',', '') || '0'),
      originalPrice: parseInt(product.price?.replace('₹', '').replace(',', '') || '0') * 1.2,
      rating: 4.0,
      reviews: [],
      image: product.image || '',
      category: 'Meesho',
      seller: 'Meesho Seller',
      description: product.title || '',
      inStock: true,
      url: product.link || '#'
    }));

    // Transform grouped results if available
    let transformedGroupedResults;
    if (data.grouped_results && Array.isArray(data.grouped_results)) {
      transformedGroupedResults = data.grouped_results.map(group => ({
        query: group.query,
        count: group.count,
        products: group.products.map((product: any) => ({
          id: String(Math.random()),
          name: product.title || 'Unknown Product',
          price: parseInt(product.price?.replace('₹', '').replace(',', '') || '0'),
          originalPrice: parseInt(product.price?.replace('₹', '').replace(',', '') || '0') * 1.2,
          rating: 4.0,
          reviews: [],
          image: product.image || '',
          category: 'Meesho',
          seller: 'Meesho Seller',
          description: product.title || '',
          inStock: true,
          url: product.link || '#'
        }))
      }));
    }
    
    console.log('Image search successful, found', transformedProducts.length, 'products');
    
    return {
      success: true,
      results: transformedProducts,
      grouped_results: transformedGroupedResults
    };
    
  } catch (error) {
    console.error('Error in image search:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'An error occurred during image search'
    };
  }
};