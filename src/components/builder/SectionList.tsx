import React from 'react';
import { Section } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/i18n/I18nProvider';

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
  const { t } = useTranslation();
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
        return section.data.title || t('builder.sections.content');
      case 'cta':
        return section.data.title || t('builder.sections.ctaSection');
      default:
        return t('builder.sections.hero');
    }
  };

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {sortedSections.map((section) => (
        <div
          key={section.id}
          className={cn(
            'flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group',
            selectedSectionId === section.id
              ? 'bg-builder-selected text-white shadow-md'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          )}
          onClick={() => onSelectSection(section.id)}
        >
          <div className={cn(
            'flex-shrink-0 mr-3',
            selectedSectionId === section.id ? 'text-white' : 'text-gray-400'
          )}>
            {getSectionIcon(section.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                'text-sm font-medium truncate',
                selectedSectionId === section.id ? 'text-white' : 'text-gray-900'
              )}>
                {getSectionTitle(section)}
              </h3>
              
              <span className={cn(
                'ml-2 px-2 py-1 text-xs rounded-full',
                selectedSectionId === section.id 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-gray-200 text-gray-600'
              )}>
                {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Drag handle - placeholder for Phase 1 */}
          <div className={cn(
            'ml-2 opacity-0 group-hover:opacity-100 transition-opacity',
            selectedSectionId === section.id && 'opacity-100'
          )}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4M8 15l4 4 4-4"
              />
            </svg>
          </div>
        </div>
      ))}
      
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