/**
 * Real-Time Mode Detection Algorithm
 * Implementation of the algorithm specified in IntegratedMusicSidebarFeatureConsolidation.md
 */

import { allScaleData, PARENT_KEYS, PITCH_CLASS_NAMES } from '../constants/scales';
import { getModePopularity } from '../constants/mappings';

// Core Data & State Types
export interface RealTimeModeState {
  notesHistory: number[];  // ordered list of unique pitch classes (0–11), ignoring repeats
  rootPitch: number | null;  // pitch class of the very first note
  lowestMidiNote: number | null; // actual lowest MIDI note played
  direction: "unknown" | "ascending" | "descending";
  state: "scale-mode";
  originalModes: ModeInfo[];  // all modes whose tonic = rootPitch, sorted by popularity
  candidateModes: ModeInfo[];  // subset of originalModes still viable given entered notes
}

export interface ModeInfo {
  family: ScaleFamily;
  name: string;
  modePitchSet: Set<number>;  // precomputed pitch class set for this mode at rootPitch
  popularity: number;  // lower number = more popular
  modeIndex: number;
  actualRoot?: number;  // the actual root pitch class for this mode (when considering all possible roots)
}

export type ScaleFamily = 'Major Scale' | 'Melodic Minor' | 'Harmonic Minor' | 'Harmonic Major' | 'Double Harmonic Major' | 'Major Pentatonic' | 'Blues Scale';

export interface ModeDetectionResult {
  suggestions: ModeSuggestion[];
  state: "scale-mode";
}

export interface ModeSuggestion {
  family: ScaleFamily;
  name: string;
  fullName: string;  // e.g., "F Ionian"
  mismatchCount: number;
  matchCount: number;
  popularity: number;
  notes: string[];
}

// Scale family definitions from legacy system (constants/scales.ts)
const buildScaleFamilyIntervals = (): Record<ScaleFamily, number[]> => {
  const intervals: Record<string, number[]> = {};
  
  allScaleData.forEach(scale => {
    intervals[scale.name] = scale.parentScaleIntervals;
  });
  
  return intervals as Record<ScaleFamily, number[]>;
};

const SCALE_FAMILY_INTERVALS: Record<ScaleFamily, number[]> = buildScaleFamilyIntervals();


// Mode to index mappings for each scale family (from legacy system)
const buildModeToIndexMappings = (): Record<ScaleFamily, Record<string, number>> => {
  const mappings: Record<string, Record<string, number>> = {};
  
  allScaleData.forEach(scale => {
    const modeNames = scale.commonNames || scale.alternateNames || [];
    const familyMappings: Record<string, number> = {};
    
    modeNames.forEach((modeName, index) => {
      if (modeName) {
        familyMappings[modeName] = index;
      }
    });
    
    mappings[scale.name] = familyMappings;
  });
  
  return mappings as Record<ScaleFamily, Record<string, number>>;
};

const MODE_TO_INDEX_MAPPINGS: Record<ScaleFamily, Record<string, number>> = buildModeToIndexMappings();

// Precompute ordered mode lists for each family based on mapping indices
const MODE_ORDER: Record<ScaleFamily, string[]> = Object.fromEntries(
  Object.entries(MODE_TO_INDEX_MAPPINGS).map(([family, mapping]) => {
    const ordered = Object.entries(mapping)
      .sort((a, b) => a[1] - b[1])
      .map(([name]) => name);
    return [family, ordered];
  })
) as Record<ScaleFamily, string[]>;

// Note names for display - using proper enharmonic spellings from legacy system
const buildNoteNames = (): string[] => {
  const noteNames: string[] = [];
  for (let i = 0; i < 12; i++) {
    noteNames[i] = PARENT_KEYS[i as keyof typeof PARENT_KEYS];
  }
  return noteNames;
};

const NOTE_NAMES = buildNoteNames();

// Function to convert MIDI input to proper enharmonic spelling
const convertToProperEnharmonic = (pitchClass: number): number => {
  // This function can be extended to handle context-aware enharmonic conversion
  // For now, we use the PARENT_KEYS spellings which are already proper
  return pitchClass;
};

/**
 * Real-time mode detection class implementing the specification algorithm
 */
