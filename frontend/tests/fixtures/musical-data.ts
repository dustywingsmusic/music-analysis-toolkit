/**
 * Musical test data and fixtures for Music Modes App testing
 * Contains scales, chords, notes, and expected detection results
 *
 * USAGE EXAMPLE:
 * ```typescript
 * // Using named constants for better readability
 * test('C major chord should be detected correctly', () => {
 *   const cMajorChord = [C4, E4, G4];
 *   const result = detectChord(cMajorChord);
 *   expect(result.type).toBe('major');
 *   expect(result.root).toBe(C4);
 * });
 *
 * // Creating scales using intervals
 * test('D dorian should be created correctly', () => {
 *   const dDorian = createScale(D4, SCALE_INTERVALS.dorian);
 *   expect(dDorian).toEqual([D4, E4, F4, G4, A4, B4, C5]);
 * });
 * ```
 */

// Base MIDI octave 4 notes (middle C = C4 = MIDI note 60)
// Note: these are actual MIDI values, unlike MIDI_NOTES which are used for lookup
export const C4 = 60;
export const CSharp4 = 61;
export const DFlat4 = 61;
export const D4 = 62;
export const DSharp4 = 63;
export const EFlat4 = 63;
export const E4 = 64;
export const F4 = 65;
export const FSharp4 = 66;
export const GFlat4 = 66;
export const G4 = 67;
export const GSharp4 = 68;
export const AFlat4 = 68;
export const A4 = 69;
export const ASharp4 = 70;
export const BFlat4 = 70;
export const B4 = 71;

// Octave 5 notes
export const C5 = 72;
export const CSharp5 = 73;
export const DFlat5 = 73;
export const D5 = 74;
export const DSharp5 = 75;
export const EFlat5 = 75;
export const E5 = 76;
export const F5 = 77;

// Octave 3 notes
export const A3 = 57;
export const ASharp3 = 58;
export const BFlat3 = 58;
export const B3 = 59;

// MIDI note numbers for lookup (deprecated, use direct constants above instead)
export const MIDI_NOTES = {
  C: 60,
  Cs: 61, Db: 61,
  D: 62,
  Ds: 63, Eb: 63,
  E: 64,
  F: 65,
  Fs: 66, Gb: 66,
  G: 67,
  Gs: 68, Ab: 68,
  A: 69,
  As: 70, Bb: 70,
  B: 71,
} as const;

// Scale intervals (semitones from root)
export const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
} as const;

// Chord intervals (semitones from root)
export const CHORD_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  majorMaj7: [0, 4, 7, 11],
  minorMaj7: [0, 3, 7, 11],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],
};

// Test scales with expected results
export const TEST_SCALES = {
  cMajor: {
    notes: [C4, D4, E4, F4, G4, A4, B4] as number[], // C D E F G A B
    expectedCategory: 'complete',
    // TODO: Implement confidence calculation for complete scale matches
    expectedCloseness: { min: 95, max: 100 }, // Complete 7-note scale
    expectedSuggestions: ['C Ionian', 'D Dorian', 'E Phrygian', 'F Lydian', 'G Mixolydian', 'A Aeolian', 'B Locrian'],
    expectedHighlight: 'C Ionian',
  },
  aMinor: {
    notes: [A4, B4, C4, D4, E4, F4, G4] as number[], // A B C D E F G
    expectedCategory: 'complete',
    // TODO: Implement confidence calculation for complete scale matches
    expectedCloseness: { min: 95, max: 100 }, // Complete 7-note scale
    expectedSuggestions: ['A Aeolian', 'B Locrian', 'C Ionian', 'D Dorian', 'E Phrygian', 'F Lydian', 'G Mixolydian'],
    expectedHighlight: 'A Aeolian',
  },
  cMajorPentatonic: {
    notes: [C4, D4, E4, G4, A4] as number[], // C D E G A
    expectedCategory: 'pentatonic',
    // TODO: Implement confidence calculation for pentatonic scale matches
    expectedCloseness: { min: 95, max: 100 }, // Complete 5-note pentatonic scale
    expectedSuggestions: ['C Major Pentatonic'],
    expectedHighlight: 'C Major Pentatonic',
  },
  aMinorPentatonic: {
    notes: [A4, C4, D4, E4, G4] as number[], // A C D E G
    expectedCategory: 'pentatonic',
    // TODO: Implement confidence calculation for pentatonic scale matches
    expectedCloseness: { min: 95, max: 100 }, // Complete 5-note pentatonic scale
    expectedSuggestions: ['A Minor Pentatonic'],
    expectedHighlight: 'A Minor Pentatonic',
  },
  wholeTone: {
    notes: [C4, D4, E4, FSharp4, GSharp4, ASharp4] as number[], // C D E F# G# A#
    expectedCategory: 'complete', // Complete whole tone scale
    // TODO: Implement confidence calculation for whole tone scale matches
    expectedCloseness: { min: 95, max: 100 }, // Complete 6-note hexatonic scale
    expectedSuggestions: ['Whole Tone'],
    expectedHighlight: 'Whole Tone',
  },
} as const;

