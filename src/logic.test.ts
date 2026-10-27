import { describe, expect, it } from 'vitest';
import { resolveDurations, DEFAULT_DURATIONS_MS } from './config';
import { createRng } from './core/rng';
import { RoundClock } from './core/roundClock';
import { scoreSharpness, scoreStability, scoreStamina, scoreStillness } from './results/scoring';
import { buildLayout, createSharpness, GRID_SIZE, SHAPES, tapTile } from './scenes/sharpness/logic';
import { createStability, stepStability, STABILITY_PARAMS, type StabilityInput } from './scenes/stability/logic';
import { advanceStamina, createStamina, registerTap, scheduleBeats } from './scenes/stamina/logic';
import { continueDisturbance, createStillness, disturb, stepStillness } from './scenes/stillness/logic';

describe('config', () => {
  it('uses the 30/30/25/45 s provisional defaults', () => {
    expect(resolveDurations('')).toEqual(DEFAULT_DURATIONS_MS);
  });
  it('accepts a developer override for a 60 s Stillness review', () => {
    expect(resolveDurations('?stillness=60').stillness).toBe(60_000);
  });
  it('ignores invalid overrides', () => {
    expect(resolveDurations('?stillness=abc&stamina=1&sharpness=9999')).toEqual(DEFAULT_DURATIONS_MS);
  });
});

describe('RoundClock', () => {
  it('does not advance while paused (hidden tab / pause menu)', () => {
    let now = 0;
    const clock = new RoundClock(25_000, () => now);
    clock.start();
    now = 5_000;
    clock.pause();
    now = 60_000; // tab hidden for 55 s
    expect(clock.elapsed()).toBe(5_000);
    clock.start();
    now = 70_000;
    expect(clock.elapsed()).toBe(15_000);
    now = 999_000;
    expect(clock.elapsed()).toBe(25_000);
    expect(clock.finished).toBe(true);
  });
});

describe('Sharpness', () => {
  it('always contains exactly one target', () => {
    const rng = createRng(1);
    for (let i = 0; i < 500; i++) {
      const target = SHAPES[i % SHAPES.length];
      const tiles = buildLayout(rng, target);
      expect(tiles).toHaveLength(GRID_SIZE);
      expect(tiles.filter((t) => t === target)).toHaveLength(1);
    }
  });

  it('allows more than ten hits and keeps a valid target after each hit', () => {
    const rng = createRng(2);
    const state = createSharpness(rng);
    for (let i = 0; i < 40; i++) {
      const idx = state.tiles.indexOf(state.target);
      expect(tapTile(state, idx, rng)).toBe('hit');
      expect(state.tiles.filter((t) => t === state.target)).toHaveLength(1);
    }
    expect(state.correct).toBe(40);
    expect(state.layouts).toBe(41);
  });

  it('counts wrong taps without changing the grid', () => {
    const rng = createRng(3);
    const state = createSharpness(rng);
    const before = [...state.tiles];
    const wrong = state.tiles.findIndex((t) => t !== state.target);
    expect(tapTile(state, wrong, rng)).toBe('miss');
    expect(state.incorrect).toBe(1);
    expect(state.tiles).toEqual(before);
  });

  it('penalises indiscriminate tapping relative to accurate play', () => {
    const accurate = scoreSharpness({ correct: 20, incorrect: 0 });
    const spammy = scoreSharpness({ correct: 20, incorrect: 60 });
    expect(accurate).toBeGreaterThan(spammy);
    expect(scoreSharpness({ correct: 0, incorrect: 0 })).toBe(0);
    expect(scoreSharpness({ correct: 1000, incorrect: 0 })).toBeLessThanOrEqual(100);
  });
});

function simulateStability(
  policy: (s: ReturnType<typeof createStability>, t: number) => StabilityInput,
  seed: number,
  duration = 30_000,
) {
  const rng = createRng(seed);
  const state = createStability(rng);
  for (let t = 0; t < duration; t += 16) {
    stepStability(state, 16, policy(state, t), t / duration, rng);
  }
  return { state, score: scoreStability({ inZoneMs: state.inZoneMs, totalMs: state.totalMs, falls: state.falls }) };
}

