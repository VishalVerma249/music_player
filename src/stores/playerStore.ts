import { create } from 'zustand';
import { Song } from '@/types/song';
import { PlaybackState, RepeatMode } from '@/types/player';

interface PlayerActions {
  setCurrentTrack: (track: Song | null) => void;
  setQueue: (queue: Song[], index?: number) => void;
  setQueueIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setCrossfadeDuration: (seconds: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type PlayerStore = PlaybackState & PlayerActions;

const initialPlaybackState: PlaybackState = {
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

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...initialPlaybackState,

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setQueue: (queue, index = 0) => set({ queue, queueIndex: index }),
  setQueueIndex: (queueIndex) => set({ queueIndex }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  setRepeatMode: (repeatMode) => set({ repeatMode }),
  setCrossfadeDuration: (crossfadeDuration) => set({ crossfadeDuration }),
  setError: (error) => set({ error }),
  reset: () => set(initialPlaybackState),
}));
