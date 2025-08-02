/**
 * Modal Analysis Engine
 * 
 * Specialized analyzer for modal characteristics using a rule-based approach.
 * Handles the specific case where modal interpretation provides better
 * theoretical understanding than functional harmony.
 * 
 * Key Features:
 * 1. Modal characteristic detection (bVII-I, bII-I, etc.)
 * 2. Parent key + local tonic model consistency
 * 3. Evidence-based confidence scoring
 * 4. Enhanced rules for problematic progressions like G F C G
 */

import { 
  AnalysisResult, 
  ChordAnalysis, 
  MusicalContext, 
  AnalysisRule, 
  RuleContext, 
  RuleResult, 
  Evidence,
  EnhancedChordAnalysis,
  EvidenceType,
  HarmonicFunction,
  ScaleRelationship,
  ContextualRole,
  RuleEngine,
  ConfidenceCalculator
} from './musicTheoryEngine';

import { NOTE_TO_PITCH_CLASS } from './localChordProgressionAnalysis';

// =====================================================
// MODAL-SPECIFIC INTERFACES
// =====================================================

export interface ModalCharacteristic {
  pattern: string; // e.g., "bVII-I", "I-bVII-IV-I"
  modes: string[]; // Which modes feature this characteristic
  strength: number; // How definitive this pattern is (0-1)
  context: ModalContext;
  description: string;
}

export type ModalContext = 'cadential' | 'structural' | 'coloristic' | 'sequential';

export interface ModalEvidence extends Evidence {
  modalCharacteristic?: ModalCharacteristic;
  intervalPattern?: number[];
  scaleRelationship?: string;
}

export interface ModalAnalysisResult extends AnalysisResult {
  parentKeySignature: string;
  localTonic: string;
  detectedMode: string;
  modalCharacteristics: ModalCharacteristic[];
  scaleFormula: string;
  scaleDegrees: string[];
}

// =====================================================
// MODAL ANALYZER IMPLEMENTATION
// =====================================================

export class ModalAnalyzer {
  private ruleEngine: RuleEngine;
  private confidenceCalculator: ConfidenceCalculator;
  private modalCharacteristics: ModalCharacteristic[];

  constructor(ruleEngine: RuleEngine) {
    this.ruleEngine = ruleEngine;
    this.confidenceCalculator = new ConfidenceCalculator();
    this.modalCharacteristics = MODAL_CHARACTERISTIC_PATTERNS;
    
    // Register modal-specific rules
    this.ruleEngine.registerRules(MODAL_ANALYSIS_RULES);
  }

  /**
   * Analyze chord progression for modal characteristics
   */
  async analyze(chords: ChordAnalysis[], context: MusicalContext): Promise<ModalAnalysisResult> {
    const ruleContext: RuleContext = {
      chords,
      parentKey: context.parentKey,
      musicalContext: context
    };

    // Apply all modal analysis rules
    const ruleResults = this.ruleEngine.evaluateRules(ruleContext, 'modal');
    
    // Determine local tonic (critical for modal analysis)
    const localTonic = this.determineLocalTonic(chords, context, ruleResults);
    
    // Determine parent key (for parent key + local tonic model)
    const parentKey = this.determineParentKey(chords, context, localTonic);
    
    // Analyze modal characteristics
    const modalCharacteristics = this.detectModalCharacteristics(chords, localTonic, parentKey);
    
    // Determine specific mode
    const detectedMode = this.determineMode(chords, localTonic, parentKey, modalCharacteristics);
    
    // Generate enhanced chord analysis with modal context
    const enhancedChords = this.enhanceChords(chords, localTonic, parentKey, detectedMode);
    
    // Collect evidence from rules and modal characteristics
    const evidence = this.collectEvidence(ruleResults, modalCharacteristics, enhancedChords);
    
    // Calculate confidence
    const confidence = this.confidenceCalculator.calculateConfidence(evidence, ruleContext);
    
    return {
      approach: 'modal',
      keyCenter: this.formatParentKeyScale(parentKey.tonic, parentKey.isMinor),
      chords: enhancedChords,
      confidence,
      evidence,
      explanation: this.createExplanation(detectedMode, modalCharacteristics, parentKey),
      metadata: {
        processingTime: 0, // Would be measured in real implementation
        rulesApplied: ruleResults.filter(r => r.applies).map(r => r.ruleId || 'unknown'),
        alternativeInterpretations: 0,
        ambiguityFactors: []
      },
      parentKeySignature: this.formatParentKeyScale(parentKey.tonic, parentKey.isMinor),
      localTonic: this.pitchToNoteName(localTonic),
      detectedMode,
      modalCharacteristics,
      scaleFormula: this.generateScaleFormula(detectedMode),
      scaleDegrees: this.generateScaleDegrees(detectedMode)
    };
  }

