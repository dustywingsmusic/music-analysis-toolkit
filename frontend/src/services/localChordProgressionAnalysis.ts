/**
 * Local Chord Progression Analysis
 * Replaces AI-dependent chord progression analysis with theoretically accurate local algorithms
 * Uses existing chordLogic.ts templates and realTimeModeDetection.ts algorithms
 */

import { findChordMatches, ChordMatch } from './chordLogic';
import { RealTimeModeDetector, ModeSuggestion, ModeDetectionResult } from './realTimeModeDetection';
import { allScaleData, PITCH_CLASS_NAMES } from '../constants/scales';

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
const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Roman numeral templates for major and minor keys
const ROMAN_NUMERAL_TEMPLATES = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

// Modal characteristic movements - defines what makes progressions truly modal
const MODAL_CHARACTERISTICS: ModalCharacteristic[] = [
  {
    movement: 'bVII-I',
    modes: ['Dorian', 'Aeolian', 'Phrygian'],
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
  const structuralInterpretation = analyzeStructurally(chordAnalyses, chordSymbols);
  if (structuralInterpretation) {
    interpretations.push(structuralInterpretation);
  }
  
  // Interpretation 3: Algorithmic analysis (original pitch-class based)
  const algorithmicInterpretation = await analyzeAlgorithmically(chordAnalyses, allPitchClasses);
  if (algorithmicInterpretation) {
    interpretations.push(algorithmicInterpretation);
  }
  
  // Sort by confidence (highest first)
  return interpretations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Analyze progression with user-provided key context
 */
function analyzeWithKnownKey(
  chordAnalyses: LocalChordAnalysis[],
  chordSymbols: string[],
  knownKey: string
): ProgressionInterpretation | null {
  const keyInfo = parseUserKey(knownKey);
  if (!keyInfo) return null;
  
  const keyRoot = NOTE_TO_PITCH_CLASS[keyInfo.tonic];
  if (keyRoot === undefined) return null;
  
  // Calculate Roman numerals based on known key
  const enhancedChords = chordAnalyses.map((chord, index) => {
    const intervalFromKey = (chord.root - keyRoot + 12) % 12;
    return {
      ...chord,
      romanNumeral: getRomanNumeral(intervalFromKey, keyInfo.isMinor, chord.chordName),
      function: getChordFunction(intervalFromKey, keyInfo.isMinor)
    };
  });
  
  // High confidence because user provided context
  const confidence = 0.85 + (enhancedChords.length > 0 ? 0.1 : 0);
  
  return {
    chords: enhancedChords,
    keyCenter: `${keyInfo.tonic} ${keyInfo.isMinor ? 'Minor' : 'Major'}`,
    overallMode: `${keyInfo.tonic} ${keyInfo.isMinor ? 'Aeolian' : 'Ionian'}`,
    modalChords: enhancedChords.filter(chord => chord.isModal),
    modalInterchange: analyzeModalInterchangeInKey(enhancedChords, keyInfo),
    confidence,
    source: 'user-guided',
    explanation: `Analysis based on user-provided key context: ${knownKey}`
  };
}

/**
 * Analyze progression based on structural elements (first/last chords)
 */
function analyzeStructurally(
  chordAnalyses: LocalChordAnalysis[],
  chordSymbols: string[]
): ProgressionInterpretation | null {
  if (chordAnalyses.length === 0) return null;
  
  // Weight first and last chords more heavily (common practice in analysis)
  const firstChord = chordAnalyses[0];
  const lastChord = chordAnalyses[chordAnalyses.length - 1];
  
  // If first and last are the same, that's likely our tonal center
  let tonicCandidate = firstChord;
  let confidence = 0.6;
  
  if (firstChord.root === lastChord.root) {
    confidence += 0.2; // Strong structural evidence
  }
  
  const keyRoot = tonicCandidate.root;
  const isMinor = tonicCandidate.chordName.includes('m') && !tonicCandidate.chordName.includes('M');
  
  const enhancedChords = chordAnalyses.map(chord => {
    const intervalFromKey = (chord.root - keyRoot + 12) % 12;
    return {
      ...chord,
      romanNumeral: getRomanNumeral(intervalFromKey, isMinor, chord.chordName),
      function: getChordFunction(intervalFromKey, isMinor)
    };
  });
  
  const tonicName = Object.keys(NOTE_TO_PITCH_CLASS).find(name => NOTE_TO_PITCH_CLASS[name] === keyRoot) || 'C';
  
  return {
    chords: enhancedChords,
    keyCenter: `${tonicName} ${isMinor ? 'Minor' : 'Major'}`,
    overallMode: `${tonicName} ${isMinor ? 'Aeolian' : 'Ionian'}`,
    modalChords: enhancedChords.filter(chord => chord.isModal),
    modalInterchange: 'Structural analysis based on first/last chord emphasis',
    confidence,
    source: 'structural',
    explanation: `Analysis based on structural importance of first and last chords`
  };
}

/**
 * Analyze progression using pitch-class statistical methods (original algorithm)
 */
async function analyzeAlgorithmically(
  chordAnalyses: LocalChordAnalysis[],
  allPitchClasses: number[]
): Promise<ProgressionInterpretation | null> {
  const modeDetector = new RealTimeModeDetector();
  const uniquePitchClasses = [...new Set(allPitchClasses)];
  
  let modeResult: ModeDetectionResult | null = null;
  uniquePitchClasses.forEach(pc => {
    modeResult = modeDetector.addNote(pc + 60, pc);
  });
  
  const primaryMode = modeResult?.suggestions?.[0];
  if (!primaryMode) return null;
  
  const keyRoot = NOTE_TO_PITCH_CLASS[primaryMode.fullName.split(' ')[0]];
  if (keyRoot === undefined) return null;
  
  const isMinorMode = primaryMode.name.includes('Aeolian') || primaryMode.name.includes('Minor');
  
  const enhancedChords = chordAnalyses.map(chord => {
    const intervalFromKey = (chord.root - keyRoot + 12) % 12;
    return {
      ...chord,
      romanNumeral: getRomanNumeral(intervalFromKey, isMinorMode, chord.chordName),
      function: getChordFunction(intervalFromKey, isMinorMode)
    };
  });
  
  const confidence = primaryMode.matchCount / (primaryMode.matchCount + primaryMode.mismatchCount);
  
  return {
    chords: enhancedChords,
    keyCenter: primaryMode.fullName.split(' ')[0] + (isMinorMode ? ' Minor' : ' Major'),
    overallMode: primaryMode.fullName,
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
  
  // Choose primary interpretation (prefer user-guided if available)
  const primaryInterpretation = interpretations.find(i => i.source === 'user-guided') || interpretations[0];
  
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
  const scaleIndex = [0, 2, 4, 5, 7, 9, 11].indexOf(intervalFromKey);
  
  if (scaleIndex !== -1) {
    let numeral = templates[scaleIndex];
    
    // Adjust for chord quality
    if (chordType.includes('7')) {
      numeral += '7';
    }
    
    return numeral;
  }
  
  // Handle chromatic chords
  return `♭${intervalFromKey}` || `#${intervalFromKey}`;
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
 * Analyze modal characteristics in progression
 */
function analyzeModalCharacteristics(chords: LocalChordAnalysis[], primaryMode: any): void {
  for (let i = 0; i < chords.length - 1; i++) {
    const currentChord = chords[i];
    const nextChord = chords[i + 1];
    
    // Check for characteristic modal movements
    MODAL_CHARACTERISTICS.forEach(characteristic => {
      if (matchesModalMovement(currentChord, nextChord, characteristic, primaryMode)) {
        currentChord.isModal = true;
        nextChord.isModal = true;
        
        if (!currentChord.modalCharacteristics) currentChord.modalCharacteristics = [];
        currentChord.modalCharacteristics.push(characteristic);
      }
    });
  }
}

/**
 * Check if chord movement matches a modal characteristic
 */
function matchesModalMovement(chord1: LocalChordAnalysis, chord2: LocalChordAnalysis, 
                             characteristic: ModalCharacteristic, primaryMode: any): boolean {
  // Simplified modal movement detection - could be enhanced
  const movement = characteristic.movement;
  
  if (movement === 'bVII-I') {
    // Check if we have a flatted seventh moving to tonic
    const interval1 = (chord1.root - chord2.root + 12) % 12;
    return interval1 === 2; // bVII to I is 2 semitones up
  }
  
  // Add more modal movement patterns as needed
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