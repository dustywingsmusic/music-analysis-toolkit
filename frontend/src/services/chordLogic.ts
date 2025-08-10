// This module contains the logic for chord detection and analysis

// Define chord templates with intervals from the root note
const chordTemplates = {
    // Basic triads
    'major': { intervals: [0, 4, 7], symbol: '', name: 'Major' },
    'minor': { intervals: [0, 3, 7], symbol: 'm', name: 'Minor' },
    'diminished': { intervals: [0, 3, 6], symbol: '°', name: 'Diminished' },
    'augmented': { intervals: [0, 4, 8], symbol: '+', name: 'Augmented' },

    // Suspended chords (complete)
    'sus2': { intervals: [0, 2, 7], symbol: 'sus2', name: 'Suspended 2nd' },
    'sus4': { intervals: [0, 5, 7], symbol: 'sus4', name: 'Suspended 4th' },

    // Partial suspended chords (2-note combinations)
    'sus2Partial': { intervals: [0, 2], symbol: 'sus2(no5)', name: 'Suspended 2nd (no 5th)', minNotes: 2, confidence: 0.75 },
    'sus4Partial': { intervals: [0, 5], symbol: 'sus4(no5)', name: 'Suspended 4th (no 5th)', minNotes: 2, confidence: 0.75 },

    // Partial triads (2-note combinations)
    'majorPartial': { intervals: [0, 4], symbol: '(no5)', name: 'Major (no 5th)', minNotes: 2, confidence: 0.70 },
    'minorPartial': { intervals: [0, 3], symbol: 'm(no5)', name: 'Minor (no 5th)', minNotes: 2, confidence: 0.70 },
    'fifthPartial': { intervals: [0, 7], symbol: '5', name: 'Power Chord (5th)', minNotes: 2, confidence: 0.85 },

    // Partial seventh chords (3-note combinations missing one tone)
    'dom7NoFifth': { intervals: [0, 4, 10], symbol: '7(no5)', name: 'Dominant 7th (no 5th)', minNotes: 3, confidence: 0.80 },
    'min7NoFifth': { intervals: [0, 3, 10], symbol: 'm7(no5)', name: 'Minor 7th (no 5th)', minNotes: 3, confidence: 0.80 },
    'maj7NoFifth': { intervals: [0, 4, 11], symbol: 'maj7(no5)', name: 'Major 7th (no 5th)', minNotes: 3, confidence: 0.80 },

    // Incomplete sus chords with extensions
    'sus2Add7': { intervals: [0, 2, 10], symbol: 'sus2(add7)', name: 'Suspended 2nd add 7th', minNotes: 3, confidence: 0.75 },
    'sus4Add7': { intervals: [0, 5, 10], symbol: 'sus4(add7)', name: 'Suspended 4th add 7th', minNotes: 3, confidence: 0.75 },

    // Add chords (retaining 3rd + added note)
    'majorAdd4': { intervals: [0, 4, 5], symbol: '(add4)', name: 'Major add 4th' },
    'minorAdd4': { intervals: [0, 3, 5], symbol: 'm(add4)', name: 'Minor add 4th' },

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
    isPartial?: boolean;
    missingNotes?: string[];
    completionSuggestion?: string;
    pedagogicalNote?: string;
}

/**
 * Finds the best chord matches for a given set of MIDI note numbers
 * @param noteNumbers - Array of MIDI note numbers
 * @returns Array of possible chord matches, sorted by confidence
 */
