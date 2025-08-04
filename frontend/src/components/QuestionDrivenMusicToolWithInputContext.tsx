/**
 * QuestionDrivenMusicToolWithInputContext - Wrapper with Input Method Context
 * 
 * This wrapper component provides the InputMethodContext to the main QuestionDrivenMusicTool
 * and integrates the universal input settings system with MIDI state management.
 */

import React, { useEffect } from 'react';
import { InputMethodProvider, useInputMethod } from '../contexts/InputMethodContext';
import QuestionDrivenMusicTool from './QuestionDrivenMusicTool';
import InputSettingsPanel from './InputSettingsPanel';
import { useMidi } from '../hooks/useMidi';

interface QuestionDrivenMusicToolWithInputContextProps {
  showDebugInfo: boolean;
}

// Inner component that uses the input method context
const QuestionDrivenMusicToolInner: React.FC<QuestionDrivenMusicToolWithInputContextProps> = ({ 
  showDebugInfo 
}) => {
  const { 
    activeInputMethod, 
    setInputMethod, 
    updateMidiAvailability,
    midiAvailable,
    midiConnected 
  } = useInputMethod();

  // MIDI integration - placeholder handlers
  const handleChordDetected = React.useCallback((noteNumbers: number[]) => {
    console.log('Chord detected:', noteNumbers);
  }, []);

  const handleMelodyUpdate = React.useCallback((pitchClasses: Set<number>) => {
    console.log('Melody updated:', pitchClasses);
  }, []);

  // MIDI hook integration
  const {
    status: midiStatus,
    devices: midiDevices,
    selectedDevice: midiSelectedDevice,
    setSelectedDevice: setMidiSelectedDevice,
    playedNotes: midiPlayedNotes,
    playedPitchClasses: midiPlayedPitchClasses,
    detectionEnabled: midiDetectionEnabled,
    setDetectionEnabled: setMidiDetectionEnabled,
    analysisFocus: midiAnalysisFocus,
    setAnalysisFocus: setMidiAnalysisFocus,
    clearPlayedNotes: clearMidiPlayedNotes,
    error: midiError,
    enabled: midiEnabled,
    enableMidi,
    disableMidi,
    forceCleanup,
    resetMidiConnection,
  } = useMidi(handleChordDetected, handleMelodyUpdate);

  // Update input method context when MIDI availability changes
  useEffect(() => {
    const isAvailable = midiDevices.length > 0 && !midiError;
    const isConnected = midiEnabled && midiStatus.includes('Listening');
    
    updateMidiAvailability(isAvailable, isConnected);
  }, [midiDevices, midiError, midiEnabled, midiStatus, updateMidiAvailability]);

  // Auto-switch to MIDI when it becomes available and user prefers it
  useEffect(() => {
    if (activeInputMethod === 'midi' && !midiEnabled) {
      enableMidi();
    } else if (activeInputMethod !== 'midi' && midiEnabled && midiDevices.length === 0) {
      // Don't auto-disable MIDI if user switches away, let them control it
    }
  }, [activeInputMethod, midiEnabled, enableMidi, midiDevices.length]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}

      {/* Main Content - Render the original tool but with input context integration */}
      <QuestionDrivenMusicTool 
        showDebugInfo={showDebugInfo}
        // Pass through MIDI data for components that still need it directly
        midiData={{
          status: midiStatus,
          devices: midiDevices,
          selectedDevice: midiSelectedDevice,
          setSelectedDevice: setMidiSelectedDevice,
          playedNotes: midiPlayedNotes,
          playedPitchClasses: midiPlayedPitchClasses,
          detectionEnabled: midiDetectionEnabled,
          setDetectionEnabled: setMidiDetectionEnabled,
          analysisFocus: midiAnalysisFocus,
          setAnalysisFocus: setMidiAnalysisFocus,
          clearPlayedNotes: clearMidiPlayedNotes,
          error: midiError,
          enabled: midiEnabled,
          enableMidi,
          disableMidi,
          forceCleanup,
          resetMidiConnection,
        }}
      />
    </div>
  );
};

// Main wrapper component with provider
const QuestionDrivenMusicToolWithInputContext: React.FC<QuestionDrivenMusicToolWithInputContextProps> = (props) => {
  return (
    <InputMethodProvider>
      <QuestionDrivenMusicToolInner {...props} />
    </InputMethodProvider>
  );
};

export default QuestionDrivenMusicToolWithInputContext;