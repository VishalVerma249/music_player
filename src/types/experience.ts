export type SceneType =
  | 'Dreamy'
  | 'Midnight'
  | 'Warm Lounge'
  | 'Retro'
  | 'Urban'
  | 'Minimal';

export interface VisualParameters {
  visualIntensity: number; // 0.0 to 1.0
  particleDensity: number; // 0.0 to 1.0
  motionSpeed: number; // 0.0 to 1.0
  glowIntensity: number; // 0.0 to 1.0
  cameraMovement: number; // 0.0 to 1.0
  grainIntensity: number; // 0.0 to 1.0
  transitionSpeed: number; // seconds
}

export interface ExperienceConfig {
  activeScene: SceneType;
  visualIntensity: number;
  motionIntensity: number;
  parameters: VisualParameters;
}
