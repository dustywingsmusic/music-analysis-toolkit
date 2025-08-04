/**
 * Functional Harmony Analysis Engine
 * Primary foundation for comprehensive music theory analysis
 * 
 * This analyzer identifies:
 * - Roman numeral progressions (I-IV-V)
 * - Chord functions (tonic, predominant, dominant)
 * - Cadences and harmonic rhythm
 * - Secondary dominants and chromatic harmony
 */

import { NOTE_TO_PITCH_CLASS } from './localChordProgressionAnalysis';

// Core interfaces for functional analysis
export interface FunctionalChordAnalysis {
  chordSymbol: string;
  root: number;
  chordName: string;
  romanNumeral: string;
  function: ChordFunction;
  isChromatic: boolean;
  chromaticType?: ChromaticType;
  voiceLeading?: VoiceLeadingAnalysis;
}

export interface FunctionalAnalysisResult {
  keyCenter: string;
  keySignature: string;
  mode: 'major' | 'minor' | 'modal';
  chords: FunctionalChordAnalysis[];
  cadences: Cadence[];
  progressionType: ProgressionType;
  confidence: number;
  explanation: string;
  chromaticElements: ChromaticElement[];
}

export type ChordFunction = 
  | 'tonic'           // I, vi (in major), i, VI (in minor)
  | 'predominant'     // ii, IV (in major), ii°, iv (in minor)  
  | 'dominant'        // V, vii°
  | 'subdominant'     // IV (classic function)
  | 'leading_tone'    // vii°, secondary dominants
  | 'chromatic';      // Non-diatonic chords

export type ChromaticType = 
  | 'secondary_dominant'   // V/V, V/ii, etc.
  | 'borrowed_chord'       // From parallel major/minor
  | 'chromatic_mediant'    // bIII, bVI, etc.
  | 'augmented_sixth'      // It+6, Ger+6, Fr+6
  | 'neapolitan'          // bII6

export type ProgressionType =
  | 'authentic_cadence'    // V-I
  | 'plagal_cadence'       // IV-I
  | 'deceptive_cadence'    // V-vi
  | 'half_cadence'         // ends on V
  | 'circle_of_fifths'     // vi-ii-V-I pattern
  | 'modal_progression'    // Characteristic modal movements
  | 'chromatic_sequence'   // Sequential chromatic movement
  | 'blues_progression'    // I-IV-V blues pattern
  | 'jazz_standard'        // ii-V-I and variants
  | 'other';

export interface Cadence {
  type: 'authentic' | 'plagal' | 'deceptive' | 'half';
  chords: [FunctionalChordAnalysis, FunctionalChordAnalysis];
  strength: number; // 0-1, how definitive the cadence is
  position: 'phrase_ending' | 'mid_phrase';
}

export interface VoiceLeadingAnalysis {
  smoothVoiceLeading: boolean;
  parallelFifths: boolean;
  parallelOctaves: boolean;
  commonTones: number;
  stepwiseMotion: number;
}

export interface ChromaticElement {
  chord: FunctionalChordAnalysis;
  type: ChromaticType;
  resolution?: FunctionalChordAnalysis;
  explanation: string;
}

/**
 * Enhanced Roman numeral templates with chromatic chord support
 */
const FUNCTIONAL_ROMAN_NUMERALS = {
  major: {
    diatonic: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    chromatic: {
      // Secondary dominants
      1: 'V/ii',    // Dominant of ii
      3: 'V/iii',   // Dominant of iii  
      6: 'V/IV',    // Dominant of IV
      8: 'V/V',     // Dominant of V (very common)
      10: 'V/vi',   // Dominant of vi
      // Borrowed chords from minor
      3: 'biii',    // From parallel minor
      6: 'bVI',     // From parallel minor
      10: 'bVII',   // From parallel minor (modal characteristic)
    }
  },
  minor: {
    diatonic: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    chromatic: {
      // Secondary dominants  
      2: 'V/III',   // Dominant of III
      5: 'V/iv',    // Dominant of iv
      7: 'V/v',     // Dominant of v
      9: 'V/VI',    // Dominant of VI
      11: 'V/VII',  // Dominant of VII
      // Borrowed from major
      4: 'III',     // From parallel major
      7: 'V',       // Major dominant (very common)
      11: 'vii°',   // Leading tone
    }
  }
};

/**
 * Chord function mapping based on Roman numeral degree
 */
