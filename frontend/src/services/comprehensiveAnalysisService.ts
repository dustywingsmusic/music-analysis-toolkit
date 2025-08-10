/**
 * Comprehensive Analysis Service
 * Coordinates functional harmony, modal analysis, and chromatic harmony
 *
 * Analysis Priority:
 * 1. Functional Harmony (foundation) - Roman numerals, chord functions
 * 2. Modal Analysis (enhancement) - When modal characteristics detected
 * 3. Chromatic Analysis (advanced) - Secondary dominants, borrowed chords
 */

import { FunctionalHarmonyAnalyzer, FunctionalAnalysisResult } from './functionalHarmonyAnalysis';
import { analyzeChordProgressionLocally, ProgressionInterpretation } from './localChordProgressionAnalysis';
import { EnhancedModalAnalyzer, ModalAnalysisResult } from './enhancedModalAnalyzer';

export interface ComprehensiveAnalysisResult {
  // Primary analysis (always present)
  functional: FunctionalAnalysisResult;

  // Secondary analyses (conditional)
  modal?: ModalEnhancementResult;
  chromatic?: ChromaticAnalysisResult;

  // Analysis metadata
  primaryApproach: 'functional' | 'modal' | 'chromatic';
  confidence: number;
  explanation: string;
  pedagogicalValue: string;

  // User input context (for display)
  userInput: {
    chordProgression: string;
    parentKey?: string;
    analysisType?: string;
  };
}

export interface ModalEnhancementResult {
  applicableAnalysis: ProgressionInterpretation;
  enhancedAnalysis?: ModalAnalysisResult;
  modalCharacteristics: string[];
  comparisonToFunctional: string;
  whenToUseModal: string;
}

export interface ChromaticAnalysisResult {
  secondaryDominants: SecondaryDominant[];
  borrowedChords: BorrowedChord[];
  chromaticMediants: ChromaticMediant[];
  resolutionPatterns: ResolutionPattern[];
}

export interface SecondaryDominant {
  chord: string;
  romanNumeral: string;
  target: string;
  explanation: string;
}

export interface BorrowedChord {
  chord: string;
  romanNumeral: string;
  borrowedFrom: string;
  explanation: string;
}

export interface ChromaticMediant {
  chord: string;
  relationship: string;
  explanation: string;
}

export interface ResolutionPattern {
  from: string;
  to: string;
  type: 'strong' | 'weak' | 'deceptive';
  explanation: string;
}

/**
 * Main comprehensive analysis engine
 */
export class ComprehensiveAnalysisEngine {
  private functionalAnalyzer: FunctionalHarmonyAnalyzer;
  private modalAnalyzer: EnhancedModalAnalyzer;

  constructor() {
    this.functionalAnalyzer = new FunctionalHarmonyAnalyzer();
    this.modalAnalyzer = new EnhancedModalAnalyzer();
  }

  /**
   * Analyze chord progression with comprehensive approach
   *
   * @param progressionInput - Chord symbols (e.g., "G F C G")
   * @param parentKey - Optional parent key signature (e.g., "C major")
   * @returns Comprehensive analysis with multiple perspectives
   */
  async analyzeComprehensively(
    progressionInput: string,
    parentKey?: string
  ): Promise<ComprehensiveAnalysisResult> {

    const chordSymbols = this.parseChordProgression(progressionInput);

    // Step 1: Primary functional analysis
    const functionalAnalysis = await this.functionalAnalyzer.analyzeFunctionally(chordSymbols, parentKey);

    // Step 2: Determine if modal analysis adds value
    const modalEnhancement = await this.evaluateModalEnhancement(
      progressionInput,
      functionalAnalysis,
      parentKey
    );

    // Step 3: Analyze chromatic elements in detail
    const chromaticAnalysis = this.analyzeChromaticElements(functionalAnalysis);

    // Step 4: Determine primary analytical approach
    const primaryApproach = this.determinePrimaryApproach(
      functionalAnalysis,
      modalEnhancement,
      chromaticAnalysis
    );

    // Step 5: Calculate overall confidence and create explanation
    const confidence = this.calculateOverallConfidence(functionalAnalysis, modalEnhancement);
    const explanation = this.createComprehensiveExplanation(
      functionalAnalysis,
      modalEnhancement,
      chromaticAnalysis,
      primaryApproach
    );
    const pedagogicalValue = this.createPedagogicalExplanation(primaryApproach, functionalAnalysis);

    return {
      functional: functionalAnalysis,
      modal: modalEnhancement,
      chromatic: chromaticAnalysis,
      primaryApproach,
      confidence,
      explanation,
      pedagogicalValue,
      userInput: {
        chordProgression: progressionInput,
        parentKey: parentKey,
        analysisType: 'chord_progression'
      }
    };
  }

