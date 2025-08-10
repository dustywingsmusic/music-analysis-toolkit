// This module contains the logic for finding and rendering key/chord suggestions.
import { ProcessedScale, DiatonicChord } from '../types';
import { NOTES } from '../constants/scales';
import { NOTE_TO_PITCH_CLASS } from '../constants/mappings';
import { ChordMatch, findChordMatches } from './chordLogic';
import { trackInteraction } from '../utils/tracking';

// Sidebar callback types
type MelodySuggestionCallback = (suggestions: MelodySuggestion[]) => void;
type ChordSuggestionCallback = (suggestions: ChordSuggestion[]) => void;

// Sidebar suggestion interfaces
export interface MelodySuggestion {
  name: string;
  pitchClasses: Set<number>;
  confidence: number;
  matchCount: number;
  topModePopularity?: number; // For sorting by mode popularity when matchCounts are equal
  containsPlayedNoteAsRoot?: boolean; // For tertiary sorting - prioritize suggestions with played note as root
  matchingScales?: Array<{
    id: string;
    name?: string;
  }>;
}

export interface ChordSuggestion {
  chord: string;
  key: string;
  confidence: number;
  rootName?: string;
  inversion?: string;
  bassNote?: number;
  chordName?: string;
}

// Unified Detection Interfaces for Consolidation
export interface DetectionSuggestion {
  name: string;
  matchType: 'exact' | 'partial' | 'possible';
  closeness: number;  // How complete this pattern is (0-1)
  pitchClasses: Set<number>;
  matchingScales: Array<{ id: string; name: string }>;
  topModePopularity?: number; // For sorting by mode popularity when closeness is equal
  containsPlayedNoteAsRoot?: boolean; // For tertiary sorting - prioritize suggestions with played note as root
}

export interface UnifiedDetectionResult {
  suggestions: DetectionSuggestion[];
  category: 'complete' | 'pentatonic' | 'partial' | 'minimal' | 'none' | 'incomplete';
  closeness: number;  // How complete the pattern is (0-1)
  isChordMode?: boolean; // Flag to indicate chord-focused analysis
}

// Sidebar callbacks
let melodySuggestionCallback: MelodySuggestionCallback | null = null;
let chordSuggestionCallback: ChordSuggestionCallback | null = null;

/**
 * Registers a callback function to receive melody suggestions for the sidebar.
 * @param callback Function to call when melody suggestions are updated.
 */
export function registerMelodySuggestionCallback(callback: MelodySuggestionCallback | null): void {
  melodySuggestionCallback = callback;
}

/**
 * Registers a callback function to receive chord suggestions for the sidebar.
 * @param callback Function to call when chord suggestions are updated.
 */
export function registerChordSuggestionCallback(callback: ChordSuggestionCallback | null): void {
  chordSuggestionCallback = callback;
}

/**
 * Updates chord suggestions for the sidebar (non-modal approach).
 * @param playedPitchClasses A set of pitch classes for the chord notes.
 * @param baseKey The base key for chord analysis.
 * @param keyMode The key mode (major or minor).
 */
export function updateChordSuggestionsForSidebar(
  playedPitchClasses: Set<number>,
  baseKey: string = 'C',
  keyMode: 'major' | 'minor' = 'major'
): void {
  console.log('🎵 === SIDEBAR CHORD UPDATE === updateChordSuggestionsForSidebar called with', playedPitchClasses.size, 'pitch classes');

  if (!chordSuggestionCallback) {
    console.log('No chord suggestion callback registered');
    return;
  }

  if (playedPitchClasses.size === 0) {
    console.log('No pitch classes, clearing chord suggestions');
    chordSuggestionCallback([]);
    return;
  }

  // Convert played pitch classes to note numbers for chord detection
  const noteNumbers = Array.from(playedPitchClasses);

  // Use statically imported chord logic
  const detectedChords = findChordMatches(noteNumbers);

  if (detectedChords.length > 0) {
    const suggestions: ChordSuggestion[] = detectedChords.slice(0, 5).map(chord => ({
      chord: chord.chordSymbol,
      key: baseKey,
      confidence: chord.confidence || 0.8
    }));

    console.log('Calling chord suggestion callback with', suggestions.length, 'suggestions');
    chordSuggestionCallback(suggestions);
  } else {
    chordSuggestionCallback([]);
  }
}

/**
 * Updates melody suggestions for the sidebar (non-modal approach).
 * @param playedPitchClasses A set of pitch classes for the melody notes.
 */
export function updateMelodySuggestionsForSidebar(playedPitchClasses: Set<number>): void {
  console.log('🎵 === SIDEBAR MELODY UPDATE === updateMelodySuggestionsForSidebar called with', playedPitchClasses.size, 'pitch classes');

  if (!melodySuggestionCallback) {
    console.log('No melody suggestion callback registered');
    return;
  }

  if (playedPitchClasses.size === 0) {
    console.log('No pitch classes, clearing suggestions');
    melodySuggestionCallback([]);
    return;
  }

  let suggestions: MelodySuggestion[] = [];
  console.log('Starting scale matching process for sidebar');

  // Enhanced 5-6 note analysis with pentatonic/hexatonic prioritization
  if (playedPitchClasses.size >= 5 && playedPitchClasses.size <= 6) {
    console.log('🎯 Using enhanced 5-6 note analysis with pentatonic/hexatonic prioritization');
    const enhancedResult = analyzePentatonicHexatonic(playedPitchClasses);

    // Convert DetectionSuggestion[] to MelodySuggestion[]
    const enhancedSuggestions: MelodySuggestion[] = enhancedResult.suggestions.map(suggestion => ({
      name: suggestion.name,
      matchCount: suggestion.matchCount,
      pitchClasses: suggestion.pitchClasses,
      confidence: suggestion.confidence,
      matchingScales: suggestion.matchingScales
    }));

    console.log('Enhanced analysis found', enhancedSuggestions.length, 'prioritized suggestions');
    const finalSuggestions = enhancedSuggestions.slice(0, 5);
    console.log('Calling sidebar callback with', finalSuggestions.length, 'enhanced suggestions');
    melodySuggestionCallback(finalSuggestions);
    return;
  }

  // Original logic for other note counts
  // Find all scales that contain all the played notes (exact matches)
  const exactMatches = allScales.filter((scale) => {
    // Check if all played notes are contained in this scale
    for (const playedNote of playedPitchClasses) {
      if (!scale.pitchClasses.has(playedNote)) {
        return false;
      }
    }
    return true;
  });

  console.log('Found', exactMatches.length, 'exact matches');

  // Group exact matches by their pitch class sets to find modes of the same parent scale
  const scaleGroups = new Map<string, ProcessedScale[]>();
  exactMatches.forEach((scale) => {
    const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
    if (!scaleGroups.has(pitchClassKey)) {
      scaleGroups.set(pitchClassKey, []);
    }
    scaleGroups.get(pitchClassKey)!.push(scale);
  });

  console.log('Created', scaleGroups.size, 'scale groups');

  // Create suggestions for each group of modes
  scaleGroups.forEach((scales) => {
    if (scales.length > 0) {
      const matchCount = playedPitchClasses.size; // All notes match exactly

      // Create a suggestion showing all modes of this scale group
      const modeNames = scales
        .filter(scale => scale.name) // Only include scales with names
        .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
        .join(', ');

      console.log('Generated mode names for group:', modeNames);

      if (modeNames) {
        // Find matching scales for the sidebar links
        const matchingScales = scales
          .filter(scale => scale.name)
          .map(scale => ({
            id: scale.id,
            name: scale.name
          }));

        suggestions.push({
          name: `Possible modes: ${modeNames}`,
          matchCount: matchCount,
          pitchClasses: scales[0].pitchClasses,
          confidence: 1.0, // Perfect match
          matchingScales: matchingScales
        });
        console.log('Added exact match suggestion for sidebar');
      }
    }
  });

  // If no exact matches, find partial matches (scales that contain some of the played notes)
  if (suggestions.length === 0) {
    const partialMatches = allScales.filter((scale) => {
      let matchCount = 0;
      playedPitchClasses.forEach((playedNote) => {
        if (scale.pitchClasses.has(playedNote)) {
          matchCount++;
        }
      });
      return matchCount > 0;
    });

    // Group partial matches and show the best ones
    const partialGroups = new Map<string, { scales: ProcessedScale[], matchCount: number }>();
    partialMatches.forEach((scale) => {
      let matchCount = 0;
      playedPitchClasses.forEach((playedNote) => {
        if (scale.pitchClasses.has(playedNote)) {
          matchCount++;
        }
      });

      const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
      if (!partialGroups.has(pitchClassKey) || partialGroups.get(pitchClassKey)!.matchCount < matchCount) {
        partialGroups.set(pitchClassKey, { scales: [scale], matchCount });
      }
    });

    partialGroups.forEach(({ scales, matchCount }) => {
      if (scales.length > 0 && matchCount >= Math.ceil(playedPitchClasses.size * 0.6)) {
        const modeNames = scales
          .filter(scale => scale.name)
          .slice(0, 3) // Limit to first 3 modes to avoid clutter
          .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
          .join(', ');

        if (modeNames) {
          const confidence = matchCount / playedPitchClasses.size;

          // Find matching scales for the sidebar links
          const matchingScales = scales
            .filter(scale => scale.name)
            .slice(0, 3)
            .map(scale => ({
              id: scale.id,
              name: scale.name
            }));

          suggestions.push({
            name: `Partial match (${matchCount}/${playedPitchClasses.size}): ${modeNames}`,
            matchCount: matchCount,
            pitchClasses: scales[0].pitchClasses,
            confidence: confidence,
            matchingScales: matchingScales
          });
        }
      }
    });
  }

  suggestions.sort((a, b) => b.matchCount - a.matchCount);
  console.log('Final suggestions for sidebar:', suggestions.length);
  console.log('Suggestions data:', suggestions);

  const finalSuggestions = suggestions.slice(0, 5);
  console.log('Calling sidebar callback with', finalSuggestions.length, 'suggestions');
  melodySuggestionCallback(finalSuggestions);
}

