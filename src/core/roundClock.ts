/**
 * Pausable round clock. Elapsed time only advances while running, so a hidden tab
 * or the pause menu never grants free progress.
 */
export class RoundClock {
  private accumulated = 0;
  private startedAt: number | null = null;

  constructor(
    readonly durationMs: number,
    private readonly now: () => number = () => performance.now(),
  ) {}

  get running(): boolean {
    return this.startedAt !== null;
  }

  start(): void {
    if (this.startedAt === null) this.startedAt = this.now();
  }

  pause(): void {
    if (this.startedAt === null) return;
    this.accumulated += this.now() - this.startedAt;
    this.startedAt = null;
  }

  /** Elapsed round time in ms, capped at the round duration. */
  elapsed(): number {
    const live = this.startedAt === null ? 0 : this.now() - this.startedAt;
    return Math.min(this.durationMs, this.accumulated + live);
  }

  remaining(): number {
    return this.durationMs - this.elapsed();
  }

  get finished(): boolean {
    return this.elapsed() >= this.durationMs;
  }
}
