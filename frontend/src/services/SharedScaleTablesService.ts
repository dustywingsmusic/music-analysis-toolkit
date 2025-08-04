/**
 * Shared Scale Tables Service
 * 
 * This service provides a unified API for scale table functionality that can be used
 * across different contexts: main app, Analysis Widget, and future Chrome plugin.
 * 
 * Key Features:
 * - Scale data management and filtering
 * - Mode relationship navigation
 * - Cross-navigation from analysis results
 * - Plugin-ready architecture with minimal dependencies
 * - MIDI integration support
 * - Search and filtering capabilities
 */

import { allScaleData, NOTES } from '../constants/scales';
import { ProcessedScale, ScaleData } from '../types';
import { buildModesFromRoot, ModeFromRoot, isValidRootNote } from './scaleDataService';
import { getChromaticScaleWithEnharmonics, generateScaleFromIntervals } from '../utils/music';

// Types for the shared service
export interface ScaleTableFilter {
  searchQuery?: string;
  rootNote?: string;
  scaleFamily?: string;
  modeIndex?: number;
  showOnlyMatches?: boolean;
  playedPitchClasses?: Set<number>;
}

export interface ScaleHighlight {
  cellId: string;
  reason: 'navigation' | 'midi' | 'analysis' | 'search';
  temporary?: boolean;
  duration?: number;
}

export interface CrossNavigationContext {
  sourceTab: 'harmony' | 'modal' | 'discovery' | 'external';
  targetMode?: string;
  targetTonic?: string;
  highlightId?: string;
  analysisData?: any;
}

export interface ScaleTableNavigation {
  highlightScale: (highlight: ScaleHighlight) => void;
  clearHighlights: () => void;
  scrollToScale: (scaleId: string) => void;
  setFilter: (filter: ScaleTableFilter) => void;
  getVisibleScales: () => ProcessedScale[];
}

export interface SharedScaleTableConfig {
  enableMidi?: boolean;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableCrossNavigation?: boolean;
  maxVisibleScales?: number;
  defaultFilter?: ScaleTableFilter;
  pluginMode?: boolean; // For Chrome plugin optimization
}

/**
 * Core shared scale tables service
 * Designed to work with minimal dependencies for plugin compatibility
 */
export class SharedScaleTablesService {
  private processedScales: ProcessedScale[] = [];
  private config: SharedScaleTableConfig;
  private currentFilter: ScaleTableFilter = {};
  private currentHighlights: Map<string, ScaleHighlight> = new Map();
  private navigationCallbacks: Set<(navigation: ScaleTableNavigation) => void> = new Set();

  constructor(config: SharedScaleTableConfig = {}) {
    this.config = {
      enableMidi: true,
      enableSearch: true,
      enableFiltering: true,
      enableCrossNavigation: true,
      maxVisibleScales: 1000,
      pluginMode: false,
      ...config
    };
    
    this.initializeScales();
  }

  /**
   * Initialize processed scales from scale data
   * This creates the core data structure used by all scale tables
   */
  private initializeScales(): void {
    this.processedScales = [];
    
    // Process each scale family
    allScaleData.forEach((scaleFamily: ScaleData) => {
      // For each root note
      NOTES.forEach((rootNoteCompound: string, rootIndex: number) => {
        const rootNote = rootNoteCompound.split('/')[0]; // Use primary name (C instead of C♯/D♭)
        
        // For each mode in the scale family
        scaleFamily.modeIntervals.forEach((intervals: number[], modeIndex: number) => {
          const pitchClasses = new Set(intervals.map(interval => (rootIndex + interval) % 12));
          const notes = generateScaleFromIntervals(rootIndex, rootNote, intervals);
          
          // Calculate parent scale information
          const parentRootIndex = (rootIndex - modeIndex + 12) % 12;
          const parentRootNote = NOTES[parentRootIndex].split('/')[0];
          
          const processedScale: ProcessedScale = {
            id: `${scaleFamily.tableId}-${rootIndex}-${modeIndex}`,
            tableId: scaleFamily.tableId,
            rootNote: rootIndex,
            rootNoteName: rootNote,
            modeIndex,
            name: scaleFamily.commonNames?.[modeIndex] || scaleFamily.headers[modeIndex + 1] || `Mode ${modeIndex + 1}`,
            formula: scaleFamily.formulas[modeIndex],
            intervals,
            pitchClasses,
            notes,
            scaleFamily: scaleFamily.name,
            parentScaleName: scaleFamily.name,
            parentRootNote: parentRootNote,
            parentRootIndex,
            isDiatonic: scaleFamily.isDiatonic,
            character: this.getScaleCharacter(scaleFamily.name, modeIndex)
          };

          this.processedScales.push(processedScale);
        });
      });
    });
  }

