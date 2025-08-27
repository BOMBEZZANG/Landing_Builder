import React from 'react';
import { ContentSection as ContentSectionType } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import { PADDING_OPTIONS } from '@/types/builder.types';
import InlineTextEditor from '@/components/editor/InlineTextEditor';
import ImageUploader from '@/components/editor/ImageUploader';

interface ContentSectionProps {
  section: ContentSectionType;
  isEditing: boolean;
  onUpdate: (updates: Partial<ContentSectionType['data']>) => void;
}

export default function ContentSection({
  section,
  isEditing,
  onUpdate
}: ContentSectionProps) {
  const { data } = section;

  const getPaddingClass = () => {
    const padding = PADDING_OPTIONS.find(p => p.value === data.padding);
    return padding?.className || 'py-16';
  };

  const getImagePositionClasses = () => {
    switch (data.imagePosition) {
      case 'left':
        return {
          container: 'lg:flex-row',
          textContainer: 'lg:w-1/2 lg:pl-12',
          imageContainer: 'lg:w-1/2 lg:order-first'
        };
      case 'right':
        return {
          container: 'lg:flex-row',
          textContainer: 'lg:w-1/2 lg:pr-12',
          imageContainer: 'lg:w-1/2 lg:order-last'
        };
      case 'top':
        return {
          container: 'flex-col',
          textContainer: 'w-full',
          imageContainer: 'w-full order-first mb-8'
        };
      case 'bottom':
        return {
          container: 'flex-col',
          textContainer: 'w-full',
          imageContainer: 'w-full order-last mt-8'
        };
      default:
        return {
          container: 'lg:flex-row',
          textContainer: 'lg:w-1/2 lg:pr-12',
          imageContainer: 'lg:w-1/2 lg:order-last'
        };
    }
  };

  const imagePositionClasses = getImagePositionClasses();

  return (
    <section
      className={cn('px-4', getPaddingClass())}
      style={{ backgroundColor: data.backgroundColor }}
      data-section-type="content"
    >
      <div className="max-w-6xl mx-auto">
        <div className={cn(
          'flex flex-col items-center gap-8',
          imagePositionClasses.container
        )}>
          {/* Text Content */}
          <div className={cn(
            'flex flex-col justify-center',
            imagePositionClasses.textContainer
          )}>
            {/* Title */}
            <div className="mb-6">
              {isEditing ? (
                <InlineTextEditor
                  value={data.title}
                  onChange={(value) => onUpdate({ title: value })}
                  className="text-3xl md:text-4xl font-bold leading-tight"
                  style={{ color: data.textColor }}
                  placeholder="Enter section title"
                />
              ) : (
                <h2
                  className="text-3xl md:text-4xl font-bold leading-tight"
                  style={{ color: data.textColor }}
                >
                  {data.title}
                </h2>
              )}
            </div>

            {/* Content */}
            <div>
              {isEditing ? (
                <InlineTextEditor
                  value={data.content}
                  onChange={(value) => onUpdate({ content: value })}
                  className="text-lg leading-relaxed"
                  style={{ color: data.textColor }}
                  placeholder="Enter section content"
                  multiline
                />
              ) : (
                <div
                  className="text-lg leading-relaxed space-y-4"
                  style={{ color: data.textColor }}
                >
                  {data.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className={cn(
            'flex justify-center items-center',
            imagePositionClasses.imageContainer
          )}>
            {isEditing ? (
              <div className="w-full max-w-md lg:max-w-lg">
                <ImageUploader
                  onUpload={(url, publicId) => {
                    console.log('Image uploaded successfully:', { url, publicId });
                    onUpdate({ imageUrl: url, imagePublicId: publicId });
                  }}
                  currentImage={data.imageUrl}
                  aspectRatio="free"
                  maxSize={5}
                />
              </div>
            ) : data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt=""
                className="w-full max-w-md lg:max-w-lg rounded-lg shadow-lg object-cover"
              />
            ) : (
              <div className="w-full max-w-md lg:max-w-lg h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm">Image placeholder</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}