// Enhanced 5-6 note analysis interfaces and types
// (Using exported interfaces defined above)

type DetectionCategory = 'pentatonic' | 'complete' | 'partial';

/**
 * Enhanced analysis for 5-6 note input with pentatonic/hexatonic prioritization
 * @param playedPitchClasses Set of played pitch classes
 * @returns UnifiedDetectionResult with prioritized suggestions
 */
function analyzePentatonicHexatonic(playedPitchClasses: Set<number>): UnifiedDetectionResult {
  console.log('🎵 Analyzing pentatonic/hexatonic scales with prioritization for', playedPitchClasses.size, 'notes');

  const suggestions: DetectionSuggestion[] = [];
  const noteCount = playedPitchClasses.size;

  // First: Find pentatonic/hexatonic matches (higher priority)
  const pentatonicMatches = findPentatonicMatches(playedPitchClasses);
  pentatonicMatches.forEach(match => {
    suggestions.push({
      ...match,
      matchType: 'pentatonic',
      priority: 1,
      closeness: calculateCompleteness(noteCount, match.expectedNotes || 5),
      expectedNotes: 5
    });
  });

  const hexatonicMatches = findHexatonicMatches(playedPitchClasses);
  hexatonicMatches.forEach(match => {
    suggestions.push({
      ...match,
      matchType: 'hexatonic',
      priority: 1,
      closeness: calculateCompleteness(noteCount, match.expectedNotes || 6),
      expectedNotes: 6
    });
  });

  // Second: Find complete scale matches (lower priority)
  const completeScaleMatches = findCompleteScaleMatches(playedPitchClasses);
  completeScaleMatches.forEach(match => {
    suggestions.push({
      ...match,
      matchType: 'complete',
      priority: 2,
      closeness: calculateCompleteness(noteCount, 7), // 7-note scales
      expectedNotes: 7
    });
  });

  // Sort by priority, then by completeness
  const sortedSuggestions = sortSuggestionsByPriority(suggestions);

  // Determine category based on best matches
  let category: DetectionCategory = 'partial';
  if (pentatonicMatches.length > 0 || hexatonicMatches.length > 0) {
    category = 'pentatonic';
  } else if (completeScaleMatches.length > 0) {
    category = 'complete';
  }

  return {
    suggestions: sortedSuggestions,
    category,
    closeness: sortedSuggestions.length > 0 ? sortedSuggestions[0].closeness : 0
  };
}

/**
 * Sort suggestions by priority first, then by completeness
 */
function sortSuggestionsByPriority(suggestions: DetectionSuggestion[]): DetectionSuggestion[] {
  return suggestions.sort((a, b) => {
    // First: Sort by priority (1 = pentatonic/hexatonic, 2 = complete)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    // Second: Sort by completeness percentage
    return b.closeness - a.closeness;
  });
}

/**
 * Calculate completeness percentage
 */
function calculateCompleteness(playedNotes: number, expectedNotes: number): number {
  return Math.min(playedNotes / expectedNotes, 1.0);
}

/**
 * Find pentatonic scale matches
 */
function findPentatonicMatches(playedPitchClasses: Set<number>): MelodySuggestion[] {
  const matches: MelodySuggestion[] = [];

  // Filter scales that are pentatonic (5 notes) and contain all played notes
  const pentatonicScales = allScales.filter(scale =>
    scale.pitchClasses.size === 5 &&
    Array.from(playedPitchClasses).every(note => scale.pitchClasses.has(note))
  );

  // Group by pitch class sets
  const scaleGroups = new Map<string, ProcessedScale[]>();
  pentatonicScales.forEach(scale => {
    const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
    if (!scaleGroups.has(pitchClassKey)) {
      scaleGroups.set(pitchClassKey, []);
    }
    scaleGroups.get(pitchClassKey)!.push(scale);
  });

  scaleGroups.forEach(scales => {
    if (scales.length > 0) {
      const modeNames = scales
        .filter(scale => scale.name)
        .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
        .join(', ');

      if (modeNames) {
        const matchingScales = scales
          .filter(scale => scale.name)
          .map(scale => ({ id: scale.id, name: scale.name }));

        matches.push({
          name: `Pentatonic: ${modeNames}`,
          matchCount: playedPitchClasses.size,
          pitchClasses: scales[0].pitchClasses,
          confidence: calculateCompleteness(playedPitchClasses.size, 5),
          matchingScales: matchingScales
        });
      }
    }
  });

  return matches;
}

/**
 * Find hexatonic scale matches
 */
function findHexatonicMatches(playedPitchClasses: Set<number>): MelodySuggestion[] {
  const matches: MelodySuggestion[] = [];

  // Filter scales that are hexatonic (6 notes) and contain all played notes
  const hexatonicScales = allScales.filter(scale =>
    scale.pitchClasses.size === 6 &&
    Array.from(playedPitchClasses).every(note => scale.pitchClasses.has(note))
  );

  // Group by pitch class sets
  const scaleGroups = new Map<string, ProcessedScale[]>();
  hexatonicScales.forEach(scale => {
    const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
    if (!scaleGroups.has(pitchClassKey)) {
      scaleGroups.set(pitchClassKey, []);
    }
    scaleGroups.get(pitchClassKey)!.push(scale);
  });

  scaleGroups.forEach(scales => {
    if (scales.length > 0) {
      const modeNames = scales
        .filter(scale => scale.name)
        .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
        .join(', ');

      if (modeNames) {
        const matchingScales = scales
          .filter(scale => scale.name)
          .map(scale => ({ id: scale.id, name: scale.name }));

        matches.push({
          name: `Hexatonic: ${modeNames}`,
          matchCount: playedPitchClasses.size,
          pitchClasses: scales[0].pitchClasses,
          confidence: calculateCompleteness(playedPitchClasses.size, 6),
          matchingScales: matchingScales
        });
      }
    }
  });

  return matches;
}

