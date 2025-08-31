import { PageState } from '@/types/builder.types';
import { ColorPreset } from '@/types/design.types';

// Migration version for enhanced design system
export const ENHANCED_DESIGN_VERSION = 2;

// Check if page needs enhanced design migration
export const needsEnhancedDesignMigration = (page: any): boolean => {
  // Check if page has the new enhanced design properties
  const hasColorPreset = page.globalStyles?.colorPreset !== undefined;
  const hasFontSettings = page.globalStyles?.fontSettings !== undefined;
  const hasRecentEmojis = page.globalStyles?.recentEmojis !== undefined;
  
  return !hasColorPreset || !hasFontSettings || !hasRecentEmojis;
};

// Migrate color schemes to color presets
export const migrateColorsToPreset = (globalStyles: any): { 
  colorPreset: string; 
  customColors: ColorPreset['colors'] | null;
} => {
  const primaryColor = globalStyles.primaryColor || '#3b82f6';
  const secondaryColor = globalStyles.secondaryColor || '#10b981';

  // Try to match with existing presets
  if (primaryColor === '#0EA5E9' && secondaryColor === '#06B6D4') {
    return { colorPreset: 'ocean', customColors: null };
  }
  if (primaryColor === '#F97316' && secondaryColor === '#EC4899') {
    return { colorPreset: 'sunset', customColors: null };
  }
  if (primaryColor === '#10B981' && secondaryColor === '#84CC16') {
    return { colorPreset: 'forest', customColors: null };
  }
  if (primaryColor === '#8B5CF6' && secondaryColor === '#3B82F6') {
    return { colorPreset: 'midnight', customColors: null };
  }
  if (primaryColor === '#EC4899' && secondaryColor === '#06B6D4') {
    return { colorPreset: 'candy', customColors: null };
  }
  if (primaryColor === '#000000' && secondaryColor === '#6B7280') {
    return { colorPreset: 'monochrome', customColors: null };
  }

  // Create custom preset from legacy colors
  return {
    colorPreset: 'custom',
    customColors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: secondaryColor, // Use secondary as accent fallback
      background: {
        light: '#FFFFFF',
        dark: '#1F2937'
      },
      text: {
        heading: '#1F2937',
        body: '#4B5563',
        muted: '#9CA3AF'
      },
      button: {
        primary: primaryColor,
        hover: adjustBrightness(primaryColor, -0.1)
      }
    }
  };
};

// Migrate font family to font settings
export const migrateFontToSettings = (fontFamily: string): {
  heading: string;
  body: string;
} => {
  const fontMap: Record<string, { heading: string; body: string }> = {
    'modern': { heading: 'inter', body: 'inter' },
    'classic': { heading: 'playfair', body: 'merriweather' },
    'playful': { heading: 'montserrat', body: 'opensans' }
  };

  return fontMap[fontFamily] || { heading: 'inter', body: 'inter' };
};

// Migrate entire page to enhanced design system
export const migratePageToEnhancedDesign = (page: any): PageState => {
  if (!needsEnhancedDesignMigration(page)) {
    return page as PageState;
  }

  console.log('Migrating page to enhanced design system...');

  const { colorPreset, customColors } = migrateColorsToPreset(page.globalStyles || {});
  const fontSettings = migrateFontToSettings(page.globalStyles?.fontFamily || 'modern');

  const migratedPage: PageState = {
    ...page,
    globalStyles: {
      ...page.globalStyles,
      primaryColor: page.globalStyles?.primaryColor || '#3b82f6',
      secondaryColor: page.globalStyles?.secondaryColor || '#10b981',
      fontFamily: page.globalStyles?.fontFamily || 'modern',
      // Enhanced design properties
      colorPreset,
      customColors,
      fontSettings,
      recentEmojis: []
    }
  };

  return migratedPage;
};

// Utility function to adjust color brightness
function adjustBrightness(hex: string, amount: number): string {
  const usePound = hex[0] === '#';
  const color = hex.slice(usePound ? 1 : 0);
  
  const num = parseInt(color, 16);
  let r = (num >> 16) + Math.round(255 * amount);
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * amount);
  let b = (num & 0x0000FF) + Math.round(255 * amount);
  
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Migration for section-specific styles
export const migrateSectionStyles = (section: any): any => {
  // Add default text and button styles if they don't exist
  const migratedSection = { ...section };
  
  if (!migratedSection.data.textStyle) {
    migratedSection.data.textStyle = {
      fontFamily: 'inter',
      fontSize: 'md',
      fontWeight: 400,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textDecoration: 'none',
      textTransform: 'none',
      fontStyle: 'normal',
      textAlign: 'left'
    };
  }
  
  if ((section.type === 'hero' || section.type === 'cta') && !migratedSection.data.buttonStyle) {
    migratedSection.data.buttonStyle = {
      variant: 'solid',
      size: 'md',
      borderRadius: 'md',
      shadow: 'none',
      animation: 'none'
    };
  }
  
  return migratedSection;
};

// Complete migration function
export const performEnhancedDesignMigration = (data: any): PageState => {
  let migratedPage = migratePageToEnhancedDesign(data);
  
  // Migrate sections
  if (migratedPage.sections) {
    migratedPage.sections = migratedPage.sections.map(migrateSectionStyles);
  }
  
  return migratedPage;
};

// Check migration status
export const getEnhancedDesignMigrationStatus = (page: PageState): {
  isUpToDate: boolean;
  missingFeatures: string[];
} => {
  const missingFeatures: string[] = [];
  
  if (!page.globalStyles.colorPreset) {
    missingFeatures.push('Color Presets');
  }
  
  if (!page.globalStyles.fontSettings) {
    missingFeatures.push('Enhanced Typography');
  }
  
  if (!page.globalStyles.recentEmojis) {
    missingFeatures.push('Emoji System');
  }
  
  // Check sections for enhanced styles
  const sectionsNeedingMigration = page.sections.filter(section => {
    const hasTextStyle = (section.data as any).textStyle;
    const hasButtonStyle = (section.type === 'hero' || section.type === 'cta') && (section.data as any).buttonStyle;
    
    if (!hasTextStyle) return true;
    if ((section.type === 'hero' || section.type === 'cta') && !hasButtonStyle) return true;
    
    return false;
  });
  
  if (sectionsNeedingMigration.length > 0) {
    missingFeatures.push(`Section Styles (${sectionsNeedingMigration.length} sections)`);
  }
  
  return {
    isUpToDate: missingFeatures.length === 0,
    missingFeatures
  };
};