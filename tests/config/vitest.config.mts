import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest configuration for Music Modes App unit and component testing
 * Optimized for React components and TypeScript
 */
export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./config/test-setup.ts'],

    // Global test configuration
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './reports/coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/playwright-report/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    // Test file patterns
    include: [
      './unit/**/*.{test,spec}.{js,ts,tsx}',
      './component/**/*.{test,spec}.{js,ts,tsx}'
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      './e2e/**/*'
    ],

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Teardown timeout
    teardownTimeout: 10000,

    // Watch options - exclude patterns are handled by the main exclude array above

    // Reporter configuration - exclude patterns are handled by main exclude arry array above

    // Output configuration
    outputFile: {
      json: './reports/vitest-results.json',
      html: './reports/vitest-report.html'
    },

    // Retry configuration
    retry: process.env.CI ? 2 : 0,

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: process.env.CI ? 2 : undefined,
        minThreads: 1
      }
    }
  },

  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@tests': resolve(__dirname, '../'),
      '@fixtures': resolve(__dirname, '../fixtures'),
      '@mocks': resolve(__dirname, '../mocks'),
      '@utils': resolve(__dirname, '../utils')
    }
  },

  // Define configuration for testing
  define: {
    'import.meta.vitest': undefined,
  },

  // Esbuild configuration
  esbuild: {
    target: 'node14'
  }
});
