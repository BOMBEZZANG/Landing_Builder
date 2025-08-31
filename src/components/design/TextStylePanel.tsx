'use client';

import React, { useState } from 'react';
import { TextStyle } from '@/types/design.types';
import { 
  FONT_FAMILIES, 
  TEXT_STYLE_PRESETS, 
  FONT_SIZE_MAPPINGS,
  LINE_HEIGHT_MAPPINGS,
  LETTER_SPACING_MAPPINGS
} from '@/lib/design/constants';
import { 
  Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, Settings, Wand2, RotateCcw 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextStylePanelProps {
  currentStyle: Partial<TextStyle>;
  onStyleChange: (style: Partial<TextStyle>) => void;
  showPresets?: boolean;
}

const TextStylePanel: React.FC<TextStylePanelProps> = ({
  currentStyle,
  onStyleChange,
  showPresets = true
}) => {
  const [activeSection, setActiveSection] = useState<'font' | 'spacing' | 'effects'>('font');

  const handleStyleUpdate = (updates: Partial<TextStyle>) => {
    onStyleChange({ ...currentStyle, ...updates });
  };

  const applyPreset = (presetKey: string) => {
    const preset = TEXT_STYLE_PRESETS[presetKey];
    if (preset) {
      handleStyleUpdate(preset);
    }
  };

  const resetToDefaults = () => {
    handleStyleUpdate({
      fontFamily: 'inter',
      fontSize: 'md',
      fontWeight: 400,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textDecoration: 'none',
      textTransform: 'none',
      fontStyle: 'normal',
      textAlign: 'left',
      textShadow: undefined,
      opacity: 1
    });
  };

  // Font Controls
  const FontControls = () => (
    <div className="space-y-4">
      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
        <select
          value={currentStyle.fontFamily || 'inter'}
          onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(FONT_SIZE_MAPPINGS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ fontSize: key as any })}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                currentStyle.fontSize === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
        <div className="grid grid-cols-3 gap-2">
          {[300, 400, 500, 600, 700, 800, 900].map(weight => (
            <button
              key={weight}
              onClick={() => handleStyleUpdate({ fontWeight: weight as any })}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                currentStyle.fontWeight === weight
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {weight}
            </button>
          ))}
        </div>
      </div>

      {/* Style Toggles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleStyleUpdate({ 
              fontWeight: currentStyle.fontWeight === 700 ? 400 : 700 
            })}
            className={cn(
              'p-2 rounded border transition-colors',
              currentStyle.fontWeight && currentStyle.fontWeight >= 700
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStyleUpdate({ 
              fontStyle: currentStyle.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
            className={cn(
              'p-2 rounded border transition-colors',
              currentStyle.fontStyle === 'italic'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStyleUpdate({ 
              textDecoration: currentStyle.textDecoration === 'underline' ? 'none' : 'underline' 
            })}
            className={cn(
              'p-2 rounded border transition-colors',
              currentStyle.textDecoration === 'underline'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Spacing Controls
  const SpacingControls = () => (
    <div className="space-y-4">
      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(LINE_HEIGHT_MAPPINGS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ lineHeight: key as any })}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors capitalize',
                currentStyle.lineHeight === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Letter Spacing</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(LETTER_SPACING_MAPPINGS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ letterSpacing: key as any })}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors capitalize',
                currentStyle.letterSpacing === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
        <div className="flex gap-2">
          {[
            { key: 'left', icon: AlignLeft },
            { key: 'center', icon: AlignCenter },
            { key: 'right', icon: AlignRight },
            { key: 'justify', icon: AlignJustify }
          ].map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ textAlign: key as any })}
              className={cn(
                'p-2 rounded border transition-colors',
                currentStyle.textAlign === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Effects Controls
  const EffectsControls = () => (
    <div className="space-y-4">
      {/* Text Transform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Transform</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'none', label: 'None' },
            { key: 'uppercase', label: 'UPPER' },
            { key: 'lowercase', label: 'lower' },
            { key: 'capitalize', label: 'Title' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ textTransform: key as any })}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                currentStyle.textTransform === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity ({Math.round((currentStyle.opacity || 1) * 100)}%)
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={currentStyle.opacity || 1}
          onChange={(e) => handleStyleUpdate({ opacity: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Text Shadow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Shadow</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleStyleUpdate({ textShadow: undefined })}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded border transition-colors',
              !currentStyle.textShadow
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            None
          </button>
          <button
            onClick={() => handleStyleUpdate({ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' })}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded border transition-colors',
              currentStyle.textShadow === '1px 1px 2px rgba(0,0,0,0.3)'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            Light
          </button>
          <button
            onClick={() => handleStyleUpdate({ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' })}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded border transition-colors',
              currentStyle.textShadow === '2px 2px 4px rgba(0,0,0,0.5)'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            Strong
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Text Styling</h3>
        </div>
        <button
          onClick={resetToDefaults}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Presets */}
      {showPresets && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            Quick Presets
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TEXT_STYLE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-3 py-2 text-xs rounded border border-gray-300 hover:border-gray-400 transition-colors text-left"
              >
                <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-gray-500">
                  {preset.fontSize} • {preset.fontWeight}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'font', label: 'Font', icon: Type },
          { key: 'spacing', label: 'Spacing', icon: AlignLeft },
          { key: 'effects', label: 'Effects', icon: Settings }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
              activeSection === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeSection === 'font' && <FontControls />}
        {activeSection === 'spacing' && <SpacingControls />}
        {activeSection === 'effects' && <EffectsControls />}
      </div>

      {/* Preview */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div
          className="p-4 border border-gray-200 rounded-md bg-white"
          style={{
            fontFamily: currentStyle.fontFamily ? FONT_FAMILIES.find(f => f.id === currentStyle.fontFamily)?.stack : 'inherit',
            fontSize: currentStyle.fontSize ? FONT_SIZE_MAPPINGS[currentStyle.fontSize as keyof typeof FONT_SIZE_MAPPINGS] || currentStyle.fontSize : 'inherit',
            fontWeight: currentStyle.fontWeight,
            lineHeight: currentStyle.lineHeight ? LINE_HEIGHT_MAPPINGS[currentStyle.lineHeight as keyof typeof LINE_HEIGHT_MAPPINGS] : 'inherit',
            letterSpacing: currentStyle.letterSpacing ? LETTER_SPACING_MAPPINGS[currentStyle.letterSpacing as keyof typeof LETTER_SPACING_MAPPINGS] : 'inherit',
            textDecoration: currentStyle.textDecoration,
            textTransform: currentStyle.textTransform,
            fontStyle: currentStyle.fontStyle,
            textAlign: currentStyle.textAlign,
            textShadow: currentStyle.textShadow,
            opacity: currentStyle.opacity
          }}
        >
          Sample text to preview your styling choices. This shows how your text will look with the current settings.
        </div>
      </div>
    </div>
  );
};

export default TextStylePanel;