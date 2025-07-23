import { describe, it, expect } from 'vitest';
import { RealTimeModeDetector } from '@/services/realTimeModeDetection';
import { A4, C5, C4 } from '@fixtures/musical-data';

// Pitch classes
const PC_A = A4 % 12;
const PC_C = C5 % 12;
const PC_C_LOW = C4 % 12;

describe('RealTimeModeDetector root handling', () => {
  it('keeps root when higher octave notes have lower pitch classes', () => {
    const detector = new RealTimeModeDetector();

    detector.addNote(A4, PC_A); // first note sets root to A
    let state = detector.getState();
    expect(state.rootPitch).toBe(PC_A);

    detector.addNote(C5, PC_C); // higher note with smaller pitch class
    state = detector.getState();
    expect(state.rootPitch).toBe(PC_A); // root should remain A

    detector.addNote(C4, PC_C_LOW); // lower note
    state = detector.getState();
    expect(state.rootPitch).toBe(PC_C_LOW); // root updates to C
  });
});
