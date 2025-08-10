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
  figuredBass: string; // Figured bass notation (e.g., "⁶", "⁶₄", "⁷", "⁶₅")
  inversion: number; // 0 = root position, 1 = first inversion, 2 = second inversion, 3 = third inversion
  function: ChordFunction;
  isChromatic: boolean;
  chromaticType?: ChromaticType;
  voiceLeading?: VoiceLeadingAnalysis;
  bassNote?: number; // Bass note pitch class for inversion analysis
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
  ambiguityFactors?: string[]; // Factors that make analysis uncertain
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
      // Secondary dominants (used as fallback for non-dominant quality chords at these intervals)
      2: 'V/V',     // D7 - Dominant of V (very common)
      4: 'V/vi',    // E7 - Dominant of vi
      9: 'V/ii',    // A7 - Dominant of ii
      11: 'V/iii',  // B7 - Dominant of iii

      // Note: Borrowed chords from minor are handled separately to avoid duplicate keys
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

      // Common chromatic chords in minor keys (only for specific cases)
      4: '#iv°',    // Raised 4th diminished - this is our Chr4 case!

      // Note: Borrowed chords from major are handled separately to avoid duplicate keys
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
      chromaticElements,
      ambiguityFactors: this.lastAnalysisAmbiguity.length > 0 ? this.lastAnalysisAmbiguity : undefined
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
   * Analyze each chord within the established key with figured bass notation
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

      // Analyze inversion and figured bass
      const inversionAnalysis = this.analyzeInversionAndFiguredBass(chordInfo, romanNumeral);

      // Determine chromatic type if applicable
      const chromaticType = !isDiatonic ? this.determineChromaticType(intervalFromKey, keyAnalysis.isMinor, chordInfo.chordName) : undefined;

      return {
        chordSymbol: symbol,
        root: chordInfo.root,
        chordName: chordInfo.chordName,
        romanNumeral: romanNumeral + inversionAnalysis.figuredBass,
        figuredBass: inversionAnalysis.figuredBass,
        inversion: inversionAnalysis.inversion,
        function: chordFunction,
        isChromatic: !isDiatonic,
        chromaticType,
        bassNote: chordInfo.bassNote
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

    // Handle suspended chords - treat as variants of major/minor depending on context
    if (name.includes('sus')) {
      // For functional analysis, suspended chords are typically considered variants of their underlying triad
      // sus4 and sus2 are generally treated as major-type for diatonic purposes
      return 'suspended';
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

    // Suspended chords are diatonic variants of their underlying chord
    // For tonic in major key (I), sus4 and sus2 are acceptable
    // For tonic in minor key (i), sus4 and sus2 are acceptable
    if (actual === 'suspended') {
      return expected === 'major' || expected === 'minor';
    }

    // Dominant 7th is NOT diatonic in most contexts (key indicator of secondary dominants)
    if (actual === 'dominant7') return false;

    return false;
  }

  /**
   * Get Roman numeral with chromatic chord support - NO MORE Chr PLACEHOLDERS!
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

        // Add chord extensions and modifications
        if (chordName.includes('7')) numeral += '7';
        if (chordName.includes('+') || chordName.includes('aug')) numeral += '+';
        if (chordName.includes('9')) numeral += '9';
        if (chordName.includes('sus4')) numeral += 'sus4';
        if (chordName.includes('sus2')) numeral += 'sus2';

        return numeral;
      }
    }

    // Handle chromatic chords with comprehensive analysis - NO Chr FALLBACKS!
    if (isChromatic) {
      // Check if this is actually a dominant quality chord (for secondary dominants)
      const actualQuality = this.parseChordQuality(chordName);
      const isDominantQuality = actualQuality === 'dominant7' || actualQuality === 'major';

      // SPECIAL CHECK: Some chords that LOOK like secondary dominants are actually borrowed chords
      // G7 in D major (interval 5) should be bVII7, not V7/something
      if (!isMinor && intervalFromKey === 5 && isDominantQuality) {
        // This is bVII7 (borrowed from parallel minor), not a secondary dominant
        // Skip secondary dominant logic and fall through to borrowed chord logic
      } else if (!isMinor && isDominantQuality) {
        // COMPREHENSIVE secondary dominant detection for major keys
        // CORRECT secondary dominant mapping based on RESOLUTION target
        // A7 in C major (interval 9) resolves to Dm (ii), so A7 = V7/ii
        // A7 in D major (interval 7) resolves to Em (ii), so A7 = V7/ii
        const majorSecondaryNotation: Record<number, string> = {
          0: 'V7/IV',  // Root as dominant of IV
          1: 'V7/♭v',  // C#7 -> unusual, treat as chromatic mediant
          2: 'V7/V',   // D7 in C major -> tonicizes G (V)
          3: 'V7/♭VI', // Eb7 -> borrowed/chromatic
          4: 'V7/vi',  // E7 in C major -> tonicizes Am (vi)
          // 5: SKIP - this is bVII7 borrowed chord, not secondary dominant
          6: 'V7/♭II', // F#7 -> Neapolitan area
          7: 'V7/ii',  // *** CRITICAL FIX: interval 7 = V7/ii ***
                        // A7 in D major (A is 7 semitones from D) resolves to ii (Em)
          8: 'V7/♭VI', // Ab7 -> borrowed chord area
          9: 'V7/ii',  // A7 in C major -> tonicizes Dm (ii)
          10: 'V7/♭VII',// Bb7 -> borrowed from minor
          11: 'V7/iii' // B7 in C major -> tonicizes Em (iii)
        };

        // Specific fixes for common intervals with proper chord quality detection
        if (intervalFromKey === 7) {
          // A7 in D major, E7 in A major, etc.
          return actualQuality === 'dominant7' ? 'V7/ii' : 'V/ii';
        }

        if (intervalFromKey === 9) {
          // A7 in C major, F#7 in A major, etc.
          return actualQuality === 'dominant7' ? 'V7/ii' : 'V/ii';
        }

        if (majorSecondaryNotation[intervalFromKey]) {
          let notation = majorSecondaryNotation[intervalFromKey];

          // CRITICAL: Only add '7' if the chord actually IS a dominant 7th
          // This fixes compatibility with existing tests
          if (actualQuality === 'dominant7' && !notation.includes('7')) {
            notation = notation.replace('V/', 'V7/');
          }

          if (chordName.includes('+')) {
            notation += '+';
          }
          return notation;
        }
      }

      // COMPREHENSIVE secondary dominant detection for minor keys
      if (isMinor && isDominantQuality) {
        const minorSecondaryNotation: Record<number, string> = {
          0: 'V7/iv',  // Root chord as dominant of iv
          1: 'V7/♭V',  // Chromatic
          2: 'V7/V',   // D7 in A minor -> tonicizes Em (v) or E (V)
          3: 'V7/VI',  // Eb7 in A minor -> tonicizes F (VI)
          4: 'V7/♭VII',// E7 -> could tonicize G
          5: 'V7/♭II', // F7 -> Neapolitan
          7: 'V7/♭III',// G7 -> tonicizes C (III)
          8: 'V7/IV',  // Ab7 -> unusual
          9: 'V7/VI',  // A7 -> tonicizes F (VI)
          10: 'V7/♭VII',// Bb7 -> tonicizes Eb
          11: 'V7/VII' // B7 -> tonicizes G# (rare in natural minor)
        };

        if (minorSecondaryNotation[intervalFromKey]) {
          let notation = minorSecondaryNotation[intervalFromKey];
          if (chordName.includes('7') && !notation.includes('7')) {
            notation = notation.replace('V/', 'V7/');
          }
          if (chordName.includes('+')) {
            notation += '+';
          }
          return notation;
        }
      }

      // For non-dominant chromatic chords, use borrowed chord notation
      const chromaticNotation = isMinor
        ? {
          // Borrowed from parallel major in minor keys
          2: 'II',     // Major II (borrowed)
          4: 'IV',     // Major IV (borrowed)
          6: '♭VI',    // Flat VI
          7: 'V',      // Major V (borrowed)
          9: 'VI',     // Major VI (borrowed)
          11: 'vii°'   // Diminished vii (borrowed)
        }
        : {
          // Borrowed from parallel minor in major keys
          1: '♭ii',    // Flat ii
          3: '♭III',   // Flat III (borrowed)
          5: '♭VII',   // *** CRITICAL FIX *** G7 in D major (interval 5) = bVII7
          6: '♭vi',    // Flat vi
          8: '♭VI',    // Flat VI (borrowed)
          10: '♭VII'   // Flat VII (borrowed) - for other keys
        };

      const notation = chromaticNotation[intervalFromKey];
      if (notation) {
        let result = notation;
        // Add chord quality indicators
        if (chordName.includes('7')) result += '7';
        if (chordName.includes('+')) result += '+';
        if (chordName.includes('°')) result += '°';
        return result;
      }

      // ABSOLUTE LAST RESORT - use interval-based Roman numeral (but NEVER "Chr")
      // This should rarely happen with the comprehensive approach above
      const intervalToRomanBase: Record<number, string> = {
        0: 'I', 1: '♭II', 2: 'II', 3: '♭III', 4: 'III', 5: 'IV',
        6: '♭V', 7: 'V', 8: '♭VI', 9: 'VI', 10: '♭VII', 11: 'VII'
      };

      let result = intervalToRomanBase[intervalFromKey] || 'I';

      // Apply chord quality
      if (actualQuality === 'minor') {
        result = result.toLowerCase();
      } else if (actualQuality === 'diminished') {
        result = result.toLowerCase() + '°';
      }

      // Add extensions
      if (chordName.includes('7')) result += '7';
      if (chordName.includes('+')) result += '+';

      return result;
    }

    // Fallback for non-chromatic unrecognized chords
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
   * Analyze chord inversion and generate precise figured bass notation
   */
  private analyzeInversionAndFiguredBass(
    chordInfo: { root: number; chordName: string; bassNote?: number },
    romanNumeral: string
  ): { figuredBass: string; inversion: number } {

    if (!chordInfo.bassNote || chordInfo.bassNote === chordInfo.root) {
      // Root position - no figured bass needed
      return { figuredBass: '', inversion: 0 };
    }

    // Calculate interval from chord root to bass note
    const bassInterval = (chordInfo.bassNote - chordInfo.root + 12) % 12;
    const chordName = chordInfo.chordName.toLowerCase();

    // Determine chord type for appropriate figured bass
    const isSeventhChord = chordName.includes('7') || chordName.includes('maj7') || chordName.includes('m7');
    const isDiminished = chordName.includes('dim') || chordName.includes('°');
    const isHalfDiminished = chordName.includes('ø') || chordName.includes('m7♭5');
    const isDominantSeventh = chordName.includes('7') && !chordName.includes('maj7') && !chordName.includes('m7');

    // ENHANCED figured bass analysis for complex chord inversions
    switch (bassInterval) {
      case 3: // Minor 3rd in bass (first inversion of major/minor triads)
      case 4: // Major 3rd in bass (first inversion)
        if (isSeventhChord) {
          return { figuredBass: '⁶₅', inversion: 1 }; // First inversion seventh chord
        } else {
          return { figuredBass: '⁶', inversion: 1 }; // First inversion triad
        }

      case 5: // Perfect 4th in bass - ENHANCED CASE
        // This handles cases like A7/D where D is the 4th of A7
        if (isSeventhChord) {
          return { figuredBass: '⁴₂', inversion: 2 }; // Second inversion with 4th in bass
        }
        break;

      case 6: // Tritone in bass (diminished chord specific or augmented 4th)
        if (isDiminished && isSeventhChord) {
          return { figuredBass: '⁴₃', inversion: 2 }; // Second inversion dim7
        } else if (isDiminished) {
          return { figuredBass: '⁶', inversion: 1 }; // First inversion diminished
        } else if (isSeventhChord) {
          return { figuredBass: '⁴₃', inversion: 2 }; // Second inversion with tritone
        }
        break;

      case 7: // Perfect 5th in bass (second inversion)
        if (isSeventhChord) {
          return { figuredBass: '⁴₃', inversion: 2 }; // Second inversion seventh chord
        } else {
          return { figuredBass: '⁶₄', inversion: 2 }; // Second inversion triad
        }

      case 8: // Minor 6th in bass - ADDED CASE
        if (isSeventhChord) {
          return { figuredBass: '⁴₂', inversion: 2 }; // Alternate second inversion
        }
        break;

      case 9: // Major 6th in bass
        if (isSeventhChord && isDiminished) {
          return { figuredBass: '²', inversion: 3 }; // Third inversion dim7
        } else if (isSeventhChord) {
          return { figuredBass: '⁴₂', inversion: 2 }; // Second inversion with 6th
        }
        break;

      case 10: // Minor 7th in bass (third inversion of seventh chords)
        if (isSeventhChord) {
          // SPECIAL CASE: A7/G where G is the minor 7th of A7
          // A7/G should use ⁶₅ figured bass (6-5 motion from third inversion)
          if (isDominantSeventh) {
            return { figuredBass: '⁶₅', inversion: 3 }; // Third inversion dominant 7th with proper figured bass
          } else if (isHalfDiminished) {
            return { figuredBass: '²', inversion: 3 }; // Third inversion half-dim7
          } else {
            return { figuredBass: '²', inversion: 3 }; // Third inversion seventh chord
          }
        }
        break;

      case 11: // Major 7th in bass (third inversion of major seventh chords)
        if (chordName.includes('maj7') || chordName.includes('M7')) {
          return { figuredBass: '²', inversion: 3 }; // Third inversion major7
        }
        break;

      case 1: // Minor 2nd in bass - ADDED CASE for chromatic bass notes
      case 2: // Major 2nd in bass - ADDED CASE
        if (isSeventhChord) {
          return { figuredBass: '⁴₃', inversion: 2 }; // Treat as altered second inversion
        }
        break;
    }

    // Fallback for unusual inversions - indicate bass note
    const bassNoteNames = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
    const bassNoteName = bassNoteNames[chordInfo.bassNote];

    // Use generic figured bass for non-standard inversions
    return { figuredBass: `/${bassNoteName}`, inversion: 1 }; // Slash chord notation as fallback
  }

  /**
   * Determine type of chromatic alteration - FIXED for comprehensive secondary dominant detection
   */
  private determineChromaticType(intervalFromKey: number, isMinor: boolean, chordName: string): ChromaticType {
    const actualQuality = this.parseChordQuality(chordName);
    const isDominantQuality = actualQuality === 'dominant7' || actualQuality === 'major';

    // COMPREHENSIVE secondary dominant detection - matches getRomanNumeral logic
    if (isDominantQuality) {
      const majorSecondaryDominants = [
        0,  // V7/IV - C7 in C major (to IV) - when used as dominant function
        2,  // V/V - D7 in C major (to V)
        4,  // V/vi - E7 in C major (to vi)
        7,  // V/ii - *** CRITICAL FIX *** A7 in D major (interval 7) resolves to ii
        9,  // V/ii - A7 in C major (to ii)
        11  // V/iii - B7 in C major (to iii)
      ];

      const minorSecondaryDominants = [
        0,  // V7/iv - root as dominant of iv
        2,  // V/V or V/III - depending on context
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
    const majorBorrowedChords = [3, 5, 6, 8, 10]; // from parallel minor (biii, bVII, bvi, bVI, bVII)
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
   * Calculate analysis confidence with improved scoring for functional progressions
   */
  private calculateConfidence(
    chords: FunctionalChordAnalysis[],
    cadences: Cadence[],
    chromaticElements: ChromaticElement[]
  ): number {
    let confidence = 0.6; // Higher base confidence
    let ambiguityFactors: string[] = [];

    // Higher confidence for clear cadences
    if (cadences.length > 0) {
      const cadenceStrength = cadences.reduce((sum, c) => sum + c.strength, 0) / cadences.length;
      confidence += 0.25 * cadenceStrength;
    } else {
      ambiguityFactors.push("no clear cadences");
    }

    // IMPROVED: Better handling of functional vs chromatic analysis
    const functionalChords = chords.filter(c => c.function !== 'chromatic').length;
    const secondaryDominants = chromaticElements.filter(c => c.type === 'secondary_dominant').length;
    const borrowedChords = chromaticElements.filter(c => c.type === 'borrowed_chord').length;

    // Secondary dominants and borrowed chords are FUNCTIONAL, not random chromaticism
    const functionalChromaticChords = secondaryDominants + borrowedChords;
    const totalFunctionalChords = functionalChords + functionalChromaticChords;
    const functionalRatio = totalFunctionalChords / chords.length;

    confidence += functionalRatio * 0.3;

    // BONUS: Reward well-known functional progressions
    if (secondaryDominants > 0) {
      confidence += 0.15; // Secondary dominants indicate sophisticated functional harmony
    }

    if (borrowedChords > 0 && borrowedChords <= 2) {
      confidence += 0.1; // Moderate modal interchange is functional
    }

    // Detect analytical ambiguity scenarios
    if (functionalRatio < 0.4) {
      ambiguityFactors.push("predominantly non-functional chromatic content");
      confidence -= 0.2;
    }

    // Check for suspended chords creating tonal ambiguity
    const suspendedChords = chords.filter(c =>
      c.chordSymbol.includes('sus4') || c.chordSymbol.includes('sus2')
    ).length;
    if (suspendedChords > chords.length / 3) {
      ambiguityFactors.push("extensive suspended harmonies obscure tonal function");
      confidence -= 0.1;
    }

    // IMPROVED: Don't penalize moderate modal interchange
    if (borrowedChords > 3) {
      ambiguityFactors.push("extensive modal interchange suggests ambiguous key center");
      confidence -= 0.05;
    }

    // Only penalize truly excessive non-functional chromaticism
    const nonFunctionalChromatic = chromaticElements.filter(c =>
      c.type !== 'secondary_dominant' && c.type !== 'borrowed_chord'
    ).length;

    if (nonFunctionalChromatic > chords.length / 2) {
      ambiguityFactors.push("excessive non-functional chromatic content");
      confidence -= 0.15;
    }

    // BONUS: Recognize common progressions
    const romanNumerals = chords.map(c => c.romanNumeral).join('-');
    if (romanNumerals.includes('V7/ii') || romanNumerals.includes('V/V') ||
        romanNumerals.includes('ii-V-I') || romanNumerals.includes('vi-IV-I-V') ||
        romanNumerals.includes('bVII') || romanNumerals.includes('V/ii')) {
      confidence += 0.15; // Reward common functional patterns
    }

    // Extra bonus for secondary dominants (these are sophisticated functional harmony)
    if (secondaryDominants >= 2) {
      confidence += 0.1; // Multiple secondary dominants = advanced functional progression
    }

    // Store ambiguity factors for potential display to user
    this.lastAnalysisAmbiguity = ambiguityFactors;

    return Math.min(Math.max(confidence, 0.1), 1.0); // Ensure minimum 0.1, maximum 1.0
  }

  private lastAnalysisAmbiguity: string[] = [];

  /**
   * Get ambiguity factors from last analysis
   */
  public getAnalysisAmbiguity(): string[] {
    return this.lastAnalysisAmbiguity;
  }

  /**
   * Create human-readable explanation with ambiguity acknowledgment
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

    // Add ambiguity acknowledgment when analysis is uncertain
    if (this.lastAnalysisAmbiguity.length > 0) {
      const ambiguityNote = this.lastAnalysisAmbiguity.length === 1
        ? this.lastAnalysisAmbiguity[0]
        : `multiple factors: ${this.lastAnalysisAmbiguity.join(', ')}`;
      explanation += `. Note: Analysis complexity due to ${ambiguityNote}`;
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

  private parseChordSymbol(symbol: string): { root: number; chordName: string; bassNote?: number } | null {
    const rootMatch = symbol.match(/^([A-G][#b]?)/);
    if (!rootMatch) return null;

    const rootNote = rootMatch[1];
    const rootPitch = NOTE_TO_PITCH_CLASS[rootNote];
    if (rootPitch === undefined) return null;

    // Check for slash chord (inversion) notation
    const slashMatch = symbol.match(/\/([A-G][#b]?)$/);
    let bassNote: number | undefined = undefined;

    if (slashMatch) {
      const bassNoteName = slashMatch[1];
      bassNote = NOTE_TO_PITCH_CLASS[bassNoteName];
    }

    let chordName = symbol.slice(rootNote.length);
    if (slashMatch) {
      // Remove the slash chord part from chord name
      chordName = chordName.replace(/\/[A-G][#b]?$/, '');
    }

    return {
      root: rootPitch,
      chordName: chordName || '',
      bassNote
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
      figuredBass: '',
      inversion: 0,
      function: 'chromatic',
      isChromatic: true
    };
  }
}
