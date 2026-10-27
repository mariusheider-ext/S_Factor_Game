import type { FactorId } from '../config';

// Provisional icon set (DECISIONS: sparkle, leaf, lightning bolt, lotus). Defined
// once here and reused on Home, intros, transitions and the result card.
const ICON_PATHS: Record<FactorId, string> = {
  sharpness: '<path d="M12 1.5c.9 6.2 4.3 9.6 10.5 10.5-6.2.9-9.6 4.3-10.5 10.5C11.1 16.3 7.7 12.9 1.5 12 7.7 11.1 11.1 7.7 12 1.5z"/>',
  stability:
    '<path d="M4.5 19.5C4.2 10.6 9.6 4.4 20.5 3.5c.4 10.6-5.6 16.3-16 16z"/><path d="M4 20.5 13 11.5" fill="none" stroke="var(--icon-cut, #091420)" stroke-width="1.6" stroke-linecap="round"/>',
  stamina: '<path d="M13.5 1.5 3.5 14h7l-1.5 8.5L20.5 9.5h-7.2z"/>',
  stillness:
    '<path d="M12 3.5c-2.6 3.2-2.6 8.4 0 12.5 2.6-4.1 2.6-9.3 0-12.5z"/><path d="M11.3 16.4C7.2 15.6 4.2 12.6 3.2 8.3c4.2.6 6.9 3.6 8.1 8.1z"/><path d="M12.7 16.4c4.1-.8 7.1-3.8 8.1-8.1-4.2.6-6.9 3.6-8.1 8.1z"/><path d="M4 17.6c4.6 3.1 11.4 3.1 16 0-4.6 1.6-11.4 1.6-16 0z"/>',
};

export interface FactorInfo {
  id: FactorId;
  name: string;
  theme: string;
  color: string;
}

export const FACTORS: Record<FactorId, FactorInfo> = {
  sharpness: { id: 'sharpness', name: 'Sharpness', theme: 'Find the symbol', color: 'var(--sharpness)' },
  stability: { id: 'stability', name: 'Stability', theme: 'Keep your balance', color: 'var(--stability)' },
  stamina: { id: 'stamina', name: 'Stamina', theme: 'Hold a steady pace', color: 'var(--stamina)' },
  stillness: { id: 'stillness', name: 'Stillness', theme: 'Leave the water undisturbed', color: 'var(--stillness)' },
};

/** Hex values matching the CSS tokens, for canvas drawing. */
export const FACTOR_HEX: Record<FactorId, number> = {
  sharpness: 0xffb547,
  stability: 0x5fe0a8,
  stamina: 0x4da3ff,
  stillness: 0x4fd8e0,
};

export function factorIcon(id: FactorId, size = 24): string {
  return `<svg class="factor-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="color:${FACTORS[id].color}">${ICON_PATHS[id]}</svg>`;
}
