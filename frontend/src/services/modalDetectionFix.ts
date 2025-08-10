/**
 * Modal Detection Fix
 *
 * Targeted fix for modal detection issues in the existing system.
 * Specifically addresses the G F C G type progressions that should be
 * analyzed as modal (I-bVII-IV-I) rather than functional (V-IV-I-V).
 *
 * This is a focused solution that can be integrated into the existing
 * localChordProgressionAnalysis.ts without breaking changes.
 */

import { NOTE_TO_PITCH_CLASS } from './localChordProgressionAnalysis';

// =====================================================
// MODAL DETECTION ENHANCEMENT
// =====================================================

export interface ModalDetectionResult {
  isModal: boolean;
  confidence: number;
  detectedMode: string | null;
  localTonic: number;
  parentKeyPitch: number;
  evidence: ModalEvidence[];
}

export interface ModalEvidence {
  type: 'structural' | 'cadential' | 'intervallic' | 'pattern';
  strength: number;
  description: string;
}

export interface EnhancedChordInfo {
  root: number;
  symbol: string;
  quality: string;
  position: number; // Position in progression (0-indexed)
}

/**
 * Enhanced modal detection for chord progressions
 * Fixes the G F C G issue by prioritizing modal characteristics
 */
export function detectModalCharacteristics(
  chordSymbols: string[],
  parentKey?: string
): ModalDetectionResult {

  // Parse chords into enhanced format
  const chords = chordSymbols.map((symbol, index) => parseChordEnhanced(symbol, index));

  // Determine most likely local tonic using multiple methods
  const localTonic = determineLocalTonic(chords);

  // Determine parent key context
  const parentKeyPitch = determineParentKeyPitch(chords, localTonic, parentKey);

  // Collect evidence for modal interpretation
  const evidence = collectModalEvidence(chords, localTonic);

  // Calculate confidence based on evidence
  const confidence = calculateModalConfidence(evidence, chords);

  // Determine specific mode if modal characteristics are present
  const detectedMode = determineSpecificMode(chords, localTonic, parentKeyPitch, evidence);

  const isModal = confidence > 0.7 || evidence.some(e => e.strength > 0.8);

  // Debug logging
  console.log(`🎵 Modal Detection for ${chordSymbols.join(' ')}:`);
  console.log(`  - isModal: ${isModal}`);
  console.log(`  - confidence: ${confidence}`);
  console.log(`  - detectedMode: ${detectedMode}`);
  console.log(`  - localTonic: ${localTonic} (${pitchToNoteName(localTonic)})`);
  console.log(`  - evidence: ${evidence.map(e => e.description).join('; ')}`);

  return {
    isModal,
    confidence,
    detectedMode,
    localTonic,
    parentKeyPitch,
    evidence
  };
}

/**
 * Generate Roman numerals relative to local tonic (modal approach)
 */
export function generateModalRomanNumerals(
  chords: EnhancedChordInfo[],
  localTonic: number
): string[] {

  // Determine if this is a minor-rooted mode by checking the tonic chord
  const tonicChord = chords.find(chord => chord.root === localTonic);
  const isMinorMode = tonicChord && (tonicChord.quality.includes('minor') || tonicChord.quality.includes('m'));

  // Debug logging
  console.log(`🎵 Roman Numeral Generation:`);
  console.log(`  - tonicChord:`, tonicChord);
  console.log(`  - isMinorMode:`, isMinorMode);
  console.log(`  - localTonic:`, localTonic, pitchToNoteName(localTonic));

  return chords.map((chord, index) => {
    const intervalFromTonic = (chord.root - localTonic + 12) % 12;
    const romanNumeral = getModalRomanNumeral(intervalFromTonic, chord.quality, isMinorMode);
    console.log(`  - Chord ${index}: ${chord.symbol} (${chord.quality}) -> ${romanNumeral}`);
    return romanNumeral;
  });
}

/**
 * Check if progression matches known problematic modal patterns
 */
export function isKnownModalPattern(chordSymbols: string[]): boolean {
  // Known patterns that should be analyzed modally
  const modalPatterns = [
    ['G', 'F', 'C', 'G'],    // G Mixolydian in C major
    ['D', 'C', 'G', 'D'],    // D Mixolydian in G major
    ['A', 'G', 'D', 'A'],    // A Mixolydian in D major
    ['E', 'D', 'A', 'E'],    // E Mixolydian in A major
    ['Am', 'Bb', 'C', 'Am'], // A Phrygian in F major
    ['Em', 'F#', 'G', 'Em'], // E Dorian in G major
    ['Em', 'F#', 'G', 'Em'], // Alternative E Dorian pattern
    ['Bm', 'A', 'G', 'Bm'],  // B Aeolian (natural minor)
    ['F', 'G', 'Am', 'Bb', 'F'] // F Lydian pattern
  ];

  const result = modalPatterns.some(pattern =>
    pattern.length === chordSymbols.length &&
    pattern.every((chord, index) => normalizeChordSymbol(chord) === normalizeChordSymbol(chordSymbols[index]))
  );

  // Debug logging
  if (result) {
    console.log(`🎵 Known modal pattern detected: ${chordSymbols.join(' ')}`);
  }

  return result;
}

