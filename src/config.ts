// Central, adjustable configuration for the demo.
// Every value here is a PROVISIONAL default (see docs/DECISIONS.md), not a confirmed team requirement.

export type FactorId = 'sharpness' | 'stability' | 'stamina' | 'stillness';

export const FACTOR_ORDER: readonly FactorId[] = ['sharpness', 'stability', 'stamina', 'stillness'];

/** Provisional round durations (30/25/25/25 s). Final timing is an open decision. */
export const DEFAULT_DURATIONS_MS: Readonly<Record<FactorId, number>> = {
  sharpness: 30_000,
  stability: 25_000,
  stamina: 25_000,
  stillness: 25_000,
};

const MIN_OVERRIDE_S = 5;
const MAX_OVERRIDE_S = 180;

/**
 * Developer-only duration overrides via the URL, e.g. `?stillness=60` to review a
 * 60-second Stillness round. Not exposed as a player setting.
 */
export function resolveDurations(search: string): Record<FactorId, number> {
  const params = new URLSearchParams(search);
  const durations = { ...DEFAULT_DURATIONS_MS };
  for (const factor of FACTOR_ORDER) {
    const raw = params.get(factor);
    if (raw === null) continue;
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= MIN_OVERRIDE_S && seconds <= MAX_OVERRIDE_S) {
      durations[factor] = Math.round(seconds * 1000);
    }
  }
  return durations;
}

/**
 * Parent-page origin for the postMessage integration. `null` disables all outgoing
 * messages; it must be set to the agreed landing-page origin before production use.
 */
export const PARENT_ORIGIN: string | null = null;

/** Version of the outgoing integration message contract. */
export const INTEGRATION_VERSION = 1;

export const APP_VERSION = '0.1.0';
