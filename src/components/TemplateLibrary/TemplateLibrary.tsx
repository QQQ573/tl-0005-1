import { emitterTemplates } from '@/templates/emitters';
import type { EmitterType } from '@/types/particle';

const typeColors: Record<string, string> = {
  'rose-petal': 'from-rose-500/20 to-pink-600/20 border-rose-400/30 hover:border-rose-300/50',
  'gold-dust': 'from-amber-500/20 to-yellow-600/20 border-amber-400/30 hover:border-amber-300/50',
  'heart-glow': 'from-pink-500/20 to-rose-600/20 border-pink-400/30 hover:border-pink-300/50',
  'firefly': 'from-yellow-400/20 to-amber-500/20 border-yellow-400/30 hover:border-yellow-300/50',
  'star-rain': 'from-indigo-400/20 to-purple-500/20 border-indigo-400/30 hover:border-indigo-300/50',
};

export function TemplateLibrary() {
  const handleDragStart = (e: React.DragEvent, type: EmitterType) => {
    e.dataTransfer.setData('emitterType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200">发射器模板</h2>
        <p className="text-xs text-gray-500 mt-0.5">拖拽到时间轴添加效果</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {emitterTemplates.map((template) => (
          <div
            key={template.type}
            draggable
            onDragStart={(e) => handleDragStart(e, template.type)}
            className={`p-3 rounded-lg border bg-gradient-to-br ${typeColors[template.type]} 
              cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]
              backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{template.icon}</span>
              <span className="text-sm font-medium text-gray-100">{template.name}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {template.description}
            </p>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
        <p className="text-xs text-gray-500 text-center">
          💡 提示：拖拽模板到时间轴上
        </p>
      </div>
    </div>
  );
}
