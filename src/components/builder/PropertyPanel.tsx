import React from 'react';
import { Section, COLOR_SCHEMES, FONT_OPTIONS, PADDING_OPTIONS } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import ColorPicker from '@/components/editor/ColorPicker';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { EmailSettingsSection } from '@/components/builder/PropertyPanels/EmailSettingsSection';
import { useTranslation } from '@/components/i18n/I18nProvider';

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
  const { t } = useTranslation();
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
      <PropertyGroup title={t('builder.properties.background')}>
        <Select
          label={t('builder.properties.backgroundType')}
          value={section.data.backgroundType}
          onChange={(e) => onUpdateSection({ backgroundType: e.target.value as any })}
          options={[
            { value: 'color', label: t('builder.properties.color') },
            { value: 'gradient', label: t('builder.properties.gradient') },
            { value: 'image', label: t('builder.properties.image') }
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

      <PropertyGroup title={t('builder.properties.formSettings')}>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section.data.formEnabled}
              onChange={(e) => onUpdateSection({ formEnabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('form.settings.enableForm')}</span>
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
        <PropertyGroup title={t('builder.properties.formFields')}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{t('form.settings.selectFieldsToShow')}</p>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={section.data.formFields.name}
                onChange={(e) => onUpdateSection({
                  formFields: { ...section.data.formFields, name: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{t('form.settings.nameField')}</span>
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
              <span className="ml-2 text-sm text-gray-700">{t('form.settings.emailField')}</span>
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
              <span className="ml-2 text-sm text-gray-700">{t('form.settings.phoneField')}</span>
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
        <p className="text-gray-600 mb-2">{t('builder.properties.noSectionSelected')}</p>
        <p className="text-sm text-gray-400">{t('builder.properties.clickToEditProperties')}</p>
        
        {/* Global styles section */}
        <div className="mt-8 text-left">
          <PropertyGroup title={t('builder.properties.globalStyles')}>
            <ColorPicker
              label={t('builder.properties.primaryColor')}
              color={globalStyles.primaryColor}
              onChange={(color) => onUpdateGlobalStyles({ primaryColor: color })}
            />
            
            <ColorPicker
              label={t('builder.properties.secondaryColor')}
              color={globalStyles.secondaryColor}
              onChange={(color) => onUpdateGlobalStyles({ secondaryColor: color })}
            />
            
            <Select
              label={t('builder.properties.fontFamily')}
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
            {selectedSection.type === 'hero' ? t('builder.sections.hero') : selectedSection.type === 'content' ? t('builder.sections.content') : selectedSection.type === 'cta' ? t('builder.sections.ctaSection') : 'Section'}
          </span>
        </div>
      </div>

      {selectedSection.type === 'hero' && renderHeroProperties(selectedSection)}
      {selectedSection.type === 'content' && renderContentProperties(selectedSection)}
      {selectedSection.type === 'cta' && renderCTAProperties(selectedSection)}
      
      {/* Quick Actions */}
      <PropertyGroup title={t('builder.properties.quickActions')}>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset section to defaults - implement based on section type
              console.log('Reset section to defaults');
            }}
          >
            {t('common.reset')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Duplicate section - for future phases
              console.log('Duplicate section');
            }}
          >
            {t('builder.properties.duplicate')}
          </Button>
        </div>
      </PropertyGroup>
    </div>
  );
}