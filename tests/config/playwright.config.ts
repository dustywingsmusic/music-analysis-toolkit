import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Music Modes App E2E testing
 * Optimized for MIDI functionality and real-time interactions
 */
export default defineConfig({
  testDir: '../e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: '../reports/playwright-report' }],
    ['json', { outputFile: '../reports/test-results.json' }],
    ['junit', { outputFile: '../reports/junit-results.xml' }]
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Timeout for each action */
    actionTimeout: 10000,

    /* Timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable WebMIDI API for testing
        launchOptions: {
          args: ['--enable-web-midi']
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox MIDI support configuration
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webmidi.enabled': true
          }
        }
      },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge',
        launchOptions: {
          args: ['--enable-web-midi']
        }
      },
    },
    {
      name: 'Google Chrome',
      use: { 
        ...devices['Desktop Chrome'], 
        channel: 'chrome',
        launchOptions: {
          args: ['--enable-web-midi']
        }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    cwd: '../../', // Run from main project directory where package.json is located
  },

  /* Global setup and teardown */
  // globalSetup: require.resolve('./test-setup.ts'), // Disabled - test-setup.ts is for Vitest, not Playwright

  /* Test timeout */
  timeout: 30000,

  /* Expect timeout */
  expect: {
    timeout: 5000,
  },

  /* Output directory for test artifacts */
  outputDir: '../reports/test-results/',
});
