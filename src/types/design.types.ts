// Enhanced Design System Types

// Color Preset System
export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      light: string;
      dark: string;
    };
    text: {
      heading: string;
      body: string;
      muted: string;
    };
    button: {
      primary: string;
      hover: string;
    };
  } | null; // null for custom preset
}

// Font System
export interface FontFamily {
  id: string;
  name: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  stack: string;
  weights: number[];
  googleFont?: string;
  preview: string;
}

export interface FontPairing {
  heading: string;
  body: string;
  accent?: string;
}

// Text Styling
export interface TextStyle {
  // Font properties
  fontFamily: string;
  fontSize: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight: 300 | 400 | 500 | 600 | 700 | 800 | 900;
  
  // Spacing
  lineHeight: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  
  // Decoration
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontStyle: 'normal' | 'italic';
  
  // Alignment
  textAlign: 'left' | 'center' | 'right' | 'justify';
  
  // Effects
  textShadow?: string;
  opacity?: number;
}

// Button Styles
export interface ButtonStyle {
  variant: 'solid' | 'outline' | 'ghost' | 'gradient' | 'glass';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation: 'none' | 'pulse' | 'bounce' | 'scale';
  iconPosition?: 'left' | 'right';
  icon?: string; // emoji or icon name
}

export interface ButtonPreset {
  name: string;
  style: ButtonStyle;
}

// Emoji System
export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  recentEmojis: string[];
  searchEnabled: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface EmojiPickerState {
  activeCategory: string;
  searchQuery: string;
  isOpen: boolean;
  recentlyUsed: string[];
  skinToneModifier?: number;
}

// Color Palette Interface
export interface ColorPaletteSelector {
  presets: ColorPreset[];
  currentPreset: string;
  customColors: ColorPreset['colors'] | null;
  
  // Actions
  selectPreset: (presetId: string) => void;
  customizeColors: (colors: Partial<ColorPreset['colors']>) => void;
  saveAsNewPreset: (name: string) => void;
}

// Store Extension Interface
export interface EnhancedDesignState {
  // Color system
  colorPreset: string;
  customColors: ColorPreset['colors'] | null;
  
  // Font system
  fontSettings: {
    heading: string;
    body: string;
    accent?: string;
  };
  
  // Emoji system
  recentEmojis: string[];
  
  // Actions
  applyColorPreset: (presetId: string) => void;
  updateCustomColors: (colors: Partial<ColorPreset['colors']>) => void;
  updateFontSettings: (fonts: Partial<EnhancedDesignState['fontSettings']>) => void;
  addRecentEmoji: (emoji: string) => void;
  updateTextStyle: (sectionId: string, style: Partial<TextStyle>) => void;
  updateButtonStyle: (sectionId: string, style: Partial<ButtonStyle>) => void;
}