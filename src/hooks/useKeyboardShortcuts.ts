import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onSave,
  onPreview,
  canUndo = false,
  canRedo = false,
  disabled = false
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (event.target as HTMLElement)?.tagName
      );
      
      if (isInputFocused) return;

      const { ctrlKey, metaKey, key } = event;
      const isModifier = ctrlKey || metaKey;

      // Undo: Ctrl+Z / Cmd+Z
      if (isModifier && key === 'z' && !event.shiftKey) {
        if (onUndo && canUndo) {
          event.preventDefault();
          onUndo();
        }
        return;
      }

      // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if (
        (isModifier && key === 'y') ||
        (isModifier && key === 'z' && event.shiftKey)
      ) {
        if (onRedo && canRedo) {
          event.preventDefault();
          onRedo();
        }
        return;
      }

      // Save: Ctrl+S / Cmd+S
      if (isModifier && key === 's') {
        if (onSave) {
          event.preventDefault();
          onSave();
        }
        return;
      }

      // Preview: Ctrl+P / Cmd+P
      if (isModifier && key === 'p') {
        if (onPreview) {
          event.preventDefault();
          onPreview();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUndo, onRedo, onSave, onPreview, canUndo, canRedo, disabled]);
}