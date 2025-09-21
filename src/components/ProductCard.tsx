import React from 'react';
import { Star, Heart, ShoppingCart, Badge, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onProductSelect: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onCompleteOutfit?: (product: Product) => void;
  viewMode: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductSelect,
  onAddToWishlist,
  onCompleteOutfit,
  viewMode
}) => {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 p-6">
        <div className="flex space-x-6">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 
                onClick={() => onProductSelect(product)}
                className="text-lg font-semibold text-gray-900 hover:text-meesho-purple cursor-pointer line-clamp-2"
              >
                {product.name}
              </h3>
              <button
                onClick={() => onAddToWishlist(product)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">by {product.seller}</p>
            
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 ml-1">{product.rating}</span>
                <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
              </div>
              <div className="ml-4">
                <Badge className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">{product.category}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button className="bg-meesho-purple text-white px-6 py-2 rounded-lg hover:bg-meesho-purple-light transition-colors flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
                {onCompleteOutfit && (
                  <button 
                    onClick={() => onCompleteOutfit(product)}
                    className="bg-gradient-to-r from-meesho-purple to-meesho-orange text-white px-6 py-2 rounded-lg hover:from-meesho-purple-light hover:to-meesho-orange-light transition-all duration-300 flex items-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Complete Outfit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}
        <button
          onClick={() => onAddToWishlist(product)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.seller}</p>
        <h3 
          onClick={() => onProductSelect(product)}
          className="font-semibold text-gray-900 hover:text-meesho-purple cursor-pointer line-clamp-2 mb-2"
        >
          {product.name}
        </h3>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900 ml-1">{product.rating}</span>
            <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
        
        <button className="w-full bg-meesho-purple text-white py-2 rounded-lg hover:bg-meesho-purple-light transition-colors flex items-center justify-center space-x-2 mb-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart</span>
        </button>
        
        {onCompleteOutfit && (
          <button 
            onClick={() => onCompleteOutfit(product)}
            className="w-full bg-gradient-to-r from-meesho-purple to-meesho-orange text-white py-2 rounded-lg hover:from-meesho-purple-light hover:to-meesho-orange-light transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Complete Outfit</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;