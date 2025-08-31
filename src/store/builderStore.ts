import { create } from 'zustand';
import { Section, PageState, BuilderState, DeviceType, TextContentSection, ImageContentSection } from '@/types/builder.types';
import { TextStyle, ButtonStyle } from '@/types/design.types';
import { migrateSections, needsMigration } from '@/utils/migration';
import { needsEnhancedDesignMigration, performEnhancedDesignMigration } from '@/utils/design-migration';

interface HistoryState {
  past: PageState[];
  present: PageState;
  future: PageState[];
}

interface BuilderStore extends BuilderState {
  // History state
  history: HistoryState;
  canUndo: boolean;
  canRedo: boolean;
  
  // New computed properties
  contentSectionsCount: number;
  canAddMoreSections: boolean;
  
  // Actions
  initializePage: () => void;
  loadTemplate: (page: PageState) => void;
  updateSection: (sectionId: string, updates: Partial<Section['data']>) => void;
  reorderSections: (sections: Section[]) => void;
  selectSection: (sectionId: string | null) => void;
  togglePreview: () => void;
  setPreviewDevice: (device: DeviceType) => void;
  updateGlobalStyles: (styles: Partial<PageState['globalStyles']>) => void;
  updateMetadata: (metadata: Partial<PageState['metadata']>) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  resetPage: () => void;
  
  // New actions for dynamic content sections
  addContentSection: (type: 'content-text' | 'content-image') => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  convertSectionType: (sectionId: string, newType: 'content-text' | 'content-image') => void;
  canDeleteSection: (sectionId: string) => boolean;
  
  // Enhanced design system actions
  applyColorPreset: (presetId: string) => void;
  updateCustomColors: (colors: NonNullable<PageState['globalStyles']['customColors']>) => void;
  updateFontSettings: (fonts: Partial<NonNullable<PageState['globalStyles']['fontSettings']>>) => void;
  addRecentEmoji: (emoji: string) => void;
  updateTextStyle: (sectionId: string, style: Partial<TextStyle>) => void;
  updateButtonStyle: (sectionId: string, style: Partial<ButtonStyle>) => void;
}

const defaultSections: Section[] = [
  {
    id: 'hero-default-section',
    type: 'hero',
    order: 0,
    data: {
      headline: 'Welcome to Your Landing Page',
      subheadline: 'Create beautiful pages in minutes with our drag-and-drop builder',
      buttonText: 'Get Started',
      buttonAction: 'scroll',
      backgroundType: 'gradient',
      backgroundColor: '#3b82f6',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      buttonColor: '#10b981',
      alignment: 'center'
    }
  },
  {
    id: 'content-default-section',
    type: 'content',
    order: 1,
    data: {
      title: 'Features That Matter',
      content: 'Build responsive, professional landing pages without any coding knowledge. Our intuitive builder makes it easy to create stunning pages that convert.',
      imagePosition: 'right',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      padding: 'medium'
    }
  },
  {
    id: 'cta-default-section',
    type: 'cta',
    order: 2,
    data: {
      title: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers who have built amazing landing pages',
      formEnabled: true,
      formFields: {
        name: true,
        email: true,
        phone: true
      },
      buttonText: 'Get Started Now',
      // Email recipient settings
      recipientEmail: '',
      emailVerified: false,
      // Optional email settings
      sendCopyToSubmitter: false,
      emailSubject: 'New form submission from your landing page',
      enableGoogleSheets: false,
      googleSheetId: '',
      // Style fields
      backgroundColor: '#f3f4f6',
      textColor: '#1f2937',
      buttonColor: '#3b82f6'
    }
  }
];

const createDefaultPage = (): PageState => ({
  id: 'default-page',
  title: 'Untitled Landing Page',
  sections: defaultSections,
  globalStyles: {
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    fontFamily: 'modern',
    // Enhanced design defaults
    colorPreset: 'ocean',
    customColors: null,
    fontSettings: {
      heading: 'inter',
      body: 'inter'
    },
    recentEmojis: []
  },
  metadata: {
    description: 'A beautiful landing page created with our builder'
  }
});

