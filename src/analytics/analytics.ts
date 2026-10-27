// Single typed analytics entry point with a local debug adapter. Nothing is sent
// over the network; a production provider is still to be chosen with the
// landing-page team. Never put personal data or message bodies into properties.

import { APP_VERSION } from '../config';

export type AnalyticsEventName =
  | 'game_view'
  | 'game_start'
  | 'challenge_view'
  | 'challenge_start'
  | 'challenge_first_interaction'
  | 'challenge_complete'
  | 'challenge_exit'
  | 'game_complete'
  | 'result_view'
  | 'replay_click'
  | 'share_click'
  | 'continue_click'
  | 'distraction_shown'
  | 'distraction_tap';
// form_view / form_submit_success belong to the landing-page owner and are
// intentionally not part of the game's event set.

export type AnalyticsProps = Record<string, string | number | boolean | null>;

export interface AnalyticsRecord {
  event: AnalyticsEventName;
  props: AnalyticsProps;
}

export interface AnalyticsAdapter {
  send(record: AnalyticsRecord): void;
}

/** Keeps events in memory (inspectable as window.__sFactorEvents) and logs them in dev / ?debug mode. */
export class DebugAdapter implements AnalyticsAdapter {
  readonly log: AnalyticsRecord[] = [];
  constructor(private readonly verbose: boolean) {}
  send(record: AnalyticsRecord): void {
    this.log.push(record);
    if (this.verbose) console.debug('[analytics]', record.event, record.props);
  }
}

function ephemeralId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

class Analytics {
  /** Ephemeral page-session id; never persisted. */
  readonly sessionId = ephemeralId();
  runId: string | null = null;
  attempt = 0;
  constructor(private adapter: AnalyticsAdapter) {}

  setAdapter(adapter: AnalyticsAdapter): void {
    this.adapter = adapter;
  }

  newRun(): void {
    this.runId = ephemeralId();
    this.attempt++;
  }

  track(event: AnalyticsEventName, props: AnalyticsProps = {}): void {
    this.adapter.send({
      event,
      props: {
        session_id: this.sessionId,
        run_id: this.runId,
        attempt: this.attempt,
        app_version: APP_VERSION,
        ts: Date.now(),
        ...props,
      },
    });
  }
}

export const debugAdapter = new DebugAdapter(
  import.meta.env.DEV || new URLSearchParams(location.search).has('debug'),
);
export const analytics = new Analytics(debugAdapter);

declare global {
  interface Window {
    __sFactorEvents?: AnalyticsRecord[];
  }
}
window.__sFactorEvents = debugAdapter.log;
