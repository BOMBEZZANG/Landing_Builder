// Section Types
export type SectionType = 'hero' | 'content' | 'cta';

export interface BaseSection {
  id: string;
  type: SectionType;
  order: number;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  data: {
    headline: string;
    subheadline: string;
    buttonText: string;
    buttonAction: 'scroll' | 'form' | 'link';
    backgroundType: 'color' | 'image' | 'gradient';
    backgroundColor: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    textColor: string;
    buttonColor: string;
    alignment: 'left' | 'center' | 'right';
  };
}

export interface ContentSection extends BaseSection {
  type: 'content';
  data: {
    title: string;
    content: string;
    imageUrl?: string;
    imagePublicId?: string;
    imagePosition: 'left' | 'right' | 'top' | 'bottom';
    backgroundColor: string;
    textColor: string;
    padding: 'small' | 'medium' | 'large';
  };
}

export interface CTASection extends BaseSection {
  type: 'cta';
  data: {
    title: string;
    description: string;
    formEnabled: boolean;
    formFields: {
      name: boolean;
      email: boolean;
      phone: boolean;
    };
    buttonText: string;
    recipientEmail: string;
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
  };
}

export type Section = HeroSection | ContentSection | CTASection;

// Page State
export interface PageState {
  id: string;
  title: string;
  sections: Section[];
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: 'modern' | 'classic' | 'playful';
  };
  metadata: {
    description: string;
    favicon?: string;
  };
}

// Builder State
export interface BuilderState {
  page: PageState;
  selectedSectionId: string | null;
  isPreviewMode: boolean;
  isDragging: boolean;
  hasUnsavedChanges: boolean;
}

// UI Component Props
export interface SectionWrapperProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

export interface PropertyPanelProps {
  selectedSection: Section | null;
  onUpdateSection: (updates: Partial<Section['data']>) => void;
}

export interface CanvasProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
}

export interface ToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  hasUnsavedChanges: boolean;
  isPreviewMode: boolean;
}

// Color Schemes
export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  { name: 'Professional', primary: '#1e3a8a', secondary: '#fbbf24' },
  { name: 'Modern', primary: '#000000', secondary: '#10b981' },
  { name: 'Friendly', primary: '#3b82f6', secondary: '#fb923c' },
  { name: 'Elegant', primary: '#7c3aed', secondary: '#ec4899' },
  { name: 'Natural', primary: '#059669', secondary: '#92400e' },
];

// Font Options
export interface FontOption {
  name: string;
  value: 'modern' | 'classic' | 'playful';
  fontFamily: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Modern', value: 'modern', fontFamily: 'Inter, sans-serif' },
  { name: 'Classic', value: 'classic', fontFamily: 'Georgia, serif' },
  { name: 'Playful', value: 'playful', fontFamily: 'Comic Sans MS, cursive' },
];

// Padding Options
export interface PaddingOption {
  name: string;
  value: 'small' | 'medium' | 'large';
  className: string;
}

export const PADDING_OPTIONS: PaddingOption[] = [
  { name: 'Small', value: 'small', className: 'py-8' },
  { name: 'Medium', value: 'medium', className: 'py-16' },
  { name: 'Large', value: 'large', className: 'py-24' },
];