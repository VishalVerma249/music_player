import { PLAYLISTS as GENERATED_PLAYLISTS } from "./tracks";
import additions from "./playlist-additions.json";

export type TrackItem = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number | null;
  duration: number | null;
  videoId: string;
};

export type Playlist = {
  id: string;
  name: string;
  tracks: TrackItem[];
};

export type PlaylistAddition = TrackItem & { playlist: string };
const persistedAdditions = additions as PlaylistAddition[];
const additionsFor = (playlist: string): TrackItem[] => persistedAdditions
  .filter((track) => track.playlist === playlist)
  .map(({ playlist: _playlist, ...track }) => track);

export function mergePlaylistAdditions(additions: readonly PlaylistAddition[]): void {
  const existingIds = new Set(Object.values(PLAYLISTS).flatMap((playlist) => playlist.tracks.map((track) => track.id)));
  const existingVideoIds = new Set(Object.values(PLAYLISTS).flatMap((playlist) => playlist.tracks.map((track) => track.videoId)));
  for (const addition of additions) {
    const playlist = PLAYLISTS[addition.playlist];
    if (!playlist || existingIds.has(addition.id) || existingVideoIds.has(addition.videoId)) continue;
    const { playlist: _playlist, ...track } = addition;
    playlist.tracks.push(track);
    existingIds.add(addition.id);
    existingVideoIds.add(addition.videoId);
  }
}

const LATE_NIGHT_DRIVE: Playlist = {
  id: "late-night-drive",
  name: "Late Night Drive",
  tracks: GENERATED_PLAYLISTS["Late Night Drive"].map((track) => ({ ...track })),
};

const DEMO_PLAYLISTS: Playlist[] = [
  {
    id: "sunday-matinee",
    name: "Sunday Matinee",
    tracks: [
      { id: "sm-01", title: "The opening credits", artist: "Rights holder upload", film: "Your film", year: 1995, duration: 201, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
      { id: "sm-02", title: "A song for the road", artist: "Rights holder upload", film: "Your film", year: 2003, duration: 234, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
      ...additionsFor("Sunday Matinee"),
    ],
  },
  {
    id: "mixtape-2000",
    name: "Mixtape 2000",
    tracks: [
      { id: "m2k-01", title: "Press play", artist: "Rights holder upload", film: "Your film", year: 2000, duration: 225, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
      { id: "m2k-02", title: "Keep the window down", artist: "Rights holder upload", film: "Your film", year: 2002, duration: 262, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
      ...additionsFor("Mixtape 2000"),
    ],
  },
];

export const PLAYLISTS: Record<string, Playlist> = Object.fromEntries(
  [LATE_NIGHT_DRIVE, ...DEMO_PLAYLISTS].map((playlist) => [playlist.name, playlist]),
);