export class RealTimeModeDetector {
  private state: RealTimeModeState;
  private modePitchSets: Map<string, Set<number>> = new Map();
  private manualRootOverride = false;

  constructor() {
    this.state = this.initializeState();
  }

  /**
   * Initialize state for new session
   */
  private initializeState(): RealTimeModeState {
    return {
      notesHistory: [],
      rootPitch: null,
      lowestMidiNote: null,
      direction: "unknown",
      state: "scale-mode",
      originalModes: [],
      candidateModes: []
    };
  }

  /**
   * Precompute every mode's pitch-class set for the current root pitch
   */
  private precomputeModePitchSets(rootPitch: number): void {
    this.modePitchSets.clear();
    for (const scaleData of allScaleData) {
      const family = scaleData.name as ScaleFamily;
      const modes = MODE_TO_INDEX_MAPPINGS[family];

      if (!modes || !scaleData.modeIntervals) continue;

      for (const [modeName, modeIndex] of Object.entries(modes)) {
        const modeIntervals = scaleData.modeIntervals[modeIndex];

        if (!modeIntervals) continue;

        const pitchClasses = new Set(
          modeIntervals.map(interval => (rootPitch + interval) % 12)
        );
        const key = `${family}-${modeName}-${rootPitch}`;
        this.modePitchSets.set(key, pitchClasses);
      }
    }
  }

  /**
   * Session Initialization (First Note)
   */
  private sessionInitialization(firstNotePitchClass: number, noteNumber: number): void {
    console.log('🎵 Session Initialization with first note:', NOTE_NAMES[firstNotePitchClass]);
    
    // Clear notesHistory; set direction = "unknown" and state = "scale-mode"
    this.state.notesHistory = [];
    this.state.direction = "unknown";
    this.state.state = "scale-mode";
    
    // Append first note's pitch class to notesHistory; set rootPitch
    this.state.notesHistory.push(firstNotePitchClass);
    this.state.rootPitch = firstNotePitchClass;
    this.state.lowestMidiNote = noteNumber;

    // Precompute pitch sets and compute modes for this root
    this.precomputeModePitchSets(this.state.rootPitch);
    this.state.originalModes = this.computeOriginalModes(this.state.rootPitch);
    this.state.candidateModes = [...this.state.originalModes];
    
    console.log('🎯 Initialized with', this.state.candidateModes.length, 'candidate modes');
  }

  /**
   * Compute all modes that could contain the played notes, considering all possible roots
   * This fixes the issue where F G# should suggest F# Locrian (not just F-based modes)
   */
  private computeOriginalModes(rootPitch: number): ModeInfo[] {
    const modes: ModeInfo[] = [];

    for (const [family, modeMap] of Object.entries(MODE_TO_INDEX_MAPPINGS)) {
      for (const [modeName, modeIndex] of Object.entries(modeMap)) {
        const key = `${family}-${modeName}-${rootPitch}`;
        const modePitchSet = this.modePitchSets.get(key);

        if (modePitchSet) {
          modes.push({
            family: family as ScaleFamily,
            name: modeName,
            modePitchSet,
            popularity: getModePopularity(modeName),
            modeIndex,
            actualRoot: rootPitch
          });
        }
      }
    }

    return modes.sort((a, b) => a.popularity - b.popularity);
  }

  /**
   * Recompute original and candidate modes for the current root using all noted pitches
   */
  private recomputeCandidateModes(): void {
    if (this.state.rootPitch === null) {
      return;
    }
    this.precomputeModePitchSets(this.state.rootPitch);
    this.state.originalModes = this.computeOriginalModes(this.state.rootPitch);
    const notesSet = new Set(this.state.notesHistory);
    this.state.candidateModes = this.state.originalModes.filter(mode =>
      [...notesSet].every(pc => mode.modePitchSet.has(pc))
    );
  }

