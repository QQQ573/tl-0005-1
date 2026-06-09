import { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { EmitterClip } from './EmitterClip';
import type { EmitterType } from '@/types/particle';

const TRACK_HEIGHT = 48;
const TRACK_COUNT = 6;
const TIMELINE_HEADER_HEIGHT = 32;

export function Timeline() {
  const {
    project,
    playback,
    selectedEmitterId,
    zoom,
    scrollLeft,
    selectEmitter,
    updateEmitter,
    setCurrentTime,
    setScrollLeft,
    addEmitter,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    emitterId: string;
    type: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    startStartTime: number;
    startEndTime: number;
  } | null>(null);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const dragTypeRef = useRef<'move' | 'resize-left' | 'resize-right' | null>(null);

  const pixelsPerSecond = zoom;
  const totalWidth = project.duration * pixelsPerSecond;

  const handleClipDragStart = useCallback(
    (emitterId: string, type: 'move' | 'resize-left' | 'resize-right') => {
      const emitter = project.emitters.find((e) => e.id === emitterId);
      if (!emitter) return;

      dragTypeRef.current = type;
      setDragState({
        emitterId,
        type,
        startX: 0,
        startStartTime: emitter.startTime,
        startEndTime: emitter.endTime,
      });
    },
    [project.emitters]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + scrollLeft;
        const timeDelta = mouseX / pixelsPerSecond;
        const startX = dragState.startStartTime * pixelsPerSecond;
        const dx = mouseX - startX;
        const timeDx = dx / pixelsPerSecond;

        if (dragState.type === 'move') {
          const duration = dragState.startEndTime - dragState.startStartTime;
          let newStart = dragState.startStartTime + timeDx;
          newStart = Math.max(0, Math.min(newStart, project.duration - duration));
          updateEmitter(dragState.emitterId, {
            startTime: newStart,
            endTime: newStart + duration,
          });
        } else if (dragState.type === 'resize-left') {
          let newStart = dragState.startStartTime + timeDx;
          newStart = Math.max(0, Math.min(newStart, dragState.startEndTime - 0.5));
          updateEmitter(dragState.emitterId, { startTime: newStart });
        } else if (dragState.type === 'resize-right') {
          let newEnd = dragState.startEndTime + timeDx;
          newEnd = Math.max(dragState.startStartTime + 0.5, Math.min(newEnd, project.duration));
          updateEmitter(dragState.emitterId, { endTime: newEnd });
        }
      }

      if (isScrubbing && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + scrollLeft;
        const time = Math.max(0, Math.min(mouseX / pixelsPerSecond, project.duration));
        setCurrentTime(time);
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      dragTypeRef.current = null;
      setIsScrubbing(false);
    };

    if (dragState || isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, isScrubbing, scrollLeft, pixelsPerSecond, project.duration, updateEmitter, setCurrentTime]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsScrubbing(true);
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + scrollLeft;
    const time = Math.max(0, Math.min(mouseX / pixelsPerSecond, project.duration));
    setCurrentTime(time);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const emitterType = e.dataTransfer.getData('emitterType') as EmitterType;
    if (!emitterType) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top - TIMELINE_HEADER_HEIGHT;
    const track = Math.floor(y / TRACK_HEIGHT);
    const startTime = Math.max(0, x / pixelsPerSecond);

    if (track >= 0 && track < TRACK_COUNT) {
      addEmitter(emitterType, startTime, track);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectEmitter(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const renderTimeMarks = () => {
    const marks = [];
    const step = zoom < 30 ? 2 : zoom < 80 ? 1 : 0.5;
    
    for (let t = 0; t <= project.duration; t += step) {
      const left = t * pixelsPerSecond;
      marks.push(
        <div
          key={t}
          className="absolute top-0 bottom-0 border-l border-white border-opacity-10"
          style={{ left: `${left}px` }}
        >
          <span className="absolute -top-0.5 left-1 text-xs text-gray-400 font-mono">
            {formatTime(t)}
          </span>
        </div>
      );
    }
    return marks;
  };

  const playheadLeft = playback.currentTime * pixelsPerSecond;

  const emittersByTrack: Record<number, typeof project.emitters> = {};
  project.emitters.forEach((e) => {
    if (!emittersByTrack[e.track]) {
      emittersByTrack[e.track] = [];
    }
    emittersByTrack[e.track].push(e);
  });

  return (
    <div className="flex flex-col h-full bg-gray-900 border-t border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">时间轴</span>
          <span className="text-xs text-gray-500">
            {formatTime(playback.currentTime)} / {formatTime(project.duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">缩放: {zoom}%</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden cursor-default"
        onScroll={handleScroll}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ scrollBehavior: dragState || isScrubbing ? 'auto' : 'smooth' }}
      >
        <div
          className="relative"
          style={{
            width: `${Math.max(totalWidth, 1000)}px`,
            height: `${TIMELINE_HEADER_HEIGHT + TRACK_COUNT * TRACK_HEIGHT}px`,
          }}
          onClick={handleBackgroundClick}
        >
          <div
            className="absolute top-0 left-0 right-0 h-8 bg-gray-800 border-b border-gray-700 cursor-pointer"
            onMouseDown={handleHeaderMouseDown}
          >
            {renderTimeMarks()}
          </div>

          <div
            className="absolute top-8 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ left: `${playheadLeft}px` }}
          >
            <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
          </div>

          {Array.from({ length: TRACK_COUNT }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-b border-gray-700 bg-gray-850"
              style={{
                top: `${TIMELINE_HEADER_HEIGHT + i * TRACK_HEIGHT}px`,
                height: `${TRACK_HEIGHT}px`,
                backgroundColor: i % 2 === 0 ? 'rgba(31, 41, 55, 0.5)' : 'rgba(17, 24, 39, 0.5)',
              }}
            >
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                轨道 {i + 1}
              </div>
            </div>
          ))}

          {project.emitters.map((emitter) => (
            <div
              key={emitter.id}
              className="absolute"
              style={{
                top: `${TIMELINE_HEADER_HEIGHT + emitter.track * TRACK_HEIGHT}px`,
                left: 0,
                right: 0,
                height: `${TRACK_HEIGHT}px`,
              }}
            >
              <EmitterClip
                emitterId={emitter.id}
                isSelected={selectedEmitterId === emitter.id}
                pixelsPerSecond={pixelsPerSecond}
                onSelect={selectEmitter}
                onDragStart={handleClipDragStart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
