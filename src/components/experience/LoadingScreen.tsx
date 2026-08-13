'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Music2, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  onEnter: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6 overflow-hidden select-none">
      {/* Background Cinematic Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/25 rounded-full blur-[150px] pointer-events-none animate-ambient-pulse" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Intro Card */}
      <div className="relative z-10 max-w-lg w-full glass-panel rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl space-y-8 text-center glow-subtle">
        {/* Logo Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-500/20 border border-purple-400/30 flex items-center justify-center shadow-inner">
          <Music2 className="w-8 h-8 text-purple-300 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-gradient font-outfit uppercase">
            A U R A
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-light tracking-wide">
            Cinematic Audio Atmosphere Engine
          </p>
        </div>

        {/* Progress & Interaction Zone */}
        <div className="space-y-6 pt-2">
          {!isReady ? (
            <div className="space-y-3">
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-300 transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>Initializing Audio Engine...</span>
                <span>{progress}%</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onEnter}
              className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm tracking-wider uppercase shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden border border-white/20"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">ENTER EXPERIENCE</span>
            </button>
          )}
        </div>

        {/* Footer Notice */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-2 border-t border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Interactive Audio Permission Required for Seamless Playback</span>
        </div>
      </div>
    </div>
  );
};
