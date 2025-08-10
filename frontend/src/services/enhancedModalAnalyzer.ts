/**
 * Enhanced Modal Analyzer
 * Implements robust modal detection with confidence-based analysis
 *
 * Key Improvements:
 * - Structural pattern recognition (I-bVII-IV-I, etc.)
 * - Tonal center weighting (first/last chord emphasis)
 * - Modal characteristic detection (bVII-I, bII-I cadences)
 * - Evidence-based confidence scoring
 */

import { NOTE_TO_PITCH_CLASS } from './localChordProgressionAnalysis';

export interface ModalAnalysisResult {
  detectedTonicCenter: string;
  parentKeySignature: string;
  modeName: string;
  romanNumerals: string[];
  confidence: number;
  evidence: ModalEvidence[];
  characteristics: string[];
}

export interface ModalEvidence {
  type: 'structural' | 'cadential' | 'intervallic' | 'contextual';
  description: string;
  strength: number; // 0.0 to 1.0
}

interface ModalPattern {
  pattern: string;
  modes: string[];
  strength: number;
  context: 'structural' | 'cadential';
}

interface ChordAnalysis {
  symbol: string;
  root: string;
  quality: string;
  pitchClass: number;
}

/**
 * Enhanced Modal Analyzer Class
 */
export class EnhancedModalAnalyzer {

  // Functional patterns that should NOT be detected as modal
  private readonly FUNCTIONAL_PATTERNS: Array<{pattern: string, strength: number, type: string}> = [
    { pattern: 'I-V-I', strength: 0.95, type: 'authentic_cadence' },
    { pattern: 'I-IV-V-I', strength: 0.95, type: 'functional_progression' },
    { pattern: 'I-vi-IV-V', strength: 0.90, type: 'pop_progression' },
    { pattern: 'vi-IV-I-V', strength: 0.90, type: 'pop_progression' },
    { pattern: 'ii-V-I', strength: 0.85, type: 'jazz_cadence' },
    { pattern: 'IV-V-I', strength: 0.90, type: 'plagal_cadence' },
    { pattern: 'V-I', strength: 0.85, type: 'dominant_resolution' },
    // Additional functional patterns
    { pattern: 'vi-V-I', strength: 0.85, type: 'deceptive_resolution' },
    { pattern: 'I-vi-ii-V', strength: 0.88, type: 'circle_progression' },
    { pattern: 'I-ii-V-I', strength: 0.90, type: 'extended_functional' },
    { pattern: 'IV-I-V-I', strength: 0.85, type: 'plagal_functional' }
  ];

  // Known modal characteristic patterns
  private readonly MODAL_PATTERNS: ModalPattern[] = [
    // Ionian patterns (major tonic with standard progressions)
    { pattern: 'I-IV-I', modes: ['Ionian'], strength: 0.80, context: 'structural' },
    { pattern: 'I-IV', modes: ['Ionian'], strength: 0.75, context: 'structural' }, // Vamp pattern - boosted
    { pattern: 'I-vi-IV-V', modes: ['Ionian'], strength: 0.75, context: 'structural' },

    // Additional Dorian patterns (discriminate from other modes)
    { pattern: 'i-IV', modes: ['Dorian'], strength: 0.80, context: 'structural' }, // Dorian vamp

    // Mixolydian patterns (major tonic with bVII)
    { pattern: 'I-bVII-IV-I', modes: ['Mixolydian'], strength: 0.95, context: 'structural' },
    { pattern: 'I-bVII-I', modes: ['Mixolydian'], strength: 0.90, context: 'structural' },
    { pattern: 'bVII-I', modes: ['Mixolydian'], strength: 0.85, context: 'cadential' },
    { pattern: 'I-IV-bVII-I', modes: ['Mixolydian'], strength: 0.88, context: 'structural' },
    { pattern: 'I-bVII-IV', modes: ['Mixolydian'], strength: 0.82, context: 'structural' },

    // Dorian patterns (minor tonic with major IV - key discriminator)
    { pattern: 'i-IV-i', modes: ['Dorian'], strength: 0.90, context: 'structural' },
    { pattern: 'i-IV-bVII-i', modes: ['Dorian'], strength: 0.95, context: 'structural' },
    { pattern: 'i-bVII-IV-i', modes: ['Dorian'], strength: 0.95, context: 'structural' },
    { pattern: 'i-IV-bVII', modes: ['Dorian'], strength: 0.85, context: 'structural' },
    { pattern: 'IV-i', modes: ['Dorian'], strength: 0.80, context: 'cadential' },

    // Phrygian patterns (minor tonic with bII - very distinctive)
    { pattern: 'i-bII-i', modes: ['Phrygian'], strength: 0.95, context: 'structural' },
    { pattern: 'bII-i', modes: ['Phrygian'], strength: 0.90, context: 'cadential' },
    { pattern: 'i-bII-bVII-i', modes: ['Phrygian'], strength: 0.95, context: 'structural' },
    { pattern: 'i-bII-bVII', modes: ['Phrygian'], strength: 0.88, context: 'structural' },

    // Lydian patterns (major tonic with II or #IV - distinctive)
    { pattern: 'I-II-I', modes: ['Lydian'], strength: 0.90, context: 'structural' },
    { pattern: 'I-#IV-I', modes: ['Lydian'], strength: 0.95, context: 'structural' },
    { pattern: 'I-II-V-I', modes: ['Lydian'], strength: 0.92, context: 'structural' },
    { pattern: 'I-II-I-II', modes: ['Lydian'], strength: 0.88, context: 'structural' },

    // Aeolian patterns (natural minor - minor tonic with minor iv)
    { pattern: 'i-bVI-bVII-i', modes: ['Aeolian'], strength: 0.90, context: 'structural' },
    { pattern: 'i-bVII-iv-i', modes: ['Aeolian'], strength: 0.95, context: 'structural' },
    { pattern: 'i-bVII-bVI-i', modes: ['Aeolian'], strength: 0.88, context: 'structural' },
    { pattern: 'i-iv-bVII-i', modes: ['Aeolian'], strength: 0.92, context: 'structural' },
    { pattern: 'i-bVI-iv-i', modes: ['Aeolian'], strength: 0.85, context: 'structural' },
    { pattern: 'bVII-i', modes: ['Aeolian'], strength: 0.80, context: 'cadential' },

    // Locrian patterns (diminished tonic with bII - very rare but distinctive)
    { pattern: 'i°-bII-i°', modes: ['Locrian'], strength: 0.95, context: 'structural' },
    { pattern: 'i°-bII-v-i°', modes: ['Locrian'], strength: 0.95, context: 'structural' },
    { pattern: 'bII-i°', modes: ['Locrian'], strength: 0.90, context: 'cadential' }
  ];

