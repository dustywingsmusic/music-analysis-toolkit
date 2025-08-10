import { describe, it, expect } from 'vitest';
import { analyzeChordProgressionLocally, ProgressionInterpretation, LocalChordAnalysis } from '@/services/localChordProgressionAnalysis';
import {
  comprehensiveMusicTheoryTestDataset,
  getTestCasesByCategory,
  getTestCasesByPrimaryApproach,
  MusicTheoryTestCase
} from '@/test-data/comprehensive-music-theory-test-dataset';

describe('localChordProgressionAnalysis', () => {
  it('should analyze a basic chord progression without throwing errors', async () => {
    const progression = 'C - F - G - C';

    // Should not throw an error
    const result = await analyzeChordProgressionLocally(progression);

    // Should return a valid result structure
    expect(result).toBeDefined();
    expect(result.localAnalysis.chords).toBeInstanceOf(Array);
    expect(result.localAnalysis.keyCenter).toBeDefined();
    expect(result.localAnalysis.overallMode).toBeDefined();
    expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(0);
    expect(result.localAnalysis.confidence).toBeLessThanOrEqual(1);
    expect(result.localAnalysis.source).toBeDefined();
    expect(result.localAnalysis.explanation).toBeDefined();
  });

  it('should prioritize user-provided key context', async () => {
    const progression = 'A - Db - F# - Db - A';
    const knownKey = 'A major';

    const result = await analyzeChordProgressionLocally(progression, knownKey);

    // Should prioritize user context
    expect(result.localAnalysis.keyCenter).toMatch(/A\s+(Major|major)/);
    expect(result.localAnalysis.source).toBe('user-guided');
    expect(result.localAnalysis.confidence).toBeGreaterThan(0.8); // High confidence for user context
    expect(result.userContextProvided).toBe(knownKey);
  });

  it('should provide multiple interpretations when available', async () => {
    const progression = 'A - Db - F# - Db - A';

    const result = await analyzeChordProgressionLocally(progression);

    // Should have a valid primary analysis
    expect(result.localAnalysis).toBeDefined();
    expect(result.localAnalysis.source).toBeDefined();

    // Alternative interpretations are optional but if present, should be valid
    if (result.alternativeInterpretations) {
      expect(result.alternativeInterpretations.length).toBeGreaterThan(0);
      // Each alternative should have required properties
      result.alternativeInterpretations.forEach(alt => {
        expect(alt.keyCenter).toBeDefined();
        expect(alt.source).toBeDefined();
        expect(alt.confidence).toBeGreaterThanOrEqual(0);
        expect(alt.explanation).toBeDefined();
      });
    }
  });

  it('should handle empty progression gracefully', async () => {
    const progression = '';

    const result = await analyzeChordProgressionLocally(progression);

    expect(result).toBeDefined();
    expect(result.localAnalysis.chords).toBeInstanceOf(Array);
    expect(result.localAnalysis.chords).toHaveLength(0);
  });

  it('should handle single chord', async () => {
    const progression = 'Cmaj7';

    const result = await analyzeChordProgressionLocally(progression);

    expect(result).toBeDefined();
    expect(result.localAnalysis.chords).toBeInstanceOf(Array);
    expect(result.localAnalysis.chords.length).toBeGreaterThan(0);
  });

  it('should detect G Mixolydian for G F C G progression', async () => {
    const progression = 'G F C G';

    // Test without known key - should detect G as tonic based on structure
    const result1 = await analyzeChordProgressionLocally(progression);

    expect(result1).toBeDefined();
    expect(result1.localAnalysis.chords).toHaveLength(4);

    // Test with known key G major - should detect Mixolydian characteristics
    const result2 = await analyzeChordProgressionLocally(progression, 'G major');

    expect(result2).toBeDefined();
    expect(result2.localAnalysis.keyCenter).toMatch(/G\s+(Major|major)/);
    expect(result2.localAnalysis.source).toBe('user-guided');

    // Check for proper Roman numeral analysis
    const chordRomanNumerals = result2.localAnalysis.chords.map(c => c.romanNumeral);
    expect(chordRomanNumerals).toContain('I'); // G should be I
    expect(chordRomanNumerals).toContain('bVII'); // F should be bVII
    expect(chordRomanNumerals).toContain('IV'); // C should be IV

    // Should detect modal characteristics (Mixolydian mode)
    expect(result2.localAnalysis.overallMode).toContain('Mixolydian');
    expect(result2.localAnalysis.modalInterchange).toContain('bVII-I');
  });

  it('should detect bVII-I cadential movement in various progressions', async () => {
    // Test different keys with bVII-I movement
    const testCases = [
      { progression: 'D C D', key: 'D major', expectedMode: 'Mixolydian', bVII: 'C' },
      { progression: 'A G A', key: 'A major', expectedMode: 'Mixolydian', bVII: 'G' },
      { progression: 'E D E', key: 'E major', expectedMode: 'Mixolydian', bVII: 'D' }
    ];

    for (const testCase of testCases) {
      const result = await analyzeChordProgressionLocally(testCase.progression, testCase.key);

      expect(result.localAnalysis.overallMode).toContain(testCase.expectedMode);
      expect(result.localAnalysis.chords.some(c => c.romanNumeral === 'bVII')).toBe(true);
      expect(result.localAnalysis.modalInterchange).toContain('bVII-I');
    }
  });

  describe('Comprehensive Dataset Integration', () => {
    describe('Modal Analysis - No Parent Key', () => {
      const modalTests = getTestCasesByCategory('Modal - No Parent Key');

      it('should analyze G Mixolydian progression correctly', async () => {
        const testCase = modalTests.find(t => t.input === 'G F C G');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
        expect(result.localAnalysis.confidence).toBeLessThanOrEqual(testCase!.confidence[1]);
        expect(result.localAnalysis.overallMode).toContain('Mixolydian');
      });

      it('should analyze D Mixolydian progression', async () => {
        const testCase = modalTests.find(t => t.input === 'D C G D');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.overallMode).toContain('Mixolydian');
      });

      it('should analyze A Phrygian progression', async () => {
        const testCase = modalTests.find(t => t.input === 'Am Bb C Am');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.overallMode).toContain('Phrygian');
      });

      it('should analyze E Dorian progression', async () => {
        const testCase = modalTests.find(t => t.input === 'Em F# G Em');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.overallMode).toContain('Dorian');
      });

      it('should analyze F Lydian progression', async () => {
        const testCase = modalTests.find(t => t.input === 'F G Am Bb F');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.overallMode).toContain('Lydian');
      });

      it('should analyze B Aeolian progression', async () => {
        const testCase = modalTests.find(t => t.input === 'Bm A G Bm');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.overallMode).toContain('Aeolian');
      });
    });

    describe('Modal Analysis - With Parent Key', () => {
      const modalWithKeyTests = getTestCasesByCategory('Modal - With Parent Key');

      it('should analyze G Mixolydian in C major context', async () => {
        const testCase = modalWithKeyTests.find(t => t.input === 'G F C G' && t.parentKey === 'C major');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input, testCase!.parentKey);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.keyCenter).toContain('C Major');
        expect(result.localAnalysis.overallMode).toContain('Mixolydian');
        expect(result.localAnalysis.source).toBe('user-guided');
      });

      it('should analyze E Dorian in G major context', async () => {
        const testCase = modalWithKeyTests.find(t => t.input === 'Em F# G Em' && t.parentKey === 'G major');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input, testCase!.parentKey);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.keyCenter).toContain('G Major');
        expect(result.localAnalysis.overallMode).toContain('Dorian');
      });

      it('should analyze A Phrygian in F major context', async () => {
        const testCase = modalWithKeyTests.find(t => t.input === 'Am Bb C Am' && t.parentKey === 'F major');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input, testCase!.parentKey);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.keyCenter).toContain('F Major');
        expect(result.localAnalysis.overallMode).toContain('Phrygian');
      });
    });

    describe('Context-Dependent Analysis', () => {
      const contextTests = getTestCasesByCategory('Context-Dependent');

      it('should analyze same progression differently based on parent key context', async () => {
        const testCase1 = comprehensiveMusicTheoryTestDataset.find(t =>
          t.input === 'G F C G' && !t.parentKey && t.expectedPrimary === 'modal'
        );
        const testCase2 = comprehensiveMusicTheoryTestDataset.find(t =>
          t.input === 'G F C G' && t.parentKey === 'G major'
        );

        expect(testCase1).toBeDefined();
        expect(testCase2).toBeDefined();

        const resultWithoutKey = await analyzeChordProgressionLocally(testCase1!.input);
        const resultWithKey = await analyzeChordProgressionLocally(testCase2!.input, testCase2!.parentKey);

        // Without parent key: should detect as modal with G as tonic
        expect(resultWithoutKey.localAnalysis.overallMode).toContain('Mixolydian');
        expect(resultWithoutKey.localAnalysis.source).not.toBe('user-guided');

        // With parent key G major: should analyze in context
        expect(resultWithKey.localAnalysis.keyCenter).toContain('G Major');
        expect(resultWithKey.localAnalysis.source).toBe('user-guided');
      });
    });

    describe('Parent Key + Local Tonic Model Validation', () => {
      it('should consistently use parent key signature + local tonic approach', async () => {
        const testCase = comprehensiveMusicTheoryTestDataset.find(t =>
          t.input === 'Em F# G Em' && t.parentKey === 'G major'
        );
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input, testCase!.parentKey);

        // Should show parent key signature
        expect(result.localAnalysis.keyCenter).toContain('G Major');

        // Should show local tonic (E) in the mode name
        expect(result.localAnalysis.overallMode).toContain('E Dorian');

        // Roman numerals should be relative to G major scale but with E as local tonic
        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(['vi', 'VII', 'I', 'vi']);
      });

      it('should format parent key scale with all note names', async () => {
        const result = await analyzeChordProgressionLocally('G F C G', 'C major');

        expect(result.localAnalysis.keyCenter).toMatch(/C Major \([CDEFGAB ]+\)/);
      });

      it('should format mode with scale degrees', async () => {
        const result = await analyzeChordProgressionLocally('G F C G', 'C major');

        expect(result.localAnalysis.overallMode).toMatch(/G Mixolydian \([CDEFGAB# ]+\) - [1-7♭# ]+/);
      });
    });

    describe('Edge Cases from Dataset', () => {
      const edgeCaseTests = getTestCasesByCategory('Edge Cases');

      it('should handle single chord gracefully', async () => {
        const testCase = edgeCaseTests.find(t => t.input === 'C');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input, testCase!.parentKey);

        expect(result.localAnalysis.chords).toHaveLength(1);
        expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
      });

      it('should handle Neapolitan chord relationships', async () => {
        const testCase = edgeCaseTests.find(t => t.input === 'C Db C');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input);

        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase!.expectedRomanNumerals);
        expect(result.localAnalysis.chords[1].romanNumeral).toBe('bII');
      });

      it('should handle augmented fourth relationships', async () => {
        const testCase = edgeCaseTests.find(t => t.input === 'C F# G C');
        expect(testCase).toBeDefined();

        const result = await analyzeChordProgressionLocally(testCase!.input, testCase!.parentKey);

        expect(result.localAnalysis.chords[1].romanNumeral).toBe('#IV');
        expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
      });
    });

    describe('Alternative Interpretations', () => {
      it('should provide multiple interpretations when applicable', async () => {
        const result = await analyzeChordProgressionLocally('G F C G');

        expect(result.localAnalysis).toBeDefined();

        // Should have structural, algorithmic, and potentially user-guided interpretations
        if (result.alternativeInterpretations) {
          expect(result.alternativeInterpretations.length).toBeGreaterThan(0);

          result.alternativeInterpretations.forEach(alt => {
            expect(alt.keyCenter).toBeDefined();
            expect(alt.overallMode).toBeDefined();
            expect(alt.confidence).toBeGreaterThanOrEqual(0);
            expect(alt.confidence).toBeLessThanOrEqual(1);
            expect(['algorithmic', 'structural', 'user-guided']).toContain(alt.source);
          });
        }
      });

      it('should prioritize user-guided analysis when parent key provided', async () => {
        const result = await analyzeChordProgressionLocally('G F C G', 'C major');

        expect(result.localAnalysis.source).toBe('user-guided');
        expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(0.8);
        expect(result.userContextProvided).toBe('C major');
      });
    });
  });

  describe('Roman Numeral Analysis Accuracy', () => {
    it('should correctly identify I-IV-V-I in major keys', async () => {
      const testCases = [
        { input: 'C F G C', parentKey: 'C major', expected: ['I', 'IV', 'V', 'I'] },
        { input: 'A D E A', parentKey: 'A major', expected: ['I', 'IV', 'V', 'I'] },
        { input: 'G C D G', parentKey: 'G major', expected: ['I', 'IV', 'V', 'I'] }
      ];

      for (const testCase of testCases) {
        const result = await analyzeChordProgressionLocally(testCase.input, testCase.parentKey);
        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase.expected);
      }
    });

    it('should correctly identify i-iv-v-i in minor keys', async () => {
      const testCases = [
        { input: 'Am Dm Em Am', parentKey: 'A minor', expected: ['i', 'iv', 'v', 'i'] },
        { input: 'Bm Em F#m Bm', parentKey: 'B minor', expected: ['i', 'iv', 'v', 'i'] }
      ];

      for (const testCase of testCases) {
        const result = await analyzeChordProgressionLocally(testCase.input, testCase.parentKey);
        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase.expected);
      }
    });

    it('should correctly identify modal Roman numerals', async () => {
      const modalTests = [
        { input: 'G F C G', expected: ['I', 'bVII', 'IV', 'I'], mode: 'Mixolydian' },
        { input: 'Am Bb C Am', expected: ['i', 'bII', 'bIII', 'i'], mode: 'Phrygian' },
        { input: 'Em F# G Em', expected: ['i', 'II', 'bIII', 'i'], mode: 'Dorian' }
      ];

      for (const testCase of modalTests) {
        const result = await analyzeChordProgressionLocally(testCase.input);
        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(testCase.expected);
        expect(result.localAnalysis.overallMode).toContain(testCase.mode);
      }
    });
  });

  describe('Confidence Scoring Validation', () => {
    it('should provide high confidence for clear modal progressions', async () => {
      const result = await analyzeChordProgressionLocally('G F C G');
      expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should provide high confidence with user-provided context', async () => {
      const result = await analyzeChordProgressionLocally('G F C G', 'C major');
      expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('should provide appropriate confidence for single chords', async () => {
      const result = await analyzeChordProgressionLocally('C', 'C major');
      expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should adjust confidence based on structural evidence', async () => {
      // Same first and last chord should increase confidence
      const result1 = await analyzeChordProgressionLocally('C F G C');
      const result2 = await analyzeChordProgressionLocally('C F G Am');

      expect(result1.localAnalysis.confidence).toBeGreaterThan(result2.localAnalysis.confidence);
    });
  });

  describe('Performance and Consistency', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = performance.now();

      await analyzeChordProgressionLocally('G F C G Am F C G Em Am Dm G C');

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
    });

    it('should be consistent across multiple runs', async () => {
      const progression = 'G F C G';
      const parentKey = 'C major';

      const results = await Promise.all([
        analyzeChordProgressionLocally(progression, parentKey),
        analyzeChordProgressionLocally(progression, parentKey),
        analyzeChordProgressionLocally(progression, parentKey)
      ]);

      // All results should be identical
      results.forEach(result => {
        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(results[0].localAnalysis.chords.map(c => c.romanNumeral));
        expect(result.localAnalysis.confidence).toBeCloseTo(results[0].localAnalysis.confidence, 2);
        expect(result.localAnalysis.source).toBe(results[0].localAnalysis.source);
      });
    });

    it('should handle various input formats gracefully', async () => {
      const inputFormats = [
        'C F G C',
        'C - F - G - C',
        'C | F | G | C',
        'C  F  G  C',
        'C|F|G|C'
      ];

      for (const input of inputFormats) {
        const result = await analyzeChordProgressionLocally(input, 'C major');
        expect(result.localAnalysis.chords).toHaveLength(4);
        expect(result.localAnalysis.chords.map(c => c.romanNumeral)).toEqual(['I', 'IV', 'V', 'I']);
      }
    });
  });
});
