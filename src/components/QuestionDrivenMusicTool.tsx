import React, {useCallback, useState} from 'react';
import NavigationTabs, {TabType} from './NavigationTabs';
import ModeIdentificationTab from './ModeIdentificationTab';
import ModeDiscoveryTab from './ModeDiscoveryTab';
import HarmonyTab from './HarmonyTab';
import ReferenceTab from './ReferenceTab';
import ChordAnalyzer from './ChordAnalyzer';
import {analyzeMusic} from '../services/geminiService';
import {analyzeChordSequenceForKeyGuessing} from '../services/keySuggester';
import {allScaleData, NOTES, PARENT_KEY_INDICES} from '../constants/scales';

interface QuestionDrivenMusicToolProps {
  showDebugInfo: boolean;
}

const QuestionDrivenMusicTool: React.FC<QuestionDrivenMusicToolProps> = ({ showDebugInfo }) => {
  const [activeTab, setActiveTab] = useState<TabType>('identify');
  const [highlightIdForReference, setHighlightIdForReference] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

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
    // Clear results when switching tabs unless going to reference
    if (tab !== 'reference') {
      setShowResults(false);
      setAnalysisResults(null);
    }
  }, []);

  const handleAnalysisRequest = useCallback(async (method: string, data: any) => {
    console.log('Analysis request:', method, data);
    setShowResults(true);
    setAnalysisResults({ method, data, loading: true, timestamp: Date.now() });

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

      setAnalysisResults(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResults({
        method,
        data,
        error: error instanceof Error ? error.message : 'Analysis failed',
        timestamp: Date.now()
      });
    }
  }, []);

  const handleDiscoveryRequest = useCallback((method: string, data: any) => {
    console.log('Discovery request:', method, data);
    setAnalysisResults({ method, data, timestamp: Date.now() });
    setShowResults(true);
  }, []);

  const handleHarmonyRequest = useCallback((method: string, data: any) => {
    console.log('Harmony request:', method, data);
    setAnalysisResults({ method, data, timestamp: Date.now() });
    setShowResults(true);
  }, []);

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
            const matchingScale = detectedScales.find(scale => {
              const normalizedScaleRoot = scale.root.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
              // Handle compound note names (e.g., "C♯/D♭")
              const rootParts = normalizedScaleRoot.split('/');
              return rootParts.some(part => part === normalizedFirstNote);
            });

            if (matchingScale) {
              preferredScale = matchingScale;
            }
          }
        }

        finalHighlightId = generateHighlightId(preferredScale.scale, preferredScale.mode, preferredScale.root);
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
          />
        );

      case 'discover':
        return (
          <ModeDiscoveryTab 
            onDiscoveryRequest={handleDiscoveryRequest}
          />
        );

      case 'harmony':
        return (
          <HarmonyTab 
            onHarmonyRequest={handleHarmonyRequest}
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

  const renderResults = () => {
    if (!showResults || !analysisResults) {
      return null;
    }

    const { method, loading, error, geminiAnalysis, localAnalysis } = analysisResults;

    return (
      <div className="results-panel">
        <div className="results-panel__header">
          <h3 className="results-panel__title">Mode Identification Results</h3>
          <button 
            onClick={() => setShowResults(false)}
            className="results-panel__close"
            title="Close results"
          >
            ×
          </button>
        </div>

        <div className="results-panel__content">
          {loading && (
            <div className="loading-state">
              <p>🎵 Analyzing your {method}...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <h4>Analysis Error</h4>
              <p>{error}</p>
            </div>
          )}

          {geminiAnalysis && !loading && !error && (
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
                  {geminiAnalysis.result.alternates.map((alt, index) => (
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
                  {geminiAnalysis.result.songExamples.map((group, index) => (
                    <div key={index} className="song-group">
                      <h6>{group.mode}</h6>
                      <ul>
                        {group.songs && Array.isArray(group.songs) && group.songs.map((song, songIndex) => (
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

      <div className="tool-content">
        <div className="main-panel">
          {renderTabContent()}
        </div>

        {showResults && (
          <div className="results-sidebar">
            {renderResults()}
          </div>
        )}
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
