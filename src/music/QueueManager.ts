import { RepeatMode } from '@/types/player';

export class QueueManager {
  public static getNextIndex(
    currentIndex: number,
    queueLength: number,
    repeatMode: RepeatMode,
    shuffle: boolean
  ): number | null {
    if (queueLength === 0) return null;
    if (repeatMode === 'track') return currentIndex;

    if (shuffle) {
      if (queueLength === 1) return 0;
      let nextIndex = currentIndex;
      while (nextIndex === currentIndex && queueLength > 1) {
        nextIndex = Math.floor(Math.random() * queueLength);
      }
      return nextIndex;
    }

    if (currentIndex < queueLength - 1) {
      return currentIndex + 1;
    }

    if (repeatMode === 'queue') {
      return 0;
    }

    return null;
  }

  public static getPreviousIndex(
    currentIndex: number,
    queueLength: number,
    repeatMode: RepeatMode
  ): number | null {
    if (queueLength === 0) return null;
    if (repeatMode === 'track') return currentIndex;

    if (currentIndex > 0) {
      return currentIndex - 1;
    }

    if (repeatMode === 'queue') {
      return queueLength - 1;
    }

    return 0;
  }
}
