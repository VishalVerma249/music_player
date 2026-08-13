import { SceneType } from '@/types/experience';

export interface SceneHandler {
  name: SceneType;
  mount(): void;
  update(delta: number): void;
  unmount(): void;
}

export class SceneManager {
  private scenes: Map<SceneType, SceneHandler> = new Map();
  private activeScene: SceneHandler | null = null;

  public registerScene(scene: SceneHandler): void {
    this.scenes.set(scene.name, scene);
  }

  public switchScene(name: SceneType): void {
    if (this.activeScene?.name === name) return;

    if (this.activeScene) {
      this.activeScene.unmount();
    }

    const nextScene = this.scenes.get(name);
    if (nextScene) {
      this.activeScene = nextScene;
      this.activeScene.mount();
    }
  }

  public getActiveSceneName(): SceneType | null {
    return this.activeScene ? this.activeScene.name : null;
  }
}
