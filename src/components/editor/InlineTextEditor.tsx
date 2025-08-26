import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  style?: React.CSSProperties;
}

export default function InlineTextEditor({
  value,
  onChange,
  className,
  placeholder = 'Click to edit...',
  multiline = false,
  disabled = false,
  autoFocus = false,
  onBlur,
  onFocus,
  style
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && !isEditing) {
      setIsEditing(true);
      onFocus?.();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsEditing(true);
      onFocus?.();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    setIsEditing(false);
    onChange(localValue);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalValue(value); // Reset to original value
      setIsEditing(false);
      onBlur?.();
    } else if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const baseClassName = cn(
    'cursor-text border-2 border-transparent rounded-md px-2 py-1 transition-colors',
    'hover:border-blue-200 focus:border-blue-400 focus:outline-none',
    'inline-block w-full',
    disabled && 'cursor-not-allowed opacity-50'
  );

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <InputComponent
        ref={inputRef as any}
        type={multiline ? undefined : 'text'}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          baseClassName,
          'border-blue-400 bg-white shadow-sm resize-none',
          multiline && 'min-h-[2.5rem]',
          className
        )}
        style={style}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={multiline ? 3 : undefined}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn(
        baseClassName,
        'min-h-[2.5rem] flex items-center',
        !value && 'text-gray-400',
        className
      )}
      style={style}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      {value || placeholder}
    </div>
  );
}