  /**
   * Adding a New Note
   */
  public addNote(noteNumber: number, pitchClass: number): ModeDetectionResult | null {
    console.log('🎵 Adding note:', NOTE_NAMES[pitchClass]);
    
    // First note - session initialization
    if (this.state.notesHistory.length === 0) {
      this.sessionInitialization(pitchClass, noteNumber);
      return this.generateResult();
    }
    
    // If pitchClass already in notesHistory, ignore and return null to prevent infinite loops
    if (this.state.notesHistory.includes(pitchClass)) {
      console.log('🔄 Note already in history, ignoring');
      return null;
    }
    
    // Otherwise append it
    const previousPC = this.state.notesHistory[this.state.notesHistory.length - 1];
    this.state.notesHistory.push(pitchClass);

    // Determine/Update Direction
    this.updateDirection(pitchClass, previousPC);

    // Update root pitch if this is the lowest MIDI note seen so far
    if (
      this.state.lowestMidiNote === null ||
      (noteNumber < this.state.lowestMidiNote && !this.manualRootOverride)
    ) {
      if (this.state.lowestMidiNote === null || noteNumber < this.state.lowestMidiNote) {
        this.state.lowestMidiNote = noteNumber;
        if (!this.manualRootOverride) {
          this.state.rootPitch = noteNumber % 12;
        }
      }
      this.recomputeCandidateModes();
      return this.generateResult();
    }

    // Strict Filtering
    return this.strictFiltering(pitchClass);
  }

  /**
   * Update direction based on new note
   */
  private updateDirection(currentPC: number, previousPC: number): void {
    if (this.state.direction === "unknown") {
      if (currentPC > previousPC) {
        this.state.direction = "ascending";
      } else if (currentPC < previousPC) {
        this.state.direction = "descending";
      }
      // If equal, direction remains unknown
    } else {
      // Check if new note reverses order
      const isAscending = currentPC > previousPC;
      const isDescending = currentPC < previousPC;
      
      if (this.state.direction === "ascending" && isDescending) {
        this.state.direction = "descending";
        console.log('🔄 Direction flipped to descending');
      } else if (this.state.direction === "descending" && isAscending) {
        this.state.direction = "ascending";
        console.log('🔄 Direction flipped to ascending');
      }
    }
    
    console.log('📐 Direction:', this.state.direction);
  }

  /**
   * Strict Filtering
   */
  private strictFiltering(pitchClass: number): ModeDetectionResult {
    // Filter candidateModes to those whose modePitchSet contains pitchClass
    this.state.candidateModes = this.state.candidateModes.filter(mode => 
      mode.modePitchSet.has(pitchClass)
    );
    
    console.log('🔍 After strict filtering:', this.state.candidateModes.length, 'candidates remain');
    
    if (this.state.candidateModes.length > 0) {
      // Generate suggestions from remaining candidates
      return this.generateResult();
    } else {
      // No strict matches - run Mismatch Handling
      return this.mismatchHandling();
    }
  }

  /**
   * Mismatch Handling - Show partial matches instead of switching to melody-mode
   * According to user requirements: "Scale mode should continue to suggest partial matches"
   */
  private mismatchHandling(): ModeDetectionResult {
    console.log('⚠️ No strict matches - showing partial matches with mismatch counts');
    
    // Instead of switching to melody-mode, compute partial matches for all original modes
    const partialMatches: ModeSuggestion[] = [];
    const notesHistorySet = new Set(this.state.notesHistory);
    
    // Group by scale family
    const familyGroups = new Map<ScaleFamily, ModeSuggestion[]>();
    
    for (const mode of this.state.originalModes) {
      const matchCount = this.calculateMatchCount(notesHistorySet, mode.modePitchSet);
      const mismatchCount = this.calculateMismatchCount(notesHistorySet, mode.modePitchSet);
      
      // Only include modes that have at least some matches
      if (matchCount > 0) {
        const root = mode.actualRoot ?? this.state.rootPitch!;
        const familyData = allScaleData.find(s => s.name === mode.family);
        const notes = familyData
          ? familyData.modeIntervals[mode.modeIndex].map(i => NOTE_NAMES[(root + i) % 12])
          : Array.from(mode.modePitchSet).map(pc => NOTE_NAMES[pc]).sort();

        const suggestion: ModeSuggestion = {
          family: mode.family,
          name: mode.name,
          fullName: `${NOTE_NAMES[root]} ${mode.name}`,
          matchCount,
          mismatchCount,
          popularity: mode.popularity,
          notes
        };
        
        if (!familyGroups.has(mode.family)) {
          familyGroups.set(mode.family, []);
        }
        familyGroups.get(mode.family)!.push(suggestion);
      }
    }
    
    // Sort within each family and take top 3
    for (const [family, modes] of familyGroups) {
      modes.sort((a, b) => {
        // Sort by matchCount descending, then mismatchCount ascending, then popularity ascending
        if (a.matchCount !== b.matchCount) {
          return b.matchCount - a.matchCount;
        }
        if (a.mismatchCount !== b.mismatchCount) {
          return a.mismatchCount - b.mismatchCount;
        }
        return a.popularity - b.popularity;
      });
      
      // Take top 3 in each family
      partialMatches.push(...modes.slice(0, 3));
    }
    
    console.log('🎼 Partial matches', partialMatches.length);

    return {
      suggestions: partialMatches,
      state: this.state.state
    };
  }

