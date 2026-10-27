import Phaser from 'phaser';

/**
 * Phaser is used purely as a renderer for the animated playfields. Input is
 * handled with DOM pointer events, so Phaser's own input system is disabled and
 * never blocks page gestures outside the game.
 */
export interface StageRenderer {
  create(scene: Phaser.Scene): void;
  /** Called every frame with the playfield size in CSS pixels. */
  draw(scene: Phaser.Scene, width: number, height: number): void;
}

export interface Stage {
  readonly el: HTMLElement;
  size(): { width: number; height: number };
  destroy(): void;
}

export function createStage(parent: HTMLElement, renderer: StageRenderer): Stage {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const measure = () => {
    const rect = parent.getBoundingClientRect();
    return { width: Math.max(1, Math.round(rect.width)), height: Math.max(1, Math.round(rect.height)) };
  };
  let size = measure();
  let ready = false;

  class RenderScene extends Phaser.Scene {
    constructor() {
      super('stage');
    }
    create() {
      // Zoom from the top-left so scene coordinates are CSS pixels on a high-DPR canvas.
      this.cameras.main.setOrigin(0, 0).setZoom(dpr);
      renderer.create(this);
      ready = true;
    }
    update() {
      if (ready) renderer.draw(this, size.width, size.height);
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: size.width * dpr,
    height: size.height * dpr,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scale: { mode: Phaser.Scale.NONE },
    render: { antialias: true },
    scene: RenderScene,
  });
  game.canvas.style.width = '100%';
  game.canvas.style.height = '100%';
  game.canvas.style.display = 'block';

  const observer = new ResizeObserver(() => {
    const next = measure();
    if (next.width === size.width && next.height === size.height) return;
    size = next;
    game.scale.resize(size.width * dpr, size.height * dpr);
    game.canvas.style.width = '100%';
    game.canvas.style.height = '100%';
  });
  observer.observe(parent);

  return {
    el: parent,
    size: () => size,
    destroy() {
      observer.disconnect();
      game.destroy(true);
    },
  };
}

/** Text style helper keeping text crisp on high-DPR screens. */
export function textStyle(size: number, color = '#f5efe3', bold = true): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: `${size}px`,
    fontStyle: bold ? 'bold' : 'normal',
    color,
    resolution: Math.min(window.devicePixelRatio || 1, 2.5),
  };
}