  /**
   * Evaluate whether modal analysis adds pedagogical value
   */
  private async evaluateModalEnhancement(
    progressionInput: string,
    functionalAnalysis: FunctionalAnalysisResult,
    parentKey?: string
  ): Promise<ModalEnhancementResult | undefined> {

    const chordSymbols = this.parseChordProgression(progressionInput);

    // Try enhanced modal analysis first
    const enhancedModalAnalysis = this.modalAnalyzer.analyzeModalCharacteristics(chordSymbols, parentKey);

    // Enhanced modal analysis provides more robust detection

    // If enhanced analysis has high confidence, use it
    if (enhancedModalAnalysis && enhancedModalAnalysis.confidence >= 0.7) {
      // Also run legacy analysis for comparison
      const modalAnalysis = await analyzeChordProgressionLocally(progressionInput, parentKey);

      const comparisonToFunctional = this.compareEnhancedAnalyticalApproaches(
        functionalAnalysis,
        enhancedModalAnalysis,
        modalAnalysis.localAnalysis
      );

      return {
        applicableAnalysis: modalAnalysis.localAnalysis,
        enhancedAnalysis: enhancedModalAnalysis,
        modalCharacteristics: enhancedModalAnalysis.characteristics,
        comparisonToFunctional,
        whenToUseModal: this.explainWhenToUseEnhancedModal(enhancedModalAnalysis)
      };
    }

    // Fallback to original modal detection if enhanced analysis has low confidence
    const hasModalCharacteristics = this.detectModalCharacteristics(functionalAnalysis);

    if (!hasModalCharacteristics) {
      return undefined;
    }

    // Run modal analysis for comparison
    const modalAnalysis = await analyzeChordProgressionLocally(progressionInput, parentKey);

    // Create comparison between functional and modal approaches
    const comparisonToFunctional = this.compareAnalyticalApproaches(
      functionalAnalysis,
      modalAnalysis.localAnalysis
    );

    return {
      applicableAnalysis: modalAnalysis.localAnalysis,
      modalCharacteristics: this.identifyModalCharacteristics(functionalAnalysis),
      comparisonToFunctional,
      whenToUseModal: this.explainWhenToUseModal(functionalAnalysis)
    };
  }

  /**
   * Detect if progression has modal characteristics
   */
  private detectModalCharacteristics(functionalAnalysis: FunctionalAnalysisResult): boolean {
    const romanNumerals = functionalAnalysis.chords.map(c => c.romanNumeral).join(' ');

    // Check for characteristic modal movements
    const modalIndicators = [
      'bVII',     // Mixolydian characteristic
      'bII',      // Phrygian characteristic
      '#IV',      // Lydian characteristic
      'bVI',      // Aeolian/Dorian characteristic
      'bIII'      // Modal interchange
    ];

    return modalIndicators.some(indicator => romanNumerals.includes(indicator));
  }

  /**
   * Identify specific modal characteristics
   */
  private identifyModalCharacteristics(functionalAnalysis: FunctionalAnalysisResult): string[] {
    const characteristics: string[] = [];
    const chords = functionalAnalysis.chords;

    // Check for characteristic modal movements
    for (let i = 0; i < chords.length - 1; i++) {
      const current = chords[i].romanNumeral;
      const next = chords[i + 1].romanNumeral;

      if (current === 'bVII' && next === 'I') {
        characteristics.push('bVII-I cadence (Mixolydian characteristic)');
      }

      if (current === 'bII' && next === 'I') {
        characteristics.push('bII-I cadence (Phrygian characteristic)');
      }

      if (current.includes('#IV')) {
        characteristics.push('#IV chord (Lydian characteristic)');
      }

      if (current === 'bVI') {
        characteristics.push('bVI chord (modal interchange or natural minor)');
      }
    }

    return characteristics;
  }

