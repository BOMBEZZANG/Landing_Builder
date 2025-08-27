import { create } from 'zustand';
import { Section, PageState, BuilderState, DeviceType } from '@/types/builder.types';

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
    fontFamily: 'modern'
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

    // Actions implementation
    initializePage: () => {
      try {
        const saved = localStorage.getItem('builder-draft');
        if (saved) {
          const parsed = JSON.parse(saved);
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
          const parsed = JSON.parse(saved);
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