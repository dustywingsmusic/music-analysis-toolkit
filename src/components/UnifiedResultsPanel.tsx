/**
 * UnifiedResultsPanel - A comprehensive results display system for music analysis
 *
 * This component handles the display and management of analysis results from various
 * music theory tools. It provides:
 * - Unified display of analysis results from different tabs
 * - Results history management with persistence
 * - Multiple display modes (sidebar, docked)
 * - User input tracking and "Return to Input" functionality
 * - Storage management using cookies with localStorage fallback
 */

import React from 'react';
import {TabType} from './NavigationTabs';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import ScaleGrid from './reference/ScaleGrid';
import {ModeFromRoot} from '../services/scaleDataService';

export interface ResultsHistoryEntry {
  id: string;
  timestamp: number;
  tab: TabType;
  method: string;
  summary: string;
  data: any;
  results: any;
  userInputs: {
    method: string;
    inputData: any;
    rawInputs?: {
      [key: string]: any;
    };
  };
}

export interface DisplayPosition {
  mode: 'sidebar' | 'docked';
  position?: { x: number; y: number };
  dockSide?: 'left' | 'right' | 'bottom';
  width?: number;
  height?: number;
}

export interface UnifiedResultsState {
  isVisible: boolean;
  currentResults: any;
  history: ResultsHistoryEntry[];
  displayPosition: DisplayPosition;
  selectedHistoryId: string | null;
  showHistory: boolean;
  isAnalysisDismissed: boolean;
  autoShowResults: boolean;
}

interface UnifiedResultsPanelProps {
  unifiedResults: UnifiedResultsState;
  setUnifiedResults: React.Dispatch<React.SetStateAction<UnifiedResultsState>>;
  onSwitchToReference: (highlightId?: string) => void;
  onSwitchToReferenceWithHighlight: (mode: string, tonic: string) => void;
  onReturnToInput: (userInputs: any) => void;
  onRestoreFromHistory: (historyId: string) => void;
  onDismissAnalysisPanel: () => void;
  onUpdateDisplayPosition: (newPosition: Partial<DisplayPosition>) => void;
  onModeAnalysisRequest: (mode: ModeFromRoot) => void;
}

