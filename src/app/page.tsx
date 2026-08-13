'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useExperienceStore } from '@/stores/experienceStore';
import { LoadingScreen } from '@/components/experience/LoadingScreen';
import { ExperienceCanvas } from '@/components/experience/ExperienceCanvas';
import { AppShell } from '@/components/ui/AppShell';
import { SceneManager } from '@/experience/SceneManager';
import { registerDefaultScenes } from '@/components/experience/SceneFramework';
import { Music2, Radio } from 'lucide-react';

export default function Home() {
  const isIntroComplete = useUIStore((state) => state.isIntroComplete);
  const setIntroComplete = useUIStore((state) => state.setIntroComplete);
  const activeScene = useExperienceStore((state) => state.activeScene);

  useEffect(() => {
    const sceneManager = new SceneManager();
    registerDefaultScenes(sceneManager);
    sceneManager.switchScene(activeScene);
  }, [activeScene]);

  if (!isIntroComplete) {
    return <LoadingScreen onEnter={() => setIntroComplete(true)} />;
  }

  return (
    <>
      <ExperienceCanvas />
      <AppShell>
        {/* Central Atmospheric Centerpiece */}
        <div className="relative z-20 max-w-lg w-full glass-panel rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl space-y-6 text-center glow-subtle transition-all duration-700 animate-fade-in">
          {/* Animated Vinyl Aura Ring */}
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600/30 via-indigo-500/20 to-purple-400/30 border border-purple-400/40 flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping" />
            <Music2 className="w-10 h-10 text-purple-200 animate-pulse" />
          </div>

          {/* Title & Scene Display */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-purple-300">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{activeScene} Atmosphere Active</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient font-outfit">
              Continuous Ambient Music
            </h2>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto font-light leading-relaxed">
              Curated salon audio environment with dynamic music-reactive visuals.
            </p>
          </div>

          <div className="pt-2 text-xs text-zinc-500 font-mono">
            Phase 01 Cinematic Shell Active • Phase 02 Music Provider Next
          </div>
        </div>
      </AppShell>
    </>
  );
}
