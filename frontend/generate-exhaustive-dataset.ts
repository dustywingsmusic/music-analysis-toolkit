/**
 * Simplified Exhaustive Modal Analysis Generator
 * 
 * Creates a comprehensive test dataset for systematic modal logic validation
 */

import { EnhancedModalAnalyzer } from './src/services/enhancedModalAnalyzer';
import { ComprehensiveAnalysisEngine } from './src/services/comprehensiveAnalysisService';
import { analyzeChordProgressionLocally } from './src/services/localChordProgressionAnalysis';

// Core test data
const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MODES = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];

interface TestCase {
  id: number;
  input: {
    progression: string;
    chords: string[];
    parentKey?: string;
    description: string;
  };
  results: {
    enhanced: any;
    comprehensive: any;
    legacy: any;
  };
  analysis: {
    conflicts: string[];
    issues: string[];
    confidence: number;
  };
}

async function generateExhaustiveDataset(): Promise<TestCase[]> {
  const analyzer = new EnhancedModalAnalyzer();
  const engine = new ComprehensiveAnalysisEngine();
  const testCases: TestCase[] = [];
  
  let id = 1;

  console.log('Generating exhaustive modal analysis dataset...');

  // 1. All characteristic modal progressions
  console.log('1. Testing characteristic modal progressions...');
  for (const root of NOTES) {
    // Mixolydian: I-bVII-IV-I
    const mixolydianProgression = [root, getFlatSeventh(root), getFourth(root), root];
    testCases.push(await createTestCase(id++, mixolydianProgression, undefined, `${root} Mixolydian I-bVII-IV-I`));
    
    // Mixolydian: bVII-I cadence
    const mixolydianCadence = [getFlatSeventh(root), root];
    testCases.push(await createTestCase(id++, mixolydianCadence, undefined, `${root} Mixolydian bVII-I cadence`));
    
    // Dorian: i-IV-i
    const dorianProgression = [`${root}m`, getFourth(root), `${root}m`];
    testCases.push(await createTestCase(id++, dorianProgression, undefined, `${root} Dorian i-IV-i`));
    
    // Test with parent keys
    const parentMajor = `${getFifth(root)} major`;
    testCases.push(await createTestCase(id++, mixolydianProgression, parentMajor, `${root} Mixolydian with parent ${parentMajor}`));
  }

  // 2. Functional progressions that should NOT be modal
  console.log('2. Testing functional progressions...');
  for (const root of ['C', 'G', 'D', 'F']) {
    const functionalProgression = [root, getFourth(root), getFifth(root), root];
    testCases.push(await createTestCase(id++, functionalProgression, `${root} major`, `${root} major I-IV-V-I functional`));
    
    const popProgression = [root, `${getSixth(root)}m`, getFourth(root), getFifth(root)];
    testCases.push(await createTestCase(id++, popProgression, `${root} major`, `${root} major I-vi-IV-V pop progression`));
  }

  // 3. Ambiguous cases
  console.log('3. Testing ambiguous cases...');
  const ambiguousCases = [
    { chords: ['G', 'F', 'C', 'G'], parentKey: 'C major', description: 'G F C G - functional vs modal ambiguity' },
    { chords: ['Am', 'F', 'C', 'G'], parentKey: undefined, description: 'Am F C G - tonal center ambiguity' },
    { chords: ['D', 'C', 'G', 'D'], parentKey: 'G major', description: 'D C G D - D Mixolydian vs G functional' },
    { chords: ['Em', 'C', 'G', 'D'], parentKey: undefined, description: 'Em C G D - multiple modal interpretations' }
  ];

  for (const { chords, parentKey, description } of ambiguousCases) {
    testCases.push(await createTestCase(id++, chords, parentKey, description));
  }

  // 4. Edge cases
  console.log('4. Testing edge cases...');
  const edgeCases = [
    { chords: ['C'], description: 'Single chord' },
    { chords: ['C', 'C'], description: 'Repeated chord' },
    { chords: ['C', 'C#', 'D'], description: 'Chromatic progression' },
    { chords: ['F#', 'Gb'], description: 'Enharmonic equivalents' }
  ];

  for (const { chords, description } of edgeCases) {
    testCases.push(await createTestCase(id++, chords, undefined, description));
  }

  console.log(`Generated ${testCases.length} test cases`);
  return testCases;

  async function createTestCase(
    id: number, 
    chords: string[], 
    parentKey: string | undefined, 
    description: string
  ): Promise<TestCase> {
    const progression = chords.join(' ');
    const results = { enhanced: null, comprehensive: null, legacy: null };
    const conflicts: string[] = [];
    const issues: string[] = [];

    try {
      // Enhanced Modal Analyzer
      results.enhanced = analyzer.analyzeModalCharacteristics(chords, parentKey);
    } catch (error) {
      issues.push(`Enhanced analyzer error: ${error}`);
    }

    try {
      // Comprehensive Analysis
      results.comprehensive = await engine.analyzeComprehensively(progression, parentKey);
    } catch (error) {
      issues.push(`Comprehensive analysis error: ${error}`);
    }

    try {
      // Legacy Analysis
      results.legacy = await analyzeChordProgressionLocally(progression, parentKey);
    } catch (error) {
      issues.push(`Legacy analysis error: ${error}`);
    }

    // Detect conflicts
    const enhancedDetectsModal = results.enhanced?.confidence >= 0.7;
    const comprehensiveHasModal = results.comprehensive?.modal?.enhancedAnalysis;
    
    if (enhancedDetectsModal !== !!comprehensiveHasModal) {
      conflicts.push('Enhanced vs Comprehensive modal detection disagreement');
    }

    if (results.enhanced && results.comprehensive?.modal?.enhancedAnalysis) {
      if (results.enhanced.modeName !== results.comprehensive.modal.enhancedAnalysis.modeName) {
        conflicts.push('Mode name disagreement between systems');
      }
    }

    return {
      id,
      input: { progression, chords, parentKey, description },
      results,
      analysis: {
        conflicts,
        issues,
        confidence: results.enhanced?.confidence || 0
      }
    };
  }
}

