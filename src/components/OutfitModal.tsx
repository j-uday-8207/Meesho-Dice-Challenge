import React, { useState } from 'react';
import { X, ShoppingCart, Heart, Star, Info, Check, Plus } from 'lucide-react';
import { OutfitSuggestion, Product, WishlistFolder } from '../types';

interface OutfitModalProps {
  isOpen: boolean;
  outfit: OutfitSuggestion | null;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product, folderId: string) => void;
  onSaveOutfit?: (outfit: OutfitSuggestion) => void;
  onCreateWishlistFolder?: (name: string) => string;
  wishlistFolders?: WishlistFolder[];
}

const OutfitModal: React.FC<OutfitModalProps> = ({
  isOpen,
  outfit,
  onClose,
  onAddToCart,
  onAddToWishlist,
  onSaveOutfit,
  onCreateWishlistFolder,
  wishlistFolders = []
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [selectedWishlistFolder, setSelectedWishlistFolder] = useState<string>(
    wishlistFolders.length > 0 ? wishlistFolders[0].id : ''
  );

  if (!isOpen || !outfit) return null;

  const toggleItemSelection = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const addSelectedToWishlist = () => {
    if (!onAddToWishlist || !selectedWishlistFolder || selectedItems.size === 0) return;

    // Get all products from the outfit
    const allProducts = [
      outfit.anchor,
      ...outfit.complements.tops,
      ...outfit.complements.bottoms,
      ...outfit.complements.footwear,
      ...outfit.complements.accessories,
      ...outfit.complements.outerwear
    ];

    // Add selected items to wishlist
    allProducts.forEach(product => {
      if (selectedItems.has(product.id)) {
        onAddToWishlist(product, selectedWishlistFolder);
      }
    });

    // Clear selections and show success message
    setSelectedItems(new Set());
    alert(`${selectedItems.size} items added to wishlist!`);
  };

  const selectAll = () => {
    const allProducts = [
      outfit.anchor,
      ...outfit.complements.tops,
      ...outfit.complements.bottoms,
      ...outfit.complements.footwear,
      ...outfit.complements.accessories,
      ...outfit.complements.outerwear
    ];
    setSelectedItems(new Set(allProducts.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleCreateFolder = () => {
    if (!onCreateWishlistFolder || !newFolderName.trim()) return;
    
    const newFolderId = onCreateWishlistFolder(newFolderName.trim());
    setSelectedWishlistFolder(newFolderId);
    setNewFolderName('');
    setShowCreateFolder(false);
  };

  const cancelCreateFolder = () => {
    setNewFolderName('');
    setShowCreateFolder(false);
  };

  const renderProductSection = (title: string, products: Product[], color: string) => {
    if (products.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className={`text-lg font-semibold mb-3 text-${color}-600 flex items-center`}>
          <div className={`w-3 h-3 bg-${color}-500 rounded-full mr-2`}></div>
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer border-2 ${
                selectedItems.has(product.id) 
                  ? 'border-meesho-purple bg-meesho-purple bg-opacity-10' 
                  : 'border-transparent'
              }`}
              onClick={() => toggleItemSelection(product.id)}
            >
              {/* Selection Checkbox */}
              <div className="flex items-center justify-between mb-2">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedItems.has(product.id) 
                    ? 'bg-meesho-purple border-meesho-purple' 
                    : 'border-gray-300'
                }`}>
                  {selectedItems.has(product.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                </div>
              </div>
              
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                {product.name}
              </h5>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="flex-1 bg-meesho-purple text-white py-1 px-2 rounded text-xs hover:bg-meesho-purple-light transition-colors flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                )}
                {onAddToWishlist && wishlistFolders.length > 0 && (
                  <button
                    onClick={() => onAddToWishlist(product, wishlistFolders[0].id)}
                    className="flex-1 bg-gray-200 text-gray-700 py-1 px-2 rounded text-xs hover:bg-gray-300 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Heart className="h-3 w-3" />
                    <span>Save</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-meesho-purple to-meesho-orange px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Complete Outfit Suggestions</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {/* Anchor Item */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-3 text-meesho-purple flex items-center">
                <div className="w-3 h-3 bg-meesho-purple rounded-full mr-2"></div>
                Your Selected Item
              </h4>
              <div 
                className={`bg-purple-50 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                  selectedItems.has(outfit.anchor.id) 
                    ? 'border-meesho-purple bg-meesho-purple bg-opacity-10' 
                    : 'border-purple-200'
                }`}
                onClick={() => toggleItemSelection(outfit.anchor.id)}
              >
                <div className="flex space-x-4">
                  {/* Selection Checkbox */}
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedItems.has(outfit.anchor.id) 
                      ? 'bg-meesho-purple border-meesho-purple' 
                      : 'border-purple-300'
                  }`}>
                    {selectedItems.has(outfit.anchor.id) && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <img
                    src={outfit.anchor.image}
                    alt={outfit.anchor.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">{outfit.anchor.name}</h5>
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{outfit.anchor.rating}</span>
                    </div>
                    <span className="text-xl font-bold text-meesho-purple">₹{outfit.anchor.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Styling Tips */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Styling Tips</h4>
                  <p className="text-blue-700 text-sm">{outfit.styling_tips}</p>
                  <p className="text-blue-600 text-xs mt-2">Perfect for: {outfit.occasion_match}</p>
                </div>
              </div>
            </div>

            {/* Complementary Items */}
            {renderProductSection("Tops", outfit.complements.tops, "green")}
            {renderProductSection("Bottoms", outfit.complements.bottoms, "blue")}
            {renderProductSection("Footwear", outfit.complements.footwear, "yellow")}
            {renderProductSection("Accessories", outfit.complements.accessories, "pink")}
            {renderProductSection("Outerwear", outfit.complements.outerwear, "indigo")}
          </div>

          {/* Wishlist Selection Controls */}
          <div className="bg-gray-100 px-6 py-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <h4 className="font-semibold text-gray-900">Wishlist Selection</h4>
                <span className="text-sm text-gray-600">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Folder Selection and Creation */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700">Add to folder:</label>
                
                {/* Folder Selection Dropdown */}
                {wishlistFolders.length > 0 && !showCreateFolder && (
                  <select
                    value={selectedWishlistFolder}
                    onChange={(e) => setSelectedWishlistFolder(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-meesho-purple"
                  >
                    {wishlistFolders.map(folder => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                )}
                
                {/* Create New Folder Button */}
                {onCreateWishlistFolder && !showCreateFolder && (
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Folder</span>
                  </button>
                )}
                
                {/* Add to Wishlist Button */}
                {!showCreateFolder && (
                  <button
                    onClick={addSelectedToWishlist}
                    disabled={selectedItems.size === 0 || !selectedWishlistFolder}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      selectedItems.size === 0 || !selectedWishlistFolder
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-meesho-purple to-meesho-orange text-white hover:from-meesho-purple-light hover:to-meesho-orange-light'
                    }`}
                  >
                    <Heart className="h-4 w-4 inline mr-2" />
                    Add {selectedItems.size > 0 ? selectedItems.size : ''} to Wishlist
                  </button>
                )}
              </div>
              
              {/* New Folder Creation Form */}
              {showCreateFolder && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded border border-green-200">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFolder();
                      } else if (e.key === 'Escape') {
                        cancelCreateFolder();
                      }
                    }}
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      !newFolderName.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Create
                  </button>
                  <button
                    onClick={cancelCreateFolder}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {/* No folders message */}
              {wishlistFolders.length === 0 && !showCreateFolder && onCreateWishlistFolder && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-2">No wishlist folders found</p>
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Create Your First Folder
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Total Outfit Price:</span>
                <span className="text-2xl font-bold text-gray-900 ml-2">₹{outfit.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {onSaveOutfit && (
                  <button
                    onClick={() => onSaveOutfit(outfit)}
                    className="px-6 py-2 bg-gradient-to-r from-meesho-purple to-meesho-orange text-white rounded-lg hover:from-meesho-purple-light hover:to-meesho-orange-light transition-all duration-300"
                  >
                    Save Outfit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitModal;