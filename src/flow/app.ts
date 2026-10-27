import { analytics } from '../analytics/analytics';
import { FACTOR_ORDER, resolveDurations, type FactorId } from '../config';
import { createRng, randomSeed } from '../core/rng';
import { RoundClock } from '../core/roundClock';
import { parent } from '../integration/parent';
import { renderResult, type RunResult } from '../results/resultView';
import { sharpness } from '../scenes/sharpness/sharpness';
import { stability } from '../scenes/stability/stability';
import { stamina } from '../scenes/stamina/stamina';
import { stillness } from '../scenes/stillness/stillness';
import { formatSeconds, h, prefersReducedMotion } from '../ui/dom';
import { FACTORS, factorIcon } from '../ui/factors';
import { sound } from '../ui/sound';
import type { ChallengeContext, ChallengeDefinition, ChallengeInstance } from './challenge';

const CHALLENGES: Record<FactorId, ChallengeDefinition> = { sharpness, stability, stamina, stillness };

const PAUSE_ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

const pad2 = (n: number) => n.toString().padStart(2, '0');

/** Central flow manager: Home → four challenges → Result. Owns transitions and progress. */
export class App {
  private readonly durations = resolveDurations(location.search);
  /** Incremented per run so a stale run can never continue after exit/replay. */
  private runToken = 0;

  constructor(private readonly root: HTMLElement) {}

  boot(): void {
    analytics.track('game_view');
    parent.ready();
    this.showHome();
  }

  private mountScreen(screen: HTMLElement): void {
    this.root.replaceChildren(screen);
    window.scrollTo(0, 0);
    screen.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
  }

  private soundToggle(): HTMLButtonElement {
    const btn = h('button', { class: 'sound-toggle', type: 'button', 'aria-pressed': String(sound.enabled) });
    const label = () => {
      btn.textContent = sound.enabled ? 'Sound: on' : 'Sound: off';
      btn.setAttribute('aria-pressed', String(sound.enabled));
    };
    btn.addEventListener('click', () => {
      sound.setEnabled(!sound.enabled);
      label();
    });
    label();
    return btn;
  }

  showHome(): void {
    this.runToken++;
    const list = h(
      'ul',
      { class: 'factor-list' },
      FACTOR_ORDER.map((id) =>
        h('li', {}, [
          h('span', { class: 'fl-icon', html: factorIcon(id, 28) }),
          h('span', { class: 'fl-text' }, [
            h('strong', { style: `color:${FACTORS[id].color}` }, [FACTORS[id].name]),
            h('span', {}, [FACTORS[id].theme]),
          ]),
        ]),
      ),
    );
    this.mountScreen(
      h('main', { class: 'screen home' }, [
        h('h1', { tabindex: -1, 'data-autofocus': true }, [
          h('span', { class: 'home-kicker' }, ['Think you’ve got the']),
          h('span', { class: 'home-title' }, ['S-Factor?']),
        ]),
        h('p', { class: 'lede' }, ['Four game challenges. One result card.']),
        list,
        h('div', { class: 'home-actions' }, [
          h('button', { class: 'btn primary', type: 'button', onclick: () => void this.startRun() }, ['Start']),
          this.soundToggle(),
        ]),
      ]),
    );
  }

  async startRun(): Promise<void> {
    sound.unlock();
    const token = ++this.runToken;
    analytics.newRun();
    analytics.track('game_start', { durations: FACTOR_ORDER.map((f) => this.durations[f]).join('/') });
    const wallStart = performance.now();
    const results: Partial<Record<FactorId, RunResult['challenges'][FactorId]>> = {};

    for (let i = 0; i < FACTOR_ORDER.length; i++) {
      const def = CHALLENGES[FACTOR_ORDER[i]];
      await this.showIntro(def, i);
      if (token !== this.runToken) return;
      const result = await this.runRound(def, i);
      if (token !== this.runToken) return;
      if (!result) {
        this.showHome();
        return;
      }
      results[def.id] = result;
      await this.showTransition(def, i, result.score, result.summary);
      if (token !== this.runToken) return;
    }

    const run: RunResult = {
      challenges: results as RunResult['challenges'],
      durationsMs: { ...this.durations },
      totalWallMs: Math.round(performance.now() - wallStart),
    };
    const scores = Object.fromEntries(FACTOR_ORDER.map((f) => [f, run.challenges[f].score])) as Record<FactorId, number>;
    analytics.track('game_complete', {
      ...Object.fromEntries(FACTOR_ORDER.map((f) => [`score_${f}`, scores[f]])),
      ...Object.fromEntries(FACTOR_ORDER.map((f) => [`duration_ms_${f}`, this.durations[f]])),
      total_wall_ms: run.totalWallMs,
    });
    parent.complete(scores, run.durationsMs);
    this.showResult(run);
  }