// Helper functions for interval calculations
function getFlatSeventh(root: string): string {
  const intervals = { C: 'Bb', 'C#': 'B', D: 'C', Eb: 'Db', E: 'D', F: 'Eb', 'F#': 'E', G: 'F', Ab: 'Gb', A: 'G', Bb: 'Ab', B: 'A' };
  return intervals[root as keyof typeof intervals] || root;
}

function getFourth(root: string): string {
  const intervals = { C: 'F', 'C#': 'F#', D: 'G', Eb: 'Ab', E: 'A', F: 'Bb', 'F#': 'B', G: 'C', Ab: 'Db', A: 'D', Bb: 'Eb', B: 'E' };
  return intervals[root as keyof typeof intervals] || root;
}

function getFifth(root: string): string {
  const intervals = { C: 'G', 'C#': 'G#', D: 'A', Eb: 'Bb', E: 'B', F: 'C', 'F#': 'C#', G: 'D', Ab: 'Eb', A: 'E', Bb: 'F', B: 'F#' };
  return intervals[root as keyof typeof intervals] || root;
}

function getSixth(root: string): string {
  const intervals = { C: 'A', 'C#': 'A#', D: 'B', Eb: 'C', E: 'C#', F: 'D', 'F#': 'D#', G: 'E', Ab: 'F', A: 'F#', Bb: 'G', B: 'G#' };
  return intervals[root as keyof typeof intervals] || root;
}

// Export for use
export { generateExhaustiveDataset };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateExhaustiveDataset().then(dataset => {
    console.log('\n=== EXHAUSTIVE DATASET ANALYSIS ===');
    
    const summary = {
      totalCases: dataset.length,
      casesWithConflicts: dataset.filter(tc => tc.analysis.conflicts.length > 0).length,
      casesWithIssues: dataset.filter(tc => tc.analysis.issues.length > 0).length,
      highConfidenceCases: dataset.filter(tc => tc.analysis.confidence >= 0.8).length,
      modalDetectionRate: dataset.filter(tc => tc.analysis.confidence >= 0.7).length
    };

    console.log('Summary:', summary);
    
    console.log('\n=== CASES WITH CONFLICTS ===');
    dataset.filter(tc => tc.analysis.conflicts.length > 0).forEach(tc => {
      console.log(`${tc.id}: ${tc.input.description}`);
      console.log(`  Progression: ${tc.input.progression}`);
      console.log(`  Parent Key: ${tc.input.parentKey || 'none'}`);
      console.log(`  Conflicts: ${tc.analysis.conflicts.join(', ')}`);
      console.log(`  Enhanced: ${tc.results.enhanced?.modeName || 'none'} (${tc.results.enhanced?.confidence || 0})`);
      console.log('---');
    });

    console.log('\n=== CASES WITH ISSUES ===');
    dataset.filter(tc => tc.analysis.issues.length > 0).forEach(tc => {
      console.log(`${tc.id}: ${tc.input.description}`);
      console.log(`  Issues: ${tc.analysis.issues.join(', ')}`);
      console.log('---');
    });
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('./exhaustive-modal-dataset.json', JSON.stringify(dataset, null, 2));
    console.log('\n✅ Dataset saved to exhaustive-modal-dataset.json');
    
  }).catch(console.error);
}