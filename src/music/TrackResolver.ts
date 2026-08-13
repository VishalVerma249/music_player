import { Song } from '@/types/song';

export class TrackResolver {
  public static resolveProviderTrackId(song: Song): string {
    return song.providerTrackId || song.id;
  }

  public static isPlayable(song: Song): boolean {
    return song.isActive && Boolean(song.providerTrackId);
  }
}
