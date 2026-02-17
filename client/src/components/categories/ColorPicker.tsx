// ColorPicker.tsx
import { useState } from 'react';

interface ColorPickerProps {
  name: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
}

const PRESET_COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Green', value: '#10B981' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'blue', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Slate', value: '#64748B' },
];

export default function ColorPicker({ 
  name, 
  label = 'Color', 
  defaultValue = '#3B82F6',
  required = false 
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(defaultValue);

  return (
    <div className="space-y-3">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      
      {/* Hidden input that stores the actual value for the form */}
      <input 
        type="hidden" 
        name={name} 
        value={selectedColor}
        required={required}
      />

      {/* Color preview and custom color picker */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-full shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="h-12 w-24 cursor-pointer"
        />
        <span className="text-sm font-mono text-gray-600">
          {selectedColor.toUpperCase()}
        </span>
      </div>

      {/* Preset colors grid */}
      <div className="grid grid-cols-6 gap-3 pt-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => setSelectedColor(color.value)}
            className={`
              w-10 h-10 rounded-full transition-all hover:scale-110
              ${selectedColor === color.value 
                ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={`Select ${color.name}`}
          />
        ))}
      </div>
    </div>
  );
}