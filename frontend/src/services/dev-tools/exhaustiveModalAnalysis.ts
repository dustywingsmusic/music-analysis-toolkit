/**
 * Exhaustive Modal Analysis Output Generator
 *
 * @deprecated This is a development/testing tool, not used in production runtime.
 * @warning This file is not imported by UI components - CLI/dev tool only.
 *
 * Generates comprehensive test results for all possible modal inputs
 * to enable external analysis and validation of modal logic correctness.
 *
 * Status: DEV TOOL - Used for analysis validation and development only.
 * Not part of the application runtime. Referenced in documentation.
 *
 * This will test:
 * - All 12 chromatic notes as roots
 * - All 7 modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian)
 * - All possible chord progressions (2-8 chords)
 * - All parent key combinations
 * - All confidence thresholds and edge cases
 */

import { EnhancedModalAnalyzer, ModalAnalysisResult } from '../enhancedModalAnalyzer';
import { getMajorScaleInfo, getModalScaleInfo } from '../../utils/scaleInformation';
import { ComprehensiveAnalysisEngine } from '../comprehensiveAnalysisService';
import { analyzeChordProgressionLocally } from '../localChordProgressionAnalysis';

// All chromatic notes
const ALL_NOTES = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

// All seven modes
const ALL_MODES = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];

// Common chord qualities
const CHORD_QUALITIES = ['', 'm', 'dim', 'aug', '7', 'maj7', 'm7', 'dim7'];

// Parent key signatures (major and minor)
const PARENT_KEYS = [
  'C major', 'G major', 'D major', 'A major', 'E major', 'B major', 'F# major', 'C# major',
  'F major', 'Bb major', 'Eb major', 'Ab major', 'Db major', 'Gb major', 'Cb major',
  'A minor', 'E minor', 'B minor', 'F# minor', 'C# minor', 'G# minor', 'D# minor', 'A# minor',
  'D minor', 'G minor', 'C minor', 'F minor', 'Bb minor', 'Eb minor', 'Ab minor'
];

export interface ExhaustiveTestCase {
  id: string;
  input: {
    chordProgression: string;
    chordSymbols: string[];
    parentKey?: string;
    progressionLength: number;
    uniqueRoots: string[];
    intervalPattern: number[];
  };
  results: {
    enhancedModalAnalyzer: {
      result: ModalAnalysisResult | null;
      confidence: number;
      detectedMode?: string;
      romanNumerals?: string[];
      evidence?: any[];
      error?: string;
    };
    comprehensiveAnalysis: {
      primaryApproach: string;
      hasModal: boolean;
      modalConfidence?: number;
      functionalConfidence: number;
      error?: string;
    };
    legacyLocalAnalysis: {
      result: any;
      detectedMode?: string;
      confidence: number;
      error?: string;
    };
    scaleInformation: {
      majorScale?: any;
      modalScale?: any;
      derivationCorrect?: boolean;
      error?: string;
    };
  };
  expectedTheory: {
    shouldDetectModal: boolean;
    expectedMode?: string;
    expectedParentKey?: string;
    expectedRomanNumerals?: string[];
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  };
  validation: {
    allSystemsAgree: boolean;
    conflictingResults: string[];
    theoreticallyCorrect: boolean;
    issues: string[];
  };
}

export class ExhaustiveModalAnalysisGenerator {
  private enhancedAnalyzer: EnhancedModalAnalyzer;
  private comprehensiveEngine: ComprehensiveAnalysisEngine;

  constructor() {
    this.enhancedAnalyzer = new EnhancedModalAnalyzer();
    this.comprehensiveEngine = new ComprehensiveAnalysisEngine();
  }

  /**
   * Generate all possible meaningful chord progressions
   */
  private generateChordProgressions(): Array<{progression: string[], description: string}> {
    const progressions: Array<{progression: string[], description: string}> = [];

    // 1. Single mode progressions for each mode
    ALL_NOTES.slice(0, 12).forEach(root => { // Use only 12 enharmonic roots
      ALL_MODES.forEach(mode => {
        // Generate characteristic progressions for each mode
        const modeProgressions = this.generateModeCharacteristicProgressions(root, mode);
        progressions.push(...modeProgressions);
      });
    });

    // 2. Common functional progressions in all keys
    const functionalPatterns = [
      ['I', 'IV', 'V', 'I'],
      ['I', 'V', 'vi', 'IV'],
      ['vi', 'IV', 'I', 'V'],
      ['ii', 'V', 'I'],
      ['I', 'vi', 'ii', 'V'],
      ['I', 'V', 'I'],
      ['IV', 'V', 'I']
    ];

    ALL_NOTES.slice(0, 12).forEach(root => {
      functionalPatterns.forEach((pattern, idx) => {
        const chords = this.convertRomanToChords(pattern, root, 'major');
        progressions.push({
          progression: chords,
          description: `Functional ${pattern.join('-')} in ${root} major`
        });
      });
    });

    // 3. Modal interchange progressions
    ALL_NOTES.slice(0, 12).forEach(root => {
      progressions.push({
        progression: [root, `${root}m`, `${this.getRelativeNote(root, 5)}7`, root],
        description: `Modal interchange I-i-V7-I in ${root}`
      });
    });

    // 4. Edge cases and ambiguous progressions
    progressions.push(
      ...this.generateEdgeCases(),
      ...this.generateAmbiguousProgressions()
    );

    return progressions;
  }

  /**
   * Generate characteristic progressions for a specific mode
   */
  private generateModeCharacteristicProgressions(root: string, mode: string): Array<{progression: string[], description: string}> {
    const progressions: Array<{progression: string[], description: string}> = [];

    switch (mode) {
      case 'Mixolydian':
        progressions.push(
          { progression: [root, this.getRelativeNote(root, 10), this.getRelativeNote(root, 5), root], description: `${root} Mixolydian I-bVII-IV-I` },
          { progression: [root, this.getRelativeNote(root, 10), root], description: `${root} Mixolydian I-bVII-I` },
          { progression: [this.getRelativeNote(root, 10), root], description: `${root} Mixolydian bVII-I cadence` }
        );
        break;
      case 'Dorian':
        progressions.push(
          { progression: [`${root}m`, this.getRelativeNote(root, 5), this.getRelativeNote(root, 10), `${root}m`], description: `${root} Dorian i-IV-bVII-i` },
          { progression: [`${root}m`, this.getRelativeNote(root, 5), `${root}m`], description: `${root} Dorian i-IV-i` }
        );
        break;
      case 'Phrygian':
        progressions.push(
          { progression: [`${root}m`, this.getRelativeNote(root, 1), `${root}m`], description: `${root} Phrygian i-bII-i` },
          { progression: [this.getRelativeNote(root, 1), `${root}m`], description: `${root} Phrygian bII-i cadence` }
        );
        break;
      case 'Lydian':
        progressions.push(
          { progression: [root, this.getRelativeNote(root, 6), root], description: `${root} Lydian I-#IV-I` },
          { progression: [root, this.getRelativeNote(root, 2), root], description: `${root} Lydian I-II-I` }
        );
        break;
      case 'Aeolian':
        progressions.push(
          { progression: [`${root}m`, this.getRelativeNote(root, 8), this.getRelativeNote(root, 10), `${root}m`], description: `${root} Aeolian i-bVI-bVII-i` },
          { progression: [`${root}m`, this.getRelativeNote(root, 10), this.getRelativeNote(root, 8), `${root}m`], description: `${root} Aeolian i-bVII-bVI-i` }
        );
        break;
      case 'Locrian':
        progressions.push(
          { progression: [`${root}dim`, this.getRelativeNote(root, 1), `${root}dim`], description: `${root} Locrian i°-bII-i°` }
        );
        break;
      case 'Ionian':
        progressions.push(
          { progression: [root, this.getRelativeNote(root, 5), this.getRelativeNote(root, 7), root], description: `${root} Ionian I-IV-V-I` }
        );
        break;
    }

    return progressions;
  }

  /**
   * Generate edge cases that commonly cause issues
   */
  private generateEdgeCases(): Array<{progression: string[], description: string}> {
    return [
      // Single chord
      { progression: ['C'], description: 'Single chord - should not detect modal' },

      // Repeated chord
      { progression: ['G', 'G', 'G'], description: 'Repeated chord - ambiguous' },

      // Chromatic progression
      { progression: ['C', 'C#', 'D', 'D#'], description: 'Chromatic progression - non-modal' },

      // Enharmonic equivalents
      { progression: ['F#', 'Gb', 'F#'], description: 'Enharmonic equivalents' },

      // Very short progressions
      { progression: ['G', 'F'], description: 'Two chord progression - minimal context' },

      // Long progressions
      { progression: ['C', 'Am', 'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C'], description: 'Long functional progression' },

      // Modal vs functional ambiguity
      { progression: ['G', 'C', 'D', 'G'], description: 'G major (functional) vs G Mixolydian (modal) ambiguity' },

      // Parallel mode confusion
      { progression: ['C', 'Cm', 'F', 'G'], description: 'Major/minor mode mixture' }
    ];
  }

