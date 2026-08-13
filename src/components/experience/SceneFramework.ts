import { SceneManager, SceneHandler } from '@/experience/SceneManager';
import { SceneType } from '@/types/experience';

const createDefaultScene = (name: SceneType): SceneHandler => ({
  name,
  mount: () => {
    // Console tracing for scene activation in dev mode
  },
  update: (_delta: number) => {
    // Frame delta update hook
  },
  unmount: () => {
    // Cleanup hook
  },
});

export function registerDefaultScenes(manager: SceneManager): void {
  const sceneTypes: SceneType[] = [
    'Dreamy',
    'Midnight',
    'Warm Lounge',
    'Retro',
    'Urban',
    'Minimal',
  ];

  sceneTypes.forEach((type) => {
    manager.registerScene(createDefaultScene(type));
  });
}
