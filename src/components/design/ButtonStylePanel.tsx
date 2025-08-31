'use client';

import React, { useState } from 'react';
import { ButtonStyle, ButtonPreset } from '@/types/design.types';
import { BUTTON_PRESETS } from '@/lib/design/constants';
import { 
  MousePointer2, Square, Circle, RectangleHorizontal, Zap, Sparkles,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wand2, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmojiButton } from './EmojiPicker';

interface ButtonStylePanelProps {
  currentStyle: Partial<ButtonStyle>;
  onStyleChange: (style: Partial<ButtonStyle>) => void;
  recentEmojis?: string[];
  onEmojiAdd?: (emoji: string) => void;
  showPreview?: boolean;
}

const ButtonStylePanel: React.FC<ButtonStylePanelProps> = ({
  currentStyle,
  onStyleChange,
  recentEmojis = [],
  onEmojiAdd,
  showPreview = true
}) => {
  const [activeSection, setActiveSection] = useState<'variant' | 'size' | 'effects'>('variant');

  const handleStyleUpdate = (updates: Partial<ButtonStyle>) => {
    onStyleChange({ ...currentStyle, ...updates });
  };

  const applyPreset = (preset: ButtonPreset) => {
    handleStyleUpdate(preset.style);
  };

  const resetToDefaults = () => {
    handleStyleUpdate({
      variant: 'solid',
      size: 'md',
      borderRadius: 'md',
      shadow: 'none',
      animation: 'none',
      iconPosition: undefined,
      icon: undefined
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    handleStyleUpdate({ icon: emoji });
    if (onEmojiAdd) {
      onEmojiAdd(emoji);
    }
  };

  // Variant Controls
  const VariantControls = () => (
    <div className="space-y-4">
      {/* Button Variant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Button Style</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { key: 'solid', label: 'Solid', desc: 'Filled background' },
            { key: 'outline', label: 'Outline', desc: 'Border only' },
            { key: 'ghost', label: 'Ghost', desc: 'Transparent background' },
            { key: 'gradient', label: 'Gradient', desc: 'Gradient background' },
            { key: 'glass', label: 'Glass', desc: 'Glassmorphism effect' }
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ variant: key as any })}
              className={cn(
                'p-3 rounded-md border transition-all text-left',
                currentStyle.variant === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                {/* Mini preview */}
                <div
                  className={cn(
                    'w-8 h-4 rounded text-xs flex items-center justify-center',
                    key === 'solid' && 'bg-blue-500 text-white',
                    key === 'outline' && 'border border-blue-500 text-blue-500',
                    key === 'ghost' && 'text-blue-500',
                    key === 'gradient' && 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
                    key === 'glass' && 'bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30'
                  )}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: 'xs', label: 'XS' },
            { key: 'sm', label: 'SM' },
            { key: 'md', label: 'MD' },
            { key: 'lg', label: 'LG' },
            { key: 'xl', label: 'XL' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ size: key as any })}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                currentStyle.size === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Icon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
        <div className="flex gap-2 items-center">
          <EmojiButton
            onEmojiSelect={handleEmojiSelect}
            recentEmojis={recentEmojis}
            className="flex-shrink-0"
          />
          
          {currentStyle.icon && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">{currentStyle.icon}</span>
              <button
                onClick={() => handleStyleUpdate({ icon: undefined })}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Remove
              </button>
            </div>
          )}
          
          {!currentStyle.icon && (
            <span className="text-sm text-gray-500">Click to add an emoji icon</span>
          )}
        </div>
        
        {currentStyle.icon && (
          <div className="mt-2">
            <label className="block text-xs text-gray-600 mb-1">Icon Position</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleStyleUpdate({ iconPosition: 'left' })}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors',
                  currentStyle.iconPosition === 'left' || !currentStyle.iconPosition
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <ArrowLeft className="w-3 h-3" />
                Left
              </button>
              <button
                onClick={() => handleStyleUpdate({ iconPosition: 'right' })}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors',
                  currentStyle.iconPosition === 'right'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                Right
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Effects Controls
  const EffectsControls = () => (
    <div className="space-y-4">
      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Corner Radius</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'none', label: 'None', icon: Square },
            { key: 'sm', label: 'Small', icon: RectangleHorizontal },
            { key: 'md', label: 'Medium', icon: RectangleHorizontal },
            { key: 'lg', label: 'Large', icon: RectangleHorizontal },
            { key: 'full', label: 'Full', icon: Circle }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ borderRadius: key as any })}
              className={cn(
                'flex flex-col items-center gap-1 p-2 text-xs rounded border transition-colors',
                currentStyle.borderRadius === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'none', label: 'None' },
            { key: 'sm', label: 'Small' },
            { key: 'md', label: 'Medium' },
            { key: 'lg', label: 'Large' },
            { key: 'xl', label: 'Extra Large' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ shadow: key as any })}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                currentStyle.shadow === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Animation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hover Animation</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'none', label: 'None', icon: MousePointer2 },
            { key: 'pulse', label: 'Pulse', icon: Zap },
            { key: 'bounce', label: 'Bounce', icon: ArrowUp },
            { key: 'scale', label: 'Scale', icon: Sparkles }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleStyleUpdate({ animation: key as any })}
              className={cn(
                'flex items-center gap-2 px-2 py-1 text-xs rounded border transition-colors',
                currentStyle.animation === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const getButtonClasses = (style: Partial<ButtonStyle>) => {
    const classes = ['inline-flex', 'items-center', 'justify-center', 'font-medium', 'transition-all', 'duration-200'];

    // Size classes
    const sizeClasses = {
      xs: ['px-2', 'py-1', 'text-xs'],
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-4', 'py-2', 'text-sm'],
      lg: ['px-6', 'py-3', 'text-base'],
      xl: ['px-8', 'py-4', 'text-lg']
    };
    classes.push(...sizeClasses[style.size || 'md']);

    // Radius classes
    const radiusClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    };
    classes.push(radiusClasses[style.borderRadius || 'md']);

    // Shadow classes
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    };
    if (shadowClasses[style.shadow || 'none']) {
      classes.push(shadowClasses[style.shadow || 'none']);
    }

    // Variant classes
    const variant = style.variant || 'solid';
    if (variant === 'solid') {
      classes.push('bg-blue-500', 'text-white', 'hover:bg-blue-600');
    } else if (variant === 'outline') {
      classes.push('bg-transparent', 'border-2', 'border-blue-500', 'text-blue-500', 'hover:bg-blue-500', 'hover:text-white');
    } else if (variant === 'ghost') {
      classes.push('bg-transparent', 'text-blue-500', 'hover:bg-blue-50');
    } else if (variant === 'gradient') {
      classes.push('bg-gradient-to-r', 'from-blue-500', 'to-purple-500', 'text-white', 'hover:from-blue-600', 'hover:to-purple-600');
    } else if (variant === 'glass') {
      classes.push('bg-white', 'bg-opacity-20', 'backdrop-blur-sm', 'border', 'border-white', 'border-opacity-30', 'text-gray-900');
    }

    // Animation classes
    const animation = style.animation || 'none';
    if (animation === 'pulse') {
      classes.push('hover:animate-pulse');
    } else if (animation === 'bounce') {
      classes.push('hover:animate-bounce');
    } else if (animation === 'scale') {
      classes.push('hover:scale-105');
    }

    return classes.join(' ');
  };

  const renderButtonContent = (style: Partial<ButtonStyle>, text: string) => {
    const icon = style.icon;
    const iconPosition = style.iconPosition || 'left';

    if (!icon) {
      return text;
    }

    return (
      <div className="flex items-center gap-2">
        {iconPosition === 'left' && <span>{icon}</span>}
        <span>{text}</span>
        {iconPosition === 'right' && <span>{icon}</span>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Button Styling</h3>
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
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Wand2 className="w-3 h-3" />
          Quick Presets
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {BUTTON_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-3 text-left rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-gray-500">
                    {preset.style.variant} • {preset.style.size} • {preset.style.borderRadius}
                  </div>
                </div>
                <div
                  className={cn(
                    'px-3 py-1 text-xs rounded transition-all',
                    getButtonClasses(preset.style)
                  )}
                >
                  Preview
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'variant', label: 'Style' },
          { key: 'effects', label: 'Effects' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
              activeSection === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeSection === 'variant' && <VariantControls />}
        {activeSection === 'effects' && <EffectsControls />}
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
            <button
              className={getButtonClasses(currentStyle)}
              disabled
            >
              {renderButtonContent(currentStyle, 'Sample Button')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonStylePanel;