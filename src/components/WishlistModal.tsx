import React, { useState } from 'react';
import { X, Folder, Plus, Heart } from 'lucide-react';
import { Product, WishlistFolder } from '../types';

interface WishlistModalProps {
  product: Product;
  folders: WishlistFolder[];
  onAddToWishlist: (product: Product, folderId: string) => void;
  onClose: () => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({
  product,
  folders,
  onAddToWishlist,
  onClose
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleAddToWishlist = () => {
    if (selectedFolder) {
      onAddToWishlist(product, selectedFolder);
      onClose();
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      // Create new folder and select it
      const newFolderId = Date.now().toString();
      // This would need to be passed from parent component
      setNewFolderName('');
      setShowCreateFolder(false);
      // For now, just close the modal - in real app, create folder first
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Add to Wishlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h4>
              <p className="text-lg font-bold text-purple-600">₹{product.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Folder Selection */}
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Choose a folder:</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {folders.map((folder) => {
              const isProductInFolder = folder.products.some(p => p.id === product.id);
              return (
                <label
                  key={folder.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedFolder === folder.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isProductInFolder ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="folder"
                      value={folder.id}
                      checked={selectedFolder === folder.id}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      disabled={isProductInFolder}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <Folder className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{folder.name}</p>
                      <p className="text-sm text-gray-500">{folder.products.length} items</p>
                    </div>
                  </div>
                  {isProductInFolder && (
                    <span className="text-xs text-green-600 font-medium">Added</span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Create New Folder */}
          <div className="mt-4">
            {!showCreateFolder ? (
              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex items-center justify-center space-x-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Folder</span>
              </button>
            ) : (
              <form onSubmit={handleCreateFolder} className="space-y-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateFolder(false);
                      setNewFolderName('');
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToWishlist}
            disabled={!selectedFolder}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;