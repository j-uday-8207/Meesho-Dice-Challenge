import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RefreshCw, Sparkles } from 'lucide-react';
import { Product, WishlistFolder, ComplementResponse } from '../types';
import { generateComplementSuggestions } from '../services/llmService';
import WishlistModal from './WishlistModal';

interface ProductDetailPageProps {
  product: Product;
  onNavigateBack: () => void;
  onNavigateHome: () => void;
  onNavigateToWishlist: () => void;
  onAddToWishlist: (product: Product, folderId: string) => void;
  wishlistFolders: WishlistFolder[];
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigateBack,
  onNavigateHome,
  onNavigateToWishlist,
  onAddToWishlist,
  wishlistFolders
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [complements, setComplements] = useState<ComplementResponse | null>(null);
  const [loadingComplements, setLoadingComplements] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'complements'>('description');

  const images = [product.image, product.image, product.image]; // In real app, multiple images
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  useEffect(() => {
    const fetchComplements = async () => {
      setLoadingComplements(true);
      try {
        const response = await generateComplementSuggestions(product);
        setComplements(response);
      } catch (error) {
        console.error('Failed to fetch complements:', error);
      }
      setLoadingComplements(false);
    };

    fetchComplements();
  }, [product]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onNavigateBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">Product Details</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onNavigateToWishlist}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button
                onClick={onNavigateHome}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discountPercentage}% OFF
                </div>
              )}
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">{product.seller}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900 ml-2">{product.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({product.reviews} reviews)</span>
                </div>
                <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {product.category}
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-lg font-semibold text-green-600">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {product.colors && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
                  <div className="flex space-x-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                          selectedColor === color
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                  <div className="flex space-x-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button className="flex-1 bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-semibold">
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => setShowWishlistModal(true)}
                className="px-6 py-4 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2 font-semibold"
              >
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Free Delivery</p>
                <p className="text-xs text-gray-500">Orders above ₹499</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-gray-500">7 day return policy</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-gray-500">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'complements', label: 'Perfect Matches', icon: Sparkles }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon && <tab.icon className="h-4 w-4" />}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg mb-6">{product.description}</p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-600 mr-3">•</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900 ml-2">Verified Purchase</span>
                        </div>
                        <p className="text-gray-700 mb-2">Great product! Exactly as described and fast delivery.</p>
                        <p className="text-sm text-gray-500">- Anonymous Customer</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'complements' && (
              <div>
                {loadingComplements ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Finding perfect matches...</p>
                  </div>
                ) : complements ? (
                  <div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-8">
                      <div className="flex items-center mb-4">
                        <Sparkles className="h-6 w-6 mr-2" />
                        <h3 className="text-xl font-semibold">AI Recommended Complements</h3>
                      </div>
                      <p className="text-purple-100">{complements.reasoning}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {complements.complements.map((complement) => (
                        <div key={complement.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300">
                          <img src={complement.image} alt={complement.name} className="w-full h-48 object-cover" />
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{complement.name}</h4>
                            <p className="text-lg font-bold text-purple-600">₹{complement.price.toLocaleString()}</p>
                            <button className="w-full mt-3 bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                              Add Both to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No complement suggestions available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <WishlistModal
          product={product}
          folders={wishlistFolders}
          onAddToWishlist={onAddToWishlist}
          onClose={() => setShowWishlistModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;