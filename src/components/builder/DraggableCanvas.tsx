import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, DeviceType } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import HeroSection from '@/components/sections/HeroSection';
import ContentSection from '@/components/sections/ContentSection';
import CTASection from '@/components/sections/CTASection';
import { GripVertical } from 'lucide-react';

interface DraggableSectionProps {
  section: Section;
  isSelected: boolean;
  isEditing: boolean;
  isPreviewMode: boolean;
  onSelectSection: (sectionId: string) => void;
  onUpdate: (updates: Partial<Section['data']>) => void;
  isDragging?: boolean;
}

function DraggableSection({
  section,
  isSelected,
  isEditing,
  isPreviewMode,
  onSelectSection,
  onUpdate,
  isDragging
}: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative transition-all duration-200 group',
        isEditing && 'cursor-pointer',
        isSelected && !isPreviewMode && 'ring-2 ring-builder-selected ring-offset-2',
        isSortableDragging && 'opacity-50 z-50',
        isDragging && 'opacity-30'
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (isEditing) {
          onSelectSection(section.id);
        }
      }}
    >
      {/* Drag handle - only visible when not in preview mode and on hover/selected */}
      {!isPreviewMode && (
        <div
          className={cn(
            'absolute left-2 top-2 z-30 bg-white border border-gray-300 rounded p-1 shadow-sm',
            'opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing',
            isSelected && 'opacity-100',
            'hover:bg-gray-50'
          )}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && !isPreviewMode && (
        <div className="absolute top-2 right-2 z-20 bg-builder-selected text-white px-2 py-1 rounded text-xs font-semibold">
          {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
        </div>
      )}
      
      {/* Hover overlay for editing mode */}
      {isEditing && !isSelected && !isSortableDragging && (
        <div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-10 transition-opacity pointer-events-none z-10" />
      )}
      
      {children}
    </div>
  );

  const renderSectionContent = () => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            section={section}
            isEditing={!isPreviewMode && isSelected}
            onUpdate={onUpdate}
          />
        );
      
      case 'content':
        return (
          <ContentSection
            section={section}
            isEditing={!isPreviewMode && isSelected}
            onUpdate={onUpdate}
          />
        );
      
      case 'cta':
        return (
          <CTASection
            section={section}
            isEditing={!isPreviewMode && isSelected}
            onUpdate={onUpdate}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SectionWrapper>
      {renderSectionContent()}
    </SectionWrapper>
  );
}

interface DraggableCanvasProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section['data']>) => void;
  onReorderSections: (sections: Section[]) => void;
  isPreviewMode: boolean;
  previewDevice?: DeviceType;
}

export default function DraggableCanvas({
  sections,
  selectedSectionId,
  onSelectSection,
  onUpdateSection,
  onReorderSections,
  isPreviewMode,
  previewDevice = 'desktop'
}: DraggableCanvasProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering for drag and drop
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const sectionIds = sortedSections.map(section => section.id);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionIds.indexOf(active.id as string);
      const newIndex = sectionIds.indexOf(over.id as string);

      const reorderedSections = arrayMove(sortedSections, oldIndex, newIndex)
        .map((section, index) => ({
          ...section,
          order: index
        }));

      onReorderSections(reorderedSections);
    }

    setActiveId(null);
  }

  const handleUpdate = (sectionId: string) => (updates: Partial<Section['data']>) => {
    onUpdateSection(sectionId, updates);
  };

  // Helper function to get device-specific container styles
  const getDeviceContainerStyles = (device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return {
          maxWidth: '375px',
          containerClass: 'mobile-preview'
        };
      case 'tablet':
        return {
          maxWidth: '768px',
          containerClass: 'tablet-preview'
        };
      case 'desktop':
      default:
        return {
          maxWidth: 'none',
          containerClass: 'desktop-preview'
        };
    }
  };

  const renderDragOverlay = () => {
    if (!activeId) return null;
    
    const activeSection = sortedSections.find(section => section.id === activeId);
    if (!activeSection) return null;

    return (
      <div className="opacity-90 transform rotate-2 shadow-2xl bg-white rounded-lg overflow-hidden border-2 border-blue-300">
        <DraggableSection
          section={activeSection}
          isSelected={false}
          isEditing={false}
          isPreviewMode={true}
          onSelectSection={() => {}}
          onUpdate={() => {}}
          isDragging={true}
        />
      </div>
    );
  };

  if (isPreviewMode) {
    const deviceStyles = getDeviceContainerStyles(previewDevice);
    
    // In preview mode, render without drag and drop
    return (
      <div 
        className={cn(
          "w-full min-h-screen flex justify-center",
          previewDevice !== 'desktop' ? 'bg-gray-100 py-8' : 'bg-white'
        )}
      >
        <div 
          className={cn(
            "bg-white transition-all duration-300 ease-in-out",
            previewDevice !== 'desktop' && 'shadow-xl border border-gray-300 rounded-lg overflow-hidden',
            deviceStyles.containerClass
          )}
          style={{ 
            maxWidth: deviceStyles.maxWidth,
            width: previewDevice === 'desktop' ? '100%' : deviceStyles.maxWidth,
            minHeight: previewDevice === 'desktop' ? '100vh' : 'auto'
          }}
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
            sortedSections.map(section => (
              <DraggableSection
                key={section.id}
                section={section}
                isSelected={false}
                isEditing={false}
                isPreviewMode={true}
                onSelectSection={() => {}}
                onUpdate={() => {}}
              />
            ))
          )}
        </div>

        {/* Device indicator */}
        {previewDevice !== 'desktop' && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
            {previewDevice === 'mobile' ? '375px' : '768px'} • {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} Preview
          </div>
        )}
      </div>
    );
  }

  // Show simplified version without DnD until client-side mount is complete
  if (!isMounted) {
    return (
      <div className="w-full min-h-screen bg-white p-4">
        <div className="mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden max-w-6xl">
          {sortedSections.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p>Loading builder...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {sortedSections.map(section => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  isEditing={true}
                  isPreviewMode={false}
                  onSelectSection={onSelectSection}
                  onUpdate={handleUpdate(section.id)}
                  isDragging={false}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Initializing canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="w-full min-h-screen bg-white p-4"
        onClick={() => {
          // Deselect when clicking on empty canvas area
          onSelectSection('');
        }}
      >
        <div className="mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden max-w-6xl">
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
                <p className="text-sm">Add sections using the toolbar above</p>
              </div>
            </div>
          ) : (
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              <div className="relative">
                {sortedSections.map(section => (
                  <DraggableSection
                    key={section.id}
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    isEditing={true}
                    isPreviewMode={false}
                    onSelectSection={onSelectSection}
                    onUpdate={handleUpdate(section.id)}
                    isDragging={activeId !== null && activeId !== section.id}
                  />
                ))}
                
                {/* Drop indicator */}
                {activeId && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-20 rounded" />
                  </div>
                )}
              </div>
            </SortableContext>
          )}
        </div>
        
        {/* Canvas info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Canvas • Drag sections to reorder • Click to edit</p>
        </div>
      </div>

      <DragOverlay>
        {renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
}