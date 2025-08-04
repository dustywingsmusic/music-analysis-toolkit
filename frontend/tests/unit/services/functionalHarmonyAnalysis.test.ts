/**
 * Comprehensive Test Suite for FunctionalHarmonyAnalyzer
 * Tests Roman numeral analysis, secondary dominants, borrowed chords, and chord functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FunctionalHarmonyAnalyzer, FunctionalAnalysisResult, ChromaticType, ChordFunction } from '@/services/functionalHarmonyAnalysis';
import { 
  comprehensiveMusicTheoryTestDataset, 
  getTestCasesByCategory,
  getTestCasesByPrimaryApproach,
  getTestCasesWithChromaticElements,
  MusicTheoryTestCase
} from '@/test-data/comprehensive-music-theory-test-dataset';

describe('FunctionalHarmonyAnalyzer', () => {
  let analyzer: FunctionalHarmonyAnalyzer;

  beforeEach(() => {
    analyzer = new FunctionalHarmonyAnalyzer();
  });

  describe('Basic Functional Progressions', () => {
    const basicFunctionalTests = getTestCasesByCategory('Basic Functional');

    it('should analyze classic I-IV-V-I progression correctly', async () => {
      const testCase = basicFunctionalTests.find(t => t.input === 'C F G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'F', 'G', 'C'], testCase!.parentKey);

      expect(result.keyCenter).toContain('C');
      expect(result.keyCenter).toContain('Major');
      expect(result.chords).toHaveLength(4);
      expect(result.chords.map(c => c.romanNumeral)).toEqual(['I', 'IV', 'V', 'I']);
      expect(result.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
      expect(result.confidence).toBeLessThanOrEqual(testCase!.confidence[1]);
    });

    it('should analyze minor key progressions correctly', async () => {
      const testCase = basicFunctionalTests.find(t => t.input === 'Am Dm Em Am');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['Am', 'Dm', 'Em', 'Am'], testCase!.parentKey);

      expect(result.keyCenter).toContain('A');
      expect(result.keyCenter).toContain('Minor');
      expect(result.chords.map(c => c.romanNumeral)).toEqual(['i', 'iv', 'v', 'i']);
      expect(result.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
    });

    it('should handle raised leading tone in minor', async () => {
      const testCase = basicFunctionalTests.find(t => t.input === 'Am Dm E Am');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['Am', 'Dm', 'E', 'Am'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['i', 'iv', 'V', 'i']);
      expect(result.chords[2].function).toBe('dominant');
      expect(result.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
    });

    it('should analyze ii-V-I jazz progressions', async () => {
      const testCase = basicFunctionalTests.find(t => t.input === 'Dm G C F');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['Dm', 'G', 'C', 'F'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['ii', 'V', 'I', 'IV']);
      expect(result.chords[0].function).toBe('predominant');
      expect(result.chords[1].function).toBe('dominant');
      expect(result.chords[2].function).toBe('tonic');
      expect(result.progressionType).toBe('jazz_standard');
    });
  });

  describe('Cadence Recognition', () => {
    const cadenceTests = getTestCasesByCategory('Cadences');

    it('should identify authentic cadences', async () => {
      const testCase = cadenceTests.find(t => t.input === 'F G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['F', 'G', 'C'], testCase!.parentKey);

      expect(result.cadences).toHaveLength(1);
      expect(result.cadences[0].type).toBe('authentic');
      expect(result.cadences[0].strength).toBeGreaterThan(0.8);
      expect(result.progressionType).toBe('authentic_cadence');
    });

    it('should identify plagal cadences', async () => {
      const testCase = cadenceTests.find(t => t.input === 'F C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['F', 'C'], testCase!.parentKey);

      expect(result.cadences).toHaveLength(1);
      expect(result.cadences[0].type).toBe('plagal');
      expect(result.progressionType).toBe('plagal_cadence');
    });

    it('should identify deceptive cadences', async () => {
      const testCase = cadenceTests.find(t => t.input === 'G Am');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['G', 'Am'], testCase!.parentKey);

      expect(result.cadences).toHaveLength(1);
      expect(result.cadences[0].type).toBe('deceptive');
      expect(result.chords.map(c => c.romanNumeral)).toEqual(['V', 'vi']);
    });

    it('should identify half cadences', async () => {
      const testCase = cadenceTests.find(t => t.input === 'C G');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'G'], testCase!.parentKey);

      expect(result.cadences).toHaveLength(1);
      expect(result.cadences[0].type).toBe('half');
      expect(result.progressionType).toBe('half_cadence');
    });
  });

  describe('Secondary Dominants', () => {
    const secondaryDominantTests = getTestCasesByCategory('Secondary Dominants');

    it('should identify V/vi secondary dominant', async () => {
      const testCase = secondaryDominantTests.find(t => t.input === 'C E7 Am F G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'E7', 'Am', 'F', 'G', 'C'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['I', 'V/vi', 'vi', 'IV', 'V', 'I']);
      expect(result.chords[1].isChromatic).toBe(true);
      expect(result.chords[1].chromaticType).toBe('secondary_dominant');
      expect(result.chromaticElements).toHaveLength(1);
      expect(result.chromaticElements[0].type).toBe('secondary_dominant');
    });

    it('should identify V/ii secondary dominant', async () => {
      const testCase = secondaryDominantTests.find(t => t.input === 'C A7 Dm G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'A7', 'Dm', 'G', 'C'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['I', 'V/ii', 'ii', 'V', 'I']);
      expect(result.chords[1].chromaticType).toBe('secondary_dominant');
      expect(result.chromaticElements[0].explanation).toContain('tonicizes');
    });

    it('should identify the classic V/V (five of five)', async () => {
      const testCase = secondaryDominantTests.find(t => t.input === 'C D7 G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'D7', 'G', 'C'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['I', 'V/V', 'V', 'I']);
      expect(result.chromaticElements[0].explanation).toContain('dominant of the dominant');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should identify V/iii in complex progressions', async () => {
      const testCase = secondaryDominantTests.find(t => t.input === 'F B7 Em Am Dm G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['F', 'B7', 'Em', 'Am', 'Dm', 'G', 'C'], testCase!.parentKey);

      expect(result.chords[1].romanNumeral).toBe('V/iii');
      expect(result.chords[1].chromaticType).toBe('secondary_dominant');
      expect(result.chromaticElements[0].resolution?.romanNumeral).toBe('iii');
    });
  });

  describe('Borrowed Chords', () => {
    const borrowedChordTests = getTestCasesByCategory('Borrowed Chords');

    it('should identify bVI borrowed from parallel minor', async () => {
      const testCase = borrowedChordTests.find(t => t.input === 'C F Ab G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'F', 'Ab', 'G', 'C'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['I', 'IV', 'bVI', 'V', 'I']);
      expect(result.chords[2].isChromatic).toBe(true);
      expect(result.chords[2].chromaticType).toBe('borrowed_chord');
      expect(result.chromaticElements[0].explanation).toContain('parallel minor');
    });

    it('should identify minor iv chord', async () => {
      const testCase = borrowedChordTests.find(t => t.input === 'C Fm G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'Fm', 'G', 'C'], testCase!.parentKey);

      expect(result.chords[1].romanNumeral).toBe('iv');
      expect(result.chords[1].chromaticType).toBe('borrowed_chord');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('should identify bVII borrowed chord', async () => {
      const testCase = borrowedChordTests.find(t => t.input === 'C Bb F C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'Bb', 'F', 'C'], testCase!.parentKey);

      expect(result.chords[1].romanNumeral).toBe('bVII');
      expect(result.chords[1].chromaticType).toBe('borrowed_chord');
      expect(result.chromaticElements[0].explanation).toContain('rock progressions');
    });
  });

  describe('Chromatic Mediants', () => {
    const chromaticMediantTests = getTestCasesByCategory('Chromatic Mediants');

    it('should identify III chromatic mediant', async () => {
      const testCase = chromaticMediantTests.find(t => t.input === 'C E F C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'E', 'F', 'C'], testCase!.parentKey);

      expect(result.chords[1].romanNumeral).toBe('III');
      expect(result.chords[1].chromaticType).toBe('chromatic_mediant');
      expect(result.chromaticElements[0].explanation).toContain('harmonic shift');
    });

    it('should identify bVI as chromatic mediant', async () => {
      const testCase = chromaticMediantTests.find(t => t.input === 'C Ab F C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'Ab', 'F', 'C'], testCase!.parentKey);

      expect(result.chords[1].romanNumeral).toBe('bVI');
      expect(result.chords[1].chromaticType).toBe('chromatic_mediant');
      expect(result.chromaticElements[0].explanation).toContain('romantic harmonic');
    });
  });

  describe('Complex Jazz Harmonies', () => {
    const jazzHarmonyTests = getTestCasesByCategory('Jazz Harmony');

    it('should analyze complex jazz progression with 7th chords', async () => {
      const testCase = jazzHarmonyTests.find(t => t.input === 'Cmaj7 A7 Dm7 G7 Em7 A7 Dm7 G7 Cmaj7');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(
        ['Cmaj7', 'A7', 'Dm7', 'G7', 'Em7', 'A7', 'Dm7', 'G7', 'Cmaj7'], 
        testCase!.parentKey
      );

      expect(result.chords.map(c => c.romanNumeral)).toEqual([
        'Imaj7', 'V7/ii', 'ii7', 'V7', 'iii7', 'V7/ii', 'ii7', 'V7', 'Imaj7'
      ]);
      expect(result.chromaticElements.filter(e => e.type === 'secondary_dominant')).toHaveLength(2);
      expect(result.progressionType).toBe('jazz_standard');
    });

    it('should handle multiple secondary dominants', async () => {
      const testCase = jazzHarmonyTests.find(t => t.input === 'Fmaj7 Bm7b5 E7 Am7 D7 Dm7 G7 Cmaj7');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(
        ['Fmaj7', 'Bm7b5', 'E7', 'Am7', 'D7', 'Dm7', 'G7', 'Cmaj7'], 
        testCase!.parentKey
      );

      const secondaryDominants = result.chromaticElements.filter(e => e.type === 'secondary_dominant');
      expect(secondaryDominants).toHaveLength(2);
      expect(result.chords.some(c => c.romanNumeral === 'V7/vi')).toBe(true);
      expect(result.chords.some(c => c.romanNumeral === 'V7/ii')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    const edgeCaseTests = getTestCasesByCategory('Edge Cases');

    it('should handle single chord analysis', async () => {
      const testCase = edgeCaseTests.find(t => t.input === 'C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C'], testCase!.parentKey);

      expect(result.chords).toHaveLength(1);
      expect(result.chords[0].romanNumeral).toBe('I');
      expect(result.chords[0].function).toBe('tonic');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should identify Neapolitan chord', async () => {
      const testCase = edgeCaseTests.find(t => t.input === 'C Db C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'Db', 'C']);

      expect(result.chords[1].romanNumeral).toBe('bII');
      expect(result.chords[1].chromaticType).toBe('borrowed_chord');
      expect(result.chromaticElements[0].explanation).toContain('Neapolitan');
    });

    it('should handle augmented fourth relationships', async () => {
      const testCase = edgeCaseTests.find(t => t.input === 'C F# G C');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['C', 'F#', 'G', 'C'], testCase!.parentKey);

      expect(result.chords[1].romanNumeral).toBe('#IV');
      expect(result.chords[1].chromaticType).toBe('chromatic_mediant');
      expect(result.chromaticElements[0].explanation).toContain('chromatic harmonic motion');
    });
  });

  describe('Chord Quality Recognition', () => {
    const chordQualityTests = getTestCasesByCategory('Chord Quality');

    it('should recognize all major 7th chords', async () => {
      const testCase = chordQualityTests.find(t => t.input === 'Cmaj7 Fmaj7 Gmaj7 Cmaj7');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['Cmaj7', 'Fmaj7', 'Gmaj7', 'Cmaj7'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['Imaj7', 'IVmaj7', 'Vmaj7', 'Imaj7']);
      expect(result.chords.every(c => c.chordName.includes('maj7'))).toBe(true);
    });

    it('should recognize all minor chords in minor key', async () => {
      const testCase = chordQualityTests.find(t => t.input === 'Cm Fm Gm Cm');
      expect(testCase).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['Cm', 'Fm', 'Gm', 'Cm'], testCase!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['i', 'iv', 'v', 'i']);
      expect(result.keyCenter).toContain('Minor');
    });
  });

  describe('Context-Dependent Analysis', () => {
    const contextTests = getTestCasesByCategory('Context-Dependent');

    it('should analyze same progression differently with parent key context', async () => {
      const contextTest1 = contextTests.find(t => t.input === 'G F C G' && t.parentKey === 'G major');
      expect(contextTest1).toBeDefined();

      const result = await analyzer.analyzeFunctionally(['G', 'F', 'C', 'G'], contextTest1!.parentKey);

      expect(result.chords.map(c => c.romanNumeral)).toEqual(['I', 'bVII', 'IV', 'I']);
      expect(result.chords[1].chromaticType).toBe('borrowed_chord');
      expect(result.primaryApproach).toBe('functional');
    });
  });

  describe('Confidence Scoring', () => {
    it('should provide high confidence for clear functional progressions', async () => {
      const result = await analyzer.analyzeFunctionally(['C', 'F', 'G', 'C'], 'C major');

      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should provide lower confidence for ambiguous progressions', async () => {
      const result = await analyzer.analyzeFunctionally(['Am', 'F', 'C', 'G']);

      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should increase confidence with clear cadences', async () => {
      const result = await analyzer.analyzeFunctionally(['F', 'G', 'C'], 'C major');

      expect(result.cadences).toHaveLength(1);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('should decrease confidence with excessive chromatic content', async () => {
      const result = await analyzer.analyzeFunctionally(['C', 'F#', 'Bb', 'Eb', 'Ab', 'C']);

      expect(result.chromaticElements.length).toBeGreaterThan(2);
      expect(result.confidence).toBeLessThan(0.7);
    });
  });

  describe('Explanation Generation', () => {
    it('should generate clear explanations for functional progressions', async () => {
      const result = await analyzer.analyzeFunctionally(['C', 'Am', 'F', 'G'], 'C major');

      expect(result.explanation).toContain('Functional analysis');
      expect(result.explanation).toContain('I - vi - IV - V');
      expect(result.explanation).toBeDefined();
      expect(result.explanation.length).toBeGreaterThan(10);
    });

    it('should explain chromatic elements', async () => {
      const result = await analyzer.analyzeFunctionally(['C', 'A7', 'Dm', 'G', 'C'], 'C major');

      expect(result.explanation).toContain('chromatic element');
      expect(result.chromaticElements[0].explanation).toContain('tonicizes');
    });
  });

  describe('Integration with Test Dataset', () => {
    it('should pass all basic functional test cases', async () => {
      const basicTests = getTestCasesByPrimaryApproach('functional').slice(0, 10); // Test first 10

      for (const testCase of basicTests) {
        const chordSymbols = testCase.input.split(' ');
        const result = await analyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        expect(result.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomanNumerals);
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.confidence[0]);
        expect(result.confidence).toBeLessThanOrEqual(testCase.confidence[1]);
      }
    });

    it('should correctly identify chromatic elements from test dataset', async () => {
      const chromaticTests = getTestCasesWithChromaticElements().slice(0, 5); // Test first 5

      for (const testCase of chromaticTests) {
        const chordSymbols = testCase.input.split(' ');
        const result = await analyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        if (testCase.expectedChromaticElements?.secondaryDominants) {
          const secondaryDominants = result.chromaticElements.filter(e => e.type === 'secondary_dominant');
          expect(secondaryDominants.length).toBeGreaterThan(0);
        }

        if (testCase.expectedChromaticElements?.borrowedChords) {
          const borrowedChords = result.chromaticElements.filter(e => e.type === 'borrowed_chord');
          expect(borrowedChords.length).toBeGreaterThan(0);
        }

        if (testCase.expectedChromaticElements?.chromaticMediants) {
          const chromaticMediants = result.chromaticElements.filter(e => e.type === 'chromatic_mediant');
          expect(chromaticMediants.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle analysis within reasonable time', async () => {
      const startTime = performance.now();
      
      await analyzer.analyzeFunctionally(['C', 'Am', 'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C'], 'C major');
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should be consistent across multiple runs', async () => {
      const progression = ['C', 'F', 'G', 'C'];
      const parentKey = 'C major';

      const results = await Promise.all([
        analyzer.analyzeFunctionally(progression, parentKey),
        analyzer.analyzeFunctionally(progression, parentKey),
        analyzer.analyzeFunctionally(progression, parentKey)
      ]);

      // All results should be identical
      results.forEach(result => {
        expect(result.chords.map(c => c.romanNumeral)).toEqual(['I', 'IV', 'V', 'I']);
        expect(result.confidence).toBeCloseTo(results[0].confidence, 2);
      });
    });
  });
});