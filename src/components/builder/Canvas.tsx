import React from 'react';
import { Section } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import HeroSection from '@/components/sections/HeroSection';
import ContentSection from '@/components/sections/ContentSection';
import CTASection from '@/components/sections/CTASection';

interface CanvasProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section['data']>) => void;
  isPreviewMode: boolean;
}

export default function Canvas({
  sections,
  selectedSectionId,
  onSelectSection,
  onUpdateSection,
  isPreviewMode
}: CanvasProps) {
  const renderSection = (section: Section) => {
    const isSelected = selectedSectionId === section.id;
    const isEditing = !isPreviewMode;

    const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        className={cn(
          'relative transition-all duration-200',
          isEditing && 'cursor-pointer',
          isSelected && !isPreviewMode && 'ring-2 ring-builder-selected ring-offset-2'
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditing) {
            onSelectSection(section.id);
          }
        }}
      >
        {/* Selection indicator */}
        {isSelected && !isPreviewMode && (
          <div className="absolute top-2 left-2 z-20 bg-builder-selected text-white px-2 py-1 rounded text-xs font-semibold">
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
          </div>
        )}
        
        {/* Hover overlay for editing mode */}
        {isEditing && !isSelected && (
          <div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-10 transition-opacity pointer-events-none z-10" />
        )}
        
        {children}
      </div>
    );

    const handleUpdate = (updates: Partial<Section['data']>) => {
      onUpdateSection(section.id, updates);
    };

    switch (section.type) {
      case 'hero':
        return (
          <SectionWrapper key={section.id}>
            <HeroSection
              section={section}
              isEditing={!isPreviewMode && isSelected}
              onUpdate={handleUpdate}
            />
          </SectionWrapper>
        );
      
      case 'content':
        return (
          <SectionWrapper key={section.id}>
            <ContentSection
              section={section}
              isEditing={!isPreviewMode && isSelected}
              onUpdate={handleUpdate}
            />
          </SectionWrapper>
        );
      
      case 'cta':
        return (
          <SectionWrapper key={section.id}>
            <CTASection
              section={section}
              isEditing={!isPreviewMode && isSelected}
              onUpdate={handleUpdate}
            />
          </SectionWrapper>
        );
      
      default:
        return null;
    }
  };

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div 
      className={cn(
        'w-full min-h-screen bg-white',
        !isPreviewMode && 'p-4'
      )}
      onClick={() => {
        // Deselect when clicking on empty canvas area
        if (!isPreviewMode) {
          onSelectSection('');
        }
      }}
    >
      <div
        className={cn(
          'mx-auto bg-white shadow-sm',
          !isPreviewMode && 'border border-gray-200 rounded-lg overflow-hidden',
          isPreviewMode ? 'max-w-none' : 'max-w-6xl'
        )}
      >
        {sortedSections.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p>No sections yet</p>
              <p className="text-sm">Sections will appear here</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {sortedSections.map(renderSection)}
            
            {/* Guidelines for editing mode */}
            {!isPreviewMode && selectedSectionId && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
                  Click to edit content, or use the properties panel to customize
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Canvas info for editing mode */}
      {!isPreviewMode && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Canvas • Click on sections to edit them</p>
        </div>
      )}
    </div>
  );
}