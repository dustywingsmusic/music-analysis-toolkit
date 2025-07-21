import React, { useState, useEffect } from 'react';
import MidiDetectionPanel from './MidiDetectionPanel';
import * as keySuggester from '../services/keySuggester';
import { UnifiedResultsState } from './UnifiedResultsPanel';

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
  onSwitchToReference,
  onSwitchToReferenceWithHighlight,
  onReturnToInput,
  onDismissAnalysisPanel
}) => {
  const [melodySuggestions, setMelodySuggestions] = useState<MelodySuggestion[]>([]);
  const [chordSuggestions, setChordSuggestions] = useState<ChordSuggestion[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'quick' | 'detailed'>('quick');
  const [userToggled, setUserToggled] = useState(false);

  const renderQuickView = () => {
    const suggestions = midiData?.mode === 'chord' ? chordSuggestions : melodySuggestions;

    if (!suggestions || suggestions.length === 0) {
      return (
        <div className="no-suggestions">Play some notes to see suggestions</div>
      );
    }

    return (
      <div className="quick-mode" data-testid="view-mode" data-mode={viewMode}>
        <div className="quick-suggestions">
          {suggestions.slice(0, 3).map((s: any, index: number) => (
            <div
              key={index}
              className="quick-suggestion-item"
              data-testid={`suggestion-${index}`}
            >
              <div className="quick-suggestion-header">
                <span className="quick-suggestion-name">
                  {s.name || `${s.chord} in ${s.key}`}
                </span>
                {s.confidence !== undefined && (
                  <span className="quick-completeness">
                    {Math.round((s.confidence || 0) * 100)}%
                  </span>
                )}
              </div>
              {s.matchingScales && s.matchingScales.length > 0 && (
                <button
                  className="quick-view-tables-btn"
                  onClick={() => handleScaleHighlight(s.matchingScales[0].id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScaleHighlight(s.matchingScales[0].id);
                    }
                  }}
                  aria-label={`View ${s.matchingScales[0].name} in scale tables`}
                >
                  View in Tables
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to check if a string is a valid note name
  const isValidNoteName = (str: string): boolean => {
    const notePattern = /^[A-G][#b♭]?$/;
    return notePattern.test(str);
  };

  // Render unified results content for sidebar
  const renderSidebarResults = () => {
    if (!unifiedResults?.isVisible || !unifiedResults?.currentResults) {
      return (
        <div className="no-results">
          No detailed analysis available
        </div>
      );
    }

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

    return (
      <div className="no-results">
        No analysis results available
      </div>
    );
  };

  const [lastHighlightedScale, setLastHighlightedScale] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    midi: true,
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

    });

    // Register chord suggestion callback
    keySuggester.registerChordSuggestionCallback((suggestions: ChordSuggestion[]) => {
      console.log('🎵 Sidebar received chord suggestions:', suggestions);
      setChordSuggestions(suggestions);

    });

    // Cleanup callbacks on unmount
    return () => {
      keySuggester.registerMelodySuggestionCallback(null);
      keySuggester.registerChordSuggestionCallback(null);
    };
  }, []);

  // Adapt view mode based on note count unless user manually toggled
  useEffect(() => {
    if (!midiData?.playedPitchClasses) return;
    if (userToggled) return;
    if (midiData.playedPitchClasses.size >= 7) {
      setViewMode('detailed');
    } else {
      setViewMode('quick');
    }
  }, [midiData?.playedPitchClasses, userToggled]);

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


      {/* Musical Analysis Section */}
      <div className="sidebar-section" role="region" aria-label="Musical Analysis">
        <div
          className="sidebar-section-header"
          onClick={() => toggleSection('results')}
        >
          <h3 className="sidebar-section-title">
            <span
              className={`sidebar-status-indicator ${
                unifiedResults?.isVisible && unifiedResults?.currentResults ? 'active' : 'inactive'
              }`}
            ></span>
            🎯 Musical Analysis
          </h3>
          <button className="sidebar-section-toggle">
            {expandedSections.results ? '−' : '+'}
          </button>
        </div>

        {expandedSections.results && (
          <div className="sidebar-section-content">
            {viewMode === 'quick' ? renderQuickView() : (
              <div id="analysis-details">{renderSidebarResults()}</div>
            )}
            <div className="progressive-disclosure-controls">
              <button
                className="toggle-view-mode-btn"
                onClick={() => {
                  setViewMode(viewMode === 'quick' ? 'detailed' : 'quick');
                  setUserToggled(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setViewMode(viewMode === 'quick' ? 'detailed' : 'quick');
                    setUserToggled(true);
                  }
                }}
                aria-expanded={viewMode === 'detailed'}
                aria-controls="analysis-details"
              >
                {viewMode === 'quick' ? '📊 Show Details' : '📊 Hide Details'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedMusicSidebar;
