import React, { useState } from 'react';
import { PageState } from '@/types/builder.types';
import { templateService } from '@/lib/template-service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { Save, AlertCircle } from 'lucide-react';

interface SaveTemplateModalProps {
  page: PageState;
  onSave: (templateId: string) => void;
  onClose: () => void;
}

export default function SaveTemplateModal({ page, onSave, onClose }: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!description.trim()) {
      setError('Template description is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const template = templateService.saveCustomTemplate(
        name.trim(),
        description.trim(),
        page
      );
      
      onSave(template.id);
    } catch (error) {
      console.error('Failed to save template:', error);
      setError('Failed to save template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Save className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Save as Template</h2>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <Input
                id="template-name"
                type="text"
                placeholder="Enter template name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  error && !name.trim() && 'border-red-300 focus:ring-red-500 focus:border-red-500'
                )}
                maxLength={50}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {name.length}/50 characters
              </p>
            </div>
            
            <div>
              <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="template-description"
                placeholder="Describe what this template is for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none',
                  error && !description.trim() && 'border-red-300 focus:ring-red-500 focus:border-red-500'
                )}
                rows={3}
                maxLength={200}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/200 characters
              </p>
            </div>
          </div>
          
          {/* Preview Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Template Preview</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Page Title:</span>
                <span className="font-medium">{page.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Sections:</span>
                <span className="font-medium">{page.sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">Custom</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !name.trim() || !description.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Template'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}