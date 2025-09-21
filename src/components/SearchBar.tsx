import React, { useState, useRef } from 'react';
import { Search, Camera, Mic, X, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, useAI?: boolean) => void;
  onImageSearch?: (imageFile: File, textPrompt?: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onImageSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useAISearch, setUseAISearch] = useState(true); // Default to AI search
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (selectedImageFile && onImageSearch) {
      // Image search - trigger navigation immediately
      setIsLoading(true);
      onImageSearch(selectedImageFile, searchText);
      // Reset form state
      setSearchText('');
      setSelectedImage(null);
      setSelectedImageFile(null);
      setIsLoading(false);
    } else if (searchText.trim()) {
      // Text search - trigger navigation immediately
      setIsLoading(true);
      onSearch(searchText, useAISearch);
      // Reset form state
      setSearchText('');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file); // Store the actual file
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string); // Store preview
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setSearchText(prev => prev + ' bottom for red shirt');
      }, 2000);
    }
  };

  return (
    <div className="relative w-full">
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-meesho-purple transition-colors">
        {/* Image Preview */}
        {selectedImage && (
          <div className="relative bg-white p-3 border-b">
            <div className="flex items-center space-x-3">
              <img 
                src={selectedImage} 
                alt="Search reference" 
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Visual Search Active</p>
                <p className="text-xs text-gray-500">AI will find similar fashion items</p>
              </div>
              <button
                onClick={removeImage}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="flex items-center">
          <div className="flex-1 flex items-center px-4 py-3">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Try Saree, Kurti or Search by Product Code"
              className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 px-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
              title="Upload image to search"
            >
              <Camera className="h-4 w-4" />
            </button>

            <button
              onClick={toggleRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Voice search"
            >
              <Mic className="h-4 w-4" />
            </button>

            <button
              onClick={() => setUseAISearch(!useAISearch)}
              className={`p-2 rounded-full transition-colors ${
                useAISearch 
                  ? 'bg-meesho-purple bg-opacity-10 text-meesho-purple' 
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              title={useAISearch ? "AI Search ON - Smart product recommendations" : "AI Search OFF - Regular search"}
            >
              <Sparkles className="h-4 w-4" />
            </button>

            <button
              onClick={handleSearch}
              disabled={!searchText.trim() && !selectedImageFile}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ml-2 ${
                useAISearch 
                  ? 'bg-meesho-purple text-white hover:bg-meesho-purple-light' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {selectedImageFile ? (
                <span className="flex items-center">
                  <Camera className="h-3 w-3 mr-1" />
                  {isLoading ? 'Analyzing...' : 'Visual Search'}
                </span>
              ) : useAISearch ? (
                <span className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isLoading ? 'Searching...' : 'Smart Search'}
                </span>
              ) : (
                isLoading ? 'Searching...' : 'Search'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      {searchText && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl border mt-1 z-20">
          <div className="p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Fashion Suggestions</p>
            {[
              `${searchText} for women`,
              `${searchText} matching accessories`,
              `${searchText} latest collection`,
              `${searchText} under ₹500`
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchText(suggestion);
                  onSearch(suggestion, useAISearch);
                }}
                className="block w-full text-left py-2 px-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex items-center">
                  <Search className="h-3 w-3 text-gray-400 mr-2" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;