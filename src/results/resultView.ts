import { analytics } from '../analytics/analytics';
import { FACTOR_ORDER, type FactorId } from '../config';
import { parent } from '../integration/parent';
import { h } from '../ui/dom';
import { FACTORS, factorIcon } from '../ui/factors';

export interface ChallengeResult {
  factor: FactorId;
  score: number;
  rawMetrics: Record<string, number>;
  summary: string;
  configuredDurationMs: number;
  wallMs: number;
}

/** Scores are computed by the flow before this view exists, so result visibility (or a later agreed gate) never affects scoring. */
export interface RunResult {
  challenges: Record<FactorId, ChallengeResult>;
  durationsMs: Record<FactorId, number>;
  totalWallMs: number;
}

// Wording from docs/DECISIONS.md for the temporary, unconnected handoff step.
const HANDOFF_TEXT =
  'The proposed campaign follow-up is an Adiyogi invitation via WhatsApp after opt-in. This step is not connected in this demo.';

export function shareText(run: RunResult): string {
  const parts = FACTOR_ORDER.map((f) => `${FACTORS[f].name} ${run.challenges[f].score}`);
  return `My S-Factor: ${parts.join(' · ')}`;
}

export function renderResult(run: RunResult, opts: { onReplay: () => void }): HTMLElement {
  const status = h('p', { class: 'result-status', role: 'status' });
  const overlayHost = h('div');

  const rows = FACTOR_ORDER.map((f) => {
    const { score } = run.challenges[f];
    const info = FACTORS[f];
    return h('li', { class: 'score-row' }, [
      h('span', { class: 'sr-icon', html: factorIcon(f, 26) }),
      h('span', { class: 'sr-main' }, [
        h('span', { class: 'sr-name' }, [info.name]),
        h('span', { class: 'sr-bar', role: 'presentation' }, [
          h('span', { class: 'sr-fill', style: `width:${score}%;background:${info.color}` }),
        ]),
      ]),
      h('span', { class: 'sr-score' }, [String(score), h('small', {}, [' / 100'])]),
    ]);
  });

  const closeHandoff = () => {
    overlayHost.replaceChildren();
    continueBtn.focus({ preventScroll: true });
  };
  const continueBtn = h(
    'button',
    {
      class: 'btn primary',
      type: 'button',
      onclick: () => {
        analytics.track('continue_click');
        parent.continueToForm();
        const back = h('button', { class: 'btn primary', type: 'button', onclick: closeHandoff }, ['Back to results']);
        overlayHost.replaceChildren(
          h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Next step' }, [
            h('div', { class: 'panel' }, [h('h2', {}, ['Next step']), h('p', {}, [HANDOFF_TEXT]), back]),
          ]),
        );
        back.focus({ preventScroll: true });
      },
    },
    ['Continue'],
  );

  const share = async () => {
    const text = shareText(run);
    let method = 'none';
    try {
      if (navigator.share) {
        method = 'web_share';
        await navigator.share({ title: 'My S-Factor', text });
        status.textContent = 'Shared.';
      } else if (navigator.clipboard?.writeText) {
        method = 'clipboard';
        await navigator.clipboard.writeText(text);
        status.textContent = 'Scores copied to the clipboard.';
      } else {
        status.textContent = text;
      }
    } catch (err) {
      const cancelled = err instanceof DOMException && err.name === 'AbortError';
      status.textContent = cancelled ? 'Sharing cancelled.' : `Sharing is not available here. ${text}`;
      method += cancelled ? '_cancelled' : '_failed';
    }
    analytics.track('share_click', { method });
  };

  const detailRows = FACTOR_ORDER.flatMap((f) => {
    const r = run.challenges[f];
    const metrics = Object.entries(r.rawMetrics)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return [h('dt', {}, [`${FACTORS[f].name} (${r.configuredDurationMs / 1000}s round)`]), h('dd', {}, [metrics])];
  });

  return h('main', { class: 'screen result' }, [
    h('h1', { tabindex: -1, 'data-autofocus': true }, ['Your S-Factor']),
    h('ul', { class: 'score-card' }, rows),
    h('p', { class: 'result-help' }, ['These scores reflect this playthrough.']),
    h('div', { class: 'result-actions' }, [
      continueBtn,
      h('div', { class: 'result-secondary' }, [
        h('button', { class: 'btn ghost', type: 'button', onclick: () => void share() }, ['Share']),
        h('button', { class: 'btn ghost', type: 'button', onclick: opts.onReplay }, ['Play again']),
      ]),
    ]),
    status,
    h('details', { class: 'run-details' }, [h('summary', {}, ['Round details']), h('dl', {}, detailRows)]),
    overlayHost,
  ]);
}