// =====================================================
// PRIVATE HELPER FUNCTIONS
// =====================================================

function parseChordEnhanced(symbol: string, position: number): EnhancedChordInfo {
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
  const quality = parseChordQuality(remainder);

  return {
    root: rootPitch,
    symbol,
    quality,
    position
  };
}

function parseChordQuality(suffix: string): string {
  const normalized = suffix.toLowerCase().trim();

  if (normalized.includes('maj7') || normalized.includes('M7')) return 'major7';
  if (normalized.includes('m7') || normalized.includes('min7')) return 'minor7';
  if (normalized.includes('7') && !normalized.includes('maj') && !normalized.includes('m')) return 'dominant7';
  if (normalized.includes('dim') || normalized.includes('°')) return 'diminished';
  if (normalized.includes('aug') || normalized.includes('+')) return 'augmented';
  if (normalized.includes('sus4')) return 'sus4';
  if (normalized.includes('sus2')) return 'sus2';
  if (normalized.includes('m') && !normalized.includes('maj')) return 'minor';

  return 'major';
}

function determineLocalTonic(chords: EnhancedChordInfo[]): number {
  if (chords.length === 0) return 0;

  // Priority 1: First and last chord are the same (strong structural evidence)
  const firstChord = chords[0];
  const lastChord = chords[chords.length - 1];

  if (firstChord.root === lastChord.root) {
    return firstChord.root;
  }

  // Priority 2: Chord that appears most frequently
  const chordFrequency = new Map<number, number>();
  chords.forEach(chord => {
    chordFrequency.set(chord.root, (chordFrequency.get(chord.root) || 0) + 1);
  });

  const mostFrequent = Array.from(chordFrequency.entries())
    .sort(([,a], [,b]) => b - a)[0];

  if (mostFrequent && mostFrequent[1] > 1) {
    return mostFrequent[0];
  }

  // Priority 3: First chord (default)
  return firstChord.root;
}

function determineParentKeyPitch(
  chords: EnhancedChordInfo[],
  localTonic: number,
  parentKey?: string
): number {

  if (parentKey) {
    const parsed = parseParentKey(parentKey);
    if (parsed) {
      return NOTE_TO_PITCH_CLASS[parsed.tonic] || localTonic;
    }
  }

  // Analyze chord collection to determine most likely parent scale
  // For now, use a simple heuristic
  const chordRoots = chords.map(c => c.root);
  const uniqueRoots = [...new Set(chordRoots)];

  // If we have exactly the pattern of a major scale mode, use that
  if (uniqueRoots.length >= 3) {
    // Check if chords fit within a major scale starting from any root
    for (let possibleParent = 0; possibleParent < 12; possibleParent++) {
      const majorScaleNotes = [0, 2, 4, 5, 7, 9, 11].map(interval => (possibleParent + interval) % 12);

      if (uniqueRoots.every(root => majorScaleNotes.includes(root))) {
        return possibleParent;
      }
    }
  }

  // Default to local tonic as parent key
  return localTonic;
}

