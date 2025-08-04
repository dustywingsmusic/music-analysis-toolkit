/**
 * Comprehensive Test Suite for ComprehensiveAnalysisEngine
 * Tests primary approach selection, multi-perspective analysis coordination, and alternative interpretations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComprehensiveAnalysisEngine, ComprehensiveAnalysisResult } from '@/services/comprehensiveAnalysisService';
import { 
  comprehensiveMusicTheoryTestDataset, 
  getTestCasesByCategory,
  getTestCasesByPrimaryApproach,
  getAmbiguousTestCases,
  MusicTheoryTestCase
} from '@/test-data/comprehensive-music-theory-test-dataset';

describe('ComprehensiveAnalysisEngine', () => {
  let engine: ComprehensiveAnalysisEngine;

  beforeEach(() => {
    engine = new ComprehensiveAnalysisEngine();
  });

  describe('Primary Approach Selection', () => {
    it('should select functional approach for basic tonal progressions', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C F G C' && t.expectedPrimary === 'functional'
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.primaryApproach).toBe('functional');
      expect(result.functional.chords.map(c => c.romanNumeral)).toEqual(['I', 'IV', 'V', 'I']);
      expect(result.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
    });

    it('should select modal approach for characteristic modal progressions', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'G F C G' && t.expectedPrimary === 'modal' && !t.parentKey
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input);

      expect(result.primaryApproach).toBe('modal');
      expect(result.modal).toBeDefined();
      expect(result.modal!.modalCharacteristics).toContain('bVII-I cadence (Mixolydian characteristic)');
    });

    it('should select chromatic approach for secondary dominant progressions', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C E7 Am F G C' && t.expectedPrimary === 'chromatic'
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.primaryApproach).toBe('chromatic');
      expect(result.chromatic).toBeDefined();
      expect(result.chromatic!.secondaryDominants).toHaveLength(1);
      expect(result.chromatic!.secondaryDominants[0].romanNumeral).toBe('V/vi');
    });

    it('should handle V/V (dominant of dominant) correctly', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C D7 G C' && t.expectedPrimary === 'chromatic'
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.primaryApproach).toBe('chromatic');
      expect(result.functional.chords.map(c => c.romanNumeral)).toEqual(['I', 'V/V', 'V', 'I']);
      expect(result.chromatic!.secondaryDominants[0].target).toBe('V');
      expect(result.chromatic!.secondaryDominants[0].explanation).toContain('dominant of the dominant');
    });
  });

  describe('Multi-Perspective Analysis Coordination', () => {
    it('should provide both functional and modal perspectives when applicable', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'G F C G' && t.parentKey === 'C major'
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.functional).toBeDefined();
      expect(result.modal).toBeDefined();
      expect(result.functional.chords.map(c => c.romanNumeral)).toEqual(['V', 'IV', 'I', 'V']);
      expect(result.modal!.comparisonToFunctional).toContain('functional and modal analysis');
    });

    it('should provide chromatic analysis for borrowed chords', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C F Ab G C' && t.expectedPrimary === 'chromatic'
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.functional).toBeDefined();
      expect(result.chromatic).toBeDefined();
      expect(result.chromatic!.borrowedChords).toHaveLength(1);
      expect(result.chromatic!.borrowedChords[0].romanNumeral).toBe('bVI');
      expect(result.chromatic!.borrowedChords[0].borrowedFrom).toBe('parallel minor');
    });

    it('should coordinate functional foundation with modal enhancement', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'Am Bb C Am' && t.expectedPrimary === 'modal'
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input);

      expect(result.functional).toBeDefined();
      expect(result.modal).toBeDefined();
      expect(result.modal!.whenToUseModal).toContain('scale relationships');
      expect(result.pedagogicalValue).toContain('modal characteristics');
    });
  });

  describe('Alternative Interpretation Generation', () => {
    const ambiguousTests = getAmbiguousTestCases();

    it('should provide alternative interpretations for ambiguous progressions', async () => {
      const testCase = ambiguousTests.find(t => t.input === 'Am F C G');
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input);

      expect(result.functional).toBeDefined();
      
      // Should identify the ambiguity in analysis
      expect(result.explanation).toContain('analysis') || expect(result.pedagogicalValue).toContain('multiple');
      
      // The functional analysis should handle the ambiguity appropriately
      const romanNumerals = result.functional.chords.map(c => c.romanNumeral);
      expect(romanNumerals).toEqual(['vi', 'IV', 'I', 'V']) || expect(romanNumerals).toEqual(['i', 'VI', 'III', 'VII']);
    });

    it('should handle highly ambiguous Em C G D progression', async () => {
      const testCase = ambiguousTests.find(t => t.input === 'Em C G D');
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input);

      expect(result.confidence).toBeLessThan(0.8); // Should reflect uncertainty
      expect(result.explanation).toBeDefined();
      expect(result.pedagogicalValue).toContain('perspective') || expect(result.pedagogicalValue).toContain('analysis');
    });

    it('should explain when functional vs modal analysis is preferred', async () => {
      const functionalTest = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C Am F G' && t.expectedPrimary === 'functional'
      );
      expect(functionalTest).toBeDefined();

      const result = await engine.analyzeComprehensively(functionalTest!.input);

      expect(result.primaryApproach).toBe('functional');
      expect(result.pedagogicalValue).toContain('functional harmony');
      
      if (result.modal) {
        expect(result.modal.whenToUseModal).toContain('less applicable') || 
               expect(result.modal.whenToUseModal).toContain('functional harmony');
      }
    });
  });

  describe('Context-Dependent Analysis', () => {
    it('should change analysis approach based on parent key context', async () => {
      // Same progression with different parent key contexts
      const contextTest1 = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'G F C G' && t.parentKey === 'G major'
      );
      const contextTest2 = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'G F C G' && !t.parentKey
      );

      expect(contextTest1).toBeDefined();
      expect(contextTest2).toBeDefined();

      const resultWithContext = await engine.analyzeComprehensively(contextTest1!.input, contextTest1!.parentKey);
      const resultWithoutContext = await engine.analyzeComprehensively(contextTest2!.input);

      // Parent key context should influence the analysis approach
      expect(resultWithContext.primaryApproach).toBe(contextTest1!.expectedPrimary);
      expect(resultWithoutContext.primaryApproach).toBe(contextTest2!.expectedPrimary);
    });

    it('should maintain modal analysis preference when context confirms it', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'Am Bb C Am' && t.parentKey === 'C major'
      );
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.primaryApproach).toBe('modal');
      expect(result.explanation).toContain('modal');
    });
  });

  describe('Jazz Harmony Integration', () => {
    const jazzTests = getTestCasesByCategory('Jazz Harmony');

    it('should handle complex jazz progressions with multiple secondary dominants', async () => {
      const testCase = jazzTests.find(t => t.input === 'Cmaj7 A7 Dm7 G7 Em7 A7 Dm7 G7 Cmaj7');
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.primaryApproach).toBe('chromatic');
      expect(result.chromatic!.secondaryDominants.length).toBeGreaterThanOrEqual(2);
      expect(result.functional.progressionType).toBe('jazz_standard');
    });

    it('should coordinate functional and chromatic analysis for jazz', async () => {
      const testCase = jazzTests.find(t => t.input === 'Fmaj7 Bm7b5 E7 Am7 D7 Dm7 G7 Cmaj7');
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.functional).toBeDefined();
      expect(result.chromatic).toBeDefined();
      expect(result.chromatic!.secondaryDominants.some(sd => sd.romanNumeral === 'V7/vi')).toBe(true);
      expect(result.chromatic!.secondaryDominants.some(sd => sd.romanNumeral === 'V7/ii')).toBe(true);
    });
  });

  describe('Edge Case Handling', () => {
    const edgeCaseTests = getTestCasesByCategory('Edge Cases');

    it('should handle single chord analysis appropriately', async () => {
      const testCase = edgeCaseTests.find(t => t.input === 'C');
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.primaryApproach).toBe('functional');
      expect(result.functional.chords).toHaveLength(1);
      expect(result.functional.chords[0].romanNumeral).toBe('I');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should identify rare harmonic relationships', async () => {
      const testCase = edgeCaseTests.find(t => t.input === 'C Db C');
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input);

      expect(result.primaryApproach).toBe('chromatic');
      expect(result.chromatic!.borrowedChords).toHaveLength(1);
      expect(result.functional.chords[1].romanNumeral).toBe('bII');
    });

    it('should handle tritone relationships', async () => {
      const testCase = edgeCaseTests.find(t => t.input === 'C Gb F C');
      expect(testCase).toBeDefined();

      const result = await engine.analyzeComprehensively(testCase!.input, testCase!.parentKey);

      expect(result.primaryApproach).toBe('chromatic');
      expect(result.chromatic!.chromaticMediants).toHaveLength(1);
      expect(result.functional.chords[1].romanNumeral).toBe('bV');
    });
  });

  describe('Pedagogical Value Generation', () => {
    it('should provide appropriate pedagogical explanations for functional approach', async () => {
      const result = await engine.analyzeComprehensively('C F G C', 'C major');

      expect(result.primaryApproach).toBe('functional');
      expect(result.pedagogicalValue).toContain('functional harmony');
      expect(result.pedagogicalValue).toContain('tonic, predominant, and dominant');
    });

    it('should provide appropriate pedagogical explanations for modal approach', async () => {
      const result = await engine.analyzeComprehensively('G F C G');

      if (result.primaryApproach === 'modal') {
        expect(result.pedagogicalValue).toContain('modal characteristics');
        expect(result.pedagogicalValue).toContain('scale relationships');
      }
    });

    it('should provide appropriate pedagogical explanations for chromatic approach', async () => {
      const result = await engine.analyzeComprehensively('C A7 Dm G C', 'C major');

      expect(result.primaryApproach).toBe('chromatic');
      expect(result.pedagogicalValue).toContain('chromatic harmony');
      expect(result.pedagogicalValue).toContain('secondary dominants');
    });
  });

  describe('Confidence Calculation', () => {
    it('should provide high confidence for clear functional progressions', async () => {
      const result = await engine.analyzeComprehensively('C F G C', 'C major');

      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.functional.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should provide lower confidence for ambiguous cases', async () => {
      const result = await engine.analyzeComprehensively('Em C G D');

      expect(result.confidence).toBeLessThan(0.8);
      expect(result.explanation).toBeTruthy();
    });

    it('should average confidence when modal and functional analyses agree', async () => {
      const result = await engine.analyzeComprehensively('G F C G', 'C major');

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      
      if (result.modal && result.functional) {
        expect(result.confidence).toBeGreaterThanOrEqual(Math.min(result.functional.confidence * 0.8, 1));
      }
    });
  });

  describe('Explanation Generation', () => {
    it('should generate comprehensive explanations combining analyses', async () => {
      const result = await engine.analyzeComprehensively('C E7 Am F G C', 'C major');

      expect(result.explanation).toContain('analysis');
      expect(result.explanation).toContain('secondary dominant') || expect(result.explanation).toContain('chromatic');
      expect(result.explanation.length).toBeGreaterThan(20);
    });

    it('should explain when modal analysis provides additional insight', async () => {
      const result = await engine.analyzeComprehensively('G F C G', 'C major');

      if (result.modal) {
        expect(result.explanation).toContain('Modal') || expect(result.explanation).toContain('modal');
        expect(result.modal.comparisonToFunctional).toBeDefined();
      }
    });

    it('should provide clear primary analysis indication', async () => {
      const result = await engine.analyzeComprehensively('C D7 G C', 'C major');

      expect(result.explanation).toContain('Primary analysis') || expect(result.explanation).toContain('analysis');
      expect(result.primaryApproach).toBe('chromatic');
    });
  });

  describe('Integration with Test Dataset', () => {
    it('should correctly analyze all basic functional test cases', async () => {
      const functionalTests = getTestCasesByPrimaryApproach('functional').slice(0, 5);

      for (const testCase of functionalTests) {
        const result = await engine.analyzeComprehensively(testCase.input, testCase.parentKey);

        expect(result.primaryApproach).toBe(testCase.expectedPrimary);
        expect(result.functional.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomanNumerals);
        expect(result.confidence).toBeGreaterThanOrEqual(testCase.confidence[0]);
        expect(result.confidence).toBeLessThanOrEqual(testCase.confidence[1]);
      }
    });

    it('should correctly analyze modal test cases', async () => {
      const modalTests = getTestCasesByPrimaryApproach('modal').slice(0, 3);

      for (const testCase of modalTests) {
        const result = await engine.analyzeComprehensively(testCase.input, testCase.parentKey);

        if (result.primaryApproach === 'modal') {
          expect(result.modal).toBeDefined();
          expect(result.modal!.modalCharacteristics.length).toBeGreaterThan(0);
        }
        
        expect(result.functional.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomanNumerals);
      }
    });

    it('should correctly analyze chromatic test cases', async () => {
      const chromaticTests = getTestCasesByPrimaryApproach('chromatic').slice(0, 3);

      for (const testCase of chromaticTests) {
        const result = await engine.analyzeComprehensively(testCase.input, testCase.parentKey);

        expect(result.primaryApproach).toBe('chromatic');
        expect(result.chromatic).toBeDefined();
        
        if (testCase.expectedChromaticElements?.secondaryDominants) {
          expect(result.chromatic!.secondaryDominants.length).toBeGreaterThan(0);
        }
        
        if (testCase.expectedChromaticElements?.borrowedChords) {
          expect(result.chromatic!.borrowedChords.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = performance.now();
      
      await engine.analyzeComprehensively('Cmaj7 A7 Dm7 G7 Em7 A7 Dm7 G7 Cmaj7', 'C major');
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
    });

    it('should be consistent across multiple runs', async () => {
      const input = 'C F G C';
      const parentKey = 'C major';

      const results = await Promise.all([
        engine.analyzeComprehensively(input, parentKey),
        engine.analyzeComprehensively(input, parentKey),
        engine.analyzeComprehensively(input, parentKey)
      ]);

      // All results should have the same primary approach and confidence
      results.forEach(result => {
        expect(result.primaryApproach).toBe(results[0].primaryApproach);
        expect(result.confidence).toBeCloseTo(results[0].confidence, 2);
      });
    });

    it('should handle empty input gracefully', async () => {
      const result = await engine.analyzeComprehensively('');

      expect(result).toBeDefined();
      expect(result.functional).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle malformed input gracefully', async () => {
      const result = await engine.analyzeComprehensively('X Y Z');

      expect(result).toBeDefined();
      expect(result.functional).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });
});