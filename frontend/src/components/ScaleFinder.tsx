import React, { useState, useEffect, useRef, useCallback } from 'react';
import { allScaleData, NOTES } from '../constants/scales';
import { ProcessedScale } from '../types';
import ScaleTable from './ScaleTable';
import * as keySuggester from '../services/keySuggester';
import { findChordMatches } from '../services/chordLogic';
import { SharedScaleTablesService, sharedScaleTablesService } from '../services/SharedScaleTablesService';

const setsAreEqual = (setA: Set<number>, setB: Set<number>) => {
    if (setA.size !== setB.size) return false;
    for (const a of setA) if (!setB.has(a)) return false;
    return true;
};

interface ScaleFinderProps {
  initialHighlightId: string | null;
  embedded?: boolean;
  showDebugInfo?: boolean;
  onShowUnifiedResults?: (results: any, historyId?: string) => void;
  playedNotes?: any[];
  playedPitchClasses?: Set<number>;
  midiMode?: '7' | '5' | 'melody' | 'chord';
  detectionEnabled?: boolean;
  analysisFocus?: 'automatic' | 'complete' | 'pentatonic' | 'chord';
  sharedService?: SharedScaleTablesService;
}

const ScaleFinder: React.FC<ScaleFinderProps> = ({ 
  initialHighlightId, 
  embedded = false, 
  showDebugInfo = false, 
  onShowUnifiedResults,
  playedNotes = [],
  playedPitchClasses = new Set(),
  midiMode = '7',
  detectionEnabled = true,
  analysisFocus = 'automatic',
  sharedService
}) => {
  const scaleService = sharedService || sharedScaleTablesService;
  const [processedScales, setProcessedScales] = useState<ProcessedScale[]>([]);
  const [midiHighlightedCellId, setMidiHighlightedCellId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const keySuggesterInitialized = useRef<boolean>(false);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<{
    notesEntered: number;
    pitchClasses: number[];
    noteNames: string[];
    detectionMode: string;
    shouldCheck: boolean;
    scalesToSearch: number;
    allMatches: Array<{
      id: string;
      rootNote: number;
      name?: string;
      pitchClasses: number[];
    }>;
    selectedMatch?: {
      id: string;
      rootNote: number;
      name?: string;
    };
    timestamp: number;
  } | null>(null);

  // Generate key suggestions based on played pitch classes
  const generateKeySuggestions = useCallback((playedPitchClasses: Set<number>) => {
    const suggestions: Array<{
      name: string;
      matchCount: number;
      pitchClasses: Set<number>;
      confidence: number;
    }> = [];

    // Use shared service for scale matching
    const exactMatches = scaleService.getMidiScaleSuggestions(playedPitchClasses);

    // Group exact matches by their pitch class sets to find modes of the same parent scale
    const scaleGroups = new Map<string, ProcessedScale[]>();
    exactMatches.forEach((scale) => {
      const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
      if (!scaleGroups.has(pitchClassKey)) {
        scaleGroups.set(pitchClassKey, []);
      }
      scaleGroups.get(pitchClassKey)!.push(scale);
    });

    // Create suggestions for each group of modes
    scaleGroups.forEach((scales) => {
      if (scales.length > 0) {
        const matchCount = playedPitchClasses.size; // All notes match exactly

        // Create a suggestion showing all modes of this scale group
        const modeNames = scales
          .filter(scale => scale.name) // Only include scales with names
          .map(scale => `${scale.rootNoteName} ${scale.name}`)
          .join(', ');

        if (modeNames) {
          suggestions.push({
            name: `Possible modes: ${modeNames}`,
            matchCount: matchCount,
            pitchClasses: scales[0].pitchClasses,
            confidence: 1.0 // Perfect match
          });
        }
      }
    });

    // If no exact matches, find partial matches using shared service
    if (suggestions.length === 0) {
      const allScales = scaleService.getFilteredScales();
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
            .map(scale => `${scale.rootNoteName} ${scale.name}`)
            .join(', ');

          if (modeNames) {
            const confidence = matchCount / playedPitchClasses.size;
            suggestions.push({
              name: `Partial match (${matchCount}/${playedPitchClasses.size}): ${modeNames}`,
              matchCount: matchCount,
              pitchClasses: scales[0].pitchClasses,
              confidence: confidence
            });
          }
        }
      });
    }

    // Sort by match count and confidence
    suggestions.sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.confidence - a.confidence;
    });

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }, [processedScales]);

  // Callback for chord detection
  useCallback((noteNumbers: number[]) => {
    const detectedChords = findChordMatches(noteNumbers);
    if (detectedChords.length > 0) {
      // Use default values since baseKey and keyMode are now managed by MidiSettingsPanel
      keySuggester.updateChordSuggestions(detectedChords, 'C', 'major');
    }
  }, []);