  /**
   * Enhanced modal analysis with specific focus on modal characteristics
   * Used for cases like G F C G where standard analysis might miss modal aspects
   */
  async analyzeWithEnhancedRules(chords: ChordAnalysis[], context: MusicalContext): Promise<ModalAnalysisResult> {
    // First run standard analysis
    const standardResult = await this.analyze(chords, context);
    
    // If confidence is already high, return standard result
    if (standardResult.confidence > 0.8) {
      return standardResult;
    }

    // Apply enhanced modal detection rules for problematic cases
    const enhancedEvidence = this.applyEnhancedModalRules(chords, context);
    
    if (enhancedEvidence.length > 0) {
      const ruleContext: RuleContext = { chords, parentKey: context.parentKey, musicalContext: context };
      const enhancedConfidence = this.confidenceCalculator.calculateConfidence(
        [...standardResult.evidence, ...enhancedEvidence], 
        ruleContext
      );

      return {
        ...standardResult,
        confidence: enhancedConfidence,
        evidence: [...standardResult.evidence, ...enhancedEvidence],
        explanation: standardResult.explanation + ' Enhanced modal detection applied for characteristic patterns.'
      };
    }

    return standardResult;
  }

  /**
   * Determine the local tonic (the note that functions as the tonal center)
   */
  private determineLocalTonic(
    chords: ChordAnalysis[], 
    context: MusicalContext, 
    ruleResults: RuleResult[]
  ): number {
    // Priority 1: Structural evidence (first/last chord emphasis)
    if (chords.length > 0) {
      const firstChord = chords[0];
      const lastChord = chords[chords.length - 1];
      
      // If first and last are the same, that's likely the tonic
      if (firstChord.root === lastChord.root) {
        return firstChord.root;
      }
      
      // If we have cadential motion ending on the same chord as we started, use that
      const cadentialMotion = this.detectCadentialMotion(chords);
      if (cadentialMotion.resolveToTonic) {
        return cadentialMotion.tonicPitch;
      }
    }

    // Priority 2: Rule-based evidence
    const tonicEvidence = ruleResults
      .filter(r => r.applies && r.evidence.some(e => e.type === 'structural_chord'))
      .sort((a, b) => b.confidence - a.confidence);
    
    if (tonicEvidence.length > 0) {
      // Extract tonic suggestion from highest confidence rule
      const tonicSuggestion = tonicEvidence[0].suggestions.find(s => s.function === 'tonic');
      if (tonicSuggestion) {
        return tonicSuggestion.chord.root;
      }
    }

    // Priority 3: Statistical frequency (chord that appears most often)
    const chordFrequency = new Map<number, number>();
    chords.forEach(chord => {
      chordFrequency.set(chord.root, (chordFrequency.get(chord.root) || 0) + 1);
    });
    
    const mostFrequent = Array.from(chordFrequency.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostFrequent ? mostFrequent[0] : chords[0]?.root || 0;
  }

  /**
   * Determine parent key using multiple methods
   */
  private determineParentKey(
    chords: ChordAnalysis[], 
    context: MusicalContext, 
    localTonic: number
  ): { tonic: string; isMinor: boolean; rootPitch: number } {
    
    // Priority 1: User-provided parent key
    if (context.parentKey) {
      const parsed = this.parseParentKey(context.parentKey);
      if (parsed) {
        return {
          tonic: parsed.tonic,
          isMinor: parsed.isMinor,
          rootPitch: NOTE_TO_PITCH_CLASS[parsed.tonic] || 0
        };
      }
    }

    // Priority 2: Analyze chord collection for most likely parent scale
    const parentKey = this.analyzeChordCollectionForParentScale(chords, localTonic);
    
    return parentKey;
  }

  /**
   * Detect modal characteristics in the progression
   */
  private detectModalCharacteristics(
    chords: ChordAnalysis[], 
    localTonic: number, 
    parentKey: { tonic: string; isMinor: boolean; rootPitch: number }
  ): ModalCharacteristic[] {
    const detectedCharacteristics: ModalCharacteristic[] = [];

    // Check each pair of adjacent chords for modal patterns
    for (let i = 0; i < chords.length - 1; i++) {
      const currentChord = chords[i];
      const nextChord = chords[i + 1];
      
      // Calculate intervals relative to local tonic
      const currentInterval = (currentChord.root - localTonic + 12) % 12;
      const nextInterval = (nextChord.root - localTonic + 12) % 12;
      
      // Check against known modal characteristics
      this.modalCharacteristics.forEach(characteristic => {
        if (this.matchesModalPattern(characteristic, currentInterval, nextInterval)) {
          detectedCharacteristics.push(characteristic);
        }
      });
    }

    // Check for extended patterns (I-bVII-IV-I, etc.)
    const extendedCharacteristics = this.detectExtendedModalPatterns(chords, localTonic);
    detectedCharacteristics.push(...extendedCharacteristics);

    return detectedCharacteristics;
  }

  /**
   * Apply enhanced modal rules for problematic progressions
   */
  private applyEnhancedModalRules(chords: ChordAnalysis[], context: MusicalContext): ModalEvidence[] {
    const evidence: ModalEvidence[] = [];
    
    // Special rule for G F C G type progressions
    if (this.isGFCGTypeProgression(chords)) {
      evidence.push({
        type: 'modal_characteristic',
        strength: 0.8,
        description: 'bVII-I motion detected in root position chords - strong Mixolydian characteristic',
        theoreticalBasis: 'The bVII chord (F in G major) moving to I (G) is a defining characteristic of Mixolydian mode',
        modalCharacteristic: {
          pattern: 'I-bVII-IV-I',
          modes: ['Mixolydian'],
          strength: 0.9,
          context: 'structural',
          description: 'Complete Mixolydian progression with characteristic bVII chord'
        }
      });
    }

    // Add other enhanced rules here
    
    return evidence;
  }

  /**
   * Check if progression matches G F C G type pattern
   */
  private isGFCGTypeProgression(chords: ChordAnalysis[]): boolean {
    if (chords.length !== 4) return false;
    
    const intervals = chords.map(chord => chord.root);
    
    // Check for pattern where:
    // 1. First and last chords are the same (tonic)
    // 2. Second chord is whole step below tonic (bVII)
    // 3. Third chord is perfect fourth above tonic (IV)
    
    const tonic = intervals[0];
    const bVII = (tonic - 2 + 12) % 12; // Whole step below
    const IV = (tonic + 5) % 12; // Perfect fourth above
    
    return intervals[0] === tonic && 
           intervals[1] === bVII && 
           intervals[2] === IV && 
           intervals[3] === tonic;
  }

  /**
   * Determine the specific mode based on analysis
   */
  private determineMode(
    chords: ChordAnalysis[], 
    localTonic: number, 
    parentKey: { tonic: string; isMinor: boolean; rootPitch: number },
    modalCharacteristics: ModalCharacteristic[]
  ): string {
    const localTonicName = this.pitchToNoteName(localTonic);
    
    // If we detected specific modal characteristics, use them
    if (modalCharacteristics.length > 0) {
      const modeFrequency = new Map<string, number>();
      
      modalCharacteristics.forEach(characteristic => {
        characteristic.modes.forEach(mode => {
          modeFrequency.set(mode, (modeFrequency.get(mode) || 0) + characteristic.strength);
        });
      });
      
      const mostLikelyMode = Array.from(modeFrequency.entries())
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostLikelyMode) {
        return `${localTonicName} ${mostLikelyMode[0]}`;
      }
    }

    // Calculate mode based on interval from parent key
    const intervalFromParent = (localTonic - parentKey.rootPitch + 12) % 12;
    const modeName = this.getModeFromInterval(intervalFromParent, parentKey.isMinor);
    
    return `${localTonicName} ${modeName}`;
  }

