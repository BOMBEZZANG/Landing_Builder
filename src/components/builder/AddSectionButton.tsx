import React, { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Plus, FileText, Image } from 'lucide-react';

export const AddSectionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addContentSection, canAddMoreSections, contentSectionsCount } = useBuilderStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSection = (type: 'content-text' | 'content-image') => {
    addContentSection(type);
    setIsOpen(false);
  };

  if (!canAddMoreSections) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
        title="Maximum content sections reached"
      >
        <Plus className="w-4 h-4" />
        <span>Max Sections Reached ({contentSectionsCount}/10)</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Content Section</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            onClick={() => handleAddSection('content-text')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left rounded-t-lg"
          >
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Text Section</div>
              <div className="text-sm text-gray-500">Add text-only content</div>
            </div>
          </button>
          
          <button
            onClick={() => handleAddSection('content-image')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left rounded-b-lg border-t border-gray-100"
          >
            <Image className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Image Section</div>
              <div className="text-sm text-gray-500">Add content with image</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};