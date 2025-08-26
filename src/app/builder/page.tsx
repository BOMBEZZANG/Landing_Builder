'use client';

import React, { useEffect } from 'react';
import { useBuilderStore, startAutoSave, stopAutoSave } from '@/store/builderStore';
import BuilderLayout from '@/components/builder/BuilderLayout';
import Toolbar from '@/components/builder/Toolbar';
import SectionList from '@/components/builder/SectionList';
import Canvas from '@/components/builder/Canvas';
import PropertyPanel from '@/components/builder/PropertyPanel';

export default function BuilderPage() {
  const {
    page,
    selectedSectionId,
    isPreviewMode,
    hasUnsavedChanges,
    initializePage,
    updateSection,
    selectSection,
    togglePreview,
    updateGlobalStyles,
    saveToLocalStorage,
    resetPage
  } = useBuilderStore();

  // Initialize page and setup auto-save on mount
  useEffect(() => {
    initializePage();
    startAutoSave();

    // Cleanup auto-save on unmount
    return () => {
      stopAutoSave();
    };
  }, [initializePage]);

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

  const selectedSection = selectedSectionId 
    ? page.sections.find(s => s.id === selectedSectionId) || null
    : null;

  const toolbar = (
    <Toolbar
      onSave={saveToLocalStorage}
      onPreview={togglePreview}
      onReset={resetPage}
      hasUnsavedChanges={hasUnsavedChanges}
      isPreviewMode={isPreviewMode}
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
    <Canvas
      sections={page.sections}
      selectedSectionId={selectedSectionId}
      onSelectSection={handleSelectSection}
      onUpdateSection={handleUpdateSection}
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
    <BuilderLayout
      toolbar={toolbar}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
    >
      {canvas}
    </BuilderLayout>
  );
}