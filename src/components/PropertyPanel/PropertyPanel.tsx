import { useEditorStore } from '@/store/useEditorStore';
import { getTemplateByType } from '@/templates/emitters';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

function SliderControl({ label, value, min, max, step, unit = '', onChange }: SliderControlProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-xs text-gray-300 font-mono">
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer
          accent-rose-400 hover:accent-rose-300 transition-all"
      />
    </div>
  );
}

export function PropertyPanel() {
  const selectedEmitterId = useEditorStore((s) => s.selectedEmitterId);
  const emitters = useEditorStore((s) => s.project.emitters);
  const updateEmitterConfig = useEditorStore((s) => s.updateEmitterConfig);
  const updateEmitter = useEditorStore((s) => s.updateEmitter);

  const emitter = emitters.find((e) => e.id === selectedEmitterId);
  const template = emitter ? getTemplateByType(emitter.type) : null;

  if (!emitter) {
    return (
      <div className="h-full flex flex-col bg-gray-900 border-l border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-200">属性面板</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-30">✨</div>
            <p className="text-sm text-gray-500">选择一个发射器</p>
            <p className="text-xs text-gray-600 mt-1">查看和编辑参数</p>
          </div>
        </div>
      </div>
    );
  }

  const { config } = emitter;

  return (
    <div className="h-full flex flex-col bg-gray-900 border-l border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200">属性面板</h2>
        <p className="text-xs text-gray-500 mt-0.5">{template?.icon} {emitter.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">基本信息</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">名称</label>
              <input
                type="text"
                value={emitter.name}
                onChange={(e) => updateEmitter(emitter.id, { name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded
                  text-gray-200 focus:outline-none focus:border-rose-400 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">开始时间</label>
                <input
                  type="number"
                  value={emitter.startTime.toFixed(1)}
                  onChange={(e) => updateEmitter(emitter.id, { startTime: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded
                    text-gray-200 focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">结束时间</label>
                <input
                  type="number"
                  value={emitter.endTime.toFixed(1)}
                  onChange={(e) => updateEmitter(emitter.id, { endTime: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded
                    text-gray-200 focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">粒子参数</h3>
          <div className="space-y-4">
            <SliderControl
              label="密度"
              value={config.density}
              min={10}
              max={1000}
              step={10}
              unit=" 个/秒"
              onChange={(v) => updateEmitterConfig(emitter.id, { density: v })}
            />
            <SliderControl
              label="大小"
              value={config.size}
              min={0.1}
              max={5}
              step={0.1}
              onChange={(v) => updateEmitterConfig(emitter.id, { size: v })}
            />
            <SliderControl
              label="速度"
              value={config.speed}
              min={0.1}
              max={10}
              step={0.1}
              unit=" m/s"
              onChange={(v) => updateEmitterConfig(emitter.id, { speed: v })}
            />
            <SliderControl
              label="不透明度"
              value={config.opacity}
              min={0.1}
              max={1}
              step={0.05}
              onChange={(v) => updateEmitterConfig(emitter.id, { opacity: v })}
            />
            <SliderControl
              label="扩散范围"
              value={config.spread}
              min={1}
              max={20}
              step={0.5}
              unit=" m"
              onChange={(v) => updateEmitterConfig(emitter.id, { spread: v })}
            />
            <SliderControl
              label="发光强度"
              value={config.glow}
              min={0}
              max={2}
              step={0.1}
              onChange={(v) => updateEmitterConfig(emitter.id, { glow: v })}
            />
            <SliderControl
              label="旋转速度"
              value={config.rotationSpeed}
              min={0}
              max={3}
              step={0.1}
              onChange={(v) => updateEmitterConfig(emitter.id, { rotationSpeed: v })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">风力</h3>
          <div className="space-y-4">
            <SliderControl
              label="风速"
              value={config.windSpeed}
              min={-5}
              max={5}
              step={0.1}
              onChange={(v) => updateEmitterConfig(emitter.id, { windSpeed: v })}
            />
            <SliderControl
              label="风向"
              value={config.windDirection}
              min={0}
              max={360}
              step={5}
              unit="°"
              onChange={(v) => updateEmitterConfig(emitter.id, { windDirection: v })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">颜色</h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.color}
              onChange={(e) => updateEmitterConfig(emitter.id, { color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={config.color}
              onChange={(e) => updateEmitterConfig(emitter.id, { color: e.target.value })}
              className="flex-1 px-2 py-1.5 text-sm font-mono bg-gray-800 border border-gray-700 rounded
                text-gray-200 focus:outline-none focus:border-rose-400 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