  /**
   * Compare functional and modal analytical approaches
   */
  private compareAnalyticalApproaches(
    functionalAnalysis: FunctionalAnalysisResult,
    modalAnalysis: ProgressionInterpretation
  ): string {
    const functionalRomans = functionalAnalysis.chords.map(c => c.romanNumeral).join(' - ');
    const modalRomans = modalAnalysis.chords.map(c => c.romanNumeral).join(' - ');

    if (functionalRomans === modalRomans) {
      return `Both functional and modal analysis agree: ${functionalRomans}`;
    }

    return `Functional analysis: ${functionalRomans}. Modal analysis: ${modalRomans}. The functional approach emphasizes harmonic function while modal analysis highlights scale relationships.`;
  }

  /**
   * Compare functional and enhanced modal analytical approaches
   */
  private compareEnhancedAnalyticalApproaches(
    functionalAnalysis: FunctionalAnalysisResult,
    enhancedModalAnalysis: ModalAnalysisResult,
    legacyModalAnalysis: ProgressionInterpretation
  ): string {
    const functionalRomans = functionalAnalysis.chords.map(c => c.romanNumeral).join(' - ');
    const modalRomans = enhancedModalAnalysis.romanNumerals.join(' - ');

    return `Functional perspective (in ${functionalAnalysis.keyCenter}): ${functionalRomans}. Modal perspective (${enhancedModalAnalysis.modeName}): ${modalRomans}. The modal analysis better explains the structural emphasis on ${enhancedModalAnalysis.detectedTonicCenter} and characteristic modal relationships.`;
  }

  /**
   * Explain when modal analysis is most valuable
   */
  private explainWhenToUseModal(functionalAnalysis: FunctionalAnalysisResult): string {
    const hasStrongFunctionalMovement = functionalAnalysis.cadences.length > 0;
    const hasModalChords = functionalAnalysis.chords.some(c => c.isChromatic);

    if (hasStrongFunctionalMovement && !hasModalChords) {
      return "Modal analysis is less applicable here - this progression works primarily through functional harmony";
    }

    if (hasModalChords) {
      return "Modal analysis helps explain the chromatic chords and their relationship to the underlying scale";
    }

    return "Modal analysis provides an alternative perspective focusing on scale relationships rather than harmonic function";
  }

  /**
   * Explain when enhanced modal analysis is most valuable
   */
  private explainWhenToUseEnhancedModal(enhancedModalAnalysis: ModalAnalysisResult): string {
    const hasStrongStructuralEvidence = enhancedModalAnalysis.evidence.some(e =>
      e.type === 'structural' && e.strength >= 0.7
    );

    const hasCadentialEvidence = enhancedModalAnalysis.evidence.some(e =>
      e.type === 'cadential' && e.strength >= 0.8
    );

    if (hasStrongStructuralEvidence && hasCadentialEvidence) {
      return `Modal analysis is highly recommended - the progression shows strong structural emphasis on ${enhancedModalAnalysis.detectedTonicCenter} with characteristic modal cadences`;
    }

    if (hasStrongStructuralEvidence) {
      return `Modal analysis adds value - the structural pattern suggests ${enhancedModalAnalysis.detectedTonicCenter} as the tonal center rather than functional interpretation`;
    }

    if (hasCadentialEvidence) {
      return `Modal analysis helps explain the characteristic modal cadential relationships in this progression`;
    }

    return `Modal analysis provides insight into the scale-based relationships that functional analysis might not capture`;
  }

  /**
   * Analyze chromatic elements in detail
   */
  private analyzeChromaticElements(functionalAnalysis: FunctionalAnalysisResult): ChromaticAnalysisResult | undefined {
    const chromaticElements = functionalAnalysis.chromaticElements;

    if (chromaticElements.length === 0) {
      return undefined;
    }

    const secondaryDominants: SecondaryDominant[] = [];
    const borrowedChords: BorrowedChord[] = [];
    const chromaticMediants: ChromaticMediant[] = [];
    const resolutionPatterns: ResolutionPattern[] = [];

    chromaticElements.forEach(element => {
      if (element.type === 'secondary_dominant') {
        secondaryDominants.push({
          chord: element.chord.chordSymbol,
          romanNumeral: element.chord.romanNumeral,
          target: element.resolution?.romanNumeral || 'unresolved',
          explanation: element.explanation
        });

        if (element.resolution) {
          resolutionPatterns.push({
            from: element.chord.romanNumeral,
            to: element.resolution.romanNumeral,
            type: 'strong',
            explanation: `Secondary dominant resolution: ${element.chord.romanNumeral} → ${element.resolution.romanNumeral}`
          });
        }
      }

      if (element.type === 'borrowed_chord') {
        borrowedChords.push({
          chord: element.chord.chordSymbol,
          romanNumeral: element.chord.romanNumeral,
          borrowedFrom: functionalAnalysis.mode === 'major' ? 'parallel minor' : 'parallel major',
          explanation: element.explanation
        });
      }

      if (element.type === 'chromatic_mediant') {
        chromaticMediants.push({
          chord: element.chord.chordSymbol,
          relationship: 'chromatic mediant',
          explanation: element.explanation
        });
      }
    });

    return {
      secondaryDominants,
      borrowedChords,
      chromaticMediants,
      resolutionPatterns
    };
  }

