import { describe, it, expect } from 'vitest';
import { RealTimeModeDetector } from '@/services/realTimeModeDetection';
import { A4, C5, C4 } from '@fixtures/musical-data';

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
