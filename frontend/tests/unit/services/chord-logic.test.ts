import { beforeEach, describe, expect, it } from 'vitest';
import { CHORD_INTERVALS, createChord, TEST_CHORDS, TEST_INVERSIONS } from '@fixtures/musical-data';
import { musicalAssertions } from '@utils/test-helpers';
import { findChordMatches } from '@/services/chordLogic';

const noteNames = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

const getMatch = (notes: number[]) => findChordMatches(notes)[0];

describe('Chord Logic Service', () => {
  beforeEach(() => {
    // Setup before each test if needed
  });

  describe('Basic Chord Detection', () => {
    describe('Major Triads', () => {
      it('detects C major triad', () => {
        const testChord = TEST_CHORDS.cMajor;
        const match = getMatch(testChord.notes);

        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe(testChord.expectedChord.symbol);
        expect(match.chordName).toBe('Major');
        expect(match.root).toBe(testChord.expectedChord.root);
        expect(match.rootName).toBe('C');
      });

      it('validates chord notes are valid MIDI notes', () => {
        const testChord = TEST_CHORDS.cMajor;
        musicalAssertions.assertValidChord(testChord.notes);
        musicalAssertions.assertValidMIDINotes(testChord.notes);
      });

      it('detects F major triad', () => {
        const notes = createChord(65, CHORD_INTERVALS.major);
        musicalAssertions.assertValidChord(notes);

        const match = getMatch(notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe('F');
        expect(match.chordName).toBe('Major');
        expect(match.root).toBe(5);
        expect(match.rootName).toBe('F');
      });

      it('detects G major triad', () => {
        const notes = createChord(67, CHORD_INTERVALS.major);
        musicalAssertions.assertValidChord(notes);

        const match = getMatch(notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe('G');
        expect(match.chordName).toBe('Major');
        expect(match.root).toBe(7);
        expect(match.rootName).toBe('G');
      });
    });

    describe('Minor Triads', () => {
      it('detects A minor triad', () => {
        const testChord = TEST_CHORDS.aMinor;
        musicalAssertions.assertValidChord(testChord.notes);

        const match = getMatch(testChord.notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe(testChord.expectedChord.symbol);
        expect(match.chordName).toBe('Minor');
        expect(match.root).toBe(testChord.expectedChord.root);
        expect(match.rootName).toBe('A');
      });

      it('detects D minor triad', () => {
        const notes = createChord(62, CHORD_INTERVALS.minor);
        musicalAssertions.assertValidChord(notes);

        const match = getMatch(notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe('Dm');
        expect(match.chordName).toBe('Minor');
        expect(match.root).toBe(2);
        expect(match.rootName).toBe('D');
      });

      it('detects E minor triad', () => {
        const notes = createChord(64, CHORD_INTERVALS.minor);
        musicalAssertions.assertValidChord(notes);

        const match = getMatch(notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe('Em');
        expect(match.chordName).toBe('Minor');
        expect(match.root).toBe(4);
        expect(match.rootName).toBe('E');
      });
    });
  });

  describe('Advanced Chord Detection', () => {
    describe('Seventh Chords', () => {
      it('detects Cmaj7 chord', () => {
        const testChord = TEST_CHORDS.cMaj7;
        musicalAssertions.assertValidChord(testChord.notes);

        const match = getMatch(testChord.notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe(testChord.expectedChord.symbol);
        expect(match.chordName).toBe('Major 7th');
        expect(match.root).toBe(testChord.expectedChord.root);
        expect(match.rootName).toBe('C');
      });

      it('detects Dm7 chord', () => {
        const testChord = TEST_CHORDS.dm7;
        musicalAssertions.assertValidChord(testChord.notes);

        const match = getMatch(testChord.notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe(testChord.expectedChord.symbol);
        expect(match.chordName).toBe('Minor 7th');
        expect(match.root).toBe(testChord.expectedChord.root);
        expect(match.rootName).toBe('D');
      });

      it('detects G7 chord', () => {
        const testChord = TEST_CHORDS.g7;
        musicalAssertions.assertValidChord(testChord.notes);

        const match = getMatch(testChord.notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe(testChord.expectedChord.symbol);
        expect(match.chordName).toBe('Dominant 7th');
        expect(match.root).toBe(testChord.expectedChord.root);
        expect(match.rootName).toBe('G');
      });
    });

    describe('Suspended Chords', () => {
      it('detects Csus2 chord', () => {
        if (!TEST_CHORDS.csus2) return;
        const testChord = TEST_CHORDS.csus2;
        musicalAssertions.assertValidChord(testChord.notes);

        const match = getMatch(testChord.notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe(testChord.expectedChord.symbol);
        expect(match.chordName).toBe('Suspended 2nd');
        expect(match.root).toBe(testChord.expectedChord.root);
        expect(match.rootName).toBe('C');
      });

      it('detects Csus4 chord', () => {
        if (!TEST_CHORDS.csus4) return;
        const testChord = TEST_CHORDS.csus4;
        musicalAssertions.assertValidChord(testChord.notes);

        const match = getMatch(testChord.notes);
        expect(match).toBeTruthy();
        expect(match.chordSymbol).toBe(testChord.expectedChord.symbol);
        expect(match.chordName).toBe('Suspended 4th');
        expect(match.root).toBe(testChord.expectedChord.root);
        expect(match.rootName).toBe('C');
      });
    });
  });

  describe('Chord Inversions', () => {
    it('detects C major first inversion (C/E)', () => {
      const testInversion = TEST_INVERSIONS.cMajorFirstInversion;
      const match = getMatch(testInversion.notes);

      expect(match).toBeTruthy();
      expect(match.chordSymbol).toBe(testInversion.expectedChord.symbol);
      expect(match.bassNote).toBe(testInversion.expectedChord.bassNote);
      expect(match.inversion).toBe(testInversion.expectedChord.inversion);
    });

    it('detects A minor first inversion (Am/C)', () => {
      const testInversion = TEST_INVERSIONS.aMinorFirstInversion;
      musicalAssertions.assertValidChord(testInversion.notes);

      const match = getMatch(testInversion.notes);
      expect(match).toBeTruthy();
      expect(match.chordSymbol).toBe(testInversion.expectedChord.symbol);
      expect(match.bassNote).toBe(testInversion.expectedChord.bassNote);
      expect(match.inversion).toBe(testInversion.expectedChord.inversion);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('returns empty array for empty note array', () => {
      const result = findChordMatches([]);
      expect(result).toEqual([]);
    });

    it('returns empty array for single note', () => {
      const result = findChordMatches([60]);
      expect(result).toEqual([]);
    });

    it('handles invalid MIDI notes gracefully', () => {
      const invalidNotes = [-1, 128, 200];
      expect(() => findChordMatches(invalidNotes)).not.toThrow();
    });

    it('handles duplicate notes', () => {
      const duplicateNotes = [60, 60, 64, 67];
      const match = getMatch(duplicateNotes);
      expect(match).toBeTruthy();
    });
  });

  describe('Performance Tests', () => {
    it('analyzes chord quickly', () => {
      const testChord = TEST_CHORDS.cMajor;
      const iterations = 100;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        findChordMatches(testChord.notes);
      }

      const end = Date.now();
      const avgTime = (end - start) / iterations;
      expect(avgTime).toBeLessThan(1);
    });

    it('handles rapid chord analysis', () => {
      const chords = [
        TEST_CHORDS.cMajor.notes,
        TEST_CHORDS.aMinor.notes,
        TEST_CHORDS.cMaj7.notes,
        TEST_CHORDS.dm7.notes,
        TEST_CHORDS.g7.notes,
      ];

      const iterations = 10;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        chords.forEach(chord => findChordMatches(chord));
      }

      const end = Date.now();
      const avgTime = (end - start) / iterations;
      expect(avgTime).toBeLessThan(5);
    });

    it('handles stress testing with many chords', () => {
      const testChords = [
        TEST_CHORDS.cMajor.notes,
        TEST_CHORDS.aMinor.notes,
        TEST_CHORDS.cMaj7.notes,
      ];

      const iterations = 1000;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        const chord = testChords[i % testChords.length];
        findChordMatches(chord);
      }

      const end = Date.now();
      const totalTime = end - start;
      expect(totalTime).toBeLessThan(1000);
    });
  });
});