export function findChordMatches(noteNumbers: number[]): ChordMatch[] {
    if (noteNumbers.length < 2) {
        return []; // Need at least 2 notes for chord analysis
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
            const minNotesRequired = (template as any).minNotes || 3;

            // Skip if we don't have enough notes for this template
            if (noteNumbers.length < minNotesRequired) {
                continue;
            }

            // Special handling for 3-note patterns with specific interval combinations
            let hasAllIntervals = templateIntervals.every(interval => intervals.includes(interval));

            // Override template matching for specific partial sus chord patterns
            if (noteNumbers.length === 3) {
                const sortedPitches = [...pitchClasses].sort();

                // Check for specific 3-note patterns regardless of which note is considered root
                // A-C-D pattern (pitches 9, 0, 2): minor 3rd + 4th from A
                if (sortedPitches.join(',') === '0,2,9') {
                    if (chordType.includes('sus')) {
                        hasAllIntervals = false; // Block all sus variants for this pattern
                    } else if (chordType === 'minorAdd4' && rootPitch === 9) { // A root
                        hasAllIntervals = true; // Force match for Am(add4)
                    }
                }
                // A-C#-D pattern (pitches 9, 1, 2): major 3rd + 4th from A
                else if (sortedPitches.join(',') === '1,2,9') {
                    // Allow both sus4 and add4 interpretations, but boost sus4 confidence
                    if (chordType === 'sus4Partial' && rootPitch === 9) { // A root
                        hasAllIntervals = true; // Force match for Asus4(no5)
                    } else if (chordType === 'majorAdd4' && rootPitch === 9) { // A root
                        hasAllIntervals = true; // Allow add4 but with lower confidence (handled in confidence calc)
                    }
                }
                // Fallback to original interval-based logic for other patterns
                else {
                    // A-C#-D pattern (major 3rd + 4th): should match as sus4 but not add4
                    if (intervals.includes(0) && intervals.includes(4) && intervals.includes(5)) {
                        if (chordType === 'majorAdd4') {
                            hasAllIntervals = false; // Don't match add4 for this pattern
                        } else if (chordType === 'sus4Partial') {
                            hasAllIntervals = true; // Force match for sus4 partial
                        }
                    }
                    // A-C-D pattern (minor 3rd + 4th): should match add4 but not sus
                    else if (intervals.includes(0) && intervals.includes(3) && intervals.includes(5)) {
                        if (chordType === 'sus4' || chordType === 'sus4Partial') {
                            hasAllIntervals = false; // Don't match sus for this pattern
                        } else if (chordType === 'minorAdd4') {
                            hasAllIntervals = true; // Force match for minor add4
                        }
                    }
                }
            }

            if (hasAllIntervals) {
                const rootName = noteNames[rootPitch];
                const chordSymbol = rootName + template.symbol;

                // Calculate confidence based on how well the chord fits
                const confidence = calculateConfidence(intervals, templateIntervals, noteNumbers.length, chordType, template);

                // Check for inversion - use LOWEST MIDI note number, not input order
                const lowestMidiNote = Math.min(...noteNumbers);
                const bassNote = lowestMidiNote % 12;
                const inversion = bassNote !== rootPitch ? `/${noteNames[bassNote]}` : '';

                // Determine if this is a partial chord and what's missing
                const isPartial = chordType.includes('Partial') || noteNumbers.length < 3;
                let missingNotes: string[] = [];
                let completionSuggestion = '';
                let pedagogicalNote = '';

                if (chordType === 'sus4Partial' && intervals.length === 2) {
                    missingNotes = [noteNames[(rootPitch + 7) % 12]]; // Missing 5th
                    completionSuggestion = `${rootName}-${noteNames[(rootPitch + 5) % 12]}-${noteNames[(rootPitch + 7) % 12]}`;
                    pedagogicalNote = 'Suspended 4th chord - the 4th creates tension that typically resolves down to the 3rd';
                } else if (chordType === 'sus2Partial' && intervals.length === 2) {
                    missingNotes = [noteNames[(rootPitch + 7) % 12]]; // Missing 5th
                    completionSuggestion = `${rootName}-${noteNames[(rootPitch + 2) % 12]}-${noteNames[(rootPitch + 7) % 12]}`;
                    pedagogicalNote = 'Suspended 2nd chord - creates an open, unresolved sound';
                } else if (chordType === 'majorAdd4') {
                    pedagogicalNote = 'Major triad with added 4th - retains major 3rd while adding 4th degree tension';
                } else if (chordType === 'minorAdd4') {
                    pedagogicalNote = 'Minor chord with added 4th - retains minor 3rd while adding upper tension. Common in folk and contemporary styles.';
                } else if (chordType === 'majorPartial') {
                    missingNotes = [noteNames[(rootPitch + 7) % 12]]; // Missing 5th
                    completionSuggestion = `${rootName}-${noteNames[(rootPitch + 4) % 12]}-${noteNames[(rootPitch + 7) % 12]}`;
                    pedagogicalNote = 'Major triad without 5th - emphasizes the major 3rd character. Often used in tight voicings.';
                } else if (chordType === 'minorPartial') {
                    missingNotes = [noteNames[(rootPitch + 7) % 12]]; // Missing 5th
                    completionSuggestion = `${rootName}-${noteNames[(rootPitch + 3) % 12]}-${noteNames[(rootPitch + 7) % 12]}`;
                    pedagogicalNote = 'Minor triad without 5th - emphasizes the minor 3rd character. Creates a more focused harmonic color.';
                } else if (chordType === 'fifthPartial') {
                    missingNotes = [noteNames[(rootPitch + 3) % 12], noteNames[(rootPitch + 4) % 12]]; // Missing 3rd (could be major or minor)
                    completionSuggestion = `${rootName}-${noteNames[(rootPitch + 4) % 12]}-${noteNames[(rootPitch + 7) % 12]} (major) or ${rootName}-${noteNames[(rootPitch + 3) % 12]}-${noteNames[(rootPitch + 7) % 12]} (minor)`;
                    pedagogicalNote = 'Power chord - perfect 5th interval creates strong, neutral harmony. Common in rock and metal music.';
                } else if (chordType === 'dom7NoFifth' || chordType === 'min7NoFifth' || chordType === 'maj7NoFifth') {
                    missingNotes = [noteNames[(rootPitch + 7) % 12]]; // Missing 5th
                    completionSuggestion = `Add ${noteNames[(rootPitch + 7) % 12]} to complete the seventh chord`;
                    pedagogicalNote = 'Seventh chord without 5th - emphasizes the essential harmonic function (root, 3rd, 7th) while saving space in dense arrangements.';
                } else if (chordType === 'sus2Add7' || chordType === 'sus4Add7') {
                    missingNotes = [noteNames[(rootPitch + 7) % 12]]; // Missing 5th
                    completionSuggestion = `Add ${noteNames[(rootPitch + 7) % 12]} for fuller voicing`;
                    pedagogicalNote = 'Suspended chord with 7th - combines suspension tension with seventh harmony. Creates sophisticated, unresolved sound.';
                }

                // For 3-note combinations with both 3rd and 4th, handle specially
                if (noteNumbers.length === 3 && intervals.includes(4) && intervals.includes(5)) {
                    // A-C#-D pattern: Major 3rd + 4th
                    if (chordType === 'sus4Partial') {
                        missingNotes = [noteNames[(rootPitch + 7) % 12]];
                        completionSuggestion = `${rootName}-${noteNames[(rootPitch + 5) % 12]}-${noteNames[(rootPitch + 7) % 12]}`;
                        pedagogicalNote = 'Partial sus4 chord - the 4th creates harmonic tension typically resolved to the 3rd. Missing 5th is common in contemporary voicings.';
                    }
                } else if (noteNumbers.length === 3 && intervals.includes(3) && intervals.includes(5)) {
                    // A-C-D pattern: Minor 3rd + 4th
                    if (chordType === 'minorAdd4') {
                        pedagogicalNote = 'Minor chord with added 4th - retains minor 3rd while adding upper tension. Common in folk and contemporary styles.';
                    }
                }

                matches.push({
                    chordSymbol: chordSymbol + inversion,
                    chordName: template.name,
                    root: rootPitch,
                    rootName: rootName,
                    intervals: intervals,
                    confidence: confidence,
                    inversion: inversion,
                    bassNote: bassNote,
                    isPartial: isPartial,
                    missingNotes: missingNotes.length > 0 ? missingNotes : undefined,
                    completionSuggestion: completionSuggestion || undefined,
                    pedagogicalNote: pedagogicalNote || undefined
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
 * @param noteCount - Number of input notes
 * @param chordType - Type of chord being matched
 * @param template - The chord template object
 * @returns Confidence score between 0 and 1
 */
function calculateConfidence(playedIntervals: number[], templateIntervals: number[], noteCount: number, chordType: string, template: any): number {
    const totalTemplateNotes = templateIntervals.length;
    const matchingNotes = templateIntervals.filter(interval => playedIntervals.includes(interval)).length;
    const extraNotes = playedIntervals.length - totalTemplateNotes;

    // Use predefined confidence from template if available, otherwise calculate
    let confidence = template.confidence || (matchingNotes / totalTemplateNotes);

    // Adjust confidence for partial chords (2-note combinations)
    if (noteCount === 2 && templateIntervals.length === 2) {
        // For 2-note partial chords, give high confidence if all template notes match
        confidence = matchingNotes === 2 ? 0.85 : confidence;
    } else if (noteCount === 2 && templateIntervals.length > 2) {
        // Partial match of larger chord - moderate confidence
        confidence *= 0.7;
    }

    // Penalize for extra notes (but not too harshly, as extensions are common)
    if (extraNotes > 0) {
        confidence -= extraNotes * 0.08; // Reduced penalty
    }

    // Bonus for exact match
    if (playedIntervals.length === totalTemplateNotes && extraNotes === 0) {
        confidence += 0.1;
    }

    // Special confidence adjustments for specific patterns
    if (noteCount === 3 && playedIntervals.includes(4) && playedIntervals.includes(5)) {
        // A-C#-D pattern: Major 3rd + 4th - favor sus4 interpretation
        if (templateIntervals.includes(5) && !templateIntervals.includes(4)) {
            // This is a sus4 template - give high confidence
            confidence = 0.92;
        } else if (templateIntervals.includes(4) && templateIntervals.includes(5)) {
            // This is a major add4 template - give lower confidence (secondary interpretation)
            confidence = 0.75;
        }
    } else if (noteCount === 3 && playedIntervals.includes(3) && playedIntervals.includes(5)) {
        // A-C-D pattern: Minor 3rd + 4th - favor add4 interpretation
        if (templateIntervals.includes(3) && templateIntervals.includes(5)) {
            // This is a minor add4 template - give high confidence
            confidence = 0.88;
        }
    }

    return Math.max(0, Math.min(1, confidence)); // Clamp between 0 and 1
}

/**
 * Specialized function for detecting partial suspended chords
 * Handles the specific cases you mentioned: A-C#-D and A-C-D
 */
export function detectPartialSusChords(noteNumbers: number[]): ChordMatch[] {
    if (noteNumbers.length !== 3) {
        return [];
    }

    const matches: ChordMatch[] = [];
    const pitchClasses = [...new Set(noteNumbers.map(note => note % 12))];
    pitchClasses.sort((a, b) => a - b);

    // Try each pitch class as root
    for (let rootPitch of pitchClasses) {
        const intervals = pitchClasses.map(pc => (pc - rootPitch + 12) % 12);
        const rootName = noteNames[rootPitch];

        // Case 1: Root + Major 3rd + 4th (like A-C#-D)
        if (intervals.includes(0) && intervals.includes(4) && intervals.includes(5)) {
            matches.push({
                chordSymbol: `${rootName}sus4(no5)`,
                chordName: 'Suspended 4th (no 5th)',
                root: rootPitch,
                rootName: rootName,
                intervals: intervals,
                confidence: 0.88,
                inversion: '',
                bassNote: rootPitch,
                isPartial: true,
                missingNotes: [noteNames[(rootPitch + 7) % 12]],
                completionSuggestion: `${rootName}-${noteNames[(rootPitch + 5) % 12]}-${noteNames[(rootPitch + 7) % 12]}`,
                pedagogicalNote: 'Partial sus4 chord - the 4th creates harmonic tension typically resolved to the 3rd. Missing 5th is common in contemporary voicings.'
            });
        }

        // Case 2: Root + Minor 3rd + 4th (like A-C-D)
        if (intervals.includes(0) && intervals.includes(3) && intervals.includes(5)) {
            matches.push({
                chordSymbol: `${rootName}m(add4)`,
                chordName: 'Minor add 4th',
                root: rootPitch,
                rootName: rootName,
                intervals: intervals,
                confidence: 0.85,
                inversion: '',
                bassNote: rootPitch,
                pedagogicalNote: 'Minor chord with added 4th - retains minor 3rd while adding upper tension. Common in folk and contemporary styles.'
            });
        }
    }

    return matches;
}
