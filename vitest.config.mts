import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out', 'build', 'tests/e2e'],
    alias: {
      '@tests': fileURLToPath(new URL('./tests/', import.meta.url)),
      '@': fileURLToPath(new URL('./src/', import.meta.url)),
    },
    setupFiles: './vitest.setup.ts',
  },
});
