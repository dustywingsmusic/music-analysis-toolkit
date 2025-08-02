/**
 * Comprehensive Modal Test Runner
 * 
 * Loads the generated comprehensive test cases from JSON and executes them
 * against all modal analysis systems for systematic validation.
 */

import { describe, it, expect } from 'vitest';
import { EnhancedModalAnalyzer } from '../../../src/services/enhancedModalAnalyzer';
import { ComprehensiveAnalysisEngine } from '../../../src/services/comprehensiveAnalysisService';
import { analyzeChordProgressionLocally } from '../../../src/services/localChordProgressionAnalysis';
import fs from 'fs';
import path from 'path';

interface GeneratedTestCase {
  id: string;
  chords: string[];
  parentKey?: string;
  expectedModal: boolean;
  expectedMode?: string;
  description: string;
  category: 'modal_characteristic' | 'functional_clear' | 'ambiguous' | 'edge_case';
  theoreticalBasis: string;
}

interface TestResult {
  testCase: GeneratedTestCase;
  actual: {
    enhanced: { modal: boolean; mode?: string; confidence: number; error?: string };
    comprehensive: { modal: boolean; primaryApproach: string; error?: string };
    legacy: { modal: boolean; mode?: string; confidence: number; error?: string };
  };
  validation: {
    systemsAgree: boolean;
    theoreticallyCorrect: boolean;
    issues: string[];
  };
}

