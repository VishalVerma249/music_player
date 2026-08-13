'use client';

import React, { useRef, useEffect } from 'react';
import { useExperienceStore } from '@/stores/experienceStore';
import { VISUAL_PROFILES } from '@/experience/VisualProfile';
import { VisualProfileType } from '@/types/song';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
}

export const ExperienceCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeScene = useExperienceStore((state) => state.activeScene);
  const visualIntensity = useExperienceStore((state) => state.visualIntensity);
  const motionIntensity = useExperienceStore((state) => state.motionIntensity);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Map scene name to visual profile key
    const sceneToProfileKey: Record<string, VisualProfileType> = {
      Dreamy: 'dreamy',
      Midnight: 'midnight',
      'Warm Lounge': 'warm-lounge',
      Retro: 'retro',
      Urban: 'urban',
      Minimal: 'minimal',
    };

    const profileKey = sceneToProfileKey[activeScene] || 'dreamy';
    const profile = VISUAL_PROFILES[profileKey];

    // Particle field initialization
    const particleCount = Math.floor(50 * visualIntensity);
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4 * motionIntensity,
      vy: (Math.random() - 0.5) * 0.4 * motionIntensity,
      alpha: Math.random() * 0.5 + 0.1,
      maxAlpha: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render background radial gradient
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.2
      );
      gradient.addColorStop(0, profile.primaryColor + 'ee');
      gradient.addColorStop(0.7, profile.secondaryColor + 'fa');
      gradient.addColorStop(1, '#050508');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render animated particles
      ctx.fillStyle = profile.accentColor;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.globalAlpha = p.alpha;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeScene, visualIntensity, motionIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out"
    />
  );
};
