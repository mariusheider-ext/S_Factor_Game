import Phaser from 'phaser';
import type { ChallengeDefinition } from '../../flow/challenge';
import { scoreStability } from '../../results/scoring';
import { capturePointer, h } from '../../ui/dom';
import { FACTOR_HEX } from '../../ui/factors';
import { createStage, textStyle } from '../../ui/stage';
import { createStability, stepStability, STABILITY_PARAMS, type StabilityInput } from './logic';

const MINT = FACTOR_HEX.stability;
const AMBER = 0xffb547;
const CORAL = 0xff7a6b;
const IVORY = 0xf5efe3;

export const stability: ChallengeDefinition = {
  id: 'stability',
  instruction: 'Keep the figure upright inside the green zone.',
  howTo: ['Hold ◀ or ▶ to push the figure back toward the middle.', 'If it falls, it gets back up and you continue.'],
  simulatedMessages: false,
  startLabel: 'Start',

  mount(ctx) {
    const state = createStability(ctx.rng);
    const held = { left: new Set<number | string>(), right: new Set<number | string>() };
    const input = (): StabilityInput => {
      const v = (held.right.size > 0 ? 1 : 0) - (held.left.size > 0 ? 1 : 0);
      return v as StabilityInput;
    };

    function holdButton(side: 'left' | 'right', label: string) {
      const btn = h('button', { class: `hold-btn ${side}`, type: 'button', 'aria-label': `Push ${side}` }, [label]);
      const release = (e: PointerEvent) => {
        held[side].delete(e.pointerId);
        btn.classList.toggle('active', held[side].size > 0);
      };
      btn.addEventListener('pointerdown', (e) => {
        if (ctx.isPaused()) return;
        e.preventDefault();
        capturePointer(btn, e.pointerId);
        held[side].add(e.pointerId);
        btn.classList.add('active');
        ctx.interacted();
      });
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('lostpointercapture', release);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
      return btn;
    }
    const leftBtn = holdButton('left', '◀  Hold');
    const rightBtn = holdButton('right', 'Hold  ▶');
    ctx.controls.append(leftBtn, rightBtn);

    const keyMap: Record<string, 'left' | 'right'> = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
    const onKeyDown = (e: KeyboardEvent) => {
      const side = keyMap[e.key];
      if (!side || ctx.isPaused()) return;
      e.preventDefault();
      held[side].add('key');
      (side === 'left' ? leftBtn : rightBtn).classList.add('active');
      ctx.interacted();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const side = keyMap[e.key];
      if (!side) return;
      held[side].delete('key');
      (side === 'left' ? leftBtn : rightBtn).classList.toggle('active', held[side].size > 0);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let g: Phaser.GameObjects.Graphics;
    let status: Phaser.GameObjects.Text;
    let banner: Phaser.GameObjects.Text;
    const p = STABILITY_PARAMS;

    const stage = createStage(ctx.playfield, {
      create(scene) {
        g = scene.add.graphics();
        status = scene.add.text(0, 0, '', textStyle(14, '#c9d6df', false)).setOrigin(0.5, 0);
        banner = scene.add.text(0, 0, 'Whoops! Getting back up…', textStyle(18, '#ff9a8c')).setOrigin(0.5);
      },
      draw(_scene, w, hgt) {
        g.clear();
        const fallen = state.fallenUntil !== null;
        const inZone = !fallen && Math.abs(state.angle) <= p.safeDeg;

        // Balance meter: full range ±fallDeg, green safe zone in the middle.
        const mw = Math.min(w - 48, 360);
        const mx = (w - mw) / 2;
        const my = 22;
        const toX = (deg: number) => mx + ((deg + p.fallDeg) / (2 * p.fallDeg)) * mw;
        g.fillStyle(CORAL, 0.25).fillRoundedRect(mx, my, mw, 14, 7);
        g.fillStyle(MINT, 0.85).fillRect(toX(-p.safeDeg), my, toX(p.safeDeg) - toX(-p.safeDeg), 14);
        g.fillStyle(IVORY, 1).fillRoundedRect(toX(state.angle) - 3, my - 6, 6, 26, 3);
        status.setPosition(w / 2, my + 26);
        const pct = state.totalMs > 0 ? Math.round((100 * state.inZoneMs) / state.totalMs) : 100;
        status.setText(`In zone ${pct}%  ·  Falls ${state.falls}`);

        // Ground.
        const pivotX = w / 2;
        const groundY = hgt - 40;
        g.fillStyle(0x1b3140, 1).fillEllipse(pivotX, groundY + 6, Math.min(w * 0.7, 300), 22);

        // Figure, rotated about the foot.
        const L = Math.min(hgt * 0.55, 240);
        const a = Phaser.Math.DegToRad(state.angle);
        const pt = (x: number, up: number) => ({
          x: pivotX + x * Math.cos(a) + up * Math.sin(a),
          y: groundY - (-x * Math.sin(a) + up * Math.cos(a)),
        });
        const color = fallen ? CORAL : inZone ? MINT : AMBER;
        const foot = pt(0, 0);
        const hip = pt(0, 0.46 * L);
        const knee = pt(0.12 * L, 0.3 * L);
        const shoulder = pt(0, 0.78 * L);
        const head = pt(0, 0.9 * L);
        g.lineStyle(Math.max(6, L * 0.045), color, fallen ? 0.6 : 1);
        g.lineBetween(foot.x, foot.y, hip.x, hip.y);
        // Bent second leg (tree-pose-inspired abstract figure).
        g.lineBetween(hip.x, hip.y, knee.x, knee.y);
        g.lineBetween(knee.x, knee.y, pt(0.02 * L, 0.36 * L).x, pt(0.02 * L, 0.36 * L).y);
        g.lineBetween(hip.x, hip.y, shoulder.x, shoulder.y);
        const lh = pt(-0.34 * L, 0.84 * L);
        const rh = pt(0.34 * L, 0.84 * L);
        g.lineBetween(lh.x, lh.y, shoulder.x, shoulder.y);
        g.lineBetween(shoulder.x, shoulder.y, rh.x, rh.y);
        g.fillStyle(color, fallen ? 0.6 : 1).fillCircle(head.x, head.y, L * 0.075);

        // Wind indicator: chevrons on the side the push comes from.
        const strength = Math.min(1, Math.abs(state.push) / p.pushEnd);
        if (!fallen && strength > 0.1) {
          const dir = Math.sign(state.push);
          const cy = groundY - 0.7 * L;
          const startX = pivotX - dir * (0.5 * L + 20);
          g.lineStyle(3, IVORY, 0.25 + 0.6 * strength);
          for (let i = 0; i < 3; i++) {
            const x = startX - dir * i * 14;
            g.lineBetween(x - dir * 8, cy - 9, x, cy);
            g.lineBetween(x, cy, x - dir * 8, cy + 9);
          }
        }

        banner.setPosition(w / 2, hgt * 0.4).setVisible(fallen);
      },
    });

    return {
      step(dt, elapsed) {
        stepStability(state, dt, input(), elapsed / ctx.durationMs, ctx.rng);
      },
      releaseInput() {
        held.left.clear();
        held.right.clear();
        leftBtn.classList.remove('active');
        rightBtn.classList.remove('active');
      },
      outcome() {
        const raw = {
          inZoneMs: Math.round(state.inZoneMs),
          totalMs: Math.round(state.totalMs),
          falls: state.falls,
        };
        const pct = raw.totalMs > 0 ? Math.round((100 * raw.inZoneMs) / raw.totalMs) : 0;
        return {
          score: scoreStability(raw),
          rawMetrics: raw,
          summary: `${pct}% of the time in the zone · ${state.falls} ${state.falls === 1 ? 'fall' : 'falls'}`,
        };
      },
      destroy() {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        stage.destroy();
      },
    };
  },
};