  /**
   * Analyze chord progression for modal characteristics
   */
  public analyzeModalCharacteristics(
    chordSymbols: string[],
    parentKey?: string
  ): ModalAnalysisResult | null {

    // Handle edge cases first
    if (chordSymbols.length === 0) return null;

    // FUNCTIONAL HARMONY PRE-SCREENING
    // Check if this is a clear functional progression before modal analysis
    if (parentKey) {
      const functionalRomanNumerals = this.generateFunctionalRomanNumerals(chordSymbols, parentKey);
      if (functionalRomanNumerals) {
        const functionalStrength = this.detectFunctionalPatterns(functionalRomanNumerals);
        if (functionalStrength > 0.8) {
          return null; // Block modal analysis for clear functional progressions
        }
      }
    }

    if (chordSymbols.length === 1) {
      // Single chord - not enough for modal analysis
      return null;
    }

    if (chordSymbols.every(chord => chord === chordSymbols[0])) {
      // All same chord - static harmony, not modal
      return null;
    }

    // Allow two-chord progressions for vamp patterns
    if (chordSymbols.length === 2) {
      // Two-chord progressions can be modal (like I-IV vamp for Ionian, i-IV for Dorian)
      // Continue with analysis but note that evidence will be limited
      // Lower minimum confidence threshold for vamp patterns
    }

    // Parse chords with error handling
    const chordAnalyses: ChordAnalysis[] = [];
    for (const symbol of chordSymbols) {
      try {
        const analysis = this.parseChord(symbol);
        chordAnalyses.push(analysis);
      } catch (error) {
        console.warn(`Failed to parse chord symbol: ${symbol}`, error);
        // Skip invalid chords
        continue;
      }
    }

    // Check if we have enough valid chords after parsing
    if (chordAnalyses.length < 2) {
      return null;
    }

    // Detect potential tonal centers
    const tonicCandidates = this.detectTonicCandidates(chordAnalyses, parentKey);

    // Analyze each tonic candidate
    const results: ModalAnalysisResult[] = tonicCandidates.map(candidate =>
      this.analyzeWithTonic(chordAnalyses, candidate.tonic, candidate.parentKey, !!parentKey)
    );

    // Select best result based on confidence (filter out null results first)
    const validResults = results.filter(result => result !== null);
    if (validResults.length === 0) {
      return null;
    }


    // CRITICAL FIX: Check for foil patterns across ALL candidates before selection
    const foilResults = validResults.filter(result => {
      if (!result.romanNumerals) return false;
      return this.detectFoilPatterns(result.romanNumerals);
    });

    // If ANY candidate is detected as foil, override with low confidence result
    if (foilResults.length > 0) {
      const foilResult = foilResults[0];
      foilResult.confidence = 0.3; // Force low confidence for foil patterns
      return foilResult.confidence >= 0.4 ? foilResult : null;
    }

    const bestResult = validResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // Lower threshold for vamp patterns to handle valid two-chord progressions
    const confidenceThreshold = chordAnalyses.length === 2 ? 0.25 : 0.4;
    return bestResult.confidence >= confidenceThreshold ? bestResult : null;
  }