/**
 * Find complete scale matches (7+ notes)
 */
function findCompleteScaleMatches(playedPitchClasses: Set<number>): MelodySuggestion[] {
  const matches: MelodySuggestion[] = [];

  // Filter scales that are 7+ notes and contain all played notes
  const completeScales = allScales.filter(scale =>
    scale.pitchClasses.size >= 7 &&
    Array.from(playedPitchClasses).every(note => scale.pitchClasses.has(note))
  );

  // Group by pitch class sets
  const scaleGroups = new Map<string, ProcessedScale[]>();
  completeScales.forEach(scale => {
    const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
    if (!scaleGroups.has(pitchClassKey)) {
      scaleGroups.set(pitchClassKey, []);
    }
    scaleGroups.get(pitchClassKey)!.push(scale);
  });

  scaleGroups.forEach(scales => {
    if (scales.length > 0) {
      const modeNames = scales
        .filter(scale => scale.name)
        .slice(0, 3) // Limit to avoid clutter
        .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
        .join(', ');

      if (modeNames) {
        const matchingScales = scales
          .filter(scale => scale.name)
          .slice(0, 3)
          .map(scale => ({ id: scale.id, name: scale.name }));

        matches.push({
          name: `Complete scale (${playedPitchClasses.size}/${scales[0].pitchClasses.size}): ${modeNames}`,
          matchCount: playedPitchClasses.size,
          pitchClasses: scales[0].pitchClasses,
          confidence: calculateCompleteness(playedPitchClasses.size, scales[0].pitchClasses.size),
          matchingScales: matchingScales
        });
      }
    }
  });

  return matches;
}

/**
 * Unified detection function that consolidates melody and chord analysis
 * Automatically adapts analysis based on note count and provides categorized results.
 */
export function updateUnifiedDetection(
  playedPitchClasses: Set<number>,
  analysisFocus?: 'automatic' | 'complete' | 'pentatonic' | 'chord'
): UnifiedDetectionResult {
  console.log('🎯 === UNIFIED DETECTION === updateUnifiedDetection called with', playedPitchClasses.size, 'pitch classes', 'focus:', analysisFocus);

  const noteCount = playedPitchClasses.size;

  // Automatic chord detection: check if the played notes form a chord pattern
  let isChordMode = analysisFocus === 'chord';

  // If not explicitly in chord mode, check if the notes form a chord pattern
  if (!isChordMode && noteCount >= 3 && noteCount <= 6) {
    // Convert pitch classes to note numbers for chord detection
    const noteNumbers = Array.from(playedPitchClasses).map(pc => pc + 60); // Use middle C octave

    // Use statically imported chord logic
    const detectedChords = findChordMatches(noteNumbers);
    if (detectedChords.length > 0) {
      console.log('🎵 Detected chord patterns, switching to chord mode');
      isChordMode = true;
    }
  }

  // Handle empty input
  if (noteCount === 0) {
    return {
      suggestions: [],
      category: 'none',
      closeness: 0,
      isChordMode: false
    };
  }

  // Enhanced 5-6 note analysis with pentatonic/hexatonic prioritization
  if (noteCount >= 5 && noteCount <= 6 && analysisFocus !== 'chord') {
    console.log('🎯 Using enhanced 5-6 note analysis with pentatonic/hexatonic prioritization');

    const suggestions: DetectionSuggestion[] = [];

    // First: Find pentatonic/hexatonic matches (higher priority)
    const pentatonicMatches = findPentatonicMatches(playedPitchClasses);
    pentatonicMatches.forEach(match => {
      suggestions.push({
        name: match.name,
        matchType: 'exact',
        closeness: calculateCompleteness(noteCount, 5),
        pitchClasses: match.pitchClasses,
        matchingScales: match.matchingScales,
        topModePopularity: match.topModePopularity,
        containsPlayedNoteAsRoot: match.containsPlayedNoteAsRoot
      });
    });

    const hexatonicMatches = findHexatonicMatches(playedPitchClasses);
    hexatonicMatches.forEach(match => {
      suggestions.push({
        name: match.name,
        matchType: 'exact',
        closeness: calculateCompleteness(noteCount, 6),
        pitchClasses: match.pitchClasses,
        matchingScales: match.matchingScales,
        topModePopularity: match.topModePopularity,
        containsPlayedNoteAsRoot: match.containsPlayedNoteAsRoot
      });
    });

    // Second: Find complete scale matches (lower priority)
    const completeScaleMatches = findCompleteScaleMatches(playedPitchClasses);
    completeScaleMatches.forEach(match => {
      suggestions.push({
        name: match.name,
        matchType: 'partial',
        closeness: calculateCompleteness(noteCount, 7), // 7-note scales
        pitchClasses: match.pitchClasses,
        matchingScales: match.matchingScales,
        topModePopularity: match.topModePopularity,
        containsPlayedNoteAsRoot: match.containsPlayedNoteAsRoot
      });
    });

    // Sort by priority, then by completeness
    const sortedSuggestions = suggestions.sort((a, b) => {
      // Pentatonic/hexatonic matches first
      if (a.matchType === 'exact' && b.matchType === 'partial') return -1;
      if (a.matchType === 'partial' && b.matchType === 'exact') return 1;

      // Then by completeness
      return b.closeness - a.closeness;
    });

    // Determine category based on best matches
    let category: 'complete' | 'pentatonic' | 'partial' | 'minimal' | 'none' | 'incomplete' = 'partial';
    if (pentatonicMatches.length > 0 || hexatonicMatches.length > 0) {
      category = 'pentatonic';
    } else if (completeScaleMatches.length > 0) {
      category = 'complete';
    }

    return {
      suggestions: sortedSuggestions.slice(0, 10), // Limit results
      category,
      closeness: sortedSuggestions.length > 0 ? sortedSuggestions[0].closeness : 0,
      isChordMode: false
    };
  }

  // Standard analysis for other note counts
  const exactMatches = allScales.filter((scale) => {
    // Check if all played notes are contained in this scale
    for (const playedNote of playedPitchClasses) {
      if (!scale.pitchClasses.has(playedNote)) {
        return false;
      }
    }
    return true;
  });

  // Group exact matches by their pitch class sets
  const scaleGroups = new Map<string, ProcessedScale[]>();
  exactMatches.forEach((scale) => {
    const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
    if (!scaleGroups.has(pitchClassKey)) {
      scaleGroups.set(pitchClassKey, []);
    }
    scaleGroups.get(pitchClassKey)!.push(scale);
  });

  const suggestions: DetectionSuggestion[] = [];
  scaleGroups.forEach(scales => {
    if (scales.length > 0) {
      const modeNames = scales
        .filter(scale => scale.name)
        .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
        .join(', ');

      if (modeNames) {
        const matchingScales = scales
          .filter(scale => scale.name)
          .map(scale => ({ id: scale.id, name: scale.name! }));

        suggestions.push({
          name: `Possible modes: ${modeNames}`,
          matchType: 'exact',
          closeness: 1.0, // Perfect match
          pitchClasses: scales[0].pitchClasses,
          matchingScales: matchingScales
        });
      }
    }
  });

  // Determine category and closeness
  let category: 'complete' | 'pentatonic' | 'partial' | 'minimal' | 'none' | 'incomplete' = 'none';
  let closeness = 0;

  if (suggestions.length > 0) {
    category = noteCount >= 7 ? 'complete' : noteCount >= 5 ? 'pentatonic' : 'partial';
    closeness = suggestions[0].closeness;
  }

  return {
    suggestions: suggestions.slice(0, 10), // Limit results
    category,
    closeness,
    isChordMode
  };
}

