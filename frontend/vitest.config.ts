import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const __dirname = resolve(new URL('.', import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'], // Ensure this path is correct from the root
    include: [
      './tests/unit/**/*.{test,spec}.{js,ts,tsx}',
      './tests/component/**/*.{test,spec}.{js,ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './tests/reports/coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/playwright-report/**'
      ],
    },
    outputFile: {
      json: './tests/reports/vitest-results.json',
      html: './tests/reports/vitest-report.html'
    },
    retry: process.env.CI ? 2 : 0,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
      '@fixtures': resolve(__dirname, './tests/fixtures'),
      '@mocks': resolve(__dirname, './tests/mocks'),
      '@utils': resolve(__dirname, './tests/utils')
    }
  }
})
