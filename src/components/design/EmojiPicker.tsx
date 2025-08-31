'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EmojiPickerProps, EmojiCategory } from '@/types/design.types';
import { EMOJI_CATEGORIES } from '@/lib/design/constants';
import { Search, Smile, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiPickerComponentProps extends Omit<EmojiPickerProps, 'position'> {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const EmojiPicker: React.FC<EmojiPickerComponentProps> = ({
  onEmojiSelect,
  recentEmojis,
  searchEnabled,
  isOpen,
  onClose,
  className
}) => {
  const [activeCategory, setActiveCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filter emojis based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmojis([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const allEmojis = EMOJI_CATEGORIES.flatMap(category => category.emojis);
    
    // Simple filtering - in a real app you'd want more sophisticated emoji search
    const filtered = allEmojis.filter(emoji => {
      // This is a simple implementation - you might want to add emoji names/keywords
      return true; // For now, show all emojis when searching
    });

    setFilteredEmojis(filtered.slice(0, 50)); // Limit results
  }, [searchQuery]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  const currentCategory = EMOJI_CATEGORIES.find(cat => cat.id === activeCategory);
  const displayEmojis = searchQuery.trim() 
    ? filteredEmojis 
    : currentCategory?.emojis || [];

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className={cn(
        'bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Smile className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Emojis</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Search */}
      {searchEnabled && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Categories */}
      {!searchQuery.trim() && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
          {recentEmojis.length > 0 && (
            <button
              onClick={() => setActiveCategory('recent')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                activeCategory === 'recent'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Clock className="w-3 h-3" />
              Recent
            </button>
          )}
          
          {EMOJI_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto">
        {activeCategory === 'recent' && recentEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {recentEmojis.map((emoji, index) => (
              <button
                key={`recent-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-lg"
                title="Recently used"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1">
            {displayEmojis.map((emoji, index) => (
              <button
                key={`${activeCategory}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-lg"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {searchQuery.trim() && filteredEmojis.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Smile className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No emojis found</p>
          </div>
        )}

        {/* Empty category */}
        {!searchQuery.trim() && displayEmojis.length === 0 && activeCategory === 'recent' && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent emojis</p>
            <p className="text-xs">Start using emojis to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Emoji Button Component for triggering the picker
interface EmojiButtonProps {
  onEmojiSelect: (emoji: string) => void;
  recentEmojis?: string[];
  className?: string;
  disabled?: boolean;
}

export const EmojiButton: React.FC<EmojiButtonProps> = ({
  onEmojiSelect,
  recentEmojis = [],
  className,
  disabled = false
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsPickerOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        disabled={disabled}
        className={cn(
          'p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        title="Insert emoji"
      >
        <Smile className="w-4 h-4 text-gray-600" />
      </button>

      {isPickerOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            recentEmojis={recentEmojis}
            searchEnabled={true}
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;