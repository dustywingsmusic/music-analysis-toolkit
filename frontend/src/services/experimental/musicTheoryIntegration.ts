/**
 * Music Theory Integration Layer
 *
 * @deprecated This is an experimental/legacy file not currently used in production.
 * @warning This file is not integrated into the main application runtime.
 *
 * Bridges the new modular architecture with the existing system.
 * Provides backward compatibility while enabling gradual migration
 * to the new rule-based analysis engine.
 *
 * Status: EXPERIMENTAL - Referenced in docs but not imported by runtime code.
 * The production app uses direct integration with enhancedModalAnalyzer and comprehensiveAnalysisService.
 *
 * Key Features:
 * 1. Backward compatibility with existing interfaces
 * 2. Gradual migration path for existing code
 * 3. Enhanced analysis for specific problem cases
 * 4. Consistent data formats across old and new systems
 */

import {
  MusicTheoryEngine,
  MusicalContext,
  AnalysisResult,
  EnhancedChordAnalysis
} from './musicTheoryEngine';

import {
  analyzeChordProgressionLocally,
  ChordProgressionAnalysis,
  ProgressionInterpretation,
  LocalChordAnalysis
} from './localChordProgressionAnalysis';

import {
  ComprehensiveAnalysisEngine,
  ComprehensiveAnalysisResult
} from './comprehensiveAnalysisService';

// =====================================================
// INTEGRATION ADAPTER
// =====================================================

export class MusicTheoryIntegrationAdapter {
  private newEngine: MusicTheoryEngine;
  private legacyComprehensiveEngine: ComprehensiveAnalysisEngine;

  constructor() {
    this.newEngine = new MusicTheoryEngine();
    this.legacyComprehensiveEngine = new ComprehensiveAnalysisEngine();
  }

  /**
   * Enhanced chord progression analysis using new architecture
   * Falls back to legacy system if new system fails
   */
  async analyzeChordProgressionEnhanced(
    progressionInput: string,
    parentKey?: string,
    useNewEngine: boolean = true
  ): Promise<ChordProgressionAnalysis> {

    try {
      if (useNewEngine) {
        // Use new architecture for analysis
        const context: MusicalContext = {
          chordSymbols: this.parseChordProgression(progressionInput),
          parentKey
        };

        // Check if this is a known problematic case (like G F C G)
        if (this.isProblematicModalCase(context.chordSymbols)) {
          const newResult = await this.newEngine.analyzeWithModalPriority(context);
          return this.convertNewResultToLegacyFormat(newResult, progressionInput, parentKey);
        }

        // Use comprehensive analysis for general cases
        const newResult = await this.newEngine.analyzeComprehensively(context);
        return this.convertComprehensiveResultToLegacyFormat(newResult, progressionInput, parentKey);
      }
    } catch (error) {
      console.warn('New engine failed, falling back to legacy system:', error);
    }

    // Fall back to legacy system
    return await analyzeChordProgressionLocally(progressionInput, parentKey);
  }

  /**
   * Comprehensive analysis with both old and new systems for comparison
   */
  async analyzeWithComparison(
    progressionInput: string,
    parentKey?: string
  ): Promise<{
    legacy: ChordProgressionAnalysis;
    enhanced: ChordProgressionAnalysis;
    newArchitecture: {
      primary: AnalysisResult;
      alternatives: AnalysisResult[];
      consensus?: AnalysisResult;
    };
    comparison: AnalysisComparison;
  }> {

    // Run legacy analysis
    const legacyResult = await analyzeChordProgressionLocally(progressionInput, parentKey);

    // Run new architecture analysis
    const context: MusicalContext = {
      chordSymbols: this.parseChordProgression(progressionInput),
      parentKey
    };

    const newArchitectureResult = await this.newEngine.analyzeComprehensively(context);

    // Convert new result to legacy format for comparison
    const enhancedResult = this.convertComprehensiveResultToLegacyFormat(
      newArchitectureResult,
      progressionInput,
      parentKey
    );

    // Create comparison analysis
    const comparison = this.compareAnalyses(legacyResult, enhancedResult, newArchitectureResult);

    return {
      legacy: legacyResult,
      enhanced: enhancedResult,
      newArchitecture: newArchitectureResult,
      comparison
    };
  }