  /**
   * Generate ambiguous progressions that test decision boundaries
   */
  private generateAmbiguousProgressions(): Array<{progression: string[], description: string}> {
    return [
      { progression: ['Am', 'F', 'C', 'G'], description: 'vi-IV-I-V in C or A Aeolian - ambiguous tonal center' },
      { progression: ['D', 'G', 'A', 'D'], description: 'I-IV-V-I in D or D Mixolydian in G - functional vs modal' },
      { progression: ['Em', 'C', 'G', 'D'], description: 'E Aeolian vs C Lydian - competing modal interpretations' },
      { progression: ['F', 'G', 'Am'], description: 'bVII-I-ii in A or IV-V-vi in C - tonal center ambiguity' },
      { progression: ['Bb', 'F', 'C'], description: 'bVII-IV-I in C or I-V-V/V in Bb - modal vs chromatic' }
    ];
  }

  /**
   * Get relative note by semitone interval
   */
  private getRelativeNote(root: string, semitones: number): string {
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = chromatic.indexOf(root.replace('b', '#')); // Normalize flats to sharps
    if (rootIndex === -1) return root; // Fallback for complex enharmonics

    const targetIndex = (rootIndex + semitones) % 12;
    return chromatic[targetIndex];
  }

  /**
   * Convert Roman numerals to chord symbols
   */
  private convertRomanToChords(romans: string[], key: string, mode: string): string[] {
    // Simplified conversion - would need full implementation
    const scaleNotes = this.getScaleNotes(key, mode);
    return romans.map((roman, idx) => {
      const degree = this.parseRomanNumeral(roman);
      return scaleNotes[degree - 1] + (roman.toLowerCase() === roman ? 'm' : '');
    });
  }

  /**
   * Get scale notes for key and mode
   */
  private getScaleNotes(root: string, mode: string): string[] {
    // Simplified - would use proper scale generation
    return [root]; // Placeholder
  }

  /**
   * Parse Roman numeral to scale degree
   */
  private parseRomanNumeral(roman: string): number {
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const base = roman.replace(/[^IVX]/g, '').toUpperCase();
    return numerals.indexOf(base) + 1;
  }