describe('Stability', () => {
  it('scores 0 for a completely untouched round, despite automatic resets', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const { state, score } = simulateStability(() => 0, seed);
      expect(state.falls).toBeGreaterThanOrEqual(3);
      expect(state.inZoneMs).toBe(0);
      expect(score).toBe(0);
    }
  });

  it('gives almost nothing for one brief input followed by inactivity', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      // 200 ms tap at 1 s, then nothing.
      const { state, score } = simulateStability((_s, t) => (t >= 1000 && t < 1200 ? 1 : 0), seed);
      expect(state.inZoneMs).toBeLessThanOrEqual(STABILITY_PARAMS.activeWindowMs + 200);
      expect(score).toBeLessThanOrEqual(5);
    }
  });

  it('does not credit time after a reset until the player acts again', () => {
    const rng = createRng(4);
    const state = createStability(rng);
    let t = 0;
    while (state.falls === 0 && t < 20_000) {
      stepStability(state, 16, 1, 0.5, rng);
      t += 16;
    }
    const credited = state.inZoneMs;
    stepStability(state, STABILITY_PARAMS.recoverMs + 1000, 0, 0.5, rng);
    expect(state.inZoneMs).toBe(credited);
  });

  it('can be held in the safe zone with steady corrections', () => {
    // A simple human-like controller with ~150 ms reaction delay and a dead band.
    for (const seed of [1, 2, 3]) {
      const history: number[] = [];
      const { state, score } = simulateStability((s) => {
        history.push(s.angle + 0.5 * s.velocity);
        const seen = history[Math.max(0, history.length - 10)];
        if (seen > 3) return -1;
        if (seen < -3) return 1;
        return 0;
      }, seed);
      expect(state.falls).toBe(0);
      expect(score).toBeGreaterThanOrEqual(85);
    }
  });

  it('recovers after a fall so the round can continue', () => {
    const rng = createRng(4);
    const state = createStability(rng);
    let t = 0;
    while (state.falls === 0 && t < 20_000) {
      stepStability(state, 16, 1, 0.5, rng);
      t += 16;
    }
    expect(state.falls).toBe(1);
    stepStability(state, STABILITY_PARAMS.recoverMs + 16, 0, 0.5, rng);
    expect(state.fallenUntil).toBeNull();
    expect(Math.abs(state.angle)).toBeLessThan(STABILITY_PARAMS.safeDeg);
  });
});

describe('Stamina (provisional rhythm baseline)', () => {
  const duration = 25_000;

  it('schedules 1 beat/s with full windows inside the round', () => {
    const beats = scheduleBeats(duration);
    expect(beats[0]).toBe(1500);
    expect(beats.at(-1)! + 200).toBeLessThanOrEqual(duration);
    expect(beats).toHaveLength(24);
  });

  it('scores 100 for one on-time tap per beat', () => {
    const s = createStamina(duration);
    for (const b of s.beats) expect(registerTap(s, b + 120)).toBe('hit');
    advanceStamina(s, duration);
    expect(s.hits).toBe(s.beats.length);
    expect(s.misses).toBe(0);
    expect(s.bestStreak).toBe(s.beats.length);
    expect(scoreStamina({ hits: s.hits, extraTaps: s.extraTaps, scheduledBeats: s.beats.length })).toBe(100);
  });

  it('gives spam tapping a score of 0', () => {
    const s = createStamina(duration);
    for (let t = 0; t < duration; t += 50) {
      registerTap(s, t);
      advanceStamina(s, t);
    }
    expect(s.hits).toBe(s.beats.length);
    expect(scoreStamina({ hits: s.hits, extraTaps: s.extraTaps, scheduledBeats: s.beats.length })).toBe(0);
  });

  it('does not credit off-beat taps and records misses', () => {
    const s = createStamina(duration);
    for (const b of s.beats) expect(registerTap(s, b + 500)).toBe('late');
    advanceStamina(s, duration);
    expect(s.hits).toBe(0);
    expect(s.misses).toBe(s.beats.length);
    expect(scoreStamina({ hits: s.hits, extraTaps: s.extraTaps, scheduledBeats: s.beats.length })).toBe(0);
  });

  it('breaks the streak on a missed beat', () => {
    const s = createStamina(duration);
    registerTap(s, s.beats[0]);
    registerTap(s, s.beats[1]);
    advanceStamina(s, s.beats[3]);
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(2);
    expect(s.misses).toBe(1);
  });
});

describe('Stillness', () => {
  const duration = 25_000;
  function run(events: Record<number, () => void>, state = createStillness(duration)) {
    for (let t = 0; t < duration; t += 10) {
      events[t]?.();
      stepStillness(state, 10, t);
    }
    return state;
  }

  it('scores 100 without any interaction and settles visibly', () => {
    const s = run({});
    expect(scoreStillness({ undisturbedMs: s.undisturbedMs, totalMs: duration })).toBe(100);
    expect(s.energy).toBeLessThan(0.05);
  });

  it('costs score per disturbance but never ends the round', () => {
    const s = createStillness(duration);
    run({ 5000: () => disturb(s, 5000, 'water'), 15000: () => disturb(s, 15000, 'message') }, s);
    expect(s.waterTouches).toBe(1);
    expect(s.messageTaps).toBe(1);
    expect(s.undisturbedMs + s.disturbedMs).toBe(duration);
    expect(scoreStillness({ undisturbedMs: s.undisturbedMs, totalMs: duration })).toBe(76);
  });

  it('treats a held finger as a continuing disturbance', () => {
    const s = createStillness(duration);
    disturb(s, 0, 'water');
    s.holding = 1;
    for (let t = 0; t < duration; t += 10) {
      continueDisturbance(s, t);
      stepStillness(s, 10, t);
    }
    expect(scoreStillness({ undisturbedMs: s.undisturbedMs, totalMs: duration })).toBe(0);
  });
});
