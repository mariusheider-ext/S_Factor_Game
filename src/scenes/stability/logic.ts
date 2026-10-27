import { between, type Rng } from '../../core/rng';

// Simplified inverted-pendulum model in degrees and seconds. Values are tuning
// placeholders chosen so that doing nothing falls repeatedly while steady
// corrections keep the figure inside the broad safe zone.
export const STABILITY_PARAMS = {
  gravity: 2.2, // lean amplification (1/s²)
  control: 55, // corrective acceleration while a button is held (deg/s²)
  damping: 1.6, // velocity damping (1/s)
  safeDeg: 12, // half-width of the green safe zone
  fallDeg: 32, // lean at which the figure falls
  recoverMs: 1200, // pause after a fall before balance is restored
  pushStart: 6, // push magnitude at the start of the round (deg/s²)
  pushEnd: 16, // push magnitude at the end of the round
  pushChangeMinMs: 1500,
  pushChangeMaxMs: 3000,
};

export type StabilityInput = -1 | 0 | 1;

export interface StabilityState {
  angle: number;
  velocity: number;
  push: number;
  pushTarget: number;
  nextPushChangeAt: number;
  fallenUntil: number | null;
  falls: number;
  inZoneMs: number;
  totalMs: number;
  /** Elapsed round time of the last step, used to time falls and push changes. */
  time: number;
}

export function createStability(rng: Rng): StabilityState {
  const p = STABILITY_PARAMS;
  return {
    angle: 0,
    velocity: 0,
    push: 0,
    pushTarget: (rng() < 0.5 ? -1 : 1) * p.pushStart,
    nextPushChangeAt: between(rng, p.pushChangeMinMs, p.pushChangeMaxMs),
    fallenUntil: null,
    falls: 0,
    inZoneMs: 0,
    totalMs: 0,
    time: 0,
  };
}

const MAX_SUBSTEP_MS = 16;

/** Advances the simulation by dtMs of round time. `progress` is elapsed/duration (0–1). */
export function stepStability(
  state: StabilityState,
  dtMs: number,
  input: StabilityInput,
  progress: number,
  rng: Rng,
): void {
  let remaining = dtMs;
  while (remaining > 0) {
    const dt = Math.min(MAX_SUBSTEP_MS, remaining);
    substep(state, dt, input, progress, rng);
    remaining -= dt;
  }
}

function substep(state: StabilityState, dtMs: number, input: StabilityInput, progress: number, rng: Rng): void {
  const p = STABILITY_PARAMS;
  state.time += dtMs;
  state.totalMs += dtMs;

  if (state.time >= state.nextPushChangeAt) {
    const magnitude = p.pushStart + (p.pushEnd - p.pushStart) * Math.min(1, progress);
    const sign = rng() < 0.5 ? -1 : 1;
    state.pushTarget = sign * magnitude * between(rng, 0.5, 1);
    state.nextPushChangeAt = state.time + between(rng, p.pushChangeMinMs, p.pushChangeMaxMs);
  }
  const dt = dtMs / 1000;
  state.push += (state.pushTarget - state.push) * Math.min(1, dt * 2);

  if (state.fallenUntil !== null) {
    if (state.time >= state.fallenUntil) {
      state.fallenUntil = null;
      state.angle = 0;
      state.velocity = 0;
      state.push = 0;
    }
    return;
  }

  const accel = p.gravity * state.angle + state.push + input * p.control - p.damping * state.velocity;
  state.velocity += accel * dt;
  state.angle += state.velocity * dt;

  if (Math.abs(state.angle) >= p.fallDeg) {
    state.angle = Math.sign(state.angle) * p.fallDeg;
    state.velocity = 0;
    state.falls++;
    state.fallenUntil = state.time + p.recoverMs;
    return;
  }
  if (Math.abs(state.angle) <= p.safeDeg) state.inZoneMs += dtMs;
}
