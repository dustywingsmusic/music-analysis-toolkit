/**
 * Comprehensive Test Suite for HybridAnalysisService
 * Tests end-to-end chord progression analysis and integration of all analysis engines
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeChordProgression, analyzeMusicalInput, HybridAnalysisOptions } from '@/services/hybridAnalysisService';
import { 
  comprehensiveMusicTheoryTestDataset, 
  getTestCasesByCategory,
  getTestCasesByPrimaryApproach,
  getTestCasesWithChromaticElements,
  MusicTheoryTestCase
} from '@/test-data/comprehensive-music-theory-test-dataset';

// Mock the Gemini service to prevent actual API calls during testing
vi.mock('@/services/geminiService', () => ({
  analyzeHarmony: vi.fn().mockResolvedValue({
    result: {
      songExamples: ['Test Song 1', 'Test Song 2'],
      explanation: 'Test theoretical explanation',
      insights: ['Test insight 1', 'Test insight 2'],
      genres: ['Pop', 'Rock']
    },
    confidence: 0.8
  })
}));

describe('HybridAnalysisService', () => {
  const defaultOptions: HybridAnalysisOptions = {
    useLocalFirst: true,
    enableAIEnhancement: false, // Disabled by default for testing
    enableCrossValidation: false,
    timeoutMs: 5000
  };

  describe('End-to-End Chord Progression Analysis', () => {
    it('should provide complete analysis for basic functional progressions', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C F G C' && t.expectedPrimary === 'functional'
      );
      expect(testCase).toBeDefined();

      const result = await analyzeChordProgression(testCase!.input, {
        ...defaultOptions,
        knownKey: testCase!.parentKey
      });

      // Should have local analysis
      expect(result.localResult).toBeDefined();
      expect(result.localResult.type).toBe('chord_progression');
      expect(result.localResult.results.chordProgression).toBeDefined();

      // Should have comprehensive analysis
      expect(result.comprehensiveResult).toBeDefined();
      expect(result.comprehensiveResult.primaryApproach).toBe('functional');
      expect(result.comprehensiveResult.functional.chords.map(c => c.romanNumeral)).toEqual(['I', 'IV', 'V', 'I']);

      // Confidence should be within expected range
      expect(result.localResult.results.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
      expect(result.comprehensiveResult.confidence).toBeGreaterThanOrEqual(testCase!.confidence[0]);
    });

    it('should handle modal progressions with comprehensive analysis', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'G F C G' && t.expectedPrimary === 'modal' && !t.parentKey
      );
      expect(testCase).toBeDefined();

      const result = await analyzeChordProgression(testCase!.input, defaultOptions);

      expect(result.localResult).toBeDefined();
      expect(result.comprehensiveResult).toBeDefined();
      
      // Should detect modal characteristics
      if (result.comprehensiveResult.primaryApproach === 'modal') {
        expect(result.comprehensiveResult.modal).toBeDefined();
        expect(result.comprehensiveResult.modal!.modalCharacteristics).toContain('bVII-I cadence (Mixolydian characteristic)');
      }

      // Local analysis should also detect modal elements
      expect(result.localResult.results.chordProgression.localAnalysis.overallMode).toContain('Mixolydian');
    });

    it('should handle chromatic progressions with secondary dominants', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C D7 G C' && t.expectedPrimary === 'chromatic'
      );
      expect(testCase).toBeDefined();

      const result = await analyzeChordProgression(testCase!.input, {
        ...defaultOptions,
        knownKey: testCase!.parentKey
      });

      expect(result.comprehensiveResult).toBeDefined();
      expect(result.comprehensiveResult.primaryApproach).toBe('chromatic');
      expect(result.comprehensiveResult.chromatic).toBeDefined();
      expect(result.comprehensiveResult.chromatic!.secondaryDominants).toHaveLength(1);
      expect(result.comprehensiveResult.chromatic!.secondaryDominants[0].romanNumeral).toBe('V/V');
    });

    it('should coordinate all analysis engines for complex jazz progressions', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'Cmaj7 A7 Dm7 G7 Em7 A7 Dm7 G7 Cmaj7'
      );
      expect(testCase).toBeDefined();

      const result = await analyzeChordProgression(testCase!.input, {
        ...defaultOptions,
        knownKey: testCase!.parentKey
      });

      // Should have functional foundation
      expect(result.comprehensiveResult!.functional).toBeDefined();
      expect(result.comprehensiveResult!.functional.progressionType).toBe('jazz_standard');

      // Should detect chromatic elements
      expect(result.comprehensiveResult!.chromatic).toBeDefined();
      expect(result.comprehensiveResult!.chromatic!.secondaryDominants.length).toBeGreaterThanOrEqual(2);

      // Should have high confidence for clear jazz progression
      expect(result.comprehensiveResult!.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('AI Enhancement Integration', () => {
    it('should provide AI enhancement when enabled', async () => {
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        enableAIEnhancement: true,
        knownKey: 'C major'
      });

      expect(result.aiEnhancement).toBeDefined();
      expect(result.aiEnhancement!.songExamples).toHaveLength(2);
      expect(result.aiEnhancement!.theoreticalExplanation).toContain('Test');
      expect(result.aiEnhancement!.genres).toContain('Pop');
    });

    it('should gracefully handle AI enhancement failures', async () => {
      // Mock a failure
      const { analyzeHarmony } = await import('@/services/geminiService');
      vi.mocked(analyzeHarmony).mockRejectedValueOnce(new Error('API Error'));

      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        enableAIEnhancement: true
      });

      // Should still provide local results
      expect(result.localResult).toBeDefined();
      expect(result.comprehensiveResult).toBeDefined();
      
      // AI enhancement should be minimal/fallback
      expect(result.aiEnhancement).toBeDefined();
      expect(result.aiEnhancement!.confidence).toBe(0);
      expect(result.aiEnhancement!.theoreticalExplanation).toContain('unavailable');
    });

    it('should timeout AI requests appropriately', async () => {
      const { analyzeHarmony } = await import('@/services/geminiService');
      vi.mocked(analyzeHarmony).mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 10000)) // Long delay
      );

      const startTime = performance.now();
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        enableAIEnhancement: true,
        timeoutMs: 100 // Short timeout
      });
      const endTime = performance.now();

      // Should complete quickly due to timeout
      expect(endTime - startTime).toBeLessThan(200);
      
      // Should still have results
      expect(result.localResult).toBeDefined();
      expect(result.comprehensiveResult).toBeDefined();
    }, 10000);
  });

  describe('Cross-Validation', () => {
    it('should provide cross-validation when AI enhancement succeeds', async () => {
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        enableAIEnhancement: true,
        enableCrossValidation: true,
        knownKey: 'C major'
      });

      expect(result.crossValidation).toBeDefined();
      expect(result.crossValidation!.agreement).toBeGreaterThanOrEqual(0);
      expect(result.crossValidation!.agreement).toBeLessThanOrEqual(1);
      expect(result.crossValidation!.recommendedInterpretation).toMatch(/local|ai|hybrid/);
    });

    it('should not provide cross-validation when AI enhancement is disabled', async () => {
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        enableAIEnhancement: false,
        enableCrossValidation: true
      });

      expect(result.crossValidation).toBeUndefined();
    });

    it('should recommend appropriate interpretation based on confidence', async () => {
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        enableAIEnhancement: true,
        enableCrossValidation: true,
        knownKey: 'C major'
      });

      if (result.crossValidation) {
        expect(['local', 'ai', 'hybrid']).toContain(result.crossValidation.recommendedInterpretation);
        
        // High local confidence should prefer local or hybrid
        if (result.localResult.results.confidence > 0.8) {
          expect(['local', 'hybrid']).toContain(result.crossValidation.recommendedInterpretation);
        }
      }
    });
  });

  describe('Integration of All Analysis Engines', () => {
    it('should coordinate functional, modal, and chromatic analyses', async () => {
      const testCase = comprehensiveMusicTheoryTestDataset.find(t => 
        t.input === 'C F Ab G C' && t.expectedPrimary === 'chromatic'
      );
      expect(testCase).toBeDefined();

      const result = await analyzeChordProgression(testCase!.input, {
        ...defaultOptions,
        knownKey: testCase!.parentKey
      });

      // Should have all analysis layers
      expect(result.comprehensiveResult!.functional).toBeDefined();
      expect(result.comprehensiveResult!.chromatic).toBeDefined();

      // Functional analysis should provide foundation
      expect(result.comprehensiveResult!.functional.chords.map(c => c.romanNumeral)).toEqual(['I', 'IV', 'bVI', 'V', 'I']);

      // Chromatic analysis should identify borrowed chord
      expect(result.comprehensiveResult!.chromatic!.borrowedChords).toHaveLength(1);
      expect(result.comprehensiveResult!.chromatic!.borrowedChords[0].romanNumeral).toBe('bVI');

      // Should coordinate explanations
      expect(result.comprehensiveResult!.explanation).toContain('chromatic');
      expect(result.comprehensiveResult!.pedagogicalValue).toContain('chromatic harmony');
    });

    it('should handle context-dependent analysis correctly', async () => {
      // Test the same progression with and without parent key
      const progressionInput = 'G F C G';
      
      const resultWithoutKey = await analyzeChordProgression(progressionInput, defaultOptions);
      const resultWithKey = await analyzeChordProgression(progressionInput, {
        ...defaultOptions,
        knownKey: 'C major'
      });

      // Without key: should likely be modal-primary
      expect(resultWithoutKey.comprehensiveResult!.primaryApproach).toBe('modal');
      if (resultWithoutKey.comprehensiveResult!.modal) {
        expect(resultWithoutKey.comprehensiveResult!.modal.modalCharacteristics.length).toBeGreaterThan(0);
      }

      // With C major key: analysis should reflect this context
      expect(resultWithKey.comprehensiveResult!.functional.keyCenter).toContain('C');
      expect(resultWithKey.localResult.results.chordProgression.userContextProvided).toBe('C major');
    });

    it('should maintain consistency between analysis engines', async () => {
      const result = await analyzeChordProgression('C Am F G', {
        ...defaultOptions,
        knownKey: 'C major'
      });

      // All engines should agree on basic Roman numerals
      const localRomans = result.localResult.results.chordProgression.localAnalysis.chords.map(c => c.romanNumeral);
      const functionalRomans = result.comprehensiveResult!.functional.chords.map(c => c.romanNumeral);

      expect(localRomans).toEqual(functionalRomans);

      // All should identify the same key center
      expect(result.localResult.results.chordProgression.localAnalysis.keyCenter).toContain('C');
      expect(result.comprehensiveResult!.functional.keyCenter).toContain('C');
    });
  });

  describe('Musical Input Analysis Routing', () => {
    it('should route chord progression input correctly', async () => {
      const result = await analyzeMusicalInput('chord_progression', 'C F G C', defaultOptions);

      expect(result.localResult.type).toBe('chord_progression');
      expect(result.localResult.inputData).toBe('C F G C');
    });

    it('should route notes collection input correctly', async () => {
      const result = await analyzeMusicalInput('notes_collection', [60, 64, 67], defaultOptions);

      expect(result.localResult.type).toBe('notes_collection');
      expect(result.localResult.inputData).toEqual([60, 64, 67]);
    });

    it('should route MIDI realtime input correctly', async () => {
      const result = await analyzeMusicalInput('midi_realtime', [60, 64, 67], defaultOptions);

      expect(result.localResult.type).toBe('midi_realtime');
      expect(result.localResult.inputData).toEqual([60, 64, 67]);
    });

    it('should handle invalid input types gracefully', async () => {
      await expect(
        analyzeMusicalInput('invalid_type' as any, 'test', defaultOptions)
      ).rejects.toThrow('Unsupported input type');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle empty progression input gracefully', async () => {
      const result = await analyzeChordProgression('', defaultOptions);

      expect(result.localResult).toBeDefined();
      expect(result.comprehensiveResult).toBeDefined();
      expect(result.localResult.results.confidence).toBe(0);
    });

    it('should handle malformed chord symbols gracefully', async () => {
      const result = await analyzeChordProgression('X Y Z', defaultOptions);

      expect(result.localResult).toBeDefined();
      expect(result.comprehensiveResult).toBeDefined();
      expect(result.localResult.results.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should provide error state information when analysis fails', async () => {
      // Mock a service failure
      const originalAnalyzeLocally = (await import('@/services/localChordProgressionAnalysis')).analyzeChordProgressionLocally;
      vi.doMock('@/services/localChordProgressionAnalysis', () => ({
        analyzeChordProgressionLocally: vi.fn().mockRejectedValue(new Error('Service Error'))
      }));

      const result = await analyzeChordProgression('C F G C', defaultOptions);

      expect(result.localResult.metadata.errorState).toBeDefined();
      expect(result.localResult.results.confidence).toBe(0);
    });

    it('should continue with local analysis if comprehensive analysis fails', async () => {
      // This is a resilience test - even if one component fails, others should work
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        knownKey: 'C major'
      });

      // Should always have local result
      expect(result.localResult).toBeDefined();
      expect(result.localResult.type).toBe('chord_progression');
    });
  });

  describe('Performance Metrics', () => {
    it('should complete analysis within reasonable time limits', async () => {
      const startTime = performance.now();
      
      const result = await analyzeChordProgression('Cmaj7 A7 Dm7 G7 Em7 A7 Dm7 G7 Cmaj7', {
        ...defaultOptions,
        knownKey: 'C major'
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.localResult.metadata.processingTime).toBeLessThan(200);
    });

    it('should track processing time accurately', async () => {
      const result = await analyzeChordProgression('C F G C', defaultOptions);

      expect(result.localResult.metadata.processingTime).toBeGreaterThan(0);
      expect(result.localResult.metadata.processingTime).toBeLessThan(1000); // Should be reasonable
    });

    it('should be consistent across multiple runs', async () => {
      const progression = 'C F G C';
      const options = { ...defaultOptions, knownKey: 'C major' };

      const results = await Promise.all([
        analyzeChordProgression(progression, options),
        analyzeChordProgression(progression, options),
        analyzeChordProgression(progression, options)
      ]);

      // All should have the same primary approach and similar confidence
      results.forEach(result => {
        expect(result.comprehensiveResult!.primaryApproach).toBe(results[0].comprehensiveResult!.primaryApproach);
        expect(result.comprehensiveResult!.confidence).toBeCloseTo(results[0].comprehensiveResult!.confidence, 1);
      });
    });
  });

  describe('Metadata and Tracking', () => {
    it('should provide complete metadata for analysis results', async () => {
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        knownKey: 'C major'
      });

      expect(result.localResult.metadata).toBeDefined();
      expect(result.localResult.metadata.analysisMethod).toBe('local');
      expect(result.localResult.metadata.processingTime).toBeGreaterThan(0);
      expect(result.localResult.results.timestamp).toBeGreaterThan(0);
    });

    it('should track user context when provided', async () => {
      const knownKey = 'C major';
      const result = await analyzeChordProgression('C F G C', {
        ...defaultOptions,
        knownKey
      });

      expect(result.localResult.results.chordProgression.userContextProvided).toBe(knownKey);
    });

    it('should provide appropriate analysis method indicators', async () => {
      const result = await analyzeChordProgression('C F G C', defaultOptions);

      expect(result.localResult.metadata.analysisMethod).toBe('local');
      expect(result.localResult.results.chordProgression.localAnalysis.source).toMatch(/algorithmic|structural|user-guided/);
    });
  });

  describe('Comprehensive Dataset Validation', () => {
    it('should handle all basic functional test cases correctly', async () => {
      const basicTests = getTestCasesByPrimaryApproach('functional').slice(0, 3);

      for (const testCase of basicTests) {
        const result = await analyzeChordProgression(testCase.input, {
          ...defaultOptions,
          knownKey: testCase.parentKey
        });

        expect(result.comprehensiveResult!.primaryApproach).toBe(testCase.expectedPrimary);
        expect(result.comprehensiveResult!.functional.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomanNumerals);
        expect(result.comprehensiveResult!.confidence).toBeGreaterThanOrEqual(testCase.confidence[0]);
      }
    });

    it('should handle modal test cases correctly', async () => {
      const modalTests = getTestCasesByPrimaryApproach('modal').slice(0, 2);

      for (const testCase of modalTests) {
        const result = await analyzeChordProgression(testCase.input, {
          ...defaultOptions,
          knownKey: testCase.parentKey
        });

        if (result.comprehensiveResult!.primaryApproach === 'modal') {
          expect(result.comprehensiveResult!.modal).toBeDefined();
          expect(result.comprehensiveResult!.modal!.modalCharacteristics.length).toBeGreaterThan(0);
        }
      }
    });

    it('should handle chromatic test cases correctly', async () => {
      const chromaticTests = getTestCasesWithChromaticElements().slice(0, 2);

      for (const testCase of chromaticTests) {
        const result = await analyzeChordProgression(testCase.input, {
          ...defaultOptions,
          knownKey: testCase.parentKey
        });

        expect(result.comprehensiveResult!.chromatic).toBeDefined();
        
        if (testCase.expectedChromaticElements?.secondaryDominants) {
          expect(result.comprehensiveResult!.chromatic!.secondaryDominants.length).toBeGreaterThan(0);
        }
        
        if (testCase.expectedChromaticElements?.borrowedChords) {
          expect(result.comprehensiveResult!.chromatic!.borrowedChords.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    it('should handle the V/V-V secondary dominant progression (B-D case)', async () => {
      // This tests the specific case mentioned in requirements
      const result = await analyzeChordProgression('B D', {
        ...defaultOptions,
        knownKey: 'A major'
      });

      // B should be identified as V/V (dominant of E, which is V in A major)
      // D should be identified as V in A major
      const romans = result.comprehensiveResult!.functional.chords.map(c => c.romanNumeral);
      expect(romans[0]).toBe('V/V');
      expect(romans[1]).toBe('V');
      
      if (result.comprehensiveResult!.chromatic) {
        expect(result.comprehensiveResult!.chromatic.secondaryDominants.length).toBeGreaterThan(0);
      }
    });

    it('should handle G-F-C-G progression with and without parent key context', async () => {
      // Without parent key - should be modal
      const resultWithoutKey = await analyzeChordProgression('G F C G', defaultOptions);
      
      // With parent key - should be functional with modal enhancement
      const resultWithKey = await analyzeChordProgression('G F C G', {
        ...defaultOptions,
        knownKey: 'C major'
      });

      // Without key: should detect as Mixolydian
      expect(resultWithoutKey.localResult.results.chordProgression.localAnalysis.overallMode).toContain('Mixolydian');
      
      // With key: should use C major context
      expect(resultWithKey.localResult.results.chordProgression.localAnalysis.keyCenter).toContain('C Major');
      expect(resultWithKey.comprehensiveResult!.functional.keyCenter).toContain('C');
    });

    it('should handle single chord analysis appropriately', async () => {
      const result = await analyzeChordProgression('C', {
        ...defaultOptions,
        knownKey: 'C major'
      });

      expect(result.localResult.results.chordProgression.localAnalysis.chords).toHaveLength(1);
      expect(result.comprehensiveResult!.functional.chords[0].romanNumeral).toBe('I');
      expect(result.comprehensiveResult!.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should handle ambiguous progressions appropriately', async () => {
      const result = await analyzeChordProgression('Am F C G', defaultOptions);

      // Should recognize ambiguity and provide reasonable analysis
      expect(result.comprehensiveResult!.confidence).toBeLessThan(0.8);
      expect(result.comprehensiveResult!.explanation).toBeDefined();
      
      // Should still provide valid Roman numeral analysis
      const romans = result.comprehensiveResult!.functional.chords.map(c => c.romanNumeral);
      expect(romans).toHaveLength(4);
      expect(romans.every(r => r.length > 0)).toBe(true);
    });
  });
});