import { PageState } from './builder.types';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  previewUrl?: string;
  tags: string[];
  page: PageState;
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean; // User-created template
  author?: string;
  usageCount?: number;
}

export type TemplateCategory = 
  | 'business'
  | 'ecommerce'
  | 'portfolio'
  | 'saas'
  | 'event'
  | 'blog'
  | 'nonprofit'
  | 'education'
  | 'custom';

export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  templates: Template[];
}

export interface TemplateFilter {
  category?: TemplateCategory;
  tags?: string[];
  search?: string;
  author?: string;
}