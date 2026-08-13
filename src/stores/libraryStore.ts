import { create } from 'zustand';
import { Song, Genre, Mood } from '@/types/song';
import { Playlist } from '@/types/playlist';

interface LibraryState {
  songs: Song[];
  playlists: Playlist[];
  searchQuery: string;
  selectedGenre: Genre | 'All';
  selectedMood: Mood | 'All';
  isLoading: boolean;
}

interface LibraryActions {
  setSongs: (songs: Song[]) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: Genre | 'All') => void;
  setSelectedMood: (mood: Mood | 'All') => void;
}

export type LibraryStore = LibraryState & LibraryActions;

export const useLibraryStore = create<LibraryStore>((set) => ({
  songs: [],
  playlists: [],
  searchQuery: '',
  selectedGenre: 'All',
  selectedMood: 'All',
  isLoading: false,

  setSongs: (songs) => set({ songs }),
  setPlaylists: (playlists) => set({ playlists }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedGenre: (selectedGenre) => set({ selectedGenre }),
  setSelectedMood: (selectedMood) => set({ selectedMood }),
}));