  /**
   * Detect potential tonal centers based on structural analysis
   */
  private detectTonicCandidates(chordAnalyses: ChordAnalysis[], parentKey?: string): Array<{tonic: string, parentKey: string}> {
    const candidates: Map<string, number> = new Map();

    // Heavily weight first and last chords (structural importance)
    const firstChord = chordAnalyses[0];
    const lastChord = chordAnalyses[chordAnalyses.length - 1];

    candidates.set(firstChord.root, (candidates.get(firstChord.root) || 0) + 3.0);
    candidates.set(lastChord.root, (candidates.get(lastChord.root) || 0) + 3.0);

    // If first and last are the same, give massive weight
    if (firstChord.root === lastChord.root) {
      candidates.set(firstChord.root, (candidates.get(firstChord.root) || 0) + 5.0);
    }

    // Weight other chords less
    chordAnalyses.forEach(chord => {
      candidates.set(chord.root, (candidates.get(chord.root) || 0) + 0.5);
    });

    // Sort candidates by weight
    const sortedCandidates = Array.from(candidates.entries())
      .sort(([,a], [,b]) => b - a)
      .map(([root]) => root);

    // Build result array with appropriate parent keys
    const results: Array<{tonic: string, parentKey: string}> = [];

    // Add top candidate with provided parent key or inferred
    const topCandidate = sortedCandidates[0];
    results.push({
      tonic: topCandidate,
      parentKey: parentKey || this.inferParentKey(topCandidate)
    });

    // If parent key provided and different from top candidate, add it as alternative
    if (parentKey) {
      const parentKeyRoot = this.extractKeyRoot(parentKey);
      if (parentKeyRoot !== topCandidate) {
        results.push({
          tonic: parentKeyRoot,
          parentKey
        });
      }
    }

    return results.slice(0, 2); // Top 2 candidates
  }

  /**
   * Analyze progression with specific tonic center
   */
  private analyzeWithTonic(
    chordAnalyses: ChordAnalysis[],
    tonic: string,
    parentKey: string,
    wasParentKeyProvided: boolean = true
  ): ModalAnalysisResult {

    const tonicPitchClass = NOTE_TO_PITCH_CLASS[tonic];
    if (tonicPitchClass === undefined) {
      throw new Error(`Invalid tonic: ${tonic}`);
    }

    // Generate Roman numerals relative to tonic
    const romanNumerals = chordAnalyses.map(chord =>
      this.generateModalRomanNumeral(chord, tonicPitchClass)
    );

    // Detect modal patterns
    const patternResults = this.detectModalPatterns(romanNumerals);

    // Collect evidence
    const evidence = this.collectEvidence(chordAnalyses, romanNumerals, tonic, parentKey);

    // Calculate confidence
    let confidence = this.calculateConfidence(evidence, patternResults, romanNumerals, chordAnalyses, parentKey);

    // Determine mode name
    const modeName = this.determineModeName(patternResults, evidence, tonic, parentKey, romanNumerals, chordAnalyses);

    // Identify characteristics
    const characteristics = this.identifyModalCharacteristics(romanNumerals);

    // Apply foil detection to reduce confidence for functional patterns masquerading as modal
    let finalConfidence = confidence;
    const pattern = romanNumerals.join('-');
    const isDetectedAsFoil = this.detectFoilPatterns(romanNumerals);

    if (isDetectedAsFoil) {
      finalConfidence = Math.min(confidence, 0.3); // Reduce confidence well below threshold for foil patterns
    } else if (romanNumerals.join('-') === 'I-IV-I') {
      // Special boost for clear Ionian pattern that isn't functional
      finalConfidence = Math.max(confidence, 0.75);
    }

    // CRITICAL FIX: Reduce confidence for ambiguous patterns without parent key context
    if (!wasParentKeyProvided) {
      // Without explicit parent key, modal identification lacks harmonic context
      finalConfidence = Math.min(finalConfidence, 0.65); // Cap confidence for ambiguous cases
    }

    return {
      detectedTonicCenter: tonic,
      parentKeySignature: parentKey,
      modeName,
      romanNumerals,
      confidence: Math.min(finalConfidence, 0.95), // Cap at 0.95 to show uncertainty
      evidence,
      characteristics
    };
  }

  /**
   * Generate Roman numeral relative to tonic center
   */
  private generateModalRomanNumeral(chord: ChordAnalysis, tonicPitchClass: number): string {
    const interval = (chord.pitchClass - tonicPitchClass + 12) % 12;

    // Determine base Roman numeral based on interval and chord quality
    const baseRomanNumerals: Record<number, {major: string, minor: string, diminished: string}> = {
      0: { major: 'I', minor: 'i', diminished: 'i°' },
      1: { major: 'bII', minor: 'bii', diminished: 'bii°' },
      2: { major: 'II', minor: 'ii', diminished: 'ii°' },
      3: { major: 'bIII', minor: 'biii', diminished: 'biii°' },
      4: { major: 'III', minor: 'iii', diminished: 'iii°' },
      5: { major: 'IV', minor: 'iv', diminished: 'iv°' },
      6: { major: '#IV', minor: '#iv', diminished: '#iv°' },
      7: { major: 'V', minor: 'v', diminished: 'v°' },
      8: { major: 'bVI', minor: 'bvi', diminished: 'bvi°' },
      9: { major: 'VI', minor: 'vi', diminished: 'vi°' },
      10: { major: 'bVII', minor: 'bvii', diminished: 'bvii°' },
      11: { major: 'VII', minor: 'vii', diminished: 'vii°' }
    };

    const romanOptions = baseRomanNumerals[interval];
    if (!romanOptions) {
      return `?${interval}`;
    }

    // Choose appropriate Roman numeral based on chord quality (keep standard Roman numerals)
    switch (chord.quality) {
      case 'major':
      case 'major7':
      case 'dominant7':
        return romanOptions.major;
      case 'minor':
      case 'minor7':
        return romanOptions.minor;
      case 'diminished':
      case 'half_diminished':
        return romanOptions.diminished;  // Both diminished and half-diminished use diminished symbol
      case 'augmented':
        return romanOptions.major + '+';
      case 'suspended':
        return romanOptions.major + 'sus';
      default:
        // Default to major/minor based on interval position
        return interval === 0 ? romanOptions.major : romanOptions.minor;
    }
  }

