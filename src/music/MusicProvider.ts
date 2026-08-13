import { Song } from '@/types/song';
import { PlaybackState } from '@/types/player';

export interface MusicProvider {
  /** Initialize provider resources/authentication */
  initialize(): Promise<void>;

  /** Retrieve track metadata by provider ID */
  getTrack(id: string): Promise<Song>;

  /** Perform track search */
  search(query: string): Promise<Song[]>;

  /** Trigger playback for a given track */
  play(track: Song): Promise<void>;

  /** Pause active playback */
  pause(): Promise<void>;

  /** Resume paused playback */
  resume(): Promise<void>;

  /** Seek to target seconds timestamp */
  seek(seconds: number): Promise<void>;

  /** Set playback volume (0.0 to 1.0) */
  setVolume(volume: number): Promise<void>;

  /** Get current provider playback status */
  getPlaybackState(): Promise<Partial<PlaybackState>>;

  /** Clean up provider instances and event handlers */
  destroy(): Promise<void>;
}
