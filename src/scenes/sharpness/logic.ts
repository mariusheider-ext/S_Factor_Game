import { pick, type Rng } from '../../core/rng';

export const SHAPES = [
  'circle',
  'triangle',
  'triangleDown',
  'square',
  'diamond',
  'plus',
  'star',
  'hexagon',
] as const;
export type Shape = (typeof SHAPES)[number];

export const GRID_SIZE = 16;
/** The target symbol changes after this many correct hits. */
export const TARGET_CHANGE_EVERY = 4;

export interface SharpnessState {
  target: Shape;
  tiles: Shape[];
  correct: number;
  incorrect: number;
  layouts: number;
}

/** Builds a grid that always contains exactly one target and only decoys elsewhere. */
export function buildLayout(rng: Rng, target: Shape): Shape[] {
  const decoys = SHAPES.filter((s) => s !== target);
  const targetIndex = Math.floor(rng() * GRID_SIZE);
  const tiles: Shape[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    tiles.push(i === targetIndex ? target : pick(rng, decoys));
  }
  return tiles;
}

export function createSharpness(rng: Rng): SharpnessState {
  const target = pick(rng, SHAPES);
  return { target, tiles: buildLayout(rng, target), correct: 0, incorrect: 0, layouts: 1 };
}

/** Applies a tile tap. A hit reshuffles the grid (and periodically the target); a miss changes nothing. */
export function tapTile(state: SharpnessState, index: number, rng: Rng): 'hit' | 'miss' {
  if (state.tiles[index] !== state.target) {
    state.incorrect++;
    return 'miss';
  }
  state.correct++;
  if (state.correct % TARGET_CHANGE_EVERY === 0) {
    state.target = pick(
      rng,
      SHAPES.filter((s) => s !== state.target),
    );
  }
  let next = buildLayout(rng, state.target);
  // Avoid placing the new target on the tile that was just tapped.
  for (let guard = 0; guard < 8 && next[index] === state.target; guard++) {
    next = buildLayout(rng, state.target);
  }
  state.tiles = next;
  state.layouts++;
  return 'hit';
}
