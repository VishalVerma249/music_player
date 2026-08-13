import { VisualProfileType } from '@/types/song';

export interface VisualProfileDefinition {
  id: VisualProfileType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
}

export const VISUAL_PROFILES: Record<VisualProfileType, VisualProfileDefinition> = {
  dreamy: {
    id: 'dreamy',
    name: 'Dreamy Ether',
    primaryColor: '#2d1b4e',
    secondaryColor: '#1c1033',
    accentColor: '#9d4edd',
    glowColor: 'rgba(157, 78, 221, 0.4)',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Velvet',
    primaryColor: '#0a0e17',
    secondaryColor: '#05070c',
    accentColor: '#3a86ff',
    glowColor: 'rgba(58, 134, 255, 0.35)',
  },
  'warm-lounge': {
    id: 'warm-lounge',
    name: 'Warm Amber Lounge',
    primaryColor: '#2b1e16',
    secondaryColor: '#1a100b',
    accentColor: '#f77f00',
    glowColor: 'rgba(247, 127, 0, 0.35)',
  },
  retro: {
    id: 'retro',
    name: 'Neon Retro',
    primaryColor: '#20002c',
    secondaryColor: '#000000',
    accentColor: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.4)',
  },
  urban: {
    id: 'urban',
    name: 'Urban Pulse',
    primaryColor: '#18181b',
    secondaryColor: '#09090b',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Monochrome',
    primaryColor: '#121212',
    secondaryColor: '#080808',
    accentColor: '#e4e4e7',
    glowColor: 'rgba(228, 228, 231, 0.25)',
  },
  chill: {
    id: 'chill',
    name: 'Chill Aurora',
    primaryColor: '#0d2818',
    secondaryColor: '#05100a',
    accentColor: '#2ec4b6',
    glowColor: 'rgba(46, 196, 182, 0.35)',
  },
  energetic: {
    id: 'energetic',
    name: 'Electric Neon',
    primaryColor: '#2b001e',
    secondaryColor: '#12000d',
    accentColor: '#ff0055',
    glowColor: 'rgba(255, 0, 85, 0.45)',
  },
};