function collectModalEvidence(chords: EnhancedChordInfo[], localTonic: number): ModalEvidence[] {
  const evidence: ModalEvidence[] = [];

  // Evidence 1: Check for bVII-I cadential motion
  for (let i = 0; i < chords.length - 1; i++) {
    const current = chords[i];
    const next = chords[i + 1];

    const currentInterval = (current.root - localTonic + 12) % 12;
    const nextInterval = (next.root - localTonic + 12) % 12;

    // bVII to I motion (10 semitones to 0)
    if (currentInterval === 10 && nextInterval === 0) {
      evidence.push({
        type: 'cadential',
        strength: 0.9,
        description: 'bVII-I cadential motion detected (Mixolydian characteristic)'
      });
    }

    // bII to I motion (1 semitone to 0) - Phrygian
    if (currentInterval === 1 && nextInterval === 0) {
      evidence.push({
        type: 'cadential',
        strength: 0.95,
        description: 'bII-I cadential motion detected (Phrygian characteristic)'
      });
    }
  }

  // Evidence 2: Check for complete modal patterns
  if (chords.length === 4) {
    const intervals = chords.map(chord => (chord.root - localTonic + 12) % 12);

    // I-bVII-IV-I pattern (Mixolydian)
    if (intervals[0] === 0 && intervals[1] === 10 && intervals[2] === 5 && intervals[3] === 0) {
      evidence.push({
        type: 'pattern',
        strength: 0.95,
        description: 'I-bVII-IV-I pattern detected (classic Mixolydian progression)'
      });
    }

    // i-bII-bIII-i pattern (Phrygian)
    if (intervals[0] === 0 && intervals[1] === 1 && intervals[2] === 3 && intervals[3] === 0) {
      evidence.push({
        type: 'pattern',
        strength: 0.9,
        description: 'i-bII-bIII-i pattern detected (classic Phrygian progression)'
      });
    }

    // i-II-bIII-i pattern (Dorian)
    if (intervals[0] === 0 && intervals[1] === 2 && intervals[2] === 3 && intervals[3] === 0) {
      evidence.push({
        type: 'pattern',
        strength: 0.85,
        description: 'i-II-bIII-i pattern detected (classic Dorian progression)'
      });
    }
  }

  // Check for 5-chord patterns
  if (chords.length === 5) {
    const intervals = chords.map(chord => (chord.root - localTonic + 12) % 12);

    // I-II-iii-IV-I pattern (Lydian)
    if (intervals[0] === 0 && intervals[1] === 2 && intervals[2] === 4 && intervals[3] === 6 && intervals[4] === 0) {
      evidence.push({
        type: 'pattern',
        strength: 0.9,
        description: 'I-II-iii-#IV-I pattern detected (classic Lydian progression)'
      });
    }
  }

  // Evidence 3: Structural evidence (first/last chord matching)
  if (chords.length > 1 && chords[0].root === chords[chords.length - 1].root) {
    evidence.push({
      type: 'structural',
      strength: 0.7,
      description: 'First and last chord match, supporting tonal center interpretation'
    });
  }

  // Evidence 4: Modal characteristic intervals present
  const uniqueIntervals = [...new Set(chords.map(chord => (chord.root - localTonic + 12) % 12))];

  if (uniqueIntervals.includes(10)) { // bVII present
    evidence.push({
      type: 'intervallic',
      strength: 0.8,
      description: 'bVII chord present (modal characteristic)'
    });
  }

  if (uniqueIntervals.includes(1)) { // bII present
    evidence.push({
      type: 'intervallic',
      strength: 0.85,
      description: 'bII chord present (strong modal characteristic)'
    });
  }

  if (uniqueIntervals.includes(2)) { // II present (Dorian characteristic)
    evidence.push({
      type: 'intervallic',
      strength: 0.7,
      description: 'Major II chord present (Dorian characteristic)'
    });
  }

  if (uniqueIntervals.includes(6)) { // #IV present (Lydian characteristic)
    evidence.push({
      type: 'intervallic',
      strength: 0.8,
      description: '#IV chord present (Lydian characteristic)'
    });
  }

  return evidence;
}

function calculateModalConfidence(evidence: ModalEvidence[], chords: EnhancedChordInfo[]): number {
  if (evidence.length === 0) return 0.1;

  // Base confidence from evidence strength (weighted average)
  const totalStrength = evidence.reduce((sum, e) => sum + e.strength, 0);
  const maxPossibleStrength = evidence.length * 1.0;
  const baseConfidence = totalStrength / maxPossibleStrength;

  // Bonus for multiple pieces of evidence (but diminishing returns)
  const evidenceBonus = Math.min(0.15, evidence.length * 0.05);

  // Bonus for strong cadential evidence
  const cadentialBonus = evidence.some(e => e.type === 'cadential' && e.strength > 0.9) ? 0.1 : 0;

  // Bonus for pattern evidence
  const patternBonus = evidence.some(e => e.type === 'pattern') ? 0.1 : 0;

  // Bonus for structural evidence (first/last chord matching)
  const structuralBonus = evidence.some(e => e.type === 'structural') ? 0.05 : 0;

  const totalConfidence = baseConfidence + evidenceBonus + cadentialBonus + patternBonus + structuralBonus;

  // Ensure confidence never exceeds 1.0
  return Math.min(0.95, Math.max(0, totalConfidence));
}

