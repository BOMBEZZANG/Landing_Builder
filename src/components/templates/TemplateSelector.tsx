import React, { useState, useEffect } from 'react';
import { Template, TemplateCategory, TemplateFilter } from '@/types/template.types';
import { templateService } from '@/lib/template-service';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Grid, List, Tag, User, Calendar, Eye } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  business: 'Business',
  ecommerce: 'E-commerce',
  portfolio: 'Portfolio', 
  saas: 'SaaS',
  event: 'Event',
  blog: 'Blog',
  nonprofit: 'Non-profit',
  education: 'Education',
  custom: 'Custom'
};

export default function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory, searchQuery]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Load custom templates from localStorage
      templateService.loadCustomTemplates();
      
      const allTemplates = templateService.getAllTemplates();
      const allCategories = templateService.getCategories();
      
      setTemplates(allTemplates);
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    const filter: TemplateFilter = {};
    
    if (selectedCategory !== 'all') {
      filter.category = selectedCategory;
    }
    
    if (searchQuery.trim()) {
      filter.search = searchQuery.trim();
    }

    const filtered = templateService.filterTemplates(filter);
    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = (template: Template) => {
    templateService.incrementUsage(template.id);
    onSelectTemplate(template);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderTemplateCard = (template: Template) => {
    if (viewMode === 'list') {
      return (
        <div
          key={template.id}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => handleSelectTemplate(template)}
        >
          <div className="w-20 h-16 bg-gray-200 rounded flex-shrink-0 mr-4 flex items-center justify-center">
            <div className="w-12 h-10 bg-gray-300 rounded"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
              <span className="text-xs text-gray-500 ml-2">
                {CATEGORY_LABELS[template.category]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1 truncate">{template.description}</p>
            
            <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
              {template.author && (
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {template.author}
                </span>
              )}
              
              {template.usageCount !== undefined && (
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {template.usageCount} uses
                </span>
              )}
              
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(template.createdAt)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{template.tags.length - 3} more</span>
              )}
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="ml-4">
            Use Template
          </Button>
        </div>
      );
    }

    return (
      <div
        key={template.id}
        className="group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => handleSelectTemplate(template)}
      >
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="w-24 h-16 bg-white rounded shadow-sm"></div>
          </div>
          
          <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-xs text-gray-600">
            {CATEGORY_LABELS[template.category]}
          </div>
          
          {template.isCustom && (
            <div className="absolute top-2 left-2 bg-green-500 text-white rounded px-2 py-1 text-xs">
              Custom
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
            <Button
              variant="primary"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Use Template
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            {template.author && (
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {template.author}
              </span>
            )}
            
            {template.usageCount !== undefined && (
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {template.usageCount}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </span>
            ))}
            {template.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{template.tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-gray-600 mt-1">Start with a professional template or continue with blank page</p>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Filters */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Templates Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
            
            <Button variant="outline" onClick={onClose}>
              Continue with Blank Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}