const CHORD_FUNCTIONS: Record<number, Record<string, ChordFunction>> = {
  // Major key functions
  0: { major: 'tonic', minor: 'tonic' },        // I/i
  1: { major: 'chromatic', minor: 'chromatic' }, // Chromatic
  2: { major: 'predominant', minor: 'predominant' }, // ii/ii°
  3: { major: 'chromatic', minor: 'tonic' },    // iii/III - chromatic in major, tonic in minor
  4: { major: 'predominant', minor: 'predominant' }, // iii/III
  5: { major: 'subdominant', minor: 'subdominant' }, // IV/iv
  6: { major: 'chromatic', minor: 'chromatic' }, // Tritone
  7: { major: 'dominant', minor: 'dominant' },  // V/v
  8: { major: 'chromatic', minor: 'chromatic' }, // Chromatic
  9: { major: 'tonic', minor: 'subdominant' },  // vi/VI - relative minor/submediant
  10: { major: 'chromatic', minor: 'subdominant' }, // bVII - modal in major, natural in minor
  11: { major: 'leading_tone', minor: 'leading_tone' } // vii°/VII
};

/**
 * Main functional harmony analyzer class
 */
export class FunctionalHarmonyAnalyzer {
  
  /**
   * Analyze chord progression with functional harmony as primary framework
   */
  async analyzeFunctionally(
    chordSymbols: string[],
    parentKey?: string
  ): Promise<FunctionalAnalysisResult> {
    
    // Step 1: Determine key center (use parent key if provided)
    const keyAnalysis = this.determineKeyCenter(chordSymbols, parentKey);
    
    // Step 2: Analyze each chord functionally
    const functionalChords = this.analyzeChordsInKey(chordSymbols, keyAnalysis);
    
    // Step 3: Identify cadences and progressions
    const cadences = this.identifyCadences(functionalChords);
    const progressionType = this.classifyProgression(functionalChords, cadences);
    
    // Step 4: Detect chromatic elements
    const chromaticElements = this.detectChromaticElements(functionalChords, keyAnalysis);
    
    // Step 5: Calculate confidence and create explanation
    const confidence = this.calculateConfidence(functionalChords, cadences, chromaticElements);
    const explanation = this.createExplanation(functionalChords, progressionType, chromaticElements);
    
    return {
      keyCenter: keyAnalysis.keyCenter,
      keySignature: keyAnalysis.keySignature, 
      mode: keyAnalysis.mode,
      chords: functionalChords,
      cadences,
      progressionType,
      confidence,
      explanation,
      chromaticElements
    };
  }
  
  /**
   * Determine the key center using multiple methods
   */
  private determineKeyCenter(
    chordSymbols: string[], 
    parentKey?: string
  ): { keyCenter: string; keySignature: string; mode: 'major' | 'minor' | 'modal'; rootPitch: number; isMinor: boolean } {
    
    if (parentKey) {
      // Use provided parent key
      const parsed = this.parseKey(parentKey);
      if (parsed) {
        return {
          keyCenter: `${parsed.tonic} ${parsed.isMinor ? 'Minor' : 'Major'}`,
          keySignature: this.getKeySignature(parsed.tonic, parsed.isMinor),
          mode: parsed.isMinor ? 'minor' : 'major',
          rootPitch: NOTE_TO_PITCH_CLASS[parsed.tonic] || 0,
          isMinor: parsed.isMinor
        };
      }
    }
    
    // Analyze first and last chords for tonal center (existing logic)
    const firstChord = this.parseChordSymbol(chordSymbols[0]);
    const lastChord = this.parseChordSymbol(chordSymbols[chordSymbols.length - 1]);
    
    // Assume first/last chord suggests key (simple heuristic for now)
    const suggestedRoot = firstChord?.root || 0;
    const isMinor = firstChord?.chordName.includes('m') && !firstChord?.chordName.includes('M');
    const rootName = Object.keys(NOTE_TO_PITCH_CLASS).find(name => NOTE_TO_PITCH_CLASS[name] === suggestedRoot) || 'C';
    
    return {
      keyCenter: `${rootName} ${isMinor ? 'Minor' : 'Major'}`,
      keySignature: this.getKeySignature(rootName, isMinor),
      mode: isMinor ? 'minor' : 'major',
      rootPitch: suggestedRoot,
      isMinor
    };
  }
  
