import {render, RenderOptions, RenderResult} from '@testing-library/react';
import React, {ReactElement, ReactNode} from 'react';
import {vi, expect} from 'vitest';
import {MockMIDIAccess, MockMIDIInput, setupMIDIMock} from '@mocks/midi-mock';
import {TEST_CHORDS, TEST_SCALES} from '@fixtures/musical-data';
import '../config/test-setup';


/**
 * Test utilities and helpers for Music Modes App testing
 * Provides common functionality for component testing, MIDI simulation, and assertions
 */

// Extended render options for React Testing Library
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialProps?: Record<string, any>;
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement;
}

// Custom render function with default providers
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { initialProps = {}, wrapper, ...renderOptions } = options;

  // Default wrapper that can be extended
  const DefaultWrapper = ({ children }: { children: ReactNode }): ReactElement => {
    return React.createElement('div', { 'data-testid': 'test-wrapper' }, children);
  };

  const Wrapper = wrapper || DefaultWrapper;

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

// MIDI testing utilities
export class MIDITestHelper {
  private mockMIDIAccess: MockMIDIAccess;
  private mockInput: MockMIDIInput;

  constructor() {
    this.mockMIDIAccess = setupMIDIMock();
    this.mockInput = this.mockMIDIAccess.getFirstInput()!;
  }

  // Get the mock MIDI access object
  getMIDIAccess(): MockMIDIAccess {
    return this.mockMIDIAccess;
  }

  // Get the mock MIDI input device
  getInput(): MockMIDIInput {
    return this.mockInput;
  }

  // Simulate playing a test scale
  async playTestScale(scaleName: keyof typeof TEST_SCALES, delay: number = 50): Promise<void> {
    const scale = TEST_SCALES[scaleName];
    for (const note of scale.notes) {
      this.mockInput.simulateNoteOn(note);
      await this.wait(delay);
    }
  }

  // Simulate playing a test chord
  playTestChord(chordName: keyof typeof TEST_CHORDS): void {
    const chord = TEST_CHORDS[chordName];
    this.mockInput.simulateChord(chord.notes);
  }

  // Simulate playing custom notes
  playNotes(notes: number[], delay: number = 50): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < notes.length; i++) {
        this.mockInput.simulateNoteOn(notes[i]);
        if (i < notes.length - 1) {
          await this.wait(delay);
        }
      }
      resolve();
    });
  }

  // Simulate chord input (all notes at once)
  playChord(notes: number[], velocity: number = 127): void {
    this.mockInput.simulateChord(notes, velocity);
  }

  // Clear all notes
  clearNotes(notes: number[]): void {
    notes.forEach(note => this.mockInput.simulateNoteOff(note));
  }

  // Wait utility
  wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate rapid input for performance testing
  simulateRapidInput(noteCount: number = 100): void {
    const notes = Array.from({ length: noteCount }, (_, i) => 60 + (i % 12));
    this.mockInput.simulateRapidInput(notes);
  }
}

// Component testing utilities
export const componentTestUtils = {
  // Wait for component to update
  waitForUpdate: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Find element by test ID with retry
  findByTestIdWithRetry: async (container: HTMLElement, testId: string, maxAttempts: number = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
      const element = container.querySelector(`[data-testid="${testId}"]`);
      if (element) return element;
      await componentTestUtils.waitForUpdate(100);
    }
    throw new Error(`Element with test-id "${testId}" not found after ${maxAttempts} attempts`);
  },

  // Check if element has specific class
  hasClass: (element: Element, className: string): boolean => {
    return element.classList.contains(className);
  },

  // Get element text content safely
  getTextContent: (element: Element | null): string => {
    return element?.textContent?.trim() || '';
  },

  // Simulate user interaction with delay
  simulateUserAction: async (action: () => void, delay: number = 50) => {
    action();
    await componentTestUtils.waitForUpdate(delay);
  },
};

/**
 * Test utilities and helpers for Music Modes App testing
 * Provides common functionality for component testing, MIDI simulation, and assertions
 */

