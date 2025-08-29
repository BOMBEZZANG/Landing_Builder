'use client';

import React, { useEffect, useState } from 'react';
import { useBuilderStore, startAutoSave, stopAutoSave } from '@/store/builderStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Template } from '@/types/template.types';
import { PublishSettings } from '@/types/builder.types';
import BuilderLayout from '@/components/builder/BuilderLayout';
import Toolbar from '@/components/builder/Toolbar';
import SectionList from '@/components/builder/SectionList';
import DraggableCanvas from '@/components/builder/DraggableCanvas';
import PropertyPanel from '@/components/builder/PropertyPanel';
import TemplateSelector from '@/components/templates/TemplateSelector';
import SaveTemplateModal from '@/components/templates/SaveTemplateModal';

export default function BuilderClient() {
  const {
    page,
    selectedSectionId,
    isPreviewMode,
    previewDevice,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    initializePage,
    loadTemplate,
    updateSection,
    reorderSections,
    selectSection,
    togglePreview,
    setPreviewDevice,
    updateGlobalStyles,
    undo,
    redo,
    saveToLocalStorage,
    resetPage
  } = useBuilderStore();

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Initialize page and setup auto-save on mount
  useEffect(() => {
    initializePage();
    startAutoSave();

    // Cleanup auto-save on unmount
    return () => {
      stopAutoSave();
    };
  }, [initializePage]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: saveToLocalStorage,
    onPreview: togglePreview,
    canUndo,
    canRedo,
    disabled: isPreviewMode
  });

  const handleSelectSection = (sectionId: string) => {
    if (sectionId === '') {
      selectSection(null);
    } else {
      selectSection(sectionId);
    }
  };

  const handleUpdateSection = (sectionId: string, updates: Record<string, unknown>) => {
    updateSection(sectionId, updates);
  };

  const handleSelectTemplate = (template: Template) => {
    loadTemplate(template.page);
    setShowTemplateSelector(false);
  };

  const handleSaveTemplate = (_templateId: string) => {
    setShowSaveTemplate(false);
    // Could show a success message here
  };

  const handlePublish = async (settings: PublishSettings) => {
    console.log('Publishing page:', page);
    console.log('Publish settings:', settings);
    
    // Ensure settings object exists with defaults
    const safeSettings = settings || {
      userId: 'user-' + Date.now(),
      enableAnalytics: false,
      enableAdSense: false,
      formService: 'formspree' as const,
      optimizations: {
        minify: true,
        optimizeImages: true,
        includeAnimations: true
      }
    };
    
    try {
      // Call the deploy API endpoint
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: page,
          userId: safeSettings.userId || 'user-' + Date.now(),
          pageId: safeSettings.pageId || generatePageId(page.title),
          options: {
            minify: safeSettings.optimizations?.minify !== false ? true : false,
            inlineCSS: true,
            includeAnalytics: safeSettings.enableAnalytics !== false ? true : false,
            includeAdSense: safeSettings.enableAdSense !== false ? true : false,
            includeMeta: true,
            includeAnimations: safeSettings.optimizations?.includeAnimations !== false ? true : false,
            optimizeImages: safeSettings.optimizations?.optimizeImages !== false ? true : false,
            formService: safeSettings.formService || 'custom'
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Publishing failed');
      }

      if (result.success) {
        console.log('Publishing successful:', result.data);
        // The PublishModal will handle showing the success state
        return result.data;
      } else {
        throw new Error(result.error || 'Publishing failed');
      }
    } catch (error) {
      console.error('Publishing error:', error);
      throw error;
    }
  };
  
  // Helper function to generate page ID
  const generatePageId = (title: string): string => {
    const timestamp = Date.now();
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
    
    return `${cleanTitle}-${timestamp}`;
  };

  const selectedSection = selectedSectionId 
    ? page.sections.find(s => s.id === selectedSectionId) || null
    : null;

  const toolbar = (
    <Toolbar
      onSave={saveToLocalStorage}
      onPreview={togglePreview}
      onReset={resetPage}
      onUndo={undo}
      onRedo={redo}
      onShowTemplates={() => setShowTemplateSelector(true)}
      onSaveTemplate={() => setShowSaveTemplate(true)}
      onPublish={handlePublish}
      hasUnsavedChanges={hasUnsavedChanges}
      isPreviewMode={isPreviewMode}
      previewDevice={previewDevice}
      onSetPreviewDevice={setPreviewDevice}
      canUndo={canUndo}
      canRedo={canRedo}
      page={page}
    />
  );

  const leftPanel = isPreviewMode ? null : (
    <SectionList
      sections={page.sections}
      selectedSectionId={selectedSectionId}
      onSelectSection={handleSelectSection}
    />
  );

  const rightPanel = isPreviewMode ? null : (
    <PropertyPanel
      selectedSection={selectedSection}
      onUpdateSection={(updates) => {
        if (selectedSectionId) {
          handleUpdateSection(selectedSectionId, updates);
        }
      }}
      globalStyles={page.globalStyles}
      onUpdateGlobalStyles={updateGlobalStyles}
    />
  );

  const canvas = (
    <DraggableCanvas
      sections={page.sections}
      selectedSectionId={selectedSectionId}
      onSelectSection={handleSelectSection}
      onUpdateSection={handleUpdateSection}
      onReorderSections={reorderSections}
      isPreviewMode={isPreviewMode}
      previewDevice={previewDevice}
    />
  );

  if (isPreviewMode) {
    // Full-screen preview mode
    return (
      <div className="h-screen flex flex-col">
        <div className="h-14 border-b border-builder-border bg-white shadow-sm">
          {toolbar}
        </div>
        <div className="flex-1 overflow-y-auto">
          {canvas}
        </div>
      </div>
    );
  }

  return (
    <>
      <BuilderLayout
        toolbar={toolbar}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
      >
        {canvas}
      </BuilderLayout>

      {/* Template Modals */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {showSaveTemplate && (
        <SaveTemplateModal
          page={page}
          onSave={handleSaveTemplate}
          onClose={() => setShowSaveTemplate(false)}
        />
      )}
    </>
  );
}