import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductSliderProps {
  title: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onCompleteOutfit?: (product: Product) => void;
  className?: string;
}

const ProductSlider: React.FC<ProductSliderProps> = ({ 
  title, 
  products, 
  onProductSelect, 
  onAddToWishlist,
  onCompleteOutfit,
  className = '' 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 272; // 256px width + 16px margin
      scrollContainerRef.current.scrollBy({
        left: -cardWidth * 2, // Scroll 2 cards at a time
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 272; // 256px width + 16px margin  
      scrollContainerRef.current.scrollBy({
        left: cardWidth * 2, // Scroll 2 cards at a time
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`mb-8 ${className}`}>
      {/* Slider Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 capitalize">
          {title}
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {/* Horizontal Scrolling Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-50 hover:shadow-lg border border-gray-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-50 hover:shadow-lg border border-gray-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-gray-700" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-4 pb-4 slider-container"
        >
          {products.map((product, index) => (
            <div key={`${product.id || index}`} className="flex-shrink-0 w-64">
              <ProductCard 
                product={product} 
                onProductSelect={onProductSelect}
                onAddToWishlist={onAddToWishlist}
                onCompleteOutfit={onCompleteOutfit}
                viewMode="grid"
              />
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for visual continuity */}
        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};

export default ProductSlider;
