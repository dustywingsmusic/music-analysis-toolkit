// This module contains the logic for chord detection and analysis

// Define chord templates with intervals from the root note
const chordTemplates = {
    // Basic triads
    'major': { intervals: [0, 4, 7], symbol: '', name: 'Major' },
    'minor': { intervals: [0, 3, 7], symbol: 'm', name: 'Minor' },
    'diminished': { intervals: [0, 3, 6], symbol: '°', name: 'Diminished' },
    'augmented': { intervals: [0, 4, 8], symbol: '+', name: 'Augmented' },
    
    // Suspended chords
    'sus2': { intervals: [0, 2, 7], symbol: 'sus2', name: 'Suspended 2nd' },
    'sus4': { intervals: [0, 5, 7], symbol: 'sus4', name: 'Suspended 4th' },
    
    // Seventh chords
    'major7': { intervals: [0, 4, 7, 11], symbol: 'maj7', name: 'Major 7th' },
    'minor7': { intervals: [0, 3, 7, 10], symbol: 'm7', name: 'Minor 7th' },
    'dominant7': { intervals: [0, 4, 7, 10], symbol: '7', name: 'Dominant 7th' },
    'diminished7': { intervals: [0, 3, 6, 9], symbol: 'dim7', name: 'Diminished 7th' },
    'halfDiminished7': { intervals: [0, 3, 6, 10], symbol: 'm7♭5', name: 'Half-Diminished 7th' },
    'augmented7': { intervals: [0, 4, 8, 10], symbol: '7+', name: 'Augmented 7th' },
    'minorMaj7': { intervals: [0, 3, 7, 11], symbol: 'm(maj7)', name: 'Minor Major 7th' }
};

const noteNames = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export interface ChordMatch {
    chordSymbol: string;
    chordName: string;
    root: number;
    rootName: string;
    intervals: number[];
    confidence: number;
    inversion: string;
    bassNote: number;
}

/**
 * Finds the best chord matches for a given set of MIDI note numbers
 * @param noteNumbers - Array of MIDI note numbers
 * @returns Array of possible chord matches, sorted by confidence
 */
export function findChordMatches(noteNumbers: number[]): ChordMatch[] {
    if (noteNumbers.length < 3) {
        return []; // Need at least 3 notes for a chord
    }

    // Convert to pitch classes and remove duplicates
    // Pitch classes are from C to B (C = 0, C# = 1, ..., B = 11) and then sorted. So midi note 60 = 0, 61 = 1, etc.
    const pitchClasses = [...new Set(noteNumbers.map(note => note % 12))];
    pitchClasses.sort((a, b) => a - b);

    const matches: ChordMatch[] = [];

    // Try each pitch class as a potential root
    for (let rootPitch of pitchClasses) {
        // Calculate intervals from this root
        const intervals = pitchClasses.map(pc => (pc - rootPitch + 12) % 12);
        // intervals.sort((a, b) => a - b);

        // Check against each chord template
        for (let chordType in chordTemplates) {
            const template = chordTemplates[chordType as keyof typeof chordTemplates];
            const templateIntervals = template.intervals;

            // Check if all template intervals are present
            const hasAllIntervals = templateIntervals.every(interval => intervals.includes(interval));

            if (hasAllIntervals) {
                const rootName = noteNames[rootPitch];
                const chordSymbol = rootName + template.symbol;
                
                // Calculate confidence based on how well the chord fits
                const confidence = calculateConfidence(intervals, templateIntervals);
                
                // Check for inversion
                const bassNote = Math.min(...noteNumbers) % 12;
                const inversion = bassNote !== rootPitch ? `/${noteNames[bassNote]}` : '';

                matches.push({
                    chordSymbol: chordSymbol + inversion,
                    chordName: template.name,
                    root: rootPitch,
                    rootName: rootName,
                    intervals: intervals,
                    confidence: confidence,
                    inversion: inversion,
                    bassNote: bassNote
                });
            }
        }
    }

    // Sort by confidence (highest first) and return top matches
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches.slice(0, 5); // Return top 5 matches
}

/**
 * Calculates confidence score for chord match
 * @param playedIntervals - Intervals found in the played chord
 * @param templateIntervals - Expected intervals for the chord type
 * @returns Confidence score between 0 and 1
 */
function calculateConfidence(playedIntervals: number[], templateIntervals: number[]): number {
    const totalTemplateNotes = templateIntervals.length;
    const matchingNotes = templateIntervals.filter(interval => playedIntervals.includes(interval)).length;
    const extraNotes = playedIntervals.length - totalTemplateNotes;
    
    // Base confidence on how many template notes are present
    let confidence = matchingNotes / totalTemplateNotes;
    
    // Penalize for extra notes (but not too harshly, as extensions are common)
    if (extraNotes > 0) {
        confidence -= extraNotes * 0.1;
    }
    
    // Bonus for exact match
    if (playedIntervals.length === totalTemplateNotes && extraNotes === 0) {
        confidence += 0.1;
    }

    return Math.max(0, Math.min(1, confidence)); // Clamp between 0 and 1
}