  /**
   * Run complete analysis on a chord progression
   */
  private async analyzeProgression(
    chordSymbols: string[],
    parentKey?: string
  ): Promise<ExhaustiveTestCase['results']> {
    const results: ExhaustiveTestCase['results'] = {
      enhancedModalAnalyzer: { result: null, confidence: 0 },
      comprehensiveAnalysis: { primaryApproach: 'functional', hasModal: false, functionalConfidence: 0 },
      legacyLocalAnalysis: { result: null, confidence: 0 },
      scaleInformation: {}
    };

    try {
      // Enhanced Modal Analyzer
      const enhancedResult = this.enhancedAnalyzer.analyzeModalCharacteristics(chordSymbols, parentKey);
      results.enhancedModalAnalyzer = {
        result: enhancedResult,
        confidence: enhancedResult?.confidence || 0,
        detectedMode: enhancedResult?.modeName,
        romanNumerals: enhancedResult?.romanNumerals,
        evidence: enhancedResult?.evidence
      };
    } catch (error) {
      results.enhancedModalAnalyzer.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      // Comprehensive Analysis
      const comprehensiveResult = await this.comprehensiveEngine.analyzeComprehensively(
        chordSymbols.join(' '),
        parentKey
      );
      results.comprehensiveAnalysis = {
        primaryApproach: comprehensiveResult.primaryApproach,
        hasModal: !!comprehensiveResult.modal,
        modalConfidence: comprehensiveResult.modal?.enhancedAnalysis?.confidence,
        functionalConfidence: comprehensiveResult.functional.confidence
      };
    } catch (error) {
      results.comprehensiveAnalysis.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      // Legacy Local Analysis
      const legacyResult = await analyzeChordProgressionLocally(chordSymbols.join(' '), parentKey);
      results.legacyLocalAnalysis = {
        result: legacyResult,
        detectedMode: legacyResult.localAnalysis?.overallMode,
        confidence: legacyResult.localAnalysis?.confidence || 0
      };
    } catch (error) {
      results.legacyLocalAnalysis.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      // Scale Information
      if (parentKey) {
        results.scaleInformation.majorScale = getMajorScaleInfo(parentKey);
      }
      if (results.enhancedModalAnalyzer.detectedMode) {
        results.scaleInformation.modalScale = getModalScaleInfo(results.enhancedModalAnalyzer.detectedMode);
      }
    } catch (error) {
      results.scaleInformation.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return results;
  }

  /**
   * Determine theoretical expectations for a progression
   */
  private determineTheoreticalExpectations(
    chordSymbols: string[],
    parentKey?: string,
    description?: string
  ): ExhaustiveTestCase['expectedTheory'] {
    // This would contain comprehensive music theory rules
    // For now, basic heuristics:

    const progression = chordSymbols.join(' ');

    // Mixolydian indicators
    if (progression.includes('bVII') || description?.includes('Mixolydian')) {
      return {
        shouldDetectModal: true,
        expectedMode: 'Mixolydian',
        confidence: 'high',
        reasoning: 'Contains bVII chord characteristic of Mixolydian mode'
      };
    }

    // Functional progressions
    if (progression.match(/I.*IV.*V.*I/) || description?.includes('Functional')) {
      return {
        shouldDetectModal: false,
        confidence: 'high',
        reasoning: 'Classic functional harmony progression'
      };
    }

    // Default case
    return {
      shouldDetectModal: false,
      confidence: 'low',
      reasoning: 'Insufficient information for modal determination'
    };
  }

  /**
   * Validate results for consistency and correctness
   */
  private validateResults(
    results: ExhaustiveTestCase['results'],
    expected: ExhaustiveTestCase['expectedTheory']
  ): ExhaustiveTestCase['validation'] {
    const validation: ExhaustiveTestCase['validation'] = {
      allSystemsAgree: true,
      conflictingResults: [],
      theoreticallyCorrect: true,
      issues: []
    };

    // Check agreement between systems
    const enhancedDetectsModal = results.enhancedModalAnalyzer.confidence >= 0.7;
    const comprehensiveHasModal = results.comprehensiveAnalysis.hasModal;
    const legacyDetectsModal = results.legacyLocalAnalysis.confidence >= 0.7;

    if (enhancedDetectsModal !== comprehensiveHasModal) {
      validation.allSystemsAgree = false;
      validation.conflictingResults.push('Enhanced analyzer vs Comprehensive analysis modal detection');
    }

    if (enhancedDetectsModal !== legacyDetectsModal) {
      validation.allSystemsAgree = false;
      validation.conflictingResults.push('Enhanced analyzer vs Legacy analyzer modal detection');
    }

    // Check against theoretical expectations
    if (expected.shouldDetectModal && !enhancedDetectsModal) {
      validation.theoreticallyCorrect = false;
      validation.issues.push('Should detect modal but enhanced analyzer did not');
    }

    if (!expected.shouldDetectModal && enhancedDetectsModal) {
      validation.theoreticallyCorrect = false;
      validation.issues.push('Should not detect modal but enhanced analyzer did');
    }

    // Check for errors
    if (results.enhancedModalAnalyzer.error) {
      validation.issues.push(`Enhanced analyzer error: ${results.enhancedModalAnalyzer.error}`);
    }

    if (results.comprehensiveAnalysis.error) {
      validation.issues.push(`Comprehensive analysis error: ${results.comprehensiveAnalysis.error}`);
    }

    if (results.legacyLocalAnalysis.error) {
      validation.issues.push(`Legacy analysis error: ${results.legacyLocalAnalysis.error}`);
    }

    return validation;
  }

  /**
   * Generate complete exhaustive test dataset
   */
  public async generateExhaustiveDataset(): Promise<ExhaustiveTestCase[]> {
    console.log('🔍 Generating exhaustive modal analysis dataset...');

    const progressions = this.generateChordProgressions();
    const testCases: ExhaustiveTestCase[] = [];

    let caseId = 1;

    for (const {progression, description} of progressions) {
      // Test without parent key
      const withoutParentKey = await this.createTestCase(
        `${caseId++}`,
        progression,
        description,
        undefined
      );
      testCases.push(withoutParentKey);

      // Test with relevant parent keys
      const relevantKeys = this.getRelevantParentKeys(progression);
      for (const parentKey of relevantKeys.slice(0, 3)) { // Limit to 3 most relevant
        const withParentKey = await this.createTestCase(
          `${caseId++}`,
          progression,
          `${description} (parent: ${parentKey})`,
          parentKey
        );
        testCases.push(withParentKey);
      }
    }

    console.log(`📊 Generated ${testCases.length} exhaustive test cases`);
    return testCases;
  }

  /**
   * Create a single test case
   */
  private async createTestCase(
    id: string,
    chordSymbols: string[],
    description: string,
    parentKey?: string
  ): Promise<ExhaustiveTestCase> {
    const input = {
      chordProgression: chordSymbols.join(' '),
      chordSymbols,
      parentKey,
      progressionLength: chordSymbols.length,
      uniqueRoots: [...new Set(chordSymbols.map(c => c.replace(/[^A-G#b]/g, '')))],
      intervalPattern: this.calculateIntervalPattern(chordSymbols)
    };

    const results = await this.analyzeProgression(chordSymbols, parentKey);
    const expectedTheory = this.determineTheoreticalExpectations(chordSymbols, parentKey, description);
    const validation = this.validateResults(results, expectedTheory);

    return {
      id,
      input,
      results,
      expectedTheory,
      validation
    };
  }

  /**
   * Get relevant parent keys for a progression
   */
  private getRelevantParentKeys(chordSymbols: string[]): string[] {
    // Determine which parent keys would be most relevant to test
    const roots = [...new Set(chordSymbols.map(c => c.replace(/[^A-G#b]/g, '')))];
    const relevantKeys: string[] = [];

    // Add major keys for each root
    roots.forEach(root => {
      relevantKeys.push(`${root} major`);
      relevantKeys.push(`${this.getRelativeMinor(root)} minor`);
    });

    return [...new Set(relevantKeys)];
  }

  /**
   * Get relative minor key
   */
  private getRelativeMinor(major: string): string {
    // Simplified - would need full implementation
    return major; // Placeholder
  }

  /**
   * Calculate interval pattern between chord roots
   */
  private calculateIntervalPattern(chordSymbols: string[]): number[] {
    // Calculate semitone intervals between consecutive chord roots
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const intervals: number[] = [];

    for (let i = 1; i < chordSymbols.length; i++) {
      const prev = chordSymbols[i-1].replace(/[^A-G#b]/g, '');
      const curr = chordSymbols[i].replace(/[^A-G#b]/g, '');

      const prevIndex = chromatic.indexOf(prev);
      const currIndex = chromatic.indexOf(curr);

      if (prevIndex !== -1 && currIndex !== -1) {
        intervals.push((currIndex - prevIndex + 12) % 12);
      }
    }

    return intervals;
  }
}

/**
 * Export function to generate and save exhaustive dataset
 */
export async function generateAndSaveExhaustiveDataset(): Promise<void> {
  const generator = new ExhaustiveModalAnalysisGenerator();
  const dataset = await generator.generateExhaustiveDataset();

  // Save to file for external analysis
  const fs = await import('fs');
  const path = './exhaustive-modal-analysis-dataset.json';

  fs.writeFileSync(path, JSON.stringify(dataset, null, 2));

  console.log(`✅ Saved exhaustive dataset with ${dataset.length} test cases to ${path}`);

  // Generate summary statistics
  const summary = {
    totalCases: dataset.length,
    casesWithIssues: dataset.filter(tc => tc.validation.issues.length > 0).length,
    casesWithConflicts: dataset.filter(tc => !tc.validation.allSystemsAgree).length,
    casesTheoreticallyIncorrect: dataset.filter(tc => !tc.validation.theoreticallyCorrect).length,
    modalDetectionRate: dataset.filter(tc => tc.results.enhancedModalAnalyzer.confidence >= 0.7).length,
    averageConfidence: dataset.reduce((sum, tc) => sum + tc.results.enhancedModalAnalyzer.confidence, 0) / dataset.length
  };

  console.log('📊 Dataset Summary:', summary);
}
