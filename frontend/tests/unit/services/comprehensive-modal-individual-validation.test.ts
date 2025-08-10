/**
 * Comprehensive Modal Analysis - Individual Test Case Validation
 *
 * This test suite validates each of the 728 individual modal test cases
 * as separate test instances, ensuring proper detection and reporting
 * of failures at the individual case level.
 *
 * CRITICAL TESTING APPROACH:
 * - Each test case runs as an individual `it()` test
 * - Strict assertions for modal detection accuracy
 * - Minimum success rate requirements enforced per category
 * - Detailed failure reporting for debugging
 * - All 7 categories validated: modal_characteristic, modal_seventh_variant,
 *   modal_vamp, modal_foil, functional_clear, ambiguous, edge_case
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EnhancedModalAnalyzer } from '@/services/enhancedModalAnalyzer';
import { FunctionalHarmonyAnalyzer } from '@/services/functionalHarmonyAnalysis';
import { ComprehensiveAnalysisEngine } from '@/services/comprehensiveAnalysisService';
import { analyzeChordProgressionLocally } from '@/services/localChordProgressionAnalysis';
import fs from 'fs';
import path from 'path';

// Test execution logging
interface TestExecutionLog {
  testId: string;
  description: string;
  category: string;
  chords: string[];
  parentKey: string;
  expected: { modal: boolean; mode?: string };
  actual: {
    enhanced: { modal: boolean; mode?: string; confidence: number };
    local: { modal: boolean; mode?: string; confidence: number };
  };
  result: 'PASS' | 'FAIL';
  errors: string[];
  timestamp: string;
}

let testExecutionLogs: TestExecutionLog[] = [];
let categoryStats: Record<string, { total: number; passed: number; failed: number }> = {};

interface ModalTestCase {
  id: string;
  chords: string[];
  parentKey: string;
  expectedModal: boolean;
  expectedMode?: string; // Optional for non-modal cases
  description: string;
  category: string;
  theoreticalBasis: string;
}

interface TestDataFile {
  metadata: {
    generated: string;
    totalCases: number;
    categories: Record<string, number>;
  };
  testCases: ModalTestCase[];
}

const ENABLE_V1_ASSERTIONS = process.env.V1_ASSERTIONS === '1';

// Load test data at module level
const testDataPath = path.resolve(__dirname, '../../../comprehensive-modal-test-cases.json');
if (!fs.existsSync(testDataPath)) {
  throw new Error(`Test data file not found at: ${testDataPath}`);
}

const rawData = fs.readFileSync(testDataPath, 'utf-8');
const testData: TestDataFile = JSON.parse(rawData);

describe('Comprehensive Modal Analysis - Individual Case Validation', () => {
  let modalAnalyzer: EnhancedModalAnalyzer;
  let functionalAnalyzer: FunctionalHarmonyAnalyzer;
  let comprehensiveEngine: ComprehensiveAnalysisEngine;

  // Track results for aggregate reporting
  const categoryResults = new Map<string, { passed: number; failed: number; failures: Array<{case: ModalTestCase; error: string}> }>();
  const expectedCategories = [
    'modal_characteristic',
    'modal_seventh_variant',
    'modal_vamp',
    'modal_foil',
    'functional_clear',
    'ambiguous',
    'edge_case'
  ];

  beforeAll(() => {
    // Initialize analyzers
    modalAnalyzer = new EnhancedModalAnalyzer();
    functionalAnalyzer = new FunctionalHarmonyAnalyzer();
    comprehensiveEngine = new ComprehensiveAnalysisEngine();

    // Initialize category tracking
    expectedCategories.forEach(category => {
      categoryResults.set(category, { passed: 0, failed: 0, failures: [] });
      categoryStats[category] = { total: 0, passed: 0, failed: 0 };
    });

    console.log(`\n🎼 Loaded ${testData.testCases.length} individual modal test cases`);
    console.log(`📊 Categories: ${Object.keys(testData.metadata.categories).join(', ')}`);
  });

  afterAll(() => {
    // Generate comprehensive results report
    console.log('\n' + '='.repeat(80));
    console.log('🎼 COMPREHENSIVE MODAL ANALYSIS VALIDATION RESULTS');
    console.log('='.repeat(80));

    let totalPassed = 0;
    let totalFailed = 0;

    expectedCategories.forEach(category => {
      const results = categoryResults.get(category)!;
      const total = results.passed + results.failed;
      const successRate = total > 0 ? (results.passed / total) * 100 : 0;

      totalPassed += results.passed;
      totalFailed += results.failed;

      console.log(`\n📂 ${category.toUpperCase().replace(/_/g, ' ')}`);
      console.log(`   ✅ Passed: ${results.passed}/${total} (${successRate.toFixed(1)}%)`);
      console.log(`   ❌ Failed: ${results.failed}/${total}`);

      if (results.failures.length > 0) {
        console.log(`   🔍 First 3 Failures:`);
        results.failures.slice(0, 3).forEach((failure, index) => {
          console.log(`      ${index + 1}. ${failure.case.id}: ${failure.case.description}`);
          console.log(`         Error: ${failure.error}`);
        });
        if (results.failures.length > 3) {
          console.log(`      ... and ${results.failures.length - 3} more`);
        }
      }
    });

    const overallTotal = totalPassed + totalFailed;
    const overallSuccessRate = overallTotal > 0 ? (totalPassed / overallTotal) * 100 : 0;

    console.log(`\n🎯 OVERALL RESULTS`);
    console.log(`   ✅ Total Passed: ${totalPassed}/${overallTotal} (${overallSuccessRate.toFixed(1)}%)`);
    console.log(`   ❌ Total Failed: ${totalFailed}/${overallTotal}`);
    console.log('='.repeat(80));

    // Write detailed test execution log to file
    const detailedLog = {
      summary: {
        executedAt: new Date().toISOString(),
        totalTests: overallTotal,
        totalPassed: totalPassed,
        totalFailed: totalFailed,
        overallSuccessRate: `${overallSuccessRate.toFixed(2)}%`
      },
      categoryBreakdown: {},
      allTestExecutions: testExecutionLogs,
      failureAnalysis: {
        totalFailures: totalFailed,
        commonErrorPatterns: {},
        sampleFailures: []
      }
    };

    // Build category breakdown
    expectedCategories.forEach(category => {
      const results = categoryResults.get(category)!;
      const total = results.passed + results.failed;
      const successRate = total > 0 ? (results.passed / total) * 100 : 0;
      (detailedLog.categoryBreakdown as any)[category] = {
        total,
        passed: results.passed,
        failed: results.failed,
        successRate: `${successRate.toFixed(2)}%`,
        failures: results.failures.map(f => ({
          testId: f.case.id,
          description: f.case.description,
          chords: f.case.chords,
          parentKey: f.case.parentKey,
          expectedModal: f.case.expectedModal,
          expectedMode: f.case.expectedMode,
          error: f.error
        }))
      };
    });

    // Build failure analysis
    const allFailures = Array.from(categoryResults.values()).flatMap(r => r.failures);
    (detailedLog.failureAnalysis as any).sampleFailures = allFailures.slice(0, 50).map(f => ({
      testId: f.case.id,
      category: f.case.category,
      description: f.case.description,
      chords: f.case.chords.join(' '),
      parentKey: f.case.parentKey,
      expected: { modal: f.case.expectedModal, mode: f.case.expectedMode },
      error: f.error
    }));

    // Write to file
    const logPath = path.join(process.cwd(), 'modal-test-detailed-results.json');
    fs.writeFileSync(logPath, JSON.stringify(detailedLog, null, 2));
    console.log(`\n📝 Detailed test results written to: ${logPath}`);
    console.log(`   Use this file to analyze specific failure patterns and prioritize fixes.`);

    // Assert minimum success rates
    expect(overallSuccessRate).toBeGreaterThanOrEqual(90);
  });

  // Generate individual test cases for each test data entry
  describe('Individual Test Case Validation', () => {
    testData.testCases.forEach((testCase: ModalTestCase) => {
      it(`${testCase.id}: ${testCase.description} [${testCase.category}]`, async () => {
        const categoryStats = categoryResults.get(testCase.category);
        if (!categoryStats) {
          throw new Error(`Unknown category: ${testCase.category}`);
        }

        // Initialize test execution log
        let testLog: TestExecutionLog = {
          testId: testCase.id,
          description: testCase.description,
          category: testCase.category,
          chords: testCase.chords,
          parentKey: testCase.parentKey,
          expected: { modal: testCase.expectedModal, mode: testCase.expectedMode },
          actual: {
            enhanced: { modal: false, mode: undefined, confidence: 0 },
            local: { modal: false, mode: undefined, confidence: 0 }
          },
          result: 'FAIL',
          errors: [],
          timestamp: new Date().toISOString()
        };

        try {
          // Test with Enhanced Modal Analyzer
          const modalResult = modalAnalyzer.analyzeModalCharacteristics(
            testCase.chords,
            testCase.parentKey
          );

          // Test with Local Chord Progression Analysis
          const chordsString = testCase.chords.join(' ');
          const localResult = await analyzeChordProgressionLocally(
            chordsString,
            testCase.parentKey
          );

          // Functional and comprehensive analysis (Phase V1)
          const functionalResult = await functionalAnalyzer.analyzeFunctionally(testCase.chords, testCase.parentKey);
          const comprehensiveResult = await comprehensiveEngine.analyzeComprehensively(testCase.chords, testCase.parentKey);

          // Update test execution log with actual results
          testLog.actual = {
            enhanced: {
              modal: modalResult !== null,
              mode: modalResult?.modeName,
              confidence: modalResult?.confidence || 0
            },
            local: {
              modal: localResult.localAnalysis?.isModal || false,
              mode: localResult.localAnalysis?.overallMode,
              confidence: localResult.localAnalysis?.confidence || 0
            }
          };
          testLog.result = 'PASS';

          // STRICT ASSERTIONS FOR MODAL DETECTION

          // 1. Modal Detection Accuracy
          if (testCase.expectedModal) {
            // Should detect modal characteristics
            expect(modalResult,
              `Expected modal analysis to detect modal characteristics for ${testCase.id}: ${testCase.description}`
            ).not.toBeNull();

            if (testCase.expectedMode) {
              expect(modalResult!.modeName,
                `Expected mode name to match "${testCase.expectedMode}" for ${testCase.id}`
              ).toBe(testCase.expectedMode);
            }

            // Local analysis should also indicate modal characteristics
            expect(localResult.localAnalysis?.isModal,
              `Local analysis should detect modal characteristics for ${testCase.id}`
            ).toBe(true);

            // Mode detection should match
            if (testCase.expectedMode) {
              const expectedModeFromLocal = localResult.localAnalysis?.overallMode;
              if (expectedModeFromLocal) {
                expect(expectedModeFromLocal,
                  `Local analysis mode should match expected "${testCase.expectedMode}" for ${testCase.id}`
                ).toContain(testCase.expectedMode.split(' ')[1]); // Compare mode name without root
              }
            }

          } else {
            // Should NOT detect modal characteristics (functional_clear cases)
            if (modalResult) {
              expect(modalResult.confidence,
                `Modal confidence should be low for non-modal case ${testCase.id}`
              ).toBeLessThan(0.7);
            }

            expect(localResult.localAnalysis?.isModal,
              `Local analysis should NOT detect modal characteristics for functional case ${testCase.id}`
            ).toBe(false);
          }

          // 2. Confidence Requirements
          if (modalResult && testCase.expectedModal) {
            // Modal cases should have reasonable confidence
            if (['modal_characteristic', 'modal_seventh_variant', 'modal_vamp'].includes(testCase.category)) {
              expect(modalResult.confidence,
                `Clear modal cases should have confidence >= 0.7 for ${testCase.id}`
              ).toBeGreaterThanOrEqual(0.7);
            }

            // Foil cases should have lower confidence
            if (testCase.category === 'modal_foil') {
              expect(modalResult.confidence,
                `Modal foil cases should have moderate confidence for ${testCase.id}`
              ).toBeLessThanOrEqual(0.8);
            }
          }

          // 3. Category-Specific Validation
          switch (testCase.category) {
            case 'modal_characteristic':
              // Core modal patterns should be detected with high confidence
              expect(modalResult,
                `Modal characteristic cases must be detected for ${testCase.id}`
              ).not.toBeNull();
              expect(modalResult!.confidence,
                `Modal characteristic confidence should be high for ${testCase.id}`
              ).toBeGreaterThanOrEqual(0.75);
              if (ENABLE_V1_ASSERTIONS) {
                // Comprehensive should prefer modal when confidence is high
                expect(comprehensiveResult.primaryApproach,
                  `Comprehensive should choose 'modal' for clear modal case ${testCase.id}`
                ).toBe('modal');
              }
              break;

            case 'modal_seventh_variant':
              // Seventh chord variants should still detect modal characteristics
              expect(modalResult,
                `Modal seventh variants must be detected for ${testCase.id}`
              ).not.toBeNull();
              if (ENABLE_V1_ASSERTIONS) {
                expect(comprehensiveResult.primaryApproach).toBe('modal');
              }
              break;

            case 'modal_vamp':
              // Vamp patterns should be detected
              expect(modalResult,
                `Modal vamp patterns must be detected for ${testCase.id}`
              ).not.toBeNull();
              if (ENABLE_V1_ASSERTIONS) {
                expect(comprehensiveResult.primaryApproach).toBe('modal');
              }
              break;

            case 'modal_foil':
              // Foil cases may or may not be detected, but if detected should have moderate confidence
              if (modalResult) {
                expect(modalResult.confidence,
                  `Modal foil detection should have moderate confidence for ${testCase.id}`
                ).toBeLessThanOrEqual(0.85);
              }
              if (ENABLE_V1_ASSERTIONS) {
                // Functional reading should dominate
                expect(comprehensiveResult.primaryApproach).toBe('functional');
                expect(functionalResult.confidence).toBeGreaterThanOrEqual(0.75);
              }
              break;

            case 'functional_clear':
              // Clear functional cases should NOT be detected as modal
              expect(localResult.localAnalysis?.isModal,
                `Functional clear cases should not be modal for ${testCase.id}`
              ).toBe(false);
              if (ENABLE_V1_ASSERTIONS) {
                // Functional should be primary with cadential evidence
                expect(comprehensiveResult.primaryApproach).toBe('functional');
                expect((functionalResult.cadences?.length ?? 0)).toBeGreaterThan(0);
                expect(functionalResult.confidence).toBeGreaterThanOrEqual(0.8);
                if (modalResult) {
                  expect(modalResult.confidence).toBeLessThan(0.7);
                }
              }
              break;

            case 'ambiguous':
              // Ambiguous cases may go either way, but analysis should complete
              expect(localResult,
                `Ambiguous cases should complete analysis for ${testCase.id}`
              ).toBeDefined();
              if (ENABLE_V1_ASSERTIONS) {
                // Confidence bands should be mid-range
                const m = modalResult?.confidence ?? 0;
                const f = functionalResult.confidence;
                expect(m).toBeGreaterThanOrEqual(0.35);
                expect(m).toBeLessThanOrEqual(0.75);
                expect(f).toBeGreaterThanOrEqual(0.35);
                expect(f).toBeLessThanOrEqual(0.85);
                expect((comprehensiveResult.explanation?.length ?? 0)).toBeGreaterThan(0);
              }
              break;

            case 'edge_case':
              // Edge cases should handle gracefully without throwing
              expect(localResult,
                `Edge cases should handle gracefully for ${testCase.id}`
              ).toBeDefined();
              if (ENABLE_V1_ASSERTIONS) {
                // No strict primary approach assertion, but comprehensive should return a result
                expect(comprehensiveResult.primaryApproach).toBeDefined();
              }
              break;
          }

          // 4. Structural Integrity Checks
          expect(localResult.localAnalysis?.chords,
            `Analysis should return chord progression for ${testCase.id}`
          ).toBeDefined();

          if (modalResult) {
            expect(modalResult.evidence,
              `Modal result should include evidence for ${testCase.id}`
            ).toBeDefined();
            expect(modalResult.romanNumerals,
              `Modal result should include Roman numerals for ${testCase.id}`
            ).toBeDefined();
            expect(modalResult.romanNumerals.length,
              `Roman numerals should match chord count for ${testCase.id}`
            ).toBe(testCase.chords.length);
          }

          // Success - increment passed count and log results
          categoryStats.passed++;
          testExecutionLogs.push(testLog);

        } catch (error) {
          // Failure - increment failed count and record details
          categoryStats.failed++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          categoryStats.failures.push({
            case: testCase,
            error: errorMessage
          });

          // Update test log for failure and record it
          testLog.result = 'FAIL';
          testLog.errors.push(errorMessage);
          testExecutionLogs.push(testLog);

          // Re-throw to fail the individual test
          throw error;
        }
      });
    });
  });

  describe('Category Success Rate Validation', () => {
    expectedCategories.forEach(category => {
      it(`should achieve minimum success rate for ${category} category`, () => {
        const stats = categoryResults.get(category)!;
        const total = stats.passed + stats.failed;
        const successRate = total > 0 ? (stats.passed / total) : 0;

        // Define minimum success rates per category
        const minimumRates: Record<string, number> = {
          'modal_characteristic': 0.95,      // 95% - core modal patterns
          'modal_seventh_variant': 0.90,     // 90% - seventh chord variants
          'modal_vamp': 0.90,                // 90% - vamp patterns
          'modal_foil': 0.60,                // 60% - intentionally tricky
          'functional_clear': 0.95,          // 95% - should NOT be modal
          'ambiguous': 0.70,                 // 70% - inherently uncertain
          'edge_case': 0.80                  // 80% - should handle gracefully
        };

        const requiredRate = minimumRates[category] || 0.90;

        expect(successRate,
          `Category ${category} achieved ${(successRate * 100).toFixed(1)}% success rate, requires ${(requiredRate * 100).toFixed(1)}%`
        ).toBeGreaterThanOrEqual(requiredRate);
      });
    });
  });

  describe('Data Integrity Validation', () => {
    it('should have all expected categories represented', () => {
      const actualCategories = Object.keys(testData.metadata.categories);
      expectedCategories.forEach(category => {
        expect(actualCategories).toContain(category);
        expect(testData.metadata.categories[category]).toBeGreaterThan(0);
      });
    });

    it('should have unique test case IDs', () => {
      const ids = testData.testCases.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid test case structure', () => {
      testData.testCases.forEach(testCase => {
        expect(testCase.id).toBeDefined();
        expect(testCase.chords).toBeInstanceOf(Array);
        expect(testCase.chords.length).toBeGreaterThan(0);
        expect(testCase.parentKey).toBeDefined();
        expect(typeof testCase.expectedModal).toBe('boolean');
        if (testCase.expectedModal) {
          expect(testCase.expectedMode).toBeDefined();
        }
        expect(testCase.description).toBeDefined();
        expect(testCase.category).toBeDefined();
        expect(expectedCategories).toContain(testCase.category);
      });
    });

    it('should have correct total case count', () => {
      expect(testData.testCases.length).toBe(728);

      // Verify category counts sum to total
      const categorySum = Object.values(testData.metadata.categories).reduce((sum, count) => sum + count, 0);
      expect(categorySum).toBe(728);
    });
  });

  describe('Performance Requirements', () => {
    it('should process individual cases efficiently', async () => {
      const sampleCases = testData.testCases.slice(0, 10);
      const startTime = performance.now();

      for (const testCase of sampleCases) {
        modalAnalyzer.analyzeModalCharacteristics(testCase.chords, testCase.parentKey);
        await analyzeChordProgressionLocally(testCase.chords.join(' '), testCase.parentKey);
      }

      const endTime = performance.now();
      const avgTimePerCase = (endTime - startTime) / sampleCases.length;

      expect(avgTimePerCase).toBeLessThan(100); // Less than 100ms per case
    });
  });
});
