// Provisional rhythm baseline for Stamina (see docs/DECISIONS.md). The
// energy-management alternative has NOT been selected and is not implemented.

export const STAMINA_PARAMS = {
  beatIntervalMs: 1000, // 1 beat per second
  windowMs: 200, // ± timing window around each beat
  leadInMs: 1500, // first beat after the round starts
};

export type TapResult = 'hit' | 'early' | 'late' | 'extra';

export interface StaminaState {
  beats: number[];
  credited: boolean[];
  resolved: boolean[];
  hits: number;
  extraTaps: number;
  misses: number;
  streak: number;
  bestStreak: number;
}

/** Beat times (ms) whose full timing window fits inside the round. */
export function scheduleBeats(durationMs: number, params = STAMINA_PARAMS): number[] {
  const beats: number[] = [];
  for (let t = params.leadInMs; t + params.windowMs <= durationMs; t += params.beatIntervalMs) {
    beats.push(t);
  }
  return beats;
}

export function createStamina(durationMs: number, params = STAMINA_PARAMS): StaminaState {
  const beats = scheduleBeats(durationMs, params);
  return {
    beats,
    credited: beats.map(() => false),
    resolved: beats.map(() => false),
    hits: 0,
    extraTaps: 0,
    misses: 0,
    streak: 0,
    bestStreak: 0,
  };
}

/**
 * Registers a tap at round time t. At most one tap is credited per beat; every
 * other tap counts as an extra tap and breaks the streak, so tapping faster
 * than the beat never helps.
 */
export function registerTap(state: StaminaState, t: number, params = STAMINA_PARAMS): TapResult {
  let nearest = -1;
  let nearestDist = Infinity;
  for (let i = 0; i < state.beats.length; i++) {
    const dist = Math.abs(t - state.beats[i]);
    if (dist < nearestDist) {
      nearest = i;
      nearestDist = dist;
    }
  }
  if (nearest >= 0 && nearestDist <= params.windowMs && !state.credited[nearest]) {
    state.credited[nearest] = true;
    state.resolved[nearest] = true;
    state.hits++;
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    return 'hit';
  }
  state.extraTaps++;
  state.streak = 0;
  if (nearest < 0 || nearestDist <= params.windowMs) return 'extra';
  return t < state.beats[nearest] ? 'early' : 'late';
}

/** Marks beats whose window has passed without a tap as missed. Returns the number newly missed. */
export function advanceStamina(state: StaminaState, t: number, params = STAMINA_PARAMS): number {
  let missed = 0;
  for (let i = 0; i < state.beats.length; i++) {
    if (state.resolved[i] || state.beats[i] + params.windowMs >= t) continue;
    state.resolved[i] = true;
    state.misses++;
    state.streak = 0;
    missed++;
  }
  return missed;
}

/** Index of a beat whose window contains t, or -1. */
export function activeBeat(state: StaminaState, t: number, params = STAMINA_PARAMS): number {
  return state.beats.findIndex((b) => Math.abs(t - b) <= params.windowMs);
}