  /**
   * Determine the primary analytical approach
   */
  private determinePrimaryApproach(
    functionalAnalysis: FunctionalAnalysisResult,
    modalEnhancement?: ModalEnhancementResult,
    chromaticAnalysis?: ChromaticAnalysisResult
  ): 'functional' | 'modal' | 'chromatic' {

    // If significant chromatic content, lead with chromatic analysis
    if (chromaticAnalysis && chromaticAnalysis.secondaryDominants.length > 0) {
      return 'chromatic';
    }

    // If strong modal characteristics without functional cadences, lead with modal
    if (modalEnhancement && modalEnhancement.modalCharacteristics.length > 0 && functionalAnalysis.cadences.length === 0) {
      return 'modal';
    }

    // Default to functional approach (most common)
    return 'functional';
  }

  /**
   * Calculate overall analysis confidence
   */
  private calculateOverallConfidence(
    functionalAnalysis: FunctionalAnalysisResult,
    modalEnhancement?: ModalEnhancementResult
  ): number {
    let confidence = functionalAnalysis.confidence;

    // If modal and functional analyses agree, increase confidence
    if (modalEnhancement) {
      const modalConfidence = modalEnhancement.applicableAnalysis.confidence;
      confidence = (confidence + modalConfidence) / 2;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Create comprehensive explanation combining all analyses
   */
  private createComprehensiveExplanation(
    functionalAnalysis: FunctionalAnalysisResult,
    modalEnhancement?: ModalEnhancementResult,
    chromaticAnalysis?: ChromaticAnalysisResult,
    primaryApproach: 'functional' | 'modal' | 'chromatic'
  ): string {

    let explanation = '';

    if (primaryApproach === 'functional') {
      explanation = `Primary analysis: ${functionalAnalysis.explanation}`;

      if (modalEnhancement) {
        explanation += `. Modal perspective: ${modalEnhancement.comparisonToFunctional}`;
      }

      if (chromaticAnalysis && chromaticAnalysis.secondaryDominants.length > 0) {
        explanation += `. Contains ${chromaticAnalysis.secondaryDominants.length} secondary dominant(s)`;
      }
    }

    else if (primaryApproach === 'modal') {
      explanation = `Primary analysis: Modal progression with ${modalEnhancement?.modalCharacteristics.join(', ')}`;
      explanation += `. Functional context: ${functionalAnalysis.explanation}`;
    }

    else if (primaryApproach === 'chromatic') {
      explanation = `Primary analysis: Chromatic harmony with ${chromaticAnalysis?.secondaryDominants.length} secondary dominant(s)`;
      explanation += `. Functional foundation: ${functionalAnalysis.explanation}`;
    }

    return explanation;
  }

  /**
   * Create pedagogical explanation of analytical approach
   */
  private createPedagogicalExplanation(
    primaryApproach: 'functional' | 'modal' | 'chromatic',
    functionalAnalysis: FunctionalAnalysisResult
  ): string {

    if (primaryApproach === 'functional') {
      return "This progression is best understood through functional harmony - how chords relate through tonic, predominant, and dominant functions.";
    }

    if (primaryApproach === 'modal') {
      return "This progression emphasizes modal characteristics that are better understood through scale relationships than traditional functional harmony.";
    }

    if (primaryApproach === 'chromatic') {
      return "This progression uses chromatic harmony (non-diatonic chords) that requires understanding secondary dominants and borrowed chords.";
    }

    return "This progression can be analyzed from multiple theoretical perspectives.";
  }

  /**
   * Parse chord progression string into individual chord symbols
   */
  private parseChordProgression(input: string): string[] {
    return input
      .replace(/\|/g, ' ')
      .split(/\s+/)
      .filter(chord => chord.trim().length > 0);
  }
}
