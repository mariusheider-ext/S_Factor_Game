import Phaser from 'phaser';
import type { ChallengeDefinition } from '../../flow/challenge';
import { scoreStillness } from '../../results/scoring';
import { capturePointer, h } from '../../ui/dom';
import { FACTOR_HEX } from '../../ui/factors';
import { MESSAGE_TEMPLATES, MessageLane, messageSchedule } from '../../ui/messageLane';
import { createStage, textStyle } from '../../ui/stage';
import { continueDisturbance, createStillness, disturb, disturbances, stepStillness } from './logic';

const AQUA = FACTOR_HEX.stillness;
const RIPPLE_LIFE_MS = 2400;
const DRAG_RIPPLE_EVERY_MS = 220;

interface Ripple {
  x: number; // 0–1 of playfield width
  y: number; // 0–1 of playfield height
  born: number;
}

export const stillness: ChallengeDefinition = {
  id: 'stillness',
  tutorial: {
    steps: ['Let the water settle.', 'Leave the screen untouched.'],
    mount(stage, goTo) {
      // Static preview of the same water surface; the rings fade out as it settles.
      stage.classList.add('stillness');
      stage.append(
        h('div', { class: 'water tut-water', role: 'img', 'aria-label': 'Water surface settling' }, [
          h('span', { class: 'tut-ring' }),
          h('span', { class: 'tut-ring' }),
          h('span', { class: 'tut-ring' }),
          h('span', { class: 'tut-settle' }, ['Water settling']),
        ]),
      );
      const timer = setTimeout(() => goTo(1), 2000);
      return () => clearTimeout(timer);
    },
  },

  mount(ctx) {
    const state = createStillness(ctx.durationMs);
    const ripples: Ripple[] = [];
    let now = 0;

    const lane = new MessageLane({
      onShown: (t) => ctx.messageShown(t),
      onTap: (t) => {
        ctx.messageTapped(t);
        ctx.interacted();
        disturb(state, ctx.elapsed(), 'message');
        ripples.push({ x: 0.3 + ctx.rng() * 0.4, y: 0.35 + ctx.rng() * 0.3, born: ctx.elapsed() });
      },
    });

    const water = h('div', { class: 'water', 'aria-label': 'Water surface. Leave it undisturbed.', role: 'img' });
    ctx.playfield.classList.add('stillness');
    ctx.playfield.append(lane.el, water);

    const pointers = new Map<number, number>(); // pointerId -> last ripple time
    const addRipple = (e: PointerEvent) => {
      const rect = water.getBoundingClientRect();
      ripples.push({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        born: ctx.elapsed(),
      });
      if (ripples.length > 40) ripples.shift();
    };
    water.addEventListener('pointerdown', (e) => {
      if (ctx.isPaused()) return;
      e.preventDefault();
      capturePointer(water, e.pointerId);
      ctx.interacted();
      disturb(state, ctx.elapsed(), 'water');
      pointers.set(e.pointerId, ctx.elapsed());
      state.holding = pointers.size;
      addRipple(e);
    });
    water.addEventListener('pointermove', (e) => {
      const last = pointers.get(e.pointerId);
      if (last === undefined || ctx.isPaused()) return;
      const t = ctx.elapsed();
      continueDisturbance(state, t);
      if (t - last >= DRAG_RIPPLE_EVERY_MS) {
        pointers.set(e.pointerId, t);
        addRipple(e);
      }
    });
    const release = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      state.holding = pointers.size;
    };
    water.addEventListener('pointerup', release);
    water.addEventListener('pointercancel', release);
    water.addEventListener('lostpointercapture', release);
    water.addEventListener('contextmenu', (e) => e.preventDefault());

    let g: Phaser.GameObjects.Graphics;
    let calmText: Phaser.GameObjects.Text;

    const stage = createStage(water, {
      create(scene) {
        g = scene.add.graphics();
        calmText = scene.add.text(0, 0, '', textStyle(14, '#bfeff2', false)).setOrigin(0.5, 1);
      },
      draw(_scene, w, hgt) {
        g.clear();
        const cx = w / 2;
        const cy = hgt * 0.48;
        const maxR = Math.hypot(w, hgt) * 0.55;

        // Pond: layered discs give a soft depth gradient.
        for (let i = 6; i >= 1; i--) {
          g.fillStyle(0x0d3a48, 0.1 + 0.06 * (6 - i)).fillCircle(cx, cy, (maxR * i) / 6);
        }

        // Ambient rings: their strength follows the water's remaining energy.
        const rings = 5;
        for (let k = 0; k < rings; k++) {
          const frac = ctx.reducedMotion ? (k + 0.5) / rings : (now / 2600 + k / rings) % 1;
          const alpha = state.energy * (1 - frac) * 0.7;
          if (alpha < 0.01) continue;
          g.lineStyle(2, AQUA, alpha).strokeEllipse(cx, cy, frac * maxR * 2, frac * maxR * 1.2);
        }

        // Disturbance ripples.
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          const age = now - r.born;
          if (age > RIPPLE_LIFE_MS) {
            ripples.splice(i, 1);
            continue;
          }
          const life = age / RIPPLE_LIFE_MS;
          for (let j = 0; j < 3; j++) {
            const rl = life - j * 0.12;
            if (rl <= 0) continue;
            const radius = rl * Math.min(w, hgt) * 0.45;
            g.lineStyle(2.5, 0xe8fbff, (1 - rl) * 0.8).strokeEllipse(r.x * w, r.y * hgt, radius * 2, radius * 1.3);
          }
        }

        // Settling meter: how far the water's visible motion has died down (not the player's state).
        const calm = Math.round((1 - state.energy) * 100);
        const bw = Math.min(w - 64, 280);
        const bx = (w - bw) / 2;
        const by = hgt - 28;
        g.fillStyle(0x0a2633, 0.9).fillRoundedRect(bx, by, bw, 10, 5);
        g.fillStyle(AQUA, 0.9).fillRoundedRect(bx, by, Math.max(10, (bw * calm) / 100), 10, 5);
        calmText.setPosition(w / 2, by - 6).setText(`Water settling ${calm}%`);
      },
    });

    // At least four messages; more for longer review rounds (e.g. 60 s).
    const schedule = messageSchedule(ctx.durationMs, Math.max(4, Math.round(ctx.durationMs / 10_000)), 3500, 3000);
    let nextMessage = 0;

    return {
      step(dt, elapsed) {
        now = elapsed;
        if (nextMessage < schedule.length && elapsed >= schedule[nextMessage]) {
          lane.show(MESSAGE_TEMPLATES[nextMessage % MESSAGE_TEMPLATES.length], elapsed);
          nextMessage++;
        }
        lane.tick(elapsed);
        stepStillness(state, dt, elapsed);
      },
      releaseInput() {
        pointers.clear();
        state.holding = 0;
      },
      outcome() {
        const raw = {
          undisturbedMs: Math.round(state.undisturbedMs),
          totalMs: Math.round(state.undisturbedMs + state.disturbedMs),
          waterTouches: state.waterTouches,
          messageTaps: state.messageTaps,
          messagesShown: nextMessage,
        };
        const n = disturbances(state);
        return {
          score: scoreStillness(raw),
          rawMetrics: raw,
          summary: n === 0 ? 'Undisturbed the whole time' : `${n} ${n === 1 ? 'disturbance' : 'disturbances'}`,
        };
      },
      destroy() {
        lane.destroy();
        stage.destroy();
      },
    };
  },
};
