import { Product, LLMResponse, ComplementResponse, OutfitResponse, OutfitComplements } from '../types';

// Enhanced fashion-focused mock product data
const mockProducts: Product[] = [
  // Women's Ethnic Wear
  {
    id: '1',
    name: 'Red Cotton Kurti with Palazzo Set',
    price: 899,
    originalPrice: 1499,
    rating: 4.3,
    reviews: 1248,
    image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Ethnic',
    seller: 'Ethnic Bazaar',
    description: 'Beautiful red cotton kurti with matching palazzo pants, perfect for casual and festive occasions.',
    features: ['100% Cotton', 'Machine washable', 'Comfortable fit', 'Matching palazzo', 'Festive wear'],
    colors: ['Red', 'Blue', 'Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    discount: 40
  },
  {
    id: '2',
    name: 'Blue Denim Jeans - Skinny Fit',
    price: 799,
    originalPrice: 1299,
    rating: 4.5,
    reviews: 892,
    image: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Denim Co.',
    description: 'Classic blue skinny fit jeans, perfect bottom wear for your red shirt or any casual top.',
    features: ['Skinny fit', 'Stretchable fabric', 'Fade resistant', 'Comfortable waistband', 'Versatile styling'],
    colors: ['Blue', 'Black', 'Grey'],
    sizes: ['26', '28', '30', '32', '34'],
    inStock: true,
    discount: 38
  },
  {
    id: '3',
    name: 'Black High-Waist Palazzo Pants',
    price: 599,
    originalPrice: 999,
    rating: 4.4,
    reviews: 756,
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Fashion Hub',
    description: 'Elegant black high-waist palazzo pants, ideal bottom wear to pair with your red shirt for a chic look.',
    features: ['High waist design', 'Flowy silhouette', 'Comfortable fabric', 'Versatile styling', 'All-day comfort'],
    colors: ['Black', 'Navy', 'Maroon'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    discount: 40
  },
  {
    id: '4',
    name: 'White Cotton A-Line Skirt',
    price: 649,
    originalPrice: 1099,
    rating: 4.2,
    reviews: 543,
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Style Studio',
    description: 'Classic white A-line skirt, perfect bottom piece to complement your red shirt for a fresh, clean look.',
    features: ['A-line cut', '100% Cotton', 'Knee length', 'Side zip closure', 'Easy to style'],
    colors: ['White', 'Beige', 'Light Blue'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    discount: 41
  },
  {
    id: '5',
    name: 'Floral Print Maxi Dress',
    price: 1299,
    originalPrice: 2199,
    rating: 4.6,
    reviews: 1567,
    image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Floral Fashion',
    description: 'Beautiful floral print maxi dress with vibrant colors, perfect for summer outings and casual events.',
    features: ['Floral print', 'Maxi length', 'Comfortable fabric', 'Sleeveless design', 'Summer perfect'],
    colors: ['Multi', 'Pink', 'Blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    discount: 41
  },
  {
    id: '6',
    name: 'Traditional Silk Saree with Blouse',
    price: 2499,
    originalPrice: 4999,
    rating: 4.7,
    reviews: 892,
    image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Ethnic',
    seller: 'Silk Heritage',
    description: 'Elegant silk saree with intricate border work and matching blouse piece, perfect for special occasions.',
    features: ['Pure silk', 'Intricate border', 'Matching blouse', 'Traditional design', 'Special occasions'],
    colors: ['Red', 'Blue', 'Green', 'Pink'],
    sizes: ['Free Size'],
    inStock: true,
    discount: 50
  },
  {
    id: '7',
    name: 'Casual Cotton T-Shirt - Red',
    price: 399,
    originalPrice: 699,
    rating: 4.1,
    reviews: 1234,
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Basic Tees',
    description: 'Comfortable red cotton t-shirt, perfect for pairing with jeans, skirts, or palazzo pants.',
    features: ['100% Cotton', 'Regular fit', 'Soft fabric', 'Versatile styling', 'Easy care'],
    colors: ['Red', 'White', 'Black', 'Blue'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    discount: 43
  },
  {
    id: '8',
    name: 'Designer Lehenga Choli Set',
    price: 3999,
    originalPrice: 7999,
    rating: 4.8,
    reviews: 456,
    image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Ethnic',
    seller: 'Royal Collection',
    description: 'Stunning designer lehenga choli with heavy embroidery work, perfect for weddings and festivals.',
    features: ['Heavy embroidery', 'Designer piece', 'Complete set', 'Wedding wear', 'Premium quality'],
    colors: ['Pink', 'Red', 'Blue', 'Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    discount: 50
  },
  {
    id: '9',
    name: 'Khaki Cargo Pants',
    price: 899,
    originalPrice: 1499,
    rating: 4.3,
    reviews: 678,
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Urban Style',
    description: 'Trendy khaki cargo pants with multiple pockets, great bottom wear option for your red shirt.',
    features: ['Multiple pockets', 'Cargo style', 'Comfortable fit', 'Durable fabric', 'Trendy design'],
    colors: ['Khaki', 'Black', 'Olive'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    discount: 40
  },
  {
    id: '10',
    name: 'Printed Palazzo Pants Set',
    price: 749,
    originalPrice: 1249,
    rating: 4.4,
    reviews: 523,
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Comfort Zone',
    description: 'Comfortable printed palazzo pants, excellent choice to pair with your red shirt for a stylish look.',
    features: ['Printed design', 'Palazzo style', 'Elastic waist', 'Breathable fabric', 'Easy styling'],
    colors: ['Multi', 'Black', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    discount: 40
  },
  // Footwear
  {
    id: '20',
    name: 'Casual White Sneakers',
    price: 999,
    originalPrice: 1599,
    rating: 4.3,
    reviews: 892,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Footwear',
    seller: 'Shoe Studio',
    description: 'Comfortable white sneakers perfect for casual outfits and everyday wear.',
    features: ['Breathable mesh', 'Cushioned sole', 'Lace-up design', 'Durable material', 'Versatile styling'],
    colors: ['White', 'Black', 'Grey'],
    sizes: ['6', '7', '8', '9', '10'],
    inStock: true,
    discount: 38
  },
  {
    id: '21',
    name: 'Brown Block Heel Sandals',
    price: 799,
    originalPrice: 1299,
    rating: 4.4,
    reviews: 567,
    image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Footwear',
    seller: 'Heel Heaven',
    description: 'Elegant brown block heel sandals perfect for formal and semi-formal occasions.',
    features: ['Block heel', 'Ankle strap', 'Cushioned footbed', 'Premium material', 'Formal wear'],
    colors: ['Brown', 'Black', 'Tan'],
    sizes: ['6', '7', '8', '9', '10'],
    inStock: true,
    discount: 38
  },
  // Accessories
  {
    id: '22',
    name: 'Black Handbag with Chain Strap',
    price: 1299,
    originalPrice: 2199,
    rating: 4.5,
    reviews: 743,
    image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Accessories',
    seller: 'Bag Boutique',
    description: 'Stylish black handbag with chain strap, perfect accessory for any outfit.',
    features: ['Chain strap', 'Multiple compartments', 'Premium material', 'Magnetic closure', 'Versatile design'],
    colors: ['Black', 'Brown', 'Navy'],
    sizes: ['One Size'],
    inStock: true,
    discount: 41
  },
  {
    id: '23',
    name: 'Gold Statement Earrings',
    price: 399,
    originalPrice: 699,
    rating: 4.6,
    reviews: 1234,
    image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Jewelry',
    seller: 'Jewelry Junction',
    description: 'Beautiful gold statement earrings to complement ethnic and western outfits.',
    features: ['Gold plated', 'Statement design', 'Lightweight', 'Hypoallergenic', 'Ethnic fusion'],
    colors: ['Gold', 'Silver', 'Rose Gold'],
    sizes: ['One Size'],
    inStock: true,
    discount: 43
  },
  // Additional Tops
  {
    id: '24',
    name: 'Navy Blue Cotton Shirt',
    price: 699,
    originalPrice: 1199,
    rating: 4.2,
    reviews: 456,
    image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Cotton Craft',
    description: 'Classic navy blue cotton shirt, perfect for office wear and casual styling.',
    features: ['100% Cotton', 'Formal fit', 'Button down', 'Collar design', 'Office wear'],
    colors: ['Navy', 'White', 'Light Blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    discount: 42
  },
  {
    id: '25',
    name: 'Printed Crop Top',
    price: 499,
    originalPrice: 899,
    rating: 4.1,
    reviews: 678,
    image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Women Western',
    seller: 'Trendy Tops',
    description: 'Fashionable printed crop top perfect for casual outings and summer styling.',
    features: ['Crop length', 'Printed design', 'Breathable fabric', 'Casual wear', 'Summer collection'],
    colors: ['Multi', 'Black', 'White'],
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    discount: 44
  }
];

export const generatePersonalizedResults = async (query: string): Promise<LLMResponse> => {
  try {
    // First try to get results from Meesho scraper
    console.log('Fetching from scraper API:', query);
    const response = await fetch(`http://localhost:5002/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    console.log('Scraper API response:', data);
    
    if (response.ok && data.products && data.products.length > 0) {
      console.log('Using scraped data:', data.products.length, 'products found');
      return {
        products: data.products,
        reasoning: data.reasoning,
        personalizedMessage: data.personalizedMessage
      };
    } else {
      console.warn('Scraper returned no products:', data);
    }
  } catch (error) {
    console.warn('Scraper API failed, falling back to mock data:', error);
  }

  // Fall back to mock data if scraper fails
  const keywords = query.toLowerCase();
  let filteredProducts = mockProducts;
  let reasoning = '';
  let personalizedMessage = '';

  // Enhanced fashion-specific search logic
  if (keywords.includes('bottom') && keywords.includes('red shirt')) {
    filteredProducts = mockProducts.filter(p => 
      p.name.toLowerCase().includes('jeans') || 
      p.name.toLowerCase().includes('palazzo') || 
      p.name.toLowerCase().includes('skirt') ||
      p.name.toLowerCase().includes('pants') ||
      p.category === 'Women Western'
    );
    reasoning = 'I found perfect bottom wear options that complement red shirts. These pieces offer great color coordination and style versatility.';
    personalizedMessage = 'Here are the best bottom wear options for your red shirt - from classic jeans to elegant palazzo pants!';
  } else if (keywords.includes('kurti') || keywords.includes('ethnic')) {
    filteredProducts = mockProducts.filter(p => p.category === 'Women Ethnic');
    reasoning = 'Showing ethnic wear collection with traditional and contemporary designs perfect for various occasions.';
    personalizedMessage = 'Discover beautiful ethnic wear that combines tradition with modern style!';
  } else if (keywords.includes('western') || keywords.includes('dress') || keywords.includes('jeans')) {
    filteredProducts = mockProducts.filter(p => p.category === 'Women Western');
    reasoning = 'Curated western wear collection featuring trendy and comfortable pieces for modern women.';
    personalizedMessage = 'Explore our western wear collection with the latest fashion trends!';
  } else if (keywords.includes('saree') || keywords.includes('lehenga')) {
    filteredProducts = mockProducts.filter(p => 
      p.name.toLowerCase().includes('saree') || 
      p.name.toLowerCase().includes('lehenga')
    );
    reasoning = 'Showcasing traditional Indian wear with elegant sarees and designer lehengas for special occasions.';
    personalizedMessage = 'Beautiful traditional wear for your special moments!';
  } else if (keywords.includes('matching') || keywords.includes('combo')) {
    filteredProducts = mockProducts.filter(p => 
      p.name.toLowerCase().includes('set') || 
      p.name.toLowerCase().includes('matching')
    );
    reasoning = 'Found coordinated sets and matching pieces for effortless styling.';
    personalizedMessage = 'Perfect matching sets for a coordinated look!';
  }

  // If no specific matches, return all products
  if (filteredProducts.length === 0) {
    filteredProducts = mockProducts;
    reasoning = `Based on your search for "${query}", I've curated a diverse collection of fashion items with great ratings and value.`;
    personalizedMessage = `Here are ${mockProducts.length} handpicked fashion items for "${query}"!`;
  }

  const response: LLMResponse = {
    products: filteredProducts.sort(() => Math.random() - 0.5).slice(0, 12),
    reasoning,
    personalizedMessage
  };

  return response;
};

export const generateComplementSuggestions = async (product: Product): Promise<ComplementResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  let complements: Product[] = [];
  let reasoning = '';

  // Fashion-specific complement logic
  if (product.name.toLowerCase().includes('shirt') || product.name.toLowerCase().includes('top')) {
    complements = mockProducts.filter(p => 
      p.id !== product.id && 
      (p.name.toLowerCase().includes('jeans') || 
       p.name.toLowerCase().includes('palazzo') || 
       p.name.toLowerCase().includes('skirt') ||
       p.name.toLowerCase().includes('pants'))
    ).slice(0, 4);
    reasoning = `Perfect bottom wear to complete your look with ${product.name}. These pieces offer great styling versatility.`;
  } else if (product.name.toLowerCase().includes('jeans') || product.name.toLowerCase().includes('pants')) {
    complements = mockProducts.filter(p => 
      p.id !== product.id && 
      (p.name.toLowerCase().includes('shirt') || 
       p.name.toLowerCase().includes('top') ||
       p.name.toLowerCase().includes('kurti'))
    ).slice(0, 4);
    reasoning = `Great top wear options to pair with ${product.name}. These combinations create stylish and comfortable outfits.`;
  } else if (product.category === 'Women Ethnic') {
    complements = mockProducts.filter(p => 
      p.id !== product.id && 
      p.category === 'Women Ethnic'
    ).slice(0, 4);
    reasoning = `Complementary ethnic pieces that go well with ${product.name} for a complete traditional look.`;
  } else if (product.category === 'Women Western') {
    complements = mockProducts.filter(p => 
      p.id !== product.id && 
      p.category === 'Women Western'
    ).slice(0, 4);
    reasoning = `Stylish western wear pieces that complement ${product.name} for a trendy, coordinated outfit.`;
  }

  // If no specific complements found, get random fashion items
  if (complements.length === 0) {
    complements = mockProducts.filter(p => p.id !== product.id).slice(0, 4);
    reasoning = `Based on your interest in ${product.name}, here are other fashion items that customers love to style together.`;
  }

  const response: ComplementResponse = {
    complements,
    reasoning
  };

  return response;
};

// New outfit-related functions

/**
 * Detects if a search query is asking for a complete outfit
 */
export const detectOutfitIntent = (query: string): boolean => {
  const outfitKeywords = [
    'outfit', 'complete look', 'full set', 'ensemble', 
    'coordination', 'matching set', 'style set', 'look book',
    'dress me', 'what to wear', 'complete style', 'full outfit',
    'coordinated look', 'styling', 'wardrobe', 'look for'
  ];
  
  const occasionKeywords = [
    'office', 'work', 'casual', 'party', 'wedding', 'date',
    'formal', 'business', 'vacation', 'travel', 'beach',
    'dinner', 'brunch', 'meeting', 'interview', 'festive'
  ];
  
  const queryLower = query.toLowerCase();
  
  // Check for explicit outfit keywords
  const hasOutfitKeyword = outfitKeywords.some(keyword => 
    queryLower.includes(keyword)
  );
  
  // Check for occasion-based queries (often imply full outfits)
  const hasOccasionKeyword = occasionKeywords.some(keyword => 
    queryLower.includes(keyword)
  );
  
  // Phrases that often indicate outfit requests
  const outfitPhrases = [
    'what should i wear',
    'how to dress',
    'style for',
    'look for',
    'going to'
  ];
  
  const hasOutfitPhrase = outfitPhrases.some(phrase => 
    queryLower.includes(phrase)
  );
  
  return hasOutfitKeyword || (hasOccasionKeyword && hasOutfitPhrase);
};

/**
 * Analyzes an item and suggests complementary pieces for a complete outfit using real search data
 */
export const generateOutfitSuggestions = async (
  anchorItem: Product, 
  availableProducts: Product[],
  occasion?: string, 
  budget?: string
): Promise<OutfitResponse> => {
  try {
    // Step 1: Use LLM to pair the anchor item with available products
    const pairedProducts = await pairProductsWithLLM(anchorItem, availableProducts, occasion, budget);
    
    // Step 2: Organize products by category with strict deduplication
    const usedProductIds = new Set<string>();
    const usedCombinations = new Set<string>();
    const complements: OutfitComplements = {
      tops: [],
      bottoms: [],
      footwear: [],
      accessories: [],
      outerwear: []
    };
    
    // Categorize products ensuring no duplicates across categories
    pairedProducts.forEach(product => {
      const combinationKey = `${product.name.toLowerCase().trim()}_${product.price}`;
      
      if (usedProductIds.has(product.id) || usedCombinations.has(combinationKey)) {
        console.log(`Skipping duplicate product: ${product.name} (${usedProductIds.has(product.id) ? 'ID' : 'name+price'} duplicate)`);
        return; // Skip if already used
      }
      
      if (isTopWear(product) && complements.tops.length < 3) {
        complements.tops.push(product);
        usedProductIds.add(product.id);
        usedCombinations.add(combinationKey);
        console.log(`Added to tops: ${product.name}`);
      } else if (isBottomWear(product) && complements.bottoms.length < 3) {
        complements.bottoms.push(product);
        usedProductIds.add(product.id);
        usedCombinations.add(combinationKey);
        console.log(`Added to bottoms: ${product.name}`);
      } else if (isFootwear(product) && complements.footwear.length < 2) {
        complements.footwear.push(product);
        usedProductIds.add(product.id);
        usedCombinations.add(combinationKey);
        console.log(`Added to footwear: ${product.name}`);
      } else if (isAccessory(product) && complements.accessories.length < 2) {
        complements.accessories.push(product);
        usedProductIds.add(product.id);
        usedCombinations.add(combinationKey);
        console.log(`Added to accessories: ${product.name}`);
      } else if (isOuterwear(product) && complements.outerwear.length < 2) {
        complements.outerwear.push(product);
        usedProductIds.add(product.id);
        usedCombinations.add(combinationKey);
        console.log(`Added to outerwear: ${product.name}`);
      }
    });
    
    console.log('Final outfit breakdown:', {
      tops: complements.tops.length,
      bottoms: complements.bottoms.length,
      footwear: complements.footwear.length,
      accessories: complements.accessories.length,
      outerwear: complements.outerwear.length
    });
    
    // Step 3: Calculate total price
    const selectedComplements = [
      ...complements.tops.slice(0, 1),
      ...complements.bottoms.slice(0, 1),
      ...complements.footwear.slice(0, 1),
      ...complements.accessories.slice(0, 1)
    ];
    
    const totalPrice = anchorItem.price + 
      selectedComplements.reduce((sum, item) => sum + item.price, 0);
    
    // Step 4: Generate styling tips using LLM
    const styling_tips = await generateStylingTips(anchorItem, selectedComplements, occasion);
    
    return {
      success: true,
      outfit: {
        anchor: anchorItem,
        complements,
        totalPrice,
        styling_tips,
        occasion_match: occasion || 'casual'
      }
    };
    
  } catch (error) {
    console.error('Error generating outfit suggestions:', error);
    return {
      success: false,
      error: 'Failed to generate outfit suggestions'
    };
  }
};

// Helper functions for product categorization
const isTopWear = (product: Product): boolean => {
  const name = product.name.toLowerCase();
  const category = product.category?.toLowerCase() || '';
  return name.includes('kurti') || 
         name.includes('shirt') || 
         name.includes('top') || 
         name.includes('blouse') || 
         name.includes('crop') ||
         name.includes('tunic') ||
         category.includes('top');
};

const isBottomWear = (product: Product): boolean => {
  const name = product.name.toLowerCase();
  const category = product.category?.toLowerCase() || '';
  return name.includes('jeans') || 
         name.includes('palazzo') || 
         name.includes('pant') || 
         name.includes('skirt') || 
         name.includes('legging') ||
         name.includes('trouser') ||
         name.includes('short') ||
         category.includes('bottom');
};

const isFootwear = (product: Product): boolean => {
  const name = product.name.toLowerCase();
  const category = product.category?.toLowerCase() || '';
  return name.includes('shoe') || 
         name.includes('sandal') || 
         name.includes('heel') || 
         name.includes('sneaker') ||
         name.includes('boot') ||
         name.includes('flip') ||
         name.includes('slipper') ||
         category.includes('footwear') ||
         category.includes('shoes');
};

const isAccessory = (product: Product): boolean => {
  const name = product.name.toLowerCase();
  const category = product.category?.toLowerCase() || '';
  return name.includes('bag') || 
         name.includes('jewelry') || 
         name.includes('watch') || 
         name.includes('scarf') ||
         name.includes('belt') ||
         name.includes('necklace') ||
         name.includes('earring') ||
         name.includes('bracelet') ||
         name.includes('ring') ||
         category.includes('accessories') ||
         category.includes('jewelry');
};

const isOuterwear = (product: Product): boolean => {
  const name = product.name.toLowerCase();
  const category = product.category?.toLowerCase() || '';
  return name.includes('jacket') || 
         name.includes('coat') || 
         name.includes('blazer') || 
         name.includes('cardigan') ||
         name.includes('sweater') ||
         name.includes('hoodie') ||
         category.includes('outerwear');
};

/**
 * Uses LLM to intelligently pair products based on text descriptions
 */
const pairProductsWithLLM = async (
  anchorItem: Product, 
  availableProducts: Product[], 
  occasion?: string, 
  budget?: string
): Promise<Product[]> => {
  try {
    // Mock LLM API call for intelligent pairing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const anchorType = categorizeItem(anchorItem);
    const anchorStyle = extractStyle(anchorItem);
    const anchorColor = extractColor(anchorItem);
    const maxBudget = budget ? parseInt(budget) : undefined;
    
    // Score each product based on compatibility
    const scoredProducts = availableProducts
      .filter(p => p.id !== anchorItem.id) // Exclude anchor item
      .filter(p => p.id) // Ensure product has valid ID
      .map(product => ({
        product,
        score: calculateCompatibilityScore(anchorItem, product, occasion, anchorType, anchorStyle, anchorColor || undefined)
      }))
      .filter(item => {
        // Budget filtering
        if (maxBudget && item.product.price > maxBudget * 0.3) return false;
        return item.score > 0.3; // Only include products with good compatibility
      })
      .sort((a, b) => b.score - a.score);
    
    console.log(`LLM Pairing: Found ${scoredProducts.length} compatible products for ${anchorItem.name}`);
    
    // Return top products from each category
    const result: Product[] = [];
    const categorizedProducts = {
      tops: scoredProducts.filter(p => isTopWear(p.product)),
      bottoms: scoredProducts.filter(p => isBottomWear(p.product)),
      footwear: scoredProducts.filter(p => isFootwear(p.product)),
      accessories: scoredProducts.filter(p => isAccessory(p.product)),
      outerwear: scoredProducts.filter(p => isOuterwear(p.product))
    };
    
    // Add top suggestions from each category, avoiding duplicates by ID and name+price
    const addedIds = new Set<string>();
    const addedCombinations = new Set<string>();
    
    Object.entries(categorizedProducts).forEach(([categoryName, category]) => {
      const categoryProducts = category.slice(0, 3);
      console.log(`${categoryName}: ${categoryProducts.length} products available`);
      
      categoryProducts.forEach(item => {
        const combinationKey = `${item.product.name.toLowerCase().trim()}_${item.product.price}`;
        
        if (!addedIds.has(item.product.id) && !addedCombinations.has(combinationKey)) {
          result.push(item.product);
          addedIds.add(item.product.id);
          addedCombinations.add(combinationKey);
          console.log(`Added ${item.product.name} to ${categoryName} (score: ${item.score.toFixed(2)})`);
        } else {
          console.log(`Skipped duplicate: ${item.product.name} (ID: ${addedIds.has(item.product.id) ? 'duplicate ID' : 'duplicate name+price'})`);
        }
      });
    });
    
    console.log(`LLM Final result: ${result.length} unique products selected`);
    return result;
  } catch (error) {
    console.error('Error pairing products with LLM:', error);
    return [];
  }
};

/**
 * Calculates compatibility score between anchor item and candidate product
 */
const calculateCompatibilityScore = (
  anchor: Product, 
  candidate: Product, 
  occasion?: string,
  anchorType?: string,
  anchorStyle?: string,
  anchorColor?: string
): number => {
  let score = 0;
  
  const candidateStyle = extractStyle(candidate);
  const candidateColor = extractColor(candidate);
  const candidateType = categorizeItem(candidate);
  
  // Style compatibility
  if (anchorStyle && candidateStyle && anchorStyle === candidateStyle) {
    score += 0.4;
  }
  
  // Color coordination
  if (anchorColor && candidateColor) {
    if (anchorColor === candidateColor) score += 0.3; // Matching color
    else if (isComplementaryColor(anchorColor, candidateColor)) score += 0.25;
  }
  
  // Category logic - avoid same category unless needed
  if (anchorType === candidateType) {
    score -= 0.5; // Penalize same category
  } else {
    score += 0.3; // Reward different categories
  }
  
  // Occasion appropriateness
  if (occasion) {
    if (isOccasionAppropriate(candidate, occasion)) {
      score += 0.2;
    }
  }
  
  // Price balance (prefer items that create balanced outfit cost)
  const priceRatio = Math.min(anchor.price, candidate.price) / Math.max(anchor.price, candidate.price);
  score += priceRatio * 0.1;
  
  return Math.max(0, Math.min(1, score));
};

/**
 * Generates styling tips using product descriptions
 */
const generateStylingTips = async (
  anchorItem: Product, 
  complementItems: Product[], 
  occasion?: string
): Promise<string> => {
  try {
    // Mock LLM API call for styling tips
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const anchorStyle = extractStyle(anchorItem);
    
    let tips = `Create a ${anchorStyle || 'stylish'} look with this ${anchorItem.name}. `;
    
    complementItems.forEach((item, index) => {
      if (index === 0) {
        tips += `Pair it with ${item.name} for a ${occasion || 'versatile'} outfit. `;
      } else if (index === complementItems.length - 1) {
        tips += `Complete the look with ${item.name} to add the perfect finishing touch.`;
      } else {
        tips += `Add ${item.name} to enhance the overall style. `;
      }
    });
    
    // Add occasion-specific advice
    if (occasion) {
      if (occasion.includes('office') || occasion.includes('formal')) {
        tips += ' This combination works perfectly for professional settings.';
      } else if (occasion.includes('party') || occasion.includes('festive')) {
        tips += ' This ensemble is ideal for celebratory occasions.';
      } else {
        tips += ' This versatile combination works for various casual occasions.';
      }
    }
    
    return tips;
  } catch (error) {
    console.error('Error generating styling tips:', error);
    return `Style this ${anchorItem.name} with the suggested complementary pieces for a complete, coordinated look.`;
  }
};

// Utility functions
const categorizeItem = (product: Product): string => {
  if (isTopWear(product)) return 'top';
  if (isBottomWear(product)) return 'bottom';
  if (isFootwear(product)) return 'footwear';
  if (isAccessory(product)) return 'accessory';
  if (isOuterwear(product)) return 'outerwear';
  return 'other';
};

const extractStyle = (product: Product): string => {
  const name = product.name.toLowerCase();
  const description = product.description?.toLowerCase() || '';
  const text = `${name} ${description}`;
  
  if (text.includes('ethnic') || text.includes('traditional') || text.includes('kurti')) return 'ethnic';
  if (text.includes('western') || text.includes('modern') || text.includes('contemporary')) return 'western';
  if (text.includes('casual') || text.includes('everyday')) return 'casual';
  if (text.includes('formal') || text.includes('office') || text.includes('professional')) return 'formal';
  if (text.includes('party') || text.includes('festive') || text.includes('celebration')) return 'party';
  
  return 'versatile';
};

const extractColor = (product: Product): string | null => {
  const name = product.name.toLowerCase();
  const description = product.description?.toLowerCase() || '';
  const text = `${name} ${description}`;
  
  const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray'];
  
  for (const color of colors) {
    if (text.includes(color)) return color;
  }
  
  return null;
};

const isComplementaryColor = (color1: string, color2: string): boolean => {
  const complementaryPairs = [
    ['red', 'green'], ['blue', 'orange'], ['yellow', 'purple'],
    ['black', 'white'], ['pink', 'green'], ['brown', 'blue']
  ];
  
  return complementaryPairs.some(pair => 
    (pair.includes(color1) && pair.includes(color2))
  );
};

const isOccasionAppropriate = (product: Product, occasion: string): boolean => {
  const name = product.name.toLowerCase();
  const description = product.description?.toLowerCase() || '';
  const text = `${name} ${description}`;
  
  if (occasion.includes('office') || occasion.includes('formal')) {
    return text.includes('formal') || text.includes('office') || text.includes('professional');
  }
  if (occasion.includes('party') || occasion.includes('festive')) {
    return text.includes('party') || text.includes('festive') || text.includes('celebration');
  }
  if (occasion.includes('casual')) {
    return text.includes('casual') || text.includes('everyday') || text.includes('comfortable');
  }
  
  return true; // Default to appropriate
};