function determineSpecificMode(
  chords: EnhancedChordInfo[],
  localTonic: number,
  parentKeyPitch: number,
  evidence: ModalEvidence[]
): string | null {

  const localTonicName = pitchToNoteName(localTonic);

  // Check evidence for specific modal indicators
  const hasbVII_I = evidence.some(e => e.description.includes('bVII-I'));
  const hasbII_I = evidence.some(e => e.description.includes('bII-I'));
  const hasI_bVII_IV_I = evidence.some(e => e.description.includes('I-bVII-IV-I'));
  const hasDorian = evidence.some(e => e.description.includes('Dorian'));
  const hasLydian = evidence.some(e => e.description.includes('Lydian'));

  if (hasI_bVII_IV_I || hasbVII_I) {
    return `${localTonicName} Mixolydian`;
  }

  if (hasbII_I) {
    return `${localTonicName} Phrygian`;
  }

  if (hasDorian) {
    return `${localTonicName} Dorian`;
  }

  if (hasLydian) {
    return `${localTonicName} Lydian`;
  }

  // Check for specific chord qualities to infer mode
  const hasMinorTonic = chords.length > 0 &&
    (chords[0].quality.includes('minor') || chords[0].quality.includes('m'));

  if (hasMinorTonic && evidence.some(e => e.strength > 0.6)) {
    // Determine specific minor mode based on evidence
    const hasbVII = evidence.some(e => e.description.includes('bVII'));
    const hasbVI = evidence.some(e => e.description.includes('bVI'));

    if (hasbVII && hasbVI) {
      return `${localTonicName} Aeolian`;
    }
  }

  // Calculate mode based on interval from parent key
  const intervalFromParent = (localTonic - parentKeyPitch + 12) % 12;
  const modeName = getModeFromInterval(intervalFromParent, false); // Assume major parent for now

  return modeName ? `${localTonicName} ${modeName}` : null;
}

function getModalRomanNumeral(intervalFromTonic: number, chordQuality: string, isMinorMode?: boolean): string {
  // Improved Roman numeral generation that considers chord quality and modal context
  const isMinorChord = (chordQuality.includes('minor') || chordQuality.includes('m')) &&
                       !chordQuality.includes('maj') && !chordQuality.includes('dim');
  const isDiminishedChord = chordQuality.includes('dim') || chordQuality.includes('°');

  const diatonicIntervals = [0, 2, 4, 5, 7, 9, 11];
  const scaleIndex = diatonicIntervals.indexOf(intervalFromTonic);

  if (scaleIndex !== -1) {
    // Base Roman numerals
    const baseRomanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    let result = baseRomanNumerals[scaleIndex];

    if (isDiminishedChord) {
      result = result.toLowerCase() + '°';
    } else if (isMinorChord) {
      result = result.toLowerCase();
    } else if (isMinorMode && scaleIndex === 0) {
      // Special case: in minor modes, even major tonic chords are written as 'i'
      // This shouldn't happen normally, but handle edge cases
      result = result.toLowerCase();
    }
    // Major chords stay uppercase unless specified otherwise

    // Add chord extensions
    if (chordQuality.includes('7')) result += '7';

    return result;
  }

  // Handle chromatic/modal alterations
  const chromaticRomanNumerals: Record<number, string> = {
    0: 'i',      // Tonic (for suspended variants)
    1: 'bII',    // Phrygian characteristic
    3: 'bIII',   // Modal interchange
    4: '#iv°',   // Raised 4th diminished (C#° in A minor)
    6: '#IV',    // Lydian characteristic
    8: 'bVI',    // Modal interchange
    10: 'bVII'   // Mixolydian characteristic
  };

  let baseRoman = chromaticRomanNumerals[intervalFromTonic] || `Chr${intervalFromTonic}`;

  // For chromatic chords, adjust case based on chord quality
  if (isMinorChord && baseRoman.length > 0) {
    // Convert to lowercase but keep accidentals
    baseRoman = baseRoman.replace(/[IVX]/g, m => m.toLowerCase());
  }

  return baseRoman;
}

function getModeFromInterval(interval: number, isParentMinor: boolean): string | null {
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
    return majorModes[interval] || null;
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
    return minorModes[interval] || null;
  }
}

function parseParentKey(keyString: string): { tonic: string; isMinor: boolean } | null {
  const normalized = keyString.trim().toLowerCase();
  const match = normalized.match(/^([a-g][#b]?)\s*(major|minor|maj|min|m)?$/i);
  if (!match) return null;

  const tonic = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const quality = match[2];
  const isMinor = quality && (quality.includes('min') || quality === 'm');

  return { tonic, isMinor: !!isMinor };
}

function pitchToNoteName(pitch: number): string {
  return Object.keys(NOTE_TO_PITCH_CLASS).find(name => NOTE_TO_PITCH_CLASS[name] === pitch) || 'C';
}

function normalizeChordSymbol(symbol: string): string {
  return symbol.trim().toLowerCase();
}
