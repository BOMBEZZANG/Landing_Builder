import React from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionDragHandleProps {
  id: string;
  disabled?: boolean;
}

export const SectionDragHandle: React.FC<SectionDragHandleProps> = ({ id, disabled = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'grab'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center ${disabled ? 'opacity-50' : ''}`}
      {...(!disabled ? attributes : {})}
      {...(!disabled ? listeners : {})}
    >
      <GripVertical 
        className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-gray-600 hover:text-gray-800'}`}
      />
    </div>
  );
};