// Interface for key suggestion results
export interface KeySuggestion {
  name: string;
  matchCount: number;
  pitchClasses: Set<number>;
}

// Interface for borrowed chord source
export interface BorrowedChordSource {
  roman: string;
  modeName: string;
  symbol: string;
}

// Interface for related key relationship
export interface KeyRelationship {
  roman: string;
  keyName: string;
  quality: string;
  relationship: string;
}

// State for the key suggester
let melodyOverlayElement: HTMLElement | null = null;
let chordOverlayElement: HTMLElement | null = null;
let backdropElement: HTMLElement | null = null;
let allScales: ProcessedScale[] = [];
let chordSequence: ChordMatch[] = [];
let keyAnalysis = new Map<string, { matchCount: number; confidence: number; scale: ProcessedScale }>();
let activeOverlay: HTMLElement | null = null;
let highlightScaleCallback: ((scaleId: string) => void) | null = null;

// Use centralized note mappings (legacy aliases for backward compatibility)
const NOTE_MAP = NOTE_TO_PITCH_CLASS;
const NOTE_TO_PITCH = NOTE_TO_PITCH_CLASS;



/**
 * Initializes the key suggester module.
 * @param melodyOverlayId The ID for the melody suggestions overlay.
 * @param chordOverlayId The ID for the chord suggestions overlay.
 * @param scalesData The complete scale data.
 * @param onHighlightScale Optional callback to highlight a scale in the tables.
 */
export function init(
  melodyOverlayId: string,
  chordOverlayId: string,
  scalesData: ProcessedScale[],
  onHighlightScale?: (scaleId: string) => void
): void {
  console.log('Initializing keySuggester with IDs:', melodyOverlayId, chordOverlayId);
  melodyOverlayElement = document.getElementById(melodyOverlayId);
  chordOverlayElement = document.getElementById(chordOverlayId);
  allScales = scalesData;
  highlightScaleCallback = onHighlightScale || null;

  console.log('Found overlay elements:', !!melodyOverlayElement, !!chordOverlayElement);

  if (melodyOverlayElement) {
    console.log('Melody overlay element details:', {
      id: melodyOverlayElement.id,
      className: melodyOverlayElement.className,
      tagName: melodyOverlayElement.tagName,
      parentElement: melodyOverlayElement.parentElement?.tagName
    });
  }

  if (chordOverlayElement) {
    console.log('Chord overlay element details:', {
      id: chordOverlayElement.id,
      className: chordOverlayElement.className,
      tagName: chordOverlayElement.tagName,
      parentElement: chordOverlayElement.parentElement?.tagName
    });
  }

  if (!melodyOverlayElement || !chordOverlayElement) {
    console.error('Key Suggester: One or more overlay elements not found.');
    console.error('Available elements with melody in ID:', document.querySelectorAll('[id*="melody"]'));
    console.error('Available elements with chord in ID:', document.querySelectorAll('[id*="chord"]'));
    return;
  }

  // Create backdrop element if it doesn't exist
  if (!backdropElement) {
    backdropElement = document.createElement('div');
    backdropElement.className = 'modal-backdrop';
    backdropElement.setAttribute('aria-hidden', 'true');
    backdropElement.addEventListener('click', hide);
    document.body.appendChild(backdropElement);
    console.log('Backdrop element created and added to body');
  } else {
    console.log('Backdrop element already exists');
  }

  // Add accessibility attributes to overlay elements
  setupAccessibility(melodyOverlayElement, 'melody-suggestions-dialog');
  setupAccessibility(chordOverlayElement, 'chord-suggestions-dialog');

  // Add keyboard event listener for ESC key
  document.addEventListener('keydown', handleKeyDown);

  console.log('keySuggester initialization complete');
}

/**
 * Sets up accessibility attributes for an overlay element.
 * @param element The overlay element to set up.
 * @param ariaLabelledBy The aria-labelledby value.
 */
function setupAccessibility(element: HTMLElement, ariaLabelledBy: string): void {
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', 'true');
  element.setAttribute('aria-labelledby', ariaLabelledBy);
  element.setAttribute('tabindex', '-1');
}

/**
 * Handles keyboard events for modal behavior.
 * @param event The keyboard event.
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && activeOverlay) {
    hide();
  }
}

/**
 * Hides the suggestions overlay.
 */
export function hide(): void {
  if (activeOverlay) {
    // Remove visible class first to trigger animation
    activeOverlay.classList.remove('visible');

    // Hide backdrop
    if (backdropElement) {
      backdropElement.classList.remove('visible');
    }

    // After animation completes, hide the element
    setTimeout(() => {
      if (activeOverlay) {
        activeOverlay.style.display = 'none';
        activeOverlay = null;
      }
    }, 300); // Match the CSS transition duration

    // Restore focus to the previously focused element
    restoreFocus();
  }
}

// Store the previously focused element for focus restoration
let previouslyFocusedElement: HTMLElement | null = null;

/**
 * Stores the currently focused element for later restoration.
 */
function storeFocus(): void {
  previouslyFocusedElement = document.activeElement as HTMLElement;
}

/**
 * Restores focus to the previously focused element.
 */
function restoreFocus(): void {
  if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
}

/**
 * Highlights a scale in the scale tables and scrolls to it.
 * @param scaleId The ID of the scale to highlight.
 */
