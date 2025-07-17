import { expect } from 'vitest';

/**
 * Custom Vitest matchers for musical testing provide
 * Domain-specific assertions for MIDI notes, chords, and scales
 */

// Custom matcher implementations
export const customMatchers = {
  toBeValidMidiNote(received: number) {
    const pass = received >= 0 && received <= 127 && Number.isInteger(received);
    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid MIDI note`
          : `Expected ${received} to be a valid MIDI note (0-127)`,
      pass,
    };
  },

  toBeValidChord(received: number[]) {
    const pass = Array.isArray(received) && 
                 received.length >= 2 && 
                 received.every(note => note >= 0 && note <= 127);
    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid chord`
          : `Expected ${received} to be a valid chord (array of 2+ MIDI notes)`,
      pass,
    };
  },

  toBeValidScale(received: number[]) {
    const pass = Array.isArray(received) && 
                 received.length >= 5 && 
                 received.every(note => note >= 0 && note <= 127);
    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid scale`
          : `Expected ${received} to be a valid scale (array of 5+ MIDI notes)`,
      pass,
    };
  },
};

// Function to register the custom matchers
export const setupCustomMatchers = () => {
  expect.extend(customMatchers);
};

// Type definitions for custom Vitest matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidMidiNote(): T;
    toBeValidChord(): T;
    toBeValidScale(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidMidiNote(): any;
    toBeValidChord(): any;
    toBeValidScale(): any;
  }
}

export {};
