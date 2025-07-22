import { useState, useEffect, useCallback } from 'react';
import type { MidiDevice, NotePlayed } from '../types';

declare const WebMidi: any;

export const useMidi = (
  onChordDetected?: (noteNumbers: number[]) => void,
  onMelodyUpdate?: (pitchClasses: Set<number>) => void
) => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [playedNotes, setPlayedNotes] = useState<NotePlayed[]>([]);
  const [playedPitchClasses, setPlayedPitchClasses] = useState<Set<number>>(new Set());
  const [detectionEnabled, setDetectionEnabled] = useState<boolean>(true);
  const [analysisFocus, setAnalysisFocus] = useState<'automatic' | 'complete' | 'pentatonic' | 'chord'>('automatic');
  const [chordDetectionTimeout, setChordDetectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);

  const refreshDevices = useCallback(() => {
    if (typeof WebMidi !== 'undefined' && WebMidi.enabled) {
      const inputs = WebMidi.inputs.map((input: any) => ({
        id: input.id,
        name: input.name,
      }));
      setDevices(inputs);
      if (inputs.length > 0 && !selectedDevice) {
        setSelectedDevice(inputs[0].id);
      }
    }
  }, [selectedDevice]);

  const handleNoteOn = useCallback((e: any) => {
    const noteNumber = e.note.number;
    const pitchClass = noteNumber % 12;
    const newNote: NotePlayed = { 
        number: noteNumber, 
        name: e.note.name,
        accidental: e.note.accidental,
        octave: e.note.octave 
    };

    console.log('MIDI key pressed:', {
      noteNumber,
      noteName: e.note.name,
      pitchClass,
      detectionEnabled,
      analysisFocus,
      octave: e.note.octave
    });

    if (analysisFocus === 'chord') {
      // Clear any pending timeout to extend the chord entry window
      if (chordDetectionTimeout) {
        clearTimeout(chordDetectionTimeout);
      } else {
        // If there's no pending timeout, this is the first note of a new chord
        setPlayedNotes([]);
        setPlayedPitchClasses(new Set());
      }

      // Add note if pitch class not already present
      setPlayedNotes(prev => {
        const existingPitchClasses = new Set(prev.map(n => n.number % 12));
        if (existingPitchClasses.has(pitchClass)) return prev;
        return [...prev, newNote];
      });

      setPlayedPitchClasses(prev => {
        const newSet = new Set(prev);
        newSet.add(pitchClass);
        return newSet;
      });

      // Set timeout for chord analysis
      const timeout = setTimeout(() => {
        // Timeout completed - chord is ready for analysis
        // Get the current notes from state to avoid stale closure
        setPlayedNotes(currentNotes => {
          // Get the note numbers from the current played notes
          const noteNumbers = currentNotes.map(note => note.number);

          // Call the onChordDetected callback if provided
          if (onChordDetected && noteNumbers.length >= 3) {
            onChordDetected(noteNumbers);
          }

          return currentNotes; // Return unchanged to avoid re-render
        });

        setChordDetectionTimeout(null);
      }, 200); // Default chord detection timeout (200ms)

      setChordDetectionTimeout(timeout);
    } else {
      // For melody and scale modes
      setPlayedNotes(prev => {
        const existingPitchClasses = new Set(prev.map(n => n.number % 12));
        if (existingPitchClasses.has(pitchClass)) return prev;
        return [...prev, newNote];
      });

      setPlayedPitchClasses(prev => {
        const newSet = new Set(prev);
        newSet.add(pitchClass);

        // If detection enabled and not in chord mode, call the onMelodyUpdate callback
        if (detectionEnabled && analysisFocus !== 'chord' && onMelodyUpdate) {
          // We need to create a new set with the updated pitch class
          const updatedSet = new Set(newSet);
          console.log('Calling onMelodyUpdate with pitch classes:', Array.from(updatedSet));
          onMelodyUpdate(updatedSet);
        } else if (detectionEnabled && analysisFocus !== 'chord') {
          console.log('Melody analysis enabled but no onMelodyUpdate callback provided');
        }

        return newSet;
      });
    }
  }, [detectionEnabled, analysisFocus, chordDetectionTimeout, onChordDetected, onMelodyUpdate]);

  const clearPlayedNotes = useCallback(() => {
    setPlayedNotes([]);
    setPlayedPitchClasses(new Set());
    if (chordDetectionTimeout) {
      clearTimeout(chordDetectionTimeout);
      setChordDetectionTimeout(null);
    }
  }, [chordDetectionTimeout]);

  const enableMidi = useCallback(() => {
    setEnabled(true);
  }, []);

  const disableMidi = useCallback(() => {
    setEnabled(false);
    // Clear played notes when disabling
    clearPlayedNotes();
    // Remove listeners from current device
    if (typeof WebMidi !== 'undefined' && WebMidi.enabled && selectedDevice) {
      const input = WebMidi.getInputById(selectedDevice);
      if (input) {
        input.removeListener('noteon', handleNoteOn);
      }
    }
    setStatus('Disabled');
  }, [clearPlayedNotes, selectedDevice, handleNoteOn]);

  // Effect to enable WebMidi
  useEffect(() => {
    if (!enabled) {
      setStatus('Disabled');
      return;
    }

    if (typeof WebMidi === 'undefined') {
      setError("WebMidi.js library not found.");
      setStatus("Error");
      return;
    }

    if (!WebMidi.enabled) {
      WebMidi.enable({ sysex: false })
        .then(() => {
          setStatus('Enabled');
          setError(null);
          refreshDevices();
          WebMidi.addListener('connected', refreshDevices);
          WebMidi.addListener('disconnected', refreshDevices);
        })
        .catch((err: Error) => {
          setError(`MIDI Error: ${err.message}`);
          setStatus('Error');
        });
    } else if (enabled) {
      // WebMidi is already enabled, just refresh devices and set status
      setStatus('Enabled');
      setError(null);
      refreshDevices();
    }

    return () => {
        if (typeof WebMidi !== 'undefined' && WebMidi.enabled) {
            WebMidi.removeListener('connected', refreshDevices);
            WebMidi.removeListener('disconnected', refreshDevices);
        }
    }
  }, [refreshDevices, enabled]);

  // Effect to handle device selection and listeners
  useEffect(() => {
    if (!enabled || typeof WebMidi === 'undefined' || !WebMidi.enabled || !selectedDevice) {
      return;
    }

    const input = WebMidi.getInputById(selectedDevice);
    if (input) {
      input.addListener('noteon', handleNoteOn);
      setStatus(`Listening on: ${input.name}`);
    }

    return () => {
      if (input) {
        input.removeListener('noteon', handleNoteOn);
      }
    };
  }, [selectedDevice, handleNoteOn, enabled]);

  return {
    status,
    devices,
    selectedDevice,
    setSelectedDevice,
    playedNotes,
    playedPitchClasses,
    detectionEnabled,
    setDetectionEnabled,
    analysisFocus,
    setAnalysisFocus,
    clearPlayedNotes,
    error,
    enabled,
    enableMidi,
    disableMidi,
  };
};
