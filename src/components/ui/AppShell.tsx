'use client';

import React from 'react';
import { Sparkles, Maximize2, Monitor, Disc } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useExperienceStore } from '@/stores/experienceStore';
import { NowPlayingBarPlaceholder } from '@/components/player/NowPlayingBarPlaceholder';
import { SceneType } from '@/types/experience';

export const AppShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const isFullscreen = useUIStore((state) => state.isFullscreen);
  const setIsFullscreen = useUIStore((state) => state.setIsFullscreen);

  const activeScene = useExperienceStore((state) => state.activeScene);
  const setActiveScene = useExperienceStore((state) => state.setActiveScene);

  const scenes: SceneType[] = [
    'Dreamy',
    'Midnight',
    'Warm Lounge',
    'Retro',
    'Urban',
    'Minimal',
  ];

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between select-none overflow-hidden">
      {/* Top Header Navigation */}
      <header className="relative z-30 w-full p-4 md:p-6 flex items-center justify-between pointer-events-auto">
        {/* Branding Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg">
            <Disc className="w-5 h-5 text-purple-300 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-widest text-gradient font-outfit uppercase">
              AURA
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wide">
              CINEMATIC SALON AUDIO
            </p>
          </div>
        </div>

        {/* Scene Selector & Mode Toggles */}
        <div className="flex items-center gap-3">
          {/* Active Scene Dropdown */}
          <div className="relative hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border border-white/10 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={activeScene}
              onChange={(e) => setActiveScene(e.target.value as SceneType)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer pr-1"
            >
              {scenes.map((scene) => (
                <option key={scene} value={scene} className="bg-zinc-900 text-zinc-100">
                  {scene} Scene
                </option>
              ))}
            </select>
          </div>

          {/* Kiosk Mode Toggle */}
          <button
            onClick={() => setMode(mode === 'normal' ? 'kiosk' : 'normal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              mode === 'kiosk'
                ? 'bg-purple-600/30 border-purple-400/50 text-purple-200 shadow-lg'
                : 'glass-panel text-zinc-300 hover:text-white border-white/10'
            }`}
            title="Toggle Kiosk Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {mode === 'kiosk' ? 'Kiosk Mode' : 'Standard'}
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleFullscreenToggle}
            className="p-2 rounded-full glass-panel text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Central Viewport Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        {children}
      </main>

      {/* Floating Bottom Now Playing Bar */}
      {mode !== 'kiosk' && <NowPlayingBarPlaceholder />}
    </div>
  );
};
