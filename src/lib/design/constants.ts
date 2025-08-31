import { ColorPreset, FontFamily, FontPairing, EmojiCategory, ButtonPreset, TextStyle } from '@/types/design.types';

// Color Presets
export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'ocean',
    name: '🌊 Ocean Breeze',
    description: 'Cool blues and aqua tones',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#6366F1',
      background: {
        light: '#F0F9FF',
        dark: '#0C4A6E'
      },
      text: {
        heading: '#0C4A6E',
        body: '#475569',
        muted: '#94A3B8'
      },
      button: {
        primary: '#0EA5E9',
        hover: '#0284C7'
      }
    }
  },
  {
    id: 'sunset',
    name: '🌅 Sunset Glow',
    description: 'Warm oranges and purples',
    colors: {
      primary: '#F97316',
      secondary: '#EC4899',
      accent: '#A855F7',
      background: {
        light: '#FFF7ED',
        dark: '#7C2D12'
      },
      text: {
        heading: '#7C2D12',
        body: '#78716C',
        muted: '#A8A29E'
      },
      button: {
        primary: '#F97316',
        hover: '#EA580C'
      }
    }
  },
  {
    id: 'forest',
    name: '🌿 Forest Green',
    description: 'Natural greens and earth tones',
    colors: {
      primary: '#10B981',
      secondary: '#84CC16',
      accent: '#F59E0B',
      background: {
        light: '#F0FDF4',
        dark: '#14532D'
      },
      text: {
        heading: '#14532D',
        body: '#57534E',
        muted: '#A8A29E'
      },
      button: {
        primary: '#10B981',
        hover: '#059669'
      }
    }
  },
  {
    id: 'midnight',
    name: '🌙 Midnight Dark',
    description: 'Sophisticated dark theme',
    colors: {
      primary: '#8B5CF6',
      secondary: '#3B82F6',
      accent: '#EC4899',
      background: {
        light: '#1F2937',
        dark: '#030712'
      },
      text: {
        heading: '#F9FAFB',
        body: '#D1D5DB',
        muted: '#9CA3AF'
      },
      button: {
        primary: '#8B5CF6',
        hover: '#7C3AED'
      }
    }
  },
  {
    id: 'candy',
    name: '🍭 Candy Pop',
    description: 'Playful pastels and bright accents',
    colors: {
      primary: '#EC4899',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      background: {
        light: '#FDF2F8',
        dark: '#831843'
      },
      text: {
        heading: '#831843',
        body: '#6B7280',
        muted: '#D1D5DB'
      },
      button: {
        primary: '#EC4899',
        hover: '#DB2777'
      }
    }
  },
  {
    id: 'monochrome',
    name: '⚫ Monochrome',
    description: 'Classic black and white',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#000000',
      background: {
        light: '#FFFFFF',
        dark: '#000000'
      },
      text: {
        heading: '#000000',
        body: '#374151',
        muted: '#9CA3AF'
      },
      button: {
        primary: '#000000',
        hover: '#374151'
      }
    }
  },
  {
    id: 'custom',
    name: '🎨 Custom',
    description: 'Create your own color scheme',
    colors: null // Allow manual color input
  }
];

// Font Families
export const FONT_FAMILIES: FontFamily[] = [
  {
    id: 'inter',
    name: 'Inter',
    category: 'sans-serif',
    stack: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    weights: [400, 500, 600, 700, 800],
    googleFont: 'Inter:wght@400;500;600;700;800',
    preview: 'Modern and clean'
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'serif',
    stack: '"Playfair Display", Georgia, serif',
    weights: [400, 700, 900],
    googleFont: 'Playfair+Display:wght@400;700;900',
    preview: 'Elegant and sophisticated'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'sans-serif',
    stack: '"Montserrat", "Helvetica Neue", sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    googleFont: 'Montserrat:wght@300;400;500;600;700;800',
    preview: 'Bold and impactful'
  },
  {
    id: 'opensans',
    name: 'Open Sans',
    category: 'sans-serif',
    stack: '"Open Sans", Arial, sans-serif',
    weights: [400, 600, 700],
    googleFont: 'Open+Sans:wght@400;600;700',
    preview: 'Friendly and readable'
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    stack: '"Merriweather", "Times New Roman", serif',
    weights: [300, 400, 700, 900],
    googleFont: 'Merriweather:wght@300;400;700;900',
    preview: 'Traditional and trustworthy'
  },
  {
    id: 'raleway',
    name: 'Raleway',
    category: 'sans-serif',
    stack: '"Raleway", "Century Gothic", sans-serif',
    weights: [300, 400, 500, 600, 700],
    googleFont: 'Raleway:wght@300;400;500;600;700',
    preview: 'Stylish and minimal'
  },
  {
    id: 'spacemono',
    name: 'Space Mono',
    category: 'monospace',
    stack: '"Space Mono", "Courier New", monospace',
    weights: [400, 700],
    googleFont: 'Space+Mono:wght@400;700',
    preview: 'Technical and unique'
  }
];

// Font Pairings
export const RECOMMENDED_PAIRINGS: Record<string, FontPairing> = {
  modern: {
    heading: 'montserrat',
    body: 'inter'
  },
  classic: {
    heading: 'playfair',
    body: 'merriweather'
  },
  clean: {
    heading: 'raleway',
    body: 'opensans'
  },
  tech: {
    heading: 'spacemono',
    body: 'inter'
  }
};

// Emoji Categories
export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'popular',
    name: 'Frequently Used',
    icon: '⭐',
    emojis: ['🚀', '💡', '🎯', '✨', '🔥', '💪', '⭐', '📈', '🏆', '💎']
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    emojis: ['💼', '📊', '📈', '📉', '💰', '💳', '🏢', '🏭', '💹', '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📧', '📮', '📬', '📭', '📦']
  },
  {
    id: 'emotions',
    name: 'Emotions',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😊', '😇', '🥰', '😍', '🤩', '😘', '😎', '🤓', '🧐', '🤔', '😮', '😲', '😳', '🥺', '😢', '😭']
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '💡',
    emojis: ['💡', '🔦', '🕯️', '💰', '💎', '⚡', '🔋', '🔌', '🎁', '🎈', '🎉', '🎊', '🎯', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️']
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '✅',
    emojis: ['✅', '✔️', '☑️', '✖️', '❌', '❗', '❓', '❔', '❕', '‼️', '⚠️', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤']
  },
  {
    id: 'arrows',
    name: 'Arrows',
    icon: '➡️',
    emojis: ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔄', '🔃', '🔁', '🔂', '▶️', '⏸️']
  }
];

// Text Style Presets
export const TEXT_STYLE_PRESETS: Record<string, Partial<TextStyle>> = {
  heroHeading: {
    fontSize: '3xl',
    fontWeight: 800,
    lineHeight: 'tight',
    letterSpacing: 'tight',
    textTransform: 'none'
  },
  sectionHeading: {
    fontSize: '2xl',
    fontWeight: 700,
    lineHeight: 'snug',
    letterSpacing: 'normal',
    textTransform: 'none'
  },
  bodyText: {
    fontSize: 'md',
    fontWeight: 400,
    lineHeight: 'relaxed',
    letterSpacing: 'normal',
    textTransform: 'none'
  },
  caption: {
    fontSize: 'sm',
    fontWeight: 500,
    lineHeight: 'normal',
    letterSpacing: 'wide',
    textTransform: 'uppercase'
  }
};

// Button Presets
export const BUTTON_PRESETS: ButtonPreset[] = [
  {
    name: 'Primary CTA',
    style: {
      variant: 'solid',
      size: 'lg',
      borderRadius: 'md',
      shadow: 'lg',
      animation: 'pulse'
    }
  },
  {
    name: 'Secondary Action',
    style: {
      variant: 'outline',
      size: 'md',
      borderRadius: 'md',
      shadow: 'none',
      animation: 'none'
    }
  },
  {
    name: 'Text Link',
    style: {
      variant: 'ghost',
      size: 'md',
      borderRadius: 'none',
      shadow: 'none',
      animation: 'none'
    }
  },
  {
    name: 'Premium',
    style: {
      variant: 'gradient',
      size: 'lg',
      borderRadius: 'full',
      shadow: 'xl',
      animation: 'scale'
    }
  },
  {
    name: 'Modern Glass',
    style: {
      variant: 'glass',
      size: 'md',
      borderRadius: 'lg',
      shadow: 'md',
      animation: 'none'
    }
  }
];

// Button Variants CSS
export const BUTTON_VARIANTS = {
  solid: {
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    hover: {
      background: 'var(--button-hover)',
      transform: 'translateY(-2px)'
    }
  },
  outline: {
    background: 'transparent',
    color: 'var(--button-primary)',
    border: '2px solid var(--button-primary)',
    hover: {
      background: 'var(--button-primary)',
      color: 'white'
    }
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: 'none',
    hover: {
      background: 'rgba(0,0,0,0.05)',
      color: 'var(--button-primary)'
    }
  },
  gradient: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    border: 'none',
    hover: {
      background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
      transform: 'scale(1.05)'
    }
  },
  glass: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    color: 'var(--text-primary)',
    border: '1px solid rgba(255,255,255,0.2)',
    hover: {
      background: 'rgba(255,255,255,0.2)',
      transform: 'translateY(-2px)'
    }
  }
};

// Font Size Mappings
export const FONT_SIZE_MAPPINGS = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px'
};

// Line Height Mappings
export const LINE_HEIGHT_MAPPINGS = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2'
};

// Letter Spacing Mappings
export const LETTER_SPACING_MAPPINGS = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
};