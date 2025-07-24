import { describe, it, expect } from 'vitest';
import { RealTimeModeDetector } from '@/services/realTimeModeDetection';
import {
  A4,
  C5,
  C4,
  CSharp4,
  FSharp4,
  F4,
  E4,
  B3,
  B4
} from '@fixtures/musical-data';
import { MODE_TO_INDEX_MAPPINGS } from '@/constants/mappings';

// Pitch classes
const PC_A = A4 % 12;
const PC_C = C5 % 12;
const PC_C_LOW = C4 % 12;

describe('RealTimeModeDetector root handling', () => {
  it('defaults rootPitch to the lowest pitch class', () => {
    const detector = new RealTimeModeDetector();

    detector.addNote(A4, PC_A); // first note sets root to A
    let state = detector.getState();
    expect(state.rootPitch).toBe(PC_A);
    expect(state.lowestPitch).toBe(PC_A);

    detector.addNote(C5, PC_C); // higher octave note with lower pitch class
    state = detector.getState();
    expect(state.rootPitch).toBe(PC_C); // root updates to C
    expect(state.lowestPitch).toBe(PC_C);

    detector.addNote(C4, PC_C_LOW); // lower note same pitch class
    state = detector.getState();
    expect(state.rootPitch).toBe(PC_C); // root stays C
    expect(state.lowestPitch).toBe(PC_C);
  });
});

describe('RealTimeModeDetector suggestion ordering', () => {
  it('returns suggestions following MODE_TO_INDEX_MAPPINGS order', () => {
    const detector = new RealTimeModeDetector();
    const result = detector.addNote(C4, PC_C_LOW)!;
    // Extract Major Scale ordering from mapping
    const majorMapping = Object.entries(MODE_TO_INDEX_MAPPINGS['Major Scale']).sort((a,b) => a[1]-b[1]).map(([name]) => name);
    const majorSuggestions = result.suggestions.filter(s => s.family === 'Major Scale').map(s => s.name);
    expect(majorSuggestions).toEqual(majorMapping.slice(0, majorSuggestions.length));
  });
});

describe('RealTimeModeDetector mismatch handling', () => {
  it('preserves mismatch counts for partial matches', () => {
    const detector = new RealTimeModeDetector();
    detector.addNote(C4, 0);
    detector.addNote(CSharp4, 1);
    detector.addNote(FSharp4, 6);
    detector.addNote(F4, 5);
    const result = detector.addNote(B4, 11)!;
    expect(result.suggestions.length).toBeGreaterThan(0);
    const first = result.suggestions[0];
    expect(first.mismatchCount).toBeGreaterThan(0);
  });
});

describe('RealTimeModeDetector manual tonic override', () => {
  it('setRootPitch locks the root despite lower notes', () => {
    const detector = new RealTimeModeDetector();
    detector.addNote(E4, 4);
    detector.addNote(C4, 0); // lowest note sets root to C
    detector.setRootPitch(4); // user selects E
    let state = detector.getState();
    expect(state.rootPitch).toBe(4);
    detector.addNote(B3, 11); // lower pitch class
    state = detector.getState();
    expect(state.rootPitch).toBe(4); // still E
  });
});