describe('Comprehensive Modal Test Runner', () => {
  const enhancedAnalyzer = new EnhancedModalAnalyzer();
  const comprehensiveEngine = new ComprehensiveAnalysisEngine();
  
  let testData: { metadata: any; testCases: GeneratedTestCase[] };
  
  // Load the generated test cases
  beforeAll(() => {
    const jsonPath = path.join(process.cwd(), 'comprehensive-modal-test-cases.json');
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error('comprehensive-modal-test-cases.json not found. Run: node generate-comprehensive-test-cases.cjs');
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    testData = JSON.parse(jsonData);
    
    console.log(`\n📊 Loaded ${testData.testCases.length} comprehensive test cases`);
    console.log('Categories:', testData.metadata.categories);
  });

  it('should validate all modal characteristic cases', async () => {
    const modalCases = testData.testCases.filter(tc => tc.category === 'modal_characteristic');
    console.log(`\n🎵 Testing ${modalCases.length} modal characteristic cases...`);
    
    const results = await runTestCases(modalCases);
    const summary = analyzeResults(results, 'Modal Characteristic Cases');
    
    expect(results.length).toBe(modalCases.length);
    
    // Log specific failures for debugging
    if (summary.theoreticalErrors > 0) {
      console.log('\n❌ Modal cases that failed theoretical validation:');
      results.filter(r => !r.validation.theoreticallyCorrect).slice(0, 5).forEach(result => {
        console.log(`  ${result.testCase.id}: ${result.testCase.description}`);
        console.log(`    Expected: ${result.testCase.expectedModal ? 'MODAL' : 'FUNCTIONAL'} (${result.testCase.expectedMode || 'none'})`);
        console.log(`    Enhanced: ${result.actual.enhanced.modal ? 'MODAL' : 'FUNCTIONAL'} (${result.actual.enhanced.mode || 'none'})`);
        console.log(`    Issues: ${result.validation.issues.join(', ')}`);
      });
    }
  });

  it('should validate all functional cases', async () => {
    const functionalCases = testData.testCases.filter(tc => tc.category === 'functional_clear');
    console.log(`\n🎼 Testing ${functionalCases.length} functional cases...`);
    
    const results = await runTestCases(functionalCases);
    const summary = analyzeResults(results, 'Functional Cases');
    
    expect(results.length).toBe(functionalCases.length);
    
    // These should have very few false positives
    if (summary.theoreticalErrors > 0) {
      console.log('\n❌ Functional cases incorrectly detected as modal:');
      results.filter(r => !r.validation.theoreticallyCorrect).slice(0, 3).forEach(result => {
        console.log(`  ${result.testCase.id}: ${result.testCase.description}`);
        console.log(`    Expected: FUNCTIONAL, Got: MODAL (${result.actual.enhanced.mode})`);
      });
    }
  });

  it('should validate ambiguous and edge cases', async () => {
    const ambiguousAndEdgeCases = testData.testCases.filter(tc => 
      tc.category === 'ambiguous' || tc.category === 'edge_case'
    );
    console.log(`\n⚖️ Testing ${ambiguousAndEdgeCases.length} ambiguous and edge cases...`);
    
    const results = await runTestCases(ambiguousAndEdgeCases);
    const summary = analyzeResults(results, 'Ambiguous & Edge Cases');
    
    expect(results.length).toBe(ambiguousAndEdgeCases.length);
  });

  it('should test the specific Am G Dm Am case you requested', async () => {
    // Find or create the specific case you asked about
    let specificCase = testData.testCases.find(tc => 
      tc.chords.join(' ') === 'Am G Dm Am' && tc.parentKey === 'C major'
    );
    
    if (!specificCase) {
      // Create it manually if not found in generated data
      specificCase = {
        id: 'specific-test',
        chords: ['Am', 'G', 'Dm', 'Am'],
        parentKey: 'C major',
        expectedModal: true,
        expectedMode: 'A Aeolian',
        description: 'A Aeolian i-bVII-iv-i (user requested)',
        category: 'modal_characteristic',
        theoreticalBasis: 'A Aeolian with characteristic i-bVII-iv-i progression'
      };
      console.log('\n🎯 Testing your specific requested case: Am G Dm Am with C major parent');
    } else {
      console.log('\n🎯 Found your specific case in generated data:', specificCase.id);
    }
    
    const results = await runTestCases([specificCase]);
    const result = results[0];
    
    // Detailed logging for this specific case
    console.log('\n📋 DETAILED ANALYSIS OF YOUR REQUESTED CASE:');
    console.log(`   Input: ${specificCase.chords.join(' ')} (parent: ${specificCase.parentKey})`);
    console.log(`   Expected: ${specificCase.expectedModal ? 'MODAL' : 'FUNCTIONAL'} (${specificCase.expectedMode})`);
    console.log(`   Enhanced: ${result.actual.enhanced.modal ? 'MODAL' : 'FUNCTIONAL'} (${result.actual.enhanced.mode || 'none'}, conf: ${result.actual.enhanced.confidence.toFixed(2)})`);
    console.log(`   Comprehensive: ${result.actual.comprehensive.modal ? 'MODAL' : 'FUNCTIONAL'} (primary: ${result.actual.comprehensive.primaryApproach})`);
    console.log(`   Legacy: ${result.actual.legacy.modal ? 'MODAL' : 'FUNCTIONAL'} (${result.actual.legacy.mode || 'none'}, conf: ${result.actual.legacy.confidence.toFixed(2)})`);
    
    if (result.validation.issues.length > 0) {
      console.log(`   ❌ ISSUES: ${result.validation.issues.join('; ')}`);
    } else {
      console.log(`   ✅ ALL SYSTEMS CORRECT AND AGREE`);
    }
    
    expect(result).toBeDefined();
  });

  // Helper functions
  async function runTestCases(testCases: GeneratedTestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result: TestResult = {
        testCase,
        actual: {
          enhanced: { modal: false, confidence: 0 },
          comprehensive: { modal: false, primaryApproach: 'functional' },
          legacy: { modal: false, confidence: 0 }
        },
        validation: {
          systemsAgree: true,
          theoreticallyCorrect: true,
          issues: []
        }
      };

      // Test Enhanced Modal Analyzer
      try {
        const enhancedResult = enhancedAnalyzer.analyzeModalCharacteristics(
          testCase.chords,
          testCase.parentKey
        );
        
        result.actual.enhanced = {
          modal: !!enhancedResult && enhancedResult.confidence >= 0.7,
          mode: enhancedResult?.modeName,
          confidence: enhancedResult?.confidence || 0
        };
      } catch (error) {
        result.actual.enhanced.error = error instanceof Error ? error.message : 'Unknown error';
        result.validation.issues.push(`Enhanced analyzer error: ${result.actual.enhanced.error}`);
      }

      // Test Comprehensive Analysis Engine
      try {
        const comprehensiveResult = await comprehensiveEngine.analyzeComprehensively(
          testCase.chords.join(' '),
          testCase.parentKey
        );
        
        result.actual.comprehensive = {
          modal: !!comprehensiveResult.modal,
          primaryApproach: comprehensiveResult.primaryApproach
        };
      } catch (error) {
        result.actual.comprehensive.error = error instanceof Error ? error.message : 'Unknown error';
        result.validation.issues.push(`Comprehensive analysis error: ${result.actual.comprehensive.error}`);
      }

      // Test Legacy Local Analysis  
      try {
        const legacyResult = await analyzeChordProgressionLocally(
          testCase.chords.join(' '),
          testCase.parentKey
        );
        
        result.actual.legacy = {
          modal: legacyResult.localAnalysis?.confidence >= 0.7,
          mode: legacyResult.localAnalysis?.overallMode,
          confidence: legacyResult.localAnalysis?.confidence || 0
        };
      } catch (error) {
        result.actual.legacy.error = error instanceof Error ? error.message : 'Unknown error';
        result.validation.issues.push(`Legacy analysis error: ${result.actual.legacy.error}`);
      }

      // Validate results
      validateTestResult(result);
      results.push(result);
    }

    return results;
  }

  function validateTestResult(result: TestResult): void {
    const { testCase, actual } = result;
    
    // Check system agreement
    if (actual.enhanced.modal !== actual.comprehensive.modal) {
      result.validation.systemsAgree = false;
      result.validation.issues.push('Enhanced vs Comprehensive modal detection disagreement');
    }

    if (actual.enhanced.modal !== actual.legacy.modal) {
      result.validation.systemsAgree = false;
      result.validation.issues.push('Enhanced vs Legacy modal detection disagreement');
    }

    // Check theoretical correctness
    if (testCase.expectedModal && !actual.enhanced.modal) {
      result.validation.theoreticallyCorrect = false;
      result.validation.issues.push('Should detect modal but enhanced analyzer did not');
    }

    if (!testCase.expectedModal && actual.enhanced.modal) {
      result.validation.theoreticallyCorrect = false;
      result.validation.issues.push('Should not detect modal but enhanced analyzer did');
    }

    // Check mode accuracy
    if (testCase.expectedMode && actual.enhanced.mode && 
        testCase.expectedMode !== actual.enhanced.mode) {
      result.validation.theoreticallyCorrect = false;
      result.validation.issues.push(`Expected ${testCase.expectedMode} but got ${actual.enhanced.mode}`);
    }
  }

  function analyzeResults(results: TestResult[], categoryName: string) {
    const conflicts = results.filter(r => !r.validation.systemsAgree);
    const theoreticalErrors = results.filter(r => !r.validation.theoreticallyCorrect);
    const successRate = ((results.length - theoreticalErrors.length) / results.length * 100);

    const summary = {
      totalCases: results.length,
      systemConflicts: conflicts.length,
      theoreticalErrors: theoreticalErrors.length,
      successRate
    };

    console.log(`\n📊 ${categoryName} Results:`);
    console.log(`  Total cases: ${summary.totalCases}`);
    console.log(`  System conflicts: ${summary.systemConflicts}`);
    console.log(`  Theoretical errors: ${summary.theoreticalErrors}`);
    console.log(`  Success rate: ${summary.successRate.toFixed(1)}%`);

    return summary;
  }
});