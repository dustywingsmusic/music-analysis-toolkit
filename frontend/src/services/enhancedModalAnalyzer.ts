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
  
  // Known modal characteristic patterns
  private readonly MODAL_PATTERNS: ModalPattern[] = [
    // Mixolydian patterns
    { pattern: 'I-bVII-IV-I', modes: ['Mixolydian'], strength: 0.95, context: 'structural' },
    { pattern: 'I-bVII-I', modes: ['Mixolydian'], strength: 0.90, context: 'structural' },
    { pattern: 'bVII-I', modes: ['Mixolydian'], strength: 0.85, context: 'cadential' },
    
    // Dorian patterns  
    { pattern: 'i-IV-i', modes: ['Dorian'], strength: 0.85, context: 'structural' },
    { pattern: 'i-bVII-IV-i', modes: ['Dorian'], strength: 0.90, context: 'structural' },
    
    // Phrygian patterns
    { pattern: 'i-bII-i', modes: ['Phrygian'], strength: 0.90, context: 'structural' },
    { pattern: 'bII-I', modes: ['Phrygian'], strength: 0.85, context: 'cadential' },
    
    // Lydian patterns
    { pattern: 'I-II-I', modes: ['Lydian'], strength: 0.85, context: 'structural' },
    { pattern: 'I-#IV-I', modes: ['Lydian'], strength: 0.90, context: 'structural' },
    
    // Aeolian patterns (natural minor)
    { pattern: 'i-bVI-bVII-i', modes: ['Aeolian'], strength: 0.85, context: 'structural' },
    { pattern: 'i-bVII-bVI-i', modes: ['Aeolian'], strength: 0.85, context: 'structural' },
    { pattern: 'i-bVII-iv-i', modes: ['Aeolian'], strength: 0.90, context: 'structural' }
  ];

  /**
   * Analyze chord progression for modal characteristics
   */
  public analyzeModalCharacteristics(
    chordSymbols: string[],
    parentKey?: string
  ): ModalAnalysisResult | null {
    
    if (chordSymbols.length === 0) {
      return null;
    }

    // Parse chords
    const chordAnalyses = chordSymbols.map(symbol => this.parseChord(symbol));
    
    // Detect potential tonal centers
    const tonicCandidates = this.detectTonicCandidates(chordAnalyses, parentKey);
    
    // Analyze each tonic candidate
    const results: ModalAnalysisResult[] = tonicCandidates.map(candidate => 
      this.analyzeWithTonic(chordAnalyses, candidate.tonic, candidate.parentKey)
    );
    
    // Select best result based on confidence
    const bestResult = results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
    
    // Only return if confidence is above threshold
    return bestResult.confidence >= 0.7 ? bestResult : null;
  }

  /**
   * Detect potential tonal centers based on structural analysis
   */
  private detectTonicCandidates(chordAnalyses: ChordAnalysis[], parentKey?: string): Array<{tonic: string, parentKey: string}> {
    const candidates: Array<{tonic: string, parentKey: string, score: number}> = [];
    
    // First/last chord emphasis (structural indicators)
    const firstChord = chordAnalyses[0];
    const lastChord = chordAnalyses[chordAnalyses.length - 1];
    
    const hasStrongStructuralEvidence = firstChord.root === lastChord.root;
    
    if (hasStrongStructuralEvidence) {
      // Strong tonal center indicator: same chord starts and ends
      // This gets very high priority - we trust structural evidence over parent key
      candidates.push({
        tonic: firstChord.root,
        parentKey: parentKey || this.inferParentKey(firstChord.root),
        score: 0.95 // Even higher score for strong structural evidence
      });
      
      // Only add parent key root as alternative if it's different from structural tonic
      if (parentKey) {
        const parentKeyRoot = this.extractKeyRoot(parentKey);
        if (parentKeyRoot !== firstChord.root) {
          candidates.push({
            tonic: parentKeyRoot,
            parentKey,
            score: 0.4 // Much lower score when competing with strong structural evidence
          });
        }
      }
    } else {
      // No strong structural evidence - consider both equally
      
      // If parent key provided, give it priority
      if (parentKey) {
        const parentKeyRoot = this.extractKeyRoot(parentKey);
        candidates.push({
          tonic: parentKeyRoot,
          parentKey,
          score: 0.7 // Higher score when no structural evidence
        });
      }
      
      // Add first chord as potential tonic
      candidates.push({
        tonic: firstChord.root,
        parentKey: parentKey || this.inferParentKey(firstChord.root),
        score: 0.6
      });
    }
    
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 2) // Top 2 candidates
      .map(c => ({ tonic: c.tonic, parentKey: c.parentKey }));
  }

  /**
   * Analyze progression with specific tonic center
   */
  private analyzeWithTonic(
    chordAnalyses: ChordAnalysis[],
    tonic: string,
    parentKey: string
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
    const confidence = this.calculateConfidence(evidence, patternResults);
    
    // Determine mode name
    const modeName = this.determineModeName(patternResults, evidence, tonic, parentKey);
    
    // Identify characteristics
    const characteristics = this.identifyModalCharacteristics(romanNumerals);
    
    return {
      detectedTonicCenter: tonic,
      parentKeySignature: parentKey,
      modeName,
      romanNumerals,
      confidence: Math.min(confidence, 0.95), // Cap at 0.95 to show uncertainty
      evidence,
      characteristics
    };
  }

  /**
   * Generate Roman numeral relative to tonic center
   */
  private generateModalRomanNumeral(chord: ChordAnalysis, tonicPitchClass: number): string {
    const interval = (chord.pitchClass - tonicPitchClass + 12) % 12;
    
    // Map intervals to Roman numerals
    const romanNumeralMap: Record<number, string> = {
      0: chord.quality === 'major' ? 'I' : 'i',
      1: 'bII',
      2: 'II',
      3: chord.quality === 'major' ? 'bIII' : 'iii',
      4: 'III',
      5: chord.quality === 'major' ? 'IV' : 'iv',
      6: '#IV',
      7: chord.quality === 'major' ? 'V' : 'v',
      8: 'bVI',
      9: chord.quality === 'major' ? 'VI' : 'vi',
      10: 'bVII',
      11: chord.quality === 'major' ? 'VII' : 'vii'
    };
    
    return romanNumeralMap[interval] || `?${interval}`;
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
    
    return evidence;
  }

  /**
   * Calculate overall confidence based on evidence
   */
  private calculateConfidence(
    evidence: ModalEvidence[],
    patternResults: Array<{pattern: ModalPattern, matches: number}>
  ): number {
    
    if (evidence.length === 0) {
      return 0.0;
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
    
    return Math.min(evidenceStrength + patternBonus + structuralBonus + consistencyBonus, 0.95);
  }

  /**
   * Determine mode name based on analysis
   */
  private determineModeName(
    patternResults: Array<{pattern: ModalPattern, matches: number}>,
    evidence: ModalEvidence[],
    tonic: string,
    parentKey: string
  ): string {
    
    // PRIORITY 1: Pattern-based mode detection (most reliable)
    if (patternResults.length > 0) {
      const bestPattern = patternResults[0];
      const modeName = bestPattern.pattern.modes[0];
      return `${tonic} ${modeName}`;
    }
    
    // PRIORITY 2: Strong evidence-based mode detection
    const hasFlat7 = evidence.some(e => e.description.includes('bVII'));
    const hasFlat2 = evidence.some(e => e.description.includes('bII'));
    const hasSharp4 = evidence.some(e => e.description.includes('#IV'));
    const hasFlat6 = evidence.some(e => e.description.includes('bVI'));
    
    // Multiple evidence checks for more reliable detection
    if (hasFlat7 && !hasFlat2) {
      return `${tonic} Mixolydian`;
    }
    
    if (hasFlat2) {
      return `${tonic} Phrygian`;
    }
    
    if (hasSharp4) {
      return `${tonic} Lydian`;
    }
    
    if (hasFlat6 && hasFlat7) {
      return `${tonic} Aeolian`;
    }
    
    // PRIORITY 3: Parent key relationship (ONLY if no modal characteristics detected)
    // This should be a last resort, not a primary method
    if (parentKey && evidence.length === 0) {
      const parentRoot = this.extractKeyRoot(parentKey);
      const interval = (NOTE_TO_PITCH_CLASS[tonic] - NOTE_TO_PITCH_CLASS[parentRoot] + 12) % 12;
      
      const modeNames = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];
      const modeIndex = [0, 2, 4, 5, 7, 9, 11].indexOf(interval);
      const modeName = modeIndex !== -1 ? modeNames[modeIndex] : 'Unknown';
      
      return `${tonic} ${modeName}`;
    }
    
    // FALLBACK: Return unknown if we can't confidently determine the mode
    return `${tonic} Unknown`;
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
    // Extract root note (handles sharps and flats)
    const rootMatch = symbol.match(/^([A-G][#b]?)/);
    if (!rootMatch) {
      throw new Error(`Cannot parse chord: ${symbol}`);
    }
    
    const root = rootMatch[1];
    const remainder = symbol.slice(root.length);
    
    // Determine chord quality
    let quality = 'major'; // default
    if (remainder.includes('m') && !remainder.includes('maj')) {
      quality = 'minor';
    } else if (remainder.includes('dim')) {
      quality = 'diminished';
    } else if (remainder.includes('aug')) {
      quality = 'augmented';
    } else if (remainder.includes('7') && !remainder.includes('maj7')) {
      quality = 'dominant7';
    } else if (remainder.includes('maj7')) {
      quality = 'major7';
    } else if (remainder.includes('m7')) {
      quality = 'minor7';
    }
    
    const pitchClass = NOTE_TO_PITCH_CLASS[root];
    if (pitchClass === undefined) {
      throw new Error(`Unknown root note: ${root}`);
    }
    
    return {
      symbol,
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