  /**
   * Get character description for a scale mode
   */
  private getScaleCharacter(scaleName: string, modeIndex: number): string {
    const descriptions: Record<string, string[]> = {
      'Major Scale': [
        'Bright, happy, stable',
        'Minor with bright 6th',
        'Dark, Spanish flavor',
        'Dreamy, floating',
        'Dominant, bluesy',
        'Sad, melancholic',
        'Unstable, diminished'
      ],
      'Melodic Minor': [
        'Jazz minor, sophisticated',
        'Dark with flat 2nd',
        'Augmented, dreamy',
        'Lydian dominant',
        'Hindu scale, exotic',
        'Half-diminished',
        'Altered dominant'
      ],
      'Harmonic Minor': [
        'Classical, exotic',
        'Locrian with natural 6th',
        'Major with augmented 5th',
        'Ukrainian Dorian',
        'Phrygian dominant',
        'Lydian with sharp 2nd',
        'Super-Locrian'
      ]
    };

    return descriptions[scaleName]?.[modeIndex] || 'Unique modal character';
  }

  /**
   * Apply filter to get visible scales
   */
  public getFilteredScales(filter: ScaleTableFilter = {}): ProcessedScale[] {
    let filteredScales = [...this.processedScales];

    // Search query filter
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredScales = filteredScales.filter(scale => 
        scale.name?.toLowerCase().includes(query) ||
        scale.rootNoteName.toLowerCase().includes(query) ||
        scale.scaleFamily.toLowerCase().includes(query) ||
        scale.formula.toLowerCase().includes(query)
      );
    }

    // Root note filter
    if (filter.rootNote && isValidRootNote(filter.rootNote)) {
      filteredScales = filteredScales.filter(scale => 
        scale.rootNoteName === filter.rootNote
      );
    }

    // Scale family filter
    if (filter.scaleFamily) {
      filteredScales = filteredScales.filter(scale => 
        scale.scaleFamily === filter.scaleFamily
      );
    }

    // Mode index filter
    if (typeof filter.modeIndex === 'number') {
      filteredScales = filteredScales.filter(scale => 
        scale.modeIndex === filter.modeIndex
      );
    }

    // MIDI matching filter
    if (filter.showOnlyMatches && filter.playedPitchClasses && filter.playedPitchClasses.size > 0) {
      filteredScales = filteredScales.filter(scale => {
        // Check if all played notes are contained in this scale
        for (const playedNote of filter.playedPitchClasses!) {
          if (!scale.pitchClasses.has(playedNote)) {
            return false;
          }
        }
        return true;
      });
    }

    // Limit results for performance
    if (this.config.maxVisibleScales) {
      filteredScales = filteredScales.slice(0, this.config.maxVisibleScales);
    }

