
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
