import { Section, ContentSection, TextContentSection, ImageContentSection } from '@/types/builder.types';

/**
 * Migrates legacy content sections to new format
 * Converts old 'content' type sections to either 'content-text' or 'content-image'
 */
export function migrateContentSection(section: Section): Section {
  if (section.type !== 'content') {
    return section; // No migration needed for non-content sections
  }

  const oldSection = section as ContentSection;
  const hasImage = !!oldSection.data.imageUrl;

  if (hasImage) {
    // Convert to content-image type
    const imageSection: ImageContentSection = {
      id: oldSection.id,
      type: 'content-image',
      order: oldSection.order,
      data: {
        title: oldSection.data.title,
        content: oldSection.data.content,
        imageUrl: oldSection.data.imageUrl || '',
        imagePublicId: oldSection.data.imagePublicId,
        imagePosition: oldSection.data.imagePosition,
        imageSize: 'medium', // Default size
        backgroundColor: oldSection.data.backgroundColor,
        textColor: oldSection.data.textColor,
        padding: oldSection.data.padding
      }
    };
    return imageSection;
  } else {
    // Convert to content-text type
    const textSection: TextContentSection = {
      id: oldSection.id,
      type: 'content-text',
      order: oldSection.order,
      data: {
        title: oldSection.data.title,
        content: oldSection.data.content,
        backgroundColor: oldSection.data.backgroundColor,
        backgroundType: 'color',
        textColor: oldSection.data.textColor,
        textAlignment: 'left', // Default alignment
        padding: oldSection.data.padding
      }
    };
    return textSection;
  }
}

/**
 * Migrates all sections in a page
 */
export function migrateSections(sections: Section[]): Section[] {
  return sections.map(section => migrateContentSection(section));
}

/**
 * Checks if migration is needed
 */
export function needsMigration(sections: Section[]): boolean {
  return sections.some(section => section.type === 'content');
}

/**
 * Migrates saved page data from localStorage
 */
export function migrateStoredPage(): void {
  try {
    const saved = localStorage.getItem('builder-draft');
    if (!saved) return;

    const page = JSON.parse(saved);
    if (!page.sections || !Array.isArray(page.sections)) return;

    if (needsMigration(page.sections)) {
      page.sections = migrateSections(page.sections);
      localStorage.setItem('builder-draft', JSON.stringify(page));
      console.log('Successfully migrated stored page to new section format');
    }
  } catch (error) {
    console.error('Failed to migrate stored page:', error);
  }
}

/**
 * Migrates template data
 */
export function migrateTemplate(template: any): any {
  if (!template || !template.sections) return template;
  
  return {
    ...template,
    sections: migrateSections(template.sections)
  };
}