// Helper function to deep clone page state
const clonePage = (page: PageState): PageState => JSON.parse(JSON.stringify(page));

// Helper function to create initial history state
const createInitialHistory = (page: PageState): HistoryState => ({
  past: [],
  present: clonePage(page),
  future: []
});

// Helper function to limit history size
const MAX_HISTORY_SIZE = 50;
const limitHistory = (history: PageState[]): PageState[] => {
  if (history.length > MAX_HISTORY_SIZE) {
    return history.slice(-MAX_HISTORY_SIZE);
  }
  return history;
};

// Helper function to generate unique ID
const generateSectionId = (type: string) => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to create new content sections
const createContentSection = (type: 'content-text' | 'content-image', order: number): TextContentSection | ImageContentSection => {
  const baseData = {
    title: 'New Content Section',
    content: 'Add your content here. Click to edit this text and make it your own.',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    padding: 'medium' as const
  };

  if (type === 'content-text') {
    return {
      id: generateSectionId('content-text'),
      type: 'content-text',
      order,
      data: {
        ...baseData,
        backgroundType: 'color',
        textAlignment: 'left'
      }
    } as TextContentSection;
  } else {
    return {
      id: generateSectionId('content-image'),
      type: 'content-image',
      order,
      data: {
        ...baseData,
        imageUrl: '',
        imagePosition: 'right',
        imageSize: 'medium'
      }
    } as ImageContentSection;
  }
};

// Constants for section limits
const MAX_CONTENT_SECTIONS = 10;
const MAX_IMAGE_SECTIONS = 5;

