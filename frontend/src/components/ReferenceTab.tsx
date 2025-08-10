import React, { useState, useCallback, useEffect } from 'react';
import ScaleFinder from './ScaleFinder';
import IntegratedMusicSidebar from './IntegratedMusicSidebar';
import { UnifiedResultsState } from './UnifiedResultsPanel';
import { sharedScaleTablesService, SharedScaleTablesService, ScaleHighlight } from '../services/SharedScaleTablesService';
import '../styles/components/IntegratedMusicSidebar.css';

interface ReferenceTabProps {
  highlightId?: string | null;
  showDebugInfo?: boolean;
  onShowUnifiedResults?: (results: any, historyId?: string) => void;
  midiData?: {
    playedNotes: any[];
    playedPitchClasses: Set<number>;
    detectionEnabled: boolean;  // Consolidated toggle for detection
    setDetectionEnabled: (enabled: boolean) => void;
    analysisFocus: 'automatic' | 'complete' | 'pentatonic' | 'chord';  // Analysis focus dropdown
    setAnalysisFocus: (focus: 'automatic' | 'complete' | 'pentatonic' | 'chord') => void;
    clearPlayedNotes: () => void;
    forceCleanup?: () => void;
    resetMidiConnection?: () => Promise<void>;
  };
  // Unified Results Panel integration
  unifiedResults?: UnifiedResultsState;
  onSwitchToReference?: (highlightId?: string) => void;
  onSwitchToReferenceWithHighlight?: (mode: string, tonic: string) => void;
  onReturnToInput?: (userInputs: any) => void;
  onDismissAnalysisPanel?: () => void;
}