  /**
   * Analyze each chord within the established key
   */
  private analyzeChordsInKey(
    chordSymbols: string[],
    keyAnalysis: any
  ): FunctionalChordAnalysis[] {
    
    return chordSymbols.map(symbol => {
      const chordInfo = this.parseChordSymbol(symbol);
      if (!chordInfo) {
        return this.createEmptyChordAnalysis(symbol);
      }
      
      // Calculate interval from key center
      const intervalFromKey = (chordInfo.root - keyAnalysis.rootPitch + 12) % 12;
      
      // Determine if chord is diatonic or chromatic
      const isDiatonic = this.isChordDiatonic(intervalFromKey, keyAnalysis.isMinor, chordInfo.chordName);
      
      // Get Roman numeral and function
      const romanNumeral = this.getRomanNumeral(intervalFromKey, keyAnalysis.isMinor, chordInfo.chordName, !isDiatonic);
      const chordFunction = this.getChordFunction(intervalFromKey, keyAnalysis.isMinor, !isDiatonic);
      
      // Determine chromatic type if applicable
      const chromaticType = !isDiatonic ? this.determineChromaticType(intervalFromKey, keyAnalysis.isMinor, chordInfo.chordName) : undefined;
      
      return {
        chordSymbol: symbol,
        root: chordInfo.root,
        chordName: chordInfo.chordName,
        romanNumeral,
        function: chordFunction,
        isChromatic: !isDiatonic,
        chromaticType
      };
    });
  }
  
  /**
   * Check if chord is diatonic to the key
   */
  private isChordDiatonic(intervalFromKey: number, isMinor: boolean, chordName: string): boolean {
    const diatonicIntervals = isMinor 
      ? [0, 2, 3, 5, 7, 8, 10]  // Natural minor scale degrees
      : [0, 2, 4, 5, 7, 9, 11]; // Major scale degrees
    
    const isDiatonicInterval = diatonicIntervals.includes(intervalFromKey);
    
    // If the interval itself is not diatonic, it's definitely chromatic
    if (!isDiatonicInterval) return false;
    
    // Check if chord quality matches expected diatonic chord quality
    const expectedQualities = this.getExpectedDiatonicQualities(intervalFromKey, isMinor);
    
    // Parse chord quality from chord name
    const actualQuality = this.parseChordQuality(chordName);
    
    // Check if the actual quality matches any expected diatonic quality
    return expectedQualities.some(expected => this.qualitiesMatch(actualQuality, expected));
  }
  
  /**
   * Get expected diatonic chord qualities for a scale degree
   */
  private getExpectedDiatonicQualities(intervalFromKey: number, isMinor: boolean): string[] {
    if (isMinor) {
      // Natural minor chord qualities
      const minorQualities: Record<number, string[]> = {
        0: ['minor'],           // i
        2: ['diminished'],      // ii°
        3: ['major'],           // III
        5: ['minor'],           // iv
        7: ['minor'],           // v (or major V)
        8: ['major'],           // VI
        10: ['major']           // VII
      };
      return minorQualities[intervalFromKey] || [];
    } else {
      // Major chord qualities  
      const majorQualities: Record<number, string[]> = {
        0: ['major'],           // I
        2: ['minor'],           // ii
        4: ['minor'],           // iii
        5: ['major'],           // IV
        7: ['major'],           // V
        9: ['minor'],           // vi
        11: ['diminished']      // vii°
      };
      return majorQualities[intervalFromKey] || [];
    }
  }
  
  /**
   * Parse chord quality from chord name
   */
  private parseChordQuality(chordName: string): string {
    const name = chordName.toLowerCase();
    
    // Check for dominant 7th first (important for secondary dominants)
    if (name.includes('7') && !name.includes('maj7') && !name.includes('m7')) {
      return 'dominant7';
    }
    
    if (name.includes('maj7') || name.includes('M7')) return 'major7';
    if (name.includes('m7') || name.includes('min7')) return 'minor7';
    if (name.includes('dim') || name.includes('°')) return 'diminished';
    if (name.includes('m') && !name.includes('maj')) return 'minor';
    if (name === 'major' || name === '' || (!name.includes('m') && !name.includes('dim'))) return 'major';
    
    return 'unknown';
  }
  
  /**
   * Check if chord qualities match (accounting for extensions)
   */
  private qualitiesMatch(actual: string, expected: string): boolean {
    // Exact match
    if (actual === expected) return true;
    
    // Major chord can be major or major7
    if (expected === 'major' && (actual === 'major' || actual === 'major7')) return true;
    
    // Minor chord can be minor or minor7
    if (expected === 'minor' && (actual === 'minor' || actual === 'minor7')) return true;
    
    // Dominant 7th is NOT diatonic in most contexts (key indicator of secondary dominants)
    if (actual === 'dominant7') return false;
    
    return false;
  }
  
