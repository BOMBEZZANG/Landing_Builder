import { create } from 'zustand';
import { Section, PageState, BuilderState } from '@/types/builder.types';
import { v4 as uuidv4 } from 'uuid';

interface BuilderStore extends BuilderState {
  // Actions
  initializePage: () => void;
  updateSection: (sectionId: string, updates: Partial<Section['data']>) => void;
  reorderSections: (newOrder: string[]) => void;
  selectSection: (sectionId: string | null) => void;
  togglePreview: () => void;
  updateGlobalStyles: (styles: Partial<PageState['globalStyles']>) => void;
  updateMetadata: (metadata: Partial<PageState['metadata']>) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  resetPage: () => void;
}

const defaultSections: Section[] = [
  {
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
      recipientEmail: '',
      backgroundColor: '#f3f4f6',
      textColor: '#1f2937',
      buttonColor: '#3b82f6'
    }
  }
];

const createDefaultPage = (): PageState => ({
  id: uuidv4(),
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

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  // Initial state
  page: createDefaultPage(),
  selectedSectionId: null,
  isPreviewMode: false,
  isDragging: false,
  hasUnsavedChanges: false,

  // Actions implementation
  initializePage: () => {
    try {
      const saved = localStorage.getItem('builder-draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ page: parsed, hasUnsavedChanges: false });
      }
    } catch (error) {
      console.error('Failed to load saved page:', error);
      // Keep default page if loading fails
    }
  },

  updateSection: (sectionId, updates) => {
    set((state) => {
      const updatedSections = state.page.sections.map((section) =>
        section.id === sectionId
          ? { ...section, data: { ...section.data, ...updates } as any }
          : section
      );
      
      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections
        },
        hasUnsavedChanges: true
      };
    });
  },

  reorderSections: (newOrder) => {
    set((state) => {
      const reorderedSections = newOrder.map((id, index) => {
        const section = state.page.sections.find(s => s.id === id);
        return section ? { ...section, order: index } : null;
      }).filter(Boolean) as Section[];

      return {
        page: {
          ...state.page,
          sections: reorderedSections
        },
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

  updateGlobalStyles: (styles) => {
    set((state) => ({
      page: {
        ...state.page,
        globalStyles: { ...state.page.globalStyles, ...styles }
      },
      hasUnsavedChanges: true
    }));
  },

  updateMetadata: (metadata) => {
    set((state) => ({
      page: {
        ...state.page,
        metadata: { ...state.page.metadata, ...metadata }
      },
      hasUnsavedChanges: true
    }));
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
        set({ page: parsed, hasUnsavedChanges: false });
      }
    } catch (error) {
      console.error('Failed to load saved page:', error);
    }
  },

  resetPage: () => {
    set({
      page: createDefaultPage(),
      selectedSectionId: null,
      isPreviewMode: false,
      hasUnsavedChanges: false
    });
  }
}));

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