  private showResult(run: RunResult): void {
    this.mountScreen(
      renderResult(run, {
        onReplay: () => {
          analytics.track('replay_click');
          void this.startRun();
        },
      }),
    );
    analytics.track('result_view');
  }

  private showIntro(def: ChallengeDefinition, index: number): Promise<void> {
    return new Promise((resolve) => {
      const info = FACTORS[def.id];
      const children: (Node | string)[] = [
        h('p', { class: 'intro-progress' }, [`${pad2(index + 1)} / ${pad2(FACTOR_ORDER.length)}`]),
        h('span', { class: 'intro-icon', html: factorIcon(def.id, 56) }),
        h('h1', { tabindex: -1, 'data-autofocus': true, style: `color:${info.color}` }, [info.name]),
        h('p', { class: 'intro-instruction' }, [def.instruction]),
        h('ul', { class: 'intro-howto' }, def.howTo.map((line) => h('li', {}, [line]))),
      ];
      if (def.simulatedMessages) {
        children.push(
          h('p', { class: 'intro-note' }, [
            'Simulated messages will pop up during this round. They are part of the game: nothing is sent or received.',
          ]),
        );
      }
      children.push(
        h('button', { class: 'btn primary', type: 'button', onclick: () => resolve() }, [def.startLabel]),
      );
      this.mountScreen(h('main', { class: `screen intro factor-${def.id}` }, children));
      analytics.track('challenge_view', { factor: def.id, index: index + 1 });
    });
  }

  private showTransition(def: ChallengeDefinition, index: number, score: number, summary: string): Promise<void> {
    return new Promise((resolve) => {
      const last = index === FACTOR_ORDER.length - 1;
      const nextLabel = last ? 'See your S-Factor' : `Next: ${FACTORS[FACTOR_ORDER[index + 1]].name}`;
      this.mountScreen(
        h('main', { class: `screen transition factor-${def.id}` }, [
          h('span', { class: 'intro-icon', html: factorIcon(def.id, 48) }),
          h('h1', { tabindex: -1, 'data-autofocus': true }, [`${FACTORS[def.id].name} complete`]),
          h('p', { class: 'transition-score', style: `color:${FACTORS[def.id].color}` }, [
            String(score),
            h('span', {}, [' / 100']),
          ]),
          h('p', { class: 'transition-summary' }, [summary]),
          h('button', { class: 'btn primary', type: 'button', onclick: () => resolve() }, [nextLabel]),
        ]),
      );
    });
  }

