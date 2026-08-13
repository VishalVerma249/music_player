export class CrossfadeManager {
  private durationSeconds = 3;

  constructor(durationSeconds: number = 3) {
    this.durationSeconds = durationSeconds;
  }

  public setDuration(seconds: number): void {
    this.durationSeconds = Math.max(0, seconds);
  }

  public getDuration(): number {
    return this.durationSeconds;
  }

  public shouldCrossfade(currentTime: number, totalDuration: number): boolean {
    if (this.durationSeconds <= 0 || totalDuration <= 0) return false;
    return totalDuration - currentTime <= this.durationSeconds;
  }
}