  /**
   * Specific fix for G F C G type progressions
   */
  async fixModalDetectionIssues(
    progressionInput: string,
    parentKey?: string
  ): Promise<ChordProgressionAnalysis> {

    const context: MusicalContext = {
      chordSymbols: this.parseChordProgression(progressionInput),
      parentKey
    };

    // Use modal priority analysis for enhanced modal detection
    const result = await this.newEngine.analyzeWithModalPriority(context);

    return this.convertNewResultToLegacyFormat(result, progressionInput, parentKey);
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private parseChordProgression(input: string): string[] {
    return input
      .replace(/\|/g, ' ')
      .split(/\s+/)
      .filter(chord => chord.trim().length > 0);
  }

  private isProblematicModalCase(chordSymbols: string[]): boolean {
    if (chordSymbols.length !== 4) return false;

    // Check for patterns known to cause issues
    const problematicPatterns = [
      ['G', 'F', 'C', 'G'],
      ['D', 'C', 'G', 'D'],
      ['A', 'G', 'D', 'A'],
      ['E', 'D', 'A', 'E']
    ];

    return problematicPatterns.some(pattern =>
      pattern.every((chord, index) => chord === chordSymbols[index])
    );
  }

  private convertNewResultToLegacyFormat(
    newResult: AnalysisResult & any, // Allow for modal-specific properties
    progressionInput: string,
    parentKey?: string
  ): ChordProgressionAnalysis {

    // Convert enhanced chord analysis to legacy format
    const legacyChords: LocalChordAnalysis[] = newResult.chords.map((chord: EnhancedChordAnalysis) => ({
      root: chord.root,
      chordName: chord.quality,
      chordSymbol: chord.symbol,
      romanNumeral: chord.romanNumeral,
      function: this.convertHarmonicFunction(chord.function),
      isModal: chord.scaleRelativity === 'modal_characteristic',
      modalCharacteristics: newResult.modalCharacteristics ?
        newResult.modalCharacteristics.map((mc: any) => ({
          movement: mc.pattern,
          modes: mc.modes,
          strength: mc.strength,
          context: mc.context
        })) : undefined
    }));

    // Create progression interpretation
    const interpretation: ProgressionInterpretation = {
      chords: legacyChords,
      keyCenter: newResult.keyCenter,
      overallMode: newResult.detectedMode || newResult.keyCenter,
      modalChords: legacyChords.filter(c => c.isModal),
      modalInterchange: this.createModalInterchangeExplanation(newResult),
      confidence: newResult.confidence,
      source: 'algorithmic', // New system is algorithmic
      explanation: newResult.explanation
    };

    return {
      method: 'progression',
      progression: progressionInput,
      localAnalysis: interpretation,
      userContextProvided: parentKey
    };
  }

  private convertComprehensiveResultToLegacyFormat(
    comprehensiveResult: {
      primaryAnalysis: AnalysisResult;
      alternativeAnalyses: AnalysisResult[];
      consensusAnalysis?: AnalysisResult;
    },
    progressionInput: string,
    parentKey?: string
  ): ChordProgressionAnalysis {

    const primaryResult = this.convertNewResultToLegacyFormat(
      comprehensiveResult.primaryAnalysis,
      progressionInput,
      parentKey
    );

    // Add alternative interpretations if they exist
    if (comprehensiveResult.alternativeAnalyses.length > 0) {
      primaryResult.alternativeInterpretations = comprehensiveResult.alternativeAnalyses.map(alt =>
        this.convertNewResultToLegacyFormat(alt, progressionInput, parentKey).localAnalysis
      );
    }

    return primaryResult;
  }

  private convertHarmonicFunction(newFunction: string): any {
    const functionMap: Record<string, string> = {
      'tonic': 'tonic',
      'predominant': 'predominant',
      'dominant': 'dominant',
      'subdominant': 'subdominant',
      'chromatic': 'other',
      'passing': 'other',
      'neighbor': 'other'
    };

    return functionMap[newFunction] || 'other';
  }

  private createModalInterchangeExplanation(result: AnalysisResult & any): string {
    if (result.modalCharacteristics && result.modalCharacteristics.length > 0) {
      const patterns = result.modalCharacteristics.map((mc: any) => mc.pattern).join(', ');
      return `Modal characteristics detected: ${patterns}`;
    }

    if (result.approach === 'modal') {
      return 'Analysis reveals modal characteristics in the progression';
    }

    return 'Standard diatonic progression';
  }

  private compareAnalyses(
    legacy: ChordProgressionAnalysis,
    enhanced: ChordProgressionAnalysis,
    newArch: any
  ): AnalysisComparison {

    const legacyRomans = legacy.localAnalysis.chords.map(c => c.romanNumeral);
    const enhancedRomans = enhanced.localAnalysis.chords.map(c => c.romanNumeral);

    const romanNumeralAgreement = legacyRomans.every((roman, index) =>
      roman === enhancedRomans[index]
    );

    const confidenceDifference = Math.abs(
      legacy.localAnalysis.confidence - enhanced.localAnalysis.confidence
    );

    const keyAgreement = legacy.localAnalysis.keyCenter === enhanced.localAnalysis.keyCenter;

    return {
      romanNumeralAgreement,
      keyAgreement,
      confidenceDifference,
      legacyConfidence: legacy.localAnalysis.confidence,
      enhancedConfidence: enhanced.localAnalysis.confidence,
      improvements: this.identifyImprovements(legacy, enhanced),
      recommendation: this.getRecommendation(romanNumeralAgreement, confidenceDifference)
    };
  }

  private identifyImprovements(
    legacy: ChordProgressionAnalysis,
    enhanced: ChordProgressionAnalysis
  ): string[] {
    const improvements: string[] = [];

    if (enhanced.localAnalysis.confidence > legacy.localAnalysis.confidence) {
      improvements.push('Higher confidence in analysis');
    }

    if (enhanced.localAnalysis.modalChords.length > legacy.localAnalysis.modalChords.length) {
      improvements.push('Better modal characteristic detection');
    }

    if (enhanced.alternativeInterpretations && enhanced.alternativeInterpretations.length > 0) {
      improvements.push('Multiple analytical perspectives provided');
    }

    return improvements;
  }

  private getRecommendation(romanAgreement: boolean, confidenceDiff: number): string {
    if (romanAgreement && confidenceDiff < 0.1) {
      return 'Both systems agree - either can be used';
    }

    if (!romanAgreement && confidenceDiff > 0.2) {
      return 'Significant differences detected - enhanced system likely more accurate';
    }

    if (confidenceDiff > 0.3) {
      return 'Enhanced system shows much higher confidence';
    }

    return 'Systems show minor differences - enhanced system recommended for completeness';
  }
}

// =====================================================
// INTERFACES
// =====================================================

export interface AnalysisComparison {
  romanNumeralAgreement: boolean;
  keyAgreement: boolean;
  confidenceDifference: number;
  legacyConfidence: number;
  enhancedConfidence: number;
  improvements: string[];
  recommendation: string;
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Enhanced drop-in replacement for analyzeChordProgressionLocally
 * Uses new architecture but maintains same interface
 */
export async function analyzeChordProgressionEnhanced(
  progressionInput: string,
  parentKey?: string
): Promise<ChordProgressionAnalysis> {
  const adapter = new MusicTheoryIntegrationAdapter();
  return await adapter.analyzeChordProgressionEnhanced(progressionInput, parentKey);
}

/**
 * Specific fix for modal detection issues
 */
export async function fixModalDetection(
  progressionInput: string,
  parentKey?: string
): Promise<ChordProgressionAnalysis> {
  const adapter = new MusicTheoryIntegrationAdapter();
  return await adapter.fixModalDetectionIssues(progressionInput, parentKey);
}

/**
 * Run comparison between old and new systems
 */
export async function compareAnalysisSystems(
  progressionInput: string,
  parentKey?: string
): Promise<{
  legacy: ChordProgressionAnalysis;
  enhanced: ChordProgressionAnalysis;
  comparison: AnalysisComparison;
}> {
  const adapter = new MusicTheoryIntegrationAdapter();
  const fullComparison = await adapter.analyzeWithComparison(progressionInput, parentKey);

  return {
    legacy: fullComparison.legacy,
    enhanced: fullComparison.enhanced,
    comparison: fullComparison.comparison
  };
}
