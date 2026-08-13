'use client';

import React from 'react';
import {
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  Music,
  ListMusic,
  SlidersHorizontal,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { useUIStore } from '@/stores/uiStore';

export const NowPlayingBarPlaceholder: React.FC = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const toggleQueue = useUIStore((state) => state.toggleQueue);
  const toggleLibrary = useUIStore((state) => state.toggleLibrary);
  const toggleSettings = useUIStore((state) => state.toggleSettings);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-5xl glass-panel rounded-2xl p-3 md:p-4 border border-white/10 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
            {currentTrack?.coverArt ? (
              // eslint-disable-next-next/no-img-element
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-5 h-5 text-zinc-500 animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 truncate tracking-tight">
              {currentTrack ? currentTrack.title : 'Ready for Music'}
            </h3>
            <p className="text-xs text-zinc-400 truncate">
              {currentTrack ? currentTrack.artist : 'Atmospheric Salon Playlist'}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            className="w-11 h-11 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </button>
          <button
            className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer & Volume Controls */}
        <div className="hidden sm:flex items-center gap-2 text-zinc-400">
          <button
            onClick={toggleLibrary}
            className="p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Library"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={toggleQueue}
            className="p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSettings}
            className="p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-zinc-300" />
          </div>
        </div>
      </div>
    </div>
  );
};
