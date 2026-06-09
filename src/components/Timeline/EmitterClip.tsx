import { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { getTemplateByType } from '@/templates/emitters';
import { GripVertical, Trash2 } from 'lucide-react';

interface EmitterClipProps {
  emitterId: string;
  isSelected: boolean;
  pixelsPerSecond: number;
  onSelect: (id: string) => void;
  onDragStart: (id: string, type: 'move' | 'resize-left' | 'resize-right') => void;
}

const emitterColors: Record<string, string> = {
  'rose-petal': 'from-rose-400 to-pink-500',
  'gold-dust': 'from-amber-400 to-yellow-500',
  'heart-glow': 'from-pink-400 to-rose-500',
  'firefly': 'from-yellow-300 to-amber-400',
  'star-rain': 'from-indigo-300 to-purple-400',
};

export function EmitterClip({
  emitterId,
  isSelected,
  pixelsPerSecond,
  onSelect,
  onDragStart,
}: EmitterClipProps) {
  const emitter = useEditorStore((s) =>
    s.project.emitters.find((e) => e.id === emitterId)
  );
  const removeEmitter = useEditorStore((s) => s.removeEmitter);

  if (!emitter) return null;

  const template = getTemplateByType(emitter.type);
  const left = emitter.startTime * pixelsPerSecond;
  const width = (emitter.endTime - emitter.startTime) * pixelsPerSecond;
  const colorClass = emitterColors[emitter.type] || 'from-gray-400 to-gray-500';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(emitterId);
    onDragStart(emitterId, 'move');
  };

  const handleResizeLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(emitterId);
    onDragStart(emitterId, 'resize-left');
  };

  const handleResizeRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(emitterId);
    onDragStart(emitterId, 'resize-right');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeEmitter(emitterId);
  };

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-md cursor-grab active:cursor-grabbing
        bg-gradient-to-r ${colorClass} 
        ${isSelected ? 'ring-2 ring-white ring-opacity-80 shadow-lg' : 'shadow'}
        transition-shadow hover:shadow-lg
        flex items-center px-2 overflow-hidden select-none`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        minWidth: '20px',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white hover:bg-opacity-30 rounded-l-md"
        onMouseDown={handleResizeLeft}
      />
      
      <div className="flex items-center gap-1 text-white text-xs font-medium whitespace-nowrap">
        <GripVertical size={12} className="opacity-70 flex-shrink-0" />
        <span className="truncate">{template?.icon} {emitter.name}</span>
      </div>

      {isSelected && width > 60 && (
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded
            bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 size={12} className="text-white" />
        </button>
      )}

      <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white hover:bg-opacity-30 rounded-r-md"
        onMouseDown={handleResizeRight}
      />
    </div>
  );
}
