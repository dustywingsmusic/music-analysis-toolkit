/**
 * Music Theory Analysis Engine
 *
 * @deprecated This is an experimental/legacy file not currently used in production.
 * @warning This file is not integrated into the main application runtime.
 *
 * A comprehensive, modular, and extensible architecture for music theory analysis.
 * Uses a rule-based system with confidence scoring for multiple analytical perspectives.
 *
 * Status: EXPERIMENTAL - Not wired to UI components, used only in tests and documentation.
 * The production app uses enhancedModalAnalyzer.ts and comprehensiveAnalysisService.ts instead.
 *
 * Key Design Principles:
 * 1. Separation of Concerns - Each analyzer handles one theoretical approach
 * 2. Rule-Based Logic - Extensible rules rather than hardcoded conditionals
 * 3. Confidence-Weighted Results - Multiple interpretations with calculated confidence
 * 4. Testable Components - Each component can be tested in isolation
 * 5. Consistent Data Models - Unified interfaces across all analyzers
 */

import { NOTE_TO_PITCH_CLASS } from './localChordProgressionAnalysis';

// =====================================================
// CORE DATA MODELS
// =====================================================

export interface MusicalContext {
  chordSymbols: string[];
  parentKey?: string;
  tempo?: number;
  timeSignature?: string;
  genre?: string;
}

export interface ChordAnalysis {
  symbol: string;
  root: number;
  quality: ChordQuality;
  intervals: number[];
  bassNote?: number;
  extensions: string[];
}

export interface AnalysisResult {
  approach: AnalyticalApproach;
  keyCenter: string;
  chords: EnhancedChordAnalysis[];
  confidence: number;
  evidence: Evidence[];
  explanation: string;
  metadata: AnalysisMetadata;
}

export interface EnhancedChordAnalysis extends ChordAnalysis {
  romanNumeral: string;
  function: HarmonicFunction;
  scaleRelativity: ScaleRelationship;
  contextualRole: ContextualRole;
  voiceLeadingStrength?: number;
}

export type AnalyticalApproach = 'functional' | 'modal' | 'chromatic' | 'jazz' | 'atonal';
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7' | 'half_diminished' | 'fully_diminished' | 'sus2' | 'sus4';
export type HarmonicFunction = 'tonic' | 'predominant' | 'dominant' | 'subdominant' | 'chromatic' | 'passing' | 'neighbor';
export type ScaleRelationship = 'diatonic' | 'chromatic' | 'modal_characteristic' | 'borrowed' | 'secondary_function';
export type ContextualRole = 'structural' | 'ornamental' | 'transitional' | 'cadential' | 'prolongational';

export interface Evidence {
  type: EvidenceType;
  strength: number; // 0-1
  description: string;
  musicalPattern?: string;
  theoreticalBasis?: string;
}

export type EvidenceType =
  | 'structural_chord'
  | 'cadential_motion'
  | 'voice_leading'
  | 'modal_characteristic'
  | 'chromatic_pattern'
  | 'functional_progression'
  | 'statistical_frequency'
  | 'contextual_expectation';

export interface AnalysisMetadata {
  processingTime: number;
  rulesApplied: string[];
  alternativeInterpretations: number;
  ambiguityFactors: string[];
}

// =====================================================
// RULE ENGINE INTERFACES
// =====================================================

export interface AnalysisRule {
  id: string;
  name: string;
  description: string;
  priority: number; // Higher = more important
  applicableApproaches: AnalyticalApproach[];
  evaluate(context: RuleContext): RuleResult;
}

export interface RuleContext {
  chords: ChordAnalysis[];
  currentIndex?: number;
  parentKey?: string;
  musicalContext?: MusicalContext;
  previousResults?: AnalysisResult[];
}

export interface RuleResult {
  applies: boolean;
  confidence: number;
  evidence: Evidence[];
  suggestions: RuleSuggestion[];
}

export interface RuleSuggestion {
  chord: ChordAnalysis;
  romanNumeral?: string;
  function?: HarmonicFunction;
  scaleRelativity?: ScaleRelationship;
  explanation: string;
}

// =====================================================
// MAIN MUSIC THEORY ENGINE
// =====================================================

export class MusicTheoryEngine {
  private ruleEngine: RuleEngine;
  private functionalAnalyzer: FunctionalHarmonyAnalyzer;
  private modalAnalyzer: ModalAnalyzer;
  private chromaticAnalyzer: ChromaticHarmonyAnalyzer;
  private confidenceCalculator: ConfidenceCalculator;

  constructor() {
    this.ruleEngine = new RuleEngine();
    this.functionalAnalyzer = new FunctionalHarmonyAnalyzer(this.ruleEngine);
    this.modalAnalyzer = new ModalAnalyzer(this.ruleEngine);
    this.chromaticAnalyzer = new ChromaticHarmonyAnalyzer(this.ruleEngine);
    this.confidenceCalculator = new ConfidenceCalculator();

    this.initializeRules();
  }

  /**
   * Analyze musical input with multiple theoretical perspectives
   */
  async analyzeComprehensively(context: MusicalContext): Promise<{
    primaryAnalysis: AnalysisResult;
    alternativeAnalyses: AnalysisResult[];
    consensusAnalysis?: AnalysisResult;
  }> {
    const startTime = performance.now();

    try {
      // Parse and validate input
      const chords = this.parseChords(context.chordSymbols);

      // Run all analyzers in parallel
      const [functionalResult, modalResult, chromaticResult] = await Promise.all([
        this.functionalAnalyzer.analyze(chords, context),
        this.modalAnalyzer.analyze(chords, context),
        this.chromaticAnalyzer.analyze(chords, context)
      ]);

      // Collect all analyses
      const allAnalyses = [functionalResult, modalResult, chromaticResult]
        .filter(result => result.confidence > 0.3); // Filter out low-confidence results

      // Sort by confidence
      allAnalyses.sort((a, b) => b.confidence - a.confidence);

      // Determine primary analysis
      const primaryAnalysis = allAnalyses[0];
      const alternativeAnalyses = allAnalyses.slice(1);

      // Create consensus analysis if multiple high-confidence results exist
      const consensusAnalysis = this.createConsensusAnalysis(allAnalyses);

      return {
        primaryAnalysis,
        alternativeAnalyses,
        consensusAnalysis
      };

    } catch (error) {
      console.error('Music theory analysis failed:', error);
      throw new AnalysisError('Failed to analyze musical input', error);
    }
  }

  /**
   * Focused analysis for specific issues like G F C G modal detection
   */
  async analyzeWithModalPriority(context: MusicalContext): Promise<AnalysisResult> {
    const chords = this.parseChords(context.chordSymbols);

    // Use modal analyzer with enhanced rules for modal characteristic detection
    const modalResult = await this.modalAnalyzer.analyzeWithEnhancedRules(chords, context);

    if (modalResult.confidence > 0.7) {
      return modalResult;
    }

    // Fall back to comprehensive analysis
    const comprehensive = await this.analyzeComprehensively(context);
    return comprehensive.primaryAnalysis;
  }

  /**
   * Parse chord symbols into structured chord analysis objects
   */
  private parseChords(chordSymbols: string[]): ChordAnalysis[] {
    return chordSymbols.map(symbol => this.parseChordSymbol(symbol));
  }

