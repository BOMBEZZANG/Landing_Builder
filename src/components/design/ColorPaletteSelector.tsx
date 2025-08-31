'use client';

import React, { useState } from 'react';
import { ColorPreset } from '@/types/design.types';
import { COLOR_PRESETS } from '@/lib/design/constants';
import { HexColorPicker } from 'react-colorful';
import { Palette, Check, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPaletteSelectorProps {
  selectedPresetId: string;
  customColors?: ColorPreset['colors'];
  onPresetChange: (presetId: string) => void;
  onCustomColorsChange: (colors: ColorPreset['colors']) => void;
}

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({
  selectedPresetId,
  customColors,
  onPresetChange,
  onCustomColorsChange
}) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [tempCustomColors, setTempCustomColors] = useState<ColorPreset['colors']>(
    customColors || {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: { light: '#FFFFFF', dark: '#1F2937' },
      text: { heading: '#1F2937', body: '#4B5563', muted: '#9CA3AF' },
      button: { primary: '#3B82F6', hover: '#2563EB' }
    }
  );

  const selectedPreset = COLOR_PRESETS.find(p => p.id === selectedPresetId);

  const handlePresetSelect = (presetId: string) => {
    onPresetChange(presetId);
    if (presetId !== 'custom') {
      setShowCustomizer(false);
    } else {
      setShowCustomizer(true);
    }
  };

  const handleCustomColorUpdate = (colorPath: string, color: string) => {
    if (!tempCustomColors) return;
    
    const updatedColors = { ...tempCustomColors };
    const keys = colorPath.split('.');
    
    if (keys.length === 1) {
      (updatedColors as any)[keys[0]] = color;
    } else if (keys.length === 2) {
      (updatedColors as any)[keys[0]][keys[1]] = color;
    }
    
    setTempCustomColors(updatedColors);
  };

  const applyCustomColors = () => {
    if (tempCustomColors) {
      onCustomColorsChange(tempCustomColors);
      setEditingColor(null);
    }
  };

  const ColorSwatch: React.FC<{ 
    color: string; 
    label: string; 
    colorPath: string;
    size?: 'sm' | 'md' | 'lg';
  }> = ({ color, label, colorPath, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };

    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setEditingColor(colorPath)}
          className={cn(
            'rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors',
            sizeClasses[size]
          )}
          style={{ backgroundColor: color }}
          aria-label={`Edit ${label} color`}
        />
        <span className="text-xs text-gray-600 text-center">{label}</span>
      </div>
    );
  };

  const PresetCard: React.FC<{ preset: ColorPreset }> = ({ preset }) => {
    const isSelected = preset.id === selectedPresetId;
    const colors = preset.colors;

    return (
      <button
        onClick={() => handlePresetSelect(preset.id)}
        className={cn(
          'relative p-4 rounded-lg border-2 transition-all hover:shadow-md',
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        )}
      >
        {isSelected && (
          <Check className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
        )}
        
        <div className="text-left mb-3">
          <h3 className="font-medium text-sm">{preset.name}</h3>
          <p className="text-xs text-gray-500">{preset.description}</p>
        </div>

        {preset.id === 'custom' ? (
          <div className="flex items-center justify-center py-4">
            <Palette className="w-8 h-8 text-gray-400" />
          </div>
        ) : (
          colors && (
            <div className="flex flex-wrap gap-2 justify-center">
              <div 
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: colors.primary }}
              />
              <div 
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: colors.secondary }}
              />
              <div 
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: colors.accent }}
              />
              <div 
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: colors.text.heading }}
              />
            </div>
          )
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-900">Color Palette</h3>
        {selectedPresetId === 'custom' && (
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Toggle customizer"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 gap-3">
        {COLOR_PRESETS.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>

      {/* Custom Color Customizer */}
      {selectedPresetId === 'custom' && showCustomizer && tempCustomColors && (
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Custom Colors</h4>
            <button
              onClick={() => setShowCustomizer(false)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Color Swatches */}
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Brand Colors</h5>
              <div className="flex gap-4">
                <ColorSwatch
                  color={tempCustomColors.primary}
                  label="Primary"
                  colorPath="primary"
                />
                <ColorSwatch
                  color={tempCustomColors.secondary}
                  label="Secondary"
                  colorPath="secondary"
                />
                <ColorSwatch
                  color={tempCustomColors.accent}
                  label="Accent"
                  colorPath="accent"
                />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Background</h5>
              <div className="flex gap-4">
                <ColorSwatch
                  color={tempCustomColors.background.light}
                  label="Light"
                  colorPath="background.light"
                />
                <ColorSwatch
                  color={tempCustomColors.background.dark}
                  label="Dark"
                  colorPath="background.dark"
                />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Text Colors</h5>
              <div className="flex gap-4">
                <ColorSwatch
                  color={tempCustomColors.text.heading}
                  label="Heading"
                  colorPath="text.heading"
                />
                <ColorSwatch
                  color={tempCustomColors.text.body}
                  label="Body"
                  colorPath="text.body"
                />
                <ColorSwatch
                  color={tempCustomColors.text.muted}
                  label="Muted"
                  colorPath="text.muted"
                />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Button Colors</h5>
              <div className="flex gap-4">
                <ColorSwatch
                  color={tempCustomColors.button.primary}
                  label="Primary"
                  colorPath="button.primary"
                />
                <ColorSwatch
                  color={tempCustomColors.button.hover}
                  label="Hover"
                  colorPath="button.hover"
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyCustomColors}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Apply Custom Colors
          </button>
        </div>
      )}

      {/* Color Picker Modal */}
      {editingColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Edit Color</h4>
              <button
                onClick={() => setEditingColor(null)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <HexColorPicker
              color={tempCustomColors ? 
                editingColor.includes('.') 
                  ? (tempCustomColors as any)[editingColor.split('.')[0]][editingColor.split('.')[1]]
                  : (tempCustomColors as any)[editingColor]
                : '#000000'
              }
              onChange={(color) => handleCustomColorUpdate(editingColor, color)}
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingColor(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingColor(null)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPaletteSelector;