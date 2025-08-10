/**
 * Local Chord Progression Analysis
 * Replaces AI-dependent chord progression analysis with theoretically accurate local algorithms
 * Uses existing chordLogic.ts templates and realTimeModeDetection.ts algorithms
 */

import { findChordMatches, ChordMatch } from './chordLogic';
import { RealTimeModeDetector, ModeSuggestion, ModeDetectionResult } from './realTimeModeDetection';
import { allScaleData, PITCH_CLASS_NAMES } from '../constants/scales';
import { generateScaleFromIntervals } from '../utils/music';
import {
  detectModalCharacteristics,
  generateModalRomanNumerals,
  isKnownModalPattern,
  ModalDetectionResult
} from './modalDetectionFix';
import { EnhancedModalAnalyzer } from './enhancedModalAnalyzer';

// Enhanced interfaces for local analysis
export interface LocalChordAnalysis extends ChordMatch {
  romanNumeral: string;
  function: ChordFunction;
  isModal: boolean;
  modalCharacteristics?: ModalCharacteristic[];
  borrowedFrom?: string;
}

export interface ProgressionInterpretation {
  chords: LocalChordAnalysis[];
  keyCenter: string;
  overallMode: string;
  isModal: boolean; // Whether this progression has modal characteristics
  modalChords: LocalChordAnalysis[];
  modalInterchange: string;
  confidence: number;
  source: 'algorithmic' | 'user-guided' | 'structural';
  explanation: string;
}

export interface ChordProgressionAnalysis {
  method: 'progression';
  progression: string;
  localAnalysis: ProgressionInterpretation;
  alternativeInterpretations?: ProgressionInterpretation[];
  userContextProvided?: string;
  aiEnhancement?: {
    songExamples: string[];
    theoreticalExplanation: string;
    genres: string[];
  };
  crossValidation?: {
    agreement: number;
    discrepancies: string[];
    recommendedInterpretation: 'local' | 'ai' | 'hybrid';
  };
}

export interface ModalCharacteristic {
  movement: string;        // e.g., "bVII-I", "bII-I"
  modes: string[];         // Which modes feature this characteristic
  strength: number;        // How definitive this movement is (0-1)
  context: 'cadential' | 'color_tone' | 'structural';
}

export type ChordFunction = 'tonic' | 'predominant' | 'dominant' | 'subdominant' | 'leading_tone' | 'other';

// Note name to pitch class mapping
export const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  // Extended enharmonic equivalents
  'B#': 0, 'Cb': 11, 'E#': 5, 'Fb': 4
};

/**
 * Format parent key scale with all note names
 * Examples: "C Major (C D E F G A B)", "A Minor (A B C D E F G)"
 */
function formatParentKeyScale(tonic: string, isMinor: boolean): string {
  const keyName = `${tonic} ${isMinor ? 'Minor' : 'Major'}`;

  // Get the appropriate scale intervals
  const scaleIntervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const tonicPitch = NOTE_TO_PITCH_CLASS[tonic];

  if (tonicPitch === undefined) {
    return keyName; // Fallback if tonic not found
  }

  try {
    const scaleNotes = generateScaleFromIntervals(tonicPitch, tonic, scaleIntervals);
    return `${keyName} (${scaleNotes.join(' ')})`;
  } catch (error) {
    console.warn('Error generating scale notes:', error);
    return keyName;
  }
}

/**
 * Format mode with scale degrees
 * Examples: "G Mixolydian (G A B C D E F) - 1 2 3 4 5 6 ♭7"
 */
function formatModeWithDegrees(tonic: string, modeName: string, parentTonic: string, isMinor: boolean): string {
  const modeDisplayName = `${tonic} ${modeName}`;

  // Get the mode intervals based on the parent scale and mode type
  const parentPitch = NOTE_TO_PITCH_CLASS[parentTonic];
  const tonicPitch = NOTE_TO_PITCH_CLASS[tonic];

  if (parentPitch === undefined || tonicPitch === undefined) {
    return modeDisplayName;
  }

  try {
    // Find the mode data for this specific mode
    const scaleFamily = allScaleData.find(scale => {
      const familyModes = scale.commonNames || scale.alternateNames || [];
      return familyModes.includes(modeName);
    });

    if (!scaleFamily) {
      return modeDisplayName;
    }

    const modeIndex = (scaleFamily.commonNames || scaleFamily.alternateNames || []).indexOf(modeName);
    if (modeIndex === -1 || !scaleFamily.modeIntervals || !scaleFamily.modeIntervals[modeIndex]) {
      return modeDisplayName;
    }

    const modeIntervals = scaleFamily.modeIntervals[modeIndex];
    const modeNotes = generateScaleFromIntervals(tonicPitch, tonic, modeIntervals);

    // Generate scale degrees relative to the tonic
    const scaleDegrees = modeIntervals.map(interval => {
      switch (interval) {
        case 0: return '1';
        case 1: return '♭2';
        case 2: return '2';
        case 3: return '♭3';
        case 4: return '3';
        case 5: return '4';
        case 6: return '♭5';
        case 7: return '5';
        case 8: return '♭6';
        case 9: return '6';
        case 10: return '♭7';
        case 11: return '7';
        default: return interval.toString();
      }
    });

    return `${modeDisplayName} (${modeNotes.join(' ')}) - ${scaleDegrees.join(' ')}`;
  } catch (error) {
    console.warn('Error formatting mode with degrees:', error);
    return modeDisplayName;
  }
}

/**
 * Get mode name based on interval from parent key tonic
 * For major parent keys: 0=Ionian, 2=Dorian, 4=Phrygian, 5=Lydian, 7=Mixolydian, 9=Aeolian, 11=Locrian
 */
function getModeNameFromInterval(intervalFromParent: number, isParentMinor: boolean): string {
  if (isParentMinor) {
    // For minor parent keys (natural minor/Aeolian modes)
    const minorModes: Record<number, string> = {
      0: 'Aeolian',      // A minor -> A Aeolian
      2: 'Locrian',      // A minor -> B Locrian
      3: 'Ionian',       // A minor -> C Ionian
      5: 'Dorian',       // A minor -> D Dorian
      7: 'Phrygian',     // A minor -> E Phrygian
      8: 'Lydian',       // A minor -> F Lydian
      10: 'Mixolydian'   // A minor -> G Mixolydian
    };
    return minorModes[intervalFromParent] || 'Unknown';
  } else {
    // For major parent keys
    const majorModes: Record<number, string> = {
      0: 'Ionian',       // C major -> C Ionian
      2: 'Dorian',       // C major -> D Dorian
      4: 'Phrygian',     // C major -> E Phrygian
      5: 'Lydian',       // C major -> F Lydian
      7: 'Mixolydian',   // C major -> G Mixolydian
      9: 'Aeolian',      // C major -> A Aeolian
      11: 'Locrian'      // C major -> B Locrian
    };
    return majorModes[intervalFromParent] || 'Unknown';
  }
}

// Roman numeral templates for major and minor keys
const ROMAN_NUMERAL_TEMPLATES = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

// Modal characteristic movements - defines what makes progressions truly modal
const MODAL_CHARACTERISTICS: ModalCharacteristic[] = [
  {
    movement: 'bVII-I',
    modes: ['Mixolydian', 'Dorian', 'Aeolian', 'Phrygian'],
    strength: 0.9,
    context: 'cadential'
  },
  {
    movement: 'bII-I',
    modes: ['Phrygian'],
    strength: 0.95,
    context: 'cadential'
  },
  {
    movement: '#IV-V',
    modes: ['Lydian'],
    strength: 0.8,
    context: 'color_tone'
  },
  {
    movement: 'bVII-IV',
    modes: ['Mixolydian', 'Dorian'],
    strength: 0.7,
    context: 'structural'
  },
  {
    movement: 'I-bVII',
    modes: ['Mixolydian', 'Dorian'],
    strength: 0.8,
    context: 'structural'
  }
];

/**
 * Create empty analysis result for invalid input
 */
function createEmptyAnalysis(progressionInput: string, knownKey?: string): ChordProgressionAnalysis {
  return {
    method: 'progression',
    progression: progressionInput,
    localAnalysis: {
      chords: [],
      keyCenter: 'Unknown',
      overallMode: 'Unknown',
      isModal: false,
      modalChords: [],
      modalInterchange: 'No chords to analyze',
      confidence: 0,
      source: 'algorithmic',
      explanation: 'No valid chords found in the progression'
    },
    userContextProvided: knownKey
  };
}

/**
 * Generate multiple interpretations of a chord progression
 */
async function generateMultipleInterpretations(
  chordAnalyses: LocalChordAnalysis[],
  allPitchClasses: number[],
  chordSymbols: string[],
  knownKey?: string
): Promise<ProgressionInterpretation[]> {
  const interpretations: ProgressionInterpretation[] = [];

  // Interpretation 1: User-guided analysis (if known key provided)
  if (knownKey) {
    const userInterpretation = analyzeWithKnownKey(chordAnalyses, chordSymbols, knownKey);
    if (userInterpretation) {
      interpretations.push(userInterpretation);
    }
  }

  // Interpretation 2: Structural analysis (based on first/last chords)
  const structuralInterpretation = analyzeStructurally(chordAnalyses, chordSymbols, knownKey);
  if (structuralInterpretation) {
    interpretations.push(structuralInterpretation);
  }

  // Interpretation 3: Algorithmic analysis (original pitch-class based)
  const algorithmicInterpretation = await analyzeAlgorithmically(chordAnalyses, allPitchClasses, chordSymbols);
  if (algorithmicInterpretation) {
    interpretations.push(algorithmicInterpretation);
  }

  // Sort by confidence (highest first)
  return interpretations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Analyze progression with user-provided parent key signature
 * The user provides the parent key signature, and we determine the local tonic from the progression
 * ENHANCED: Now uses modal detection fix for better modal characteristic detection
 */
function analyzeWithKnownKey(
  chordAnalyses: LocalChordAnalysis[],
  chordSymbols: string[],
  knownKey: string
): ProgressionInterpretation | null {
  const parentKeyInfo = parseUserKey(knownKey);
  if (!parentKeyInfo) return null;

  const parentKeyRoot = NOTE_TO_PITCH_CLASS[parentKeyInfo.tonic];
  if (parentKeyRoot === undefined) return null;

  // ENHANCED: Use modal detection fix for better tonic and mode detection
  const modalDetection = detectModalCharacteristics(chordSymbols, knownKey);

  // CROSS-VALIDATION: Use Enhanced Modal Analyzer for consistency
  const enhancedAnalyzer = new EnhancedModalAnalyzer();
  const enhancedResult = enhancedAnalyzer.analyzeModalCharacteristics(chordSymbols, knownKey);

  // Use Enhanced Modal Analyzer as authoritative source
  // CRITICAL FIX: Check confidence threshold, not just null result
  let isModalConsistent = enhancedResult !== null && enhancedResult.confidence >= 0.7;
  let detectedModeConsistent = enhancedResult?.modeName || null;

  // Log any discrepancies for debugging
  if (modalDetection.isModal !== isModalConsistent) {
    console.log(`🔄 Modal detection discrepancy: Local (${modalDetection.isModal}) vs Enhanced (${isModalConsistent}). Using Enhanced as authoritative.`);
  }

  if (modalDetection.detectedMode !== detectedModeConsistent) {
    console.log(`🔄 Mode detection discrepancy: Local (${modalDetection.detectedMode}) vs Enhanced (${detectedModeConsistent}). Using Enhanced as authoritative.`);
  }

  const localTonic = modalDetection.localTonic;

  // ENHANCED: Use modal Roman numerals if modal characteristics detected
  const enhancedChords = chordAnalyses.map((chord, index) => {
    let romanNumeral: string;

    if (isModalConsistent && (modalDetection.confidence > 0.7 || (enhancedResult && enhancedResult.confidence > 0.6))) {
      // Use modal Roman numerals relative to local tonic
      const modalRomanNumerals = generateModalRomanNumerals(
        chordSymbols.map((symbol, i) => ({
          root: chordAnalyses[i].root,
          symbol,
          quality: chordAnalyses[i].chordName,
          position: i
        })),
        localTonic
      );
      romanNumeral = modalRomanNumerals[index];
    } else {
      // Use traditional Roman numeral analysis
      const intervalFromLocalTonic = (chord.root - localTonic + 12) % 12;
      romanNumeral = getRomanNumeral(intervalFromLocalTonic, false, chord.chordName);
    }

    return {
      ...chord,
      romanNumeral,
      function: getChordFunction((chord.root - localTonic + 12) % 12, false),
      isModal: isModalConsistent // Use authoritative Enhanced modal analysis
    };
  });

  // Create a temporary key info for local tonic to analyze modal characteristics
  const localTonicName = Object.keys(NOTE_TO_PITCH_CLASS).find(name => NOTE_TO_PITCH_CLASS[name] === localTonic) || 'C';
  const localKeyInfo = { tonic: localTonicName, isMinor: false };

  // Analyze modal characteristics to determine the mode
  const modalAnalysis = analyzeModalCharacteristicsInProgression(enhancedChords, localKeyInfo);

  // ENHANCED: Confidence based on modal detection + user context
  let confidence = 0.85 + (enhancedChords.length > 0 ? 0.05 : 0);

  // Boost confidence if modal characteristics are clearly detected by Enhanced analyzer
  if (isModalConsistent && enhancedResult && enhancedResult.confidence > 0.7) {
    confidence = Math.min(0.95, confidence + 0.05);
  }

  // Ensure confidence doesn't exceed maximum
  confidence = Math.min(0.95, confidence);

  // Format parent key scale and mode properly
  const parentKeyScale = formatParentKeyScale(parentKeyInfo.tonic, parentKeyInfo.isMinor);

  // ENHANCED: Use modal detection result for mode determination
  // localTonicName already declared above

  let formattedMode: string;
  if (detectedModeConsistent) {
    // Use the cross-validated detected mode
    const modeParts = detectedModeConsistent.split(' ');
    const detectedModeName = modeParts.slice(1).join(' ');
    formattedMode = formatModeWithDegrees(localTonicName, detectedModeName, parentKeyInfo.tonic, parentKeyInfo.isMinor);
  } else {
    // Fallback to interval-based calculation
    const intervalFromParent = (localTonic - parentKeyRoot + 12) % 12;
    const modeName = getModeNameFromInterval(intervalFromParent, parentKeyInfo.isMinor);
    formattedMode = formatModeWithDegrees(localTonicName, modeName, parentKeyInfo.tonic, parentKeyInfo.isMinor);
  }

  return {
    chords: enhancedChords,
    keyCenter: parentKeyScale,
    overallMode: formattedMode,
    isModal: isModalConsistent, // Use Enhanced modal analyzer result
    modalChords: enhancedChords.filter(chord => chord.isModal),
    modalInterchange: modalAnalysis.explanation || analyzeModalInterchangeInKey(enhancedChords, parentKeyInfo),
    confidence,
    source: 'user-guided',
    explanation: `Analysis based on user-provided parent key signature: ${knownKey}${modalDetection.isModal ? '. Enhanced modal characteristics detected.' : ''}`
  };
}

/**
 * Analyze progression based on structural elements (first/last chords)
 * ENHANCED: Now prioritizes modal detection for known modal patterns
 */
function analyzeStructurally(
  chordAnalyses: LocalChordAnalysis[],
  chordSymbols: string[],
  parentKey?: string
): ProgressionInterpretation | null {
  if (chordAnalyses.length === 0) return null;

  // ENHANCED: Check for known modal patterns first
  const modalDetection = detectModalCharacteristics(chordSymbols);

  // CROSS-VALIDATION: Use Enhanced Modal Analyzer for consistency
  const enhancedAnalyzer = new EnhancedModalAnalyzer();
  const enhancedResult = enhancedAnalyzer.analyzeModalCharacteristics(chordSymbols, parentKey);

  // Use Enhanced Modal Analyzer as authoritative source
  // CRITICAL FIX: Check confidence threshold, not just null result
  let isModalConsistent = enhancedResult !== null && enhancedResult.confidence >= 0.7;
  let detectedModeConsistent = enhancedResult?.modeName || null;

  // Weight first and last chords more heavily (common practice in analysis)
  const firstChord = chordAnalyses[0];
  const lastChord = chordAnalyses[chordAnalyses.length - 1];

  // Use modal detection result for tonic if available
  let tonicCandidate = chordAnalyses.find(c => c.root === modalDetection.localTonic) || firstChord;
  let confidence = modalDetection.isModal ? 0.65 : 0.6;

  if (firstChord.root === lastChord.root) {
    confidence += 0.15; // Strong structural evidence
  }

  // Additional confidence boost for known modal patterns
  if (isKnownModalPattern(chordSymbols)) {
    confidence += 0.1;
  }

  // Ensure confidence doesn't exceed maximum
  confidence = Math.min(0.9, confidence);

  const keyRoot = modalDetection.localTonic; // Use modal detection result
  const isMinor = tonicCandidate.chordName.includes('m') && !tonicCandidate.chordName.includes('M');

  // ENHANCED: Use modal Roman numerals if modal characteristics detected
  const enhancedChords = chordAnalyses.map((chord, index) => {
    let romanNumeral: string;

    if (isModalConsistent && enhancedResult && enhancedResult.confidence > 0.4) {
      const modalRomanNumerals = generateModalRomanNumerals(
        chordSymbols.map((symbol, i) => ({
          root: chordAnalyses[i].root,
          symbol,
          quality: chordAnalyses[i].chordName,
          position: i
        })),
        keyRoot
      );
      romanNumeral = modalRomanNumerals[index];
    } else {
      const intervalFromKey = (chord.root - keyRoot + 12) % 12;
      romanNumeral = getRomanNumeral(intervalFromKey, isMinor, chord.chordName);
    }

    return {
      ...chord,
      romanNumeral,
      function: getChordFunction((chord.root - keyRoot + 12) % 12, isMinor),
      isModal: isModalConsistent // Use Enhanced modal analyzer result
    };
  });

  const tonicName = Object.keys(NOTE_TO_PITCH_CLASS).find(name => NOTE_TO_PITCH_CLASS[name] === keyRoot) || 'C';
  const keyInfo = { tonic: tonicName, isMinor };

  // Analyze modal characteristics
  const modalAnalysis = analyzeModalCharacteristicsInProgression(enhancedChords, keyInfo);

  // Format parent key scale and mode properly for structural analysis
  const parentKeyScale = formatParentKeyScale(tonicName, isMinor);

  // ENHANCED: Use modal detection result for mode formatting
  // tonicName redefined for modal detection
  const modalTonicName = Object.keys(NOTE_TO_PITCH_CLASS).find(name => NOTE_TO_PITCH_CLASS[name] === keyRoot) || 'C';

  let formattedMode: string;
  if (modalDetection.detectedMode) {
    // Use detected mode from enhanced modal detection
    const modeParts = modalDetection.detectedMode.split(' ');
    const modalTonic = modeParts[0];
    const modeName = modeParts.slice(1).join(' ');
    formattedMode = formatModeWithDegrees(modalTonic, modeName, modalTonicName, isMinor);
  } else {
    // Default to Ionian/Aeolian of the structural tonic
    const defaultModeName = isMinor ? 'Aeolian' : 'Ionian';
    formattedMode = formatModeWithDegrees(modalTonicName, defaultModeName, modalTonicName, isMinor);
  }

  return {
    chords: enhancedChords,
    keyCenter: parentKeyScale,
    overallMode: formattedMode,
    isModal: isModalConsistent, // Use Enhanced modal analyzer result
    modalChords: enhancedChords.filter(chord => chord.isModal),
    modalInterchange: modalAnalysis.explanation || 'Structural analysis based on first/last chord emphasis',
    confidence,
    source: 'structural',
    explanation: `Analysis based on structural importance of first and last chords${modalDetection.isModal ? '. Enhanced modal characteristics detected.' : ''}`
  };
}

/**
 * Analyze progression using pitch-class statistical methods (original algorithm)
 */
async function analyzeAlgorithmically(
  chordAnalyses: LocalChordAnalysis[],
  allPitchClasses: number[],
  originalChordSymbols: string[]
): Promise<ProgressionInterpretation | null> {
  const modeDetector = new RealTimeModeDetector();
  const uniquePitchClasses = [...new Set(allPitchClasses)];

  let modeResult: ModeDetectionResult | null = null;
  uniquePitchClasses.forEach(pc => {
    modeResult = modeDetector.addNote(pc + 60, pc);
  });

  const primaryMode = modeResult?.suggestions?.[0];
  if (!primaryMode) return null;

  // Add modal detection to match other analysis functions
  const modalDetection = detectModalCharacteristics(originalChordSymbols);

  // CROSS-VALIDATION: Use Enhanced Modal Analyzer for consistency
  const enhancedAnalyzer = new EnhancedModalAnalyzer();
  const enhancedResult = enhancedAnalyzer.analyzeModalCharacteristics(originalChordSymbols);

  // Use Enhanced Modal Analyzer as authoritative source
  // CRITICAL FIX: Check confidence threshold, not just null result
  let isModalConsistent = enhancedResult !== null && enhancedResult.confidence >= 0.7;
  let detectedModeConsistent = enhancedResult?.modeName || null;

  const keyRoot = NOTE_TO_PITCH_CLASS[primaryMode.fullName.split(' ')[0]];
  if (keyRoot === undefined) return null;

  const isMinorMode = primaryMode.name.includes('Aeolian') || primaryMode.name.includes('Minor');

  const enhancedChords = chordAnalyses.map(chord => {
    const intervalFromKey = (chord.root - keyRoot + 12) % 12;
    return {
      ...chord,
      romanNumeral: getRomanNumeral(intervalFromKey, isMinorMode, chord.chordName),
      function: getChordFunction(intervalFromKey, isMinorMode),
      isModal: isModalConsistent // Use Enhanced modal analyzer result
    };
  });

  const confidence = primaryMode.matchCount / (primaryMode.matchCount + primaryMode.mismatchCount);

  return {
    chords: enhancedChords,
    keyCenter: primaryMode.fullName.split(' ')[0] + (isMinorMode ? ' Minor' : ' Major'),
    overallMode: primaryMode.fullName,
    isModal: isModalConsistent, // Use Enhanced modal analyzer result
    modalChords: enhancedChords.filter(chord => chord.isModal),
    modalInterchange: 'Based on pitch-class statistical analysis',
    confidence,
    source: 'algorithmic',
    explanation: 'Analysis using pitch-class distribution and mode detection algorithms'
  };
}

/**
 * Parse user-provided key string
 */
function parseUserKey(keyString: string): { tonic: string; isMinor: boolean } | null {
  const normalized = keyString.trim().toLowerCase();

  // Handle common formats: "A major", "Bb minor", "F# major", etc.
  const match = normalized.match(/^([a-g][#b]?)\s*(major|minor|maj|min|m)?$/i);
  if (!match) return null;

  const tonic = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const quality = match[2];

  const isMinor = quality && (quality.includes('min') || quality === 'm');

  return { tonic, isMinor: !!isMinor };
}

/**
 * Analyze modal interchange for a known key
 */
function analyzeModalInterchangeInKey(
  chords: LocalChordAnalysis[],
  keyInfo: { tonic: string; isMinor: boolean }
): string {
  // This is a simplified version - could be enhanced with more sophisticated analysis
  const borrowedChords = chords.filter(chord => {
    // Simple heuristic: chords that don't fit the basic diatonic pattern
    return chord.romanNumeral.includes('b') || chord.romanNumeral.includes('#');
  });

  if (borrowedChords.length === 0) {
    return `Diatonic progression in ${keyInfo.tonic} ${keyInfo.isMinor ? 'minor' : 'major'}`;
  }

  return `Contains ${borrowedChords.length} borrowed chord(s): ${borrowedChords.map(c => c.romanNumeral).join(', ')}`;
}

/**
 * Main function to analyze chord progressions using local algorithms
 */
export async function analyzeChordProgressionLocally(progressionInput: string, knownKey?: string): Promise<ChordProgressionAnalysis> {
  // Parse chord symbols from input
  const chordSymbols = parseChordProgression(progressionInput);

  if (chordSymbols.length === 0) {
    return createEmptyAnalysis(progressionInput, knownKey);
  }

  // Convert chord symbols to pitch classes and identify chords
  const chordAnalyses: LocalChordAnalysis[] = [];
  const allPitchClasses: number[] = [];

  for (let i = 0; i < chordSymbols.length; i++) {
    const chordSymbol = chordSymbols[i];
    const pitchClasses = chordSymbolToPitchClasses(chordSymbol);
    allPitchClasses.push(...pitchClasses);

    // Use existing chord detection logic
    const chordMatches = findChordMatches(pitchClasses.map(pc => pc + 60)); // Convert to MIDI notes
    const bestMatch = chordMatches[0];

    if (bestMatch) {
      const localAnalysis: LocalChordAnalysis = {
        ...bestMatch,
        romanNumeral: '', // Will be calculated after key detection
        function: 'other', // Will be calculated after key detection
        isModal: false, // Will be determined by modal analysis
        modalCharacteristics: []
      };
      chordAnalyses.push(localAnalysis);
    }
  }

  // Generate multiple interpretations
  const interpretations = await generateMultipleInterpretations(
    chordAnalyses,
    allPitchClasses,
    chordSymbols,
    knownKey
  );

  // ENHANCED: Choose primary interpretation with modal pattern priority
  let primaryInterpretation: ProgressionInterpretation | undefined;

  // Priority 1: User-guided analysis (if available)
  primaryInterpretation = interpretations.find(i => i.source === 'user-guided');

  // Priority 2: If no user guidance, check for known modal patterns
  if (!primaryInterpretation && isKnownModalPattern(chordSymbols)) {
    // Prefer structural analysis for known modal patterns
    primaryInterpretation = interpretations.find(i => i.source === 'structural');
    console.log('🎵 Using structural analysis for known modal pattern:', chordSymbols.join(' '));
  }

  // Priority 3: Fallback to highest confidence
  if (!primaryInterpretation) {
    primaryInterpretation = interpretations[0];
  }

  if (!primaryInterpretation) {
    return createEmptyAnalysis(progressionInput, knownKey);
  }

  // Filter out alternative interpretations (exclude primary)
  const alternatives = interpretations.filter(i => i !== primaryInterpretation);

  return {
    method: 'progression',
    progression: progressionInput,
    localAnalysis: primaryInterpretation,
    alternativeInterpretations: alternatives.length > 0 ? alternatives : undefined,
    userContextProvided: knownKey
  };
}

/**
 * Parse chord progression string into individual chord symbols
 */
function parseChordProgression(input: string): string[] {
  // Remove measure separators and split by spaces
  return input
    .replace(/\|/g, ' ')
    .split(/\s+/)
    .filter(chord => chord.trim().length > 0);
}

/**
 * Convert chord symbol to pitch classes
 */
function chordSymbolToPitchClasses(chordSymbol: string): number[] {
  // Basic parsing - this could be enhanced with a full chord parser
  const rootMatch = chordSymbol.match(/^([A-G][#b]?)/);
  if (!rootMatch) return [];

  const rootNote = rootMatch[1];
  const rootPitch = NOTE_TO_PITCH_CLASS[rootNote];
  if (rootPitch === undefined) return [];

  // Determine chord type from symbol
  const chordType = determineChordType(chordSymbol);
  const intervals = getChordIntervals(chordType);

  return intervals.map(interval => (rootPitch + interval) % 12);
}

/**
 * Determine chord type from chord symbol
 */
function determineChordType(symbol: string): string {
  const lowerSymbol = symbol.toLowerCase();

  if (lowerSymbol.includes('maj7')) return 'major7';
  if (lowerSymbol.includes('m7')) return 'minor7';
  if (lowerSymbol.includes('7')) return 'dominant7';
  if (lowerSymbol.includes('dim')) return 'diminished';
  if (lowerSymbol.includes('sus4')) return 'sus4';
  if (lowerSymbol.includes('sus2')) return 'sus2';
  if (lowerSymbol.includes('m')) return 'minor';

  return 'major'; // Default
}

/**
 * Get intervals for chord type
 */
function getChordIntervals(chordType: string): number[] {
  const chordTemplates: Record<string, number[]> = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'major7': [0, 4, 7, 11],
    'minor7': [0, 3, 7, 10],
    'dominant7': [0, 4, 7, 10],
    'diminished': [0, 3, 6],
    'sus4': [0, 5, 7],
    'sus2': [0, 2, 7]
  };

  return chordTemplates[chordType] || [0, 4, 7];
}

/**
 * Get Roman numeral for chord based on interval from key
 */
function getRomanNumeral(intervalFromKey: number, isMinor: boolean, chordType: string): string {
  const templates = isMinor ? ROMAN_NUMERAL_TEMPLATES.minor : ROMAN_NUMERAL_TEMPLATES.major;
  const diatonicIntervals = [0, 2, 4, 5, 7, 9, 11];
  const scaleIndex = diatonicIntervals.indexOf(intervalFromKey);

  if (scaleIndex !== -1) {
    let numeral = templates[scaleIndex];

    // Adjust for chord quality
    if (chordType.includes('7')) {
      numeral += '7';
    }

    return numeral;
  }

  // Handle chromatic/modal chords with proper Roman numeral notation
  const chromaticRomanNumerals: Record<number, string> = {
    1: isMinor ? '♭II' : '♭II',    // flat 2 (Phrygian)
    3: isMinor ? '♭III' : '♭III',  // flat 3
    6: isMinor ? '♭VI' : '♭VI',    // flat 6
    8: isMinor ? '♭VI' : '♭VI',    // flat 6 enharmonic
    10: isMinor ? '♭VII' : 'bVII', // flat 7 (Mixolydian characteristic)
  };

  return chromaticRomanNumerals[intervalFromKey] || `?${intervalFromKey}`;
}

/**
 * Determine chord function within key
 */
function getChordFunction(intervalFromKey: number, isMinor: boolean): ChordFunction {
  const functionMap = isMinor
    ? { 0: 'tonic', 2: 'predominant', 4: 'predominant', 5: 'subdominant', 7: 'dominant', 9: 'subdominant', 10: 'leading_tone' }
    : { 0: 'tonic', 2: 'predominant', 4: 'predominant', 5: 'subdominant', 7: 'dominant', 9: 'tonic', 11: 'leading_tone' };

  return functionMap[intervalFromKey as keyof typeof functionMap] || 'other';
}

/**
 * Analyze modal characteristics in progression and determine mode
 */
function analyzeModalCharacteristicsInProgression(
  chords: LocalChordAnalysis[],
  keyInfo: { tonic: string; isMinor: boolean }
): { detectedMode: string | null; explanation: string; modalCharacteristics: ModalCharacteristic[] } {
  const detectedCharacteristics: ModalCharacteristic[] = [];
  const modalModes: string[] = [];

  // Mark chords with modal characteristics
  for (let i = 0; i < chords.length - 1; i++) {
    const currentChord = chords[i];
    const nextChord = chords[i + 1];

    // Check for characteristic modal movements
    MODAL_CHARACTERISTICS.forEach(characteristic => {
      if (matchesModalMovement(currentChord, nextChord, characteristic)) {
        currentChord.isModal = true;
        nextChord.isModal = true;

        if (!currentChord.modalCharacteristics) currentChord.modalCharacteristics = [];
        currentChord.modalCharacteristics.push(characteristic);

        detectedCharacteristics.push(characteristic);
        modalModes.push(...characteristic.modes);

        console.log(`🎵 Detected modal movement: ${characteristic.movement} (${characteristic.modes.join(', ')})`);
      }
    });
  }

  if (detectedCharacteristics.length === 0) {
    return {
      detectedMode: null,
      explanation: `Diatonic progression in ${keyInfo.tonic} ${keyInfo.isMinor ? 'minor' : 'major'}`,
      modalCharacteristics: []
    };
  }

  // Determine the most likely mode based on detected characteristics
  const modeFrequency: Record<string, number> = {};
  modalModes.forEach(mode => {
    modeFrequency[mode] = (modeFrequency[mode] || 0) + 1;
  });

  // Sort modes by frequency and strength of evidence
  const rankedModes = Object.entries(modeFrequency)
    .sort(([a, countA], [b, countB]) => countB - countA)
    .map(([mode]) => mode);

  const topMode = rankedModes[0];
  const detectedMode = topMode ? `${keyInfo.tonic} ${topMode}` : null;

  const movements = detectedCharacteristics.map(c => c.movement).join(', ');
  const explanation = `Modal characteristics detected: ${movements}. Suggests ${detectedMode || 'modal interpretation'}.`;

  return {
    detectedMode,
    explanation,
    modalCharacteristics: detectedCharacteristics
  };
}

/**
 * Legacy function - kept for compatibility
 */
function analyzeModalCharacteristics(chords: LocalChordAnalysis[], primaryMode: any): void {
  // This function is now replaced by analyzeModalCharacteristicsInProgression
  // but kept for any existing references
}

/**
 * Check if chord movement matches a modal characteristic
 */
function matchesModalMovement(chord1: LocalChordAnalysis, chord2: LocalChordAnalysis,
                             characteristic: ModalCharacteristic): boolean {
  const movement = characteristic.movement;

  // Parse the movement pattern (e.g., "bVII-I", "I-bVII", etc.)
  const [from, to] = movement.split('-');

  if (movement === 'bVII-I') {
    // Check if we have a flatted seventh moving to tonic
    // bVII to I: if chord1 is bVII and chord2 is I relative to the key
    // The interval between bVII and I is 2 semitones (minor second up)
    const interval = (chord2.root - chord1.root + 12) % 12;
    return interval === 2 && chord1.romanNumeral === 'bVII' && chord2.romanNumeral === 'I';
  }

  if (movement === 'I-bVII') {
    // Check if we have tonic moving to flatted seventh
    const interval = (chord2.root - chord1.root + 12) % 12;
    return interval === 10 && chord1.romanNumeral === 'I' && chord2.romanNumeral === 'bVII'; // I to bVII is 10 semitones (major seventh up)
  }

  if (movement === 'bVII-IV') {
    // Check for bVII to IV movement (common in Mixolydian)
    const interval = (chord2.root - chord1.root + 12) % 12;
    return interval === 7 && chord1.romanNumeral === 'bVII' && chord2.romanNumeral === 'IV'; // bVII to IV is 7 semitones (perfect fifth up)
  }

  if (movement === 'bII-I') {
    // Phrygian characteristic
    const interval = (chord2.root - chord1.root + 12) % 12;
    return interval === 1 && chord1.romanNumeral === '♭II' && chord2.romanNumeral === 'I'; // bII to I is 1 semitone
  }

  if (movement === '#IV-V') {
    // Lydian characteristic
    const interval = (chord2.root - chord1.root + 12) % 12;
    return interval === 1 && chord1.romanNumeral.includes('#IV') && chord2.romanNumeral === 'V'; // #IV to V is 1 semitone
  }

  return false;
}

/**
 * Determine modal interchange analysis
 */
function determineModalInterchange(chords: LocalChordAnalysis[], primaryMode: any): string {
  const modalChords = chords.filter(chord => chord.isModal);

  if (modalChords.length === 0) {
    return `No modal interchange detected - all chords are diatonic to ${primaryMode.fullName}`;
  }

  const modalSources = modalChords.map(chord =>
    chord.modalCharacteristics?.map(mc => mc.modes).flat() || []
  ).flat();

  const uniqueSources = [...new Set(modalSources)];

  return `Modal interchange detected from: ${uniqueSources.join(', ')}`;
}