  /**
   * Enhance chords with modal analysis context
   */
  private enhanceChords(
    chords: ChordAnalysis[], 
    localTonic: number, 
    parentKey: { tonic: string; isMinor: boolean; rootPitch: number },
    detectedMode: string
  ): EnhancedChordAnalysis[] {
    return chords.map(chord => {
      const intervalFromTonic = (chord.root - localTonic + 12) % 12;
      const romanNumeral = this.getRomanNumeral(intervalFromTonic, parentKey.isMinor, chord.quality);
      const harmonicFunction = this.getHarmonicFunction(intervalFromTonic, chord.quality);
      const scaleRelativity = this.getScaleRelativity(intervalFromTonic, parentKey.isMinor);
      
      return {
        ...chord,
        romanNumeral,
        function: harmonicFunction,
        scaleRelativity,
        contextualRole: this.determineContextualRole(chord, chords)
      };
    });
  }

  /**
   * Generate Roman numeral for chord in modal context
   */
  private getRomanNumeral(intervalFromTonic: number, isMinor: boolean, quality: any): string {
    const scalePositions = isMinor 
      ? [0, 2, 3, 5, 7, 8, 10] // Natural minor
      : [0, 2, 4, 5, 7, 9, 11]; // Major
    
    const romanNumerals = isMinor
      ? ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
      : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

    const scaleIndex = scalePositions.indexOf(intervalFromTonic);
    
    if (scaleIndex !== -1) {
      return romanNumerals[scaleIndex];
    }

    // Handle chromatic/modal alterations
    const chromaticRomanNumerals: Record<number, string> = {
      1: '♭II',   // Neapolitan
      3: isMinor ? '♭III' : '♭III', // Modal interchange
      6: '♭V',    // Tritone substitution  
      8: '♭VI',   // Modal interchange
      10: 'bVII'  // Mixolydian characteristic
    };

    return chromaticRomanNumerals[intervalFromTonic] || `Chr${intervalFromTonic}`;
  }

