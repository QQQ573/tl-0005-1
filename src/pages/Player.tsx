import { useEffect, useState } from 'react';
import { ParticleCanvas } from '@/components/ParticleCanvas/ParticleCanvas';
import { demoProject } from '@/templates/demoProject';
import type { ParticleProject } from '@/types/particle';
import { Play, Pause, RotateCcw, Upload } from 'lucide-react';

export function Player() {
  const [project, setProject] = useState<ParticleProject>(demoProject);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');
    if (configParam) {
      try {
        const decoded = decodeURIComponent(configParam);
        const loaded = JSON.parse(decoded) as ParticleProject;
        setProject(loaded);
      } catch {
        console.error('Failed to load config from URL');
      }
    }
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeout) {
      window.clearTimeout(hideTimeout);
    }
    const timeout = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setHideTimeout(timeout);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const content = ev.target?.result as string;
          const loaded = JSON.parse(content) as ParticleProject;
          setProject(loaded);
          setCurrentTime(0);
          setIsPlaying(true);
        } catch {
          alert('文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / project.duration) * 100;

  return (
    <div
      className="h-screen w-screen bg-black overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <ParticleCanvas
        emitters={project.emitters}
        currentTime={currentTime}
        isPlaying={isPlaying}
        isLooping={isLooping}
        playbackRate={1}
        duration={project.duration}
        onTimeUpdate={handleTimeUpdate}
        className="absolute inset-0"
      />

      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500
          ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white/80">情人节粒子效果</h1>
              <p className="text-sm text-white/50">Valentine Particle Show</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono text-white/70">
                {formatTime(currentTime)}
              </p>
              <p className="text-xs text-white/40">
                / {formatTime(project.duration)}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-4 mb-4 pointer-events-auto">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg
              bg-white/10 backdrop-blur-sm text-white/70 text-sm cursor-pointer
              hover:bg-white/20 transition-colors">
              <Upload size={16} />
              <span>加载配置</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white
                hover:bg-white/20 transition-colors pointer-events-auto"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={toggleLoop}
              className={`p-3 rounded-full backdrop-blur-sm transition-colors pointer-events-auto
                ${isLooping ? 'bg-rose-500/30 text-rose-300' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              <RotateCcw size={20} />
            </button>

            <div className="flex-1 h-1 bg-white/20 rounded-full pointer-events-auto">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-white/30 text-center pointer-events-none">
            移动鼠标显示控制 · 按 F11 全屏
          </p>
        </div>
      </div>
    </div>
  );
}
