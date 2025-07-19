/**
 * Centralized Mapping System for Music Theory Toolkit
 * 
 * This file consolidates all mappings used throughout the application
 * to make them easier to manage, debug, and maintain.
 */

import { allScaleData } from './scales';

// ============================================================================
// NOTE AND PITCH MAPPINGS
// ============================================================================

/**
 * Standard note names with enharmonic equivalents
 */
export const NOTES = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

/**
 * Parent key indices for scale table organization
 */
export const PARENT_KEY_INDICES = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6];

/**
 * Parent key pitch class to note name mapping
 */
export const PARENT_KEYS = {
    0: 'C', 1: 'D♭', 2: 'D', 3: 'E♭', 4: 'E', 5: 'F', 
    6: 'G♭', 7: 'G', 8: 'A♭', 9: 'A', 10: 'B♭', 11: 'B'
};

/**
 * Comprehensive note to pitch class mapping (supports multiple formats)
 */
export const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  // Natural notes
  "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11,
  
  // Sharp variants (both ASCII and Unicode)
  "C#": 1, "C♯": 1, "CS": 1,
  "D#": 3, "D♯": 3, "DS": 3,
  "F#": 6, "F♯": 6, "FS": 6,
  "G#": 8, "G♯": 8, "GS": 8,
  "A#": 10, "A♯": 10, "AS": 10,
  
  // Flat variants (both ASCII and Unicode)
  "Db": 1, "D♭": 1, "DB": 1,
  "Eb": 3, "E♭": 3, "EB": 3,
  "Gb": 6, "G♭": 6, "GB": 6,
  "Ab": 8, "A♭": 8, "AB": 8,
  "Bb": 10, "B♭": 10, "BB": 10,
};

/**
 * Pitch class to note name mapping with enharmonic options
 */
export const PITCH_CLASS_NAMES: { [key: number]: { normal: string; sharp?: string; flat?: string; } } = {
    0: { normal: 'C', sharp: 'B♯', flat: 'D♭♭' }, 
    1: { normal: 'C♯', flat: 'D♭' },
    2: { normal: 'D', sharp: 'C♯♯', flat: 'E♭♭' }, 
    3: { normal: 'E♭', sharp: 'D♯' },
    4: { normal: 'E', flat: 'F♭', sharp: 'D♯♯' }, 
    5: { normal: 'F', sharp: 'E♯', flat: 'G♭♭' },
    6: { normal: 'F♯', flat: 'G♭' }, 
    7: { normal: 'G', sharp: 'F♯♯', flat: 'A♭♭' },
    8: { normal: 'A♭', sharp: 'G♯' }, 
    9: { normal: 'A', sharp: 'G♯♯', flat: 'B♭♭' },
    10: { normal: 'B♭', sharp: 'A♯' }, 
    11: { normal: 'B', flat: 'C♭', sharp: 'A♯♯' }
};

// ============================================================================
// SCALE FAMILY MAPPINGS
// ============================================================================

/**
 * Scale name to table ID mapping
 */
export const SCALE_TO_TABLE_ID: { [key: string]: string } = {
  'Major Scale': 'major-scale-modes',
  'Melodic Minor': 'melodic-minor-modes',
  'Harmonic Minor': 'harmonic-minor-modes',
  'Harmonic Major': 'harmonic-major-modes',
  'Double Harmonic Major': 'double-harmonic-major-modes',
  'Major Pentatonic': 'major-pentatonic-modes',
  'Blues Scale': 'blues-scale-modes'
};

/**
 * Mode name to scale family mapping
 * Used to determine which scale family a mode belongs to
 */
export const MODE_TO_SCALE_FAMILY: { [key: string]: string } = {
  // Specific modified modes (these take priority over base mode checks)
  'Locrian ♮6': 'Harmonic Minor',
  'Locrian n6': 'Harmonic Minor',
  'Locrian ♮2': 'Melodic Minor',
  'Locrian n2': 'Melodic Minor',
  'Dorian ♭5': 'Harmonic Major',
  'Dorian b5': 'Harmonic Major',
  'Locrian ♭7♭5': 'Harmonic Major',
  'Locrian b7b5': 'Harmonic Major',
  'Dorian ♭2': 'Melodic Minor',
  'Dorian b2': 'Melodic Minor',
  'Lydian Augmented': 'Melodic Minor',
  'Lydian Dominant': 'Melodic Minor',
  'Mixolydian ♭6': 'Melodic Minor',
  'Mixolydian b6': 'Melodic Minor',
  'Altered': 'Melodic Minor',
  'Ionian ♯5': 'Harmonic Minor',
  'Ionian #5': 'Harmonic Minor',
  'Ukrainian Dorian': 'Harmonic Minor',
  'Dorian ♯4': 'Harmonic Minor',
  'Dorian #4': 'Harmonic Minor',
  'Phrygian Dominant': 'Harmonic Minor',
  'Lydian ♯2': 'Harmonic Minor',
  'Lydian #2': 'Harmonic Minor',
  'Super-Locrian': 'Harmonic Minor',
  'Phrygian ♭4': 'Harmonic Major',
  'Phrygian b4': 'Harmonic Major',
  'Lydian ♭3': 'Harmonic Major',
  'Lydian b3': 'Harmonic Major',
  'Mixolydian ♭2': 'Harmonic Major',
  'Mixolydian b2': 'Harmonic Major',
  'Lydian Aug ♯2': 'Harmonic Major',
  'Lydian Aug #2': 'Harmonic Major',
  
  // Scale family names
  'Harmonic Minor': 'Harmonic Minor',
  'Melodic Minor': 'Melodic Minor',
  'Jazz Minor': 'Melodic Minor',
  'Harmonic Major': 'Harmonic Major',
  'Double Harmonic': 'Double Harmonic Major',
  'Byzantine': 'Double Harmonic Major',
  'Blues': 'Blues Scale',
  'Blues Scale': 'Blues Scale',
  'Major Pentatonic': 'Major Pentatonic',
  'Minor Pentatonic': 'Major Pentatonic', // Minor pentatonic is mode 5 of major pentatonic
  
  // Basic major scale modes
  'Ionian': 'Major Scale',
  'Dorian': 'Major Scale',
  'Phrygian': 'Major Scale',
  'Lydian': 'Major Scale',
  'Mixolydian': 'Major Scale',
  'Aeolian': 'Major Scale',
  'Locrian': 'Major Scale',
  'Natural Minor': 'Major Scale',
  'Minor': 'Major Scale',
};

