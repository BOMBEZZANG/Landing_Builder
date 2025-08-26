import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import { COLOR_PRESETS } from '@/lib/constants';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
  className?: string;
}

export default function ColorPicker({
  color,
  onChange,
  label,
  presets = COLOR_PRESETS,
  className
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTempColor(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    onChange(newColor);
  };

  const handlePresetClick = (presetColor: string) => {
    setTempColor(presetColor);
    onChange(presetColor);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          ref={buttonRef}
          type="button"
          className="w-10 h-10 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ backgroundColor: color }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open color picker"
        />
        
        <input
          type="text"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="#000000"
        />
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <div className="space-y-4">
            {/* Color Picker */}
            <div>
              <HexColorPicker
                color={tempColor}
                onChange={handleColorChange}
              />
            </div>

            {/* Color Presets */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Presets</p>
              <div className="grid grid-cols-6 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform',
                      preset === tempColor
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    style={{ backgroundColor: preset }}
                    onClick={() => handlePresetClick(preset)}
                    aria-label={`Select color ${preset}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}