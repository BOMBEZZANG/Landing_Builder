import React from 'react';
import { Section } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/i18n/I18nProvider';
import { useBuilderStore } from '@/store/builderStore';
import { Trash2, Copy, Lock, FileText, Image as ImageIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  section: Section;
  isSelected: boolean;
  onSelectSection: (sectionId: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ section, isSelected, onSelectSection }) => {
  const { t } = useTranslation();
  const { deleteSection, duplicateSection, canDeleteSection } = useBuilderStore();
  
  const canDelete = canDeleteSection(section.id);
  const isLocked = section.type === 'hero' || section.type === 'cta';
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: section.id,
    disabled: isLocked
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionIcon = (type: Section['type']) => {
    switch (type) {
      case 'hero':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z" />
          </svg>
        );
      case 'content':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'content-text':
        return <FileText className="w-5 h-5" />;
      case 'content-image':
        return <ImageIcon className="w-5 h-5" />;
      case 'cta':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  const getSectionTitle = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return section.data.headline || t('builder.sections.hero');
      case 'content':
      case 'content-text':
      case 'content-image':
        return section.data.title || t('builder.sections.content');
      case 'cta':
        return section.data.title || t('builder.sections.ctaSection');
      default:
        return t('builder.sections.hero');
    }
  };

  const getSectionLabel = (type: Section['type']) => {
    switch(type) {
      case 'hero': return 'Hero';
      case 'content': return 'Content';
      case 'content-text': return 'Text';
      case 'content-image': return 'Image';
      case 'cta': return 'CTA';
      default: return type;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDelete && window.confirm('Are you sure you want to delete this section?')) {
      deleteSection(section.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSection(section.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group',
        isSelected
          ? 'bg-builder-selected text-white shadow-md'
          : 'bg-gray-50 hover:bg-gray-100 text-gray-700',
        isDragging && 'z-50'
      )}
      onClick={() => onSelectSection(section.id)}
    >
      {/* Drag Handle */}
      <div 
        className={cn(
          'flex items-center mr-2',
          isLocked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
        )}
        {...(!isLocked ? attributes : {})}
        {...(!isLocked ? listeners : {})}
      >
        {isLocked ? (
          <Lock className="w-4 h-4 text-gray-400" />
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        )}
      </div>

      <div className={cn(
        'flex-shrink-0 mr-3',
        isSelected ? 'text-white' : 'text-gray-400'
      )}>
        {getSectionIcon(section.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            'text-sm font-medium truncate',
            isSelected ? 'text-white' : 'text-gray-900'
          )}>
            {getSectionTitle(section)}
          </h3>
          
          <span className={cn(
            'ml-2 px-2 py-1 text-xs rounded-full',
            isSelected 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'bg-gray-200 text-gray-600'
          )}>
            {getSectionLabel(section.type)}
          </span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className={cn(
        'ml-2 flex items-center gap-1',
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        'transition-opacity'
      )}>
        {!isLocked && (
          <>
            <button
              onClick={handleDuplicate}
              className={cn(
                'p-1 rounded hover:bg-white hover:bg-opacity-20',
                isSelected ? 'text-white' : 'text-gray-600 hover:text-gray-800'
              )}
              title="Duplicate section"
            >
              <Copy className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                className={cn(
                  'p-1 rounded hover:bg-red-500 hover:bg-opacity-20',
                  isSelected ? 'text-white' : 'text-gray-600 hover:text-red-600'
                )}
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface SectionListProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}

export default function SectionList({
  sections,
  selectedSectionId,
  onSelectSection
}: SectionListProps) {
  const { reorderSections } = useBuilderStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
      const newIndex = sortedSections.findIndex((s) => s.id === over.id);
      
      const draggedSection = sortedSections[oldIndex];
      
      // Prevent moving hero and CTA sections
      if (draggedSection.type === 'hero' || draggedSection.type === 'cta') {
        return;
      }
      
      // Prevent moving content sections to positions 0 (hero) or last (CTA)
      const targetSection = sortedSections[newIndex];
      if (targetSection.type === 'hero' && newIndex === 0) {
        return;
      }
      if (targetSection.type === 'cta' && newIndex === sortedSections.length - 1) {
        return;
      }
      
      const newSections = [...sortedSections];
      const [removed] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, removed);
      
      // Update order property for all sections
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      reorderSections(reorderedSections);
    }
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedSections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelectSection={onSelectSection}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm">No sections yet</p>
        </div>
      )}
    </div>
  );
}