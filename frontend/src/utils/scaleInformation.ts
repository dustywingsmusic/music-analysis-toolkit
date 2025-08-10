/**
 * Scale Information Utility
 * Provides compact scale formulas and note sequences for different keys and modes
 */

// Note mappings for chromatic scale
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Major scale intervals (semitones from root)
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Mode intervals (semitones from root)
const MODE_INTERVALS: Record<string, number[]> = {
  'Ionian': [0, 2, 4, 5, 7, 9, 11],      // Major
  'Dorian': [0, 2, 3, 5, 7, 9, 10],      // Natural minor with raised 6
  'Phrygian': [0, 1, 3, 5, 7, 8, 10],    // Natural minor with lowered 2
  'Lydian': [0, 2, 4, 6, 7, 9, 11],      // Major with raised 4
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],  // Major with lowered 7
  'Aeolian': [0, 2, 3, 5, 7, 8, 10],     // Natural minor
  'Locrian': [0, 1, 3, 5, 6, 8, 10]      // Diminished
};

// Mode formulas (scale degrees)
const MODE_FORMULAS: Record<string, string[]> = {
  'Ionian': ['1', '2', '3', '4', '5', '6', '7'],
  'Dorian': ['1', '2', '♭3', '4', '5', '6', '♭7'],
  'Phrygian': ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
  'Lydian': ['1', '2', '3', '#4', '5', '6', '7'],
  'Mixolydian': ['1', '2', '3', '4', '5', '6', '♭7'],
  'Aeolian': ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
  'Locrian': ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7']
};

// Scale degree names
const SCALE_DEGREE_NAMES: Record<string, string> = {
  '1': 'root',
  '2': 'major second',
  '♭2': 'minor second',
  '3': 'major third',
  '♭3': 'minor third',
  '4': 'perfect fourth',
  '#4': 'augmented fourth',
  '5': 'perfect fifth',
  '♭5': 'diminished fifth',
  '6': 'major sixth',
  '♭6': 'minor sixth',
  '7': 'major seventh',
  '♭7': 'minor seventh'
};

function getNoteIndex(note: string): number {
  // Handle both sharp and flat notations
  const sharpIndex = CHROMATIC_NOTES.indexOf(note);
  if (sharpIndex !== -1) return sharpIndex;

  const flatIndex = FLAT_NOTES.indexOf(note);
  if (flatIndex !== -1) return flatIndex;

  // Handle enharmonic equivalents
  const enharmonics: Record<string, string> = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#'
  };

  if (enharmonics[note]) {
    return getNoteIndex(enharmonics[note]);
  }

  return 0; // Default to C if not found
}

function shouldUseSharps(keyNote: string): boolean {
  // Keys that typically use sharps
  const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
  return sharpKeys.includes(keyNote);
}

function getScaleNotes(rootNote: string, intervals: number[]): string[] {
  const rootIndex = getNoteIndex(rootNote);
  const useSharpNotation = shouldUseSharps(rootNote);
  const noteArray = useSharpNotation ? CHROMATIC_NOTES : FLAT_NOTES;

  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return noteArray[noteIndex];
  });
}

export interface ScaleInformation {
  name: string;
  formula: string[];
  notes: string[];
  scaleString: string;
  derivation?: string;
}

export function getMajorScaleInfo(keyCenter: string): ScaleInformation {
  const rootNote = keyCenter.replace(' major', '').replace(' minor', '');
  const notes = getScaleNotes(rootNote, MAJOR_SCALE_INTERVALS);
  const formula = MODE_FORMULAS['Ionian'];

  return {
    name: `${rootNote} major scale`,
    formula,
    notes,
    scaleString: notes.join(' – ') + ` – [${rootNote}]`,
    derivation: `The ${rootNote} major scale follows the major scale formula`
  };
}

export function getModalScaleInfo(modeName: string): ScaleInformation {
  // Parse mode name (e.g., "G Mixolydian" -> root: "G", mode: "Mixolydian")
  const parts = modeName.split(' ');
  const rootNote = parts[0];
  const mode = parts.slice(1).join(' ');

  if (!MODE_INTERVALS[mode] || !MODE_FORMULAS[mode]) {
    // Fallback for unknown modes
    return {
      name: modeName,
      formula: ['1', '2', '3', '4', '5', '6', '7'],
      notes: getScaleNotes(rootNote, MAJOR_SCALE_INTERVALS),
      scaleString: '',
      derivation: `Mode information not available for ${mode}`
    };
  }

  const intervals = MODE_INTERVALS[mode];
  const formula = MODE_FORMULAS[mode];
  const notes = getScaleNotes(rootNote, intervals);

  // Determine parent major scale for derivation
  const modeIndex = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'].indexOf(mode);
  let parentKeyNote = rootNote;

  if (modeIndex !== -1) {
    // Calculate parent major scale root
    // Mode intervals from major scale: Ionian=0, Dorian=2, Phrygian=4, Lydian=5, Mixolydian=7, Aeolian=9, Locrian=11
    const modeToMajorOffset = [0, 2, 4, 5, 7, 9, 11][modeIndex];
    const parentRootIndex = (getNoteIndex(rootNote) - modeToMajorOffset + 12) % 12;
    const useSharpNotation = shouldUseSharps(rootNote);
    const noteArray = useSharpNotation ? CHROMATIC_NOTES : FLAT_NOTES;
    parentKeyNote = noteArray[parentRootIndex];
  }

  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];
  const derivation = modeIndex !== -1
    ? `The ${modeName} scale is derived from the ${ordinals[modeIndex]} mode of the ${parentKeyNote} major scale`
    : `Modal scale derived from ${mode} mode`;

  return {
    name: `${modeName} scale`,
    formula,
    notes,
    scaleString: notes.join(' – ') + ` – [${rootNote}]`,
    derivation
  };
}

export function getCompactScaleDisplay(scaleInfo: ScaleInformation): {
  formula: string;
  scaleString: string;
  derivation: string;
} {
  return {
    formula: scaleInfo.formula.join(' – '),
    scaleString: scaleInfo.scaleString,
    derivation: scaleInfo.derivation || ''
  };
}