  /**
   * Generate result with current candidate modes
   */
  private generateResult(): ModeDetectionResult {
    const suggestions = this.generateSuggestions();

    return {
      suggestions,
      state: this.state.state
    };
  }

  /**
   * Generate suggestions from candidate modes
   */
  private generateSuggestions(): ModeSuggestion[] {
    const suggestions: ModeSuggestion[] = [];
    const notesHistorySet = new Set(this.state.notesHistory);
    
    // Group by scale family
    const familyGroups = new Map<ScaleFamily, ModeSuggestion[]>();
    
    for (const mode of this.state.candidateModes) {
      const matchCount = this.calculateMatchCount(notesHistorySet, mode.modePitchSet);
      const mismatchCount = this.calculateMismatchCount(notesHistorySet, mode.modePitchSet);

      const root = mode.actualRoot ?? this.state.rootPitch!;
      const familyData = allScaleData.find(s => s.name === mode.family);
      const notes = familyData
        ? familyData.modeIntervals[mode.modeIndex].map(i => NOTE_NAMES[(root + i) % 12])
        : Array.from(mode.modePitchSet).map(pc => NOTE_NAMES[pc]).sort();

      const suggestion: ModeSuggestion = {
        family: mode.family,
        name: mode.name,
        fullName: `${NOTE_NAMES[root]} ${mode.name}`,
        matchCount,
        mismatchCount,
        popularity: mode.popularity,
        notes
      };
      
      if (!familyGroups.has(mode.family)) {
        familyGroups.set(mode.family, []);
      }
      familyGroups.get(mode.family)!.push(suggestion);
    }
    
    // Sort within each family based on MODE_ORDER and take top 3
    for (const [family, modes] of familyGroups) {
      const order = MODE_ORDER[family];
      modes.sort((a, b) => {
        const indexA = order.indexOf(a.name);
        const indexB = order.indexOf(b.name);
        return indexA - indexB;
      });

      suggestions.push(...modes.slice(0, 3));
    }
    
    return suggestions;
  }

  /**
   * Calculate match count between played notes and mode
   */
  private calculateMatchCount(notesHistory: Set<number>, modePitchSet: Set<number>): number {
    let count = 0;
    for (const note of notesHistory) {
      if (modePitchSet.has(note)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Calculate mismatch count
   */
  private calculateMismatchCount(notesHistory: Set<number>, modePitchSet: Set<number>): number {
    let count = 0;
    for (const note of notesHistory) {
      if (!modePitchSet.has(note)) {
        count++;
      }
    }
    return count;
  }



  /**
   * Set a new root pitch and recompute suggestions
   */
  public setRootPitch(pitchClass: number): ModeDetectionResult {
    console.log('🎯 Setting root pitch to:', NOTE_NAMES[pitchClass]);

    this.state.rootPitch = pitchClass;
    this.state.lowestMidiNote = null;
    this.manualRootOverride = true;
    this.recomputeCandidateModes();

    return this.generateResult();
  }

  /**
   * Clear manual tonic override so new notes can update the root again
   */
  public unlockRootOverride(): void {
    this.manualRootOverride = false;
  }

  /**
   * Reset the detector
   */
  public reset(): void {
    this.state = this.initializeState();
    this.manualRootOverride = false;
  }

  /**
   * Get current state (for debugging)
   */
  public getState(): RealTimeModeState {
    return { ...this.state };
  }
}