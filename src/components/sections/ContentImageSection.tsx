import React from 'react';
import Image from 'next/image';
import { ImageContentSection } from '@/types/builder.types';
import InlineTextEditor from '@/components/editor/InlineTextEditor';
import ImageUploader from '@/components/editor/ImageUploader';

interface ContentImageSectionProps {
  section: ImageContentSection;
  isEditing: boolean;
  onUpdate: (updates: Partial<ImageContentSection['data']>) => void;
}

export const ContentImageSection: React.FC<ContentImageSectionProps> = ({
  section,
  isEditing,
  onUpdate
}) => {
  const { data } = section;
  const { 
    title, 
    content, 
    imageUrl,
    imagePublicId,
    imagePosition,
    imageSize,
    backgroundColor, 
    textColor, 
    padding 
  } = data;

  const paddingClasses = {
    small: 'py-8 px-4',
    medium: 'py-16 px-8',
    large: 'py-24 px-12'
  };

  const imageSizeClasses = {
    small: 'w-full md:w-1/3',
    medium: 'w-full md:w-1/2',
    large: 'w-full md:w-2/3'
  };

  const getLayoutClasses = () => {
    switch(imagePosition) {
      case 'left':
        return 'md:flex-row-reverse';
      case 'right':
        return 'md:flex-row';
      case 'top':
        return 'flex-col-reverse';
      case 'bottom':
        return 'flex-col';
      default:
        return 'md:flex-row';
    }
  };

  const renderContent = () => (
    <div className="flex-1 space-y-4">
      {isEditing ? (
        <>
          <InlineTextEditor
            value={title}
            onChange={(value) => onUpdate({ title: value })}
            className="text-2xl md:text-3xl font-bold"
            placeholder="Enter section title..."
          />
          <InlineTextEditor
            value={content}
            onChange={(value) => onUpdate({ content: value })}
            className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
            placeholder="Enter section content..."
            multiline
          />
        </>
      ) : (
        <>
          <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
          <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </>
      )}
    </div>
  );

  const renderImage = () => {
    if (isEditing) {
      return (
        <div className={`${imageSizeClasses[imageSize]} relative`}>
          <ImageUploader
            onUpload={(url, publicId) => {
              onUpdate({ imageUrl: url, imagePublicId: publicId });
            }}
            currentImage={imageUrl}
            aspectRatio="16:9"
          />
        </div>
      );
    }

    if (!imageUrl) {
      return (
        <div className={`${imageSizeClasses[imageSize]} bg-gray-200 rounded-lg flex items-center justify-center min-h-[200px]`}>
          <span className="text-gray-500">No image uploaded</span>
        </div>
      );
    }

    return (
      <div className={`${imageSizeClasses[imageSize]} relative`}>
        <Image
          src={imageUrl}
          alt={title}
          width={800}
          height={450}
          className="w-full h-auto rounded-lg object-cover"
        />
      </div>
    );
  };

  const isVertical = imagePosition === 'top' || imagePosition === 'bottom';

  return (
    <section 
      className={`${paddingClasses[padding]} relative`}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className={`flex ${getLayoutClasses()} ${isVertical ? 'items-center' : 'items-center'} gap-8`}>
          {imagePosition === 'left' || imagePosition === 'top' ? (
            <>
              {renderImage()}
              {renderContent()}
            </>
          ) : (
            <>
              {renderContent()}
              {renderImage()}
            </>
          )}
        </div>
      </div>
    </section>
  );
};