  /**
   * Detect known modal patterns in Roman numeral sequence
   */
  private detectModalPatterns(romanNumerals: string[]): Array<{pattern: ModalPattern, matches: number}> {
    const romanString = romanNumerals.join('-');
    const results: Array<{pattern: ModalPattern, matches: number}> = [];

    for (const pattern of this.MODAL_PATTERNS) {
      if (romanString.includes(pattern.pattern)) {
        results.push({ pattern, matches: 1 });
      }

      // Check for partial matches
      const patternParts = pattern.pattern.split('-');
      let partialMatches = 0;

      for (let i = 0; i <= romanNumerals.length - patternParts.length; i++) {
        const segment = romanNumerals.slice(i, i + patternParts.length).join('-');
        if (segment === pattern.pattern) {
          partialMatches++;
        }
      }

      if (partialMatches > 0 && !results.some(r => r.pattern.pattern === pattern.pattern)) {
        results.push({ pattern, matches: partialMatches });
      }
    }

    return results.sort((a, b) => (b.pattern.strength * b.matches) - (a.pattern.strength * a.matches));
  }

  /**
   * Collect evidence for modal analysis
   */
  private collectEvidence(
    chordAnalyses: ChordAnalysis[],
    romanNumerals: string[],
    tonic: string,
    parentKey: string
  ): ModalEvidence[] {

    const evidence: ModalEvidence[] = [];

    // Structural evidence: starts and ends on same chord
    if (chordAnalyses[0].root === chordAnalyses[chordAnalyses.length - 1].root) {
      evidence.push({
        type: 'structural',
        description: `Progression starts and ends on ${chordAnalyses[0].root}, suggesting ${chordAnalyses[0].root} as tonal center`,
        strength: 0.8
      });
    }

    // Cadential evidence: modal cadences
    for (let i = 0; i < romanNumerals.length - 1; i++) {
      const current = romanNumerals[i];
      const next = romanNumerals[i + 1];

      if (current === 'bVII' && (next === 'I' || next === 'i')) {
        evidence.push({
          type: 'cadential',
          description: 'bVII-I cadence (characteristic of Mixolydian mode)',
          strength: 0.9
        });
      }

      if (current === 'bII' && (next === 'I' || next === 'i')) {
        evidence.push({
          type: 'cadential',
          description: 'bII-I cadence (characteristic of Phrygian mode)',
          strength: 0.9
        });
      }
    }

    // Intervallic evidence: characteristic modal intervals
    if (romanNumerals.includes('bVII')) {
      evidence.push({
        type: 'intervallic',
        description: 'Contains bVII chord (modal characteristic)',
        strength: 0.7
      });
    }

    if (romanNumerals.includes('bII')) {
      evidence.push({
        type: 'intervallic',
        description: 'Contains bII chord (modal characteristic)',
        strength: 0.7
      });
    }

    // Contextual evidence: parent key relationship
    if (parentKey && tonic !== this.extractKeyRoot(parentKey)) {
      evidence.push({
        type: 'contextual',
        description: `Tonal center (${tonic}) differs from parent key (${parentKey}), suggesting modal interpretation`,
        strength: 0.6
      });
    }

    // Vamp pattern evidence: Add evidence for common modal vamp patterns
    const romanString = romanNumerals.join('-');
    if (chordAnalyses.length === 2) {
      if (romanString === 'I-IV') {
        evidence.push({
          type: 'structural',
          description: 'I-IV vamp pattern (characteristic of Ionian modal color)',
          strength: 0.7
        });
      } else if (romanString === 'i-IV') {
        evidence.push({
          type: 'structural',
          description: 'i-IV vamp pattern (characteristic of Dorian modal color)',
          strength: 0.8
        });
      } else if (romanString === 'I-bVII') {
        evidence.push({
          type: 'structural',
          description: 'I-bVII vamp pattern (characteristic of Mixolydian modal color)',
          strength: 0.85
        });
      } else if (romanString === 'i-bII') {
        evidence.push({
          type: 'structural',
          description: 'i-bII vamp pattern (characteristic of Phrygian modal color)',
          strength: 0.85
        });
      } else if (romanString === 'I-II') {
        evidence.push({
          type: 'structural',
          description: 'I-II vamp pattern (characteristic of Lydian modal color)',
          strength: 0.8
        });
      }
    }

    return evidence;
  }

