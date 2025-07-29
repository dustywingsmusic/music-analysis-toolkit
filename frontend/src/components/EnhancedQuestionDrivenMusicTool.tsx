/**
 * Enhanced Question Driven Music Tool
 * Implements the Music Theory Integration Roadmap Phase 1
 * Integrates unified analysis context with cross-feature navigation
 */

import React, { useCallback, useEffect, useState } from 'react';
import NavigationTabs, { TabType } from './NavigationTabs';
import ModeIdentificationTab, { IdentificationMethod } from './ModeIdentificationTab';
import ModeDiscoveryTab from './ModeDiscoveryTab';
import EnhancedHarmonyTab from './EnhancedHarmonyTab';
import ReferenceTab from './ReferenceTab';
import ChordAnalyzer from './ChordAnalyzer';
import { analyzeHarmony, analyzeMusic, discoverModes, getSongExamples } from '@/services/geminiService';
import { buildModesFromRoot, isValidRootNote, ModeFromRoot } from '@/services/scaleDataService';
import { allScaleData, NOTES, PARENT_KEY_INDICES } from '@/constants/scales';
import { generateHighlightId as generateHighlightIdFromMappings, getScaleFamilyFromMode } from '../constants/mappings';
import MappingDebugger from './MappingDebugger';
import { useUnifiedResults } from "@/hooks/useUnifiedResults";
import UnifiedResultsPanel from "@/components/UnifiedResultsPanel";
import MidiSettingsPanel from './MidiSettingsPanel';
import { useMidi } from '@/hooks/useMidi';
import { logger } from '@/utils/logger';
import { trackInteraction } from '../utils/tracking';
import { AnalysisProvider, useAnalysis, useAnalysisActions } from '../contexts/AnalysisContext';

interface EnhancedQuestionDrivenMusicToolProps {
  showDebugInfo: boolean;
}

