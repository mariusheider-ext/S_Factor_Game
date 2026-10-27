import { createRng } from '../../core/rng';
import type { ChallengeDefinition } from '../../flow/challenge';
import { scoreSharpness } from '../../results/scoring';
import { h } from '../../ui/dom';
import { MESSAGE_TEMPLATES, MessageLane, messageSchedule } from '../../ui/messageLane';
import { createSharpness, tapTile } from './logic';
import { SHAPE_LABELS, shapeSvg } from './shapes';

/** Ignore taps briefly after the grid changes so a double tap is not judged on the new grid. */
const RESHUFFLE_LOCK_MS = 150;
const MESSAGE_COUNT = 4;

export const sharpness: ChallengeDefinition = {
  id: 'sharpness',
  tutorial: {
    steps: ['This is the symbol to find.', 'Tap the matching tile. Try it now.', 'Each match brings a new grid. Wrong taps count against you.'],
    mount(stage, goTo) {
      // Same grid and cue components as the round, with a local practice state.
      const rng = createRng(11);
      const state = createSharpness(rng);
      let step = 0;
      const cueSymbol = h('span', { class: 'sh-cue-symbol' });
      const cue = h('div', { class: 'sh-cue tut-glow' }, [h('span', { class: 'sh-cue-label' }, ['Find']), cueSymbol]);
      const tiles = Array.from({ length: 16 }, (_, i) =>
        h('button', { class: 'sh-tile', type: 'button', onclick: () => onTile(i) }),
      );
      const render = () => {
        cueSymbol.innerHTML = shapeSvg(state.target);
        tiles.forEach((tile, i) => {
          tile.innerHTML = shapeSvg(state.tiles[i]);
          tile.setAttribute('aria-label', SHAPE_LABELS[state.tiles[i]]);
          tile.classList.toggle('tut-glow', step === 1 && state.tiles[i] === state.target);
        });
      };
      const onTile = (i: number) => {
        const result = tapTile(state, i, rng);
        if (result === 'hit' && step < 2) {
          step = 2;
          goTo(2);
        }
        render();
        tiles[i].classList.remove('hit', 'miss');
        void tiles[i].offsetWidth;
        tiles[i].classList.add(result);
      };
      stage.classList.add('sharpness');
      stage.append(cue, h('div', { class: 'sh-grid', role: 'group', 'aria-label': 'Practice grid' }, tiles));
      render();
      const timer = setTimeout(() => {
        if (step > 0) return;
        step = 1;
        cue.classList.remove('tut-glow');
        goTo(1);
        render();
      }, 1600);
      return () => clearTimeout(timer);
    },
  },

  mount(ctx) {
    const state = createSharpness(ctx.rng);
    let lockedUntil = 0;
    let distractionTaps = 0;

    const cueSymbol = h('span', { class: 'sh-cue-symbol' });
    const hitsEl = h('b', {}, ['0']);
    const missEl = h('b', {}, ['0']);
    const lane = new MessageLane({
      onShown: (t) => ctx.messageShown(t),
      onTap: (t) => {
        distractionTaps++;
        ctx.messageTapped(t);
      },
    });

    const tiles = Array.from({ length: 16 }, (_, i) =>
      h('button', {
        class: 'sh-tile',
        type: 'button',
        onclick: () => onTile(i),
      }),
    );
    const grid = h('div', { class: 'sh-grid', role: 'group', 'aria-label': 'Symbol grid' }, tiles);

    ctx.playfield.classList.add('sharpness');
    ctx.playfield.append(
      h('div', { class: 'sh-top' }, [
        h('div', { class: 'sh-cue' }, [h('span', { class: 'sh-cue-label' }, ['Find']), cueSymbol]),
        h('div', { class: 'sh-stats', 'aria-live': 'off' }, [
          h('span', {}, ['Hits ', hitsEl]),
          h('span', {}, ['Misses ', missEl]),
        ]),
      ]),
      lane.el,
      grid,
    );

    function render() {
      cueSymbol.innerHTML = shapeSvg(state.target);
      cueSymbol.setAttribute('aria-label', `Find the ${SHAPE_LABELS[state.target]}`);
      state.tiles.forEach((shape, i) => {
        tiles[i].innerHTML = shapeSvg(shape);
        tiles[i].setAttribute('aria-label', SHAPE_LABELS[shape]);
      });
      hitsEl.textContent = String(state.correct);
      missEl.textContent = String(state.incorrect);
    }

    function flash(tile: HTMLElement, cls: string) {
      tile.classList.remove('hit', 'miss');
      void tile.offsetWidth;
      tile.classList.add(cls);
    }

    function onTile(index: number) {
      if (ctx.isPaused()) return;
      const now = ctx.elapsed();
      if (now < lockedUntil) return;
      ctx.interacted();
      const result = tapTile(state, index, ctx.rng);
      if (result === 'hit') lockedUntil = now + RESHUFFLE_LOCK_MS;
      render();
      flash(tiles[index], result);
    }

    render();
    const schedule = messageSchedule(ctx.durationMs, MESSAGE_COUNT);
    let nextMessage = 0;

    return {
      step(_dt, elapsed) {
        if (nextMessage < schedule.length && elapsed >= schedule[nextMessage]) {
          lane.show(MESSAGE_TEMPLATES[nextMessage % MESSAGE_TEMPLATES.length], elapsed);
          nextMessage++;
        }
        lane.tick(elapsed);
      },
      outcome() {
        const raw = {
          correct: state.correct,
          incorrect: state.incorrect,
          distractionTaps,
          messagesShown: nextMessage,
        };
        return {
          score: scoreSharpness(raw),
          rawMetrics: raw,
          summary: `${state.correct} ${state.correct === 1 ? 'hit' : 'hits'} · ${state.incorrect} ${state.incorrect === 1 ? 'miss' : 'misses'}`,
        };
      },
      destroy() {
        lane.destroy();
      },
    };
  },
};