  /**
   * Generate Roman numerals relative to parent key (for functional analysis)
   */
  private generateFunctionalRomanNumerals(chordSymbols: string[], parentKey: string): string[] | null {
    try {
      // Extract parent key root (e.g., "C" from "C major")
      const parentKeyRoot = parentKey.split(' ')[0];
      const parentKeyPitchClass = NOTE_TO_PITCH_CLASS[parentKeyRoot];
      if (parentKeyPitchClass === undefined) {
        return null;
      }

      const isMinorKey = parentKey.includes('minor');

      // Generate Roman numerals with proper functional harmony chord qualities
      return chordSymbols.map(chordSymbol => {
        try {
          const chord = this.parseChord(chordSymbol);
          return this.generateFunctionalRomanNumeral(chord, parentKeyPitchClass, isMinorKey);
        } catch (error) {
          return '?';
        }
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate Roman numeral with proper functional harmony chord qualities
   */
  private generateFunctionalRomanNumeral(chord: ChordAnalysis, tonicPitchClass: number, isMinorKey: boolean = false): string {
    const interval = (chord.pitchClass - tonicPitchClass + 12) % 12;

    // Define diatonic chord qualities for major and minor keys
    const majorKeyQualities = [
      'major',    // I
      'minor',    // ii
      'minor',    // iii
      'major',    // IV
      'major',    // V
      'minor',    // vi
      'diminished' // vii°
    ];

    const minorKeyQualities = [
      'minor',    // i
      'diminished', // ii°
      'major',    // III
      'minor',    // iv
      'minor',    // v (natural minor)
      'major',    // VI
      'major'     // VII
    ];

    const expectedQualities = isMinorKey ? minorKeyQualities : majorKeyQualities;

    // Map intervals to scale degrees
    const scaleDegreeMappings = [
      { interval: 0, degree: 0 },   // I/i
      { interval: 2, degree: 1 },   // ii/ii°
      { interval: 4, degree: 2 },   // iii/III
      { interval: 5, degree: 3 },   // IV/iv
      { interval: 7, degree: 4 },   // V/v
      { interval: 9, degree: 5 },   // vi/VI
      { interval: 11, degree: 6 }   // vii°/VII
    ];

    // Find the scale degree for this interval
    const mapping = scaleDegreeMappings.find(m => m.interval === interval);

    if (!mapping) {
      // Chromatic chord - use modal approach
      return this.generateModalRomanNumeral(chord, tonicPitchClass);
    }

    const scaleDegree = mapping.degree;
    const expectedQuality = expectedQualities[scaleDegree];

    // Roman numeral symbols
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    let romanNumeral = romanNumerals[scaleDegree];

    // Adjust case based on expected quality
    if (expectedQuality === 'minor' || expectedQuality === 'diminished') {
      romanNumeral = romanNumeral.toLowerCase();
    }

    // Add diminished symbol
    if (expectedQuality === 'diminished') {
      romanNumeral += '°';
    }

    return romanNumeral;
  }

  /**
   * Detect functional patterns in Roman numeral sequence
   */
  private detectFunctionalPatterns(romanNumerals: string[]): number {
    const progression = romanNumerals.join('-');

    // Only detect PURE functional patterns without modal characteristics
    const pureFunctionalPatterns = [
      { pattern: 'I-V-I', strength: 0.95 },        // Pure authentic cadence
      { pattern: 'I-IV-V-I', strength: 0.95 },     // Pure functional progression
      { pattern: 'ii-V-I', strength: 0.85 },       // Jazz ii-V-I
      { pattern: 'vi-IV-I-V', strength: 0.90 },    // Pop progression
    ];

    // Check if progression contains modal characteristics - if so, don't treat as functional
    const hasModalCharacteristics = romanNumerals.some(rn =>
      rn.includes('bVII') || rn.includes('bII') || rn.includes('II') ||
      rn.includes('#IV') || rn.includes('bVI') || rn.includes('bIII')
    );

    if (hasModalCharacteristics) {
      return 0; // Modal characteristics present - not purely functional
    }

    // Only flag exact matches of pure functional progressions
    for (const pattern of pureFunctionalPatterns) {
      if (progression === pattern.pattern) {
        return pattern.strength;
      }
    }

    return 0; // No pure functional patterns detected
  }

  /**
   * Detect foil patterns that should have reduced modal confidence
   */
  private detectFoilPatterns(romanNumerals: string[]): boolean {
    const progression = romanNumerals.join('-');

    // Normalize roman numerals by removing chord extensions (7, maj7, etc.)
    const normalizedRomanNumerals = romanNumerals.map(rn =>
      rn.replace(/7|maj7|m7|ø7|°7|sus|add|dim/g, '')
    );
    const normalizedProgression = normalizedRomanNumerals.join('-');

    // Sophisticated modal foil patterns that appear modal but suggest other interpretations
    const modalFoilPatterns = [
      'I-V-I',     // Pure functional - any mode
      'I-IV-V-I',  // Pure functional progression
      'ii-V-I',    // Jazz ii-V-I - purely functional
      'vi-IV-I-V', // Pop progression - functional
      'i-iv-i',    // Dorian foil: minor iv suggests Aeolian, not Dorian
      'i-II-i',    // Phrygian foil: natural II undermines characteristic bII
      'i-V-i',     // Minor authentic cadence - functional, not modal
      'i-v-i',     // Natural minor (Aeolian) - not other minor modes
      'i°-V-i°',   // Locrian foil: functional V resolution in diminished contexts
    ];

    return modalFoilPatterns.some(pattern =>
      progression === pattern || normalizedProgression === pattern
    );
  }

  /**
   * Calculate overall confidence based on evidence
   */
  private calculateConfidence(
    evidence: ModalEvidence[],
    patternResults: Array<{pattern: ModalPattern, matches: number}>,
    romanNumerals?: string[],
    chordAnalyses?: ChordAnalysis[],
    parentKey?: string
  ): number {

    if (evidence.length === 0) {
      return 0.0;
    }

    // Check for functional patterns first - these should reduce modal confidence
    let functionalStrength = 0;
    if (romanNumerals) {
      functionalStrength = this.detectFunctionalPatterns(romanNumerals);
    }

    // Base confidence from evidence
    const evidenceStrength = evidence.reduce((sum, e) => sum + e.strength, 0) / evidence.length;

    // Pattern matching bonus
    let patternBonus = 0;
    if (patternResults.length > 0) {
      const bestPattern = patternResults[0];
      patternBonus = bestPattern.pattern.strength * bestPattern.matches * 0.3; // 30% weight to patterns
    }

    // Structural bonus for strong evidence
    const structuralEvidence = evidence.filter(e => e.type === 'structural');
    const structuralBonus = structuralEvidence.length > 0 ? 0.1 : 0;

    // Consistency bonus for multiple types of evidence
    const evidenceTypes = new Set(evidence.map(e => e.type));
    const consistencyBonus = evidenceTypes.size > 1 ? 0.1 : 0;

    let baseConfidence = evidenceStrength + patternBonus + structuralBonus + consistencyBonus;

    // Boost confidence for clear modal patterns
    if (patternResults.length > 0) {
      const bestPattern = patternResults[0];
      if (bestPattern.pattern.strength >= 0.85) {
        baseConfidence = Math.max(baseConfidence, 0.75); // Ensure clear patterns meet threshold
      }
    }

    // Boost confidence for multiple strong evidence types
    if (evidenceTypes.size >= 2 && evidenceStrength > 0.7) {
      baseConfidence = Math.max(baseConfidence, 0.72);
    }

    // Block modal analysis if clear functional patterns detected
    if (functionalStrength > 0.8) {
      return null; // Don't analyze clear functional progressions as modal
    }

    // Removed parent key check from here - moved to final confidence calculation

    // Special handling for vamp patterns (two-chord progressions)
    if (chordAnalyses && chordAnalyses.length === 2) {
      // Vamp patterns get confidence boost to meet threshold
      if (patternResults.length > 0) {
        const vampPattern = patternResults[0];
        if (vampPattern.pattern.pattern === 'I-IV' || vampPattern.pattern.pattern === 'i-IV') {
          baseConfidence = Math.max(baseConfidence, 0.72);
        }
      } else if (romanNumerals && (romanNumerals.join('-') === 'I-IV' || romanNumerals.join('-') === 'i-IV')) {
        // Even if pattern matching missed it, boost confidence for I-IV vamps
        baseConfidence = Math.max(baseConfidence, 0.70);
      }
    }

    // Boost confidence specifically for clear Ionian I-IV-I pattern (not functional)
    if (romanNumerals && romanNumerals.join('-') === 'I-IV-I') {
      baseConfidence = Math.max(baseConfidence, 0.78);
    }

    // Boost confidence for other clear modal patterns
    if (romanNumerals && (romanNumerals.join('-') === 'i-IV-i' || // Dorian
                         romanNumerals.join('-') === 'I-bVII-I')) { // Mixolydian
      baseConfidence = Math.max(baseConfidence, 0.75);
    }

    return Math.min(baseConfidence, 0.95);
  }

  /**
   * Determine mode name based on analysis
   */
  private determineModeName(
    patternResults: Array<{pattern: ModalPattern, matches: number}>,
    evidence: ModalEvidence[],
    tonic: string,
    parentKey: string,
    romanNumerals: string[],
    chordAnalyses: ChordAnalysis[]
  ): string {

    // PRIORITY 1: Pattern-based mode detection (most reliable)
    // CRITICAL FIX: For ambiguous patterns like I-IV, consider parent key context
    if (patternResults.length > 0) {
      const bestPattern = patternResults[0];

      // Check if this is an ambiguous pattern that could be multiple modes
      if (bestPattern.pattern.pattern === 'I-IV' && parentKey) {
        // I-IV can be Ionian (in its own key) or Mixolydian (in parent key)
        const parentRoot = this.extractKeyRoot(parentKey);
        const interval = (NOTE_TO_PITCH_CLASS[tonic] - NOTE_TO_PITCH_CLASS[parentRoot] + 12) % 12;

        // If tonic is 5th degree of parent key (interval = 7), it's Mixolydian
        if (interval === 7) {
          return `${tonic} Mixolydian`;
        }
        // If tonic is same as parent key (interval = 0), it's Ionian
        if (interval === 0) {
          return `${tonic} Ionian`;
        }
      }

      // CRITICAL FIX: Check 7th chord qualities before returning pattern-based mode
      // 7th chord qualities override generic pattern matching for more specific identification
      const tonicPitchClass = NOTE_TO_PITCH_CLASS[tonic];
      const tonicChords = chordAnalyses.filter(chord => chord.pitchClass === tonicPitchClass);
      const hasDominant7Tonic = tonicChords.some(chord => chord.quality === 'dominant7');
      const hasHalfDiminished7Tonic = tonicChords.some(chord => chord.quality === 'half_diminished');
      const hasMajorIV = romanNumerals.includes('IV');

      // 7th chord qualities provide more specific mode identification
      if (hasHalfDiminished7Tonic) {
        return `${tonic} Locrian`;  // iø7 tonic is distinctly Locrian
      }

      if (hasDominant7Tonic && hasMajorIV) {
        return `${tonic} Mixolydian`;  // I7 tonic with IV is distinctly Mixolydian
      }

      const modeName = bestPattern.pattern.modes[0];
      return `${tonic} ${modeName}`;
    }

    // PRIORITY 2: Evidence-based mode detection with chord quality discrimination
    const hasFlat7 = evidence.some(e => e.description.includes('bVII'));
    const hasFlat2 = evidence.some(e => e.description.includes('bII'));
    const hasSharp4 = evidence.some(e => e.description.includes('#IV'));
    const hasFlat6 = evidence.some(e => e.description.includes('bVI'));
    const hasNatural2 = evidence.some(e => e.description.includes('II')) && !hasFlat2;

    // Check for foil patterns that should reduce confidence
    const isLikelyFoil = this.detectFoilPatterns(romanNumerals);

    // Check Roman numerals for chord quality clues
    const romanString = romanNumerals.join('-');
    const hasMinorTonic = romanNumerals.some(rn => rn === 'i' || rn === 'i7' || rn === 'im7');
    const hasMajorTonic = romanNumerals.some(rn => rn === 'I' || rn === 'I7' || rn === 'Imaj7');
    const hasMajorIV = romanNumerals.includes('IV');
    const hasMinorIV = romanNumerals.includes('iv');
    const hasDiminishedTonic = romanString.includes('i°');

    // CRITICAL: 7th chord quality detection for mode discrimination
    // Check actual chord qualities instead of Roman numeral extensions
    const tonicPitchClass = NOTE_TO_PITCH_CLASS[tonic];
    const tonicChords = chordAnalyses.filter(chord => chord.pitchClass === tonicPitchClass);
    const hasDominant7Tonic = tonicChords.some(chord => chord.quality === 'dominant7');
    const hasHalfDiminished7Tonic = tonicChords.some(chord => chord.quality === 'half_diminished');
    const hasMajor7Tonic = tonicChords.some(chord => chord.quality === 'major7');


    // More specific chord quality detection
    const hasFlat7Chord = romanNumerals.includes('bVII');
    const hasFlat2Chord = romanNumerals.includes('bII');
    const hasNatural2Chord = romanNumerals.includes('II');
    const hasFlat6Chord = romanNumerals.includes('bVI');

    // Mode determination with improved chord quality discrimination


    // PRIORITY 1: 7th chord quality discrimination (most reliable for mode identification)
    if (hasHalfDiminished7Tonic) {
      return `${tonic} Locrian`;  // iø7 tonic is distinctly Locrian
    }


    if (hasDominant7Tonic && hasMajorIV) {
      return `${tonic} Mixolydian`;  // I7 tonic with IV is distinctly Mixolydian
    }

    // PRIORITY 2: Distinctive modal characteristics (without 7ths)
    if (hasDiminishedTonic && hasFlat2Chord) {
      return `${tonic} Locrian`;
    }

    if (hasFlat2Chord && hasMinorTonic) {
      return `${tonic} Phrygian`;
    }

    if ((hasNatural2Chord || hasSharp4) && hasMajorTonic) {
      return `${tonic} Lydian`;
    }

    // PRIORITY 2: Minor mode discrimination (Critical: Dorian vs Aeolian)
    if (hasMinorTonic) {
      // Dorian: minor tonic + major IV + flat VII
      if (hasMajorIV && hasFlat7Chord) {
        return `${tonic} Dorian`;
      }

      // Aeolian: minor tonic + minor iv + flat VII + flat VI
      if (hasMinorIV && hasFlat7Chord && hasFlat6Chord) {
        return `${tonic} Aeolian`;
      }

      // If has major IV but no clear flat VII, likely Dorian
      if (hasMajorIV && !hasFlat6Chord) {
        return `${tonic} Dorian`;
      }

      // If has minor iv and flat VI, likely Aeolian
      if (hasMinorIV && hasFlat6Chord) {
        return `${tonic} Aeolian`;
      }

      // Default for minor tonic without clear discrimination
      return `${tonic} Aeolian`;
    }

    // PRIORITY 3: Parent key relationship calculation (for ambiguous cases)
    // CRITICAL FIX: Use parent key context BEFORE defaulting to Ionian/Aeolian
    if (parentKey) {
      const parentRoot = this.extractKeyRoot(parentKey);
      const interval = (NOTE_TO_PITCH_CLASS[tonic] - NOTE_TO_PITCH_CLASS[parentRoot] + 12) % 12;

      // Correct mode intervals from parent key
      const modeMap: Record<number, string> = {
        0: 'Ionian',    // C in C major = C Ionian
        2: 'Dorian',    // D in C major = D Dorian
        4: 'Phrygian',  // E in C major = E Phrygian
        5: 'Lydian',    // F in C major = F Lydian
        7: 'Mixolydian', // G in C major = G Mixolydian
        9: 'Aeolian',   // A in C major = A Aeolian
        11: 'Locrian'   // B in C major = B Locrian
      };

      const modeName = modeMap[interval];
      if (modeName) {
        // For ambiguous cases (like I-IV vamps), prioritize parent key context
        // CRITICAL FIX: Don't override 7th chord quality-based mode detection
        if (hasMajorTonic && !hasFlat7Chord && !hasFlat2Chord && !hasSharp4 &&
            !hasDominant7Tonic && !hasMajor7Tonic) {
          // Major tonic without distinctive modal characteristics - use parent key
          return `${tonic} ${modeName}`;
        }
        if (hasMinorTonic && !hasMajorIV && !hasMinorIV && !hasFlat7Chord && !hasFlat6Chord) {
          // Minor tonic without distinctive modal characteristics - use parent key
          return `${tonic} ${modeName}`;
        }
      }
    }

    // PRIORITY 4: Major mode discrimination (fallback)
    if (hasMajorTonic) {
      // Mixolydian: major tonic + flat VII
      if (hasFlat7Chord) {
        return `${tonic} Mixolydian`;
      }

      // Default major mode
      return `${tonic} Ionian`;
    }

    // FALLBACK: Assume Ionian if we can't determine the mode
    return `${tonic} Ionian`;
  }

  /**
   * Identify specific modal characteristics
   */
  private identifyModalCharacteristics(romanNumerals: string[]): string[] {
    const characteristics: string[] = [];

    if (romanNumerals.includes('bVII')) {
      characteristics.push('Contains bVII chord (flat seventh scale degree)');
    }

    if (romanNumerals.includes('bII')) {
      characteristics.push('Contains bII chord (flat second scale degree)');
    }

    // Check for cadential patterns
    const romanString = romanNumerals.join('-');
    if (romanString.includes('bVII-I')) {
      characteristics.push('bVII-I cadence (Mixolydian characteristic)');
    }

    if (romanString.includes('bII-I')) {
      characteristics.push('bII-I cadence (Phrygian characteristic)');
    }

    return characteristics;
  }

  /**
   * Parse chord symbol into components
   */
  private parseChord(symbol: string): ChordAnalysis {
    // Clean the symbol
    const cleanSymbol = symbol.trim();
    if (!cleanSymbol) {
      throw new Error(`Empty chord symbol`);
    }

    // Extract root note (handles sharps and flats)
    const rootMatch = cleanSymbol.match(/^([A-G][#b]?)/);
    if (!rootMatch) {
      throw new Error(`Cannot parse chord: ${symbol} - invalid root note`);
    }

    const root = rootMatch[1];
    const remainder = cleanSymbol.slice(root.length);

    // Determine chord quality with improved logic
    let quality = 'major'; // default for basic triads like "C", "F", "G"

    // Check chord qualities (most specific to least specific)
    if (remainder.includes('m7b5') || remainder.includes('ø7') || remainder.includes('m7♭5')) {
      // Half-diminished seventh (Locrian characteristic)
      quality = 'half_diminished';
    } else if (remainder.includes('dim')) {
      quality = 'diminished';
    } else if (remainder.includes('aug')) {
      quality = 'augmented';
    } else if (remainder.includes('maj7') || remainder.includes('M7')) {
      quality = 'major7';
    } else if (remainder.includes('m7')) {
      quality = 'minor7';
    } else if (remainder.includes('7')) {
      quality = 'dominant7';  // Mixolydian characteristic
    } else if (remainder.match(/^m(?!aj)/)) {
      // "m" but not "maj" - this catches "m", "m9" but not "maj7" or "m7"
      quality = 'minor';
    } else if (remainder.includes('sus2') || remainder.includes('sus4')) {
      quality = 'suspended';
    }
    // If no modifiers, remains 'major' (handles basic triads like "C", "F", "G")

    const pitchClass = NOTE_TO_PITCH_CLASS[root];
    if (pitchClass === undefined) {
      throw new Error(`Unknown root note: ${root} - not found in NOTE_TO_PITCH_CLASS`);
    }

    return {
      symbol: cleanSymbol,
      root,
      quality,
      pitchClass
    };
  }

  /**
   * Infer parent key from tonic
   */
  private inferParentKey(tonic: string): string {
    // Simple heuristic: assume major key for parent
    return `${tonic} major`;
  }

  /**
   * Extract root note from key signature string
   */
  private extractKeyRoot(keySignature: string): string {
    const match = keySignature.match(/^([A-G][#b]?)/);
    return match ? match[1] : 'C';
  }
}
