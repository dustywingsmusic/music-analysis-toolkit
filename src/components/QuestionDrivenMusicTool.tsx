import React, {useCallback, useState, useEffect} from 'react';
import NavigationTabs, {TabType} from './NavigationTabs';
import ModeIdentificationTab from './ModeIdentificationTab';
import ModeDiscoveryTab from './ModeDiscoveryTab';
import HarmonyTab from './HarmonyTab';
import ReferenceTab from './ReferenceTab';
import ChordAnalyzer from './ChordAnalyzer';
import {analyzeMusic} from '../services/geminiService';
import {allScaleData, NOTES, PARENT_KEY_INDICES} from '../constants/scales';

interface QuestionDrivenMusicToolProps {
  showDebugInfo: boolean;
}

interface ResultsHistoryEntry {
  id: string;
  timestamp: number;
  tab: TabType;
  method: string;
  summary: string;
  data: any;
  results: any;
}

interface DisplayPosition {
  mode: 'sidebar' | 'floating' | 'docked';
  position?: { x: number; y: number };
  dockSide?: 'left' | 'right' | 'bottom';
  width?: number;
  height?: number;
}

interface UnifiedResultsState {
  isVisible: boolean;
  currentResults: any;
  history: ResultsHistoryEntry[];
  displayPosition: DisplayPosition;
  selectedHistoryId: string | null;
  showHistory: boolean;
}

