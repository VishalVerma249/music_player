import { Song } from './song';

export type RepeatMode = 'off' | 'track' | 'queue';

export interface PlaybackState {
  currentTrack: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  crossfadeDuration: number; // 0, 3, 5, 8 seconds
  error: string | null;
}

export interface AudioAnalysis {
  bass: number; // 0.0 to 1.0
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
  overallEnergy: number;
}
