import { create } from 'zustand';
import { SceneType, VisualParameters } from '@/types/experience';

interface ExperienceState {
  activeScene: SceneType;
  visualIntensity: number; // 0 to 1
  motionIntensity: number; // 0 to 1
  parameters: VisualParameters;
}

interface ExperienceActions {
  setActiveScene: (scene: SceneType) => void;
  setVisualIntensity: (intensity: number) => void;
  setMotionIntensity: (intensity: number) => void;
  setParameters: (params: Partial<VisualParameters>) => void;
}

export type ExperienceStore = ExperienceState & ExperienceActions;

export const useExperienceStore = create<ExperienceStore>((set) => ({
  activeScene: 'Dreamy',
  visualIntensity: 0.8,
  motionIntensity: 0.6,
  parameters: {
    visualIntensity: 0.8,
    particleDensity: 0.6,
    motionSpeed: 0.5,
    glowIntensity: 0.7,
    cameraMovement: 0.3,
    grainIntensity: 0.15,
    transitionSpeed: 1.5,
  },

  setActiveScene: (activeScene) => set({ activeScene }),
  setVisualIntensity: (visualIntensity) => set({ visualIntensity }),
  setMotionIntensity: (motionIntensity) => set({ motionIntensity }),
  setParameters: (params) =>
    set((state) => ({ parameters: { ...state.parameters, ...params } })),
}));
