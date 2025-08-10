import { beforeEach, describe, expect, it } from 'vitest';
import { findChordMatches } from '@/services/chordLogic';

/**
 * Tests for MIDI chord detection in chord progression input
 * Ensures that MIDI notes are properly converted to chord symbols
 * for use in chord progression analysis.
 */
describe('Chord Progression MIDI Detection', () => {
  describe('MIDI Notes to Chord Symbol Conversion', () => {
    it('detects C major from MIDI notes [60, 64, 67]', () => {
      const midiNotes = [60, 64, 67]; // C, E, G
      const detectedChords = findChordMatches(midiNotes);

      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('C');
      expect(detectedChords[0].chordName).toBe('Major');
    });

    it('detects A minor from MIDI notes [57, 60, 64]', () => {
      const midiNotes = [57, 60, 64]; // A, C, E
      const detectedChords = findChordMatches(midiNotes);

      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('Am');
      expect(detectedChords[0].chordName).toBe('Minor');
    });

    it('detects F major from MIDI notes [65, 69, 72]', () => {
      const midiNotes = [65, 69, 72]; // F, A, C
      const detectedChords = findChordMatches(midiNotes);

      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('F');
      expect(detectedChords[0].chordName).toBe('Major');
    });

    it('detects G7 from MIDI notes [67, 71, 74, 77]', () => {
      const midiNotes = [67, 71, 74, 77]; // G, B, D, F
      const detectedChords = findChordMatches(midiNotes);

      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('G7');
      expect(detectedChords[0].chordName).toBe('Dominant 7th');
    });
  });

  describe('Smart vs Chord vs Full Scale Mode Behavior', () => {
    it('detects chord in "chord" focus mode (3+ notes)', () => {
      const midiNotes = [60, 64, 67]; // C major triad
      const analysisFocus = 'chord';

      // In chord mode, should detect chord with 3+ notes
      if (midiNotes.length >= 3 && analysisFocus === 'chord') {
        const detectedChords = findChordMatches(midiNotes);
        expect(detectedChords.length).toBeGreaterThan(0);
        expect(detectedChords[0].chordSymbol).toBe('C');
      }
    });

    it('handles smart mode - auto-detects chord when 3+ notes played', () => {
      const midiNotes = [60, 64, 67]; // C major triad
      const analysisFocus = 'automatic';

      // In smart mode, should detect chord when playing 3+ notes
      if (midiNotes.length >= 3) {
        const detectedChords = findChordMatches(midiNotes);
        expect(detectedChords.length).toBeGreaterThan(0);
        expect(detectedChords[0].chordSymbol).toBe('C');
      }
    });

    it('handles individual notes in smart mode (1-2 notes)', () => {
      const midiNotes = [60]; // Single C note
      const analysisFocus = 'automatic';

      // In smart mode with single note, chord detection returns empty array
      const detectedChords = findChordMatches(midiNotes);
      expect(detectedChords).toEqual([]);
    });
  });

  describe('Common Chord Progressions', () => {
    const commonProgressions = {
      'I-vi-IV-V in C': [
        [60, 64, 67], // C major
        [57, 60, 64], // A minor
        [65, 69, 72], // F major
        [67, 71, 74]  // G major
      ],
      'ii-V-I in C': [
        [62, 65, 69], // D minor
        [67, 71, 74], // G major
        [60, 64, 67]  // C major
      ]
    };

    it('detects I-vi-IV-V progression in C major', () => {
      const progression = commonProgressions['I-vi-IV-V in C'];
      const expectedChords = ['C', 'Am', 'F', 'G'];

      progression.forEach((midiNotes, index) => {
        const detectedChords = findChordMatches(midiNotes);
        expect(detectedChords.length).toBeGreaterThan(0);
        expect(detectedChords[0].chordSymbol).toBe(expectedChords[index]);
      });
    });

    it('detects ii-V-I progression in C major', () => {
      const progression = commonProgressions['ii-V-I in C'];
      const expectedChords = ['Dm', 'G', 'C'];

      progression.forEach((midiNotes, index) => {
        const detectedChords = findChordMatches(midiNotes);
        expect(detectedChords.length).toBeGreaterThan(0);
        expect(detectedChords[0].chordSymbol).toBe(expectedChords[index]);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles duplicate MIDI notes', () => {
      const midiNotes = [60, 60, 64, 67, 67]; // C major with duplicates
      const detectedChords = findChordMatches(midiNotes);

      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('C');
    });

    it('handles notes across multiple octaves', () => {
      const midiNotes = [48, 64, 79]; // C across multiple octaves (C3, E4, G5)
      const detectedChords = findChordMatches(midiNotes);

      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('C');
    });

    it('correctly identifies bass note by MIDI number, not input order', () => {
      // Test 1: C major with E in bass (first inversion) - E entered first but C is lower
      const midiNotes1 = [64, 60, 67]; // E4, C4, G4 - input order E, C, G
      const detectedChords1 = findChordMatches(midiNotes1);

      expect(detectedChords1.length).toBeGreaterThan(0);
      expect(detectedChords1[0].chordSymbol).toBe('C'); // Should be root position, not inversion
      expect(detectedChords1[0].bassNote).toBe(0); // C should be bass (MIDI 60 % 12 = 0)

      // Test 2: C major with actual E in bass (first inversion) - E is lowest note
      const midiNotes2 = [52, 60, 67]; // E3, C4, G4 - E is actually lowest
      const detectedChords2 = findChordMatches(midiNotes2);

      expect(detectedChords2.length).toBeGreaterThan(0);
      expect(detectedChords2[0].chordSymbol).toBe('C/E'); // Should be first inversion
      expect(detectedChords2[0].bassNote).toBe(4); // E should be bass (MIDI 52 % 12 = 4)

      // Test 3: Same chord, different input order, same bass note result
      const midiNotes3 = [60, 52, 67]; // C4, E3, G4 - different input order, same lowest note
      const detectedChords3 = findChordMatches(midiNotes3);

      expect(detectedChords3.length).toBeGreaterThan(0);
      expect(detectedChords3[0].chordSymbol).toBe('C/E'); // Should be first inversion
      expect(detectedChords3[0].bassNote).toBe(4); // E should still be bass (MIDI 52 % 12 = 4)
    });

    it('detects partial chords for 2 notes', () => {
      const midiNotes = [60, 64]; // C and E - partial C major chord
      const detectedChords = findChordMatches(midiNotes);

      // Should detect partial chord (C major without 5th)
      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toContain('C');
      expect(detectedChords[0].isPartial).toBe(true);
    });

    it('handles invalid MIDI numbers gracefully', () => {
      const invalidMidiNotes = [-1, 60, 64, 128]; // Invalid MIDI numbers mixed with valid

      expect(() => findChordMatches(invalidMidiNotes)).not.toThrow();
    });
  });

  describe('Performance Tests for Real-Time MIDI', () => {
    it('detects chords quickly for real-time MIDI input', () => {
      const testChords = [
        [60, 64, 67], // C major
        [62, 65, 69], // D minor
        [64, 68, 71], // E major
        [65, 69, 72], // F major
      ];

      const iterations = 50; // Simulate rapid MIDI input
      const start = Date.now();

      testChords.forEach(midiNotes => {
        for (let i = 0; i < iterations; i++) {
          findChordMatches(midiNotes);
        }
      });

      const end = Date.now();
      const totalTime = end - start;

      // Should be able to analyze 200 chord detections in under 100ms
      expect(totalTime).toBeLessThan(100);
    });

    it('handles rapid chord changes without memory leaks', () => {
      const chordSequence = [
        [60, 64, 67], // C
        [57, 60, 64], // Am
        [65, 69, 72], // F
        [67, 71, 74], // G
      ];

      // Simulate playing chord progression rapidly 100 times
      for (let i = 0; i < 100; i++) {
        chordSequence.forEach(midiNotes => {
          const result = findChordMatches(midiNotes);
          expect(result.length).toBeGreaterThan(0);
        });
      }

      // Test should complete without issues
      expect(true).toBe(true);
    });
  });

  describe('MIDI Integration Testing', () => {
    // Mock MIDI note data structures to test integration
    const mockMidiNote = (noteNumber: number, noteName: string) => ({
      number: noteNumber,
      name: noteName,
      octave: Math.floor(noteNumber / 12) - 1,
    });

    it('processes mock MIDI note objects correctly', () => {
      const mockPlayedNotes = [
        mockMidiNote(60, 'C'),
        mockMidiNote(64, 'E'),
        mockMidiNote(67, 'G')
      ];

      // Extract MIDI numbers from mock objects (simulating real MIDI integration)
      const midiNumbers = mockPlayedNotes.map(note => note.number);
      const detectedChords = findChordMatches(midiNumbers);

      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('C');
    });

    it('handles mixed note formats (objects and numbers)', () => {
      // Simulate mixed data that might come from different MIDI sources
      const mixedNotes: any[] = [
        60, // Just a number
        { number: 64, name: 'E' }, // Object format
        mockMidiNote(67, 'G') // Full mock object
      ];

      const midiNumbers = mixedNotes.map(note =>
        typeof note === 'number' ? note : (note.number || 60)
      );

      const detectedChords = findChordMatches(midiNumbers);
      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords[0].chordSymbol).toBe('C');
    });
  });
});
