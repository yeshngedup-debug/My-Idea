import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out', 'build', 'tests/e2e'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    setupFiles: './vitest.setup.ts',
  },
});
