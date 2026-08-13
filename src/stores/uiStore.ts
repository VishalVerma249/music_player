import { create } from 'zustand';

export type UIMode = 'normal' | 'kiosk';

interface UIState {
  mode: UIMode;
  isQueueOpen: boolean;
  isLibraryOpen: boolean;
  isSettingsOpen: boolean;
  isFullscreen: boolean;
  isIntroComplete: boolean;
}

interface UIActions {
  setMode: (mode: UIMode) => void;
  toggleQueue: () => void;
  toggleLibrary: () => void;
  toggleSettings: () => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  setIntroComplete: (complete: boolean) => void;
  closeAllDrawers: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  mode: 'normal',
  isQueueOpen: false,
  isLibraryOpen: false,
  isSettingsOpen: false,
  isFullscreen: false,
  isIntroComplete: false,

  setMode: (mode) => set({ mode }),
  toggleQueue: () =>
    set((state) => ({
      isQueueOpen: !state.isQueueOpen,
      isLibraryOpen: false,
      isSettingsOpen: false,
    })),
  toggleLibrary: () =>
    set((state) => ({
      isLibraryOpen: !state.isLibraryOpen,
      isQueueOpen: false,
      isSettingsOpen: false,
    })),
  toggleSettings: () =>
    set((state) => ({
      isSettingsOpen: !state.isSettingsOpen,
      isQueueOpen: false,
      isLibraryOpen: false,
    })),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setIntroComplete: (isIntroComplete) => set({ isIntroComplete }),
  closeAllDrawers: () =>
    set({ isQueueOpen: false, isLibraryOpen: false, isSettingsOpen: false }),
}));
