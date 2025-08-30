import React from 'react';
import { TextContentSection } from '@/types/builder.types';
import InlineTextEditor from '@/components/editor/InlineTextEditor';

interface ContentTextSectionProps {
  section: TextContentSection;
  isEditing: boolean;
  onUpdate: (updates: Partial<TextContentSection['data']>) => void;
}

export const ContentTextSection: React.FC<ContentTextSectionProps> = ({
  section,
  isEditing,
  onUpdate
}) => {
  const { data } = section;
  const { 
    title, 
    content, 
    backgroundColor, 
    backgroundType,
    backgroundGradient,
    textColor, 
    textAlignment,
    padding 
  } = data;

  const paddingClasses = {
    small: 'py-8 px-4',
    medium: 'py-16 px-8',
    large: 'py-24 px-12'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const backgroundStyle = backgroundType === 'gradient' && backgroundGradient
    ? { background: backgroundGradient }
    : { backgroundColor };

  return (
    <section 
      className={`${paddingClasses[padding]} ${alignmentClasses[textAlignment]} relative`}
      style={{
        ...backgroundStyle,
        color: textColor
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-6">
          {isEditing ? (
            <>
              <InlineTextEditor
                value={title}
                onChange={(value) => onUpdate({ title: value })}
                className="text-3xl md:text-4xl font-bold"
                placeholder="Enter section title..."
              />
              <InlineTextEditor
                value={content}
                onChange={(value) => onUpdate({ content: value })}
                className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap"
                placeholder="Enter section content..."
                multiline
              />
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
              <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};