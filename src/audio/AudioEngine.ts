import { MusicProvider } from '@/music/MusicProvider';
import { Song } from '@/types/song';
import { PlaybackState } from '@/types/player';

export type StateChangeCallback = (state: Partial<PlaybackState>) => void;

export class AudioEngine {
  private provider: MusicProvider | null = null;
  private subscribers: Set<StateChangeCallback> = new Set();
  private state: PlaybackState = {
    currentTrack: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    isLoading: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    shuffle: false,
    repeatMode: 'off',
    crossfadeDuration: 3,
    error: null,
  };

  constructor(provider?: MusicProvider) {
    if (provider) {
      this.provider = provider;
    }
  }

  public setProvider(provider: MusicProvider): void {
    this.provider = provider;
  }

  public subscribe(callback: StateChangeCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(partialState: Partial<PlaybackState>): void {
    this.state = { ...this.state, ...partialState };
    this.subscribers.forEach((cb) => cb(partialState));
  }

  public async initialize(): Promise<void> {
    if (this.provider) {
      await this.provider.initialize();
    }
  }

  public async play(track: Song): Promise<void> {
    this.notifySubscribers({ isLoading: true, error: null, currentTrack: track });
    try {
      if (this.provider) {
        await this.provider.play(track);
      }
      this.notifySubscribers({ isPlaying: true, isLoading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Playback failed';
      this.notifySubscribers({ isPlaying: false, isLoading: false, error: errorMessage });
    }
  }

  public async pause(): Promise<void> {
    if (this.provider) {
      await this.provider.pause();
    }
    this.notifySubscribers({ isPlaying: false });
  }

  public async resume(): Promise<void> {
    if (this.provider) {
      await this.provider.resume();
    }
    this.notifySubscribers({ isPlaying: true });
  }

  public async seek(seconds: number): Promise<void> {
    if (this.provider) {
      await this.provider.seek(seconds);
    }
    this.notifySubscribers({ currentTime: seconds });
  }

  public async setVolume(volume: number): Promise<void> {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.provider) {
      await this.provider.setVolume(clamped);
    }
    this.notifySubscribers({ volume: clamped, isMuted: clamped === 0 });
  }

  public getState(): PlaybackState {
    return { ...this.state };
  }

  public async destroy(): Promise<void> {
    if (this.provider) {
      await this.provider.destroy();
    }
    this.subscribers.clear();
  }
}