// Test chords with expected results
export const TEST_CHORDS = {
  cMajor: {
    notes: [C4, E4, G4] as number[], // C E G
    expectedCategory: 'partial',
    // TODO: Implement confidence calculation for chord identification
    expectedCloseness: { min: 40, max: 50 }, // 3 notes out of 7 for heptatonic scale (~43%)
    expectedSuggestions: ['C Ionian', 'G Ionian', 'F Ionian'],
    expectedChord: { symbol: 'C', type: 'major', root: 0 },
  },
  aMinor: {
    notes: [A3, C4, E4] as number[], // A C E - root position with A as bass
    expectedCategory: 'partial',
    // TODO: Implement confidence calculation for chord identification
    expectedCloseness: { min: 40, max: 50 }, // 3 notes out of 7 for heptatonic scale (~43%)
    expectedSuggestions: ['C Ionian', 'G Ionian', 'F Ionian'],
    expectedChord: { symbol: 'Am', type: 'minor', root: 9 },
  },
  cMaj7: {
    notes: [C4, E4, G4, B4] as number[], // C E G B
    expectedCategory: 'partial',
    // TODO: Implement confidence calculation for 7th chord identification
    expectedCloseness: { min: 55, max: 65 }, // 4 notes out of 7 for heptatonic scale (~57%)
    expectedSuggestions: ['C Ionian', 'G Ionian', 'G♯/A♭ Lydian ♯2'],
    expectedChord: { symbol: 'Cmaj7', type: 'major7', root: 0 },
  },
  dm7: {
    notes: [D4, F4, A4, C5] as number[], // D F A C - root position with D as bass
    expectedCategory: 'partial',
    // TODO: Implement confidence calculation for 7th chord identification
    expectedCloseness: { min: 55, max: 65 }, // 4 notes out of 7 for heptatonic scale (~57%)
    expectedSuggestions: ['D Dorian', 'C Ionian'],
    expectedChord: { symbol: 'Dm7', type: 'minor7', root: 2 },
  },
  g7: {
    notes: [G4, B4, D5, F5] as number[], // G B D F - root position with G as bass
    expectedCategory: 'partial',
    // TODO: Implement confidence calculation for 7th chord identification
    expectedCloseness: { min: 55, max: 65 }, // 4 notes out of 7 for heptatonic scale (~57%)
    expectedSuggestions: ['G Mixolydian', 'C Ionian'],
    expectedChord: { symbol: 'G7', type: 'dominant7', root: 7 },
  },
  csus2: {
    notes: [C4, D4, G4] as number[], // C D G
    expectedCategory: 'partial',
    // TODO: Implement confidence calculation for sus chord identification
    expectedCloseness: { min: 40, max: 50 }, // 3 notes out of 7 for heptatonic scale (~43%)
    expectedSuggestions: ['C Ionian', 'G Mixolydian'],
    expectedChord: { symbol: 'Csus2', type: 'sus2', root: 0 },
  },
  csus4: {
    notes: [C4, F4, G4] as number[], // C F G
    expectedCategory: 'partial',
    // TODO: Implement confidence calculation for sus chord identification
    expectedCloseness: { min: 40, max: 50 }, // 3 notes out of 7 for heptatonic scale (~43%)
    expectedSuggestions: ['C Ionian', 'F Lydian'],
    expectedChord: { symbol: 'Csus4', type: 'sus4', root: 0 },
  },
} as const;

// Test chord inversions
export const TEST_INVERSIONS = {
  cMajorFirstInversion: {
    notes: [E4, G4, C5] as number[], // E G C (C/E) - E is lowest for first inversion
    expectedChord: { symbol: 'C/E', baseChord: 'C major', bassNote: 4, inversion: '/E' },
  },
  aMinorFirstInversion: {
    notes: [C4, E4, A4] as number[], // C E A (Am/C)
    expectedChord: { symbol: 'Am/C', baseChord: 'A minor', bassNote: 0, inversion: '/C' },
  },
} as const;

