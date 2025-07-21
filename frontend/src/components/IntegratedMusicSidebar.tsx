import React, {useCallback, useEffect, useState} from 'react';
import MidiDetectionPanel from './MidiDetectionPanel';
import * as keySuggester from '../services/keySuggester';
import {updateUnifiedDetection} from '../services/keySuggester';
import {UnifiedResultsState} from './UnifiedResultsPanel';
import {parseTonicAndMode, extractTonicFromAnalysis} from '../utils/music';

interface IntegratedMusicSidebarProps {
  midiData?: {
    playedNotes: any[];
    playedPitchClasses: Set<number>;
    detectionEnabled: boolean;  // Consolidated toggle for detection
    setDetectionEnabled: (enabled: boolean) => void;
    analysisFocus: 'automatic' | 'complete' | 'pentatonic' | 'chord';  // Analysis focus dropdown
    setAnalysisFocus: (focus: 'automatic' | 'complete' | 'pentatonic' | 'chord') => void;
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
type DetectionSuggestion = keySuggester.DetectionSuggestion;

const IntegratedMusicSidebar: React.FC<IntegratedMusicSidebarProps> = ({
  midiData,
  onScaleHighlight,
  className = '',
  unifiedResults,
  onSwitchToReferenceWithHighlight
}) => {
  // melodySuggestions removed as part of consolidation - functionality moved to unified detection
  const [chordSuggestions, setChordSuggestions] = useState<ChordSuggestion[]>([]);
  
  // Sidebar visibility state - default hidden as per requirements
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Define a type for detection categories - must match keySuggester service
  type DetectionCategory = 'complete' | 'pentatonic' | 'partial' | 'minimal' | 'none' | 'incomplete';
  
  // Type for unifiedDetectionResults
  interface UnifiedDetectionResult {
    suggestions: DetectionSuggestion[];
    category: DetectionCategory;
    closeness: number;
    // TODO: Implement confidence calculation system for unified detection results
  }
  
  const [unifiedDetectionResults, setUnifiedDetectionResults] = useState<UnifiedDetectionResult | null>(null);
  
  // Progressive disclosure state management
  const [viewMode, setViewMode] = useState<'quick' | 'detailed'>('quick');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [maxSuggestions, setMaxSuggestions] = useState(3);

  // Phase 3: Advanced Progressive Disclosure State
  const [progressiveDisclosure, setProgressiveDisclosure] = useState({
    showAllSuggestions: false,
    showDetailedAnalysis: false,
    showAdvancedOptions: false,
    maxSuggestionsToShow: 3,
    autoExpandOnActivity: true,
    smartSectionManagement: true
  });

  // State for debugging information
  const [debugInfo, setDebugInfo] = useState<{
    suggestions: MelodySuggestion[];
    timestamp: string;
    playedNotes: string;
    sortingDetails: Array<{
      name: string;
      matchCount: number;
      topModePopularity: number;
      containsPlayedNoteAsRoot: boolean;
      finalRank: number;
    }>;
  } | null>(null);

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

  // Render debugging information display
  const renderDebugInfo = () => {
    if (!debugInfo) {
      return null;
    }
    
    return (
      <div className="debug-info-panel" style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '12px',
        margin: '8px 0',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div style={{ color: '#ffd700', fontWeight: 'bold', marginBottom: '8px' }}>
          🔍 Debug Info - Melody Suggestion Sorting
        </div>

        <div style={{ color: '#ccc', marginBottom: '4px' }}>
          <strong>Timestamp:</strong> {debugInfo.timestamp}
        </div>

        <div style={{ color: '#ccc', marginBottom: '8px' }}>
          <strong>Played Notes:</strong> {debugInfo.playedNotes || 'None'}
        </div>
        
        <div style={{ color: '#87ceeb', fontWeight: 'bold', marginBottom: '4px' }}>
          Suggestion Sorting Details:
        </div>
        
        {debugInfo.sortingDetails.map((detail, index) => (
          <div key={index} style={{
            background: index === 0 ? '#2d4a2d' : '#2a2a2a',
            border: index === 0 ? '1px solid #4a7c59' : '1px solid #444',
            borderRadius: '4px',
            padding: '6px',
            margin: '4px 0',
            fontSize: '11px'
          }}>
            <div style={{ color: index === 0 ? '#90ee90' : '#fff', fontWeight: 'bold' }}>
              #{detail.finalRank}: {detail.name}
            </div>
            <div style={{ color: '#ccc', marginTop: '2px' }}>
              Match Count: {detail.matchCount} |
              Mode Popularity: {detail.topModePopularity} |
              Contains Root: {detail.containsPlayedNoteAsRoot ? 'Yes' : 'No'}
            </div>
          </div>
        ))}
        
        <div style={{ color: '#ffa500', fontSize: '10px', marginTop: '8px' }}>
          <strong>Sorting Logic:</strong> 1) Match Count (higher = better), 2) Mode Popularity (lower = better), 3) Contains Played Note as Root (true = better)
        </div>
        
        {debugInfo.playedNotes === 'F' && (
          <div style={{ color: '#ff6b6b', fontSize: '10px', marginTop: '4px' }}>
            <strong>F Note Issue:</strong> If F Ionian is not first, check if it has containsPlayedNoteAsRoot=true
          </div>
        )}
      </div>
    );
  };

  // Render consolidated musical analysis content for sidebar
  const renderSidebarResults = () => {
    const hasUnifiedResults = unifiedResults?.isVisible && unifiedResults?.currentResults;
    const hasUnifiedDetection = unifiedDetectionResults && unifiedDetectionResults.suggestions.length > 0;
    const hasChordSuggestions = chordSuggestions.length > 0;

    if (!hasUnifiedResults && !hasUnifiedDetection && !hasChordSuggestions) {
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

        {/* Unified Detection Results Section with Progressive Disclosure */}
        {hasUnifiedDetection && (
          <div className="unified-detection-section">
            <div className="section-header-with-controls">
              <h5>Musical Analysis Results</h5>
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
                <div className="unified-suggestions">
                  {unifiedDetectionResults.suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <div className="suggestion-header">
                        {suggestion.name}
                      </div>
                      <div className="suggestion-confidence">
                        {Math.round(suggestion.closeness * 100)}% complete
                      </div>
                      <div className="suggestion-match-type">
                        {suggestion.matchType === 'exact' ? '✓ Exact Match' : '~ Partial Match'}
                      </div>
                      {suggestion.matchingScales && suggestion.matchingScales.length > 0 && (
                        <div className="suggestion-scales">
                          <button
                            className="scale-link"
                            onClick={() => handleScaleHighlight(suggestion.matchingScales[0].id)}
                            aria-label={`View ${suggestion.matchingScales[0].name} in tables`}
                          >
                            View in Tables
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed View - Full suggestions with advanced options */}
            {viewMode === 'detailed' && (
              <div className="detailed-view">
                <div className="unified-suggestions">
                  <div className="detection-category">
                    <strong>Category:</strong> {unifiedDetectionResults.category}
                    <span className="closeness-indicator">
                      ({Math.round(unifiedDetectionResults.closeness * 100)}% overall completeness)
                    </span>
                  </div>
                  
                  {unifiedDetectionResults.suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item detailed">
                      <div className="suggestion-header">
                        {suggestion.name}
                      </div>
                      <div className="suggestion-details">
                        <div className="suggestion-confidence">
                          Completeness: {Math.round(suggestion.closeness * 100)}%
                        </div>
                        <div className="suggestion-match-type">
                          Match Type: {suggestion.matchType}
                        </div>
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
                              {scaleIndex < Math.min(suggestion.matchingScales.length - 1, 2) && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

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

        {/* Chord Suggestions Section */}
        {hasChordSuggestions && (
          <div className="chord-suggestions-section">
            <h5>Chord Analysis</h5>
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
          </div>
        )}

        {/* No results message */}
        {!hasUnifiedResults && !hasUnifiedDetection && !hasChordSuggestions && (
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
    unifiedDetection: true,  // Phase 2: New unified detection results section
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

  // Effect to update suggestions and unified detection results based on MIDI data
  useEffect(() => {
    if (!midiData?.playedPitchClasses || midiData.playedPitchClasses.size === 0) {
      setChordSuggestions([]);
      setUnifiedDetectionResults(null);
      setViewMode('quick'); // Reset to quick view
      return;
    }

    if (!midiData.detectionEnabled) {
      setChordSuggestions([]);
      setUnifiedDetectionResults(null);
      return;
    }

    const noteCount = midiData.playedPitchClasses.size;

    // Adaptive view mode based on note count
    if (noteCount >= 7) {
      setViewMode('detailed'); // Auto-expand for complex input
    } else {
      setViewMode('quick'); // Default to quick view
    }

    // Automatically show sidebar on MIDI input as per requirements
    if (midiData.playedPitchClasses.size > 0 && midiData.detectionEnabled) {
      setIsVisible(true);
    }

    // Update unified detection results for consolidated display
    const detectionResult = updateUnifiedDetection(midiData.playedPitchClasses, midiData.analysisFocus);
    setUnifiedDetectionResults(detectionResult);

    // Capture debugging information for unified detection results
    const playedNotesArray = Array.from(midiData.playedPitchClasses);
    const noteNames = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
    const playedNoteNames = playedNotesArray.map(pc => noteNames[pc]).join(', ');

    const sortingDetails = detectionResult.suggestions.map((suggestion, index) => ({
      name: suggestion.name,
      matchCount: Math.round(suggestion.closeness * 100), // Use closeness as match count equivalent
      topModePopularity: suggestion.topModePopularity || 999,
      containsPlayedNoteAsRoot: suggestion.containsPlayedNoteAsRoot || false,
      finalRank: index + 1
    }));

    setDebugInfo({
      suggestions: [], // Legacy field, kept for compatibility
      timestamp: new Date().toLocaleTimeString(),
      playedNotes: playedNoteNames,
      sortingDetails: sortingDetails
    });

    // Update chord suggestions if in chord focus mode
    if (midiData.analysisFocus === 'chord') {
      console.log('🎵 Sidebar calling updateChordSuggestionsForSidebar');
      keySuggester.updateChordSuggestionsForSidebar(midiData.playedPitchClasses);
    }
  }, [midiData?.detectionEnabled, midiData?.analysisFocus, midiData?.playedPitchClasses]);

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

  // Manual toggle function for sidebar visibility
  const toggleSidebarVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <>
      {/* Sidebar Toggle Button - Always visible */}
      <button 
        className="sidebar-toggle-btn"
        onClick={toggleSidebarVisibility}
        aria-label={`${isVisible ? 'Hide' : 'Show'} music analysis sidebar`}
        style={{
          position: 'fixed',
          right: isVisible ? '320px' : '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
          background: '#475569',
          color: '#e2e8f0',
          border: 'none',
          borderRadius: '8px 0 0 8px',
          padding: '12px 8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '1.2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        {isVisible ? '→' : '🎵'}
      </button>

      {/* Sidebar Content - Conditionally rendered */}
      {isVisible && (
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
                    (unifiedDetectionResults && unifiedDetectionResults.suggestions.length > 0) || 
                    chordSuggestions.length > 0
                      ? 'active' 
                      : 'inactive'
                  }`}
                ></span>
                🎯 Musical Analysis
                {((unifiedDetectionResults && unifiedDetectionResults.suggestions.length > 0) || chordSuggestions.length > 0) && (
                  <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: '#94a3b8' }}>
                    ({(unifiedDetectionResults?.suggestions.length || 0) + chordSuggestions.length})
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
      )}
    </>
  );
};

export default IntegratedMusicSidebar;
