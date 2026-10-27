import Phaser from 'phaser';
import type { ChallengeDefinition } from '../../flow/challenge';
import { scoreStamina } from '../../results/scoring';
import { h } from '../../ui/dom';
import { FACTOR_HEX } from '../../ui/factors';
import { sound } from '../../ui/sound';
import { createStage, textStyle } from '../../ui/stage';
import { activeBeat, advanceStamina, createStamina, registerTap, STAMINA_PARAMS, type TapResult } from './logic';

const BLUE = FACTOR_HEX.stamina;
const IVORY = 0xf5efe3;
const CORAL = 0xff7a6b;
const LOOKAHEAD_MS = 2200;

const FEEDBACK: Record<TapResult | 'missed', { text: string; color: string }> = {
  hit: { text: 'On beat!', color: '#7fc0ff' },
  early: { text: 'Too early', color: '#ffb547' },
  late: { text: 'Too late', color: '#ffb547' },
  extra: { text: 'Extra tap', color: '#ff9a8c' },
  missed: { text: 'Missed', color: '#ff9a8c' },
};

export const stamina: ChallengeDefinition = {
  id: 'stamina',
  instruction: 'Tap once on every beat to keep the runner going.',
  howTo: [
    'Tap when a marker reaches the ring.',
    'Steady timing builds your streak. Extra taps break it.',
  ],
  simulatedMessages: false,
  startLabel: 'Start',

  mount(ctx) {
    const state = createStamina(ctx.durationMs);
    let now = 0;
    let speed = 0.35;
    let legPhase = 0;
    let groundOffset = 0;
    let stumbleUntil = -1;
    let feedback: { key: TapResult | 'missed'; at: number } | null = null;
    let tapPulseAt = -1000;
    let nextTickBeat = 0;

    function tap() {
      if (ctx.isPaused()) return;
      ctx.interacted();
      const t = ctx.elapsed();
      const result = registerTap(state, t);
      feedback = { key: result, at: t };
      tapPulseAt = t;
      if (result === 'hit') speed = Math.min(1, speed + 0.1);
      else stumbleUntil = t + 350;
    }

    const pad = h('button', { class: 'tap-pad', type: 'button', 'aria-label': 'Tap on the beat' }, ['TAP']);
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      tap();
    });
    pad.addEventListener('contextmenu', (e) => e.preventDefault());
    ctx.controls.append(pad);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (!e.repeat) tap();
    };
    window.addEventListener('keydown', onKey);

    let g: Phaser.GameObjects.Graphics;
    let streakText: Phaser.GameObjects.Text;
    let feedbackText: Phaser.GameObjects.Text;

    const stage = createStage(ctx.playfield, {
      create(scene) {
        g = scene.add.graphics();
        streakText = scene.add.text(0, 14, '', textStyle(15, '#c9d6df', false)).setOrigin(0.5, 0);
        feedbackText = scene.add.text(0, 0, '', textStyle(20)).setOrigin(0.5);
      },
      draw(_scene, w, hgt) {
        g.clear();
        const groundY = hgt * 0.56;
        const trackY = hgt * 0.8;
        const hitX = Math.max(56, w * 0.2);

        // Ground with moving dashes; speed reflects the player's pacing.
        g.lineStyle(2, 0x2a4256, 1).lineBetween(0, groundY, w, groundY);
        g.lineStyle(3, 0x2a4256, 1);
        const dash = 40;
        const offset = ctx.reducedMotion ? 0 : groundOffset % dash;
        for (let x = -offset; x < w; x += dash) g.lineBetween(x, groundY + 10, x + 16, groundY + 10);

        // Runner silhouette with procedural legs.
        const stumbling = now < stumbleUntil;
        const rx = w * 0.32;
        const L = Math.min(hgt * 0.3, 120);
        const lean = stumbling ? -0.25 : 0.12 + 0.18 * speed;
        const hipX = rx;
        const hipY = groundY - 0.48 * L;
        const swing = Math.sin(legPhase) * 0.6 * (0.4 + speed);
        const leg = (phase: number) => {
          const kneeX = hipX + Math.sin(phase) * 0.22 * L;
          const kneeY = hipY + 0.26 * L;
          const footX = kneeX + Math.sin(phase - 0.8) * 0.18 * L;
          const footY = Math.min(groundY, kneeY + 0.24 * L);
          g.lineBetween(hipX, hipY, kneeX, kneeY);
          g.lineBetween(kneeX, kneeY, footX, footY);
        };
        g.lineStyle(Math.max(5, L * 0.06), stumbling ? CORAL : BLUE, 1);
        leg(swing);
        leg(-swing);
        const shX = hipX + Math.sin(lean) * 0.32 * L;
        const shY = hipY - Math.cos(lean) * 0.32 * L;
        g.lineBetween(hipX, hipY, shX, shY);
        g.lineBetween(shX, shY, shX + Math.sin(-swing) * 0.2 * L, shY + 0.18 * L);
        g.lineBetween(shX, shY, shX + Math.sin(swing) * 0.2 * L, shY + 0.18 * L);
        g.fillStyle(stumbling ? CORAL : BLUE, 1).fillCircle(shX + Math.sin(lean) * 0.12 * L, shY - 0.12 * L, L * 0.09);

        // Beat track: markers travel toward the ring and should be tapped on arrival.
        g.lineStyle(2, 0x2a4256, 1).lineBetween(hitX, trackY, w, trackY);
        const pxPerMs = (w - hitX - 16) / LOOKAHEAD_MS;
        state.beats.forEach((b, i) => {
          if (state.resolved[i] && state.credited[i]) return;
          const dt = b - now;
          if (dt > LOOKAHEAD_MS || dt < -STAMINA_PARAMS.windowMs - 250) return;
          const x = hitX + dt * pxPerMs;
          const missed = state.resolved[i] && !state.credited[i];
          g.fillStyle(missed ? CORAL : IVORY, missed ? 0.5 : 0.9).fillCircle(x, trackY, 9);
        });
        const inWindow = activeBeat(state, now) >= 0;
        const pulse = Math.max(0, 1 - (now - tapPulseAt) / 200);
        g.lineStyle(4, BLUE, 1).strokeCircle(hitX, trackY, 22 + pulse * 6);
        if (inWindow) g.fillStyle(BLUE, 0.35).fillCircle(hitX, trackY, 22);

        streakText.setPosition(w / 2, 14).setText(`Streak ${state.streak}  ·  Best ${state.bestStreak}`);
        if (feedback && now - feedback.at < 600) {
          const f = FEEDBACK[feedback.key];
          feedbackText.setVisible(true).setText(f.text).setColor(f.color).setPosition(hitX + 70, trackY - 44);
        } else {
          feedbackText.setVisible(false);
        }
      },
    });

    return {
      step(dt, elapsed) {
        now = elapsed;
        const missed = advanceStamina(state, elapsed);
        if (missed > 0) {
          feedback = { key: 'missed', at: elapsed };
          speed = Math.max(0.2, speed - 0.2 * missed);
        }
        while (nextTickBeat < state.beats.length && state.beats[nextTickBeat] <= elapsed) {
          sound.tick();
          nextTickBeat++;
        }
        const target = 0.35 + 0.65 * Math.min(1, state.streak / 6);
        speed += (target - speed) * Math.min(1, dt / 600);
        legPhase += speed * dt * 0.014;
        groundOffset += speed * dt * 0.35;
      },
      outcome() {
        advanceStamina(state, ctx.durationMs + STAMINA_PARAMS.windowMs + 1);
        const raw = {
          hits: state.hits,
          misses: state.misses,
          extraTaps: state.extraTaps,
          bestStreak: state.bestStreak,
          scheduledBeats: state.beats.length,
        };
        return {
          score: scoreStamina(raw),
          rawMetrics: raw,
          summary: `${state.hits}/${state.beats.length} beats · best streak ${state.bestStreak}`,
        };
      },
      destroy() {
        window.removeEventListener('keydown', onKey);
        stage.destroy();
      },
    };
  },
};
