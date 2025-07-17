import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach } from 'vitest';
import { setupCustomMatchers } from '@utils/custom-vitest-matchers';

/**
 * Global test setup for Music Modes App
 * Configures testing environment, mocks, and utilities
 */

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global setup before all tests
beforeAll(() => {
  // Mock WebMIDI API
  Object.defineProperty(global.navigator, 'requestMIDIAccess', {
    writable: true,
    value: vi.fn().mockResolvedValue({
      inputs: new Map(),
      outputs: new Map(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onstatechange: null,
      sysexEnabled: false,
    }),
  });

  // Mock Web Audio API
  Object.defineProperty(global.window, 'AudioContext', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 440 },
        type: 'sine',
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { value: 1 },
      }),
      destination: {},
      currentTime: 0,
      sampleRate: 44100,
      state: 'running',
      suspend: vi.fn(),
      resume: vi.fn(),
      close: vi.fn(),
    })),
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  // Setup custom matchers for musical testing
  setupCustomMatchers();
});

// Setup before each test
beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks();

  // Reset localStorage mock
  const localStorageMock = window.localStorage as any;
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Reset sessionStorage mock
  const sessionStorageMock = window.sessionStorage as any;
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();

  // Reset console mocks
  vi.mocked(console.log).mockClear();
  vi.mocked(console.debug).mockClear();
  vi.mocked(console.info).mockClear();
  vi.mocked(console.warn).mockClear();
  vi.mocked(console.error).mockClear();
});


// Export test utilities
export const testUtils = {
  // Simulate MIDI note input
  simulateMidiNote: (note: number, velocity: number = 127) => ({
    note,
    velocity,
    timestamp: Date.now(),
  }),

  // Create test chord
  createTestChord: (root: number, intervals: number[]) =>
    [root, ...intervals.map(interval => root + interval)],

  // Create test scale
  createTestScale: (root: number, intervals: number[]) =>
    [root, ...intervals.map(interval => root + interval)],

  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};