  // Helper methods
  private pitchToNoteName(pitch: number): string {
    return Object.keys(NOTE_TO_PITCH_CLASS).find(name => NOTE_TO_PITCH_CLASS[name] === pitch) || 'C';
  }

  private parseParentKey(keyString: string): { tonic: string; isMinor: boolean } | null {
    const normalized = keyString.trim().toLowerCase();
    const match = normalized.match(/^([a-g][#b]?)\s*(major|minor|maj|min|m)?$/i);
    if (!match) return null;
    
    const tonic = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const quality = match[2];
    const isMinor = quality && (quality.includes('min') || quality === 'm');
    
    return { tonic, isMinor: !!isMinor };
  }

  private formatParentKeyScale(tonic: string, isMinor: boolean): string {
    // This would generate the full scale notation
    return `${tonic} ${isMinor ? 'Minor' : 'Major'}`;
  }

  private analyzeChordCollectionForParentScale(chords: ChordAnalysis[], localTonic: number): { tonic: string; isMinor: boolean; rootPitch: number } {
    // Simplified implementation - would analyze the chord collection to determine most likely parent scale
    const localTonicName = this.pitchToNoteName(localTonic);
    return {
      tonic: localTonicName,
      isMinor: false,
      rootPitch: localTonic
    };
  }

  private detectCadentialMotion(chords: ChordAnalysis[]): { resolveToTonic: boolean; tonicPitch: number } {
    // Simplified cadence detection
    return { resolveToTonic: false, tonicPitch: 0 };
  }

  private matchesModalPattern(characteristic: ModalCharacteristic, currentInterval: number, nextInterval: number): boolean {
    // This would implement pattern matching for modal characteristics
    if (characteristic.pattern === 'bVII-I') {
      return currentInterval === 10 && nextInterval === 0; // bVII to I
    }
    // Add other patterns
    return false;
  }

  private detectExtendedModalPatterns(chords: ChordAnalysis[], localTonic: number): ModalCharacteristic[] {
    // Detect longer modal patterns
    return [];
  }

  private getModeFromInterval(interval: number, isParentMinor: boolean): string {
    if (!isParentMinor) {
      const majorModes: Record<number, string> = {
        0: 'Ionian',
        2: 'Dorian', 
        4: 'Phrygian',
        5: 'Lydian',
        7: 'Mixolydian',
        9: 'Aeolian',
        11: 'Locrian'
      };
      return majorModes[interval] || 'Unknown';
    } else {
      const minorModes: Record<number, string> = {
        0: 'Aeolian',
        2: 'Locrian',
        3: 'Ionian', 
        5: 'Dorian',
        7: 'Phrygian',
        8: 'Lydian',
        10: 'Mixolydian'
      };
      return minorModes[interval] || 'Unknown';
    }
  }

  private getHarmonicFunction(intervalFromTonic: number, quality: any): HarmonicFunction {
    // Determine harmonic function in modal context
    if (intervalFromTonic === 0) return 'tonic';
    if (intervalFromTonic === 7) return 'dominant';
    if ([2, 5].includes(intervalFromTonic)) return 'predominant';
    if (intervalFromTonic === 5) return 'subdominant';
    return 'chromatic';
  }

  private getScaleRelativity(intervalFromTonic: number, isMinor: boolean): ScaleRelationship {
    const diatonicIntervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
    
    if (diatonicIntervals.includes(intervalFromTonic)) {
      return 'diatonic';
    }
    
    // Check for modal characteristics
    if (intervalFromTonic === 10) return 'modal_characteristic'; // bVII
    if (intervalFromTonic === 1) return 'modal_characteristic';  // bII
    
    return 'chromatic';
  }

  private determineContextualRole(chord: ChordAnalysis, allChords: ChordAnalysis[]): ContextualRole {
    // Determine the chord's role in the overall progression
    return 'structural'; // Simplified
  }

  private collectEvidence(ruleResults: RuleResult[], modalCharacteristics: ModalCharacteristic[], chords: EnhancedChordAnalysis[]): Evidence[] {
    const evidence: Evidence[] = [];
    
    // Evidence from rules
    ruleResults.forEach(result => {
      if (result.applies) {
        evidence.push(...result.evidence);
      }
    });
    
    // Evidence from modal characteristics
    modalCharacteristics.forEach(characteristic => {
      evidence.push({
        type: 'modal_characteristic',
        strength: characteristic.strength,
        description: `${characteristic.pattern} - ${characteristic.description}`,
        theoreticalBasis: `Characteristic pattern of ${characteristic.modes.join(', ')} mode(s)`
      });
    });
    
    return evidence;
  }

  private createExplanation(detectedMode: string, modalCharacteristics: ModalCharacteristic[], parentKey: any): string {
    let explanation = `Modal analysis identifies ${detectedMode}`;
    
    if (modalCharacteristics.length > 0) {
      const patterns = modalCharacteristics.map(c => c.pattern).join(', ');
      explanation += ` with characteristic patterns: ${patterns}`;
    }
    
    explanation += `. Parent key: ${parentKey.tonic} ${parentKey.isMinor ? 'minor' : 'major'}.`;
    
    return explanation;
  }

  private generateScaleFormula(mode: string): string {
    // Generate interval formula for the mode
    return '1 2 3 4 5 6 7'; // Simplified
  }

  private generateScaleDegrees(mode: string): string[] {
    // Generate scale degree names for the mode
    return ['1', '2', '3', '4', '5', '6', '7']; // Simplified
  }
}

// =====================================================
// MODAL CHARACTERISTIC PATTERNS
// =====================================================

export const MODAL_CHARACTERISTIC_PATTERNS: ModalCharacteristic[] = [
  {
    pattern: 'bVII-I',
    modes: ['Mixolydian', 'Dorian', 'Aeolian'],
    strength: 0.9,
    context: 'cadential',
    description: 'Flatted seventh resolving to tonic - primary Mixolydian cadence'
  },
  {
    pattern: 'I-bVII',
    modes: ['Mixolydian'],
    strength: 0.8,
    context: 'structural',
    description: 'Tonic to flatted seventh movement - Mixolydian color'
  },
  {
    pattern: 'I-bVII-IV-I',
    modes: ['Mixolydian'],
    strength: 0.95,
    context: 'structural',
    description: 'Complete Mixolydian progression with characteristic bVII'
  },
  {
    pattern: 'bII-I',
    modes: ['Phrygian'],
    strength: 0.95,
    context: 'cadential', 
    description: 'Phrygian half-step cadence - defining Phrygian characteristic'
  },
  {
    pattern: 'i-bII-bIII-i',
    modes: ['Phrygian'],
    strength: 0.9,
    context: 'structural',
    description: 'Phrygian progression emphasizing characteristic bII degree'
  },
  {
    pattern: 'I-II-bIII-I',
    modes: ['Dorian'],
    strength: 0.85,
    context: 'structural',
    description: 'Dorian progression with raised second degree'
  },
  {
    pattern: '#IV-V',
    modes: ['Lydian'],
    strength: 0.9,
    context: 'coloristic',
    description: 'Lydian raised fourth resolving to fifth'
  },
  {
    pattern: 'I-#IV-V-I',
    modes: ['Lydian'],
    strength: 0.9,
    context: 'structural',
    description: 'Lydian progression featuring characteristic #IV degree'
  }
];

// =====================================================
// MODAL ANALYSIS RULES
// =====================================================

export const MODAL_ANALYSIS_RULES: AnalysisRule[] = [
  {
    id: 'modal_cadence_detection',
    name: 'Modal Cadence Detection',
    description: 'Detects characteristic modal cadences like bVII-I and bII-I',
    priority: 10,
    applicableApproaches: ['modal'],
    evaluate: (context: RuleContext): RuleResult => {
      const evidence: Evidence[] = [];
      let confidence = 0;
      
      // Check for modal cadences
      for (let i = 0; i < context.chords.length - 1; i++) {
        const current = context.chords[i];
        const next = context.chords[i + 1];
        
        // Simplified check for bVII-I motion
        const interval = (next.root - current.root + 12) % 12;
        if (interval === 2) { // Whole step up (bVII to I)
          evidence.push({
            type: 'modal_characteristic',
            strength: 0.9,
            description: 'bVII-I cadential motion detected',
            theoreticalBasis: 'Primary characteristic of Mixolydian mode'
          });
          confidence = 0.9;
        }
      }
      
      return {
        applies: evidence.length > 0,
        confidence,
        evidence,
        suggestions: []
      };
    }
  },
  
  {
    id: 'structural_modal_pattern',
    name: 'Structural Modal Pattern Recognition',
    description: 'Identifies extended modal patterns like I-bVII-IV-I',
    priority: 9,
    applicableApproaches: ['modal'],
    evaluate: (context: RuleContext): RuleResult => {
      const evidence: Evidence[] = [];
      let confidence = 0;
      
      // Check for G F C G type pattern (I-bVII-IV-I in any key)
      if (context.chords.length === 4) {
        const intervals = context.chords.map(chord => chord.root);
        const tonic = intervals[0];
        
        // Check if pattern matches I-bVII-IV-I
        const expectedPattern = [
          tonic,                    // I
          (tonic - 2 + 12) % 12,   // bVII
          (tonic + 5) % 12,        // IV
          tonic                     // I
        ];
        
        if (intervals.every((interval, index) => interval === expectedPattern[index])) {
          evidence.push({
            type: 'modal_characteristic',
            strength: 0.95,
            description: 'I-bVII-IV-I structural pattern detected',
            theoreticalBasis: 'Classic Mixolydian progression pattern'
          });
          confidence = 0.95;
        }
      }
      
      return {
        applies: evidence.length > 0,
        confidence,
        evidence,
        suggestions: []
      };
    }
  }
];