const QuestionDrivenMusicTool: React.FC<QuestionDrivenMusicToolProps> = ({ showDebugInfo }) => {
  const [activeTab, setActiveTab] = useState<TabType>('identify');
  const [highlightIdForReference, setHighlightIdForReference] = useState<string | null>(null);

  // Unified Results Display System State
  const [unifiedResults, setUnifiedResults] = useState<UnifiedResultsState>({
    isVisible: false,
    currentResults: null,
    history: [],
    displayPosition: {
      mode: 'sidebar',
      dockSide: 'right',
      width: 400,
      height: 600
    },
    selectedHistoryId: null,
    showHistory: false
  });

  // Legacy compatibility - keep for backward compatibility during transition
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Local Storage Keys
  const STORAGE_KEYS = {
    RESULTS_HISTORY: 'music-tool-results-history',
    DISPLAY_POSITION: 'music-tool-display-position'
  };

  // Load data from local storage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.RESULTS_HISTORY);
      const savedPosition = localStorage.getItem(STORAGE_KEYS.DISPLAY_POSITION);

      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setUnifiedResults(prev => ({ ...prev, history }));
      }

      if (savedPosition) {
        const displayPosition = JSON.parse(savedPosition);
        setUnifiedResults(prev => ({ ...prev, displayPosition }));
      }
    } catch (error) {
      console.warn('Failed to load results data from local storage:', error);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESULTS_HISTORY, JSON.stringify(unifiedResults.history));
    } catch (error) {
      console.warn('Failed to save results history to local storage:', error);
    }
  }, [unifiedResults.history]);

  // Save display position to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISPLAY_POSITION, JSON.stringify(unifiedResults.displayPosition));
    } catch (error) {
      console.warn('Failed to save display position to local storage:', error);
    }
  }, [unifiedResults.displayPosition]);

  // Helper function to generate a summary from analysis results
  const generateResultSummary = (method: string, data: any, results: any): string => {
    switch (method) {
      case 'melody':
        if (results?.geminiAnalysis?.result?.analysis?.mode) {
          return `Melody → ${results.geminiAnalysis.result.analysis.mode}`;
        }
        return `Melody analysis: ${data.notes?.substring(0, 20) || 'Unknown'}...`;

      case 'scale':
        if (results?.geminiAnalysis?.result?.analysis?.mode) {
          return `Scale → ${results.geminiAnalysis.result.analysis.mode}`;
        }
        return `Scale analysis: ${data.notes?.substring(0, 20) || 'Unknown'}...`;

      case 'progression':
        if (results?.geminiAnalysis?.result?.analysis?.mode) {
          return `Progression → ${results.geminiAnalysis.result.analysis.mode}`;
        }
        return `Chord progression: ${data.chords?.substring(0, 20) || 'Unknown'}...`;

      default:
        return `${method} analysis`;
    }
  };

  // Helper function to add results to history
  const addToHistory = (method: string, data: any, results: any, tab: TabType = activeTab) => {
    const historyEntry: ResultsHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      tab,
      method,
      summary: generateResultSummary(method, data, results),
      data,
      results
    };

    setUnifiedResults(prev => ({
      ...prev,
      history: [historyEntry, ...prev.history.slice(0, 49)] // Keep last 50 entries
    }));

    return historyEntry.id;
  };

  // Helper function to show results in unified display
  const showUnifiedResults = (results: any, historyId?: string) => {
    setUnifiedResults(prev => ({
      ...prev,
      isVisible: true,
      currentResults: results,
      selectedHistoryId: historyId || null
    }));

    // Update legacy state for backward compatibility
    setAnalysisResults(results);
  };

  // Helper function to hide unified results
  const hideUnifiedResults = () => {
    setUnifiedResults(prev => ({
      ...prev,
      isVisible: false,
      selectedHistoryId: null
    }));
  };

  // Helper function to restore results from history
  const restoreFromHistory = (historyId: string) => {
    const historyEntry = unifiedResults.history.find(entry => entry.id === historyId);
    if (historyEntry) {
      showUnifiedResults(historyEntry.results, historyId);
      // Optionally switch to the tab where the analysis was performed
      if (historyEntry.tab !== activeTab) {
        setActiveTab(historyEntry.tab);
      }
    }
  };

  // Helper function to update display position
  const updateDisplayPosition = (newPosition: Partial<DisplayPosition>) => {
    setUnifiedResults(prev => ({
      ...prev,
      displayPosition: { ...prev.displayPosition, ...newPosition }
    }));
  };

  // Helper function to parse note names into pitch classes
  const parseNotesToPitchClasses = (noteString: string): Set<number> => {
    const noteNames = noteString.trim().split(/\s+/).filter(note => note.length > 0);
    const pitchClasses = new Set<number>();

    noteNames.forEach(noteName => {
      const cleanNote = noteName.trim();
      // Convert regular b/# to Unicode ♭/♯ for matching, but preserve case for note names
      const normalizedNote = cleanNote.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();

      const noteIndex = NOTES.findIndex(note => {
        const normalizedNoteEntry = note.toUpperCase();
        // Split compound note names and check for exact matches
        const noteParts = normalizedNoteEntry.split('/');
        return noteParts.some(part => part === normalizedNote);
      });

      if (noteIndex !== -1) {
        pitchClasses.add(noteIndex);
      }
    });

    return pitchClasses;
  };

  // Helper function to parse and preserve original melody notes (for melody analysis)
  const parseOriginalMelodyNotes = (noteString: string): string[] => {
    return noteString.trim().split(/\s+/).filter(note => note.length > 0);
  };

  // Helper function to clean up scale notes (for scale analysis)
  const parseAndCleanScaleNotes = (noteString: string): string[] => {
    const pitchClasses = parseNotesToPitchClasses(noteString);
    return Array.from(pitchClasses).map(pc => NOTES[pc]);
  };

  // Helper function to extract chord symbols from progression
  const parseChordProgression = (progressionString: string): string[] => {
    return progressionString.trim().split(/\s+/).filter(chord => chord.length > 0);
  };

  // Helper function to detect scales/modes using local scales.ts data
  const detectLocalScales = (pitchClasses: Set<number>) => {
    const pitchClassArray = Array.from(pitchClasses).sort();
    const matches = [];

    // Check each scale in allScaleData
    for (const scaleData of allScaleData) {
      // Check each mode of the scale
      for (let modeIndex = 0; modeIndex < scaleData.modeIntervals.length; modeIndex++) {
        const modeIntervals = scaleData.modeIntervals[modeIndex];

        // Try each possible root note
        for (let root = 0; root < 12; root++) {
          const modePitchClasses = modeIntervals.map(interval => (root + interval) % 12).sort();

          // Check if this mode matches our input pitch classes
          if (JSON.stringify(modePitchClasses) === JSON.stringify(pitchClassArray)) {
            const rootNote = NOTES[root];
            const modeName = scaleData.commonNames ? scaleData.commonNames[modeIndex] : `Mode ${modeIndex + 1}`;
            const scaleName = scaleData.name;

            matches.push({
              root: rootNote,
              mode: modeName,
              scale: scaleName,
              fullName: `${rootNote} ${modeName}`,
              pitchClasses: modePitchClasses,
              confidence: 1.0 // Perfect match
            });
          }
        }
      }
    }

    return matches;
  };

  // Helper function to suggest a tonic from notes
  const suggestTonic = (pitchClasses: Set<number>): string => {
    if (pitchClasses.size === 0) return 'C';

    // Try to detect scales first and use the root of the best match
    const scaleMatches = detectLocalScales(pitchClasses);
    if (scaleMatches.length > 0) {
      // Return the root of the first match (they're all perfect matches)
      return scaleMatches[0].root;
    }

    // Fallback to the first note as a default tonic
    const firstNote = Array.from(pitchClasses)[0];
    return NOTES[firstNote];
  };

  // Helper function to generate highlight ID for scale tables
  const generateHighlightId = (scaleName: string, modeName: string, rootNote: string): string | null => {
    // Map scale names to table IDs
    const scaleToTableId: { [key: string]: string } = {
      'Major Scale': 'major-scale-modes',
      'Melodic Minor': 'melodic-minor-modes',
      'Harmonic Minor': 'harmonic-minor-modes',
      'Harmonic Major': 'harmonic-major-modes',
      'Double Harmonic Major': 'double-harmonic-major-modes',
      'Major Pentatonic': 'major-pentatonic-modes',
      'Blues Scale': 'blues-scale-modes'
    };

    // Map mode names to indices for Major Scale
    const majorScaleModeToIndex: { [key: string]: number } = {
      'Ionian': 0,
      'Dorian': 1,
      'Phrygian': 2,
      'Lydian': 3,
      'Mixolydian': 4,
      'Aeolian': 5,
      'Locrian': 6
    };

    // Convert root note to pitch class
    const rootPitchClass = NOTES.findIndex(note => {
      const normalizedNote = rootNote.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
      const normalizedNoteEntry = note.toUpperCase();
      const noteParts = normalizedNoteEntry.split('/');
      return noteParts.some(part => part === normalizedNote);
    });

    if (rootPitchClass === -1) return null;

    // Find the key row index for this root note
    const keyRowIndex = PARENT_KEY_INDICES.indexOf(rootPitchClass);
    if (keyRowIndex === -1) return null;

    const tableId = scaleToTableId[scaleName];
    const modeIndex = majorScaleModeToIndex[modeName];

    if (tableId !== undefined && modeIndex !== undefined) {
      return `${tableId}-${keyRowIndex}-${modeIndex}`;
    }

    return null;
  };

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // With unified results system, results persist across tabs
    // Only clear results if explicitly requested or going to reference with no results
    if (tab === 'reference' && !unifiedResults.isVisible) {
      // Don't change results visibility when going to reference
    }
    // Results remain visible and accessible across all tabs
  }, [unifiedResults.isVisible]);

  const handleAnalysisRequest = useCallback(async (method: string, data: any) => {
    console.log('Analysis request:', method, data);

    // Show loading state in unified results
    const loadingResult = { method, data, loading: true, timestamp: Date.now() };
    showUnifiedResults(loadingResult);

    try {
      let analysisResult;

      switch (method) {
        case 'melody': {
          // For melody analysis, preserve original note sequence and spellings
          const originalNotes = parseOriginalMelodyNotes(data.notes || '');
          if (originalNotes.length === 0) {
            throw new Error('No valid notes found in input');
          }

          // Still need pitch classes for tonic suggestion
          const pitchClasses = parseNotesToPitchClasses(data.notes || '');
          const tonic = suggestTonic(pitchClasses);

          // Detect scales/modes using local scales.ts data (same as scale analysis)
          const detectedScales = detectLocalScales(pitchClasses);

          // Use Gemini AI for detailed analysis with original notes
          const geminiResult = await analyzeMusic(tonic, { notes: originalNotes });

          analysisResult = {
            method,
            data,
            geminiAnalysis: geminiResult,
            localAnalysis: {
              pitchClasses: Array.from(pitchClasses),
              suggestedTonic: tonic,
              inputNotes: originalNotes, // Preserve original sequence
              originalInput: data.notes, // Keep the raw input for reference
              detectedScales: detectedScales // Add local scale detection results
            },
            timestamp: Date.now()
          };
          break;
        }

        case 'scale': {
          // For scale analysis, clean up notes (remove duplicates, standardize spellings)
          const cleanedNotes = parseAndCleanScaleNotes(data.notes || '');
          if (cleanedNotes.length === 0) {
            throw new Error('No valid notes found in input');
          }

          const pitchClasses = parseNotesToPitchClasses(data.notes || '');
          const tonic = suggestTonic(pitchClasses);

          // Detect scales/modes using local scales.ts data
          const detectedScales = detectLocalScales(pitchClasses);

          // Use Gemini AI for detailed analysis with cleaned notes
          const geminiResult = await analyzeMusic(tonic, { notes: cleanedNotes });

          analysisResult = {
            method,
            data,
            geminiAnalysis: geminiResult,
            localAnalysis: {
              pitchClasses: Array.from(pitchClasses),
              suggestedTonic: tonic,
              inputNotes: cleanedNotes, // Use cleaned notes
              originalInput: data.notes, // Keep the raw input for reference
              detectedScales: detectedScales // Add local scale detection results
            },
            timestamp: Date.now()
          };
          break;
        }

        case 'progression': {
          const chords = parseChordProgression(data.chords || '');
          if (chords.length === 0) {
            throw new Error('No valid chords found in progression');
          }

          // For chord progressions, we'll analyze the first chord for tonic suggestion
          const firstChord = chords[0];
          const tonic = firstChord.replace(/[^A-G#b]/g, ''); // Extract root note

          // Use Gemini AI for detailed analysis
          const geminiResult = await analyzeMusic(tonic, { chord: chords.join(' ') });

          analysisResult = {
            method,
            data,
            geminiAnalysis: geminiResult,
            localAnalysis: {
              chords,
              suggestedTonic: tonic,
              progressionLength: chords.length
            },
            timestamp: Date.now()
          };
          break;
        }

        case 'audio':
          throw new Error('Audio analysis is not yet implemented');

        default:
          throw new Error(`Unknown analysis method: ${method}`);
      }

      // Add to history and show results
      const historyId = addToHistory(method, data, analysisResult);
      showUnifiedResults(analysisResult, historyId);

    } catch (error) {
      console.error('Analysis failed:', error);
      const errorResult = {
        method,
        data,
        error: error instanceof Error ? error.message : 'Analysis failed',
        timestamp: Date.now()
      };

      // Add error to history and show results
      const historyId = addToHistory(method, data, errorResult);
      showUnifiedResults(errorResult, historyId);
    }
  }, [addToHistory, showUnifiedResults]);

  const handleDiscoveryRequest = useCallback((method: string, data: any) => {
    console.log('Discovery request:', method, data);
    const discoveryResult = { 
      method, 
      data, 
      timestamp: Date.now(),
      placeholder: true, // Mark as placeholder until backend integration
      message: 'Mode Discovery backend integration coming soon'
    };

    // Add to history and show results
    const historyId = addToHistory(method, data, discoveryResult, 'discover');
    showUnifiedResults(discoveryResult, historyId);
  }, [addToHistory, showUnifiedResults]);

  const handleHarmonyRequest = useCallback((method: string, data: any) => {
    console.log('Harmony request:', method, data);
    const harmonyResult = { 
      method, 
      data, 
      timestamp: Date.now(),
      placeholder: true, // Mark as placeholder until backend integration
      message: 'Harmony analysis backend integration coming soon'
    };

    // Add to history and show results
    const historyId = addToHistory(method, data, harmonyResult, 'harmony');
    showUnifiedResults(harmonyResult, historyId);
  }, [addToHistory, showUnifiedResults]);

  const handleSwitchToReference = useCallback((highlightId?: string) => {
    let finalHighlightId = highlightId;

    // If no highlightId provided, try to generate one from AI analysis results first
    if (!finalHighlightId && analysisResults && analysisResults.geminiAnalysis && analysisResults.geminiAnalysis.result && analysisResults.geminiAnalysis.result.analysis) {
      const analysis = analysisResults.geminiAnalysis.result.analysis;

      // Use AI-provided fields like the working version did
      if (analysis.parentScaleRootNote && analysis.tableId !== undefined && analysis.modeIndex !== undefined) {
        const rootPitchClass = NOTES.findIndex(note => {
          const normalizedNote = analysis.parentScaleRootNote.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
          const normalizedNoteEntry = note.toUpperCase();
          const noteParts = normalizedNoteEntry.split('/');
          return noteParts.some(part => part === normalizedNote);
        });

        if (rootPitchClass !== -1) {
          const keyRowIndex = PARENT_KEY_INDICES.indexOf(rootPitchClass);
          if (keyRowIndex !== -1) {
            finalHighlightId = `${analysis.tableId}-${keyRowIndex}-${analysis.modeIndex}`;
          }
        }
      }
    }

    // Fallback to local scale detection if AI fields are not available
    if (!finalHighlightId && analysisResults && analysisResults.localAnalysis && analysisResults.localAnalysis.detectedScales) {
      const detectedScales = analysisResults.localAnalysis.detectedScales;
      if (detectedScales.length > 0) {
        // Try to find the scale that starts with the first note in the input
        let preferredScale = detectedScales[0]; // fallback to first scale

        if (analysisResults.localAnalysis.originalInput) {
          // Parse the first note from the original input
          const firstInputNote = analysisResults.localAnalysis.originalInput.trim().split(/\s+/)[0];
          if (firstInputNote) {
            // Normalize the first note for comparison
            const normalizedFirstNote = firstInputNote.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();

            // Find a detected scale that starts with this note
            const matchingScale = detectedScales.find((scale: any) => {
              const normalizedScaleRoot = scale.root.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
              // Handle compound note names (e.g., "C♯/D♭")
              const rootParts = normalizedScaleRoot.split('/');
              return rootParts.some((part: string) => part === normalizedFirstNote);
            });

            if (matchingScale) {
              preferredScale = matchingScale;
            }
          }
        }

        finalHighlightId = generateHighlightId(preferredScale.scale, preferredScale.mode, preferredScale.root) || undefined;
      }
    }

    if (finalHighlightId) {
      setHighlightIdForReference(finalHighlightId);
    }
    setActiveTab('reference');
  }, [analysisResults]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identify':
        return (
          <ModeIdentificationTab 
            onAnalysisRequest={handleAnalysisRequest}
            hasResults={unifiedResults.isVisible}
          />
        );

      case 'discover':
        return (
          <ModeDiscoveryTab 
            onDiscoveryRequest={handleDiscoveryRequest}
            hasResults={unifiedResults.isVisible}
          />
        );

      case 'harmony':
        return (
          <HarmonyTab 
            onHarmonyRequest={handleHarmonyRequest}
            hasResults={unifiedResults.isVisible}
          />
        );

      case 'reference':
        return (
          <ReferenceTab 
            highlightId={highlightIdForReference}
            showDebugInfo={showDebugInfo}
          />
        );

      default:
        return null;
    }
  };

  // Enhanced Unified Results Display System
  const renderUnifiedResults = () => {
    if (!unifiedResults.isVisible) {
      return null;
    }

    const currentResults = unifiedResults.currentResults;
    if (!currentResults) {
      return null;
    }

    const { method, loading, error, geminiAnalysis, localAnalysis, placeholder, message } = currentResults;

    return (
      <div className={`unified-results-panel unified-results-panel--${unifiedResults.displayPosition.mode}`}>
        {/* Enhanced Header with Controls */}
        <div className="unified-results-panel__header">
          <div className="unified-results-panel__title-section">
            <h3 className="unified-results-panel__title">
              {placeholder ? `${method.charAt(0).toUpperCase() + method.slice(1)} Results` : 'Analysis Results'}
            </h3>
            <div className="unified-results-panel__meta">
              {unifiedResults.history.length > 0 && (
                <span className="unified-results-panel__history-count">
                  {unifiedResults.history.length} result{unifiedResults.history.length !== 1 ? 's' : ''} in history
                </span>
              )}
            </div>
          </div>

          <div className="unified-results-panel__controls">
            {/* History Browser Toggle */}
            <button 
              onClick={() => setUnifiedResults(prev => ({ ...prev, showHistory: !prev.showHistory }))}
              className="unified-results-panel__control-btn"
              title="View results history"
              disabled={unifiedResults.history.length === 0}
            >
              📋
            </button>

            {/* Display Position Controls */}
            <div className="unified-results-panel__position-controls">
              <button 
                onClick={() => updateDisplayPosition({ mode: 'sidebar', dockSide: 'right' })}
                className={`unified-results-panel__control-btn ${unifiedResults.displayPosition.mode === 'sidebar' ? 'active' : ''}`}
                title="Dock to sidebar"
              >
                ⫸
              </button>
              <button 
                onClick={() => updateDisplayPosition({ mode: 'floating' })}
                className={`unified-results-panel__control-btn ${unifiedResults.displayPosition.mode === 'floating' ? 'active' : ''}`}
                title="Floating window"
              >
                ⧉
              </button>
            </div>

            {/* Close Button */}
            <button 
              onClick={hideUnifiedResults}
              className="unified-results-panel__close"
              title="Close results"
            >
              ×
            </button>
          </div>
        </div>

        {/* History Browser */}
        {unifiedResults.showHistory && unifiedResults.history.length > 0 && (
          <div className="unified-results-panel__history">
            <h4>Results History</h4>
            <div className="unified-results-panel__history-list">
              {unifiedResults.history.slice(0, 10).map((entry) => (
                <div 
                  key={entry.id} 
                  className={`unified-results-panel__history-item ${entry.id === unifiedResults.selectedHistoryId ? 'active' : ''}`}
                  onClick={() => restoreFromHistory(entry.id)}
                >
                  <div className="unified-results-panel__history-summary">{entry.summary}</div>
                  <div className="unified-results-panel__history-meta">
                    <span className="unified-results-panel__history-tab">{entry.tab}</span>
                    <span className="unified-results-panel__history-time">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="unified-results-panel__content">
          {loading && (
            <div className="loading-state">
              <p>🎵 Analyzing your {method}...</p>
            </div>
          )}

          {placeholder && message && (
            <div className="placeholder-state">
              <h4>Coming Soon</h4>
              <p>{message}</p>
              <p className="placeholder-note">This feature is planned for the next development phase.</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <h4>Analysis Error</h4>
              <p>{error}</p>
            </div>
          )}

          {geminiAnalysis && !loading && !error && !placeholder && (
            <>
              <div className="primary-result">
                <h4>Primary Analysis</h4>
                {geminiAnalysis.result?.analysis && (
                  <div className="mode-analysis">
                    {/* Extract tonic and mode from the full mode name */}
                    {(() => {
                      const fullMode = geminiAnalysis.result.analysis.mode;
                      const parts = fullMode.split(' ');

                      // Check if we have both tonic and mode, or just mode
                      let tonic, mode;
                      if (parts.length > 1) {
                        // Format: "F Ionian" - first part is tonic, rest is mode
                        tonic = parts[0];
                        mode = parts.slice(1).join(' ');
                      } else {
                        // Format: "Ionian" - only mode provided, need to get tonic from elsewhere
                        mode = parts[0];
                        // Try to get tonic from parentScaleRootNote or fallback to analysis context
                        tonic = geminiAnalysis.result.analysis.parentScaleRootNote || 
                               (localAnalysis && localAnalysis.suggestedTonic) || 'F';
                      }

                      return (
                        <>
                          <p><strong>Mode:</strong> {tonic} {mode}</p>
                        </>
                      );
                    })()}
                    <p><strong>Scale:</strong> {geminiAnalysis.result.analysis.notes ? geminiAnalysis.result.analysis.notes.join(' ') : geminiAnalysis.result.analysis.scale}</p>
                    <p><strong>Parent Key:</strong> {geminiAnalysis.result.analysis.key}</p>

                    {geminiAnalysis.result.analysis.explanation && (
                      <div className="explanation-section">
                        <h5>Explanation</h5>
                        <p>{geminiAnalysis.result.analysis.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {geminiAnalysis.result?.error && (
                  <div className="ai-error">
                    <p>AI Analysis: {geminiAnalysis.result.error}</p>
                  </div>
                )}
              </div>

              {geminiAnalysis.result?.alternates && geminiAnalysis.result.alternates.length > 0 && (
                <div className="alternate-results">
                  <h5>Alternative Analyses</h5>
                  {geminiAnalysis.result.alternates.map((alt: any, index: number) => (
                    <div key={index} className="alternate-mode">
                      {(() => {
                        const fullMode = alt.mode;
                        const parts = fullMode.split(' ');

                        // Check if we have both tonic and mode, or just mode
                        let tonic, mode;
                        if (parts.length > 1) {
                          // Format: "F Ionian" - first part is tonic, rest is mode
                          tonic = parts[0];
                          mode = parts.slice(1).join(' ');
                        } else {
                          // Format: "Ionian" - only mode provided, need to get tonic from elsewhere
                          mode = parts[0];
                          // Try to get tonic from parentScaleRootNote or fallback to analysis context
                          tonic = alt.parentScaleRootNote || 
                                 (localAnalysis && localAnalysis.suggestedTonic) || 'F';
                        }

                        return (
                          <>
                            <h6>Alternative {index + 1}</h6>
                            <p><strong>Mode:</strong> {tonic} {mode}</p>
                          </>
                        );
                      })()}
                      <p><strong>Scale:</strong> {alt.notes ? alt.notes.join(' ') : 'Scale notes not available'}</p>
                      <p><strong>Parent Key:</strong> {alt.key}</p>
                      {alt.explanation && (
                        <div className="explanation-section">
                          <h6>Explanation</h6>
                          <p>{alt.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {geminiAnalysis.result?.songExamples && Array.isArray(geminiAnalysis.result.songExamples) && (
                <div className="song-examples">
                  <h5>Song Examples</h5>
                  {geminiAnalysis.result.songExamples.map((group: any, index: number) => (
                    <div key={index} className="song-group">
                      <h6>{group.mode}</h6>
                      <ul>
                        {group.songs && Array.isArray(group.songs) && group.songs.map((song: any, songIndex: number) => (
                          <li key={songIndex}>
                            <strong>{song.title}</strong> by {song.artist}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !placeholder && (
            <div className="secondary-results">
              <div className="related-info">
                <button 
                  onClick={() => handleSwitchToReference()}
                  className="btn btn--secondary"
                >
                  View in Scale Tables
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="question-driven-music-tool">
      <NavigationTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Always-visible Results Access Button */}
      {!unifiedResults.isVisible && unifiedResults.history.length > 0 && (
        <div className="unified-results-access">
          <button 
            onClick={() => {
              const lastResult = unifiedResults.history[0];
              if (lastResult) {
                restoreFromHistory(lastResult.id);
              }
            }}
            className="unified-results-access__btn"
            title={`View latest result: ${unifiedResults.history[0]?.summary || 'Recent analysis'}`}
          >
            📊 Results ({unifiedResults.history.length})
          </button>
        </div>
      )}

      <div className="tool-content">
        <div className="main-panel">
          <div className={`tab-content-wrapper ${unifiedResults.isVisible ? 'tab-with-results' : ''}`}>
            {renderTabContent()}

            {/* Unified Results Display - positioned next to input section when visible */}
            {unifiedResults.isVisible && (
              <div className={`unified-results-container unified-results-container--${unifiedResults.displayPosition.mode}`}>
                {renderUnifiedResults()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legacy chord analyzer for backward compatibility - hidden by default */}
      {showDebugInfo && (
        <div className="debug-panel">
          <h3>Debug: Legacy Chord Analyzer</h3>
          <ChordAnalyzer 
            onSwitchToFinder={handleSwitchToReference}
            showDebugInfo={showDebugInfo}
            compact={true}
            onAnalysisStateChange={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionDrivenMusicTool;
