
import { allScaleData, NOTE_LETTERS, PITCH_CLASS_NAMES } from '../constants/scales';

export const noteToPc: { [key: string]: number } = {
    'C': 0, 'B♯': 0, 'D♭♭': 0,
    'C♯': 1, 'D♭': 1,
    'D': 2, 'C♯♯': 2, 'E♭♭': 2,
    'E♭': 3, 'D♯': 3,
    'E': 4, 'F♭': 4, 'D♯♯': 4,
    'F': 5, 'E♯': 5, 'G♭♭': 5,
    'F♯': 6, 'G♭': 6,
    'G': 7, 'F♯♯': 7, 'A♭♭': 7,
    'A♭': 8, 'G♯': 8,
    'A': 9, 'G♯♯': 9, 'B♭♭': 9,
    'B♭': 10, 'A♯': 10,
    'B': 11, 'C♭': 11, 'A♯♯': 11
};

export const generateDiatonicScale = (rootPitchClass: number, rootName: string, intervalPattern: number[]) => {
    let scaleNotes = [rootName];
    let currentPitch = rootPitchClass;
    let rootLetter_idx = NOTE_LETTERS.indexOf(rootName.charAt(0));

    // This loop is for the notes after the root
    for (let i = 0; i < intervalPattern.length; i++) {
        currentPitch = (currentPitch + intervalPattern[i]) % 12;
        const nextLetter = NOTE_LETTERS[(rootLetter_idx + i + 1) % 7];

        let foundNote = false;
        const pitchNameOptions = PITCH_CLASS_NAMES[currentPitch];

        if (pitchNameOptions) {
            // Prioritize spellings that match the expected letter name
            for (const spelling in pitchNameOptions) {
                const noteName = pitchNameOptions[spelling as keyof typeof pitchNameOptions];
                if (noteName && noteName.charAt(0) === nextLetter) {
                    scaleNotes.push(noteName);
                    foundNote = true;
                    break;
                }
            }
        }
        
        if (!foundNote && pitchNameOptions) {
             const fallbackName = pitchNameOptions.normal || pitchNameOptions.flat || pitchNameOptions.sharp || "?";
             scaleNotes.push(fallbackName);
        } else if (!foundNote) {
            scaleNotes.push("?");
        }
    }
    return scaleNotes;
};

const majorScalePattern = allScaleData.find(s => s.tableId === 'major-scale-modes')?.parentScaleIntervalPattern; 
// Natural minor scale (Aeolian) step pattern: W-H-W-W-H-W-W
const minorScalePattern = [2, 1, 2, 2, 1, 2]; 

export const getNotesForMusicalKey = (musicalKey: string): string[] => {
    if (!majorScalePattern) {
        console.error("Major scale pattern not found in scale data.");
        return [];
    }

    const parts = musicalKey.split(' ');
    const keyType = parts.pop();
    const rootName = parts.join(' ');

    const rootPitchClass = noteToPc[rootName];
    if (rootPitchClass === undefined) {
        console.error(`Could not find pitch class for root note: ${rootName}`);
        return [];
    }

    if (keyType === 'Major') {
        // Major scale has 7 notes, so the interval pattern between them has 6 elements.
        return generateDiatonicScale(rootPitchClass, rootName, majorScalePattern);
    } else if (keyType === 'Minor') {
        return generateDiatonicScale(rootPitchClass, rootName, minorScalePattern);
    }
    
    console.warn(`Unknown key type: ${keyType}`);
    return [];
};

/**
 * Provides a 12-note chromatic scale with enharmonic spellings
 * appropriate for the given musical tonic. Sharp keys will prefer sharps (C#),
 * and flat keys will prefer flats (Db).
 * @param tonic The musical tonic, e.g., "G" or "B♭".
 * @returns An array of 12 chromatic note names.
 */
export const getChromaticScaleWithEnharmonics = (tonic: string): string[] => {
    // Determine whether to prefer sharps or flats based on the tonic.
    // Flat keys are F, and anything with a flat in the name.
    const isFlatKey = tonic.includes('b') || tonic.includes('♭') || tonic === 'F';

    return [
        "C",
        isFlatKey ? "D♭" : "C♯",
        "D",
        isFlatKey ? "E♭" : "D♯",
        "E",
        "F",
        isFlatKey ? "G♭" : "F♯",
        "G",
        isFlatKey ? "A♭" : "G♯",
        "A",
        isFlatKey ? "B♭" : "A♯",
        "B",
    ];
};

