import type { FactorId } from '../config';
import type { Rng } from '../core/rng';
import type { MessageTemplate } from '../ui/messageLane';

/** Services the flow manager provides to a running challenge. */
export interface ChallengeContext {
  /** Area between the shared header and the bottom controls. */
  playfield: HTMLElement;
  /** Bottom control area (empty unless the challenge adds controls). */
  controls: HTMLElement;
  durationMs: number;
  rng: Rng;
  reducedMotion: boolean;
  /** Current round time in ms (pauses with the round). */
  elapsed(): number;
  isPaused(): boolean;
  /** Report a genuine player action (deduplicated into challenge_first_interaction). */
  interacted(): void;
  messageShown(template: MessageTemplate): void;
  messageTapped(template: MessageTemplate): void;
}

export interface ChallengeOutcome {
  score: number;
  rawMetrics: Record<string, number>;
  /** One short line of raw results for the transition screen. */
  summary: string;
}

export interface ChallengeInstance {
  /** Advance the logic by dtMs of round time; elapsedMs is the current round time. */
  step(dtMs: number, elapsedMs: number): void;
  /** Release held inputs (called on pause / hidden tab). */
  releaseInput?(): void;
  outcome(): ChallengeOutcome;
  destroy(): void;
}

/**
 * Visual tutorial shown before a round: a frozen practice preview of the playfield
 * plus 2–3 short captions. It has no timer, scoring or messages, and it must never
 * touch round state or analytics.
 */
export interface TutorialDefinition {
  steps: string[];
  /** Builds the preview in `stage` and calls `goTo` to highlight a caption. Returns cleanup. */
  mount(stage: HTMLElement, goTo: (step: number) => void): () => void;
}

export interface ChallengeDefinition {
  id: FactorId;
  tutorial: TutorialDefinition;
  mount(ctx: ChallengeContext): ChallengeInstance;
}