export const useBuilderStore = create<BuilderStore>((set, get) => {
  const defaultPage = createDefaultPage();
  
  return {
    // Initial state
    page: defaultPage,
    selectedSectionId: null,
    isPreviewMode: false,
    previewDevice: 'desktop',
    isDragging: false,
    hasUnsavedChanges: false,
    history: createInitialHistory(defaultPage),
    canUndo: false,
    canRedo: false,
    
    // Computed properties
    get contentSectionsCount() {
      const state = get();
      return state.page.sections.filter(s => 
        s.type === 'content' || s.type === 'content-text' || s.type === 'content-image'
      ).length;
    },
    
    get canAddMoreSections() {
      const state = get();
      const contentCount = state.contentSectionsCount;
      const imageCount = state.page.sections.filter(s => s.type === 'content-image').length;
      return contentCount < MAX_CONTENT_SECTIONS && imageCount < MAX_IMAGE_SECTIONS;
    },

    // Actions implementation
    initializePage: () => {
      try {
        const saved = localStorage.getItem('builder-draft');
        if (saved) {
          let parsed = JSON.parse(saved);
          
          // Check if sections migration is needed
          if (parsed.sections && needsMigration(parsed.sections)) {
            parsed = {
              ...parsed,
              sections: migrateSections(parsed.sections)
            };
            console.log('Migrated saved page to new section format');
          }
          
          // Check if enhanced design migration is needed
          if (needsEnhancedDesignMigration(parsed)) {
            parsed = performEnhancedDesignMigration(parsed);
            console.log('Migrated saved page to enhanced design system');
          }
          
          // Save migrated version
          localStorage.setItem('builder-draft', JSON.stringify(parsed));
          
          set((state) => ({
            page: parsed,
            history: createInitialHistory(parsed),
            canUndo: false,
            canRedo: false,
            hasUnsavedChanges: false
          }));
        }
      } catch (error) {
        console.error('Failed to load saved page:', error);
        // Keep default page if loading fails
      }
    },

    loadTemplate: (page) => {
      const loadedPage = clonePage(page);
      set((state) => ({
        page: loadedPage,
        history: createInitialHistory(loadedPage),
        canUndo: false,
        canRedo: false,
        selectedSectionId: null,
        isPreviewMode: false,
        hasUnsavedChanges: true
      }));
    },

    saveToHistory: () => {
      set((state) => {
        const newHistory: HistoryState = {
          past: limitHistory([...state.history.past, clonePage(state.history.present)]),
          present: clonePage(state.page),
          future: []
        };
        
        return {
          history: newHistory,
          canUndo: newHistory.past.length > 0,
          canRedo: false
        };
      });
    },

    undo: () => {
      set((state) => {
        if (state.history.past.length === 0) return state;
        
        const previous = state.history.past[state.history.past.length - 1];
        const newPast = state.history.past.slice(0, -1);
        
        const newHistory: HistoryState = {
          past: newPast,
          present: clonePage(previous),
          future: [clonePage(state.history.present), ...state.history.future]
        };
        
        return {
          page: previous,
          history: newHistory,
          canUndo: newPast.length > 0,
          canRedo: true,
          hasUnsavedChanges: true,
          selectedSectionId: null // Clear selection on undo
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.history.future.length === 0) return state;
        
        const next = state.history.future[0];
        const newFuture = state.history.future.slice(1);
        
        const newHistory: HistoryState = {
          past: [...state.history.past, clonePage(state.history.present)],
          present: clonePage(next),
          future: newFuture
        };
        
        return {
          page: next,
          history: newHistory,
          canUndo: true,
          canRedo: newFuture.length > 0,
          hasUnsavedChanges: true,
          selectedSectionId: null // Clear selection on redo
        };
      });
    },

    updateSection: (sectionId, updates) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const updatedSections = state.page.sections.map((section) => {
          if (section.id === sectionId) {
            // Special handling for email verification reset on email change
            if ('recipientEmail' in updates && section.type === 'cta') {
              const currentEmail = (section.data as any).recipientEmail;
              const newEmail = updates.recipientEmail;
              
              if (currentEmail !== newEmail) {
                return {
                  ...section,
                  data: {
                    ...section.data,
                    ...updates,
                    emailVerified: false // Reset verification when email changes
                  } as any
                };
              }
            }
            return {
              ...section,
              data: { ...section.data, ...updates } as any
            };
          }
          return section;
        });
        
        const newPage = {
          ...state.page,
          sections: updatedSections
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },

    reorderSections: (sections) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const newPage = {
          ...state.page,
          sections: sections
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },

    selectSection: (sectionId) => {
      set({ selectedSectionId: sectionId });
    },

    togglePreview: () => {
      set((state) => ({ 
        isPreviewMode: !state.isPreviewMode,
        selectedSectionId: state.isPreviewMode ? state.selectedSectionId : null
      }));
    },

    setPreviewDevice: (device) => {
      set({ previewDevice: device });
    },

    updateGlobalStyles: (styles) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const newPage = {
          ...state.page,
          globalStyles: { ...state.page.globalStyles, ...styles }
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },

    updateMetadata: (metadata) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const newPage = {
          ...state.page,
          metadata: { ...state.page.metadata, ...metadata }
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },

    saveToLocalStorage: () => {
      try {
        const state = get();
        localStorage.setItem('builder-draft', JSON.stringify(state.page));
        set({ hasUnsavedChanges: false });
      } catch (error) {
        console.error('Failed to save page:', error);
      }
    },

    loadFromLocalStorage: () => {
      try {
        const saved = localStorage.getItem('builder-draft');
        if (saved) {
          let parsed = JSON.parse(saved);
          
          // Check if sections migration is needed
          if (parsed.sections && needsMigration(parsed.sections)) {
            parsed = {
              ...parsed,
              sections: migrateSections(parsed.sections)
            };
            console.log('Migrated saved page to new section format');
          }
          
          // Check if enhanced design migration is needed
          if (needsEnhancedDesignMigration(parsed)) {
            parsed = performEnhancedDesignMigration(parsed);
            console.log('Migrated saved page to enhanced design system');
          }
          
          // Save migrated version
          localStorage.setItem('builder-draft', JSON.stringify(parsed));
          
          set((state) => ({
            page: parsed,
            history: createInitialHistory(parsed),
            canUndo: false,
            canRedo: false,
            hasUnsavedChanges: false
          }));
        }
      } catch (error) {
        console.error('Failed to load saved page:', error);
      }
    },

    resetPage: () => {
      const newPage = createDefaultPage();
      set({
        page: newPage,
        history: createInitialHistory(newPage),
        canUndo: false,
        canRedo: false,
        selectedSectionId: null,
        isPreviewMode: false,
        hasUnsavedChanges: false
      });
    },
    
    // New action implementations
    addContentSection: (type) => {
      const state = get();
      
      // Check limits
      if (!state.canAddMoreSections) {
        console.warn('Cannot add more sections: limit reached');
        return;
      }
      
      if (type === 'content-image') {
        const imageCount = state.page.sections.filter(s => s.type === 'content-image').length;
        if (imageCount >= MAX_IMAGE_SECTIONS) {
          console.warn('Cannot add more image sections: limit reached');
          return;
        }
      }
      
      // Save to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const sections = [...state.page.sections];
        // Find the position to insert (before CTA section)
        const ctaIndex = sections.findIndex(s => s.type === 'cta');
        const insertIndex = ctaIndex !== -1 ? ctaIndex : sections.length;
        
        // Create new section with proper order
        const newSection = createContentSection(type, insertIndex);
        
        // Insert the new section and update orders
        sections.splice(insertIndex, 0, newSection);
        sections.forEach((section, index) => {
          section.order = index;
        });
        
        const newPage = {
          ...state.page,
          sections
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true,
          selectedSectionId: newSection.id
        };
      });
    },
    
    deleteSection: (sectionId) => {
      const state = get();
      const section = state.page.sections.find(s => s.id === sectionId);
      
      // Prevent deletion of hero and CTA sections
      if (!section || section.type === 'hero' || section.type === 'cta') {
        console.warn('Cannot delete this section');
        return;
      }
      
      // Save to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const sections = state.page.sections
          .filter(s => s.id !== sectionId)
          .map((section, index) => ({ ...section, order: index }));
        
        const newPage = {
          ...state.page,
          sections
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true,
          selectedSectionId: null
        };
      });
    },
    
    duplicateSection: (sectionId) => {
      const state = get();
      const section = state.page.sections.find(s => s.id === sectionId);
      
      if (!section || section.type === 'hero' || section.type === 'cta') {
        console.warn('Cannot duplicate this section');
        return;
      }
      
      // Check limits
      if (!state.canAddMoreSections) {
        console.warn('Cannot add more sections: limit reached');
        return;
      }
      
      // Save to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const sections = [...state.page.sections];
        const originalIndex = sections.findIndex(s => s.id === sectionId);
        
        if (originalIndex === -1) return state;
        
        // Create a duplicate with new ID
        const duplicatedSection = {
          ...clonePage(sections[originalIndex]),
          id: generateSectionId(sections[originalIndex].type),
          order: originalIndex + 1
        };
        
        // Insert after the original section
        sections.splice(originalIndex + 1, 0, duplicatedSection);
        
        // Update orders
        sections.forEach((section, index) => {
          section.order = index;
        });
        
        const newPage = {
          ...state.page,
          sections
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true,
          selectedSectionId: duplicatedSection.id
        };
      });
    },
    
    convertSectionType: (sectionId, newType) => {
      const state = get();
      const section = state.page.sections.find(s => s.id === sectionId);
      
      if (!section || (section.type !== 'content-text' && section.type !== 'content-image')) {
        console.warn('Cannot convert this section type');
        return;
      }
      
      // Save to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const sections = state.page.sections.map(s => {
          if (s.id === sectionId) {
            const baseData = {
              title: (s.data as any).title || 'Content Section',
              content: (s.data as any).content || '',
              backgroundColor: (s.data as any).backgroundColor || '#ffffff',
              textColor: (s.data as any).textColor || '#1f2937',
              padding: (s.data as any).padding || 'medium'
            };
            
            if (newType === 'content-text') {
              return {
                ...s,
                type: 'content-text',
                data: {
                  ...baseData,
                  backgroundType: 'color',
                  textAlignment: 'left'
                }
              } as TextContentSection;
            } else {
              return {
                ...s,
                type: 'content-image',
                data: {
                  ...baseData,
                  imageUrl: (s.data as any).imageUrl || '',
                  imagePublicId: (s.data as any).imagePublicId,
                  imagePosition: (s.data as any).imagePosition || 'right',
                  imageSize: 'medium'
                }
              } as ImageContentSection;
            }
          }
          return s;
        });
        
        const newPage = {
          ...state.page,
          sections
        };
        
        const newHistory: HistoryState = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },
    
    canDeleteSection: (sectionId) => {
      const state = get();
      const section = state.page.sections.find(s => s.id === sectionId);
      return section ? section.type !== 'hero' && section.type !== 'cta' : false;
    },
    
    // Enhanced design system action implementations
    applyColorPreset: (presetId) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const newGlobalStyles = {
          ...state.page.globalStyles,
          colorPreset: presetId,
          customColors: presetId === 'custom' ? state.page.globalStyles.customColors : null
        };
        
        const newPage = {
          ...state.page,
          globalStyles: newGlobalStyles
        };
        
        const newHistory = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },
    
    updateCustomColors: (colors) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const newGlobalStyles = {
          ...state.page.globalStyles,
          colorPreset: 'custom',
          customColors: colors
        };
        
        const newPage = {
          ...state.page,
          globalStyles: newGlobalStyles
        };
        
        const newHistory = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },
    
    updateFontSettings: (fonts) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const currentFontSettings = state.page.globalStyles.fontSettings || { heading: 'inter', body: 'inter' };
        const newGlobalStyles = {
          ...state.page.globalStyles,
          fontSettings: { ...currentFontSettings, ...fonts }
        };
        
        const newPage = {
          ...state.page,
          globalStyles: newGlobalStyles
        };
        
        const newHistory = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },
    
    addRecentEmoji: (emoji) => {
      set((state) => {
        const currentEmojis = state.page.globalStyles.recentEmojis || [];
        const newEmojis = [emoji, ...currentEmojis.filter(e => e !== emoji)].slice(0, 10); // Keep only 10 recent emojis
        
        const newGlobalStyles = {
          ...state.page.globalStyles,
          recentEmojis: newEmojis
        };
        
        const newPage = {
          ...state.page,
          globalStyles: newGlobalStyles
        };
        
        return {
          page: newPage,
          hasUnsavedChanges: true
        };
      });
    },
    
    updateTextStyle: (sectionId, style) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const updatedSections = state.page.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              data: {
                ...section.data,
                textStyle: { ...(section.data as any).textStyle, ...style }
              } as any
            };
          }
          return section;
        });
        
        const newPage = {
          ...state.page,
          sections: updatedSections
        };
        
        const newHistory = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    },
    
    updateButtonStyle: (sectionId, style) => {
      // Save current state to history before making changes
      get().saveToHistory();
      
      set((state) => {
        const updatedSections = state.page.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              data: {
                ...section.data,
                buttonStyle: { ...(section.data as any).buttonStyle, ...style }
              } as any
            };
          }
          return section;
        });
        
        const newPage = {
          ...state.page,
          sections: updatedSections
        };
        
        const newHistory = {
          ...state.history,
          present: clonePage(newPage)
        };
        
        return {
          page: newPage,
          history: newHistory,
          hasUnsavedChanges: true
        };
      });
    }
  };
});

// Auto-save functionality
let autoSaveInterval: NodeJS.Timeout;

export const startAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    const state = useBuilderStore.getState();
    if (state.hasUnsavedChanges && !state.isPreviewMode) {
      state.saveToLocalStorage();
    }
  }, 10000); // Auto-save every 10 seconds
};

export const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
};