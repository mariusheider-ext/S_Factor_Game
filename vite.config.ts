import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the static build works from any sub-path (e.g. a GitHub Pages
  // project URL) without hard-coding the repository name.
  base: './',
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
} as Parameters<typeof defineConfig>[0]);
