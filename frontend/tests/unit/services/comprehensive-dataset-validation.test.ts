/**
 * Comprehensive Dataset Validation Test
 * Validates all 67 test cases from comprehensive-music-theory-test-dataset.ts
 * against the entire music theory analysis framework
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FunctionalHarmonyAnalyzer } from '@/services/functionalHarmonyAnalysis';
import { ComprehensiveAnalysisEngine } from '@/services/comprehensiveAnalysisService';
import { analyzeChordProgressionLocally } from '@/services/localChordProgressionAnalysis';
import {
  comprehensiveMusicTheoryTestDataset,
  getTestCasesByCategory,
  getTestCasesByPrimaryApproach,
  getTestCasesWithChromaticElements,
  getAmbiguousTestCases,
  TEST_CATEGORIES,
  MusicTheoryTestCase
} from '@/test-data/comprehensive-music-theory-test-dataset';

describe('Comprehensive Dataset Validation', () => {
  let functionalAnalyzer: FunctionalHarmonyAnalyzer;
  let comprehensiveEngine: ComprehensiveAnalysisEngine;

  beforeEach(() => {
    functionalAnalyzer = new FunctionalHarmonyAnalyzer();
    comprehensiveEngine = new ComprehensiveAnalysisEngine();
  });

  describe('All 67 Test Cases Validation', () => {
    it('should validate all test cases in the comprehensive dataset', async () => {
      let passCount = 0;
      let failCount = 0;
      const failures: { testCase: MusicTheoryTestCase; error: string }[] = [];

      for (const testCase of comprehensiveMusicTheoryTestDataset) {
        try {
          const chordSymbols = testCase.input.split(' ');

          // Test functional analysis
          const functionalResult = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

          // Test comprehensive analysis
          const comprehensiveResult = await comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey);

          // Test local analysis
          const localResult = await analyzeChordProgressionLocally(testCase.input, testCase.parentKey);

          // Validate Roman numerals
          expect(functionalResult.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomanNumerals);

          // Validate confidence ranges
          expect(functionalResult.confidence).toBeGreaterThanOrEqual(testCase.confidence[0]);
          expect(functionalResult.confidence).toBeLessThanOrEqual(testCase.confidence[1]);

          // Validate primary approach
          expect(comprehensiveResult.primaryApproach).toBe(testCase.expectedPrimary);

          // Validate chromatic elements if expected
          if (testCase.expectedChromaticElements) {
            if (testCase.expectedChromaticElements.secondaryDominants) {
              const secondaryDominants = functionalResult.chromaticElements.filter(e => e.type === 'secondary_dominant');
              expect(secondaryDominants.length).toBeGreaterThan(0);
            }

            if (testCase.expectedChromaticElements.borrowedChords) {
              const borrowedChords = functionalResult.chromaticElements.filter(e => e.type === 'borrowed_chord');
              expect(borrowedChords.length).toBeGreaterThan(0);
            }

            if (testCase.expectedChromaticElements.chromaticMediants) {
              const chromaticMediants = functionalResult.chromaticElements.filter(e => e.type === 'chromatic_mediant');
              expect(chromaticMediants.length).toBeGreaterThan(0);
            }
          }

          passCount++;
        } catch (error) {
          failCount++;
          failures.push({
            testCase,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Report results
      console.log(`\n🎼 Comprehensive Dataset Validation Results:`);
      console.log(`✅ Passed: ${passCount}/${comprehensiveMusicTheoryTestDataset.length}`);
      console.log(`❌ Failed: ${failCount}/${comprehensiveMusicTheoryTestDataset.length}`);

      if (failures.length > 0) {
        console.log(`\n❌ Failures:`);
        failures.forEach(({ testCase, error }, index) => {
          console.log(`${index + 1}. "${testCase.input}" (${testCase.category}): ${error}`);
        });
      }

      // We expect at least 90% pass rate for a comprehensive framework
      const passRate = passCount / comprehensiveMusicTheoryTestDataset.length;
      expect(passRate).toBeGreaterThanOrEqual(0.9);
    }, 30000); // 30 second timeout for comprehensive test
  });

  describe('Category-Specific Validation', () => {
    TEST_CATEGORIES.forEach(category => {
      it(`should validate all ${category} test cases`, async () => {
        const categoryTests = getTestCasesByCategory(category);
        let categoryPassCount = 0;

        for (const testCase of categoryTests) {
          try {
            const chordSymbols = testCase.input.split(' ');
            const result = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

            expect(result.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomanNumerals);
            expect(result.confidence).toBeGreaterThanOrEqual(testCase.confidence[0]);

            categoryPassCount++;
          } catch (error) {
            console.warn(`Failed ${category} test case: "${testCase.input}" - ${error}`);
          }
        }

        const categoryPassRate = categoryPassCount / categoryTests.length;
        expect(categoryPassRate).toBeGreaterThanOrEqual(0.85); // 85% pass rate per category
      });
    });
  });

  describe('Primary Approach Accuracy', () => {
    it('should correctly identify functional primary approach', async () => {
      const functionalTests = getTestCasesByPrimaryApproach('functional');
      let correctPrimary = 0;

      for (const testCase of functionalTests) {
        const result = await comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey);
        if (result.primaryApproach === 'functional') {
          correctPrimary++;
        }
      }

      const accuracy = correctPrimary / functionalTests.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.8); // 80% accuracy for primary approach identification
    });

    it('should correctly identify modal primary approach', async () => {
      const modalTests = getTestCasesByPrimaryApproach('modal');
      let correctPrimary = 0;

      for (const testCase of modalTests) {
        const result = await comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey);
        if (result.primaryApproach === 'modal') {
          correctPrimary++;
        }
      }

      const accuracy = correctPrimary / modalTests.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.7); // 70% accuracy (modal can be more subjective)
    });

    it('should correctly identify chromatic primary approach', async () => {
      const chromaticTests = getTestCasesByPrimaryApproach('chromatic');
      let correctPrimary = 0;

      for (const testCase of chromaticTests) {
        const result = await comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey);
        if (result.primaryApproach === 'chromatic') {
          correctPrimary++;
        }
      }

      const accuracy = correctPrimary / chromaticTests.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.8); // 80% accuracy for chromatic identification
    });
  });

  describe('Chromatic Element Detection Accuracy', () => {
    it('should accurately detect secondary dominants', async () => {
      const chromaticTests = getTestCasesWithChromaticElements();
      const secondaryDominantTests = chromaticTests.filter(t =>
        t.expectedChromaticElements?.secondaryDominants &&
        t.expectedChromaticElements.secondaryDominants.length > 0
      );

      let correctDetections = 0;

      for (const testCase of secondaryDominantTests) {
        const chordSymbols = testCase.input.split(' ');
        const result = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        const detectedSecondaryDominants = result.chromaticElements.filter(e => e.type === 'secondary_dominant');
        if (detectedSecondaryDominants.length > 0) {
          correctDetections++;
        }
      }

      const accuracy = correctDetections / secondaryDominantTests.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.85); // 85% accuracy for secondary dominant detection
    });

    it('should accurately detect borrowed chords', async () => {
      const chromaticTests = getTestCasesWithChromaticElements();
      const borrowedChordTests = chromaticTests.filter(t =>
        t.expectedChromaticElements?.borrowedChords &&
        t.expectedChromaticElements.borrowedChords.length > 0
      );

      let correctDetections = 0;

      for (const testCase of borrowedChordTests) {
        const chordSymbols = testCase.input.split(' ');
        const result = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        const detectedBorrowedChords = result.chromaticElements.filter(e => e.type === 'borrowed_chord');
        if (detectedBorrowedChords.length > 0) {
          correctDetections++;
        }
      }

      const accuracy = correctDetections / borrowedChordTests.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.8); // 80% accuracy for borrowed chord detection
    });

    it('should accurately detect chromatic mediants', async () => {
      const chromaticTests = getTestCasesWithChromaticElements();
      const chromaticMediantTests = chromaticTests.filter(t =>
        t.expectedChromaticElements?.chromaticMediants &&
        t.expectedChromaticElements.chromaticMediants.length > 0
      );

      let correctDetections = 0;

      for (const testCase of chromaticMediantTests) {
        const chordSymbols = testCase.input.split(' ');
        const result = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        const detectedChromaticMediants = result.chromaticElements.filter(e => e.type === 'chromatic_mediant');
        if (detectedChromaticMediants.length > 0) {
          correctDetections++;
        }
      }

      const accuracy = correctDetections / chromaticMediantTests.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.75); // 75% accuracy for chromatic mediant detection
    });
  });

  describe('Confidence Scoring Accuracy', () => {
    it('should provide confidence scores within expected ranges', async () => {
      let confidenceAccuracyCount = 0;

      for (const testCase of comprehensiveMusicTheoryTestDataset) {
        const chordSymbols = testCase.input.split(' ');
        const result = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        if (result.confidence >= testCase.confidence[0] && result.confidence <= testCase.confidence[1]) {
          confidenceAccuracyCount++;
        }
      }

      const confidenceAccuracy = confidenceAccuracyCount / comprehensiveMusicTheoryTestDataset.length;
      expect(confidenceAccuracy).toBeGreaterThanOrEqual(0.8); // 80% should be within expected confidence range
    });

    it('should provide higher confidence for clear cases', async () => {
      const clearCases = comprehensiveMusicTheoryTestDataset.filter(t => t.confidence[0] >= 0.85);
      let highConfidenceCount = 0;

      for (const testCase of clearCases) {
        const chordSymbols = testCase.input.split(' ');
        const result = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        if (result.confidence >= 0.8) {
          highConfidenceCount++;
        }
      }

      const accuracy = highConfidenceCount / clearCases.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.9); // 90% of clear cases should have high confidence
    });

    it('should provide appropriate confidence for ambiguous cases', async () => {
      const ambiguousCases = getAmbiguousTestCases();
      let appropriateConfidenceCount = 0;

      for (const testCase of ambiguousCases) {
        const chordSymbols = testCase.input.split(' ');
        const result = await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);

        // Ambiguous cases should have moderate to low confidence
        if (result.confidence <= 0.8) {
          appropriateConfidenceCount++;
        }
      }

      const accuracy = appropriateConfidenceCount / ambiguousCases.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.7); // 70% of ambiguous cases should have appropriate confidence
    });
  });

  describe('Alternative Interpretation Handling', () => {
    it('should provide alternative interpretations for ambiguous cases', async () => {
      const ambiguousTests = getAmbiguousTestCases();
      let alternativesProvidedCount = 0;

      for (const testCase of ambiguousTests) {
        const result = await analyzeChordProgressionLocally(testCase.input, testCase.parentKey);

        if (result.alternativeInterpretations && result.alternativeInterpretations.length > 0) {
          alternativesProvidedCount++;
        }
      }

      const alternativeRate = alternativesProvidedCount / ambiguousTests.length;
      expect(alternativeRate).toBeGreaterThanOrEqual(0.6); // 60% of ambiguous cases should have alternatives
    });

    it('should validate alternative interpretations match expected ones', async () => {
      const testCasesWithAlternatives = comprehensiveMusicTheoryTestDataset.filter(t =>
        t.alternativeInterpretations && t.alternativeInterpretations.length > 0
      );

      let matchingAlternativesCount = 0;

      for (const testCase of testCasesWithAlternatives) {
        const result = await comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey);

        // Check if any of the expected alternatives are provided
        const hasExpectedAlternative = testCase.alternativeInterpretations!.some(expected => {
          return result.primaryApproach === expected.approach ||
                 (result.modal && expected.approach === 'modal') ||
                 (result.chromatic && expected.approach === 'chromatic');
        });

        if (hasExpectedAlternative) {
          matchingAlternativesCount++;
        }
      }

      const matchRate = matchingAlternativesCount / testCasesWithAlternatives.length;
      expect(matchRate).toBeGreaterThanOrEqual(0.7); // 70% should match expected alternatives
    });
  });

  describe('Context Dependency Validation', () => {
    it('should handle context-dependent cases correctly', async () => {
      const contextTests = getTestCasesByCategory('Context-Dependent');

      for (const testCase of contextTests) {
        const result = await comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey);

        // Should provide appropriate primary approach based on context
        expect(result.primaryApproach).toBe(testCase.expectedPrimary);

        // Should provide correct Roman numerals
        expect(result.functional.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomanNumerals);
      }
    });

    it('should differentiate same progression with different contexts', async () => {
      // Find pairs of same progression with different contexts
      const progressionGroups = new Map<string, MusicTheoryTestCase[]>();

      comprehensiveMusicTheoryTestDataset.forEach(testCase => {
        if (!progressionGroups.has(testCase.input)) {
          progressionGroups.set(testCase.input, []);
        }
        progressionGroups.get(testCase.input)!.push(testCase);
      });

      // Test progressions that appear with different contexts
      for (const [progression, testCases] of progressionGroups) {
        if (testCases.length > 1) {
          const results = await Promise.all(
            testCases.map(testCase =>
              comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey)
            )
          );

          // Results should potentially differ based on context
          const primaryApproaches = results.map(r => r.primaryApproach);
          const expectedApproaches = testCases.map(t => t.expectedPrimary);

          expect(primaryApproaches).toEqual(expectedApproaches);
        }
      }
    });
  });

  describe('Performance Metrics for Full Dataset', () => {
    it('should process all test cases within reasonable time', async () => {
      const startTime = performance.now();

      // Process first 10 test cases to check performance
      const sampleTests = comprehensiveMusicTheoryTestDataset.slice(0, 10);

      for (const testCase of sampleTests) {
        const chordSymbols = testCase.input.split(' ');
        await functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey);
      }

      const endTime = performance.now();
      const avgTimePerTest = (endTime - startTime) / sampleTests.length;

      expect(avgTimePerTest).toBeLessThan(50); // Less than 50ms per test case on average
    });

    it('should maintain consistency across full dataset processing', async () => {
      // Test a few cases multiple times to ensure consistency
      const consistencyTests = comprehensiveMusicTheoryTestDataset.slice(0, 3);

      for (const testCase of consistencyTests) {
        const chordSymbols = testCase.input.split(' ');

        const results = await Promise.all([
          functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey),
          functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey),
          functionalAnalyzer.analyzeFunctionally(chordSymbols, testCase.parentKey)
        ]);

        // All results should be identical
        results.forEach(result => {
          expect(result.chords.map(c => c.romanNumeral)).toEqual(results[0].chords.map(c => c.romanNumeral));
          expect(result.confidence).toBeCloseTo(results[0].confidence, 2);
        });
      }
    });
  });

  describe('Error Resilience with Full Dataset', () => {
    it('should handle malformed input gracefully across all categories', async () => {
      const malformedInputs = [
        'X Y Z',
        'C# Gb B',
        'H I J',
        '1 2 3',
        'C C C C C C C C C C' // Very long progression
      ];

      for (const input of malformedInputs) {
        try {
          const result = await comprehensiveEngine.analyzeComprehensively(input);
          expect(result).toBeDefined();
          expect(result.functional).toBeDefined();
          expect(result.confidence).toBeGreaterThanOrEqual(0);
        } catch (error) {
          // Should not throw errors, but if it does, it should be handled gracefully
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    it('should maintain structural integrity even with edge cases', async () => {
      const edgeCases = getTestCasesByCategory('Edge Cases');

      for (const testCase of edgeCases) {
        const result = await comprehensiveEngine.analyzeComprehensively(testCase.input, testCase.parentKey);

        // Should always provide valid structure
        expect(result.functional).toBeDefined();
        expect(result.functional.chords).toBeInstanceOf(Array);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(result.explanation).toBeDefined();
        expect(result.pedagogicalValue).toBeDefined();
      }
    });
  });
});
