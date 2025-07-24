import { allScaleData, NOTES, PARENT_KEY_INDICES, PARENT_KEYS } from '../constants/scales';
import { generateScaleFromIntervals } from '../utils/music';

export interface ModeFromRoot {
  id: string;
  name: string;
  commonName?: string;
  formula: string;
  intervals: number[];
  notes: string[];
  tableId: string;
  modeIndex: number;
  parentScaleName: string;
  parentScaleRootNote: string;
  character?: string;
}

/**
 * Build all possible modes from a given root note using existing scale data
 * @param rootNote - The root note (e.g., 'C', 'D', 'F#', 'Bb')
 * @returns Array of ModeFromRoot objects
 */
export const buildModesFromRoot = (rootNote: string): ModeFromRoot[] => {
  // Find the pitch class index for the root note
  const rootPitchClass = findPitchClassIndex(rootNote);
  
  if (rootPitchClass === -1) {
    throw new Error(`Invalid root note: ${rootNote}. Valid notes are: ${NOTES.join(', ')}`);
  }

  const modes: ModeFromRoot[] = [];

  // Process each scale family
  allScaleData.forEach(scaleFamily => {
    scaleFamily.modeIntervals.forEach((intervals, modeIndex) => {
      // Calculate the parent scale root that would produce this mode from our root
      // The mode starts at intervals[0] (which should be 0), so we need to find
      // what parent scale root would put this mode at our desired root note

      // Generate the mode notes starting from rootNote using context-aware enharmonics
      const modeNotes = generateScaleFromIntervals(rootPitchClass, rootNote, intervals);

      // Calculate parent scale root note
      // If this is mode index N of a scale, the parent scale root is N semitones below our root
      const parentScaleRootIndex = (rootPitchClass - modeIndex + 12) % 12;
      const parentScaleRootNote = PARENT_KEYS[parentScaleRootIndex as keyof typeof PARENT_KEYS];

      // Get mode name from headers (skip first header which is usually "Mode / Scale Degree")
      const modeName = scaleFamily.headers[modeIndex + 1] || `Mode ${modeIndex + 1}`;
      
      // Get common name if available
      const commonName = scaleFamily.commonNames?.[modeIndex] || 
                        scaleFamily.alternateNames?.[modeIndex];

      modes.push({
        id: `${scaleFamily.tableId}-mode-${modeIndex}-root-${rootPitchClass}`,
        name: modeName,
        commonName,
        formula: scaleFamily.formulas[modeIndex],
        intervals,
        notes: modeNotes,
        tableId: scaleFamily.tableId,
        modeIndex,
        parentScaleName: scaleFamily.name,
        parentScaleRootNote,
        character: getCharacterDescription(scaleFamily.name, modeIndex, modeName)
      });
    });
  });

  // Sort modes by scale family importance and then by mode index
  return modes.sort((a, b) => {
    // Prioritize major scale modes, then melodic minor, then others
    const scaleOrder = [
      'Major Scale',
      'Melodic Minor',
      'Harmonic Minor',
      'Harmonic Major',
      'Double Harmonic Major',
      'Major Pentatonic',
      'Blues Scale'
    ];
    const aOrder = scaleOrder.indexOf(a.parentScaleName);
    const bOrder = scaleOrder.indexOf(b.parentScaleName);
    
    if (aOrder !== -1 && bOrder !== -1) {
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.modeIndex - b.modeIndex;
    }
    if (aOrder !== -1) return -1;
    if (bOrder !== -1) return 1;
    
    // For other scales, sort by name then mode index
    const nameCompare = a.parentScaleName.localeCompare(b.parentScaleName);
    if (nameCompare !== 0) return nameCompare;
    return a.modeIndex - b.modeIndex;
  });
};

/**
 * Find the pitch class index for a given note name
 * Handles various note name formats (C, C#, Db, C♯, D♭, etc.)
 */