// Constants for note validation and conversion
const PITCH_CLASS_RANGE = { MIN: 0, MAX: 11 };
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/**
 * Validates if a string is a valid note name
 * @param str The string to validate
 * @returns true if the string is a valid note name
 */
export const isValidNoteName = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  // Valid note names: A, B, C, D, E, F, G with optional sharps (#) or flats (b/♭)
  const notePattern = /^[A-G][#b♭]?$/;
  return notePattern.test(str);
};

/**
 * Validates if a number is a valid pitch class (0-11)
 * @param pitch The number to validate
 * @returns true if the number is a valid pitch class
 */
export const isValidPitchClass = (pitch: number): boolean => {
  return Number.isInteger(pitch) && pitch >= PITCH_CLASS_RANGE.MIN && pitch <= PITCH_CLASS_RANGE.MAX;
};

/**
 * Safely converts a pitch class number to a note name
 * @param pitch The pitch class number (0-11)
 * @returns The note name, or 'C' as fallback for invalid input
 */
export const safeGetNoteName = (pitch: number): string => {
  if (!isValidPitchClass(pitch)) {
    console.warn(`Invalid pitch class: ${pitch}. Using C as fallback.`);
    return 'C';
  }
  return NOTE_NAMES[pitch];
};

/**
 * Normalizes a note name by converting ASCII sharp to Unicode and removing slash notation
 * @param name The note name to normalize
 * @returns The normalized note name
 */
export const normalizeNoteName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  // Convert ASCII sharp to Unicode sharp and extract first part before "/"
  return name.replace('#', '♯').split('/')[0];
};

/**
 * Safely parses a comma-separated string of played notes
 * @param playedNotes The string containing played notes
 * @returns Array of trimmed note names
 */
export const safeParsePlayedNotes = (playedNotes: string): string[] => {
  if (!playedNotes || typeof playedNotes !== 'string') return [];
  return playedNotes.split(', ').map(note => note.trim()).filter(note => note.length > 0);
};

/**
 * Parses a full mode string into tonic and mode components
 * @param fullMode The full mode string (e.g., "F Ionian" or "Ionian")
 * @param fallbackTonic Optional fallback tonic if none found in the string
 * @returns Object with tonic and mode properties
 */
export const parseTonicAndMode = (fullMode: string, fallbackTonic?: string): { tonic: string; mode: string } => {
  if (!fullMode || typeof fullMode !== 'string') {
    return { tonic: fallbackTonic || 'C', mode: 'Major' };
  }
  
  const parts = fullMode.split(' ');
  
  // Check if we have both tonic and mode, or just mode
  if (parts.length > 1 && isValidNoteName(parts[0])) {
    // Format: "F Ionian" - first part is a valid note name (tonic), rest is mode
    return {
      tonic: parts[0],
      mode: parts.slice(1).join(' ')
    };
  } else {
    // Format: "Ionian" or "Blues Mode II" - no valid note name at start
    return {
      tonic: fallbackTonic || 'C',
      mode: fullMode
    };
  }
};

/**
 * Extracts tonic from analysis data with fallback logic
 * @param analysis The analysis object
 * @param localAnalysis Optional local analysis data for fallback
 * @returns The extracted tonic note
 */
export const extractTonicFromAnalysis = (analysis: any, localAnalysis?: { suggestedTonic?: string }): string => {
  // Try to get tonic from scale notes first (first note is the mode root)
  if (analysis?.notes && Array.isArray(analysis.notes) && analysis.notes.length > 0) {
    return analysis.notes[0];
  }
  
  if (analysis?.scale && typeof analysis.scale === 'string') {
    // Parse scale string to get first note
    const scaleNotes = analysis.scale.trim().split(/\s+/);
    if (scaleNotes.length > 0) {
      return scaleNotes[0];
    }
  }
  
  return analysis?.parentScaleRootNote ||
         localAnalysis?.suggestedTonic ||
         'F';
};
