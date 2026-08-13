import { SceneType, VisualParameters, ExperienceConfig } from '@/types/experience';
import { Song, VisualProfileType } from '@/types/song';
import { AudioAnalysis } from '@/types/player';

export class ExperienceEngine {
  private config: ExperienceConfig = {
    activeScene: 'Dreamy',
    visualIntensity: 0.7,
    motionIntensity: 0.6,
    parameters: {
      visualIntensity: 0.7,
      particleDensity: 0.5,
      motionSpeed: 0.4,
      glowIntensity: 0.6,
      cameraMovement: 0.3,
      grainIntensity: 0.2,
      transitionSpeed: 1.5,
    },
  };

  public resolveSceneForProfile(profile: VisualProfileType): SceneType {
    switch (profile) {
      case 'dreamy':
        return 'Dreamy';
      case 'midnight':
        return 'Midnight';
      case 'warm-lounge':
        return 'Warm Lounge';
      case 'retro':
        return 'Retro';
      case 'urban':
        return 'Urban';
      case 'minimal':
      case 'chill':
        return 'Minimal';
      case 'energetic':
        return 'Urban';
      default:
        return 'Dreamy';
    }
  }

  public computeParameters(
    song: Song | null,
    analysis?: AudioAnalysis
  ): VisualParameters {
    const energy = song?.energy ?? 0.5;
    const bass = analysis?.bass ?? 0;
    const overall = analysis?.overallEnergy ?? 0;

    return {
      visualIntensity: Math.min(1.0, this.config.visualIntensity * (0.8 + overall * 0.4)),
      particleDensity: Math.min(1.0, 0.4 + energy * 0.4),
      motionSpeed: Math.min(1.0, 0.3 + energy * 0.5 + bass * 0.2),
      glowIntensity: Math.min(1.0, 0.5 + energy * 0.3 + bass * 0.3),
      cameraMovement: 0.2 + energy * 0.3,
      grainIntensity: 0.15,
      transitionSpeed: 1.5,
    };
  }

  public setScene(scene: SceneType): void {
    this.config.activeScene = scene;
  }

  public getConfig(): ExperienceConfig {
    return { ...this.config };
  }
}
