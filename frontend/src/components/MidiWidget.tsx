/**
 * MIDI Widget - Standalone Real-time Analysis Widget
 *
 * Chrome Plugin Ready Architecture:
 * - Self-contained analysis capabilities
 * - Minimal dependencies on main app state
 * - Compact UI optimized for small screen real estate
 * - Direct integration with shared scale tables
 * - Independent MIDI management
 *
 * Features:
 * - Real-time MIDI chord/scale detection
 * - Compact comprehensive analysis display
 * - Quick links to scale tables
 * - Plugin-ready modular design
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Settings, ExternalLink, Minimize2, Maximize2, Power, PowerOff } from 'lucide-react';
import { useMidi } from '../hooks/useMidi';
import { useCompactAnalysis, CompactAnalysisResult as CompactAnalysisHookResult } from '../hooks/useCompactAnalysis';
import { cn } from '../lib/utils';
import { NOTES } from '../constants/scales';
import MidiVisualizer from './ui/midi-visualizer';
import MiniResultsDisplay from './ui/mini-results-display';
import { sharedScaleTablesService } from '../services/SharedScaleTablesService';

interface MidiWidgetProps {
  // Widget state management
  isExpanded?: boolean;
  isDocked?: boolean;
  onToggleExpanded?: () => void;
  onToggleDocked?: () => void;

  // Navigation callbacks
  onNavigateToReference?: (highlightId?: string) => void;
  onNavigateToAnalysis?: (analysisData: any) => void;

  // Widget configuration
  showSettings?: boolean;
  compactMode?: boolean;
  className?: string;

  // Plugin mode (for Chrome extension compatibility)
  pluginMode?: boolean;
}

interface CompactAnalysisResult {
  detectedMode?: string;
  parentKey?: string;
  romanNumerals?: string[];
  confidence: number;
  chordFunction?: string;
  scaleTableId?: string;
  quickInsights: string[];
  timestamp: number;
}

export const MidiWidget: React.FC<MidiWidgetProps> = ({
  isExpanded = true,
  isDocked = false,
  onToggleExpanded,
  onToggleDocked,
  onNavigateToReference,
  onNavigateToAnalysis,
  showSettings = true,
  compactMode = false,
  className,
  pluginMode = false
}) => {
  // Widget state
  const [isActive, setIsActive] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<CompactAnalysisResult | null>(null);

  // Compact analysis hook
  const { analyzeQuickly, isAnalyzing, setIsAnalyzing, lastAnalysis } = useCompactAnalysis();

  // MIDI integration with analysis callbacks
  const handleChordDetected = useCallback((noteNumbers: number[]) => {
    if (!isActive) return;

    setIsAnalyzing(true);
    console.log('MIDI Widget - Chord detected:', noteNumbers);

    // Use compact analysis hook for quick results
    // This will be implemented separately as a lightweight version
    // of the comprehensive analysis engine
  }, [isActive]);

  const handleMelodyUpdate = useCallback((pitchClasses: Set<number>) => {
    if (!isActive) return;

    setIsAnalyzing(true);
    console.log('MIDI Widget - Melody updated:', Array.from(pitchClasses));

    // Trigger compact scale/mode analysis
  }, [isActive]);

  // MIDI hook integration
  const {
    status: midiStatus,
    devices: midiDevices,
    selectedDevice: midiSelectedDevice,
    setSelectedDevice: setMidiSelectedDevice,
    playedNotes,
    playedPitchClasses,
    detectionEnabled,
    setDetectionEnabled,
    analysisFocus,
    setAnalysisFocus,
    clearPlayedNotes,
    error: midiError,
    enabled: midiEnabled,
    enableMidi,
    disableMidi,
    resetMidiConnection,
  } = useMidi(handleChordDetected, handleMelodyUpdate);

  // Widget power toggle
  const toggleWidget = () => {
    setIsActive(!isActive);
    if (isActive) {
      clearPlayedNotes();
      setAnalysisResult(null);
    }
  };

  // Compact analysis based on current MIDI input
  useEffect(() => {
    if (!isActive || playedPitchClasses.size === 0) {
      setAnalysisResult(null);
      setIsAnalyzing(false);
      return;
    }

    // Debounce analysis to avoid excessive computation
    const analysisTimeout = setTimeout(() => {
      performCompactAnalysis();
    }, 300);

    return () => clearTimeout(analysisTimeout);
  }, [playedPitchClasses, isActive]);

  const performCompactAnalysis = useCallback(async () => {
    if (playedPitchClasses.size < 3) {
      return;
    }

    try {
      // Use the compact analysis hook
      const hookResult = await analyzeQuickly(playedPitchClasses);

      // Convert to widget-specific format
      const result: CompactAnalysisResult = {
        detectedMode: hookResult.detectedModes[0]?.name,
        parentKey: hookResult.detectedModes[0]?.parentKey,
        confidence: hookResult.confidence,
        chordFunction: hookResult.chordAnalysis?.function,
        scaleTableId: hookResult.detectedModes[0]?.scaleTableId,
        quickInsights: hookResult.quickInsights,
        timestamp: Date.now()
      };

      setAnalysisResult(result);
    } catch (error) {
      console.error('Compact analysis failed:', error);
    }
  }, [playedPitchClasses, analyzeQuickly]);


  // Navigate to full reference using shared scale tables service
  const handleNavigateToReference = () => {
    if (onNavigateToReference && analysisResult?.detectedMode && analysisResult?.parentKey) {
      // Use the shared scale tables service to find the appropriate scale
      const modeName = analysisResult.detectedMode;
      const rootNote = Array.from(playedPitchClasses).map(pc => NOTES[pc])[0]; // Use first played note as root

      if (modeName && rootNote) {
        const highlight = sharedScaleTablesService.navigateFromAnalysis({
          sourceTab: 'external',
          targetMode: modeName,
          targetTonic: rootNote
        });

        if (highlight) {
          onNavigateToReference(highlight.cellId);
        }
      }
    }
  };

  // Navigate to full analysis
  const handleNavigateToFullAnalysis = () => {
    if (onNavigateToAnalysis && analysisResult) {
      const analysisData = {
        chordProgression: Array.from(playedPitchClasses).map(pc => NOTES[pc]).join(' '),
        compactResult: analysisResult,
        midiSource: true
      };
      onNavigateToAnalysis(analysisData);
    }
  };

  // Render compact mode (minimal UI)
  if (compactMode) {
    return (
      <div className={cn("midi-widget-compact p-2 bg-card rounded-lg border", className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleWidget}
              className="h-6 w-6 p-0"
            >
              {isActive ? <Power className="h-3 w-3 text-green-500" /> : <PowerOff className="h-3 w-3" />}
            </Button>
            <span className="text-xs font-medium">MIDI</span>
          </div>
          {onToggleExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isActive && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              {playedPitchClasses.size > 0 ?
                Array.from(playedPitchClasses).map(pc => NOTES[pc]).join(' ') :
                'Play MIDI...'
              }
            </div>
            {analysisResult && (
              <div className="text-xs font-medium text-primary">
                {analysisResult.detectedMode}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full widget UI
  return (
    <Card className={cn("midi-widget w-80", className, !isActive && "opacity-60")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleWidget}
              className="h-6 w-6 p-0"
            >
              {isActive ? <Power className="h-4 w-4 text-green-500" /> : <PowerOff className="h-4 w-4" />}
            </Button>
            MIDI Widget
            {pluginMode && <Badge variant="outline" className="text-xs">Plugin</Badge>}
          </CardTitle>
          <div className="flex items-center gap-1">
            {onToggleExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            )}
            {showSettings && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* MIDI Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status:</span>
            <span className={cn(
              "font-medium",
              midiEnabled && midiStatus.includes('Listening') ? "text-green-600" : "text-muted-foreground"
            )}>
              {midiStatus}
            </span>
          </div>

          {midiError && (
            <div className="text-xs text-destructive bg-destructive/10 p-1 rounded">
              {midiError}
            </div>
          )}
        </div>

        <Separator />

        {/* MIDI Input Visualization */}
        {isActive && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Live Input</div>
            <MidiVisualizer
              playedNotes={playedNotes.map(note =>
                note.accidental ? `${note.name}${note.accidental}` : note.name
              )}
              isActive={midiEnabled && midiStatus.includes('Listening')}
              compact={true}
            />

            {playedPitchClasses.size > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(playedPitchClasses).map((pc, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {NOTES[pc]}
                  </Badge>
                ))}
              </div>
            )}

            {playedNotes.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearPlayedNotes}
                className="w-full h-6 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {isActive && analysisResult && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">Analysis</div>
                {isAnalyzing && (
                  <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>

              <MiniResultsDisplay
                result={{
                  detectedMode: analysisResult.detectedMode,
                  parentKey: analysisResult.parentKey,
                  chordFunction: analysisResult.chordFunction,
                  confidence: analysisResult.confidence,
                  quickInsights: analysisResult.quickInsights,
                  scaleTableId: analysisResult.scaleTableId,
                  processingTime: lastAnalysis?.processingTime
                }}
                onNavigateToReference={handleNavigateToReference}
                onNavigateToFullAnalysis={handleNavigateToFullAnalysis}
              />
            </div>
          </>
        )}

        {/* Analysis Focus Controls */}
        {isActive && midiEnabled && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Focus</div>
              <div className="grid grid-cols-3 gap-1">
                {(['automatic', 'chord', 'complete'] as const).map(focus => (
                  <Button
                    key={focus}
                    variant={analysisFocus === focus ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnalysisFocus(focus)}
                    className="h-6 text-xs"
                  >
                    {focus === 'automatic' ? 'Auto' : focus === 'chord' ? 'Chord' : 'Scale'}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MidiWidget;
