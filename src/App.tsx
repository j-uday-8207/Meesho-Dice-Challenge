import React, { useState } from 'react';
import HomePage from './components/HomePage';
import ProductListPage from './components/ProductListPage';
import ProductDetailPage from './components/ProductDetailPage';
import WishlistPage from './components/WishlistPage';
import { Product, WishlistFolder } from './types';
import { searchWithImage, SearchResponse } from './services/meeshoService';

type Page = 'home' | 'products' | 'product-detail' | 'wishlist';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [useAISearch, setUseAISearch] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageSearchData, setImageSearchData] = useState<SearchResponse | null>(null);
  const [wishlistFolders, setWishlistFolders] = useState<WishlistFolder[]>([
    { id: '1', name: 'Ethnic Wear', products: [] },
    { id: '2', name: 'Western Wear', products: [] },
    { id: '3', name: 'Party Outfits', products: [] }
  ]);

  const navigateToProducts = (query: string, useAI: boolean = false) => {
    // Navigate to loading page immediately
    setSearchQuery(query);
    setUseAISearch(useAI);
    setCurrentPage('products');
    
    // Clear any previous image search data since this is a text search
    setImageSearchData(null);
  };  const handleImageSearch = (imageFile: File, textPrompt?: string) => {
    // Navigate to loading page immediately
    setSearchQuery(`[Image Search] ${textPrompt || 'Visual fashion search'}`);
    setUseAISearch(true);
    setCurrentPage('products');
    
    // Perform actual image search in background
    searchWithImage(imageFile, textPrompt)
      .then(result => {
        if (result.success) {
          // Store the image search results
          setImageSearchData(result);
        } else {
          console.error('Image search failed:', result.error);
          // Keep the navigation but clear image data for fallback
          setImageSearchData(null);
        }
      })
      .catch(error => {
        console.error('Image search error:', error);
        // Keep the navigation but clear image data for fallback
        setImageSearchData(null);
      });
  };

  const navigateToProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  };

  const navigateToWishlist = () => {
    setCurrentPage('wishlist');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const addToWishlist = (product: Product, folderId: string) => {
    setWishlistFolders(prev => {
      return prev.map(folder => {
        if (folder.id === folderId) {
          // Check if product already exists in this folder
          const productExists = folder.products.some(p => p.id === product.id);
          if (!productExists) {
            return { ...folder, products: [...folder.products, product] };
          }
          return folder;
        }
        return folder;
      });
    });
  };

  const removeFromWishlist = (productId: string, folderId: string) => {
    setWishlistFolders(prev => {
      return prev.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, products: folder.products.filter(p => p.id !== productId) };
        }
        return folder;
      });
    });
  };

  const createWishlistFolder = (name: string): string => {
    if (name.trim()) {
      const newFolder: WishlistFolder = {
        id: Date.now().toString(),
        name: name.trim(),
        products: []
      };
      setWishlistFolders(prev => [...prev, newFolder]);
      return newFolder.id;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' && (
        <HomePage 
          onSearch={navigateToProducts}
          onImageSearch={handleImageSearch}
          onNavigateToWishlist={navigateToWishlist}
        />
      )}
      {currentPage === 'products' && (
        <ProductListPage 
          searchQuery={searchQuery}
          useAISearch={useAISearch}
          imageSearchData={imageSearchData}
          onProductSelect={navigateToProductDetail}
          onNavigateHome={navigateToHome}
          onNavigateToWishlist={navigateToWishlist}
          onAddToWishlist={addToWishlist}
          onCreateWishlistFolder={createWishlistFolder}
          wishlistFolders={wishlistFolders}
        />
      )}
      {currentPage === 'product-detail' && selectedProduct && (
        <ProductDetailPage 
          product={selectedProduct}
          onNavigateBack={() => setCurrentPage('products')}
          onNavigateHome={navigateToHome}
          onNavigateToWishlist={navigateToWishlist}
          onAddToWishlist={addToWishlist}
          wishlistFolders={wishlistFolders}
        />
      )}
      {currentPage === 'wishlist' && (
        <WishlistPage 
          folders={wishlistFolders}
          onNavigateHome={navigateToHome}
          onProductSelect={navigateToProductDetail}
          onRemoveFromWishlist={removeFromWishlist}
          onCreateFolder={createWishlistFolder}
        />
      )}
    </div>
  );
}

export default App;