  /**
   * Get Roman numeral with chromatic chord support
   */
  private getRomanNumeral(
    intervalFromKey: number, 
    isMinor: boolean, 
    chordName: string, 
    isChromatic: boolean
  ): string {
    
    const templates = isMinor ? FUNCTIONAL_ROMAN_NUMERALS.minor : FUNCTIONAL_ROMAN_NUMERALS.major;
    
    if (!isChromatic) {
      // Use diatonic Roman numerals
      const diatonicIntervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
      const scaleIndex = diatonicIntervals.indexOf(intervalFromKey);
      
      if (scaleIndex !== -1) {
        let numeral = templates.diatonic[scaleIndex];
        
        // Add chord extensions
        if (chordName.includes('7')) numeral += '7';
        if (chordName.includes('9')) numeral += '9';
        
        return numeral;
      }
    }
    
    // Handle chromatic chords with proper secondary dominant notation
    if (isChromatic) {
      // Check if this is actually a dominant quality chord (for secondary dominants)
      const actualQuality = this.parseChordQuality(chordName);
      const isDominantQuality = actualQuality === 'dominant7' || actualQuality === 'major';
      
      // Only apply secondary dominant notation to dominant quality chords
      if (isDominantQuality) {
        const majorSecondaryNotation: Record<number, string> = {
          1: 'V/ii',   // C#7 in C major leads to Dm (ii)
          3: 'V/iii',  // E7 leads to Em (iii)
          6: 'V/IV',   // A7 leads to F (IV)
          2: 'V/V',    // D7 in C major is V/V (dominant of G) 
          10: 'V/vi'   // A7 leads to Am (vi)
        };
        
        const minorSecondaryNotation: Record<number, string> = {
          2: 'V/III',  // D7 in A minor leads to C (III)
          5: 'V/iv',   // F7 leads to Dm (iv)
          7: 'V/v',    // G7 leads to Em (v) 
          9: 'V/VI',   // Bb7 leads to F (VI)
          11: 'V/VII'  // C7 leads to G (VII)
        };
        
        const secondaryNotation = isMinor ? minorSecondaryNotation : majorSecondaryNotation;
        
        if (secondaryNotation[intervalFromKey]) {
          return secondaryNotation[intervalFromKey];
        }
      }
      
      // For non-dominant chromatic chords, use borrowed chord or chromatic mediant notation
      const chromaticNotation = isMinor 
        ? {
          // Borrowed from parallel major in minor keys
          4: 'IV',     // Major IV
          7: 'V',      // Major V  
          11: 'vii°'   // Diminished vii
        }
        : {
          // Borrowed from parallel minor in major keys
          3: 'biii',   // bIII
          6: 'bvi',    // bVI  
          8: 'bVI',    // Ab in C major
          10: 'bVII'   // bVII
        };
      
      const notation = chromaticNotation[intervalFromKey];
      if (notation) {
        return notation;
      }
      
      // Fallback to template or interval notation
      return templates.chromatic[intervalFromKey] || `Chr${intervalFromKey}`;
    }
    
    return `?${intervalFromKey}`;
  }
  
  /**
   * Determine chord function
   */
  private getChordFunction(intervalFromKey: number, isMinor: boolean, isChromatic: boolean): ChordFunction {
    if (isChromatic) {
      return 'chromatic';
    }
    
    const modeKey = isMinor ? 'minor' : 'major';
    return CHORD_FUNCTIONS[intervalFromKey]?.[modeKey] || 'chromatic';
  }
  
  /**
   * Determine type of chromatic alteration
   */
  private determineChromaticType(intervalFromKey: number, isMinor: boolean, chordName: string): ChromaticType {
    const actualQuality = this.parseChordQuality(chordName);
    const isDominantQuality = actualQuality === 'dominant7' || actualQuality === 'major';
    
    // Enhanced secondary dominant detection - only for dominant quality chords
    if (isDominantQuality) {
      const majorSecondaryDominants = [
        1,  // V/ii (to ii)
        2,  // V/V (to V) - like D7 in C major
        3,  // V/iii (to iii) 
        6,  // V/IV (to IV)
        10  // V/vi (to vi)
      ];
      
      const minorSecondaryDominants = [
        2,  // V/III (to III)
        5,  // V/iv (to iv)
        7,  // V/v (to v)
        9,  // V/VI (to VI)
        11  // V/VII (to VII)
      ];
      
      const secondaryDominants = isMinor ? minorSecondaryDominants : majorSecondaryDominants;
      
      if (secondaryDominants.includes(intervalFromKey)) {
        return 'secondary_dominant';
      }
    }
    
    // Check for borrowed chords (modal interchange)
    const majorBorrowedChords = [3, 6, 8, 10]; // from parallel minor (biii, bvi, bVI, bVII)
    const minorBorrowedChords = [4, 7, 11]; // from parallel major (IV, V, vii°)
    
    const borrowedChords = isMinor ? minorBorrowedChords : majorBorrowedChords;
    
    if (borrowedChords.includes(intervalFromKey)) {
      return 'borrowed_chord';
    }
    
    return 'chromatic_mediant';
  }
  
