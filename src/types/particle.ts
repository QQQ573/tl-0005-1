export type EmitterType =
  | 'rose-petal'
  | 'gold-dust'
  | 'heart-glow'
  | 'firefly'
  | 'star-rain';

export interface EmitterConfig {
  density: number;
  windSpeed: number;
  windDirection: number;
  size: number;
  color: string;
  opacity: number;
  speed: number;
  spread: number;
  glow: number;
  rotationSpeed: number;
}

export interface ParticleEmitter {
  id: string;
  type: EmitterType;
  name: string;
  startTime: number;
  endTime: number;
  track: number;
  config: EmitterConfig;
}

export interface ParticleProject {
  version: string;
  duration: number;
  emitters: ParticleEmitter[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  playbackRate: number;
}

export interface EmitterTemplate {
  type: EmitterType;
  name: string;
  description: string;
  icon: string;
  defaultConfig: EmitterConfig;
}

export interface ParticleData {
  position: Float32Array;
  velocity: Float32Array;
  color: Float32Array;
  size: Float32Array;
  life: Float32Array;
  maxLife: Float32Array;
  rotation: Float32Array;
  rotationSpeed: Float32Array;
}
