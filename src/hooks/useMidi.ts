import { useState, useEffect, useCallback } from 'react';
import type { MidiDevice, NotePlayed } from '../types';

declare const WebMidi: any;

export const useMidi = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [playedNotes, setPlayedNotes] = useState<NotePlayed[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    setPlayedNotes(prev => {
        const newNote: NotePlayed = { 
            number: e.note.number, 
            name: e.note.name,
            accidental: e.note.accidental,
            octave: e.note.octave 
        };
        // Avoid adding duplicate pitch classes
        const existingPitchClasses = new Set(prev.map(n => n.number % 12));
        if (existingPitchClasses.has(newNote.number % 12)) {
            return prev;
        }
        return [...prev, newNote];
    });
  }, []);

  const clearPlayedNotes = useCallback(() => {
    setPlayedNotes([]);
  }, []);

  // Effect to enable WebMidi
  useEffect(() => {
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
    }

    return () => {
        if (typeof WebMidi !== 'undefined' && WebMidi.enabled) {
            WebMidi.removeListener('connected', refreshDevices);
            WebMidi.removeListener('disconnected', refreshDevices);
        }
    }
  }, [refreshDevices]);

  // Effect to handle device selection and listeners
  useEffect(() => {
    if (typeof WebMidi === 'undefined' || !WebMidi.enabled || !selectedDevice) {
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
  }, [selectedDevice, handleNoteOn]);

  return {
    status,
    devices,
    selectedDevice,
    setSelectedDevice,
    playedNotes,
    clearPlayedNotes,
    error,
  };
};
