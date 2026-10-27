import type { Shape } from './logic';

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const SHAPE_MARKUP: Record<Shape, string> = {
  circle: '<circle cx="24" cy="24" r="15"/>',
  triangle: '<polygon points="24,7 41,38 7,38"/>',
  triangleDown: '<polygon points="7,10 41,10 24,41"/>',
  square: '<rect x="10" y="10" width="28" height="28" rx="2"/>',
  diamond: '<polygon points="24,5 43,24 24,43 5,24"/>',
  plus: '<path d="M19 7h10v12h12v10H29v12H19V29H7V19h12z"/>',
  star: `<polygon points="${starPoints(24, 25.5, 19, 8)}"/>`,
  hexagon: '<polygon points="24,6 40,15 40,33 24,42 8,33 8,15"/>',
};

export const SHAPE_LABELS: Record<Shape, string> = {
  circle: 'circle',
  triangle: 'triangle',
  triangleDown: 'downward triangle',
  square: 'square',
  diamond: 'diamond',
  plus: 'plus',
  star: 'star',
  hexagon: 'hexagon',
};

export function shapeSvg(shape: Shape): string {
  return `<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">${SHAPE_MARKUP[shape]}</svg>`;
}