// Musical assertion utilities
export const musicalAssertions = {

  // Assert that suggestions contain expected items
  assertSuggestionsContain: (actual: string[], expected: string[]) => {
    expected.forEach(suggestion => {
      expect(actual.some(item => item.includes(suggestion))).toBe(true);
    });
  },

  // Assert that a scale is highlighted correctly
  assertScaleHighlighted: (container: HTMLElement, scaleName: string) => {
    const highlightedElements = container.querySelectorAll('.highlighted, .scale-highlighted');
    const isHighlighted = Array.from(highlightedElements).some(el =>
      el.textContent?.includes(scaleName)
    );
    expect(isHighlighted).toBe(true);
  },

  // Assert that detection category matches expected
  assertDetectionCategory: (actual: string, expected: string) => {
    expect(actual.toLowerCase()).toBe(expected.toLowerCase());
  },

  // Assert that chord symbol matches expected
  assertChordSymbol: (actual: string, expected: string) => {
    expect(actual).toBe(expected);
  },

  // Assert that notes are valid MIDI notes - uses custom matcher from test-setup.ts
  assertValidMIDINotes: (notes: number[]): void => {
    if (!Array.isArray(notes)) {
      throw new Error('Expected notes to be an array');
    }
    if (notes.length === 0) {
      throw new Error('Expected notes array to not be empty');
    }
    notes.forEach((note, index) => {
      if (typeof note !== 'number') {
        throw new Error(`Expected note at index ${index} to be a number, got ${typeof note}`);
      }
      try {
        expect(note).toBeValidMidiNote();
      } catch (error) {
        throw new Error(`Invalid MIDI note at index ${index}: ${note}. ${error}`);
      }
    });
  },

  // Assert that a chord is valid - uses custom matcher from test-setup.ts
  assertValidChord: (notes: number[]): void => {
    if (!Array.isArray(notes)) {
      throw new Error('Expected chord to be an array of notes');
    }
    try {
      expect(notes).toBeValidChord();
    } catch (error) {
      throw new Error(`Invalid chord: ${JSON.stringify(notes)}. ${error}`);
    }
  },

  // Assert that a scale is valid - uses custom matcher from test-setup.ts
  assertValidScale: (notes: number[]): void => {
    if (!Array.isArray(notes)) {
      throw new Error('Expected scale to be an array of notes');
    }
    try {
      expect(notes).toBeValidScale();
    } catch (error) {
      throw new Error(`Invalid scale: ${JSON.stringify(notes)}. ${error}`);
    }
  },
};


// Performance testing utilities
export const performanceTestUtils = {
  // Measure execution time
  measureExecutionTime: async (fn: () => Promise<void> | void): Promise<number> => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  },

  // Assert execution time is within limit
  assertExecutionTimeWithinLimit: async (fn: () => Promise<void> | void, maxTime: number) => {
    const executionTime = await performanceTestUtils.measureExecutionTime(fn);
    expect(executionTime).toBeLessThan(maxTime);
  },

  // Memory usage monitoring (basic)
  monitorMemoryUsage: () => {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  // Stress test with repeated operations
  stressTest: async (operation: () => Promise<void> | void, iterations: number = 100) => {
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const time = await performanceTestUtils.measureExecutionTime(operation);
      results.push(time);
    }

    return {
      average: results.reduce((a, b) => a + b, 0) / results.length,
      min: Math.min(...results),
      max: Math.max(...results),
      results,
    };
  },
};

// Mock utilities
export const mockUtils = {
  // Create mock function with specific return value
  createMockWithReturn: <T>(returnValue: T) => vi.fn().mockReturnValue(returnValue),

  // Create mock function with resolved promise
  createMockWithResolvedValue: <T>(value: T) => vi.fn().mockResolvedValue(value),

  // Create mock function with rejected promise
  createMockWithRejectedValue: (error: Error) => vi.fn().mockRejectedValue(error),

  // Mock localStorage
  mockLocalStorage: () => {
    const store: { [key: string]: string } = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
    };
  },

  // Mock console methods
  mockConsole: () => ({
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),

  // Restore all mocks
  restoreAllMocks: () => {
    vi.restoreAllMocks();
  },
};

// Test data generators
export const testDataGenerators = {
  // Generate random MIDI note
  randomMIDINote: (min: number = 21, max: number = 108): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate random chord
  randomChord: (root?: number): number[] => {
    const actualRoot = root || testDataGenerators.randomMIDINote(36, 72);
    const intervals = [0, 4, 7]; // Major triad
    return intervals.map(interval => actualRoot + interval);
  },

  // Generate random scale
  randomScale: (root?: number): number[] => {
    const actualRoot = root || testDataGenerators.randomMIDINote(36, 60);
    const intervals = [0, 2, 4, 5, 7, 9, 11]; // Major scale
    return intervals.map(interval => actualRoot + interval);
  },

  // Generate test user scenarios
  generateUserScenario: (type: 'beginner' | 'intermediate' | 'advanced') => {
    const scenarios = {
      beginner: {
        noteCount: Math.floor(Math.random() * 3) + 1, // 1-3 notes
        complexity: 'simple',
        expectedCategory: 'minimal',
      },
      intermediate: {
        noteCount: Math.floor(Math.random() * 3) + 4, // 4-6 notes
        complexity: 'moderate',
        expectedCategory: 'pentatonic',
      },
      advanced: {
        noteCount: Math.floor(Math.random() * 5) + 7, // 7-11 notes
        complexity: 'complex',
        expectedCategory: 'complete',
      },
    };
    return scenarios[type];
  },
};

// Export all utilities as a single object for convenience
export const testUtils = {
  render: renderWithProviders,
  midi: MIDITestHelper,
  component: componentTestUtils,
  musical: musicalAssertions,
  performance: performanceTestUtils,
  mock: mockUtils,
  generators: testDataGenerators,
};

// Export individual utilities for specific use cases
// (Individual exports are already available as named exports above)