    return filteredScales;
  }

  /**
   * Cross-navigation from analysis results to scale tables
   */
  public navigateFromAnalysis(context: CrossNavigationContext): ScaleHighlight | null {
    if (!this.config.enableCrossNavigation) {
      return null;
    }

    const { targetMode, targetTonic } = context;
    
    if (!targetMode || !targetTonic) {
      return null;
    }

    // Find the matching scale
    const matchingScale = this.processedScales.find(scale => {
      const scaleModeMatch = scale.name?.toLowerCase().includes(targetMode.toLowerCase());
      const scaleTonicMatch = scale.rootNoteName === targetTonic;
      return scaleModeMatch && scaleTonicMatch;
    });

    if (matchingScale) {
      const highlight: ScaleHighlight = {
        cellId: matchingScale.id,
        reason: 'analysis',
        temporary: false
      };
      
      this.setHighlight(highlight);
      return highlight;
    }

    return null;
  }

  /**
   * Set scale highlight
   */
  public setHighlight(highlight: ScaleHighlight): void {
    this.currentHighlights.set(highlight.cellId, highlight);
    
    // Clear temporary highlights after duration
    if (highlight.temporary && highlight.duration) {
      setTimeout(() => {
        this.clearHighlight(highlight.cellId);
      }, highlight.duration);
    }
  }

  /**
   * Clear specific highlight
   */
  public clearHighlight(cellId: string): void {
    this.currentHighlights.delete(cellId);
  }

  /**
   * Clear all highlights
   */
  public clearAllHighlights(): void {
    this.currentHighlights.clear();
  }

  /**
   * Get current highlights
   */
  public getHighlights(): Map<string, ScaleHighlight> {
    return new Map(this.currentHighlights);
  }

  /**
   * Get modes from a specific root note
   * Useful for modal analysis navigation
   */
  public getModesFromRoot(rootNote: string): ModeFromRoot[] {
    if (!isValidRootNote(rootNote)) {
      return [];
    }
    
    return buildModesFromRoot(rootNote);
  }

  /**
   * Find scale by ID
   */
  public findScaleById(id: string): ProcessedScale | null {
    return this.processedScales.find(scale => scale.id === id) || null;
  }

  /**
   * Find scales by mode name (e.g., "Dorian", "Mixolydian")
   */
  public findScalesByMode(modeName: string): ProcessedScale[] {
    return this.processedScales.filter(scale => 
      scale.name?.toLowerCase().includes(modeName.toLowerCase())
    );
  }

  /**
   * Find scales by root note
   */
  public findScalesByRoot(rootNote: string): ProcessedScale[] {
    return this.processedScales.filter(scale => 
      scale.rootNoteName === rootNote
    );
  }

  /**
   * Get available scale families
   */
  public getAvailableScaleFamilies(): string[] {
    return allScaleData.map(family => family.name);
  }

  /**
   * Get available root notes
   */
  public getAvailableRootNotes(): string[] {
    return NOTES.map(note => note.split('/')[0]); // Return primary names only
  }

  /**
   * Get MIDI-compatible scale suggestions
   */
  public getMidiScaleSuggestions(playedPitchClasses: Set<number>): ProcessedScale[] {
    if (playedPitchClasses.size === 0) {
      return [];
    }

    return this.getFilteredScales({
      showOnlyMatches: true,
      playedPitchClasses
    }).slice(0, 20); // Limit for performance
  }

  /**
   * Register navigation callback for UI updates
   */
  public registerNavigationCallback(callback: (navigation: ScaleTableNavigation) => void): void {
    this.navigationCallbacks.add(callback);
  }

  /**
   * Unregister navigation callback
   */
  public unregisterNavigationCallback(callback: (navigation: ScaleTableNavigation) => void): void {
    this.navigationCallbacks.delete(callback);
  }

  /**
   * Create navigation interface for UI components
   */
  public createNavigation(): ScaleTableNavigation {
    return {
      highlightScale: (highlight: ScaleHighlight) => this.setHighlight(highlight),
      clearHighlights: () => this.clearAllHighlights(),
      scrollToScale: (scaleId: string) => {
        // Emit scroll event to registered callbacks
        this.navigationCallbacks.forEach(callback => {
          callback({
            highlightScale: this.setHighlight.bind(this),
            clearHighlights: this.clearAllHighlights.bind(this),
            scrollToScale: (id: string) => {}, // Handled by UI component
            setFilter: (filter: ScaleTableFilter) => {
              this.currentFilter = { ...this.currentFilter, ...filter };
            },
            getVisibleScales: () => this.getFilteredScales(this.currentFilter)
          });
        });
      },
      setFilter: (filter: ScaleTableFilter) => {
        this.currentFilter = { ...this.currentFilter, ...filter };
      },
      getVisibleScales: () => this.getFilteredScales(this.currentFilter)
    };
  }

  /**
   * Export configuration for plugin packaging
   * Returns minimal data needed for Chrome plugin
   */
  public exportForPlugin(): {
    scales: ProcessedScale[];
    families: string[];
    rootNotes: string[];
    config: SharedScaleTableConfig;
  } {
    return {
      scales: this.processedScales,
      families: this.getAvailableScaleFamilies(),
      rootNotes: this.getAvailableRootNotes(),
      config: this.config
    };
  }

  /**
   * Create lightweight instance for plugin use
   */
  public static createPluginInstance(data?: {
    scales: ProcessedScale[];
    families: string[];
    rootNotes: string[];
    config: SharedScaleTableConfig;
  }): SharedScaleTablesService {
    const config: SharedScaleTableConfig = {
      pluginMode: true,
      maxVisibleScales: 100, // Limit for plugin performance
      enableMidi: false, // Disable MIDI in plugin
      ...(data?.config || {})
    };

    const service = new SharedScaleTablesService(config);
    
    if (data?.scales) {
      service.processedScales = data.scales;
    }
    
    return service;
  }
}

/**
 * Default shared service instance for main app
 */
export const sharedScaleTablesService = new SharedScaleTablesService({
  enableMidi: true,
  enableSearch: true,
  enableFiltering: true,
  enableCrossNavigation: true,
  pluginMode: false
});

/**
 * Utility functions for cross-navigation
 */
export const scaleTableNavigation = {
  /**
   * Navigate to scale tables with specific mode and tonic
   */
  viewInTables: (mode: string, tonic: string, onNavigate?: (highlightId?: string) => void) => {
    const context: CrossNavigationContext = {
      sourceTab: 'harmony',
      targetMode: mode,
      targetTonic: tonic
    };
    
    const highlight = sharedScaleTablesService.navigateFromAnalysis(context);
    
    if (highlight && onNavigate) {
      onNavigate(highlight.cellId);
    }
    
    return highlight;
  },

  /**
   * Navigate from modal analysis result
   */
  viewModalInTables: (
    modeName: string, 
    onNavigate?: (mode: string, tonic: string) => void
  ) => {
    const modeParts = modeName.split(' ');
    const tonic = modeParts[0];
    const mode = modeParts.slice(1).join(' ');
    
    if (onNavigate) {
      onNavigate(mode, tonic);
    }
    
    const context: CrossNavigationContext = {
      sourceTab: 'modal',
      targetMode: mode,
      targetTonic: tonic
    };
    
    return sharedScaleTablesService.navigateFromAnalysis(context);
  },

  /**
   * Generate link text for "View in Tables" buttons
   */
  generateViewInTablesText: (modeName: string): string => {
    return `View ${modeName} in Scale Tables →`;
  }
};

export default SharedScaleTablesService;