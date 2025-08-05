/**
 * UnifiedMusicInput Integration Demo
 * 
 * This component demonstrates how to integrate and use the UnifiedMusicInput component
 * across different contexts in the music theory application.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import UnifiedMusicInput, { InputType } from './ui/unified-music-input';
import { ChordMatch } from '../services/chordLogic';
import { NotePlayed } from '../types';
import { useMidi } from '../hooks/useMidi';

interface DemoState {
  melody: string;
  scale: string;
  chord: string;
  progression: string;
}

const UnifiedMusicInputDemo: React.FC = () => {
  const [inputs, setInputs] = useState<DemoState>({
    melody: '',
    scale: '',
    chord: '',
    progression: ''
  });

  const [validationStates, setValidationStates] = useState<Record<keyof DemoState, boolean>>({
    melody: true,
    scale: true,
    chord: true,
    progression: true
  });

  const [detectedChords, setDetectedChords] = useState<ChordMatch[]>([]);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);

  // MIDI integration
  const handleMidiChordDetected = useCallback((noteNumbers: number[]) => {
    console.log('MIDI chord detected:', noteNumbers);
  }, []);

  const handleMelodyUpdate = useCallback((pitchClasses: Set<number>) => {
    console.log('MIDI melody update:', Array.from(pitchClasses));
  }, []);

  const {
    status: midiStatus,
    devices: midiDevices,
    playedNotes: midiPlayedNotes,
    playedPitchClasses: midiPlayedPitchClasses,
    detectionEnabled: midiDetectionEnabled,
    setDetectionEnabled: setMidiDetectionEnabled,
    analysisFocus: midiAnalysisFocus,
    setAnalysisFocus: setMidiAnalysisFocus,
    clearPlayedNotes: clearMidiPlayedNotes,
    error: midiError,
    enabled: midiEnabled,
  } = useMidi(handleMidiChordDetected, handleMelodyUpdate);

  // Enhanced MIDI data for components
  const midiData = {
    playedNotes: midiPlayedNotes,
    playedPitchClasses: midiPlayedPitchClasses,
    isActive: midiEnabled && midiStatus.includes('Listening'),
    status: midiStatus,
    clearPlayedNotes: clearMidiPlayedNotes,
    analysisFocus: midiAnalysisFocus,
    setAnalysisFocus: setMidiAnalysisFocus,
  };

  // Input handlers
  const handleInputChange = (type: keyof DemoState, value: string) => {
    setInputs(prev => ({ ...prev, [type]: value }));
  };

  const handleValidation = (type: keyof DemoState) => (
    isValid: boolean, 
    suggestions?: string[]
  ) => {
    setValidationStates(prev => ({ ...prev, [type]: isValid }));
    if (suggestions && suggestions.length > 0) {
      setAnalysisResults(prev => [...prev, `${type}: ${suggestions.join(', ')}`]);
    }
  };

  const handleChordDetected = useCallback((chords: ChordMatch[]) => {
    setDetectedChords(chords);
    setAnalysisResults(prev => [
      ...prev,
      `Detected chords: ${chords.map(c => c.chordSymbol).join(', ')}`
    ]);
  }, []);

  const handleNotesChanged = useCallback((notes: string[], pitchClasses: number[]) => {
    setAnalysisResults(prev => [
      ...prev,
      `Notes changed: ${notes.join(' ')} (pitch classes: ${pitchClasses.join(', ')})`
    ]);
  }, []);

  const clearResults = () => {
    setAnalysisResults([]);
    setDetectedChords([]);
  };

  return (
    <div className="unified-music-input-demo space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎵 Unified Music Input System Demo
          </CardTitle>
          <CardDescription>
            Comprehensive input system supporting MIDI, mouse, and keyboard input for various musical contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* MIDI Status */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">MIDI Status:</span>
              <Badge variant={midiEnabled ? "default" : "secondary"}>
                {midiStatus}
              </Badge>
            </div>
            {midiDevices.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {midiDevices.length} device(s) available
              </div>
            )}
          </div>

          {/* Input Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Melody Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Melody Analysis</CardTitle>
                <CardDescription>
                  Enter a melody sequence - preserves note order and octaves
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedMusicInput
                  value={inputs.melody}
                  onChange={(value) => handleInputChange('melody', value)}
                  label="Melody Notes"
                  inputType="melody"
                  midiData={midiData}
                  onValidation={handleValidation('melody')}
                  onNotesChanged={handleNotesChanged}
                  showSuggestions
                />
              </CardContent>
            </Card>

            {/* Scale Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scale Analysis</CardTitle>
                <CardDescription>
                  Enter scale notes - removes duplicates by pitch class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedMusicInput
                  value={inputs.scale}
                  onChange={(value) => handleInputChange('scale', value)}
                  label="Scale Notes"
                  inputType="scale"
                  midiData={midiData}
                  onValidation={handleValidation('scale')}
                  onChordDetected={handleChordDetected}
                  enableChordRecognition
                  showSuggestions
                />
              </CardContent>
            </Card>

            {/* Chord Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chord Analysis</CardTitle>
                <CardDescription>
                  Enter single chord - supports chord detection from MIDI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedMusicInput
                  value={inputs.chord}
                  onChange={(value) => handleInputChange('chord', value)}
                  label="Chord Symbol"
                  inputType="chord"
                  midiData={midiData}
                  onValidation={handleValidation('chord')}
                  onChordDetected={handleChordDetected}
                  enableChordRecognition
                  showSuggestions
                />
              </CardContent>
            </Card>

            {/* Progression Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chord Progression</CardTitle>
                <CardDescription>
                  Enter chord sequence - supports both symbols and Roman numerals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedMusicInput
                  value={inputs.progression}
                  onChange={(value) => handleInputChange('progression', value)}
                  label="Chord Progression"
                  inputType="progression"
                  midiData={midiData}
                  onValidation={handleValidation('progression')}
                  showSuggestions
                />
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Analysis Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </div>

            {/* Detected Chords */}
            {detectedChords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detected Chords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {detectedChords.slice(0, 6).map((chord, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-mono font-semibold">{chord.chordSymbol}</div>
                        <div className="text-sm text-muted-foreground">{chord.chordName}</div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {(chord.confidence * 100).toFixed(1)}%
                        </div>
                        {chord.inversion && (
                          <div className="text-xs text-primary">{chord.inversion}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validation States */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(validationStates).map(([key, isValid]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
                    {key}
                  </Badge>
                  <span className="text-xs capitalize">
                    {isValid ? "Valid" : "Invalid"}
                  </span>
                </div>
              ))}
            </div>

            {/* Analysis Log */}
            {analysisResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {analysisResults.slice(-10).map((result, idx) => (
                      <div key={idx} className="text-xs p-2 bg-muted/50 rounded font-mono">
                        {result}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Current Values Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Input Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(inputs).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="text-sm font-medium capitalize">{key}:</div>
                    <div className="text-sm font-mono p-2 bg-muted/50 rounded">
                      {value || <span className="text-muted-foreground italic">empty</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integration Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Basic Usage:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Set inputType to match your analysis needs</li>
                    <li>• Enable MIDI integration with midiData prop</li>
                    <li>• Use validation callbacks for real-time feedback</li>
                    <li>• Enable chord recognition for harmonic analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Advanced Features:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Chord detection from note selections</li>
                    <li>• MIDI analysis focus modes</li>
                    <li>• Input history and suggestions</li>
                    <li>• Cross-input method synchronization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMusicInputDemo;