import { Play, Pause, SkipBack, SkipForward, RotateCcw, Download, Upload, RefreshCw } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useRef } from 'react';

export function PlaybackControls() {
  const {
    playback,
    togglePlay,
    setCurrentTime,
    toggleLoop,
    setPlaybackRate,
    exportProject,
    importProject,
    resetToDemo,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleExport = () => {
    const json = exportProject();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'valentine-particles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        importProject(content);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * playback.duration;
    setCurrentTime(newTime);
  };

  const progressPercent = (playback.currentTime / playback.duration) * 100;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentTime(0)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
          title="回到开始"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={togglePlay}
          className={`p-2.5 rounded-lg transition-all
            ${playback.isPlaying
              ? 'bg-rose-500/80 text-white hover:bg-rose-500'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-400 hover:to-pink-400'
            }`}
          title={playback.isPlaying ? '暂停' : '播放'}
        >
          {playback.isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <button
          onClick={() => setCurrentTime(playback.duration)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
          title="跳到结尾"
        >
          <SkipForward size={18} />
        </button>
      </div>

      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs font-mono text-gray-400 w-20 text-right">
          {formatTime(playback.currentTime)}
        </span>

        <div
          className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer relative group"
          onClick={handleProgressClick}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
        </div>

        <span className="text-xs font-mono text-gray-500 w-20">
          {formatTime(playback.duration)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={playback.playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded
            text-gray-300 focus:outline-none focus:border-rose-400 cursor-pointer"
        >
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>

        <button
          onClick={toggleLoop}
          className={`p-2 rounded-lg transition-all
            ${playback.isLooping
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          title={playback.isLooping ? '循环播放中' : '循环播放'}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-600 mx-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={handleImportClick}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
          title="导入配置"
        >
          <Upload size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleExport}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
          title="导出配置"
        >
          <Download size={18} />
        </button>

        <button
          onClick={resetToDemo}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
          title="重置为示例"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
}
