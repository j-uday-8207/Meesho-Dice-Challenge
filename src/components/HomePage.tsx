import React, { useState } from 'react';
import { Search, Camera, Heart, ShoppingBag, User, ShoppingCart, Truck, Shield, Star } from 'lucide-react';
import SearchBar from './SearchBar';

interface HomePageProps {
  onSearch: (query: string, useAI?: boolean) => void;
  onImageSearch: (imageFile: File, textPrompt?: string) => void;
  onNavigateToWishlist: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSearch, onImageSearch, onNavigateToWishlist }) => {
  const categories = [
    { name: 'Kurtis & Suits', icon: '👗', color: 'bg-purple-100', image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Sarees & Lehengas', icon: '🥻', color: 'bg-pink-100', image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Western Wear', icon: '👚', color: 'bg-blue-100', image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Men Fashion', icon: '👔', color: 'bg-green-100', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Kids & Toys', icon: '🧸', color: 'bg-yellow-100', image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Footwear', icon: '👠', color: 'bg-red-100', image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Beauty & Care', icon: '💄', color: 'bg-purple-100', image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Home & Kitchen', icon: '🏠', color: 'bg-orange-100', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  const trendingSearches = [
    'red shirt bottom wear', 'blue kurta matching dupatta', 'black dress accessories', 
    'white shirt styling', 'ethnic wear combo', 'party wear outfits'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-meesho-purple">meesho</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar onSearch={onSearch} onImageSearch={onImageSearch} />
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Become a Supplier
              </button>
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Investor Relations
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Profile</span>
              </button>
              <button
                onClick={onNavigateToWishlist}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">Wishlist</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium">Cart</span>
              </button>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="border-t">
            <div className="flex items-center space-x-8 py-3 overflow-x-auto">
              {['Women Ethnic', 'Women Western', 'Men', 'Kids', 'Home & Kitchen', 'Beauty & Health', 'Jewellery & Accessories', 'Bags & Footwear'].map((category) => (
                <button
                  key={category}
                  onClick={() => onSearch(category)}
                  className="text-sm font-medium text-gray-700 hover:text-purple-600 whitespace-nowrap"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner - Smart Shopping */}
      <section className="relative overflow-hidden">
        <img 
          alt="Smart Shopping" 
          fetchPriority="high" 
          loading="eager" 
          width="1920" 
          height="534" 
          decoding="async" 
          data-nimg="1" 
          style={{color: 'transparent', width: '100%', height: 'auto', display: 'block'}} 
          src="https://images.meesho.com/images/marketing/1757490578069.webp"
        />
        
        {/* Overlay Content - Right Side */}
        <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16 lg:pr-24">
          <div className="text-right text-white">
            <div className="mb-8">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
                Smart Shopping
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Trusted by Millions
              </div>
            </div>
            <div 
              className="inline-block bg-white text-meesho-purple px-8 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => onSearch('trending fashion')}
            >
              Shop Now
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-meesho-orange bg-opacity-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-meesho-orange rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-800">7 Days Easy Return</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-meesho-orange rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-800">100% Authentic</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-meesho-orange rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-800">Lowest Prices</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => onSearch(category.name)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Sale Badge */}
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  SALE
                </div>
                <div className="bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded mt-1">
                  ₹{99 + index * 50}
                </div>
              </div>

              <div className="aspect-square">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <h4 className="font-semibold text-white text-sm">{category.name}</h4>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* AI Fashion Assistant */}
      <section className="bg-gradient-to-r from-meesho-purple to-meesho-orange py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">AI-Powered Outfit Curator</h2>
          <p className="text-xl text-white text-opacity-90 mb-8">
            Real-time Meesho product scraping with Google Gemini AI intelligence
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Product Scraping</h3>
              <p className="text-white text-opacity-90 text-sm">Selenium-powered real-time Meesho data extraction</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-white mb-2">Gemini AI Pairing</h3>
              <p className="text-white text-opacity-90 text-sm">Google's advanced AI creates perfect outfit combinations</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">🗂️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Wishlist Folders</h3>
              <p className="text-white text-opacity-90 text-sm">Organize outfits by categories with custom folders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Searches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Try These Fashion Searches</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {trendingSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => onSearch(search)}
                className="bg-gradient-to-r from-white to-meesho-orange to-opacity-20 text-meesho-purple px-6 py-3 rounded-full hover:from-meesho-orange hover:to-meesho-orange-light hover:text-white transition-all duration-300 font-medium"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;