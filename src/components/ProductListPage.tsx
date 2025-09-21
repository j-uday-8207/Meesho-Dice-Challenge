import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Heart, Star, ShoppingCart, Sparkles, Grid, List } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductSlider from './ProductSlider';
import WishlistModal from './WishlistModal';
import OutfitModal from './OutfitModal';
import { Product, WishlistFolder, LLMResponse, OutfitSuggestion } from '../types';
import { generatePersonalizedResults, generateOutfitSuggestions, detectOutfitIntent } from '../services/llmService';
import { searchMeesho, searchWithNaturalLanguage, SearchResponse } from '../services/meeshoService';

interface GroupedResult {
  query: string;
  products: Product[];
  count: number;
}

interface ProductListPageProps {
  searchQuery: string;
  useAISearch?: boolean;
  imageSearchData?: SearchResponse | null;
  onProductSelect: (product: Product) => void;
  onNavigateHome: () => void;
  onNavigateToWishlist: () => void;
  onAddToWishlist: (product: Product, folderId: string) => void;
  onCreateWishlistFolder?: (name: string) => string;
  wishlistFolders: WishlistFolder[];
}

const ProductListPage: React.FC<ProductListPageProps> = ({
  searchQuery,
  useAISearch = true,
  imageSearchData,
  onProductSelect,
  onNavigateHome,
  onNavigateToWishlist,
  onAddToWishlist,
  onCreateWishlistFolder,
  wishlistFolders
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [llmResponse, setLLMResponse] = useState<LLMResponse | null>(null);
  const [selectedWishlistProduct, setSelectedWishlistProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'sliders'>('sliders');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [fakeProgress, setFakeProgress] = useState(0);
  
  // Outfit-related state
  const [currentOutfit, setCurrentOutfit] = useState<OutfitSuggestion | null>(null);
  const [outfitModalOpen, setOutfitModalOpen] = useState(false);
  const [outfitLoading, setOutfitLoading] = useState(false);

  // Fake progress bar effect
  React.useEffect(() => {
    if (loading) {
      setFakeProgress(0);
      const interval = setInterval(() => {
        setFakeProgress(prev => {
          if (prev >= 95) return prev; // Stop at 95% until real loading completes
          const increment = Math.random() * 15 + 5; // Random increment between 5-20%
          return Math.min(prev + increment, 95);
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      // Complete the progress bar when loading is done
      setFakeProgress(100);
      setTimeout(() => setFakeProgress(0), 500);
    }
  }, [loading]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery) return;
      
      // If this is an image search query but we don't have image data yet, wait
      if (searchQuery.includes('[Image Search]') && !imageSearchData) {
        console.log('Waiting for image search data...');
        return;
      }
      
      setLoading(true);
      setProducts([]); // Clear existing products
      setGroupedResults([]); // Clear existing grouped results
      
      try {
        console.log('Fetching products for query:', searchQuery, 'AI Search:', useAISearch);
        
        // Check if we have image search data first
        if (imageSearchData && imageSearchData.success) {
          console.log('Using provided image search data:', imageSearchData);
          setProducts(imageSearchData.results);
          
          if (imageSearchData.grouped_results) {
            setGroupedResults(imageSearchData.grouped_results);
            console.log('Using image search grouped results:', imageSearchData.grouped_results);
          }
          
          // Generate personalized insights for image search
          const personalizedInsights = await generatePersonalizedResults(searchQuery);
          setLLMResponse(personalizedInsights);
          
          setLoading(false);
          return;
        }
        
        if (useAISearch) {
          // Try LLM search first for more intelligent results
          console.log('Attempting LLM search...');
          const llmResponse = await searchWithNaturalLanguage(searchQuery);
          console.log('LLM response:', llmResponse);
          
          if (llmResponse.success && llmResponse.results?.length > 0) {
            // Convert LLM products to our app's product format
            const convertedProducts = llmResponse.results as Product[];
            console.log('Using LLM search results:', convertedProducts);
            setProducts(convertedProducts);
            
            // Set grouped results if available
            if (llmResponse.grouped_results) {
              setGroupedResults(llmResponse.grouped_results);
              console.log('Using grouped results:', llmResponse.grouped_results);
            }
            
            // Generate additional personalized insights
            const personalizedInsights = await generatePersonalizedResults(searchQuery);
            setLLMResponse(personalizedInsights);
          } else {
            // Fallback to regular search if LLM search fails
            console.log('LLM search failed, falling back to regular search...');
            const meeshoResponse = await searchMeesho(searchQuery);
            console.log('Meesho response:', meeshoResponse);
            
            if (meeshoResponse.success && meeshoResponse.results?.length > 0) {
              // Convert Meesho products to our app's product format
              const convertedProducts = meeshoResponse.results as Product[];
              console.log('Using fallback search results:', convertedProducts);
              setProducts(convertedProducts);
              
              // Generate personalized insights using LLM
              const personalizedInsights = await generatePersonalizedResults(searchQuery);
              setLLMResponse(personalizedInsights);
            } else {
              console.error('No products found:', meeshoResponse.error || 'Unknown error');
              setProducts([]);
            }
          }
        } else {
          // Use regular search when AI is disabled
          console.log('Using regular search...');
          const meeshoResponse = await searchMeesho(searchQuery);
          console.log('Meesho response:', meeshoResponse);
          
          if (meeshoResponse.success && meeshoResponse.results?.length > 0) {
            // Convert Meesho products to our app's product format
            const convertedProducts = meeshoResponse.results as Product[];
            console.log('Using regular search results:', convertedProducts);
            setProducts(convertedProducts);
            
            // Generate personalized insights using LLM
            const personalizedInsights = await generatePersonalizedResults(searchQuery);
            setLLMResponse(personalizedInsights);
          } else {
            console.error('No products found:', meeshoResponse.error || 'Unknown error');
            setProducts([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
        // Show error in UI
        setLLMResponse({
          personalizedMessage: 'Error fetching products',
          reasoning: error instanceof Error ? error.message : 'An unexpected error occurred',
          products: []
        });
      }
      setLoading(false);
    };

    if (searchQuery) {
      fetchProducts();
    }
  }, [searchQuery, useAISearch, imageSearchData]);

  // Handle outfit completion
  const handleCompleteOutfit = async (anchorProduct: Product) => {
    setOutfitLoading(true);
    try {
      const occasion = detectOutfitIntent(searchQuery) ? 
        (searchQuery.toLowerCase().includes('office') ? 'office' :
         searchQuery.toLowerCase().includes('party') ? 'party' :
         searchQuery.toLowerCase().includes('casual') ? 'casual' : 'general') : 'casual';
      
      // Get all available products from current search results and grouped results
      const allAvailableProducts = [
        ...products,
        ...groupedResults.flatMap(group => group.products)
      ];
      
      // Remove duplicates with advanced deduplication (ID, name, price)
      const uniqueProductsMap = new Map<string, Product>();
      const seenCombinations = new Set<string>();
      
      allAvailableProducts.forEach(product => {
        if (!product.id) return; // Skip products without ID
        
        // Create a combination key using name + price for additional duplicate detection
        const combinationKey = `${product.name.toLowerCase().trim()}_${product.price}`;
        
        if (!uniqueProductsMap.has(product.id) && !seenCombinations.has(combinationKey)) {
          uniqueProductsMap.set(product.id, product);
          seenCombinations.add(combinationKey);
        }
      });
      const uniqueProducts = Array.from(uniqueProductsMap.values());
      
      console.log('Total products before deduplication:', allAvailableProducts.length);
      console.log('Unique products after deduplication:', uniqueProducts.length);
      
      const outfitResponse = await generateOutfitSuggestions(anchorProduct, uniqueProducts, occasion);
      
      if (outfitResponse.success && outfitResponse.outfit) {
        setCurrentOutfit(outfitResponse.outfit);
        setOutfitModalOpen(true);
      } else {
        console.error('Failed to generate outfit:', outfitResponse.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
    } finally {
      setOutfitLoading(false);
    }
  };

  const handleSaveOutfit = (outfit: OutfitSuggestion) => {
    // For now, we'll add all items to the first wishlist folder
    if (wishlistFolders.length > 0) {
      const folderId = wishlistFolders[0].id;
      onAddToWishlist(outfit.anchor, folderId);
      
      // Add complementary items that user might want
      Object.values(outfit.complements).flat().slice(0, 3).forEach(item => {
        onAddToWishlist(item, folderId);
      });
    }
    setOutfitModalOpen(false);
  };

  const filteredProducts = products.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Check if we should show loading state
  const shouldShowLoading = loading || (searchQuery.includes('[Image Search]') && !imageSearchData);

  if (shouldShowLoading) {
    const isImageSearch = searchQuery.includes('[Image Search]') || !!imageSearchData;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          {/* Fake Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${fakeProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="mb-6 text-sm text-gray-600 font-medium">
            {fakeProgress < 30 && "🔍 Initiating search..."}
            {fakeProgress >= 30 && fakeProgress < 60 && "🧠 AI analyzing query..."}
            {fakeProgress >= 60 && fakeProgress < 90 && "⚡ Finding best matches..."}
            {fakeProgress >= 90 && "✨ Almost ready..."}
          </div>

          {/* Loading Animation */}
          <div className="relative mb-8">
            {isImageSearch ? (
              // Image analysis animation
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                  <span className="text-xs">🧠</span>
                </div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-400 rounded-full animate-ping flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              </div>
            ) : (
              // Regular search animation
              <div className="relative">
                <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading Text */}
          {isImageSearch ? (
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                🔍 Analyzing Your Image...
              </h2>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span>AI studying fashion elements</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse animation-delay-200"></span>
                  <span>Generating style recommendations</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-400"></span>
                  <span>Finding perfect matches</span>
                </p>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">
                  💡 Our AI is analyzing colors, patterns, and style to find items that complement your image
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Finding perfect matches...</h2>
              <p className="text-gray-600">Our AI is personalizing results for you</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  🎯 Searching thousands of products to find exactly what you're looking for
                </p>
              </div>
            </div>
          )}

          {/* Progress indicators */}
          <div className="mt-6 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onNavigateHome}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Search Results</h1>
                <p className="text-sm text-gray-500">"{searchQuery}" • {products.length} products</p>
              </div>
            </div>
            <button
              onClick={onNavigateToWishlist}
              className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full hover:bg-purple-200 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Wishlist</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* LLM Insights */}
        {llmResponse && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <Sparkles className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">AI Personalized Results</h2>
            </div>
            <p className="text-purple-100 mb-2">{llmResponse.personalizedMessage}</p>
            <p className="text-sm text-purple-200">{llmResponse.reasoning}</p>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Price Range:</span>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('sliders')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'sliders' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Slider View"
              >
                <Sparkles className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {viewMode === 'sliders' && groupedResults.length > 0 ? (
          // Slider view - show products grouped by search queries
          <div className="space-y-8">
            {groupedResults.map((group, index) => (
              <ProductSlider
                key={index}
                title={group.query}
                products={group.products.filter(product => 
                  product.price >= priceRange[0] && product.price <= priceRange[1]
                )}
                onProductSelect={onProductSelect}
                onAddToWishlist={(product) => setSelectedWishlistProduct(product)}
                onCompleteOutfit={handleCompleteOutfit}
              />
            ))}
          </div>
        ) : (
          // Grid/List view - traditional display
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductSelect={onProductSelect}
                onAddToWishlist={(product) => setSelectedWishlistProduct(product)}
                onCompleteOutfit={handleCompleteOutfit}
                viewMode={viewMode === 'sliders' ? 'grid' : viewMode}
              />
            ))}
          </div>
        )}

        {/* No products message */}
        {((viewMode === 'sliders' && groupedResults.length === 0) || 
          (viewMode !== 'sliders' && sortedProducts.length === 0)) && (
          <div className="text-center py-16">
            <div className="mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search for something else</p>
            <button
              onClick={onNavigateHome}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start New Search
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Modal */}
      {selectedWishlistProduct && (
        <WishlistModal
          product={selectedWishlistProduct}
          folders={wishlistFolders}
          onAddToWishlist={onAddToWishlist}
          onClose={() => setSelectedWishlistProduct(null)}
        />
      )}

      {/* Outfit Modal */}
      {currentOutfit && (
        <OutfitModal
          isOpen={outfitModalOpen}
          outfit={currentOutfit}
          onClose={() => setOutfitModalOpen(false)}
          onAddToWishlist={onAddToWishlist}
          onCreateWishlistFolder={onCreateWishlistFolder}
          onSaveOutfit={handleSaveOutfit}
          wishlistFolders={wishlistFolders}
        />
      )}
    </div>
  );
};

export default ProductListPage;