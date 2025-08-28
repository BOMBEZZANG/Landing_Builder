import React from 'react';
import { useTranslation } from '@/components/i18n/I18nProvider';

interface BuilderLayoutProps {
  children: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  toolbar: React.ReactNode;
}

export default function BuilderLayout({
  children,
  leftPanel,
  rightPanel,
  toolbar
}: BuilderLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="h-screen flex flex-col bg-builder-bg">
      {/* Toolbar */}
      <div className="h-14 border-b border-builder-border bg-white shadow-sm">
        {toolbar}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Section List */}
        <div className="w-64 border-r border-builder-border bg-white overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              {t('builder.sections.pageSections')}
            </h2>
            {leftPanel}
          </div>
        </div>
        
        {/* Center Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-50 relative">
          <div className="min-h-full">
            {children}
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-builder-border bg-white overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              {t('builder.properties.title')}
            </h2>
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}