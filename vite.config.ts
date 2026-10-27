import { defineConfig } from 'vitest/config';

export default defineConfig(({ command, isPreview }) => ({
  // Production builds are served from the GitHub Pages project path
  // https://mariusheider-ext.github.io/S_Factor_Game/ (also used by `npm run preview`).
  // The dev server stays at the root.
  base: command === 'build' || isPreview ? '/S_Factor_Game/' : '/',
  build: {
    // Phaser is a single large dependency; keep it in its own chunk.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: { manualChunks: { phaser: ['phaser'] } },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
