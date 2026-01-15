import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment setup
    environment: 'node',
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'bin/',
        '**/*.test.ts',
        '**/*.mock.ts',
        '**/index.ts',
        'src/view/**', // Excluded from compilation
      ],
      thresholds: {
        global: {
          lines: 70,
          functions: 70,
          branches: 65,
          statements: 70,
        },
      },
    },

    // Include and exclude patterns
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Test reporter
    reporters: ['verbose'],

    // Timeout settings
    testTimeout: 10000,

    // Module resolution
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
