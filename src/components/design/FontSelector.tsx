'use client';

import React, { useEffect, useState } from 'react';
import { FontFamily } from '@/types/design.types';
import { FONT_FAMILIES, RECOMMENDED_PAIRINGS } from '@/lib/design/constants';
import { Type, Check, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FontSelectorProps {
  selectedHeadingFont: string;
  selectedBodyFont: string;
  onHeadingFontChange: (fontId: string) => void;
  onBodyFontChange: (fontId: string) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  selectedHeadingFont,
  selectedBodyFont,
  onHeadingFontChange,
  onBodyFontChange
}) => {
  // All fonts are preloaded via FontLoader component
  const loadedFonts = new Set(FONT_FAMILIES.map(f => f.id));
  const [activeTab, setActiveTab] = useState<'individual' | 'pairings'>('individual');

  const FontCard: React.FC<{ 
    font: FontFamily; 
    isSelected: boolean; 
    onClick: () => void;
    type: 'heading' | 'body';
  }> = ({ font, isSelected, onClick, type }) => {
    const isLoaded = true; // All fonts are preloaded

    return (
      <button
        onClick={onClick}
        disabled={!isLoaded}
        className={cn(
          'relative p-4 rounded-lg border-2 transition-all hover:shadow-md text-left w-full',
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300',
          !isLoaded && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isSelected && (
          <Check className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{font.name}</span>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {font.category}
            </span>
          </div>
          
          <p className="text-xs text-gray-500">{font.preview}</p>
          
          {/* Preview Text */}
          <div
            className={cn(
              'text-gray-900 transition-all',
              type === 'heading' ? 'text-lg font-semibold' : 'text-sm',
              isLoaded && `font-[${font.name}]`
            )}
            style={{ 
              fontFamily: isLoaded ? font.stack : 'inherit'
            }}
          >
            {type === 'heading' ? 'Heading Preview' : 'Body text preview with longer content'}
          </div>

          {/* Font Weights */}
          <div className="flex flex-wrap gap-1">
            {font.weights.map(weight => (
              <span key={weight} className="text-xs px-1 py-0.5 bg-gray-100 rounded text-gray-600">
                {weight}
              </span>
            ))}
          </div>
        </div>
      </button>
    );
  };

  const PairingCard: React.FC<{ 
    name: string; 
    pairing: { heading: string; body: string }; 
    isSelected: boolean; 
    onClick: () => void;
  }> = ({ name, pairing, isSelected, onClick }) => {
    const headingFont = FONT_FAMILIES.find(f => f.id === pairing.heading);
    const bodyFont = FONT_FAMILIES.find(f => f.id === pairing.body);
    
    if (!headingFont || !bodyFont) return null;

    const headingLoaded = true; // All fonts are preloaded
    const bodyLoaded = true; // All fonts are preloaded

    return (
      <button
        onClick={onClick}
        disabled={!headingLoaded || !bodyLoaded}
        className={cn(
          'relative p-4 rounded-lg border-2 transition-all hover:shadow-md text-left w-full',
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300',
          (!headingLoaded || !bodyLoaded) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isSelected && (
          <Check className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
        )}
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 capitalize">{name}</h3>
          
          {/* Heading Preview */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Heading: {headingFont.name}</div>
            <div
              className={cn(
                'text-lg font-semibold text-gray-900',
                headingLoaded && `font-[${headingFont.name}]`
              )}
              style={{ 
                fontFamily: headingLoaded ? headingFont.stack : 'inherit'
              }}
            >
              Beautiful Heading
            </div>
          </div>

          {/* Body Preview */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Body: {bodyFont.name}</div>
            <div
              className={cn(
                'text-sm text-gray-700',
                bodyLoaded && `font-[${bodyFont.name}]`
              )}
              style={{ 
                fontFamily: bodyLoaded ? bodyFont.stack : 'inherit'
              }}
            >
              This is how your body text will look with this font pairing. Perfect for readability.
            </div>
          </div>
        </div>
      </button>
    );
  };

  const handlePairingSelect = (pairing: { heading: string; body: string }) => {
    onHeadingFontChange(pairing.heading);
    onBodyFontChange(pairing.body);
  };

  const currentPairingName = Object.entries(RECOMMENDED_PAIRINGS).find(
    ([_, pairing]) => pairing.heading === selectedHeadingFont && pairing.body === selectedBodyFont
  )?.[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-900">Typography</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('individual')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'individual'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Layers className="w-4 h-4" />
          Individual Fonts
        </button>
        <button
          onClick={() => setActiveTab('pairings')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'pairings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Font Pairings
        </button>
      </div>

      {activeTab === 'individual' ? (
        <div className="space-y-6">
          {/* Heading Fonts */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Heading Font</h4>
            <div className="grid grid-cols-1 gap-3">
              {FONT_FAMILIES.map((font) => (
                <FontCard
                  key={`heading-${font.id}`}
                  font={font}
                  isSelected={font.id === selectedHeadingFont}
                  onClick={() => onHeadingFontChange(font.id)}
                  type="heading"
                />
              ))}
            </div>
          </div>

          {/* Body Fonts */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Body Font</h4>
            <div className="grid grid-cols-1 gap-3">
              {FONT_FAMILIES.map((font) => (
                <FontCard
                  key={`body-${font.id}`}
                  font={font}
                  isSelected={font.id === selectedBodyFont}
                  onClick={() => onBodyFontChange(font.id)}
                  type="body"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Choose from professionally curated font combinations</p>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(RECOMMENDED_PAIRINGS).map(([name, pairing]) => (
              <PairingCard
                key={name}
                name={name}
                pairing={pairing}
                isSelected={currentPairingName === name}
                onClick={() => handlePairingSelect(pairing)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSelector;