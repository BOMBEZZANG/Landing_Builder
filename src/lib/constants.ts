export const SECTION_TYPES = {
  HERO: 'hero',
  CONTENT: 'content',
  CTA: 'cta'
} as const;

export const BACKGROUND_TYPES = {
  COLOR: 'color',
  IMAGE: 'image',
  GRADIENT: 'gradient'
} as const;

export const BUTTON_ACTIONS = {
  SCROLL: 'scroll',
  FORM: 'form',
  LINK: 'link'
} as const;

export const ALIGNMENTS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
} as const;

export const IMAGE_POSITIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
} as const;

export const PADDING_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

export const FONT_FAMILIES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  PLAYFUL: 'playful'
} as const;

// Default gradients
export const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
];

// Color presets
export const COLOR_PRESETS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#000000', // Black
  '#ffffff'  // White
];

// Animation presets
export const ANIMATION_PRESETS = [
  { name: 'None', value: 'none' },
  { name: 'Fade In', value: 'fadeIn' },
  { name: 'Slide Up', value: 'slideUp' },
  { name: 'Slide Left', value: 'slideLeft' },
  { name: 'Scale In', value: 'scaleIn' }
];

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Maximum file sizes
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  ICON: 1 * 1024 * 1024   // 1MB
};

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml'
];

// Builder settings
export const BUILDER_SETTINGS = {
  AUTO_SAVE_INTERVAL: 10000, // 10 seconds
  CANVAS_MAX_WIDTH: 1200,
  CANVAS_MIN_WIDTH: 320,
  PROPERTY_PANEL_WIDTH: 320,
  SECTION_LIST_WIDTH: 256
};