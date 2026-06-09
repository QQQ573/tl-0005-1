import { create } from 'zustand';
import type {
  ParticleProject,
  ParticleEmitter,
  PlaybackState,
  EmitterConfig,
  EmitterType,
} from '@/types/particle';
import { getTemplateByType, getDefaultConfig } from '@/templates/emitters';
import { demoProject } from '@/templates/demoProject';

interface EditorState {
  project: ParticleProject;
  playback: PlaybackState;
  selectedEmitterId: string | null;
  zoom: number;
  scrollLeft: number;
}

interface EditorActions {
  setProject: (project: ParticleProject) => void;
  addEmitter: (type: EmitterType, startTime: number, track: number) => void;
  removeEmitter: (id: string) => void;
  updateEmitter: (id: string, updates: Partial<ParticleEmitter>) => void;
  updateEmitterConfig: (id: string, config: Partial<EmitterConfig>) => void;
  selectEmitter: (id: string | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  setPlaybackRate: (rate: number) => void;
  setZoom: (zoom: number) => void;
  setScrollLeft: (scroll: number) => void;
  setDuration: (duration: number) => void;
  exportProject: () => string;
  importProject: (json: string) => void;
  resetToDemo: () => void;
  getSelectedEmitter: () => ParticleEmitter | null;
}

let emitterIdCounter = 0;
const generateId = () => `emitter-${Date.now()}-${++emitterIdCounter}`;

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  project: demoProject,
  playback: {
    isPlaying: false,
    currentTime: 0,
    duration: demoProject.duration,
    isLooping: true,
    playbackRate: 1,
  },
  selectedEmitterId: null,
  zoom: 50,
  scrollLeft: 0,

  setProject: (project) =>
    set({
      project,
      playback: {
        ...get().playback,
        duration: project.duration,
        currentTime: 0,
      },
      selectedEmitterId: null,
    }),

  addEmitter: (type, startTime, track) => {
    const template = getTemplateByType(type);
    const duration = 10;
    const newEmitter: ParticleEmitter = {
      id: generateId(),
      type,
      name: template?.name || type,
      startTime,
      endTime: startTime + duration,
      track,
      config: getDefaultConfig(type),
    };
    set((state) => ({
      project: {
        ...state.project,
        emitters: [...state.project.emitters, newEmitter],
      },
      selectedEmitterId: newEmitter.id,
    }));
  },

  removeEmitter: (id) =>
    set((state) => ({
      project: {
        ...state.project,
        emitters: state.project.emitters.filter((e) => e.id !== id),
      },
      selectedEmitterId: state.selectedEmitterId === id ? null : state.selectedEmitterId,
    })),

  updateEmitter: (id, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        emitters: state.project.emitters.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      },
    })),

  updateEmitterConfig: (id, config) =>
    set((state) => ({
      project: {
        ...state.project,
        emitters: state.project.emitters.map((e) =>
          e.id === id ? { ...e, config: { ...e.config, ...config } } : e
        ),
      },
    })),

  selectEmitter: (id) => set({ selectedEmitterId: id }),

  setPlaying: (isPlaying) =>
    set((state) => ({
      playback: { ...state.playback, isPlaying },
    })),

  setCurrentTime: (time) => {
    const state = get();
    const clampedTime = Math.max(0, Math.min(time, state.playback.duration));
    set({
      playback: { ...state.playback, currentTime: clampedTime },
    });
  },

  togglePlay: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: !state.playback.isPlaying },
    })),

  toggleLoop: () =>
    set((state) => ({
      playback: { ...state.playback, isLooping: !state.playback.isLooping },
    })),

  setPlaybackRate: (rate) =>
    set((state) => ({
      playback: { ...state.playback, playbackRate: rate },
    })),

  setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(200, zoom)) }),

  setScrollLeft: (scrollLeft) => set({ scrollLeft }),

  setDuration: (duration) =>
    set((state) => ({
      project: { ...state.project, duration },
      playback: { ...state.playback, duration },
    })),

  exportProject: () => {
    const state = get();
    return JSON.stringify(state.project, null, 2);
  },

  importProject: (json) => {
    try {
      const project = JSON.parse(json) as ParticleProject;
      if (project.version && Array.isArray(project.emitters)) {
        get().setProject(project);
      }
    } catch {
      console.error('Failed to import project');
    }
  },

  resetToDemo: () => {
    get().setProject(demoProject);
  },

  getSelectedEmitter: () => {
    const state = get();
    if (!state.selectedEmitterId) return null;
    return state.project.emitters.find((e) => e.id === state.selectedEmitterId) || null;
  },
}));