  /** Runs one active round. Resolves with the result, or null on explicit exit. */
  private runRound(def: ChallengeDefinition, index: number): Promise<RunResult['challenges'][FactorId] | null> {
    return new Promise((resolve) => {
      const durationMs = this.durations[def.id];
      const clock = new RoundClock(durationMs);
      const info = FACTORS[def.id];
      const wallStart = performance.now();
      let paused = false;
      let done = false;
      let interacted = false;
      let interruptions = 0;
      let lastElapsed = 0;
      let raf = 0;

      const timerEl = h('span', { class: 'rh-timer', role: 'timer', 'aria-label': 'Time remaining' }, [
        formatSeconds(durationMs),
      ]);
      const pauseBtn = h('button', {
        class: 'rh-pause',
        type: 'button',
        'aria-label': 'Pause',
        html: PAUSE_ICON,
        onclick: () => pause('menu'),
      });
      // Shared minimal header: current factor, progress and timer only.
      const header = h('header', { class: 'round-header' }, [
        h('span', { class: 'rh-factor', style: `color:${info.color}` }, [info.name]),
        h('span', { class: 'rh-progress' }, [`${pad2(index + 1)} / ${pad2(FACTOR_ORDER.length)}`]),
        timerEl,
        pauseBtn,
      ]);
      const playfield = h('div', { class: 'playfield' });
      const controls = h('div', { class: 'controls' });
      const overlayHost = h('div');
      const screen = h('main', { class: `screen round factor-${def.id}` }, [header, playfield, controls, overlayHost]);
      this.mountScreen(screen);

      const ctx: ChallengeContext = {
        playfield,
        controls,
        durationMs,
        rng: createRng(randomSeed()),
        reducedMotion: prefersReducedMotion(),
        elapsed: () => clock.elapsed(),
        isPaused: () => paused || done,
        interacted: () => {
          if (interacted) return;
          interacted = true;
          analytics.track('challenge_first_interaction', { factor: def.id, elapsed_ms: Math.round(clock.elapsed()) });
        },
        messageShown: (t) =>
          analytics.track('distraction_shown', { factor: def.id, template_id: t.id, elapsed_ms: Math.round(clock.elapsed()) }),
        messageTapped: (t) =>
          analytics.track('distraction_tap', { factor: def.id, template_id: t.id, elapsed_ms: Math.round(clock.elapsed()) }),
      };
      const instance: ChallengeInstance = def.mount(ctx);

      const cleanup = () => {
        done = true;
        cancelAnimationFrame(raf);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('blur', onBlur);
        instance.destroy();
      };

      const finish = () => {
        const outcome = instance.outcome();
        cleanup();
        const wallMs = Math.round(performance.now() - wallStart);
        analytics.track('challenge_complete', {
          factor: def.id,
          score: outcome.score,
          elapsed_ms: durationMs,
          wall_ms: wallMs,
          interruptions,
          interacted,
          ...outcome.rawMetrics,
        });
        resolve({
          factor: def.id,
          score: outcome.score,
          rawMetrics: { ...outcome.rawMetrics, interruptions },
          summary: outcome.summary,
          configuredDurationMs: durationMs,
          wallMs,
        });
      };

      const exit = () => {
        const elapsed = Math.round(clock.elapsed());
        cleanup();
        analytics.track('challenge_exit', { factor: def.id, elapsed_ms: elapsed });
        resolve(null);
      };

      const resume = () => {
        if (!paused || done) return;
        overlayHost.replaceChildren();
        paused = false;
        clock.start();
        pauseBtn.focus({ preventScroll: true });
      };

      function pause(reason: 'menu' | 'hidden') {
        if (paused || done) return;
        paused = true;
        clock.pause();
        instance.releaseInput?.();
        if (reason === 'hidden') interruptions++;
        const resumeBtn = h('button', { class: 'btn primary', type: 'button', onclick: resume }, ['Resume']);
        overlayHost.replaceChildren(
          h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Paused' }, [
            h('div', { class: 'panel' }, [
              h('h2', {}, ['Paused']),
              h('p', {}, [
                reason === 'hidden'
                  ? 'The round paused while the game was in the background. The timer is stopped.'
                  : 'The timer is stopped.',
              ]),
              resumeBtn,
              soundToggle,
              h('button', { class: 'btn ghost', type: 'button', onclick: exit }, ['Exit to start']),
            ]),
          ]),
        );
        resumeBtn.focus({ preventScroll: true });
      }
      const soundToggle = this.soundToggle();

      const onVisibility = () => {
        if (document.visibilityState === 'hidden') pause('hidden');
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        if (paused) resume();
        else pause('menu');
      };
      // Held buttons must not stay "pressed" when the window loses focus.
      const onBlur = () => instance.releaseInput?.();
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('keydown', onKey);
      window.addEventListener('blur', onBlur);

      const frame = () => {
        if (done) return;
        if (!paused) {
          const elapsed = clock.elapsed();
          const dt = elapsed - lastElapsed;
          lastElapsed = elapsed;
          if (dt > 0) instance.step(dt, elapsed);
          const remaining = durationMs - elapsed;
          timerEl.textContent = formatSeconds(remaining);
          timerEl.classList.toggle('low', remaining <= 5000);
          if (elapsed >= durationMs) {
            finish();
            return;
          }
        }
        raf = requestAnimationFrame(frame);
      };

      clock.start();
      analytics.track('challenge_start', { factor: def.id, configured_duration_ms: durationMs });
      raf = requestAnimationFrame(frame);
    });
  }
}
