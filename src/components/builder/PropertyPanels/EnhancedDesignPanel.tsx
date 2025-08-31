'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Section } from '@/types/builder.types';
import { COLOR_PRESETS } from '@/lib/design/constants';
import ColorPaletteSelector from '@/components/design/ColorPaletteSelector';
import FontSelector from '@/components/design/FontSelector';
import TextStylePanel from '@/components/design/TextStylePanel';
import ButtonStylePanel from '@/components/design/ButtonStylePanel';
import { EmojiButton } from '@/components/design/EmojiPicker';
import { 
  Palette, Type, Sparkles, MousePointer2, 
  ChevronDown, ChevronRight, Settings2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedDesignPanelProps {
  selectedSection: Section | null;
}

const EnhancedDesignPanel: React.FC<EnhancedDesignPanelProps> = ({
  selectedSection
}) => {
  const {
    page,
    applyColorPreset,
    updateCustomColors,
    updateFontSettings,
    addRecentEmoji,
    updateTextStyle,
    updateButtonStyle
  } = useBuilderStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    colors: true,
    typography: false,
    textStyling: false,
    buttonStyling: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const currentColorPreset = page.globalStyles.colorPreset || 'ocean';
  const customColors = page.globalStyles.customColors;
  const fontSettings = page.globalStyles.fontSettings || { heading: 'inter', body: 'inter' };
  const recentEmojis = page.globalStyles.recentEmojis || [];

  // Get current colors from preset or custom
  const getCurrentColors = () => {
    if (currentColorPreset === 'custom' && customColors) {
      return customColors;
    }
    
    const preset = COLOR_PRESETS.find(p => p.id === currentColorPreset);
    return preset?.colors || null;
  };

  const handleColorPresetChange = (presetId: string) => {
    applyColorPreset(presetId);
  };

  const handleCustomColorsChange = (colors: NonNullable<typeof customColors>) => {
    updateCustomColors(colors);
  };

  const handleFontChange = (type: 'heading' | 'body', fontId: string) => {
    updateFontSettings({ [type]: fontId });
  };

  const handleEmojiAdd = (emoji: string) => {
    addRecentEmoji(emoji);
  };

  const CollapsibleSection: React.FC<{
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }> = ({ id, title, icon: Icon, children, defaultExpanded = false }) => {
    const isExpanded = expandedSections[id] ?? defaultExpanded;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  const hasTextContent = selectedSection && (
    selectedSection.type === 'hero' || 
    selectedSection.type === 'content' ||
    selectedSection.type === 'content-text' ||
    selectedSection.type === 'content-image' ||
    selectedSection.type === 'cta'
  );

  const hasButton = selectedSection && (
    selectedSection.type === 'hero' ||
    selectedSection.type === 'cta'
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <Settings2 className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Enhanced Design</h2>
      </div>

      {/* Global Design Settings */}
      <div className="space-y-4">
        {/* Color Palette */}
        <CollapsibleSection
          id="colors"
          title="Color Palette"
          icon={Palette}
          defaultExpanded={true}
        >
          <ColorPaletteSelector
            selectedPresetId={currentColorPreset}
            customColors={customColors}
            onPresetChange={handleColorPresetChange}
            onCustomColorsChange={handleCustomColorsChange}
          />
        </CollapsibleSection>

        {/* Typography */}
        <CollapsibleSection
          id="typography"
          title="Typography"
          icon={Type}
        >
          <FontSelector
            selectedHeadingFont={fontSettings.heading}
            selectedBodyFont={fontSettings.body}
            onHeadingFontChange={(fontId) => handleFontChange('heading', fontId)}
            onBodyFontChange={(fontId) => handleFontChange('body', fontId)}
          />
        </CollapsibleSection>
      </div>

      {/* Section-Specific Settings */}
      {selectedSection && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
            Section Settings
          </h3>

          {/* Text Styling */}
          {hasTextContent && (
            <CollapsibleSection
              id="textStyling"
              title="Text Styling"
              icon={Sparkles}
            >
              <TextStylePanel
                currentStyle={(selectedSection.data as any).textStyle || {}}
                onStyleChange={(style) => updateTextStyle(selectedSection.id, style)}
                showPresets={true}
              />
            </CollapsibleSection>
          )}

          {/* Button Styling */}
          {hasButton && (
            <CollapsibleSection
              id="buttonStyling"
              title="Button Styling"
              icon={MousePointer2}
            >
              <ButtonStylePanel
                currentStyle={(selectedSection.data as any).buttonStyle || {}}
                onStyleChange={(style) => updateButtonStyle(selectedSection.id, style)}
                recentEmojis={recentEmojis}
                onEmojiAdd={handleEmojiAdd}
                showPreview={true}
              />
            </CollapsibleSection>
          )}
        </div>
      )}

      {/* Emoji Quick Access */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Quick Emoji</h3>
          <EmojiButton
            onEmojiSelect={handleEmojiAdd}
            recentEmojis={recentEmojis}
            className="p-1"
          />
        </div>
        
        {recentEmojis.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recentEmojis.slice(0, 8).map((emoji, index) => (
              <button
                key={index}
                className="p-2 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                title="Recently used emoji"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Preview */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Current Theme</h3>
        <div className="p-3 bg-gray-50 rounded-md space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Colors:</span>
            <span className="text-xs font-medium">
              {COLOR_PRESETS.find(p => p.id === currentColorPreset)?.name || 'Custom'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Fonts:</span>
            <span className="text-xs font-medium">
              {fontSettings.heading === fontSettings.body 
                ? fontSettings.heading 
                : `${fontSettings.heading} / ${fontSettings.body}`}
            </span>
          </div>
          
          {getCurrentColors() && (
            <div className="flex gap-1 mt-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300" 
                style={{ backgroundColor: getCurrentColors()!.primary }}
                title="Primary color"
              />
              <div 
                className="w-4 h-4 rounded border border-gray-300" 
                style={{ backgroundColor: getCurrentColors()!.secondary }}
                title="Secondary color"
              />
              <div 
                className="w-4 h-4 rounded border border-gray-300" 
                style={{ backgroundColor: getCurrentColors()!.accent }}
                title="Accent color"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDesignPanel;