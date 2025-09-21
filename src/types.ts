export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number | any[]; // Support both number (review count) and array (review objects)
  image: string;
  category?: string;
  seller?: string;
  description: string;
  features?: string[];
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
  discount?: number;
  source?: string;
  url?: string;
}

export interface WishlistFolder {
  id: string;
  name: string;
  products: Product[];
}

export interface LLMResponse {
  products: Product[];
  reasoning: string;
  personalizedMessage: string;
}

export interface ComplementResponse {
  complements: Product[];
  reasoning: string;
}

export interface OutfitComplements {
  tops: Product[];
  bottoms: Product[];
  footwear: Product[];
  accessories: Product[];
  outerwear: Product[];
}

export interface OutfitSuggestion {
  anchor: Product;
  complements: OutfitComplements;
  totalPrice: number;
  styling_tips: string;
  occasion_match: string;
}

export interface OutfitResponse {
  success: boolean;
  outfit?: OutfitSuggestion;
  error?: string;
}