function findPitchClassIndex(noteName: string): number {
  const cleanNote = noteName.trim().toUpperCase();
  
  // Convert common sharp/flat symbols to Unicode
  const normalizedNote = cleanNote
    .replace(/B/g, '♭')
    .replace(/#/g, '♯')
    .replace(/BB/g, '♭♭'); // Handle double flats
  
  return NOTES.findIndex(note => {
    const noteUpper = note.toUpperCase();
    // Split compound note names (like "C♯/D♭") and check each part
    const noteParts = noteUpper.split('/');
    return noteParts.some(part => part === normalizedNote || part === cleanNote);
  });
}

/**
 * Get character description for a mode based on scale family and mode index
 */
function getCharacterDescription(scaleName: string, modeIndex: number, modeName: string): string {
  // Character descriptions for common modes
  const descriptions: Record<string, string[]> = {
    'Major Scale': [
      'Bright, happy, stable - the foundation of Western music',
      'Minor with bright 6th - jazzy, sophisticated',
      'Dark, Spanish flavor - exotic and mysterious',
      'Dreamy, floating - augmented 4th creates ethereal quality',
      'Dominant, bluesy - perfect for rock and blues',
      'Sad, melancholic - natural minor scale',
      'Unstable, diminished - rarely used as tonal center'
    ],
    'Melodic Minor': [
      'Jazz minor - sophisticated, modern sound',
      'Dark with flat 2nd - haunting quality',
      'Augmented, dreamy - raised 5th creates tension',
      'Lydian dominant - jazz standard, sophisticated',
      'Hindu scale - exotic, Eastern flavor',
      'Half-diminished - dark but stable',
      'Altered dominant - highly dissonant, jazz fusion'
    ],
    'Harmonic Minor': [
      'Classical minor - dramatic, exotic augmented 2nd',
      'Locrian with natural 6th - unusual but usable',
      'Major with augmented 5th - bright but tense',
      'Ukrainian Dorian - folk music character',
      'Phrygian dominant - Middle Eastern, Spanish',
      'Lydian with sharp 2nd - very exotic',
      'Super-Locrian - extremely dissonant'
    ],
    'Harmonic Major': [
      'Major with flat 6th - unique, somewhat dark',
      'Dorian with flat 5th - unstable character',
      'Phrygian with flat 4th - very exotic',
      'Lydian with flat 3rd - unusual major/minor blend',
      'Mixolydian with flat 2nd - Eastern flavor',
      'Lydian augmented with sharp 2nd - highly exotic',
      'Ultra-diminished - extremely unstable'
    ]
  };
  
  const scaleDescriptions = descriptions[scaleName];
  if (scaleDescriptions && scaleDescriptions[modeIndex]) {
    return scaleDescriptions[modeIndex];
  }
  
  // Fallback descriptions based on mode name patterns
  if (modeName.toLowerCase().includes('major') || modeName.toLowerCase().includes('ionian')) {
    return 'Bright, stable major character';
  }
  if (modeName.toLowerCase().includes('minor') || modeName.toLowerCase().includes('aeolian')) {
    return 'Dark, melancholic minor character';
  }
  if (modeName.toLowerCase().includes('dorian')) {
    return 'Minor with bright 6th - sophisticated';
  }
  if (modeName.toLowerCase().includes('phrygian')) {
    return 'Dark with flat 2nd - Spanish/exotic flavor';
  }
  if (modeName.toLowerCase().includes('lydian')) {
    return 'Bright with raised 4th - dreamy, floating';
  }
  if (modeName.toLowerCase().includes('mixolydian')) {
    return 'Major with flat 7th - bluesy, dominant';
  }
  if (modeName.toLowerCase().includes('locrian')) {
    return 'Diminished, unstable - rarely used as tonal center';
  }
  
  return 'Unique modal character - explore its distinctive sound';
}

/**
 * Get all available root notes for building modes
 */
export const getAvailableRootNotes = (): string[] => {
  return NOTES.slice(); // Return a copy of the NOTES array
};

/**
 * Validate if a note name is valid
 */
export const isValidRootNote = (noteName: string): boolean => {
  return findPitchClassIndex(noteName) !== -1;
};