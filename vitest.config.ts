import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup/vitest.setup.ts'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['dist-bot/**', 'prisma/**', 'node_modules/**'],
      provider: 'v8',
      thresholds: {
        lines: 55,
        statements: 55,
        functions: 50,
        branches: 45,
      },
      reportOnFailure: true
    }
  }
});
