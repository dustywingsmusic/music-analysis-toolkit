/**
 * Enhanced Mode Identification Tab using UnifiedMusicInput
 * 
 * This is an example of how to integrate the UnifiedMusicInput component
 * into the existing ModeIdentificationTab workflow.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import UnifiedMusicInput, { InputType } from './ui/unified-music-input';
import { ChordMatch } from '../services/chordLogic';
import { NotePlayed } from '../types';
import { useMidi } from '../hooks/useMidi';
import { logger } from '../utils/logger';
import { trackInteraction } from '../utils/tracking';

export type IdentificationMethod = 'melody' | 'scale' | 'progression' | 'audio';

interface ModeIdentificationTabEnhancedProps {
  onAnalysisRequest: (method: IdentificationMethod, data: any) => void;
  hasResults?: boolean;
  isLoading?: boolean;
  initialMethod?: IdentificationMethod;
  initialMelodyNotes?: string;
  initialScaleNotes?: string;
  initialProgression?: string;
  // Enhanced MIDI support
  midiData?: {
    playedNotes: NotePlayed[];
    playedPitchClasses: Set<number>;
    isActive: boolean;
    status: string;
    clearPlayedNotes: () => void;
    analysisFocus: 'automatic' | 'complete' | 'pentatonic' | 'chord';
    setAnalysisFocus: (focus: 'automatic' | 'complete' | 'pentatonic' | 'chord') => void;
  };
}

const ModeIdentificationTabEnhanced: React.FC<ModeIdentificationTabEnhancedProps> = ({ 
  onAnalysisRequest, 
  hasResults = false,
  isLoading = false,
  initialMethod,
  initialMelodyNotes,
  initialScaleNotes,
  initialProgression,
  midiData
}) => {
  const [activeMethod, setActiveMethod] = useState<IdentificationMethod>(initialMethod || 'melody');
  const [melodyNotes, setMelodyNotes] = useState<string>(initialMelodyNotes || '');
  const [scaleNotes, setScaleNotes] = useState<string>(initialScaleNotes || '');
  const [progression, setProgression] = useState<string>(initialProgression || '');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [detectedChords, setDetectedChords] = useState<ChordMatch[]>([]);

  // Update state when props change (for "Return to Input" functionality)
  useEffect(() => {
    if (initialMethod !== undefined) setActiveMethod(initialMethod);
    if (initialMelodyNotes !== undefined) setMelodyNotes(initialMelodyNotes);
    if (initialScaleNotes !== undefined) setScaleNotes(initialScaleNotes);
    if (initialProgression !== undefined) setProgression(initialProgression);
  }, [initialMethod, initialMelodyNotes, initialScaleNotes, initialProgression]);

  const methods = [
    { 
      id: 'melody' as IdentificationMethod, 
      label: 'Melody Analysis', 
      description: 'Analyze a melodic sequence to identify its mode',
      icon: '🎵'
    },
    { 
      id: 'scale' as IdentificationMethod, 
      label: 'Scale Analysis', 
      description: 'Identify mode from a collection of notes',
      icon: '🎶'
    },
    { 
      id: 'progression' as IdentificationMethod, 
      label: 'Chord Progression', 
      description: 'Determine mode from chord progression',
      icon: '🎼'
    },
    { 
      id: 'audio' as IdentificationMethod, 
      label: 'Audio Analysis', 
      description: 'Analyze audio input (coming soon)',
      icon: '🎤',
      disabled: true
    },
  ];

  // Get current input value and setter based on active method
  const getCurrentInput = () => {
    switch (activeMethod) {
      case 'melody': return melodyNotes;
      case 'scale': return scaleNotes;
      case 'progression': return progression;
      default: return '';
    }
  };

  const getCurrentSetter = () => {
    switch (activeMethod) {
      case 'melody': return setMelodyNotes;
      case 'scale': return setScaleNotes;
      case 'progression': return setProgression;
      default: return () => {};
    }
  };

  // Validation handler
  const handleValidation = useCallback((isValid: boolean, suggestions?: string[]) => {
    setValidationErrors(suggestions || []);
  }, []);

  // Chord detection handler
  const handleChordDetected = useCallback((chords: ChordMatch[]) => {
    setDetectedChords(chords);
    console.log('Chords detected:', chords);
  }, []);

  // Notes changed handler for additional analysis
  const handleNotesChanged = useCallback((notes: string[], pitchClasses: number[]) => {
    console.log('Notes changed:', notes, pitchClasses);
  }, []);

  // Submit analysis
  const handleSubmitAnalysis = () => {
    const currentInput = getCurrentInput();
    if (!currentInput.trim()) return;

    logger.webClick('Enhanced Mode Identification - Submit Analysis', {
      component: 'ModeIdentificationTabEnhanced',
      method: activeMethod,
      inputLength: currentInput.length,
      hasValidationErrors: validationErrors.length > 0
    });

    trackInteraction(`Mode Analysis - ${activeMethod}`, 'Analysis');

    // Prepare data based on method
    let analysisData;
    switch (activeMethod) {
      case 'melody':
        analysisData = { notes: currentInput };
        break;
      case 'scale':
        analysisData = { notes: currentInput };
        break;
      case 'progression':
        analysisData = { chords: currentInput };
        break;
      default:
        analysisData = { input: currentInput };
    }

    onAnalysisRequest(activeMethod, analysisData);
  };

  // Convert method to InputType
  const getInputType = (method: IdentificationMethod): InputType => {
    switch (method) {
      case 'melody': return 'melody';
      case 'scale': return 'scale';
      case 'progression': return 'progression';
      default: return 'melody';
    }
  };

  const currentInput = getCurrentInput();
  const currentSetter = getCurrentSetter();
  const inputType = getInputType(activeMethod);
  const isSubmitDisabled = !currentInput.trim() || validationErrors.length > 0 || isLoading;

  return (
    <div className="mode-identification-tab-enhanced space-y-6">
      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Analysis Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {methods.map((method) => (
              <Button
                key={method.id}
                variant={activeMethod === method.id ? "default" : "outline"}
                onClick={() => !method.disabled && setActiveMethod(method.id)}
                disabled={method.disabled}
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
              >
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <div className="font-medium">{method.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {method.description}
                  </div>
                </div>
                {method.disabled && (
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {methods.find(m => m.id === activeMethod)?.icon}
            {methods.find(m => m.id === activeMethod)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMethod !== 'audio' ? (
            <>
              <UnifiedMusicInput
                value={currentInput}
                onChange={currentSetter}
                label={`Enter ${activeMethod === 'progression' ? 'chord progression' : `${activeMethod} notes`}`}
                inputType={inputType}
                midiData={midiData}
                onValidation={handleValidation}
                onChordDetected={handleChordDetected}
                onNotesChanged={handleNotesChanged}
                enableChordRecognition={activeMethod === 'scale' || activeMethod === 'progression'}
                showSuggestions
                className="w-full"
              />

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="text-sm font-medium text-destructive mb-2">
                    Input Issues:
                  </div>
                  <ul className="text-sm text-destructive/80 space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detected Chords Display */}
              {detectedChords.length > 0 && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="text-sm font-medium text-primary mb-2">
                    Detected Chords:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedChords.slice(0, 4).map((chord, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {chord.chordSymbol}
                        <span className="ml-1 text-muted-foreground">
                          ({(chord.confidence * 100).toFixed(0)}%)
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSubmitAnalysis}
                  disabled={isSubmitDisabled}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      🔍 Analyze {activeMethod === 'progression' ? 'Progression' : 'Mode'}
                    </>
                  )}
                </Button>
                
                {hasResults && (
                  <Badge variant="secondary" className="text-xs">
                    Results available
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-4">🎤</div>
              <div className="font-medium mb-2">Audio Analysis</div>
              <div className="text-sm">Coming soon - analyze audio files and live input</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MIDI Status */}
      {midiData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MIDI Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={midiData.isActive ? "default" : "secondary"}>
                  {midiData.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Focus: {midiData.analysisFocus}
                </span>
              </div>
              
              {midiData.isActive && midiData.playedPitchClasses.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Live notes:</span>
                  <div className="flex gap-1">
                    {Array.from(midiData.playedPitchClasses).slice(0, 6).map(pc => (
                      <Badge key={pc} variant="outline" className="text-xs">
                        {/* Convert pitch class to note name */}
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][pc]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModeIdentificationTabEnhanced;