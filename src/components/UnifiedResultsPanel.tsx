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
}

const UnifiedResultsPanel: React.FC<UnifiedResultsPanelProps> = ({
  unifiedResults,
  setUnifiedResults,
  onSwitchToReference,
  onSwitchToReferenceWithHighlight,
  onReturnToInput,
  onRestoreFromHistory,
  onDismissAnalysisPanel,
  onUpdateDisplayPosition
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
              ×
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