  /**
   * Identify cadences in the progression
   */
  private identifyCadences(chords: FunctionalChordAnalysis[]): Cadence[] {
    const cadences: Cadence[] = [];
    
    for (let i = 0; i < chords.length - 1; i++) {
      const currentChord = chords[i];
      const nextChord = chords[i + 1];
      
      // Authentic cadence: V-I
      if (currentChord.function === 'dominant' && nextChord.function === 'tonic') {
        cadences.push({
          type: 'authentic',
          chords: [currentChord, nextChord],
          strength: 0.9,
          position: i === chords.length - 2 ? 'phrase_ending' : 'mid_phrase'
        });
      }
      
      // Plagal cadence: IV-I
      if (currentChord.function === 'subdominant' && nextChord.function === 'tonic') {
        cadences.push({
          type: 'plagal',
          chords: [currentChord, nextChord],
          strength: 0.7,
          position: i === chords.length - 2 ? 'phrase_ending' : 'mid_phrase'
        });
      }
      
      // Deceptive cadence: V-vi
      if (currentChord.function === 'dominant' && nextChord.romanNumeral.includes('vi')) {
        cadences.push({
          type: 'deceptive',
          chords: [currentChord, nextChord],
          strength: 0.8,
          position: i === chords.length - 2 ? 'phrase_ending' : 'mid_phrase'
        });
      }
      
      // Half cadence: ends on V
      if (i === chords.length - 2 && nextChord.function === 'dominant') {
        cadences.push({
          type: 'half',
          chords: [currentChord, nextChord],
          strength: 0.6,
          position: 'phrase_ending'
        });
      }
    }
    
    return cadences;
  }
  
  /**
   * Classify the overall progression type
   */
  private classifyProgression(chords: FunctionalChordAnalysis[], cadences: Cadence[]): ProgressionType {
    const hasAuthenticCadence = cadences.some(c => c.type === 'authentic');
    const hasPlagalCadence = cadences.some(c => c.type === 'plagal');
    const hasDeceptiveCadence = cadences.some(c => c.type === 'deceptive');
    const hasHalfCadence = cadences.some(c => c.type === 'half');
    
    // Check for specific progression patterns
    const romanNumerals = chords.map(c => c.romanNumeral).join('-');
    
    // Common progressions
    if (romanNumerals.includes('vi-ii-V-I') || romanNumerals.includes('vi-IV-I-V')) {
      return 'circle_of_fifths';
    }
    
    if (romanNumerals.includes('ii-V-I')) {
      return 'jazz_standard';
    }
    
    if (romanNumerals.includes('I-IV-V') || romanNumerals.includes('I-V-IV-I')) {
      return 'blues_progression';
    }
    
    // Cadence-based classification
    if (hasAuthenticCadence) return 'authentic_cadence';
    if (hasPlagalCadence) return 'plagal_cadence';
    if (hasDeceptiveCadence) return 'deceptive_cadence';
    if (hasHalfCadence) return 'half_cadence';
    
    return 'other';
  }
  
  /**
   * Detect chromatic elements and their functions
   */
  private detectChromaticElements(chords: FunctionalChordAnalysis[], keyAnalysis: any): ChromaticElement[] {
    return chords
      .filter(chord => chord.isChromatic)
      .map((chord, index) => ({
        chord,
        type: chord.chromaticType || 'chromatic_mediant',
        resolution: chords[index + 1], // Next chord as resolution
        explanation: this.explainChromaticElement(chord, chords[index + 1])
      }));
  }
  
