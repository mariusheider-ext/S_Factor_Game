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

export interface ChallengeDefinition {
  id: FactorId;
  /** One short instruction shown before play. */
  instruction: string;
  /** Short how-to lines for the intro card. */
  howTo: string[];
  /** Whether the intro explains that simulated messages will appear. */
  simulatedMessages: boolean;
  /** Label for the explicit start button. */
  startLabel: string;
  mount(ctx: ChallengeContext): ChallengeInstance;
}