/**
 * Mode name to index mapping for each scale family
 */
export const MODE_TO_INDEX_MAPPINGS: { [scaleName: string]: { [modeName: string]: number } } = {
  'Major Scale': {
    'Ionian': 0,
    'Dorian': 1,
    'Phrygian': 2,
    'Lydian': 3,
    'Mixolydian': 4,
    'Aeolian': 5,
    'Locrian': 6,
    'Natural Minor': 5, // Aeolian
    'Minor': 5, // Aeolian
  },
  'Melodic Minor': {
    'Jazz Minor': 0,
    'Melodic Minor': 0,
    'Dorian ♭2': 1,
    'Dorian b2': 1,
    'Lydian Augmented': 2,
    'Lydian Dominant': 3,
    'Mixolydian ♭6': 4,
    'Mixolydian b6': 4,
    'Locrian ♮2': 5,
    'Locrian n2': 5,
    'Altered': 6
  },
  'Harmonic Minor': {
    'Harmonic Minor': 0,
    'Locrian ♮6': 1,
    'Locrian n6': 1,
    'Ionian ♯5': 2,
    'Ionian #5': 2,
    'Ukrainian Dorian': 3,
    'Dorian ♯4': 3,
    'Dorian #4': 3,
    'Phrygian Dominant': 4,
    'Lydian ♯2': 5,
    'Lydian #2': 5,
    'Super-Locrian': 6
  },
  'Harmonic Major': {
    'Harmonic Major': 0,
    'Dorian ♭5': 1,
    'Dorian b5': 1,
    'Phrygian ♭4': 2,
    'Phrygian b4': 2,
    'Lydian ♭3': 3,
    'Lydian b3': 3,
    'Mixolydian ♭2': 4,
    'Mixolydian b2': 4,
    'Lydian Aug ♯2': 5,
    'Lydian Aug #2': 5,
    'Locrian ♭7♭5': 6,
    'Locrian b7b5': 6
  },
  'Double Harmonic Major': {
    'Byzantine': 0,
    'Double Harmonic': 0,
    'Lydian ♯2 ♯6': 1,
    'Lydian #2 #6': 1,
    'Ultraphrygian': 2,
    'Hungarian Minor': 3,
    'Oriental': 4,
    'Ionian Aug ♯2': 5,
    'Ionian Aug #2': 5,
    'Ultra-Locrian': 6
  },
  'Major Pentatonic': {
    'Major Pentatonic': 0,
    'Suspended': 1,
    'Jue': 2,
    'Zhi': 3,
    'Minor Pentatonic': 4
  },
  'Blues Scale': {
    'Blues Scale': 0,
    'Blues Mode II': 1,
    'Blues Mode III': 2,
    'Blues Mode IV': 3,
    'Blues Mode V': 4,
    'Blues Mode VI': 5
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract base mode name from modified mode names
 * e.g., "Locrian ♮6" -> "Locrian"
 */
export function extractBaseModeFromName(fullModeName: string): string {
  const cleanedName = fullModeName
    .replace(/\s*[♯#♭b]\d+/g, '') // Remove accidentals with numbers (♯5, ♭6, etc.)
    .replace(/\s*[♯#♭b]/g, '') // Remove standalone accidentals
    .replace(/\s*\d+/g, '') // Remove standalone numbers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Handle special cases
  if (cleanedName.includes('Natural')) {
    return cleanedName.replace(/Natural\s*/i, '').trim();
  }

  return cleanedName;
}

/**
 * Determine scale family from mode name
 */
export function getScaleFamilyFromMode(modeName: string): string {
  // Check direct mapping first
  if (MODE_TO_SCALE_FAMILY[modeName]) {
    return MODE_TO_SCALE_FAMILY[modeName];
  }

  // Check for partial matches (for modes with additional descriptors)
  for (const [modeKey, scaleFamily] of Object.entries(MODE_TO_SCALE_FAMILY)) {
    if (modeName.includes(modeKey)) {
      return scaleFamily;
    }
  }

  // Check base mode name
  const baseMode = extractBaseModeFromName(modeName);
  if (MODE_TO_SCALE_FAMILY[baseMode]) {
    return MODE_TO_SCALE_FAMILY[baseMode];
  }

  // Default fallback
  return 'Major Scale';
}

/**
 * Get mode index within its scale family
 */
export function getModeIndex(scaleName: string, modeName: string): number | null {
  const modeMapping = MODE_TO_INDEX_MAPPINGS[scaleName];
  if (!modeMapping) return null;

  // Try direct lookup first
  if (modeMapping[modeName] !== undefined) {
    return modeMapping[modeName];
  }

  // Try base mode name
  const baseModeName = extractBaseModeFromName(modeName);
  if (modeMapping[baseModeName] !== undefined) {
    return modeMapping[baseModeName];
  }

  return null;
}

/**
 * Convert note name to pitch class
 */
export function noteToPitchClass(noteName: string): number | null {
  const normalizedNote = noteName.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
  return NOTE_TO_PITCH_CLASS[normalizedNote] ?? null;
}

/**
 * Generate highlight ID for scale tables
 */
export function generateHighlightId(scaleName: string, modeName: string, modeRootNote: string): string | null {
  // Convert mode root note to pitch class
  const modeRootPitchClass = noteToPitchClass(modeRootNote);
  if (modeRootPitchClass === null) return null;

  const tableId = SCALE_TO_TABLE_ID[scaleName];
  if (!tableId) return null;

  const modeIndex = getModeIndex(scaleName, modeName);
  if (modeIndex === null) return null;

  // Calculate the parent scale root from the mode root and mode index
  const scaleData = allScaleData.find(scale => scale.name === scaleName);
  if (!scaleData) return null;

  // Get the interval from parent scale root to this mode's root
  const modeStartInterval = scaleData.parentScaleIntervals[modeIndex];

  // Calculate parent scale root: modeRoot - modeStartInterval
  const parentScaleRootPitchClass = (modeRootPitchClass - modeStartInterval + 12) % 12;

  // Find the key row index for the parent scale root
  const keyRowIndex = PARENT_KEY_INDICES.indexOf(parentScaleRootPitchClass);
  if (keyRowIndex === -1) return null;

  return `${tableId}-${keyRowIndex}-${modeIndex}`;
}

// ============================================================================
// VALIDATION AND DEBUGGING UTILITIES
// ============================================================================

/**
 * Validate that all mappings are consistent
 */
export function validateMappings(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check that all scale families in MODE_TO_SCALE_FAMILY have corresponding entries in other mappings
  const scaleFamilies = new Set(Object.values(MODE_TO_SCALE_FAMILY));
  
  for (const scaleFamily of scaleFamilies) {
    if (!SCALE_TO_TABLE_ID[scaleFamily]) {
      errors.push(`Scale family "${scaleFamily}" missing from SCALE_TO_TABLE_ID`);
    }
    if (!MODE_TO_INDEX_MAPPINGS[scaleFamily]) {
      errors.push(`Scale family "${scaleFamily}" missing from MODE_TO_INDEX_MAPPINGS`);
    }
  }

  // Check that all modes in MODE_TO_INDEX_MAPPINGS have corresponding entries in MODE_TO_SCALE_FAMILY
  for (const [scaleFamily, modes] of Object.entries(MODE_TO_INDEX_MAPPINGS)) {
    for (const modeName of Object.keys(modes)) {
      const mappedScaleFamily = getScaleFamilyFromMode(modeName);
      if (mappedScaleFamily !== scaleFamily) {
        errors.push(`Mode "${modeName}" maps to "${mappedScaleFamily}" but is defined in "${scaleFamily}"`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all available modes for debugging
 */
export function getAllModes(): { [scaleFamily: string]: string[] } {
  const result: { [scaleFamily: string]: string[] } = {};
  
  for (const [scaleFamily, modes] of Object.entries(MODE_TO_INDEX_MAPPINGS)) {
    result[scaleFamily] = Object.keys(modes);
  }
  
  return result;
}

/**
 * Get mapping statistics for debugging
 */
export function getMappingStats() {
  const scaleFamilies = Object.keys(MODE_TO_INDEX_MAPPINGS);
  const totalModes = Object.values(MODE_TO_INDEX_MAPPINGS).reduce(
    (sum, modes) => sum + Object.keys(modes).length, 
    0
  );
  const totalNoteVariants = Object.keys(NOTE_TO_PITCH_CLASS).length;

  return {
    scaleFamilies: scaleFamilies.length,
    totalModes,
    totalNoteVariants,
    scaleFamilyNames: scaleFamilies,
  };
}