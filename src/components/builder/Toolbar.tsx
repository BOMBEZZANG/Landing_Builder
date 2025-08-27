import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface ToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  onReset: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onShowTemplates?: () => void;
  onSaveTemplate?: () => void;
  hasUnsavedChanges: boolean;
  isPreviewMode: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function Toolbar({
  onSave,
  onPreview,
  onReset,
  onUndo,
  onRedo,
  onShowTemplates,
  onSaveTemplate,
  hasUnsavedChanges,
  isPreviewMode,
  canUndo = false,
  canRedo = false
}: ToolbarProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    if (showResetConfirm) {
      onReset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <div className="flex items-center justify-between h-full px-4">
      {/* Left side - Logo/Brand */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-800">Landing Builder</span>
        </div>
        
        {hasUnsavedChanges && (
          <div className="flex items-center text-sm text-amber-600">
            <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
            Unsaved changes
          </div>
        )}
      </div>

      {/* Center - Page info */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Untitled Page</span>
        <span className="text-gray-400">•</span>
        <span className={cn(
          isPreviewMode ? 'text-green-600' : 'text-blue-600'
        )}>
          {isPreviewMode ? 'Preview Mode' : 'Edit Mode'}
        </span>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        {/* Undo/Redo Buttons */}
        {!isPreviewMode && (
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="rounded-none border-0 px-2"
              title="Undo (Ctrl+Z)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </Button>
            <div className="w-px h-4 bg-gray-200" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="rounded-none border-0 px-2"
              title="Redo (Ctrl+Y)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                />
              </svg>
            </Button>
          </div>
        )}
        
        {/* Template Actions */}
        {!isPreviewMode && (
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowTemplates}
              className="rounded-none border-0 px-3"
              title="Browse Templates"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Templates
            </Button>
            <div className="w-px h-4 bg-gray-200" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onSaveTemplate}
              className="rounded-none border-0 px-3"
              title="Save as Template"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save
            </Button>
          </div>
        )}
        
        {/* Save Button */}
        <Button
          variant={hasUnsavedChanges ? 'primary' : 'secondary'}
          size="sm"
          onClick={onSave}
          disabled={!hasUnsavedChanges}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          {hasUnsavedChanges ? 'Save Draft' : 'Saved'}
        </Button>

        {/* Preview/Edit Toggle */}
        <Button
          variant={isPreviewMode ? 'secondary' : 'outline'}
          size="sm"
          onClick={onPreview}
        >
          {isPreviewMode ? (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Preview
            </>
          )}
        </Button>

        {/* Reset Button */}
        <Button
          variant={showResetConfirm ? 'secondary' : 'ghost'}
          size="sm"
          onClick={handleReset}
          className={cn(
            showResetConfirm && 'bg-red-50 text-red-600 hover:bg-red-100'
          )}
        >
          {showResetConfirm ? (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Confirm Reset
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </>
          )}
        </Button>

        {/* Publish Button - Placeholder for Phase 2 */}
        <Button
          variant="primary"
          size="sm"
          disabled
          className="opacity-50"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Publish
        </Button>
      </div>
    </div>
  );
}