// Minimal input tests
export const TEST_MINIMAL_INPUT = {
  singleNote: {
    notes: [C4] as number[], // C
    expectedCategory: 'minimal',
    // TODO: Implement confidence calculation for minimal input detection
    expectedCloseness: { min: 10, max: 20 }, // 1 note out of 7 for heptatonic scale (~14%)
    expectedSuggestions: ['C Ionian', 'C Dorian', 'C Phrygian'],
  },
  perfectFifth: {
    notes: [C4, G4] as number[], // C G
    expectedCategory: 'minimal',
    // TODO: Implement confidence calculation for minimal input detection
    expectedCloseness: { min: 25, max: 35 }, // 2 notes out of 7 for heptatonic scale (~29%)
    expectedSuggestions: ['C Ionian', 'G Mixolydian'],
  },
} as const;

// Common chord progressions for testing
export const CHORD_PROGRESSIONS = {
  iiViV: [
    { notes: [D4, F4, A4] as number[], chord: 'Dm' }, // ii
    { notes: [G4, B4, D4] as number[], chord: 'G' },  // V
    { notes: [C4, E4, G4] as number[], chord: 'C' },  // I
  ],
  vi_IV_I_V: [
    { notes: [A4, C4, E4] as number[], chord: 'Am' }, // vi
    { notes: [F4, A4, C4] as number[], chord: 'F' },  // IV
    { notes: [C4, E4, G4] as number[], chord: 'C' },  // I
    { notes: [G4, B4, D4] as number[], chord: 'G' },  // V
  ],
} as const;

// Analysis focus test data
export const ANALYSIS_FOCUS_TESTS = {
  automatic: {
    description: 'Automatically adapts analysis based on note count',
    shouldShowAllSuggestions: true,
    shouldApplyFiltering: false,
  },
  complete: {
    description: 'Prioritizes exact complete scale matches',
    shouldShowAllSuggestions: false,
    shouldApplyFiltering: true,
    // TODO: Implement confidence threshold for complete scale filtering
  },
  pentatonic: {
    description: 'Focuses on pentatonic and hexatonic scales',
    shouldPrioritizePentatonic: true,
    shouldFilterHeptatonic: true,
  },
  chord: {
    description: 'Analyzes chord progressions and harmony',
    shouldShowChordPanel: true,
    shouldPrioritizeChordAnalysis: true,
  },
} as const;

// Performance test data
export const PERFORMANCE_TESTS = {
  rapidInput: {
    // This creates a sequence of 100 notes starting from C4 and cycling through the chromatic scale
    noteSequence: Array.from({ length: 100 }, (_, i) => C4 + (i % 12)),
    maxProcessingTime: 1000, // milliseconds
  },
  memoryStress: {
    // This creates a sequence of 1000 notes starting from C4 and cycling through the chromatic scale
    largeNoteSequence: Array.from({ length: 1000 }, (_, i) => C4 + (i % 12)),
    iterations: 50,
  },
} as const;

// Helper functions for creating test data
/**
 * Creates a scale starting from a root note using the provided intervals
 * @example
 * // Create a C major scale
 * createScale(C4, SCALE_INTERVALS.major) // returns [C4, D4, E4, F4, G4, A4, B4]
 */
export const createScale = (root: number, intervals: number[]): number[] =>
  intervals.map(interval => root + interval);

/**
 * Creates a chord starting from a root note using the provided intervals
 * @example
 * // Create a C major chord
 * createChord(C4, CHORD_INTERVALS.major) // returns [C4, E4, G4]
 */
export const createChord = (root: number, intervals: number[]): number[] =>
  intervals.map(interval => root + interval);

/**
 * Transposes a sequence of notes by the specified number of semitones
 * @example
 * // Transpose C major chord up by 2 semitones to get D major
 * transposeNotes([C4, E4, G4], 2) // returns [D4, F#4, A4]
 */
export const transposeNotes = (notes: number[], semitones: number): number[] =>
  notes.map(note => note + semitones);

export const noteToName = (midiNote: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[midiNote % 12];
};

export const nameToNote = (noteName: string, octave: number = 4): number => {
  const noteMap: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11,
  };
  return (octave + 1) * 12 + noteMap[noteName];
};
