import React, {useEffect, useState} from 'react';
import MidiDetectionPanel from './MidiDetectionPanel';
import * as keySuggester from '../services/keySuggester';
import {UnifiedResultsState} from './UnifiedResultsPanel';

interface IntegratedMusicSidebarProps {
  midiData?: {
    playedNotes: any[];
    playedPitchClasses: Set<number>;
    mode: '7' | '5' | 'melody' | 'chord';
    setMode: (mode: '7' | '5' | 'melody' | 'chord') => void;
    clearPlayedNotes: () => void;
  };
  onScaleHighlight?: (scaleId: string | null) => void;
  className?: string;
  // Unified Results Panel integration
  unifiedResults?: UnifiedResultsState;
  onSwitchToReference?: (highlightId?: string) => void;
  onSwitchToReferenceWithHighlight?: (mode: string, tonic: string) => void;
  onReturnToInput?: (userInputs: any) => void;
  onDismissAnalysisPanel?: () => void;
}

// Use types from keySuggester service
type MelodySuggestion = keySuggester.MelodySuggestion;
type ChordSuggestion = keySuggester.ChordSuggestion;

const IntegratedMusicSidebar: React.FC<IntegratedMusicSidebarProps> = ({
  midiData,
  onScaleHighlight,
  className = '',
  unifiedResults,
  onSwitchToReferenceWithHighlight
}) => {
  const [melodySuggestions, setMelodySuggestions] = useState<MelodySuggestion[]>([]);
  const [chordSuggestions, setChordSuggestions] = useState<ChordSuggestion[]>([]);
  
  // Progressive disclosure state management
  const [viewMode, setViewMode] = useState<'quick' | 'detailed'>('quick');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [maxSuggestions, setMaxSuggestions] = useState(3);

  // Progressive disclosure toggle functions
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'quick' ? 'detailed' : 'quick');
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(prev => !prev);
  };

  // Adaptive behavior based on note count
  const getAdaptiveViewMode = (noteCount: number): 'quick' | 'detailed' => {
    if (noteCount >= 7) {
      return 'detailed'; // Auto-expand for complex input
    }
    return 'quick'; // Default to quick view for 1-6 notes
  };

  // Helper function to check if a string is a valid note name
  const isValidNoteName = (str: string): boolean => {
    const notePattern = /^[A-G][#b♭]?$/;
    return notePattern.test(str);
  };

  // Render consolidated musical analysis content for sidebar
  const renderSidebarResults = () => {
    const hasUnifiedResults = unifiedResults?.isVisible && unifiedResults?.currentResults;
    const hasLiveSuggestions = melodySuggestions.length > 0 || chordSuggestions.length > 0;

    if (!hasUnifiedResults && !hasLiveSuggestions) {
      return (
        <div className="no-results">
          {(!midiData?.playedPitchClasses || midiData.playedPitchClasses.size === 0) 
            ? "Play some notes to see analysis" 
            : "No analysis available for current notes"}
        </div>
      );
    }

    // Render consolidated analysis with both unified results and live suggestions
    return (
      <div className="consolidated-analysis">
        {/* Unified Results Section */}
        {hasUnifiedResults && (() => {
          const currentResults = unifiedResults.currentResults;
          const { method, loading, error, geminiAnalysis, localAnalysis, placeholder, message } = currentResults;

          if (loading) {
            return (
              <div className="analysis-loading">
                <div className="loading-indicator">🎵</div>
                <p>Analyzing your {method}...</p>
              </div>
            );
          }

          if (error) {
            return (
              <div className="analysis-error">
                <h5>Analysis Error</h5>
                <p>{error}</p>
              </div>
            );
          }

          if (placeholder && message) {
            return (
              <div className="analysis-placeholder">
                <h5>Coming Soon</h5>
                <p>{message}</p>
                <small>This feature is planned for the next development phase.</small>
              </div>
            );
          }

          if (geminiAnalysis?.result?.analysis) {
            const analysis = geminiAnalysis.result.analysis;
            const fullMode = analysis.mode;
            const parts = fullMode.split(' ');

            let tonic, mode;
            if (parts.length > 1 && isValidNoteName(parts[0])) {
              tonic = parts[0];
              mode = parts.slice(1).join(' ');
            } else {
              mode = fullMode;
              tonic = analysis.notes?.[0] || analysis.scale?.trim().split(/\s+/)[0] || 'C';
            }

            return (
              <div className="analysis-results">
                <div className="analysis-primary">
                  <h5>Primary Analysis</h5>
                  <div className="mode-result">
                    <strong>{tonic} {mode}</strong>
                    {analysis.confidence && (
                      <span className="confidence">
                        ({Math.round(analysis.confidence * 100)}% confidence)
                      </span>
                    )}
                  </div>
                  {analysis.scale && (
                    <div className="scale-notes">
                      <small>Scale: {analysis.scale}</small>
                    </div>
                  )}
                  {onSwitchToReferenceWithHighlight && (
                    <button 
                      className="view-in-tables-btn"
                      onClick={() => onSwitchToReferenceWithHighlight(mode, tonic)}
                    >
                      View in Tables
                    </button>
                  )}
                </div>

                {analysis.explanation && (
                  <div className="analysis-explanation">
                    <h6>Explanation</h6>
                    <p>{analysis.explanation}</p>
                  </div>
                )}
              </div>
            );
          }

          if (localAnalysis) {
            return (
              <div className="analysis-results">
                <div className="analysis-local">
                  <h5>Local Analysis</h5>
                  {localAnalysis.suggestions && localAnalysis.suggestions.length > 0 && (
                    <div className="local-suggestions">
                      {localAnalysis.suggestions.slice(0, 3).map((suggestion: any, index: number) => (
                        <div key={index} className="local-suggestion">
                          <strong>{suggestion.name}</strong>
                          {suggestion.confidence && (
                            <span className="confidence">
                              ({Math.round(suggestion.confidence * 100)}%)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {localAnalysis.playedNotes && (
                    <div className="played-notes">
                      <small>Notes: {localAnalysis.playedNotes}</small>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })()}

        {/* Live Suggestions Section with Progressive Disclosure */}
        {hasLiveSuggestions && (
          <div className="live-suggestions-section">
            <div className="section-header-with-controls">
              <h5>Live Suggestions</h5>
              <div className="progressive-disclosure-controls">
                <button 
                  className="toggle-analysis-btn"
                  onClick={toggleViewMode}
                  aria-label={`Switch to ${viewMode === 'quick' ? 'detailed' : 'quick'} view`}
                >
                  {viewMode === 'quick' ? '📊 Show Details' : '⚡ Quick View'}
                </button>
                {viewMode === 'detailed' && (
                  <button 
                    className="toggle-options-btn"
                    onClick={toggleAdvancedOptions}
                    aria-label={`${showAdvancedOptions ? 'Hide' : 'Show'} advanced options`}
                  >
                    ⚙️ {showAdvancedOptions ? 'Hide Options' : 'Options'}
                  </button>
                )}
              </div>
            </div>

            {/* Quick View - Top suggestions only */}
            {viewMode === 'quick' && (
              <div className="quick-view">
                {midiData?.mode === 'melody' && melodySuggestions.length > 0 && (
                  <div className="melody-suggestions">
                    {melodySuggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-header">
                          {suggestion.name}
                        </div>
                        <div className="suggestion-confidence">
                          {Math.round(suggestion.confidence * 100)}% complete
                        </div>
                        {suggestion.matchingScales && suggestion.matchingScales.length > 0 && (
                          <div className="suggestion-scales">
                            <button
                              className="scale-link"
                              onClick={() => handleScaleHighlight(suggestion.matchingScales![0].id)}
                              aria-label={`View ${suggestion.matchingScales![0].name} in tables`}
                            >
                              View in Tables
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {midiData?.mode === 'chord' && chordSuggestions.length > 0 && (
                  <div className="chord-suggestions">
                    {chordSuggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-header">
                          {suggestion.chord} in {suggestion.key}
                        </div>
                        <div className="suggestion-confidence">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Detailed View - Full suggestions with advanced options */}
            {viewMode === 'detailed' && (
              <div className="detailed-view">
                {midiData?.mode === 'melody' && melodySuggestions.length > 0 && (
                  <div className="melody-suggestions">
                    {melodySuggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-header">
                          {suggestion.name}
                        </div>
                        <div className="suggestion-confidence">
                          Confidence: {Math.round(suggestion.confidence * 100)}%
                        </div>
                        {suggestion.matchingScales && suggestion.matchingScales.length > 0 && (
                          <div className="suggestion-scales">
                            <small>Click to view in tables:</small>
                            {suggestion.matchingScales.slice(0, 3).map((scale, scaleIndex) => (
                              <span
                                key={scaleIndex}
                                className="scale-link"
                                onClick={() => handleScaleHighlight(scale.id)}
                              >
                                {scale.name || `Scale ${scaleIndex + 1}`}
                                {scaleIndex < Math.min(suggestion.matchingScales!.length - 1, 2) && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {midiData?.mode === 'chord' && chordSuggestions.length > 0 && (
                  <div className="chord-suggestions">
                    {chordSuggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-header">
                          {suggestion.chord} in {suggestion.key}
                        </div>
                        <div className="suggestion-confidence">
                          Confidence: {Math.round(suggestion.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Advanced Options */}
                {showAdvancedOptions && (
                  <div className="advanced-options">
                    <label className="option-label">
                      Max Suggestions: {maxSuggestions}
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={maxSuggestions}
                        onChange={(e) => setMaxSuggestions(parseInt(e.target.value))}
                        aria-label="Maximum number of suggestions to display"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No results message */}
        {!hasUnifiedResults && !hasLiveSuggestions && (
          <div className="no-results">
            No analysis results available
          </div>
        )}
      </div>
    );
  };

  const [, setLastHighlightedScale] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    midi: true,
    suggestions: true,
    results: false
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle scale highlighting from suggestions
  const handleScaleHighlight = (scaleId: string) => {
    console.log('🎯 Sidebar highlighting scale:', scaleId);
    setLastHighlightedScale(scaleId);

    if (onScaleHighlight) {
      onScaleHighlight(scaleId);
    }

    // Scroll to the scale in the reference tables with enhanced behavior
    const element = document.getElementById(scaleId);
    if (element) {
      // Add a temporary highlight class for visual feedback
      element.classList.add('sidebar-highlighted');
      setTimeout(() => {
        element.classList.remove('sidebar-highlighted');
      }, 2000);

      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'center' 
      });
    }
  };

  // Register callbacks with keySuggester service
  useEffect(() => {
    // Register melody suggestion callback
    keySuggester.registerMelodySuggestionCallback((suggestions: MelodySuggestion[]) => {
      console.log('🎵 Sidebar received melody suggestions:', suggestions);
      setMelodySuggestions(suggestions);

      // Auto-expand results section when suggestions are received
      if (suggestions.length > 0) {
        setExpandedSections(prev => ({ ...prev, results: true }));
      }
    });

    // Register chord suggestion callback
    keySuggester.registerChordSuggestionCallback((suggestions: ChordSuggestion[]) => {
      console.log('🎵 Sidebar received chord suggestions:', suggestions);
      setChordSuggestions(suggestions);

      // Auto-expand results section when suggestions are received
      if (suggestions.length > 0) {
        setExpandedSections(prev => ({ ...prev, results: true }));
      }
    });

    // Cleanup callbacks on unmount
    return () => {
      keySuggester.registerMelodySuggestionCallback(null);
      keySuggester.registerChordSuggestionCallback(null);
    };
  }, []);

  // Effect to update suggestions based on MIDI mode and pitch classes
  useEffect(() => {
    if (!midiData?.playedPitchClasses || midiData.playedPitchClasses.size === 0) {
      setMelodySuggestions([]);
      setChordSuggestions([]);
      return;
    }

    if (midiData.mode === 'melody') {
      console.log('🎵 Sidebar calling updateMelodySuggestionsForSidebar');
      keySuggester.updateMelodySuggestionsForSidebar(midiData.playedPitchClasses);
    } else if (midiData.mode === 'chord') {
      console.log('🎵 Sidebar calling updateChordSuggestionsForSidebar');
      keySuggester.updateChordSuggestionsForSidebar(midiData.playedPitchClasses);
    }
  }, [midiData?.mode, midiData?.playedPitchClasses]);

  // Adaptive behavior effect - automatically adjust view mode based on note count
  useEffect(() => {
    if (midiData?.playedPitchClasses && midiData.playedPitchClasses.size > 0) {
      const noteCount = midiData.playedPitchClasses.size;
      const adaptiveMode = getAdaptiveViewMode(noteCount);
      
      // Only auto-switch if user hasn't manually overridden (we can track this with a flag if needed)
      // For now, we'll auto-switch for 7+ notes to detailed view
      if (noteCount >= 7 && viewMode === 'quick') {
        console.log('🎯 Auto-expanding to detailed view for', noteCount, 'notes');
        setViewMode('detailed');
        setExpandedSections(prev => ({ ...prev, results: true }));
      }
    }
  }, [midiData?.playedPitchClasses, viewMode]);

  return (
    <div className={`integrated-music-sidebar ${className}`}>
      {/* MIDI Detection Section */}
      <div className="sidebar-section">
        <div 
          className="sidebar-section-header"
          onClick={() => toggleSection('midi')}
        >
          <h3 className="sidebar-section-title">
            <span 
              className={`sidebar-status-indicator ${
                midiData?.playedPitchClasses && midiData.playedPitchClasses.size > 0 
                  ? 'detecting' 
                  : 'inactive'
              }`}
            ></span>
            🎹 MIDI Detection
          </h3>
          <button className="sidebar-section-toggle">
            {expandedSections.midi ? '−' : '+'}
          </button>
        </div>

        {expandedSections.midi && (
          <div className="sidebar-section-content">
            <MidiDetectionPanel
              midiData={midiData}
              onScaleHighlight={onScaleHighlight}
              className="sidebar-midi-panel"
            />
          </div>
        )}
      </div>

      {/* Musical Analysis Section - Consolidated */}
      <div className="sidebar-section">
        <div 
          className="sidebar-section-header"
          onClick={() => toggleSection('results')}
        >
          <h3 className="sidebar-section-title">
            <span 
              className={`sidebar-status-indicator ${
                (unifiedResults?.isVisible && unifiedResults?.currentResults) || 
                melodySuggestions.length > 0 || chordSuggestions.length > 0
                  ? 'active' 
                  : 'inactive'
              }`}
            ></span>
            🎯 Musical Analysis
            {(melodySuggestions.length > 0 || chordSuggestions.length > 0) && (
              <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: '#94a3b8' }}>
                ({melodySuggestions.length + chordSuggestions.length})
              </span>
            )}
          </h3>
          <button className="sidebar-section-toggle">
            {expandedSections.results ? '−' : '+'}
          </button>
        </div>

        {expandedSections.results && (
          <div className="sidebar-section-content">
            {renderSidebarResults()}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedMusicSidebar;