// Callback for melody mode
  useCallback((pitchClasses: Set<number>) => {
    if (pitchClasses.size > 0) {
      // Always show the melody overlay for immediate feedback
      keySuggester.updateMelodySuggestions(pitchClasses);

      // Also show in unified results if available
      if (onShowUnifiedResults) {
            // Use shared service for suggestions
        const midiSuggestions = scaleService.getMidiScaleSuggestions(pitchClasses);
        const suggestions = midiSuggestions.map(scale => ({
          name: `${scale.rootNoteName} ${scale.name}`,
          matchCount: pitchClasses.size,
          pitchClasses: scale.pitchClasses,
          confidence: 1.0
        }));

        // Create results object for unified results system
        const results = {
          method: 'melody',
          loading: false,
          error: null,
          localAnalysis: {
            suggestions: suggestions,
            playedNotes: Array.from(pitchClasses).map(pc => NOTES[pc]).join(', '),
            totalNotes: pitchClasses.size
          }
        };

        // Show in unified results
        onShowUnifiedResults(results);
      }
    }
  }, [onShowUnifiedResults, generateKeySuggestions]);

  // Wrapper for clearing that also hides popup and clears chord sequence
  useCallback(() => {
    keySuggester.hide();
    keySuggester.clearChordSequence();
  }, []);
  const highlightedCellId = initialHighlightId || midiHighlightedCellId;

  // Effect to scroll to the highlighted cell when it's set via props
  useEffect(() => {
    if (initialHighlightId) {
      const element = document.getElementById(initialHighlightId);
      if (element) {
        // A short timeout can help ensure the element is fully rendered before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }, 100);
      }
    }
  }, [initialHighlightId]);


  // Get processed scales from shared service
  useEffect(() => {
    // Use shared service to get filtered scales
    const scales = scaleService.getFilteredScales({
      playedPitchClasses: detectionEnabled ? playedPitchClasses : undefined,
      showOnlyMatches: detectionEnabled && playedPitchClasses.size > 0
    });
    setProcessedScales(scales);
  }, [scaleService, detectionEnabled, playedPitchClasses]);


  // Effect to find scale match when notes change
  useEffect(() => {
    if (!detectionEnabled) return;
    if (midiMode === 'melody' || midiMode === 'chord') return; // Melody and chord modes have different logic (implemented in Phase 2)

    const pitchClassArray = Array.from(playedPitchClasses).sort();
    const noteNames = playedNotes.map(n => NOTES[n.number % 12]);
    
    // Use shared service for MIDI scale suggestions
    if (playedPitchClasses.size > 0) {
      const suggestions = scaleService.getMidiScaleSuggestions(playedPitchClasses);
      if (suggestions.length > 0) {
        const bestMatch = suggestions[0];
        setMidiHighlightedCellId(bestMatch.id);
        
        // Set highlight in shared service
        scaleService.setHighlight({
          cellId: bestMatch.id,
          reason: 'midi',
          temporary: true,
          duration: 5000
        });
      }
    } else {
      setMidiHighlightedCellId(null);
      scaleService.clearAllHighlights();
    }

    if (playedPitchClasses.size === 0) {
      setMidiHighlightedCellId(null);
      if (showDebugInfo) {
        setDebugInfo(null);
      }
      return;
    }

    const playedCount = playedPitchClasses.size;
    let shouldCheck = false;
    if (midiMode === '7' && playedCount === 7) shouldCheck = true;
    if (midiMode === '5' && (playedCount === 5 || playedCount === 6)) shouldCheck = true;

    const scalesToSearch = processedScales.filter(s => s.pitchClasses.size === playedPitchClasses.size);

    // Find all scales that contain the exact same pitch classes (all possible modes)
    const allMatches = scalesToSearch.filter(scale =>
      setsAreEqual(scale.pitchClasses, playedPitchClasses)
    );

    let selectedMatch = undefined;

    if (shouldCheck) {
      if (allMatches.length > 0) {
        // Prioritize the scale that starts with the first note played
        let preferredMatch = allMatches[0]; // fallback to first match

        if (playedNotes.length > 0) {
          // Get the first note played
          const firstNotePitchClass = playedNotes[0].number % 12;

          // Find a match that starts with this note
          const matchingScale = allMatches.find(scale => scale.rootNote === firstNotePitchClass);

          if (matchingScale) {
            preferredMatch = matchingScale;
          }
        }

        setMidiHighlightedCellId(preferredMatch.id);
        const element = document.getElementById(preferredMatch.id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        selectedMatch = {
          id: preferredMatch.id,
          rootNote: preferredMatch.rootNote,
          name: preferredMatch.name
        };
      } else {
        setMidiHighlightedCellId(null);
      }
    }

    // Update debug info if debugging is enabled
    if (showDebugInfo) {
      const debugMatches = allMatches || [];
      setDebugInfo({
        notesEntered: playedCount || pitchClassArray.length,
        pitchClasses: pitchClassArray,
        noteNames: noteNames,
        detectionMode: `${analysisFocus} (${midiMode})`,
        shouldCheck: shouldCheck,
        scalesToSearch: processedScales.length,
        allMatches: debugMatches.map ? debugMatches.map(match => ({
          id: match.id,
          rootNote: match.rootNote,
          name: match.name,
          pitchClasses: Array.from(match.pitchClasses || []).sort()
        })) : [],
        selectedMatch: selectedMatch,
        timestamp: Date.now()
      });
    }

  }, [playedNotes, playedPitchClasses, midiMode, analysisFocus, processedScales, showDebugInfo, scaleService, detectionEnabled]);


  // Callback to highlight a scale in the tables
  const handleHighlightScale = useCallback((scaleId: string) => {
    setMidiHighlightedCellId(scaleId);
    
    // Update shared service with highlight
    scaleService.setHighlight({
      cellId: scaleId,
      reason: 'navigation',
      temporary: false
    });
    
    const element = document.getElementById(scaleId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [scaleService]);

  // Effect to initialize keySuggester
  useEffect(() => {
    if (!keySuggesterInitialized.current && processedScales.length > 0) {
      keySuggester.init('melody-suggestions-overlay', 'chord-suggestions-overlay', processedScales, handleHighlightScale);
      keySuggesterInitialized.current = true;
    }
  }, [processedScales, handleHighlightScale]);

  return (
    <div className={`scale-finder ${embedded ? 'scale-finder--embedded' : ''}`}>
      {/* Suggestion Overlays */}
      <div id="melody-suggestions-overlay" className="suggestions-overlay melody-suggestions"></div>
      <div id="chord-suggestions-overlay" className="suggestions-overlay chord-suggestions"></div>

      {/* Debug Overlay */}
      {showDebugInfo && debugInfo && (
        <div className="debug-overlay">
          <div className="debug-overlay__content">
            <div className="debug-overlay__header">
              <h3>🐛 Scale Detection Debug Info</h3>
              <span className="debug-overlay__timestamp">
                {new Date(debugInfo.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="debug-overlay__section">
              <h4>Input Analysis</h4>
              <div className="debug-info-grid">
                <div className="debug-info-item">
                  <span className="debug-label">Notes Entered:</span>
                  <span className="debug-value">{debugInfo.notesEntered}</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Detection Mode:</span>
                  <span className="debug-value">{debugInfo.detectionMode}-note scale</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Should Check:</span>
                  <span className={`debug-value ${debugInfo.shouldCheck ? 'debug-value--success' : 'debug-value--warning'}`}>
                    {debugInfo.shouldCheck ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="debug-info-item debug-info-item--full">
                <span className="debug-label">Note Names:</span>
                <span className="debug-value debug-value--mono">[{debugInfo.noteNames.join(', ')}]</span>
              </div>

              <div className="debug-info-item debug-info-item--full">
                <span className="debug-label">Pitch Classes:</span>
                <span className="debug-value debug-value--mono">[{debugInfo.pitchClasses.join(', ')}]</span>
              </div>
            </div>

            <div className="debug-overlay__section">
              <h4>Scale Matching</h4>
              <div className="debug-info-grid">
                <div className="debug-info-item">
                  <span className="debug-label">Scales to Search:</span>
                  <span className="debug-value">{debugInfo.scalesToSearch}</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Matches Found:</span>
                  <span className={`debug-value ${debugInfo.allMatches.length > 0 ? 'debug-value--success' : 'debug-value--error'}`}>
                    {debugInfo.allMatches.length}
                  </span>
                </div>
              </div>

              {debugInfo.selectedMatch && (
                <div className="debug-info-item debug-info-item--full">
                  <span className="debug-label">Selected Match:</span>
                  <span className="debug-value debug-value--highlight">
                    {debugInfo.selectedMatch.name || 'Unknown'} (Root: {NOTES[debugInfo.selectedMatch.rootNote]}, ID: {debugInfo.selectedMatch.id})
                  </span>
                </div>
              )}

              {debugInfo.allMatches.length > 0 && (
                <div className="debug-matches">
                  <span className="debug-label">All Matches:</span>
                  <div className="debug-matches-list">
                    {debugInfo.allMatches.slice(0, 5).map((match, _index) => (
                      <div key={match.id} className="debug-match-item">
                        <span className="debug-match-name">{match.name || 'Unknown'}</span>
                        <span className="debug-match-root">Root: {NOTES[match.rootNote]}</span>
                        <span className="debug-match-id">ID: {match.id}</span>
                      </div>
                    ))}
                    {debugInfo.allMatches.length > 5 && (
                      <div className="debug-match-item debug-match-item--more">
                        ... and {debugInfo.allMatches.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="scale-tables-container">
        {allScaleData.map(scaleGroup => (
            <div key={scaleGroup.tableId} className="card bg-slate-800/60 p-4">
                <h2 className="section-title section-title--cyan">{scaleGroup.name}</h2>
                <div className="table-container">
                    <ScaleTable 
                        scaleData={scaleGroup} 
                        highlightedCellId={highlightedCellId}
                        hoveredCell={hoveredCell}
                        setHoveredCell={setHoveredCell}
                        hoveredNote={hoveredNote}
                        setHoveredNote={setHoveredNote}
                    />
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};

export default ScaleFinder;
