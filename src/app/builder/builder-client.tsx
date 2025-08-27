'use client';

import React, { useEffect, useState } from 'react';
import { useBuilderStore, startAutoSave, stopAutoSave } from '@/store/builderStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Template } from '@/types/template.types';
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
    hasUnsavedChanges,
    canUndo,
    canRedo,
    initializePage,
    loadTemplate,
    updateSection,
    reorderSections,
    selectSection,
    togglePreview,
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

  const handleUpdateSection = (sectionId: string, updates: any) => {
    updateSection(sectionId, updates);
  };

  const handleSelectTemplate = (template: Template) => {
    loadTemplate(template.page);
    setShowTemplateSelector(false);
  };

  const handleSaveTemplate = (templateId: string) => {
    setShowSaveTemplate(false);
    // Could show a success message here
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
      hasUnsavedChanges={hasUnsavedChanges}
      isPreviewMode={isPreviewMode}
      canUndo={canUndo}
      canRedo={canRedo}
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