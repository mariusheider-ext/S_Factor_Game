// Pure, deterministic score functions. Each maps raw gameplay metrics from one
// playthrough to a 0–100 game-challenge score. All are PLACEHOLDERS to be tuned
// after playtesting; they are not assessments of real-world ability.

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export interface SharpnessMetrics {
  correct: number;
  incorrect: number;
}

/** GAME_DESIGN §4 placeholder: min(100, round(100 × correct / max(1, correct + 2 × incorrect + 6))). */
export function scoreSharpness({ correct, incorrect }: SharpnessMetrics): number {
  return clampScore((100 * correct) / Math.max(1, correct + 2 * incorrect + 6));
}

export interface StabilityMetrics {
  inZoneMs: number;
  totalMs: number;
  falls: number;
}

export const STABILITY_FALL_PENALTY = 5;

/** Share of round time inside the safe zone, minus a small penalty per fall. */
export function scoreStability({ inZoneMs, totalMs, falls }: StabilityMetrics): number {
  if (totalMs <= 0) return 0;
  return clampScore((100 * inZoneMs) / totalMs - STABILITY_FALL_PENALTY * falls);
}

export interface StaminaMetrics {
  hits: number;
  extraTaps: number;
  scheduledBeats: number;
}

/** DECISIONS proposal: clamp(round(100 × max(0, hits − 0.5 × extraTaps) / scheduledBeats), 0, 100). */
export function scoreStamina({ hits, extraTaps, scheduledBeats }: StaminaMetrics): number {
  if (scheduledBeats <= 0) return 0;
  return clampScore((100 * Math.max(0, hits - 0.5 * extraTaps)) / scheduledBeats);
}

export interface StillnessMetrics {
  undisturbedMs: number;
  totalMs: number;
}

/** Share of round time not within the recovery window after a disturbance. */
export function scoreStillness({ undisturbedMs, totalMs }: StillnessMetrics): number {
  if (totalMs <= 0) return 0;
  return clampScore((100 * undisturbedMs) / totalMs);
}