const ReferenceTab: React.FC<ReferenceTabProps> = ({
  highlightId,
  showDebugInfo = false,
  onShowUnifiedResults,
  midiData,
  unifiedResults,
  onSwitchToReference,
  onSwitchToReferenceWithHighlight,
  onReturnToInput,
  onDismissAnalysisPanel
}) => {
  const [midiHighlightId, setMidiHighlightId] = useState<string | null>(null);
  const [scaleService] = useState(() => sharedScaleTablesService);

  // Handle cross-navigation from other tabs
  useEffect(() => {
    if (onSwitchToReferenceWithHighlight) {
      // Register for cross-navigation callbacks
      const handleCrossNavigation = (mode: string, tonic: string) => {
        const highlight = scaleService.navigateFromAnalysis({
          sourceTab: 'harmony',
          targetMode: mode,
          targetTonic: tonic
        });

        if (highlight) {
          setMidiHighlightId(highlight.cellId);
        }
      };

      // This would be called by other components via props
      // The actual implementation is handled through the existing prop system
    }
  }, [onSwitchToReferenceWithHighlight, scaleService]);

  // Callback to handle scale highlighting from MIDI detection
  const handleScaleHighlight = useCallback((scaleId: string | null) => {
    setMidiHighlightId(scaleId);

    // Update shared service with MIDI highlight
    if (scaleId) {
      const highlight: ScaleHighlight = {
        cellId: scaleId,
        reason: 'midi',
        temporary: true,
        duration: 5000 // 5 second highlight from MIDI
      };
      scaleService.setHighlight(highlight);
    }
  }, [scaleService]);

  // Note: Melody mode updates are now handled by IntegratedMusicSidebar
  // The sidebar component registers callbacks with keySuggester and handles
  // melody suggestions directly, eliminating the need for modal overlays

  // Get quick reference data from shared service
  const getQuickReferenceData = useCallback(() => {
    const scaleFamilies = scaleService.getAvailableScaleFamilies();
    return [
      {
        category: 'Major Scale Modes',
        modes: scaleFamilies.includes('Major Scale') ?
          scaleService.findScalesByRoot('C').filter(scale => scale.scaleFamily === 'Major Scale')
            .map(scale => ({
              name: `${scale.name} (${scale.rootNoteName})`,
              formula: scale.formula,
              character: scale.character || 'Musical character'
            })) : []
      },
      {
        category: 'Common Alternative Scales',
        modes: [
          { name: 'Harmonic Minor', formula: '1 2 ♭3 4 5 ♭6 7', character: 'Classical, exotic' },
          { name: 'Melodic Minor', formula: '1 2 ♭3 4 5 6 7', character: 'Jazz, sophisticated' },
          { name: 'Pentatonic Major', formula: '1 2 3 5 6', character: 'Simple, universal' },
          { name: 'Pentatonic Minor', formula: '1 ♭3 4 5 ♭7', character: 'Blues, rock' },
          { name: 'Blues Scale', formula: '1 ♭3 4 ♭5 5 ♭7', character: 'Blues, expressive' },
        ]
      }
    ];
  }, [scaleService]);

  const quickReference = getQuickReferenceData();

  return (
    <div className="reference-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Scale Tables & Reference</h2>
        <p className="tab-header__subtitle">
          Comprehensive reference for scales, modes, and their properties
        </p>
      </div>

      {/* Integrated Music Sidebar */}
      <IntegratedMusicSidebar
        onScaleHighlight={handleScaleHighlight}
        midiData={midiData}
        unifiedResults={unifiedResults}
        onSwitchToReference={onSwitchToReference}
        onSwitchToReferenceWithHighlight={onSwitchToReferenceWithHighlight}
        onReturnToInput={onReturnToInput}
        onDismissAnalysisPanel={onDismissAnalysisPanel}
      />

      <div className="reference-content">
        <div className="quick-reference">
          <h3 className="quick-reference__title">Quick Reference</h3>

          {quickReference.map((section) => (
            <div key={section.category} className="reference-section">
              <h4 className="reference-section__title">{section.category}</h4>
              <div className="reference-grid">
                {section.modes.map((mode) => (
                  <div key={mode.name} className="reference-card">
                    <h5 className="reference-card__name">{mode.name}</h5>
                    <p className="reference-card__formula">{mode.formula}</p>
                    <p className="reference-card__character">{mode.character}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="scale-tables-section">
          <h3 className="scale-tables__title">Interactive Scale Tables</h3>
          <p className="scale-tables__description">
            Explore detailed scale tables with MIDI playback and note highlighting.
          </p>

          <div className="scale-finder-container">
            <ScaleFinder
              initialHighlightId={midiHighlightId || highlightId || null}
              embedded={true}
              showDebugInfo={showDebugInfo}
              onShowUnifiedResults={onShowUnifiedResults}
              playedNotes={midiData?.playedNotes || []}
              playedPitchClasses={midiData?.playedPitchClasses || new Set()}
              detectionEnabled={midiData?.detectionEnabled ?? true}
              analysisFocus={midiData?.analysisFocus || 'automatic'}
              sharedService={scaleService}
            />
          </div>
        </div>
      </div>

      <div className="reference-footer">
        <div className="legend">
          <h4 className="legend__title">Legend</h4>
          <div className="legend__items">
            <div className="legend__item">
              <span className="legend__symbol">♭</span>
              <span className="legend__text">Flat (lower by semitone)</span>
            </div>
            <div className="legend__item">
              <span className="legend__symbol">#</span>
              <span className="legend__text">Sharp (raise by semitone)</span>
            </div>
            <div className="legend__item">
              <span className="legend__symbol">1 2 3...</span>
              <span className="legend__text">Scale degrees from root note</span>
            </div>
          </div>
        </div>

        <div className="tips">
          <h4 className="tips__title">Tips</h4>
          <ul className="tips__list">
            <li>Click on any scale in the tables to hear it played</li>
            <li>Use MIDI input to play scales directly</li>
            <li>Compare modes by switching between different root notes</li>
            <li>Look for highlighted scales when navigating from other tabs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferenceTab;
