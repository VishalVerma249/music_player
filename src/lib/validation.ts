import { Song } from '@/types/song';

export function isValidSong(song: unknown): song is Song {
  if (!song || typeof song !== 'object') return false;
  const s = song as Partial<Song>;
  return (
    typeof s.id === 'string' &&
    typeof s.title === 'string' &&
    typeof s.artist === 'string' &&
    typeof s.provider === 'string' &&
    typeof s.providerTrackId === 'string'
  );
}
