import React, { useState, useCallback } from 'react';
import ChordAnalyzer from './ChordAnalyzer';
import ScaleFinder from './ScaleFinder';

interface UnifiedMusicToolProps {
  showDebugInfo: boolean;
}

const UnifiedMusicTool: React.FC<UnifiedMusicToolProps> = ({ showDebugInfo }) => {
  const [highlightIdForFinder, setHighlightIdForFinder] = useState<string | null>(null);
  const [analysisPanelCollapsed, setAnalysisPanelCollapsed] = useState<boolean>(false);
  const [hasAnalysisResults, setHasAnalysisResults] = useState<boolean>(false);

  const handleSwitchToFinderWithHighlight = useCallback((id: string) => {
    setHighlightIdForFinder(id);
  }, []);

  const handleAnalysisStateChange = useCallback((hasResults: boolean) => {
    setHasAnalysisResults(hasResults);
  }, []);

  const toggleAnalysisPanel = useCallback(() => {
    setAnalysisPanelCollapsed(prev => !prev);
  }, []);

  return (
    <div className="unified-music-tool">
      <div className={`adaptive-layout ${analysisPanelCollapsed ? 'analysis-collapsed' : ''} ${hasAnalysisResults ? 'has-results' : 'no-results'}`}>
        {/* Collapsible Analysis Panel */}
        <div className="analysis-sidebar">
          <div className="analysis-sidebar__header">
            <h3 className="analysis-sidebar__title">
              {analysisPanelCollapsed ? 'Analysis' : 'Chord & Scale Analysis'}
            </h3>
            <button 
              onClick={toggleAnalysisPanel}
              className="analysis-sidebar__toggle"
              title={analysisPanelCollapsed ? 'Expand analysis panel' : 'Collapse analysis panel'}
            >
              {analysisPanelCollapsed ? '▶' : '◀'}
            </button>
          </div>

          <div className="analysis-sidebar__content">
            <ChordAnalyzer 
              onSwitchToFinder={handleSwitchToFinderWithHighlight}
              showDebugInfo={showDebugInfo}
              compact={true}
              onAnalysisStateChange={handleAnalysisStateChange}
            />
          </div>
        </div>

        {/* Main Scale Tables Area */}
        <div className="scale-main-area">
          <ScaleFinder 
            initialHighlightId={highlightIdForFinder}
            embedded={true}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedMusicTool;
