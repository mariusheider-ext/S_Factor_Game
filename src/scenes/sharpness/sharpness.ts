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
  instruction: 'Tap the tile that matches the symbol shown above the grid.',
  howTo: ['Each match brings a new grid.', 'Wrong taps count against you, so aim before you tap.'],
  simulatedMessages: true,
  startLabel: 'Start',

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
