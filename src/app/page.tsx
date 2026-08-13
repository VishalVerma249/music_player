import React from 'react';
import { ENVIRONMENT } from '@/config/environment';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-zinc-950">
      {/* Background Ambient Glow FX */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[140px] pointer-events-none animate-ambient-pulse" />
      <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Experience Card */}
      <div className="relative z-10 max-w-xl w-full glass-panel rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl space-y-8 text-center glow-subtle">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Phase 00 Foundation Complete
        </div>

        {/* Branding & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient font-outfit">
            A U R A
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-md mx-auto">
            Cinematic Ambient Music Experience & Salon Atmosphere Engine
          </p>
        </div>

        {/* Phase 00 Architecture Specs */}
        <div className="grid grid-cols-2 gap-3 text-left pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
            <span className="text-zinc-500 block uppercase font-mono text-[10px]">Framework</span>
            <span className="text-zinc-200 font-semibold">Next.js 15 App Router</span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
            <span className="text-zinc-500 block uppercase font-mono text-[10px]">Architecture</span>
            <span className="text-zinc-200 font-semibold">Decoupled Audio Engine</span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
            <span className="text-zinc-500 block uppercase font-mono text-[10px]">State Management</span>
            <span className="text-zinc-200 font-semibold">Zustand Global Stores</span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
            <span className="text-zinc-500 block uppercase font-mono text-[10px]">Music Storage</span>
            <span className="text-emerald-400 font-semibold">Zero Audio Blobs (Clean)</span>
          </div>
        </div>

        {/* App Version & Environment */}
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-white/5">
          <span>{ENVIRONMENT.appName}</span>
          <span>v{ENVIRONMENT.appVersion}</span>
        </div>
      </div>
    </main>
  );
}
