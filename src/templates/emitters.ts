import type { EmitterTemplate, EmitterConfig } from '@/types/particle';

const rosePetalConfig: EmitterConfig = {
  density: 200,
  windSpeed: 0.5,
  windDirection: 45,
  size: 1.2,
  color: '#e8b4b8',
  opacity: 0.9,
  speed: 1.5,
  spread: 8,
  glow: 0.3,
  rotationSpeed: 1.0,
};

const goldDustConfig: EmitterConfig = {
  density: 500,
  windSpeed: 0.3,
  windDirection: 90,
  size: 0.3,
  color: '#d4a574',
  opacity: 0.8,
  speed: 0.8,
  spread: 10,
  glow: 1.5,
  rotationSpeed: 0.5,
};

const heartGlowConfig: EmitterConfig = {
  density: 80,
  windSpeed: 0,
  windDirection: 0,
  size: 1.5,
  color: '#ff6b8a',
  opacity: 1,
  speed: 0.5,
  spread: 5,
  glow: 2,
  rotationSpeed: 0,
};

const fireflyConfig: EmitterConfig = {
  density: 120,
  windSpeed: 0.2,
  windDirection: 180,
  size: 0.4,
  color: '#ffeb99',
  opacity: 0.9,
  speed: 0.6,
  spread: 6,
  glow: 1.8,
  rotationSpeed: 0,
};

const starRainConfig: EmitterConfig = {
  density: 300,
  windSpeed: 0.1,
  windDirection: 270,
  size: 0.25,
  color: '#ffffff',
  opacity: 0.95,
  speed: 3,
  spread: 12,
  glow: 1.2,
  rotationSpeed: 0.3,
};

export const emitterTemplates: EmitterTemplate[] = [
  {
    type: 'rose-petal',
    name: '玫瑰瓣飘落',
    description: '浪漫的玫瑰花瓣从空中缓缓飘落',
    icon: '🌹',
    defaultConfig: rosePetalConfig,
  },
  {
    type: 'gold-dust',
    name: '金粉闪烁',
    description: '金色粉末在空中飘动闪烁',
    icon: '✨',
    defaultConfig: goldDustConfig,
  },
  {
    type: 'heart-glow',
    name: '心形光点',
    description: '发光的心形粒子缓缓上升',
    icon: '💖',
    defaultConfig: heartGlowConfig,
  },
  {
    type: 'firefly',
    name: '萤火虫',
    description: '温暖的萤火虫光点在空中飞舞',
    icon: '🪲',
    defaultConfig: fireflyConfig,
  },
  {
    type: 'star-rain',
    name: '星光雨',
    description: '星光点点从夜空坠落',
    icon: '⭐',
    defaultConfig: starRainConfig,
  },
];

export function getTemplateByType(type: string): EmitterTemplate | undefined {
  return emitterTemplates.find((t) => t.type === type);
}

export function getDefaultConfig(type: string): EmitterConfig {
  const template = getTemplateByType(type);
  if (!template) {
    return {
      density: 100,
      windSpeed: 0,
      windDirection: 0,
      size: 1,
      color: '#ffffff',
      opacity: 1,
      speed: 1,
      spread: 5,
      glow: 1,
      rotationSpeed: 0.5,
    };
  }
  return { ...template.defaultConfig };
}
