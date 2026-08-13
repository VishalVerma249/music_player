export type VisualProfileType =
  | 'dreamy'
  | 'midnight'
  | 'warm-lounge'
  | 'retro'
  | 'urban'
  | 'minimal'
  | 'chill'
  | 'energetic';

export type Mood =
  | 'Calm'
  | 'Romantic'
  | 'Dreamy'
  | 'Nostalgic'
  | 'Feel Good'
  | 'Energetic'
  | 'Late Night'
  | 'Soulful'
  | 'Urban';

export type Genre =
  | 'Bollywood'
  | 'Indie'
  | 'Punjabi'
  | 'Hip-Hop'
  | 'Retro'
  | 'Alternative'
  | 'Electronic';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  provider: string;
  providerTrackId: string;
  coverArt?: string;
  duration?: number; // duration in seconds
  genre: Genre | Genre[];
  language?: string;
  mood: Mood | Mood[];
  energy: number; // 0.0 to 1.0
  visualProfile: VisualProfileType;
  isActive: boolean;
}