  /**
   * Create explanation for chromatic elements
   */
  private explainChromaticElement(chromatic: FunctionalChordAnalysis, resolution?: FunctionalChordAnalysis): string {
    if (chromatic.chromaticType === 'secondary_dominant') {
      const target = resolution ? resolution.romanNumeral : 'next chord';
      const chordFunction = chromatic.romanNumeral.includes('V/') ? 'secondary dominant' : 'dominant function chord';
      
      if (chromatic.romanNumeral === 'V/V') {
        return `${chromatic.chordSymbol} (${chromatic.romanNumeral}) is the dominant of the dominant, creating stronger harmonic drive to ${target}`;
      }
      
      return `${chromatic.chordSymbol} (${chromatic.romanNumeral}) is a ${chordFunction} that tonicizes ${target}`;
    }
    
    if (chromatic.chromaticType === 'borrowed_chord') {
      return `${chromatic.chordSymbol} (${chromatic.romanNumeral}) is borrowed from the parallel major/minor key, adding modal color`;
    }
    
    if (chromatic.chromaticType === 'chromatic_mediant') {
      return `${chromatic.chordSymbol} (${chromatic.romanNumeral}) is a chromatic mediant relationship, creating harmonic surprise`;
    }
    
    return `${chromatic.chordSymbol} (${chromatic.romanNumeral}) is a chromatic chord adding harmonic sophistication`;
  }
  
  /**
   * Calculate analysis confidence
   */
  private calculateConfidence(
    chords: FunctionalChordAnalysis[],
    cadences: Cadence[],
    chromaticElements: ChromaticElement[]
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for clear cadences
    if (cadences.length > 0) {
      confidence += 0.2 * cadences.reduce((sum, c) => sum + c.strength, 0) / cadences.length;
    }
    
    // Higher confidence for recognized functional patterns
    const functionalChords = chords.filter(c => c.function !== 'chromatic').length;
    confidence += (functionalChords / chords.length) * 0.3;
    
    // Slight reduction for excessive chromatic content
    if (chromaticElements.length > chords.length / 2) {
      confidence -= 0.1;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }
  
  /**
   * Create human-readable explanation
   */
  private createExplanation(
    chords: FunctionalChordAnalysis[],
    progressionType: ProgressionType,
    chromaticElements: ChromaticElement[]
  ): string {
    const romanNumerals = chords.map(c => c.romanNumeral).join(' - ');
    let explanation = `Functional analysis: ${romanNumerals}`;
    
    if (progressionType !== 'other') {
      explanation += `. This is a ${progressionType.replace('_', ' ')} progression`;
    }
    
    if (chromaticElements.length > 0) {
      explanation += `. Contains ${chromaticElements.length} chromatic element(s)`;
    }
    
    return explanation;
  }
  
  // Helper methods
  private parseKey(keyString: string): { tonic: string; isMinor: boolean } | null {
    const normalized = keyString.trim().toLowerCase();
    const match = normalized.match(/^([a-g][#b]?)\s*(major|minor|maj|min|m)?$/i);
    if (!match) return null;
    
    const tonic = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const quality = match[2];
    const isMinor = quality && (quality.includes('min') || quality === 'm');
    
    return { tonic, isMinor: !!isMinor };
  }
  
  private parseChordSymbol(symbol: string): { root: number; chordName: string } | null {
    const rootMatch = symbol.match(/^([A-G][#b]?)/);
    if (!rootMatch) return null;
    
    const rootNote = rootMatch[1];
    const rootPitch = NOTE_TO_PITCH_CLASS[rootNote];
    if (rootPitch === undefined) return null;
    
    return {
      root: rootPitch,
      chordName: symbol.slice(rootNote.length) || 'major'
    };
  }
  
  private getKeySignature(tonic: string, isMinor: boolean): string {
    // Simplified key signature logic - could be enhanced
    const keySignatures: Record<string, string> = {
      'C major': 'no sharps or flats',
      'A minor': 'no sharps or flats',
      'G major': '1 sharp (F#)',  
      'E minor': '1 sharp (F#)',
      'D major': '2 sharps (F#, C#)',
      'B minor': '2 sharps (F#, C#)',
      'F major': '1 flat (Bb)',
      'D minor': '1 flat (Bb)',
      // Add more as needed
    };
    
    const keyName = `${tonic} ${isMinor ? 'minor' : 'major'}`;
    return keySignatures[keyName] || `${keyName} key signature`;
  }
  
  private createEmptyChordAnalysis(symbol: string): FunctionalChordAnalysis {
    return {
      chordSymbol: symbol,
      root: 0,
      chordName: 'unknown',
      romanNumeral: '?',
      function: 'chromatic',
      isChromatic: true
    };
  }
}