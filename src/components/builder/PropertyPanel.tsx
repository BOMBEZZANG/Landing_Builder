import React from 'react';
import { Section, COLOR_SCHEMES, FONT_OPTIONS, PADDING_OPTIONS } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import ColorPicker from '@/components/editor/ColorPicker';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { EmailSettingsSection } from '@/components/builder/PropertyPanels/EmailSettingsSection';

interface PropertyPanelProps {
  selectedSection: Section | null;
  onUpdateSection: (updates: Partial<Section['data']>) => void;
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: 'modern' | 'classic' | 'playful';
  };
  onUpdateGlobalStyles: (styles: Partial<PropertyPanelProps['globalStyles']>) => void;
}

export default function PropertyPanel({
  selectedSection,
  onUpdateSection,
  globalStyles,
  onUpdateGlobalStyles
}: PropertyPanelProps) {
  const PropertyGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const renderHeroProperties = (section: Extract<Section, { type: 'hero' }>) => (
    <>
      <PropertyGroup title="Background">
        <Select
          label="Background Type"
          value={section.data.backgroundType}
          onChange={(e) => onUpdateSection({ backgroundType: e.target.value as any })}
          options={[
            { value: 'color', label: 'Solid Color' },
            { value: 'gradient', label: 'Gradient' },
            { value: 'image', label: 'Image' }
          ]}
        />
        
        <ColorPicker
          label="Background Color"
          color={section.data.backgroundColor}
          onChange={(color) => onUpdateSection({ backgroundColor: color })}
        />
        
        {section.data.backgroundType === 'gradient' && (
          <Input
            label="Gradient CSS"
            value={section.data.backgroundGradient || ''}
            onChange={(e) => onUpdateSection({ backgroundGradient: e.target.value })}
            placeholder="linear-gradient(...)"
          />
        )}
      </PropertyGroup>

      <PropertyGroup title="Text">
        <ColorPicker
          label="Text Color"
          color={section.data.textColor}
          onChange={(color) => onUpdateSection({ textColor: color })}
        />
        
        <Select
          label="Text Alignment"
          value={section.data.alignment}
          onChange={(e) => onUpdateSection({ alignment: e.target.value as any })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ]}
        />
      </PropertyGroup>

      <PropertyGroup title="Button">
        <ColorPicker
          label="Button Color"
          color={section.data.buttonColor}
          onChange={(color) => onUpdateSection({ buttonColor: color })}
        />
        
        <Select
          label="Button Action"
          value={section.data.buttonAction}
          onChange={(e) => onUpdateSection({ buttonAction: e.target.value as any })}
          options={[
            { value: 'scroll', label: 'Scroll to Next Section' },
            { value: 'form', label: 'Go to Form' },
            { value: 'link', label: 'External Link' }
          ]}
        />
      </PropertyGroup>
    </>
  );

  const renderContentProperties = (section: Extract<Section, { type: 'content' }>) => (
    <>
      <PropertyGroup title="Background">
        <ColorPicker
          label="Background Color"
          color={section.data.backgroundColor}
          onChange={(color) => onUpdateSection({ backgroundColor: color })}
        />
      </PropertyGroup>

      <PropertyGroup title="Text">
        <ColorPicker
          label="Text Color"
          color={section.data.textColor}
          onChange={(color) => onUpdateSection({ textColor: color })}
        />
      </PropertyGroup>

      <PropertyGroup title="Image">
        <Select
          label="Image Position"
          value={section.data.imagePosition}
          onChange={(e) => onUpdateSection({ imagePosition: e.target.value as any })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' }
          ]}
        />
        
        {section.data.imageUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Image
            </label>
            <img
              src={section.data.imageUrl}
              alt="Section"
              className="w-full h-20 object-cover rounded border"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => onUpdateSection({ imageUrl: undefined })}
            >
              Remove Image
            </Button>
          </div>
        )}
      </PropertyGroup>

      <PropertyGroup title="Layout">
        <Select
          label="Section Padding"
          value={section.data.padding}
          onChange={(e) => onUpdateSection({ padding: e.target.value as any })}
          options={PADDING_OPTIONS.map(p => ({ value: p.value, label: p.name }))}
        />
      </PropertyGroup>
    </>
  );

  const renderCTAProperties = (section: Extract<Section, { type: 'cta' }>) => (
    <>
      <PropertyGroup title="Background">
        <ColorPicker
          label="Background Color"
          color={section.data.backgroundColor}
          onChange={(color) => onUpdateSection({ backgroundColor: color })}
        />
      </PropertyGroup>

      <PropertyGroup title="Text">
        <ColorPicker
          label="Text Color"
          color={section.data.textColor}
          onChange={(color) => onUpdateSection({ textColor: color })}
        />
      </PropertyGroup>

      <PropertyGroup title="Button">
        <ColorPicker
          label="Button Color"
          color={section.data.buttonColor}
          onChange={(color) => onUpdateSection({ buttonColor: color })}
        />
      </PropertyGroup>

      <PropertyGroup title="Form Settings">
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section.data.formEnabled}
              onChange={(e) => onUpdateSection({ formEnabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable form</span>
          </label>
        </div>
      </PropertyGroup>

      {/* Email Recipient Settings - Always show when form is enabled */}
      {section.data.formEnabled && (
        <EmailSettingsSection
          recipientEmail={section.data.recipientEmail || ''}
          emailVerified={section.data.emailVerified || false}
          onEmailChange={(email) => onUpdateSection({ recipientEmail: email })}
          onEmailVerified={(verified) => onUpdateSection({ emailVerified: verified })}
        />
      )}

      {section.data.formEnabled && (
        <PropertyGroup title="Form Fields">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Select fields to show on your form</p>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={section.data.formFields.name}
                onChange={(e) => onUpdateSection({
                  formFields: { ...section.data.formFields, name: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Name field</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={section.data.formFields.email}
                onChange={(e) => onUpdateSection({
                  formFields: { ...section.data.formFields, email: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Email field</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={section.data.formFields.phone}
                onChange={(e) => onUpdateSection({
                  formFields: { ...section.data.formFields, phone: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Phone field</span>
            </label>
          </div>
        </PropertyGroup>
      )}
    </>
  );

  if (!selectedSection) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
            />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">No section selected</p>
        <p className="text-sm text-gray-400">Click on a section to edit its properties</p>
        
        {/* Global styles section */}
        <div className="mt-8 text-left">
          <PropertyGroup title="Global Styles">
            <ColorPicker
              label="Primary Color"
              color={globalStyles.primaryColor}
              onChange={(color) => onUpdateGlobalStyles({ primaryColor: color })}
            />
            
            <ColorPicker
              label="Secondary Color"
              color={globalStyles.secondaryColor}
              onChange={(color) => onUpdateGlobalStyles({ secondaryColor: color })}
            />
            
            <Select
              label="Font Family"
              value={globalStyles.fontFamily}
              onChange={(e) => onUpdateGlobalStyles({ fontFamily: e.target.value as any })}
              options={FONT_OPTIONS.map(f => ({ value: f.value, label: f.name }))}
            />
          </PropertyGroup>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-builder-selected rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            {selectedSection.type.charAt(0).toUpperCase() + selectedSection.type.slice(1)} Section
          </span>
        </div>
      </div>

      {selectedSection.type === 'hero' && renderHeroProperties(selectedSection)}
      {selectedSection.type === 'content' && renderContentProperties(selectedSection)}
      {selectedSection.type === 'cta' && renderCTAProperties(selectedSection)}
      
      {/* Quick Actions */}
      <PropertyGroup title="Quick Actions">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset section to defaults - implement based on section type
              console.log('Reset section to defaults');
            }}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Duplicate section - for future phases
              console.log('Duplicate section');
            }}
          >
            Duplicate
          </Button>
        </div>
      </PropertyGroup>
    </div>
  );
}