  private parseChordSymbol(symbol: string): ChordAnalysis {
    // Enhanced chord parsing with support for complex chord symbols
    const rootMatch = symbol.match(/^([A-G][#b]?)/);
    if (!rootMatch) {
      throw new Error(`Invalid chord symbol: ${symbol}`);
    }

    const rootNote = rootMatch[1];
    const rootPitch = NOTE_TO_PITCH_CLASS[rootNote];
    if (rootPitch === undefined) {
      throw new Error(`Unknown root note: ${rootNote}`);
    }

    const remainder = symbol.slice(rootNote.length);
    const quality = this.parseChordQuality(remainder);
    const intervals = this.getIntervalsForQuality(quality);
    const extensions = this.parseExtensions(remainder);

    return {
      symbol,
      root: rootPitch,
      quality,
      intervals,
      extensions
    };
  }

  private parseChordQuality(chordSuffix: string): ChordQuality {
    const suffix = chordSuffix.toLowerCase().trim();

    // Order matters - check more specific patterns first
    if (suffix.includes('maj7') || suffix.includes('M7')) return 'major7';
    if (suffix.includes('m7') || suffix.includes('min7')) return 'minor7';
    if (suffix.includes('7') && !suffix.includes('maj') && !suffix.includes('m')) return 'dominant7';
    if (suffix.includes('dim') || suffix.includes('°')) return 'diminished';
    if (suffix.includes('aug') || suffix.includes('+')) return 'augmented';
    if (suffix.includes('sus4')) return 'sus4';
    if (suffix.includes('sus2')) return 'sus2';
    if (suffix.includes('m') && !suffix.includes('maj')) return 'minor';

    return 'major'; // Default
  }

  private getIntervalsForQuality(quality: ChordQuality): number[] {
    const intervalMap: Record<ChordQuality, number[]> = {
      'major': [0, 4, 7],
      'minor': [0, 3, 7],
      'diminished': [0, 3, 6],
      'augmented': [0, 4, 8],
      'dominant7': [0, 4, 7, 10],
      'major7': [0, 4, 7, 11],
      'minor7': [0, 3, 7, 10],
      'half_diminished': [0, 3, 6, 10],
      'fully_diminished': [0, 3, 6, 9],
      'sus2': [0, 2, 7],
      'sus4': [0, 5, 7]
    };

    return intervalMap[quality] || [0, 4, 7];
  }

  private parseExtensions(chordSuffix: string): string[] {
    const extensions: string[] = [];

    // Look for common extensions
    if (chordSuffix.includes('9')) extensions.push('9');
    if (chordSuffix.includes('11')) extensions.push('11');
    if (chordSuffix.includes('13')) extensions.push('13');
    if (chordSuffix.includes('add9')) extensions.push('add9');
    if (chordSuffix.includes('6')) extensions.push('6');

    return extensions;
  }

  private createConsensusAnalysis(analyses: AnalysisResult[]): AnalysisResult | undefined {
    if (analyses.length < 2) return undefined;

    // Look for agreements between different analytical approaches
    const agreements = this.findAnalyticalAgreements(analyses);

    if (agreements.length > 0) {
      // Create a consensus analysis based on common elements
      return this.synthesizeConsensus(analyses, agreements);
    }

    return undefined;
  }

  private findAnalyticalAgreements(analyses: AnalysisResult[]): string[] {
    // Implementation would compare Roman numerals, key centers, functions, etc.
    // This is a simplified version
    const agreements: string[] = [];

    // Check if all analyses agree on key center
    const keyCenter = analyses[0].keyCenter;
    if (analyses.every(a => a.keyCenter === keyCenter)) {
      agreements.push('key_center');
    }

    // Check for Roman numeral agreement
    const firstRomanNumerals = analyses[0].chords.map(c => c.romanNumeral);
    if (analyses.some(a =>
      a.chords.map(c => c.romanNumeral).join('') === firstRomanNumerals.join('')
    )) {
      agreements.push('roman_numerals');
    }

    return agreements;
  }

  private synthesizeConsensus(analyses: AnalysisResult[], agreements: string[]): AnalysisResult {
    // Synthesize a consensus analysis from common elements
    const primary = analyses[0];

    return {
      approach: 'functional', // Default to functional as baseline
      keyCenter: primary.keyCenter,
      chords: primary.chords,
      confidence: this.confidenceCalculator.calculateConsensusConfidence(analyses),
      evidence: this.mergeEvidence(analyses),
      explanation: this.createConsensusExplanation(analyses, agreements),
      metadata: {
        processingTime: Math.max(...analyses.map(a => a.metadata.processingTime)),
        rulesApplied: [...new Set(analyses.flatMap(a => a.metadata.rulesApplied))],
        alternativeInterpretations: analyses.length,
        ambiguityFactors: []
      }
    };
  }

  private mergeEvidence(analyses: AnalysisResult[]): Evidence[] {
    // Combine and deduplicate evidence from all analyses
    const allEvidence = analyses.flatMap(a => a.evidence);
    const evidenceMap = new Map<string, Evidence>();

    allEvidence.forEach(evidence => {
      const key = `${evidence.type}-${evidence.description}`;
      if (!evidenceMap.has(key) || evidenceMap.get(key)!.strength < evidence.strength) {
        evidenceMap.set(key, evidence);
      }
    });

    return Array.from(evidenceMap.values()).sort((a, b) => b.strength - a.strength);
  }

  private createConsensusExplanation(analyses: AnalysisResult[], agreements: string[]): string {
    const approaches = analyses.map(a => a.approach).join(', ');
    const agreeText = agreements.length > 0 ? ` with consensus on ${agreements.join(', ')}` : '';

    return `Consensus analysis from ${approaches} approaches${agreeText}. Primary interpretation based on highest confidence analysis.`;
  }

  private initializeRules(): void {
    // Register all analysis rules with the rule engine
    this.ruleEngine.registerRules([
      ...FUNCTIONAL_HARMONY_RULES,
      ...MODAL_ANALYSIS_RULES,
      ...CHROMATIC_HARMONY_RULES,
      ...VOICE_LEADING_RULES,
      ...CADENCE_DETECTION_RULES
    ]);
  }
}

// =====================================================
// RULE ENGINE IMPLEMENTATION
// =====================================================

export class RuleEngine {
  private rules: Map<string, AnalysisRule> = new Map();

  registerRule(rule: AnalysisRule): void {
    this.rules.set(rule.id, rule);
  }

  registerRules(rules: AnalysisRule[]): void {
    rules.forEach(rule => this.registerRule(rule));
  }

  evaluateRules(context: RuleContext, approach: AnalyticalApproach): RuleResult[] {
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.applicableApproaches.includes(approach))
      .sort((a, b) => b.priority - a.priority);

    return applicableRules.map(rule => ({
      ...rule.evaluate(context),
      ruleId: rule.id
    }));
  }

  getRulesByType(approach: AnalyticalApproach): AnalysisRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.applicableApproaches.includes(approach));
  }
}