export function highlightScale(scaleId: string): void {
  if (highlightScaleCallback) {
    highlightScaleCallback(scaleId);

    // Auto-scroll to the scale
    const element = document.getElementById(scaleId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    // Hide the modal after highlighting
    hide();
  }
}

/**
 * Shows a modal overlay with proper accessibility and animation.
 * @param overlay The overlay element to show.
 */
function showModal(overlay: HTMLElement): void {
  console.log('🚀 === MODAL DISPLAY === showModal called with overlay:', overlay.id || 'unnamed overlay');
  console.log('showModal called with overlay:', overlay.id || 'unnamed overlay');

  // Hide any currently active overlay
  if (activeOverlay && activeOverlay !== overlay) {
    console.log('Hiding previous overlay');
    hide();
  }

  // Store current focus for restoration later
  storeFocus();

  // Set the active overlay
  activeOverlay = overlay;
  console.log('Active overlay set');

  // Show backdrop
  if (backdropElement) {
    backdropElement.classList.add('visible');
    console.log('Backdrop visible class added');
  } else {
    console.error('Backdrop element not found!');
  }

  // Show the overlay with animation
  overlay.style.display = 'block';
  console.log('Overlay display set to block');

  // Force a reflow to ensure the display change takes effect
  overlay.offsetHeight;
  console.log('Reflow forced');

  // Add visible class to trigger animation
  overlay.classList.add('visible');
  console.log('Overlay visible class added');

  // Debug: Check computed styles
  const computedStyle = window.getComputedStyle(overlay);
  console.log('Overlay computed styles:', {
    display: computedStyle.display,
    opacity: computedStyle.opacity,
    transform: computedStyle.transform,
    zIndex: computedStyle.zIndex,
    position: computedStyle.position,
    top: computedStyle.top,
    left: computedStyle.left
  });

  // Focus the overlay for accessibility
  setTimeout(() => {
    overlay.focus();
    console.log('Overlay focused');
  }, 50); // Small delay to ensure the element is visible

  console.log('Modal should now be visible');
}


/**
 * Clears the current chord sequence and key analysis.
 */
export function clearChordSequence(): void {
  chordSequence = [];
  keyAnalysis.clear();
}

/**
 * Helper function to parse a chord symbol into its components.
 * @param symbol The chord symbol to parse.
 * @returns The parsed chord or null if parsing failed.
 */
function parseChordSymbol(symbol: string): { root: string; quality: string; original: string } | null {
  if (!symbol) return null;

  const normalized = symbol.trim();
  const rootMatch = normalized.match(/^([A-G][#♯b♭]?)/);
  if (!rootMatch) return null;

  const root = rootMatch[1];
  const remainder = normalized.slice(root.length);

  // Determine quality from remainder
  let quality = 'Major'; // default
  if (/^m(?!aj|M)/.test(remainder)) quality = 'Minor';
  else if (/^dim|°/.test(remainder)) quality = 'Diminished';
  else if (/^aug|\+/.test(remainder)) quality = 'Augmented';
  else if (/^maj|M/.test(remainder)) quality = 'Major';

  return { root, quality, original: symbol };
}

/**
 * Helper function to check if two note names are enharmonic.
 * @param note1 The first note name.
 * @param note2 The second note name.
 * @returns True if the notes are enharmonic, false otherwise.
 */
function areEnharmonicNotes(note1: string, note2: string): boolean {
  const pitch1 = NOTE_TO_PITCH[note1];
  const pitch2 = NOTE_TO_PITCH[note2];
  return pitch1 !== undefined && pitch2 !== undefined && pitch1 === pitch2;
}

/**
 * Helper function to check if two chord symbols are enharmonic equivalents.
 * @param chord1 The first chord symbol.
 * @param chord2 The second chord symbol.
 * @returns True if the chords are enharmonic equivalents, false otherwise.
 */
function areEnharmonicChords(chord1: string, chord2: string): boolean {
  // Extract root note and quality
  const parseChord = (chord: string) => {
    const match = chord.match(/^([A-G][#♯♭b]?)(.*)$/);
    if (!match) return null;
    return { root: match[1], quality: match[2] };
  };

  const parsed1 = parseChord(chord1);
  const parsed2 = parseChord(chord2);

  if (!parsed1 || !parsed2) return false;

  // Check if qualities match
  if (parsed1.quality !== parsed2.quality) return false;

  // Check if roots are enharmonic
  return areEnharmonicNotes(parsed1.root, parsed2.root);
}

/**
 * Comprehensive chord matching function using all available strategies.
 * @param diatonicChords The array of diatonic chords to search.
 * @param targetSymbol The chord symbol to find.
 * @returns The matching diatonic chord or null if no match is found.
 */
function findDiatonicMatch(diatonicChords: DiatonicChord[], targetSymbol: string): DiatonicChord | null {
  // Strategy 1: Exact match
  let match = diatonicChords.find(dc => dc.symbol === targetSymbol);
  if (match) return match;

  // Strategy 2: Case-insensitive match
  match = diatonicChords.find(dc =>
    dc.symbol.toLowerCase() === targetSymbol.toLowerCase()
  );
  if (match) return match;

  // Strategy 3: Trimmed and normalized
  const normalizeSymbol = (symbol: string) => symbol.trim().replace(/\s+/g, '');
  match = diatonicChords.find(dc =>
    normalizeSymbol(dc.symbol) === normalizeSymbol(targetSymbol)
  );
  if (match) return match;

  // Strategy 4: Unicode normalization
  match = diatonicChords.find(dc =>
    dc.symbol.normalize('NFC') === targetSymbol.normalize('NFC')
  );
  if (match) return match;

  // Strategy 5: Symbol substitution (handle different Unicode chars)
  const substituteSymbols = (symbol: string) => {
    return symbol
      .replace(/♯/g, '#')
      .replace(/♭/g, 'b')
      .replace(/°/g, 'dim')
      .replace(/º/g, 'dim')
      .replace(/\+/g, 'aug');
  };
  match = diatonicChords.find(dc =>
    substituteSymbols(dc.symbol) === substituteSymbols(targetSymbol)
  );
  if (match) return match;

  // Strategy 6: Parse and compare root + quality
  const parsedTarget = parseChordSymbol(targetSymbol);
  if (parsedTarget) {
    match = diatonicChords.find(dc => {
      const parsedStored = parseChordSymbol(dc.symbol);
      if (!parsedStored) return false;

      // Direct root and quality match
      if (parsedStored.root === parsedTarget.root &&
          parsedStored.quality === parsedTarget.quality) {
        return true;
      }

      // Enharmonic root match with same quality
      const storedPitch = NOTE_TO_PITCH[parsedStored.root];
      const targetPitch = NOTE_TO_PITCH[parsedTarget.root];
      if (storedPitch !== undefined && targetPitch !== undefined &&
          storedPitch === targetPitch &&
          parsedStored.quality === parsedTarget.quality) {
        return true;
      }

      return false;
    });
    if (match) return match;
  }

  // Strategy 7: Legacy enharmonic matching (fallback)
  match = diatonicChords.find(dc =>
    areEnharmonicChords(dc.symbol, targetSymbol)
  );
  if (match) return match;

  return null;
}

/**
 * Helper function to create major scale diatonic chords.
 * @param rootNote The root note of the major scale.
 * @returns An array of diatonic chords for the major scale.
 */
function createMajorScaleDiatonicChords(rootNote: number): DiatonicChord[] {
  const chordQualities = ["", "m", "m", "", "", "m", "°"]; // Major scale pattern
  const romanNumerals = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];

  // Major scale intervals
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];

  return chordQualities.map((quality, i) => {
    const chordRoot = (rootNote + majorScaleIntervals[i]) % 12;
    const noteName = NOTES[chordRoot];
    return {
      roman: romanNumerals[i],
      symbol: noteName + quality,
      quality:
        quality === ""
          ? "Major"
          : quality === "m"
            ? "Minor"
            : "Diminished",
    };
  });
}

/**
 * Helper function to create natural minor scale diatonic chords.
 * @param rootNote The root note of the minor scale.
 * @returns An array of diatonic chords for the minor scale.
 */
function createMinorScaleDiatonicChords(rootNote: number): DiatonicChord[] {
  // Find the relative major (3 semitones up from minor root)
  const relativeMajorRoot = (rootNote + 3) % 12;

  // Get the major scale diatonic chords
  const majorScaleChords = createMajorScaleDiatonicChords(relativeMajorRoot);

  // Minor key uses chords starting from the 6th degree of the major scale
  // Reorder: vi, vii°, I, ii, iii, IV, V becomes i, ii°, III, iv, v, VI, VII
  const minorRomanNumerals = ["i", "ii°", "III", "iv", "v", "VI", "VII"];
  const reorderedChords = [
    majorScaleChords[5], // vi becomes i
    majorScaleChords[6], // vii° becomes ii°
    majorScaleChords[0], // I becomes III
    majorScaleChords[1], // ii becomes iv
    majorScaleChords[2], // iii becomes v
    majorScaleChords[3], // IV becomes VI
    majorScaleChords[4]  // V becomes VII
  ];

  // Update roman numerals to match minor key conventions
  return reorderedChords.map((chord, i) => ({
    ...chord,
    roman: minorRomanNumerals[i]
  }));
}

/**
 * Helper function to create diatonic chords based on key mode.
 * @param rootNote The root note of the key.
 * @param keyMode The mode of the key (major or minor).
 * @returns An array of diatonic chords for the key.
 */
function createDiatonicChordsForKey(rootNote: number, keyMode: 'major' | 'minor' = 'major'): DiatonicChord[] {
  if (keyMode === 'minor') {
    return createMinorScaleDiatonicChords(rootNote);
  } else {
    return createMajorScaleDiatonicChords(rootNote);
  }
}

/**
 * Finds and renders key suggestions based on the notes played.
 * @param playedPitchClasses A set of pitch classes for the melody notes.
 */
export function updateMelodySuggestions(playedPitchClasses: Set<number>): void {
  console.log('🎵 === MELODY OVERLAY TRIGGER === updateMelodySuggestions called with', playedPitchClasses.size, 'pitch classes');
  console.log('updateMelodySuggestions called with', playedPitchClasses.size, 'pitch classes');
  console.log('Pitch classes array:', Array.from(playedPitchClasses));
  console.log('allScales length:', allScales.length);

  if (chordOverlayElement) {
    chordOverlayElement.style.display = 'none'; // Hide other overlay
    console.log('Chord overlay hidden');
  }

  if (!melodyOverlayElement) {
    console.error('melodyOverlayElement is null in updateMelodySuggestions');
    return;
  }

  if (playedPitchClasses.size === 0) {
    console.log('No pitch classes, hiding modal');
    hide();
    return;
  }

  let matches: KeySuggestion[] = [];
  console.log('Starting scale matching process');

  // Find all scales that contain all the played notes (exact matches)
  const exactMatches = allScales.filter((scale) => {
    // Check if all played notes are contained in this scale
    for (const playedNote of playedPitchClasses) {
      if (!scale.pitchClasses.has(playedNote)) {
        return false;
      }
    }
    return true;
  });

  console.log('Found', exactMatches.length, 'exact matches');

  // Group exact matches by their pitch class sets to find modes of the same parent scale
  const scaleGroups = new Map<string, ProcessedScale[]>();
  exactMatches.forEach((scale) => {
    const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
    if (!scaleGroups.has(pitchClassKey)) {
      scaleGroups.set(pitchClassKey, []);
    }
    scaleGroups.get(pitchClassKey)!.push(scale);
  });

  console.log('Created', scaleGroups.size, 'scale groups');

  // Create suggestions for each group of modes
  scaleGroups.forEach((scales) => {
    if (scales.length > 0) {
      const matchCount = playedPitchClasses.size; // All notes match exactly

      // Create a suggestion showing all modes of this scale group
      const modeNames = scales
        .filter(scale => scale.name) // Only include scales with names
        .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
        .join(', ');

      console.log('Generated mode names for group:', modeNames);

      if (modeNames) {
        matches.push({
          name: `Possible modes: ${modeNames}`,
          matchCount: matchCount,
          pitchClasses: scales[0].pitchClasses,
        });
        console.log('Added exact match suggestion');
      }
    }
  });

  // If no exact matches, find partial matches (scales that contain some of the played notes)
  if (matches.length === 0) {
    const partialMatches = allScales.filter((scale) => {
      let matchCount = 0;
      playedPitchClasses.forEach((playedNote) => {
        if (scale.pitchClasses.has(playedNote)) {
          matchCount++;
        }
      });
      return matchCount > 0;
    });

    // Group partial matches and show the best ones
    const partialGroups = new Map<string, { scales: ProcessedScale[], matchCount: number }>();
    partialMatches.forEach((scale) => {
      let matchCount = 0;
      playedPitchClasses.forEach((playedNote) => {
        if (scale.pitchClasses.has(playedNote)) {
          matchCount++;
        }
      });

      const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
      if (!partialGroups.has(pitchClassKey) || partialGroups.get(pitchClassKey)!.matchCount < matchCount) {
        partialGroups.set(pitchClassKey, { scales: [scale], matchCount });
      }
    });

    partialGroups.forEach(({ scales, matchCount }) => {
      if (scales.length > 0 && matchCount >= Math.ceil(playedPitchClasses.size * 0.6)) {
        const modeNames = scales
          .filter(scale => scale.name)
          .slice(0, 3) // Limit to first 3 modes to avoid clutter
          .map(scale => `${NOTES[scale.rootNote]} ${scale.name}`)
          .join(', ');

        if (modeNames) {
          matches.push({
            name: `Partial match (${matchCount}/${playedPitchClasses.size}): ${modeNames}`,
            matchCount: matchCount,
            pitchClasses: scales[0].pitchClasses,
          });
        }
      }
    });
  }

  matches.sort((a, b) => b.matchCount - a.matchCount);
  console.log('Final matches before rendering:', matches.length);
  console.log('Matches data:', matches);

  const finalMatches = matches.slice(0, 5);
  console.log('Calling renderMelodySuggestions with', finalMatches.length, 'matches');
  renderMelodySuggestions(finalMatches, playedPitchClasses);
}

/**
 * Finds borrowed chord sources from parallel modes.
 * @param baseKeyRoot The root note of the base key.
 * @param chordSymbol The chord symbol to find sources for.
 * @returns An array of borrowed chord sources.
 */
function findBorrowedChordSources(baseKeyRoot: number, chordSymbol: string): BorrowedChordSource[] {
  const borrowedSources: BorrowedChordSource[] = [];

  // Check all modes of the same root
  const parallelModes = allScales.filter(
    (s) => s.rootNote === baseKeyRoot && s.id.startsWith('major-scale-modes-')
  );

  parallelModes.forEach((mode) => {
    // If the scale has diatonic chords property, use it
    if (mode.diatonicChords) {
      const borrowedMatch = findDiatonicMatch(mode.diatonicChords, chordSymbol);
      if (borrowedMatch) {
        borrowedSources.push({
          roman: borrowedMatch.roman,
          modeName: mode.name || mode.id,
          symbol: borrowedMatch.symbol,
        });
      }
    }
  });

  return borrowedSources;
}

/**
 * Finds "cush chord" relationships - chords from closely related keys.
 * @param baseKeyRoot The root note of the base key.
 * @param chordSymbol The chord symbol to find relationships for.
 * @returns An array of key relationships.
 */
function findCushChordRelationships(baseKeyRoot: number, chordSymbol: string): KeyRelationship[] {
  const relationships: KeyRelationship[] = [];

  // Check related keys: V (dominant), IV (subdominant), vi (relative minor), ii, iii
  const relatedKeyRoots = [
    {
      root: (baseKeyRoot + 7) % 12,
      quality: "Major",
      relationship: "V (Dominant)",
    },
    {
      root: (baseKeyRoot + 5) % 12,
      quality: "Major",
      relationship: "IV (Subdominant)",
    },
    {
      root: (baseKeyRoot + 9) % 12,
      quality: "Minor",
      relationship: "vi (Relative Minor)",
    },
    {
      root: (baseKeyRoot + 2) % 12,
      quality: "Minor",
      relationship: "ii",
    },
    {
      root: (baseKeyRoot + 4) % 12,
      quality: "Minor",
      relationship: "iii",
    },
  ];

  relatedKeyRoots.forEach(({ root, quality, relationship }) => {
    const keyName = NOTES[root];
    const relatedScale = allScales.find(
      (s) =>
        s.rootNote === root &&
        s.id.startsWith('major-scale-modes-') &&
        s.id.endsWith('-0') // Ionian mode
    );

    if (relatedScale && relatedScale.diatonicChords) {
      const chordMatch = findDiatonicMatch(relatedScale.diatonicChords, chordSymbol);
      if (chordMatch) {
        relationships.push({
          roman: chordMatch.roman,
          keyName: keyName,
          quality: quality,
          relationship: relationship,
        });
      }
    }
  });

  return relationships;
}

/**
 * Analyzes chord sequence against a specific base key.
 * @param baseKeyRoot The root note of the base key.
 * @param currentChord The current chord being analyzed.
 * @param keyMode The mode of the key (major or minor).
 * @returns HTML content for the chord analysis.
 */
function analyzeChordSequenceInKey(
  baseKeyRoot: number,
  currentChord: ChordMatch,
  keyMode: 'major' | 'minor' = 'major'
): string {
  // Find the appropriate scale for this key
  const keyName = NOTES[baseKeyRoot];
  let baseKeyScale;

  if (keyMode === 'minor') {
    // For minor key, find Aeolian mode (modeIndex 5) of major-scale-modes
    baseKeyScale = allScales.find(
      (s) => s.rootNote === baseKeyRoot && s.id.startsWith('major-scale-modes-') && s.id.endsWith('-5')
    );
  } else {
    // For major key, find Ionian mode (modeIndex 0) of major-scale-modes
    baseKeyScale = allScales.find(
      (s) => s.rootNote === baseKeyRoot && s.id.startsWith('major-scale-modes-') && s.id.endsWith('-0')
    );
  }

  if (!baseKeyScale) {
    const modeText = keyMode === 'minor' ? 'Minor' : 'Major';
    return `<h3>Error: ${modeText} scale not found for key ${keyName}</h3>`;
  }

  const modeText = keyMode === 'minor' ? 'Minor' : 'Major';
  let html = `<h3 id="chord-suggestions-dialog">Key Analysis: ${keyName} ${modeText}</h3>`;

  // Show chord sequence
  html += `<div class="chord-sequence"><strong>Chord Sequence:</strong> `;
  if (chordSequence.length === 0) {
    html += 'No chords detected yet';
  } else {
    html += chordSequence.map((c) => c.chordSymbol).join(' → ');
  }
  html += ` (${chordSequence.length})</div><br/>`;

  // Show diatonic chords with highlighting
  html += `<div class="diatonic-chords"><strong>Diatonic Chords:</strong><br/>`;
  const playedChords = new Set(
    chordSequence.map((c) => c.chordSymbol.split('/')[0])
  );

  // Use original diatonic chords from scale data, or generate correct ones based on key mode
  const diatonicChords = baseKeyScale.diatonicChords ||
    createDiatonicChordsForKey(baseKeyRoot, keyMode);

  // Create a better formatted display with degrees on top and chords below
  html += `<div class="chord-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin: 10px 0;">`;

  // Top row: Roman numerals
  html += `<div class="degree-row" style="display: contents;">`;
  diatonicChords.forEach((dc) => {
    html += `<div class="degree-cell" style="text-align: center; font-weight: bold; padding: 4px;">${dc.roman}</div>`;
  });
  html += `</div>`;

  // Bottom row: Chord symbols
  html += `<div class="chord-row" style="display: contents;">`;
  diatonicChords.forEach((dc) => {
    const isPlayed = playedChords.has(dc.symbol);
    html += `<div class="chord-cell ${isPlayed ? 'highlighted' : ''}" style="text-align: center; padding: 4px; border: 1px solid #ccc; border-radius: 3px; ${isPlayed ? 'background-color: #ffeb3b; font-weight: bold;' : ''}">${dc.symbol}</div>`;
  });
  html += `</div>`;

  html += `</div></div><br/>`;

  // Analyze current chord with comprehensive matching
  const currentChordSymbol = currentChord.chordSymbol.split('/')[0];
  const diatonicMatch = findDiatonicMatch(diatonicChords, currentChordSymbol);

  if (diatonicMatch) {
    html += `<div class="current-chord in-key">✓ ${currentChord.chordSymbol} (${diatonicMatch.roman}) - In Key</div>`;
  } else {
    // Check for borrowed chords and modal substitutions
    const borrowedAnalysis = findBorrowedChordSources(
      baseKeyRoot,
      currentChordSymbol
    );
    if (borrowedAnalysis.length > 0) {
      html += `<div class="current-chord borrowed">⚬ ${currentChord.chordSymbol} - Borrowed/Modal</div>`;
      html += `<div class="borrowed-sources">Possible sources:<br/>`;
      borrowedAnalysis.forEach((source) => {
        html += `<div class="borrowed-item">${source.roman} from ${source.modeName}</div>`;
      });
      html += `</div>`;
    } else {
      html += `<div class="current-chord outside">⚬ ${currentChord.chordSymbol} - Outside Key</div>`;
      // Check for "cush chord" relationships (related keys)
      const cushAnalysis = findCushChordRelationships(
        baseKeyRoot,
        currentChordSymbol
      );
      if (cushAnalysis.length > 0) {
        html += `<div class="cush-analysis">Possible key relationships:<br/>`;
        cushAnalysis.forEach((relation) => {
          html += `<div class="cush-item">${relation.roman} of ${relation.keyName} ${relation.quality}</div>`;
        });
        html += `</div>`;
      }
    }
  }

  return html;
}

/**
 * Analyzes chord sequence to guess the most likely key.
 * @param currentChord The current chord being analyzed.
 * @returns HTML content for the key guessing analysis.
 */
function analyzeChordSequenceForKeyGuessing(currentChord: ChordMatch): string {
  let html = `<h3 id="chord-suggestions-dialog">Key Analysis (Guessing Mode)</h3>`;

  // Show chord sequence
  html += `<div class="chord-sequence"><strong>Chord Sequence:</strong> `;
  html += chordSequence.map((c) => c.chordSymbol).join(' → ');
  html += `</div><br/>`;

  // Analyze all possible keys for the chord sequence
  keyAnalysis.clear();

  // Check all major scales
  for (let rootNote = 0; rootNote < 12; rootNote++) {
    const majorScale = allScales.find(
      (s) => s.rootNote === rootNote && s.id.startsWith('major-scale-modes-') && s.id.endsWith('-0')
    );
    if (majorScale) {
      let matchCount = 0;
      let confidence = 0;

      // If no diatonic chords, create them manually for major scale
      const diatonicChords = majorScale.diatonicChords ||
        createMajorScaleDiatonicChords(rootNote);

      chordSequence.forEach((chord) => {
        const chordSymbol = chord.chordSymbol.split('/')[0];
        const chordMatch = findDiatonicMatch(diatonicChords, chordSymbol);
        if (chordMatch) {
          matchCount++;
          // Higher confidence for tonic, dominant, subdominant
          if (chordMatch.roman === 'I') confidence += 3;
          else if (chordMatch.roman === 'V' || chordMatch.roman === 'IV') confidence += 2;
          else confidence += 1;
        }
      });

      if (matchCount > 0) {
        const keyName = NOTES[rootNote];
        keyAnalysis.set(`${keyName} Major`, {
          matchCount,
          confidence,
          scale: majorScale,
        });
      }
    }
  }

  // Sort by confidence and match count
  const sortedKeys = Array.from(keyAnalysis.entries())
    .sort((a, b) => {
      if (b[1].confidence !== a[1].confidence)
        return b[1].confidence - a[1].confidence;
      return b[1].matchCount - a[1].matchCount;
    })
    .slice(0, 5);

  if (sortedKeys.length > 0) {
    html += `<div class="key-suggestions"><strong>Most Likely Keys:</strong><br/>`;
    sortedKeys.forEach(([keyName, analysis], index) => {
      const isTop = index === 0;
      html += `<div class="key-suggestion ${isTop ? 'top-suggestion' : ''}">`;
      html += `${keyName} (${analysis.matchCount}/${chordSequence.length} chords, confidence: ${analysis.confidence})`;
      html += `</div>`;
    });
    html += `</div>`;

    // Show current chord in context of top key
    const topKey = sortedKeys[0][1].scale;
    const currentChordSymbol = currentChord.chordSymbol.split('/')[0];

    // Check if topKey has diatonicChords property
    if (topKey.diatonicChords) {
      const diatonicMatch = findDiatonicMatch(topKey.diatonicChords, currentChordSymbol);
      if (diatonicMatch) {
        html += `<div class="current-chord in-key">✓ ${currentChord.chordSymbol} (${diatonicMatch.roman}) in ${sortedKeys[0][0]}</div>`;
      } else {
        html += `<div class="current-chord outside">⚬ ${currentChord.chordSymbol} - Not in ${sortedKeys[0][0]}</div>`;
      }
    }
  } else {
    html += `<div class="no-matches">No clear key matches found. Try playing more chords.</div>`;
  }

  return html;
}

/**
 * Analyzes a detected chord and renders suggestions.
 * @param detectedChords The array of possible chords.
 * @param baseKeyName The name of the base key (e.g., "C", "G").
 * @param keyMode The mode of the key (major or minor).
 */
export function updateChordSuggestions(
  detectedChords: ChordMatch[],
  baseKeyName: string,
  keyMode: 'major' | 'minor' = 'major'
): void {
  console.log('updateChordSuggestions called with', detectedChords.length, 'chords');
  if (melodyOverlayElement) melodyOverlayElement.style.display = 'none'; // Hide other overlay
  if (!chordOverlayElement || !detectedChords || detectedChords.length === 0) {
    hide();
    return;
  }

  const topChord = detectedChords[0];

  // Add chord to sequence (avoid duplicates)
  const chordExists = chordSequence.some(c => c.chordSymbol === topChord.chordSymbol);
  if (!chordExists) {
    chordSequence.push(topChord);
  }

  // Normalize base key input and determine final key mode
  let baseKeyRoot: number | undefined = undefined;
  let finalKeyMode = keyMode;

  if (baseKeyName && baseKeyName.trim()) {
    const input = baseKeyName.trim().toUpperCase();

    // Check if text input overrides radio button (e.g., "G minor" overrides major radio button)
    if (input.includes('MINOR') || input.includes('MIN')) {
      finalKeyMode = 'minor';
    } else if (input.includes('MAJOR') || input.includes('MAJ')) {
      finalKeyMode = 'major';
    }

    // Extract just the note name for lookup
    const cleanKey = input
      .replace(/\s*(MINOR|MIN|MAJOR|MAJ)\s*/g, '') // Remove mode indicators
      .toUpperCase();

    baseKeyRoot = NOTE_MAP[cleanKey];
  }

  let html = '';

  if (baseKeyRoot !== undefined) {
    // Case 1: Base key is provided - analyze against that key
    html = analyzeChordSequenceInKey(baseKeyRoot, topChord, finalKeyMode);
  } else {
    // Case 2: No base key - guess key from chord sequence
    html = analyzeChordSequenceForKeyGuessing(topChord);
  }

  renderChordSuggestions(html);
}

/**
 * Renders the melody suggestion data into the overlay element.
 * @param suggestions The sorted list of suggestions to render.
 * @param playedPitchClasses The set of currently played melody pitch classes.
 */
function renderMelodySuggestions(suggestions: KeySuggestion[], playedPitchClasses: Set<number>): void {
  console.log('🎭 === MELODY OVERLAY RENDER === renderMelodySuggestions called with', suggestions.length, 'suggestions');
  console.log('renderMelodySuggestions called with', suggestions.length, 'suggestions');
  console.log('Suggestions data:', suggestions);
  console.log('Played pitch classes:', Array.from(playedPitchClasses));

  if (!melodyOverlayElement) {
    console.error('melodyOverlayElement is null');
    return;
  }

  console.log('melodyOverlayElement found, clearing content');
  melodyOverlayElement!.innerHTML = ''; // Clear previous content

  // Add close button
  const closeButton = document.createElement('span');
  closeButton.className = 'suggestion-close';
  closeButton.innerHTML = '&times;';
  closeButton.title = 'Close Suggestions';
  closeButton.onclick = hide;
  melodyOverlayElement!.appendChild(closeButton);

  // Add title
  const title = document.createElement('h3');
  title.id = 'melody-suggestions-dialog';
  title.textContent = 'Key Suggestions - Melody Mode';
  melodyOverlayElement!.appendChild(title);

  if (suggestions.length === 0) {
    const noSuggestionsDiv = document.createElement('div');
    noSuggestionsDiv.className = 'no-suggestions';
    noSuggestionsDiv.textContent = 'No key suggestions available for the current melody.';
    melodyOverlayElement!.appendChild(noSuggestionsDiv);
  } else {
    // Add suggestions
    suggestions.forEach(suggestion => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'suggestion-item clickable-suggestion';

      const header = document.createElement('div');
      header.className = 'suggestion-header';
      header.textContent = `${suggestion.name} (${suggestion.matchCount}/${playedPitchClasses.size} match)`;

      const notesDiv = document.createElement('div');
      notesDiv.className = 'suggestion-notes';

      const sortedPitches = Array.from(suggestion.pitchClasses).sort((a, b) => a - b);
      sortedPitches.forEach((pitch, index) => {
        const noteSpan = document.createElement('span');
        noteSpan.textContent = NOTES[pitch] + (index < sortedPitches.length - 1 ? ', ' : '');
        noteSpan.className = playedPitchClasses.has(pitch) ? 'played' : 'not-played';
        notesDiv.appendChild(noteSpan);
      });

      // Find matching scales in the scale tables
      const matchingScales = allScales.filter(scale =>
        scale.pitchClasses.size === suggestion.pitchClasses.size &&
        Array.from(scale.pitchClasses).every(pc => suggestion.pitchClasses.has(pc)) &&
        Array.from(suggestion.pitchClasses).every(pc => scale.pitchClasses.has(pc))
      );

      if (matchingScales.length > 0) {
        const scaleLinksDiv = document.createElement('div');
        scaleLinksDiv.className = 'scale-links';
        scaleLinksDiv.innerHTML = '<small>Click to view in tables:</small>';

        matchingScales.slice(0, 3).forEach((scale, index) => {
          const linkSpan = document.createElement('span');
          linkSpan.className = 'scale-link';
          linkSpan.textContent = scale.name || `Scale ${index + 1}`;
          linkSpan.onclick = () => {
            trackInteraction(`View in Tables - Melody Suggestions - ${scale.name || `Scale ${index + 1}`}`, 'Navigation');
            highlightScale(scale.id);
          };
          scaleLinksDiv.appendChild(linkSpan);

          if (index < Math.min(matchingScales.length - 1, 2)) {
            scaleLinksDiv.appendChild(document.createTextNode(', '));
          }
        });

        itemDiv.appendChild(scaleLinksDiv);
      }

      itemDiv.appendChild(header);
      itemDiv.appendChild(notesDiv);
      melodyOverlayElement!.appendChild(itemDiv);
    });
  }

  console.log('Setting melodyOverlayElement display to block');
  showModal(melodyOverlayElement!);
}

/**
 * Renders the chord suggestion data into the overlay element.
 * @param htmlContent The HTML content to render.
 */
function renderChordSuggestions(htmlContent: string): void {
  console.log('renderChordSuggestions called with HTML content');
  if (!chordOverlayElement) {
    console.error('chordOverlayElement is null');
    return;
  }

  chordOverlayElement.innerHTML = ''; // Clear previous content

  // Add close button
  const closeButton = document.createElement('span');
  closeButton.className = 'suggestion-close';
  closeButton.innerHTML = '&times;';
  closeButton.title = 'Close Suggestions';
  closeButton.onclick = hide;
  chordOverlayElement.appendChild(closeButton);

  // Add content
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = htmlContent;
  chordOverlayElement.appendChild(contentDiv);

  console.log('Setting chordOverlayElement display to block');
  showModal(chordOverlayElement);
}
