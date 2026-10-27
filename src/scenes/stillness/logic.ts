// Stillness: the water settles on its own; any water touch or message reaction
// is a recoverable disturbance. Values are tuning placeholders.

export const STILLNESS_PARAMS = {
  /** Time after a disturbance that does not count as undisturbed. */
  recoveryWindowMs: 3000,
  /** Energy added to the water by one disturbance (energy is 0–1). */
  disturbanceEnergy: 0.35,
  /** Settling time constant as a fraction of the round duration. */
  settleFraction: 0.25,
};

export type DisturbanceKind = 'water' | 'message';

export interface StillnessState {
  durationMs: number;
  energy: number;
  waterTouches: number;
  messageTaps: number;
  undisturbedMs: number;
  disturbedMs: number;
  lastDisturbanceAt: number;
  /** Number of pointers currently held on the water. */
  holding: number;
}

export function createStillness(durationMs: number): StillnessState {
  return {
    durationMs,
    energy: 1,
    waterTouches: 0,
    messageTaps: 0,
    undisturbedMs: 0,
    disturbedMs: 0,
    lastDisturbanceAt: -Infinity,
    holding: 0,
  };
}

export function disturb(state: StillnessState, t: number, kind: DisturbanceKind): void {
  if (kind === 'water') state.waterTouches++;
  else state.messageTaps++;
  state.lastDisturbanceAt = t;
  state.energy = Math.min(1, state.energy + STILLNESS_PARAMS.disturbanceEnergy);
}

/** Keeps the disturbance window open while a finger rests on or drags across the water. */
export function continueDisturbance(state: StillnessState, t: number): void {
  state.lastDisturbanceAt = t;
  state.energy = Math.min(1, state.energy + 0.02);
}

export function stepStillness(state: StillnessState, dtMs: number, t: number): void {
  const p = STILLNESS_PARAMS;
  const disturbed = state.holding > 0 || t - state.lastDisturbanceAt < p.recoveryWindowMs;
  if (disturbed) state.disturbedMs += dtMs;
  else state.undisturbedMs += dtMs;
  const tau = state.durationMs * p.settleFraction;
  state.energy *= Math.exp(-dtMs / tau);
}

export function disturbances(state: StillnessState): number {
  return state.waterTouches + state.messageTaps;
}
