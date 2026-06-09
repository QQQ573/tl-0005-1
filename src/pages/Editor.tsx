import { ParticleCanvas } from '@/components/ParticleCanvas/ParticleCanvas';
import { Timeline } from '@/components/Timeline/Timeline';
import { TemplateLibrary } from '@/components/TemplateLibrary/TemplateLibrary';
import { PropertyPanel } from '@/components/PropertyPanel/PropertyPanel';
import { PlaybackControls } from '@/components/PlaybackControls/PlaybackControls';
import { useEditorStore } from '@/store/useEditorStore';
import { Heart, Sparkles } from 'lucide-react';

export function Editor() {
  const {
    project,
    playback,
    setCurrentTime,
  } = useEditorStore();

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Heart className="text-rose-400 fill-rose-400" size={24} />
            <Sparkles className="absolute -top-1 -right-1 text-amber-400" size={14} />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-rose-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
              情人节粒子编排器
            </h1>
            <p className="text-xs text-gray-500">Valentine Particle Choreographer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            发射器: {project.emitters.length} 个
          </span>
        </div>
      </header>

      <PlaybackControls />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 flex-shrink-0">
          <TemplateLibrary />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative min-h-0">
            <ParticleCanvas
              emitters={project.emitters}
              currentTime={playback.currentTime}
              isPlaying={playback.isPlaying}
              isLooping={playback.isLooping}
              playbackRate={playback.playbackRate}
              duration={project.duration}
              onTimeUpdate={handleTimeUpdate}
              className="absolute inset-0"
            />

            <div className="absolute top-4 left-4 px-3 py-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
              <p className="text-xs text-gray-300">
                <span className="text-rose-400">♥</span> 预览模式
              </p>
            </div>
          </div>

          <div className="h-72 flex-shrink-0">
            <Timeline />
          </div>
        </div>

        <div className="w-64 flex-shrink-0">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}
