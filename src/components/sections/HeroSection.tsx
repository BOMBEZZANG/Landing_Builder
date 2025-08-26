import React from 'react';
import { HeroSection as HeroSectionType } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import InlineTextEditor from '@/components/editor/InlineTextEditor';

interface HeroSectionProps {
  section: HeroSectionType;
  isEditing: boolean;
  onUpdate: (updates: Partial<HeroSectionType['data']>) => void;
}

export default function HeroSection({
  section,
  isEditing,
  onUpdate
}: HeroSectionProps) {
  const { data } = section;

  const getBackgroundStyle = () => {
    switch (data.backgroundType) {
      case 'color':
        return { backgroundColor: data.backgroundColor };
      case 'gradient':
        return { background: data.backgroundGradient || data.backgroundColor };
      case 'image':
        return {
          backgroundColor: data.backgroundColor,
          backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return { backgroundColor: data.backgroundColor };
    }
  };

  const getTextAlignment = () => {
    switch (data.alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };

  const handleScroll = () => {
    if (data.buttonAction === 'scroll') {
      const nextSection = document.querySelector('[data-section-type="content"]');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-4 py-20"
      style={getBackgroundStyle()}
      data-section-type="hero"
    >
      {/* Overlay for better text readability when using images */}
      {data.backgroundType === 'image' && data.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      )}
      
      <div className={cn('relative z-10 max-w-4xl mx-auto', getTextAlignment())}>
        {/* Headline */}
        <div className="mb-6">
          {isEditing ? (
            <InlineTextEditor
              value={data.headline}
              onChange={(value) => onUpdate({ headline: value })}
              className={cn(
                'text-4xl md:text-6xl font-bold leading-tight',
                getTextAlignment()
              )}
              style={{ color: data.textColor }}
              placeholder="Enter headline"
            />
          ) : (
            <h1
              className={cn(
                'text-4xl md:text-6xl font-bold leading-tight',
                getTextAlignment()
              )}
              style={{ color: data.textColor }}
            >
              {data.headline}
            </h1>
          )}
        </div>

        {/* Subheadline */}
        <div className="mb-8">
          {isEditing ? (
            <InlineTextEditor
              value={data.subheadline}
              onChange={(value) => onUpdate({ subheadline: value })}
              className={cn(
                'text-xl md:text-2xl font-light leading-relaxed max-w-3xl',
                data.alignment === 'center' && 'mx-auto',
                getTextAlignment()
              )}
              style={{ color: data.textColor }}
              placeholder="Enter subheadline"
              multiline
            />
          ) : (
            <p
              className={cn(
                'text-xl md:text-2xl font-light leading-relaxed max-w-3xl',
                data.alignment === 'center' && 'mx-auto',
                getTextAlignment()
              )}
              style={{ color: data.textColor }}
            >
              {data.subheadline}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className={cn('flex', {
          'justify-start': data.alignment === 'left',
          'justify-center': data.alignment === 'center',
          'justify-end': data.alignment === 'right'
        })}>
          {isEditing ? (
            <InlineTextEditor
              value={data.buttonText}
              onChange={(value) => onUpdate({ buttonText: value })}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{
                backgroundColor: data.buttonColor,
                color: '#ffffff'
              }}
              placeholder="Button text"
            />
          ) : (
            <button
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-white"
              style={{ backgroundColor: data.buttonColor }}
              onClick={handleScroll}
              type="button"
            >
              {data.buttonText}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}