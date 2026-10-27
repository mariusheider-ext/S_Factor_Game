// Outgoing postMessage contract for a future landing-page embed (proposal; see
// docs/TECHNICAL_REQUIREMENTS.md §4). Disabled unless PARENT_ORIGIN is set to the
// agreed origin, and never uses a wildcard target origin.

import { INTEGRATION_VERSION, PARENT_ORIGIN, type FactorId } from '../config';

type Message =
  | { type: 'GAME_READY' }
  | {
      type: 'GAME_COMPLETE';
      payload: { scores: Record<FactorId, number>; durationsMs: Record<FactorId, number> };
    }
  | { type: 'CONTINUE_TO_FORM' };

function post(message: Message): void {
  if (!PARENT_ORIGIN || window.parent === window) return;
  window.parent.postMessage({ source: 's-factor-game', version: INTEGRATION_VERSION, ...message }, PARENT_ORIGIN);
}

export const parent = {
  ready: () => post({ type: 'GAME_READY' }),
  complete: (scores: Record<FactorId, number>, durationsMs: Record<FactorId, number>) =>
    post({ type: 'GAME_COMPLETE', payload: { scores, durationsMs } }),
  continueToForm: () => post({ type: 'CONTINUE_TO_FORM' }),
  enabled: () => PARENT_ORIGIN !== null && window.parent !== window,
};