const EnhancedQuestionDrivenMusicToolContent: React.FC<EnhancedQuestionDrivenMusicToolProps> = ({ showDebugInfo }) => {
  const [highlightIdForReference, setHighlightIdForReference] = useState<string | null>(null);

  // Use unified analysis context
  const { state } = useAnalysis();
  const { navigateToReference, completeLocalAnalysis } = useAnalysisActions();

  // Legacy unified results hook (will be phased out)
  const {
    unifiedResults,
    setUnifiedResults,
    showUnifiedResults,
    dismissAnalysisPanel,
    updateDisplayPosition
  } = useUnifiedResults(state.activeTab);

  // MIDI integration
  const midiState = useMidi();

  // Update active tab in context when local state changes
  const handleTabChange = (tab: TabType) => {
    trackInteraction(`Tab Navigation - ${tab}`, 'Navigation');
  };

  // Enhanced switch to reference with highlight - integrates with analysis context
  const handleSwitchToReferenceWithHighlight = useCallback((mode: string, tonic: string, context?: string) => {
    console.log(`🎯 Enhanced navigation to reference: ${mode} ${tonic} (context: ${context})`);
    
    // Use analysis context for navigation
    navigateToReference(mode, tonic, context || 'cross_feature_navigation');
    
    // Legacy highlight system (will be replaced)
    const scaleFamily = getScaleFamilyFromMode(mode);
    if (scaleFamily) {
      const highlightId = generateHighlightIdFromMappings(mode, tonic, scaleFamily);
      setHighlightIdForReference(highlightId);
      console.log(`Generated highlight ID: ${highlightId}`);
    }

    trackInteraction('Enhanced Cross-Feature Navigation', 'Navigation', {
      fromContext: context,
      targetMode: mode,
      targetTonic: tonic
    });
  }, [navigateToReference]);

  // Legacy analysis handlers (will be gradually replaced by context-based analysis)
  const handleModeIdentificationRequest = async (method: IdentificationMethod, data: any) => {
    console.log(`🎼 Mode identification request: ${method}`, data);
    trackInteraction(`Mode Identification - ${method}`, 'Analysis');

    try {
      const result = await analyzeMusic(method, data);
      setUnifiedResults({
        method,
        data,
        result,
        timestamp: Date.now(),
        type: 'identification'
      });
    } catch (error) {
      console.error('Mode identification failed:', error);
    }
  };

  const handleModeDiscoveryRequest = async (method: string, data: any) => {
    console.log(`🔍 Mode discovery request: ${method}`, data);
    trackInteraction(`Mode Discovery - ${method}`, 'Analysis');

    if (method === 'root') {
      // Local analysis for root-based discovery
      if (!isValidRootNote(data.rootNote)) {
        console.error('Invalid root note:', data.rootNote);
        return;
      }

      try {
        const localModes: ModeFromRoot[] = buildModesFromRoot(data.rootNote);
        setUnifiedResults({
          method,
          data,
          result: { modes: localModes },
          timestamp: Date.now(),
          type: 'discovery',
          isLocal: true
        });
      } catch (error) {
        console.error('Local mode discovery failed:', error);
      }
    } else {
      // AI-enhanced discovery for other methods
      try {
        const result = await discoverModes(method, data);
        setUnifiedResults({
          method,
          data,
          result,
          timestamp: Date.now(),
          type: 'discovery'
        });
      } catch (error) {
        console.error('Mode discovery failed:', error);
      }
    }
  };

  // Legacy harmony handler - now redirects to enhanced analysis
  const handleHarmonyRequest = async (method: string, data: any) => {
    console.log(`🎵 Harmony request (legacy): ${method}`, data);
    
    // For chord progression analysis, the EnhancedHarmonyTab handles this directly
    // Other methods still use legacy approach
    if (method !== 'progression') {
      trackInteraction(`Harmony Analysis - ${method}`, 'Analysis');
      
      try {
        const result = await analyzeHarmony(method, data);
        setUnifiedResults({
          method,
          data,
          result,
          timestamp: Date.now(),
          type: 'harmony'
        });
      } catch (error) {
        console.error('Harmony analysis failed:', error);
      }
    }
  };

  const handleChordAnalyzerRequest = async (method: string, data: any) => {
    console.log(`🎹 Chord analyzer request: ${method}`, data);
    trackInteraction(`Chord Analyzer - ${method}`, 'Analysis');

    try {
      const result = await analyzeHarmony(method, data);
      setUnifiedResults({
        method,
        data,
        result,
        timestamp: Date.now(),
        type: 'chord_analyzer'
      });
    } catch (error) {
      console.error('Chord analyzer failed:', error);
    }
  };

  const handleSongExamplesRequest = async () => {
    if (!unifiedResults) return;
    
    console.log('🎵 Requesting song examples for current results');
    trackInteraction('Song Examples Request', 'Enhancement');

    try {
      const examples = await getSongExamples(unifiedResults);
      setUnifiedResults({
        ...unifiedResults,
        songExamples: examples,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Song examples request failed:', error);
    }
  };

  // Handle pending navigation from analysis context
  useEffect(() => {
    if (state.pendingNavigation) {
      const { targetTab, targetMode, targetTonic } = state.pendingNavigation;
      
      if (targetTab === 'reference' && targetMode && targetTonic) {
        handleSwitchToReferenceWithHighlight(targetMode, targetTonic, 'context_navigation');
      }
    }
  }, [state.pendingNavigation, handleSwitchToReferenceWithHighlight]);

  const renderActiveTab = () => {
    switch (state.activeTab) {
      case 'identify':
        return (
          <ModeIdentificationTab
            onIdentificationRequest={handleModeIdentificationRequest}
            hasResults={!!unifiedResults}
            isLoading={false}
            onSwitchToReferenceWithHighlight={handleSwitchToReferenceWithHighlight}
          />
        );
      case 'discover':
        return (
          <ModeDiscoveryTab
            onDiscoveryRequest={handleModeDiscoveryRequest}
            hasResults={!!unifiedResults}
            isLoading={false}
            onSwitchToReferenceWithHighlight={handleSwitchToReferenceWithHighlight}
          />
        );
      case 'harmony':
        return (
          <EnhancedHarmonyTab
            hasResults={!!state.currentAnalysis}
            onSwitchToReferenceWithHighlight={handleSwitchToReferenceWithHighlight}
          />
        );
      case 'reference':
        return (
          <ReferenceTab
            highlightId={highlightIdForReference}
            onClearHighlight={() => setHighlightIdForReference(null)}
            midiState={midiState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="enhanced-question-driven-music-tool">
      <NavigationTabs
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
      />

      <div className="tab-content">
        {renderActiveTab()}
      </div>

      {/* Enhanced Chord Analyzer - can be used across tabs */}
      <ChordAnalyzer
        onChordAnalysisRequest={handleChordAnalyzerRequest}
        onSwitchToReferenceWithHighlight={handleSwitchToReferenceWithHighlight}
      />

      {/* Legacy Unified Results Panel - will be replaced by context-based results */}
      {showUnifiedResults && (
        <UnifiedResultsPanel
          results={unifiedResults}
          onDismiss={dismissAnalysisPanel}
          onSongExamplesRequest={handleSongExamplesRequest}
          onSwitchToReferenceWithHighlight={handleSwitchToReferenceWithHighlight}
          onUpdateDisplayPosition={updateDisplayPosition}
        />
      )}

      {/* MIDI Settings Panel */}
      <MidiSettingsPanel midiState={midiState} />

      {/* Debug Information */}
      {showDebugInfo && (
        <div className="debug-panel">
          <h3>Enhanced Debug Information</h3>
          <div className="debug-section">
            <h4>Analysis Context State:</h4>
            <pre>{JSON.stringify(state, null, 2)}</pre>
          </div>
          <div className="debug-section">
            <h4>Legacy Results:</h4>
            <pre>{JSON.stringify(unifiedResults, null, 2)}</pre>
          </div>
          <MappingDebugger />
        </div>
      )}
    </div>
  );
};

// Main component with context provider
const EnhancedQuestionDrivenMusicTool: React.FC<EnhancedQuestionDrivenMusicToolProps> = (props) => {
  return (
    <AnalysisProvider>
      <EnhancedQuestionDrivenMusicToolContent {...props} />
    </AnalysisProvider>
  );
};

export default EnhancedQuestionDrivenMusicTool;