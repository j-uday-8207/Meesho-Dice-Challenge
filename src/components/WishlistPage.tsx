import React, { useState } from 'react';
import { ArrowLeft, Heart, Plus, Folder, Trash2, Edit3 } from 'lucide-react';
import { WishlistFolder, Product } from '../types';

interface WishlistPageProps {
  folders: WishlistFolder[];
  onNavigateHome: () => void;
  onProductSelect: (product: Product) => void;
  onRemoveFromWishlist: (productId: string, folderId: string) => void;
  onCreateFolder: (name: string) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({
  folders,
  onNavigateHome,
  onProductSelect,
  onRemoveFromWishlist,
  onCreateFolder
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const totalItems = folders.reduce((total, folder) => total + folder.products.length, 0);
  const displayFolders = selectedFolder ? folders.filter(f => f.id === selectedFolder) : folders;

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
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-500">{totalItems} items across {folders.length} folders</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Folder</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Folder Navigation */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedFolder === null
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>All Items ({totalItems})</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Folder className="h-4 w-4" />
                <span>{folder.name} ({folder.products.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Folders Grid */}
        {selectedFolder === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {folders.map((folder) => (
              <div key={folder.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Folder className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
                        <p className="text-sm text-gray-500">{folder.products.length} items</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {folder.products.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {folder.products.slice(0, 3).map((product) => (
                        <div key={product.id} className="aspect-square rounded-lg overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No items yet</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Folder
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Products in Selected Folder
          <div>
            {displayFolders.map((folder) => (
              <div key={folder.id}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">{folder.name}</h2>
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All Folders
                  </button>
                </div>
                
                {folder.products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {folder.products.map((product) => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => onRemoveFromWishlist(product.id, folder.id)}
                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 
                            onClick={() => onProductSelect(product)}
                            className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer line-clamp-2 mb-2"
                          >
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{product.seller}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No items in this folder</h3>
                    <p className="text-gray-600 mb-6">Start adding products you love to this folder</p>
                    <button
                      onClick={onNavigateHome}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
                autoFocus
              />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;