// =====================================================
// CONFIDENCE CALCULATION SYSTEM
// =====================================================

export class ConfidenceCalculator {
  /**
   * Calculate confidence for an analysis result based on evidence
   */
  calculateConfidence(evidence: Evidence[], context: RuleContext): number {
    if (evidence.length === 0) return 0.1;

    // Base confidence from evidence strength
    const evidenceConfidence = evidence.reduce((sum, e) => sum + e.strength, 0) / evidence.length;

    // Structural bonuses
    const structuralBonus = this.calculateStructuralBonus(context);

    // Consistency bonus (if multiple pieces of evidence support same conclusion)
    const consistencyBonus = this.calculateConsistencyBonus(evidence);

    // Penalty for ambiguity
    const ambiguityPenalty = this.calculateAmbiguityPenalty(evidence);

    let confidence = evidenceConfidence + structuralBonus + consistencyBonus - ambiguityPenalty;

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  calculateConsensusConfidence(analyses: AnalysisResult[]): number {
    if (analyses.length === 0) return 0;

    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
    const consensusBonus = analyses.length > 1 ? 0.1 : 0;

    return Math.min(1, avgConfidence + consensusBonus);
  }

  private calculateStructuralBonus(context: RuleContext): number {
    let bonus = 0;

    // First and last chord same (strong structural evidence)
    if (context.chords.length > 1) {
      const first = context.chords[0];
      const last = context.chords[context.chords.length - 1];
      if (first.root === last.root && first.quality === last.quality) {
        bonus += 0.15;
      }
    }

    // Parent key provided (user context)
    if (context.parentKey) {
      bonus += 0.1;
    }

    return bonus;
  }

  private calculateConsistencyBonus(evidence: Evidence[]): number {
    // Count evidence types that appear multiple times
    const evidenceTypeCounts = new Map<EvidenceType, number>();

    evidence.forEach(e => {
      evidenceTypeCounts.set(e.type, (evidenceTypeCounts.get(e.type) || 0) + 1);
    });

    const consistentTypes = Array.from(evidenceTypeCounts.values()).filter(count => count > 1);
    return consistentTypes.length * 0.05;
  }

  private calculateAmbiguityPenalty(evidence: Evidence[]): number {
    // Penalty for conflicting evidence
    const evidenceTypes = new Set(evidence.map(e => e.type));

    // If we have both functional and modal evidence, there's some ambiguity
    const hasConflictingTypes = evidenceTypes.has('functional_progression') &&
                               evidenceTypes.has('modal_characteristic');

    return hasConflictingTypes ? 0.1 : 0;
  }
}

// =====================================================
// ERROR HANDLING
// =====================================================

export class AnalysisError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// =====================================================
// RULE DEFINITIONS (to be defined in separate files)
// =====================================================

// These would be imported from separate rule definition files
export const FUNCTIONAL_HARMONY_RULES: AnalysisRule[] = [];
export const MODAL_ANALYSIS_RULES: AnalysisRule[] = [];
export const CHROMATIC_HARMONY_RULES: AnalysisRule[] = [];
export const VOICE_LEADING_RULES: AnalysisRule[] = [];
export const CADENCE_DETECTION_RULES: AnalysisRule[] = [];

// These analyzer classes would be implemented in separate files
export class FunctionalHarmonyAnalyzer {
  constructor(private ruleEngine: RuleEngine) {}

  async analyze(chords: ChordAnalysis[], context: MusicalContext): Promise<AnalysisResult> {
    // Implementation would use rule engine to analyze functional harmony
    throw new Error('Not implemented - see functionalHarmonyAnalyzer.ts');
  }
}

export class ModalAnalyzer {
  constructor(private ruleEngine: RuleEngine) {}

  async analyze(chords: ChordAnalysis[], context: MusicalContext): Promise<AnalysisResult> {
    // Implementation would use rule engine to analyze modal characteristics
    throw new Error('Not implemented - see modalAnalyzer.ts');
  }

  async analyzeWithEnhancedRules(chords: ChordAnalysis[], context: MusicalContext): Promise<AnalysisResult> {
    // Enhanced modal analysis with specific focus on modal characteristics
    throw new Error('Not implemented - see modalAnalyzer.ts');
  }
}

export class ChromaticHarmonyAnalyzer {
  constructor(private ruleEngine: RuleEngine) {}

  async analyze(chords: ChordAnalysis[], context: MusicalContext): Promise<AnalysisResult> {
    // Implementation would use rule engine to analyze chromatic harmony
    throw new Error('Not implemented - see chromaticHarmonyAnalyzer.ts');
  }
}
