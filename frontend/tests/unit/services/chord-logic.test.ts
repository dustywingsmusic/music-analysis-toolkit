import { beforeEach, describe, expect, it } from 'vitest';
import { CHORD_INTERVALS, createChord, TEST_CHORDS, TEST_INVERSIONS } from '@fixtures/musical-data';
import { musicalAssertions } from '@utils/test-helpers';
import { findChordMatches, detectPartialSusChords } from '@/services/chordLogic';

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

  describe('Partial Suspended Chord Detection', () => {
    describe('A-C#-D Pattern (Major 3rd + 4th)', () => {
      it('detects as Asus4(no5) - primary interpretation', () => {
        const notes = [69, 73, 74]; // A4-C#5-D5 (A-C#-D)
        const matches = findChordMatches(notes);

        expect(matches).toBeTruthy();
        expect(matches.length).toBeGreaterThan(0);

        // Should detect as partial sus4
        const sus4Match = matches.find(m => m.chordSymbol.includes('sus4'));
        expect(sus4Match).toBeTruthy();
        expect(sus4Match?.rootName).toBe('A');
        expect(sus4Match?.isPartial).toBe(true);
        expect(sus4Match?.missingNotes).toContain('E');
        expect(sus4Match?.confidence).toBeGreaterThan(0.8);
      });

      it('provides pedagogical guidance for A-C#-D', () => {
        const notes = [69, 73, 74]; // A4-C#5-D5
        const matches = findChordMatches(notes);

        const sus4Match = matches.find(m => m.chordSymbol.includes('sus4'));
        expect(sus4Match?.pedagogicalNote).toContain('tension');
        expect(sus4Match?.completionSuggestion).toContain('A-D-E');
      });
    });

    describe('A-C-D Pattern (Minor 3rd + 4th)', () => {
      it('detects as Am(add4) - not suspended', () => {
        const notes = [69, 72, 74]; // A4-C5-D5 (A-C-D)
        const matches = findChordMatches(notes);

        expect(matches).toBeTruthy();
        expect(matches.length).toBeGreaterThan(0);

        // Should detect as minor add4, not sus chord
        const add4Match = matches.find(m => m.chordSymbol.includes('add4'));
        expect(add4Match).toBeTruthy();
        expect(add4Match?.rootName).toBe('A');
        expect(add4Match?.chordName).toBe('Minor add 4th');
        expect(add4Match?.confidence).toBeGreaterThan(0.8);

        // Should NOT be labeled as suspended
        const susMatch = matches.find(m => m.chordSymbol.includes('sus'));
        expect(susMatch).toBeFalsy();
      });

      it('provides correct pedagogical note for Am(add4)', () => {
        const notes = [69, 72, 74]; // A4-C5-D5
        const matches = findChordMatches(notes);

        const add4Match = matches.find(m => m.chordSymbol.includes('add4'));
        expect(add4Match?.pedagogicalNote).toContain('retains minor 3rd');
        expect(add4Match?.pedagogicalNote).toContain('contemporary');
      });
    });

    describe('Two-Note Partial Chords', () => {
      it('detects A-D as sus4(no5)', () => {
        const notes = [69, 74]; // A4-D5 (A-D)
        const matches = findChordMatches(notes);

        expect(matches).toBeTruthy();
        const sus4Match = matches.find(m => m.chordSymbol.includes('sus4'));
        expect(sus4Match).toBeTruthy();
        expect(sus4Match?.isPartial).toBe(true);
        expect(sus4Match?.missingNotes).toEqual(['E']);
      });

      it('detects A-B as sus2(no5)', () => {
        const notes = [69, 71]; // A4-B5 (A-B)
        const matches = findChordMatches(notes);

        expect(matches).toBeTruthy();
        const sus2Match = matches.find(m => m.chordSymbol.includes('sus2'));
        expect(sus2Match).toBeTruthy();
        expect(sus2Match?.isPartial).toBe(true);
      });
    });

    describe('Extended Partial Cases', () => {
      it('handles F-G-C pattern (Fsus2 missing 5th)', () => {
        const notes = [65, 67, 72]; // F4-G4-C5 (F-G-C)
        const matches = findChordMatches(notes);

        expect(matches).toBeTruthy();
        const fSusMatch = matches.find(m =>
          m.rootName === 'F' && m.chordSymbol.includes('sus2')
        );
        expect(fSusMatch).toBeTruthy();
      });

      it('handles G-C-D pattern (Gsus4 missing 5th)', () => {
        const notes = [67, 72, 74]; // G4-C5-D5 (G-C-D)
        const matches = findChordMatches(notes);

        expect(matches).toBeTruthy();
        const gSusMatch = matches.find(m =>
          m.rootName === 'G' && m.chordSymbol.includes('sus4')
        );
        expect(gSusMatch).toBeTruthy();
      });
    });

    describe('Confidence Scoring for Partial Chords', () => {
      it('gives higher confidence to exact partial matches', () => {
        const notes = [69, 74]; // A4-D5 (perfect sus4 partial)
        const matches = findChordMatches(notes);

        const sus4Match = matches.find(m => m.chordSymbol.includes('sus4'));
        expect(sus4Match?.confidence).toBeGreaterThan(0.8);
      });

      it('distinguishes between sus and add interpretations', () => {
        const notesWithThird = [69, 73, 74]; // A4-C#5-D5 (has major 3rd + 4th)
        const matches = findChordMatches(notesWithThird);

        const sus4Match = matches.find(m => m.chordSymbol.includes('sus4'));
        const add4Match = matches.find(m => m.chordSymbol.includes('add4'));

        // Both should be detected but with appropriate confidence levels
        expect(sus4Match).toBeTruthy();
        expect(add4Match).toBeTruthy();

        // Sus4 should have higher confidence for this pattern
        if (sus4Match && add4Match) {
          expect(sus4Match.confidence).toBeGreaterThan(add4Match.confidence);
        }
      });
    });
  });

  describe('Specialized Partial Sus Chord Detector', () => {
    describe('detectPartialSusChords function', () => {
      it('correctly identifies A-C#-D as partial sus4', () => {
        const notes = [69, 73, 74]; // A4-C#5-D5
        const matches = detectPartialSusChords(notes);

        expect(matches).toBeTruthy();
        expect(matches.length).toBeGreaterThan(0);

        const sus4Match = matches.find(m => m.chordSymbol.includes('sus4'));
        expect(sus4Match).toBeTruthy();
        expect(sus4Match?.confidence).toBe(0.88);
        expect(sus4Match?.pedagogicalNote).toContain('Partial sus4 chord');
      });

      it('correctly identifies A-C-D as minor add4', () => {
        const notes = [69, 72, 74]; // A4-C5-D5
        const matches = detectPartialSusChords(notes);

        expect(matches).toBeTruthy();
        const add4Match = matches.find(m => m.chordSymbol.includes('add4'));
        expect(add4Match).toBeTruthy();
        expect(add4Match?.confidence).toBe(0.85);
        expect(add4Match?.chordName).toBe('Minor add 4th');
      });

      it('returns empty for non-3-note inputs', () => {
        expect(detectPartialSusChords([69, 74])).toEqual([]); // 2 notes
        expect(detectPartialSusChords([69, 72, 74, 77])).toEqual([]); // 4 notes
      });

      it('handles different octaves correctly', () => {
        const notes = [57, 61, 62]; // A3-C#4-D4 (same pattern, different octave)
        const matches = detectPartialSusChords(notes);

        expect(matches).toBeTruthy();
        const sus4Match = matches.find(m => m.chordSymbol.includes('sus4'));
        expect(sus4Match?.rootName).toBe('A');
      });
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