const UnifiedResultsPanel: React.FC<UnifiedResultsPanelProps> = ({
  unifiedResults,
  setUnifiedResults,
  onSwitchToReference,
  onSwitchToReferenceWithHighlight,
  onReturnToInput,
  onRestoreFromHistory,
  onDismissAnalysisPanel,
  onUpdateDisplayPosition,
  onModeAnalysisRequest
}) => {

  // Helper function to check if a string is a valid note name
  const isValidNoteName = (str: string): boolean => {
    // Valid note names: A, B, C, D, E, F, G with optional sharps (#) or flats (b/♭)
    const notePattern = /^[A-G][#b♭]?$/;
    return notePattern.test(str);
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

    const { method, loading, error, geminiAnalysis, localAnalysis, placeholder, message, discoveryAnalysis, harmonyAnalysis } = currentResults;

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
                <Badge variant="secondary" className="unified-results-panel__history-count">
                  {unifiedResults.history.length} result{unifiedResults.history.length !== 1 ? 's' : ''} in history
                </Badge>
              )}
            </div>
          </div>

          <div className="unified-results-panel__controls">
            {/* History Browser Toggle */}
            <Button 
              onClick={() => setUnifiedResults(prev => ({ ...prev, showHistory: !prev.showHistory }))}
              variant="ghost"
              size="sm"
              className="unified-results-panel__control-btn"
              title="View results history"
              disabled={unifiedResults.history.length === 0}
            >
              📋
            </Button>

            {/* Display Position Controls */}
            <div className="unified-results-panel__position-controls">
              <Button 
                onClick={() => onUpdateDisplayPosition({ mode: 'sidebar', dockSide: 'right' })}
                variant={unifiedResults.displayPosition.mode === 'sidebar' ? 'default' : 'ghost'}
                size="sm"
                className="unified-results-panel__control-btn"
                title="Dock to sidebar"
              >
                ⫸
              </Button>
            </div>

            {/* Close Button */}
            <Button 
              onClick={onDismissAnalysisPanel}
              variant="ghost"
              size="sm"
              className="unified-results-panel__close"
              title="Close results"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
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
                  onClick={() => onRestoreFromHistory(entry.id)}
                >
                  <div className="unified-results-panel__history-summary">{entry.summary}</div>
                  {entry.userInputs && entry.userInputs.rawInputs && (
                    <div className="unified-results-panel__history-input">
                      <span className="history-input-label">
                        {entry.userInputs.rawInputs.analysisType === 'melody' ? 'Melody:' :
                         entry.userInputs.rawInputs.analysisType === 'scale' ? 'Scale:' :
                         entry.userInputs.rawInputs.analysisType === 'progression' ? 'Progression:' :
                         entry.userInputs.rawInputs.discoveryType ? `${entry.userInputs.rawInputs.discoveryType}:` :
                         entry.userInputs.rawInputs.harmonyType ? `${entry.userInputs.rawInputs.harmonyType}:` :
                         'Input:'}
                      </span>
                      <span className="history-input-value">
                        {entry.userInputs.rawInputs.originalInput.length > 30 
                          ? `${entry.userInputs.rawInputs.originalInput.substring(0, 30)}...`
                          : entry.userInputs.rawInputs.originalInput}
                      </span>
                    </div>
                  )}
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
          {/* User Inputs Section */}
          {(() => {
            // Get user inputs from current history entry
            const currentHistoryEntry = unifiedResults.selectedHistoryId 
              ? unifiedResults.history.find(entry => entry.id === unifiedResults.selectedHistoryId)
              : unifiedResults.history[0]; // fallback to most recent

            const userInputs = currentHistoryEntry?.userInputs;

            if (userInputs && userInputs.rawInputs && !loading) {
              return (
                <div className="user-inputs-section">
                  <h4>Original Input</h4>
                  <div className="user-inputs-content">
                    <div className="input-display">
                      <span className="input-label">
                        {userInputs.rawInputs.analysisType === 'melody' ? 'Melody Notes:' :
                         userInputs.rawInputs.analysisType === 'scale' ? 'Scale Notes:' :
                         userInputs.rawInputs.analysisType === 'progression' ? 'Chord Progression:' :
                         userInputs.rawInputs.discoveryType ? `${userInputs.rawInputs.discoveryType} Input:` :
                         userInputs.rawInputs.harmonyType ? `${userInputs.rawInputs.harmonyType} Input:` :
                         'Input:'}
                      </span>
                      <span className="input-value">{userInputs.rawInputs.originalInput}</span>
                    </div>
                    <div className="input-meta">
                      <span className="input-method">Method: {userInputs.method}</span>
                      {userInputs.rawInputs.error && (
                        <span className="input-error">⚠️ Analysis failed</span>
                      )}
                    </div>
                    <div className="input-actions">
                      <Button 
                        onClick={() => onReturnToInput(userInputs)}
                        variant="secondary"
                        size="sm"
                        title="Return to input area with these values"
                      >
                        ↩️ Return to Input
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

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
                      if (parts.length > 1 && isValidNoteName(parts[0])) {
                        // Format: "F Ionian" - first part is a valid note name (tonic), rest is mode
                        tonic = parts[0];
                        mode = parts.slice(1).join(' ');
                      } else {
                        // Format: "Ionian" or "Blues Mode II" - no valid note name at start, need to get tonic from elsewhere
                        mode = fullMode;
                        // Try to get tonic from scale notes first (first note is the mode root), then fallback to other sources
                        let extractedTonic = null;
                        if (geminiAnalysis.result.analysis.notes && geminiAnalysis.result.analysis.notes.length > 0) {
                          extractedTonic = geminiAnalysis.result.analysis.notes[0];
                        } else if (geminiAnalysis.result.analysis.scale) {
                          // Parse scale string to get first note
                          const scaleNotes = geminiAnalysis.result.analysis.scale.trim().split(/\s+/);
                          if (scaleNotes.length > 0) {
                            extractedTonic = scaleNotes[0];
                          }
                        }

                        tonic = extractedTonic || 
                               geminiAnalysis.result.analysis.parentScaleRootNote || 
                               (localAnalysis && localAnalysis.suggestedTonic) || 'F';
                      }

                      return (
                        <>
                          <p>
                            <strong>Mode:</strong> {mode}
                            <Button 
                              onClick={() => onSwitchToReferenceWithHighlight(mode, tonic)}
                              variant="link"
                              size="sm"
                              className="ml-2"
                              title="View this mode in scale tables"
                            >
                              📊 View in Tables
                            </Button>
                          </p>
                          <p><strong>Tonic (Root):</strong> {tonic}</p>
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
                        if (parts.length > 1 && isValidNoteName(parts[0])) {
                          // Format: "F Ionian" - first part is a valid note name (tonic), rest is mode
                          tonic = parts[0];
                          mode = parts.slice(1).join(' ');
                        } else {
                          // Format: "Ionian" or "Blues Mode II" - no valid note name at start, need to get tonic from elsewhere
                          mode = fullMode;
                          // Try to get tonic from scale notes first (first note is the mode root), then fallback to other sources
                          let extractedTonic = null;
                          if (alt.notes && alt.notes.length > 0) {
                            extractedTonic = alt.notes[0];
                          } else if (alt.scale) {
                            // Parse scale string to get first note
                            const scaleNotes = alt.scale.trim().split(/\s+/);
                            if (scaleNotes.length > 0) {
                              extractedTonic = scaleNotes[0];
                            }
                          }

                          tonic = extractedTonic || 
                                 alt.parentScaleRootNote || 
                                 (localAnalysis && localAnalysis.suggestedTonic) || 'F';
                        }

                        return (
                          <>
                            <h6>Alternative {index + 1}</h6>
                            <p>
                              <strong>Mode:</strong> {mode}
                              <Button 
                                onClick={() => onSwitchToReferenceWithHighlight(mode, tonic)}
                                variant="link"
                                size="sm"
                                className="ml-2"
                                title="View this mode in scale tables"
                              >
                                📊 View in Tables
                              </Button>
                            </p>
                            <p><strong>Tonic (Root):</strong> {tonic}</p>
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
                  <h5>Example Songs</h5>
                  {geminiAnalysis.result.songExamples.map((group: any, index: number) => (
                    <div key={index} className="song-group">
                      <h6>{group.mode}</h6>
                      <ul>
                        {group.examples && Array.isArray(group.examples) && group.examples.map((song: any, songIndex: number) => (
                          <li key={songIndex}>
                            <strong>{song.title}</strong> by {song.artist}
                            {song.usage && <div className="song-example-item__usage">"{song.usage}"</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {discoveryAnalysis && !loading && !error && !placeholder && (
            <>
              <div className="primary-result">
                {discoveryAnalysis.deeperAnalysis && discoveryAnalysis.selectedMode ? (
                  <>
                    <h4>{discoveryAnalysis.selectedMode.name} - Deeper Analysis</h4>
                    <p><strong>Mode:</strong> {discoveryAnalysis.selectedMode.name}</p>
                    <p><strong>Tonic (Root):</strong> {discoveryAnalysis.selectedMode.notes[0]}</p>
                    <p><strong>Notes:</strong> {discoveryAnalysis.selectedMode.notes.join(' ')}</p>
                    <p><strong>Formula:</strong> {discoveryAnalysis.selectedMode.formula}</p>
                    <p><strong>Parent Scale:</strong> {discoveryAnalysis.selectedMode.parentScaleName} in {discoveryAnalysis.selectedMode.parentScaleRootNote}</p>
                    {discoveryAnalysis.selectedMode.character && (
                      <p><strong>Character:</strong> {discoveryAnalysis.selectedMode.character}</p>
                    )}
                    <Badge variant="secondary" className="mt-2">
                      🎵 AI-Powered Analysis
                    </Badge>
                  </>
                ) : (
                  <>
                    <h4>Mode Discovery Results</h4>
                    {discoveryAnalysis.rootNote && (
                      <p><strong>Root Note:</strong> {discoveryAnalysis.rootNote}</p>
                    )}
                    {discoveryAnalysis.totalModes && (
                      <p><strong>Total Modes Found:</strong> {discoveryAnalysis.totalModes}</p>
                    )}
                    {discoveryAnalysis.message && (
                      <p className="text-slate-400">{discoveryAnalysis.message}</p>
                    )}
                    {discoveryAnalysis.scaleDataSource === 'direct' && (
                      <Badge variant="secondary" className="mt-2">
                        ⚡ Instant Results - Using Scale Data
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* Only show ScaleGrid for non-deeper analysis (general discovery) */}
              {!discoveryAnalysis.deeperAnalysis && discoveryAnalysis.modes && Array.isArray(discoveryAnalysis.modes) && (
                <div className="discovery-modes-grid mt-6">
                  <ScaleGrid 
                    modes={discoveryAnalysis.modes as ModeFromRoot[]}
                    onModeSelect={(mode: ModeFromRoot) => {
                      // Trigger focused analysis for the selected mode
                      onModeAnalysisRequest(mode);
                    }}
                    compact={true}
                    showCharacteristics={true}
                    enableFiltering={true}
                    interactionMode="select"
                  />
                </div>
              )}

              {/* Legacy display for AI-generated results - only show for non-deeper analysis */}
              {!discoveryAnalysis.deeperAnalysis && discoveryAnalysis.modesByFamily && (
                <div className="modes-by-family">
                  <h5>Modes by Scale Family</h5>
                  {Object.entries(discoveryAnalysis.modesByFamily).map(([family, modes]) => (
                    <div key={family} className="mode-family">
                      <h6>{family}</h6>
                      <div className="mode-list">
                        {Array.isArray(modes) && modes.map((mode: any, index: number) => (
                          <div key={index} className="mode-item">
                            <div className="mode-header">
                              <strong>{mode.mode}</strong>
                              {mode.mode && (() => {
                                const parts = mode.mode.split(' ');
                                let tonic, modeName;
                                if (parts.length > 1 && isValidNoteName(parts[0])) {
                                  tonic = parts[0];
                                  modeName = parts.slice(1).join(' ');
                                } else {
                                  modeName = mode.mode;
                                  tonic = discoveryAnalysis.rootNote || 'C';
                                }
                                return (
                                  <Button 
                                    onClick={() => onSwitchToReferenceWithHighlight(modeName, tonic)}
                                    variant="link"
                                    size="sm"
                                    className="ml-2"
                                    title="View this mode in scale tables"
                                  >
                                    📊 View in Tables
                                  </Button>
                                );
                              })()}
                            </div>
                            {mode.notes && (
                              <p><strong>Notes:</strong> {Array.isArray(mode.notes) ? mode.notes.join(' ') : mode.notes}</p>
                            )}
                            {mode.formula && (
                              <p><strong>Formula:</strong> {mode.formula}</p>
                            )}
                            {mode.characteristics && (
                              <p><strong>Characteristics:</strong> {mode.characteristics}</p>
                            )}
                            {mode.applications && (
                              <p><strong>Applications:</strong> {mode.applications}</p>
                            )}
                            {mode.parentScale && (
                              <p><strong>Parent Scale:</strong> {mode.parentScale}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Song examples - filter for selected mode when doing deeper analysis */}
              {discoveryAnalysis.songExamples && Array.isArray(discoveryAnalysis.songExamples) && (
                <div className="song-examples">
                  <h5>Example Songs</h5>
                  {discoveryAnalysis.songExamples
                    .filter((group: any) => {
                      // If deeper analysis, only show examples for the selected mode
                      if (discoveryAnalysis.deeperAnalysis && discoveryAnalysis.selectedMode) {
                        return group.mode && group.mode.toLowerCase().includes(discoveryAnalysis.selectedMode.name.toLowerCase());
                      }
                      // Otherwise show all examples
                      return true;
                    })
                    .map((group: any, index: number) => (
                      <div key={index} className="song-group">
                        <h6>{group.mode}</h6>
                        <ul>
                          {group.examples && Array.isArray(group.examples) && group.examples.map((song: any, songIndex: number) => (
                            <li key={songIndex}>
                              <strong>{song.title}</strong> by {song.artist}
                              {song.usage && <div className="song-example-item__usage">"{song.usage}"</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}

          {harmonyAnalysis && !loading && !error && !placeholder && (
            <>
              <div className="primary-result">
                <h4>Harmony Analysis Results</h4>
                {harmonyAnalysis.method && (
                  <p><strong>Analysis Type:</strong> {harmonyAnalysis.method}</p>
                )}

                {/* Handle progression analysis results */}
                {harmonyAnalysis.method === 'progression' && harmonyAnalysis.analysis && (
                  <div className="progression-analysis">
                    {harmonyAnalysis.progression && (
                      <p><strong>Chord Progression:</strong> {harmonyAnalysis.progression}</p>
                    )}

                    {harmonyAnalysis.analysis.keyCenter && (
                      <p><strong>Key Center:</strong> {harmonyAnalysis.analysis.keyCenter}</p>
                    )}

                    {harmonyAnalysis.analysis.overallMode && (
                      <p><strong>Overall Mode:</strong> {harmonyAnalysis.analysis.overallMode}</p>
                    )}

                    {harmonyAnalysis.analysis.chordAnalysis && Array.isArray(harmonyAnalysis.analysis.chordAnalysis) && (
                      <div className="chord-analysis-section">
                        <h5>Individual Chord Analysis</h5>
                        <div className="chord-analysis-grid">
                          {harmonyAnalysis.analysis.chordAnalysis.map((chord: any, index: number) => (
                            <div key={index} className="chord-analysis-item">
                              <div className="chord-header">
                                <strong>{chord.chord}</strong>
                                {chord.isModal && (
                                  <Badge variant="secondary" className="ml-2">Modal</Badge>
                                )}
                              </div>
                              {chord.function && (
                                <p><strong>Function:</strong> {chord.function}</p>
                              )}
                              {chord.mode && (
                                <p><strong>Mode:</strong> {chord.mode}</p>
                              )}
                              {chord.notes && Array.isArray(chord.notes) && (
                                <p><strong>Notes:</strong> {chord.notes.join(' ')}</p>
                              )}
                              {chord.relationship && (
                                <p><strong>Relationship:</strong> {chord.relationship}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {harmonyAnalysis.analysis.modalChords && Array.isArray(harmonyAnalysis.analysis.modalChords) && harmonyAnalysis.analysis.modalChords.length > 0 && (
                      <div className="modal-chords-section">
                        <h5>Modal Chords Identified</h5>
                        <div className="modal-chords-list">
                          {harmonyAnalysis.analysis.modalChords.map((modalChord: any, index: number) => (
                            <div key={index} className="modal-chord-item">
                              <strong>{modalChord.chord || modalChord}</strong>
                              {modalChord.mode && <span> - {modalChord.mode}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {harmonyAnalysis.analysis.modalInterchange && (
                      <div className="modal-interchange-section">
                        <h5>Modal Interchange Analysis</h5>
                        <p>{harmonyAnalysis.analysis.modalInterchange}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Handle other harmony analysis methods */}
                {harmonyAnalysis.method === 'analyze' && harmonyAnalysis.analysis && (
                  <div className="chord-analysis">
                    {harmonyAnalysis.chord && (
                      <p><strong>Chord:</strong> {harmonyAnalysis.chord}</p>
                    )}
                    {harmonyAnalysis.analysis.rootNote && (
                      <p><strong>Root Note:</strong> {harmonyAnalysis.analysis.rootNote}</p>
                    )}
                    {harmonyAnalysis.analysis.chordType && (
                      <p><strong>Chord Type:</strong> {harmonyAnalysis.analysis.chordType}</p>
                    )}
                    {harmonyAnalysis.analysis.notes && Array.isArray(harmonyAnalysis.analysis.notes) && (
                      <p><strong>Notes:</strong> {harmonyAnalysis.analysis.notes.join(' ')}</p>
                    )}
                    {harmonyAnalysis.analysis.function && (
                      <p><strong>Function:</strong> {harmonyAnalysis.analysis.function}</p>
                    )}
                    {harmonyAnalysis.analysis.characteristics && (
                      <p><strong>Characteristics:</strong> {harmonyAnalysis.analysis.characteristics}</p>
                    )}
                  </div>
                )}

                {/* Applications section */}
                {harmonyAnalysis.applications && (
                  <div className="applications-section">
                    <h5>Applications</h5>
                    {harmonyAnalysis.applications.genres && Array.isArray(harmonyAnalysis.applications.genres) && (
                      <p><strong>Genres:</strong> {harmonyAnalysis.applications.genres.join(', ')}</p>
                    )}
                    {harmonyAnalysis.applications.progressions && Array.isArray(harmonyAnalysis.applications.progressions) && (
                      <p><strong>Common Progressions:</strong> {harmonyAnalysis.applications.progressions.join(', ')}</p>
                    )}
                    {harmonyAnalysis.applications.tips && (
                      <p><strong>Tips:</strong> {harmonyAnalysis.applications.tips}</p>
                    )}
                  </div>
                )}

                <Badge variant="secondary" className="mt-2">
                  🎵 AI-Powered Harmony Analysis
                </Badge>
              </div>
            </>
          )}

          {localAnalysis && !loading && !error && !placeholder && (
            <>
              <div className="primary-result">
                <h4>Key Suggestions - Melody Mode</h4>
                <p><strong>Played Notes:</strong> {localAnalysis.playedNotes}</p>
                <p><strong>Total Notes:</strong> {localAnalysis.totalNotes}</p>

                {localAnalysis.suggestions && Array.isArray(localAnalysis.suggestions) && localAnalysis.suggestions.length > 0 ? (
                  <div className="melody-suggestions">
                    <h5>Possible Keys and Modes</h5>
                    <div className="suggestions-grid">
                      {localAnalysis.suggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="suggestion-item">
                          <div className="suggestion-header">
                            <strong>{suggestion.name}</strong>
                            <Badge variant={suggestion.confidence === 1.0 ? "default" : "secondary"} className="ml-2">
                              {suggestion.confidence === 1.0 ? "Perfect Match" : `${Math.round(suggestion.confidence * 100)}% Match`}
                            </Badge>
                          </div>
                          <div className="suggestion-details">
                            <p><strong>Matching Notes:</strong> {suggestion.matchCount}/{localAnalysis.totalNotes}</p>
                            <div className="suggestion-notes">
                              <strong>Scale Notes:</strong>
                              <div className="notes-display">
                                {Array.from(suggestion.pitchClasses).sort((a, b) => a - b).map((pitch: number, noteIndex: number) => {
                                  const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][pitch];
                                  const isPlayed = localAnalysis.playedNotes.includes(noteName);
                                  return (
                                    <span 
                                      key={noteIndex} 
                                      className={`note-badge ${isPlayed ? 'note-played' : 'note-not-played'}`}
                                    >
                                      {noteName}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Add links to reference scale grids */}
                            {(() => {
                              // Extract mode names from the suggestion name
                              const suggestionText = suggestion.name;

                              // Handle "Possible modes:" format
                              if (suggestionText.includes('Possible modes:')) {
                                const modesText = suggestionText.replace('Possible modes:', '').trim();
                                const modes = modesText.split(',').map(m => m.trim());

                                return (
                                  <div className="scale-links">
                                    <small>View in scale tables:</small>
                                    <div className="scale-links-buttons">
                                      {modes.slice(0, 3).map((modeText, modeIndex) => {
                                        // Parse "Note Mode" format (e.g., "C Major", "D Dorian")
                                        const parts = modeText.trim().split(' ');
                                        if (parts.length >= 2 && isValidNoteName(parts[0])) {
                                          const tonic = parts[0];
                                          const mode = parts.slice(1).join(' ');
                                          return (
                                            <Button 
                                              key={modeIndex}
                                              onClick={() => onSwitchToReferenceWithHighlight(mode, tonic)}
                                              variant="link"
                                              size="sm"
                                              className="scale-link-button"
                                              title={`View ${modeText} in scale tables`}
                                            >
                                              📊 {modeText}
                                            </Button>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  </div>
                                );
                              }

                              // Handle "Partial match" format
                              if (suggestionText.includes('Partial match')) {
                                const colonIndex = suggestionText.lastIndexOf(':');
                                if (colonIndex !== -1) {
                                  const modesText = suggestionText.substring(colonIndex + 1).trim();
                                  const modes = modesText.split(',').map(m => m.trim());

                                  return (
                                    <div className="scale-links">
                                      <small>View in scale tables:</small>
                                      <div className="scale-links-buttons">
                                        {modes.slice(0, 3).map((modeText, modeIndex) => {
                                          // Parse "Note Mode" format
                                          const parts = modeText.trim().split(' ');
                                          if (parts.length >= 2 && isValidNoteName(parts[0])) {
                                            const tonic = parts[0];
                                            const mode = parts.slice(1).join(' ');
                                            return (
                                              <Button 
                                                key={modeIndex}
                                                onClick={() => onSwitchToReferenceWithHighlight(mode, tonic)}
                                                variant="link"
                                                size="sm"
                                                className="scale-link-button"
                                                title={`View ${modeText} in scale tables`}
                                              >
                                                📊 {modeText}
                                              </Button>
                                            );
                                          }
                                          return null;
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                              }

                              return null;
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-suggestions">
                    <p>No key suggestions available for the current melody.</p>
                    <p className="text-muted">Try playing more notes to get better suggestions.</p>
                  </div>
                )}

                <Badge variant="secondary" className="mt-2">
                  🎹 MIDI Input Analysis
                </Badge>
              </div>
            </>
          )}

          {!loading && !placeholder && (
            <div className="secondary-results">
              <div className="related-info">
                <Button 
                  onClick={() => onSwitchToReference()}
                  variant="secondary"
                >
                  View in Scale Tables
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Return the JSX for the unified results panel
  return renderUnifiedResults();
};

export default UnifiedResultsPanel;
