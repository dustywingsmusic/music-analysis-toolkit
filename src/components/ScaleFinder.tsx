import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMidi } from '../hooks/useMidi';
import { allScaleData, NOTES } from '../constants/scales';
import { ProcessedScale } from '../types';
import ScaleTable from './ScaleTable';
import PreferencesPanel from './PreferencesPanel';
import * as keySuggester from '../services/keySuggester';
import { findChordMatches } from '../services/chordLogic';

const setsAreEqual = (setA: Set<number>, setB: Set<number>) => {
    if (setA.size !== setB.size) return false;
    for (const a of setA) if (!setB.has(a)) return false;
    return true;
};

interface ScaleFinderProps {
  initialHighlightId: string | null;
  embedded?: boolean;
  showDebugInfo?: boolean;
}

const ScaleFinder: React.FC<ScaleFinderProps> = ({ initialHighlightId, embedded = false, showDebugInfo = false }) => {
  const [baseKey, setBaseKey] = useState<string>("C");
  const [keyMode, setKeyMode] = useState<'major' | 'minor'>('major');
  const [processedScales, setProcessedScales] = useState<ProcessedScale[]>([]);
  const [midiHighlightedCellId, setMidiHighlightedCellId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const midiStatusRef = useRef<HTMLDivElement>(null);
  const keySuggesterInitialized = useRef<boolean>(false);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<{
    notesEntered: number;
    pitchClasses: number[];
    noteNames: string[];
    detectionMode: string;
    shouldCheck: boolean;
    scalesToSearch: number;
    allMatches: Array<{
      id: string;
      rootNote: number;
      name?: string;
      pitchClasses: number[];
    }>;
    selectedMatch?: {
      id: string;
      rootNote: number;
      name?: string;
    };
    timestamp: number;
  } | null>(null);

  // Callback for chord detection
  const handleChordDetected = useCallback((noteNumbers: number[]) => {
    const detectedChords = findChordMatches(noteNumbers);
    if (detectedChords.length > 0) {
      keySuggester.updateChordSuggestions(detectedChords, baseKey, keyMode);
    }
  }, [baseKey, keyMode]);

  // Callback for melody mode
  const handleMelodyUpdate = useCallback((pitchClasses: Set<number>) => {
    keySuggester.updateMelodySuggestions(pitchClasses);
  }, []);

  const { 
    status, 
    devices, 
    selectedDevice, 
    setSelectedDevice, 
    playedNotes, 
    playedPitchClasses,
    mode: midiMode, 
    setMode: setMidiMode, 
    clearPlayedNotes, 
    error 
  } = useMidi(handleChordDetected, handleMelodyUpdate);

  // Wrapper for clearPlayedNotes that also hides popup and clears chord sequence
  const handleClearAll = useCallback(() => {
    clearPlayedNotes();
    keySuggester.hide();
    keySuggester.clearChordSequence();
  }, [clearPlayedNotes]);

  const highlightedCellId = initialHighlightId || midiHighlightedCellId;

  // Effect to scroll to the highlighted cell when it's set via props
  useEffect(() => {
    if (initialHighlightId) {
      const element = document.getElementById(initialHighlightId);
      if (element) {
        // A short timeout can help ensure the element is fully rendered before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }, 100);
      }
    }
  }, [initialHighlightId]);


  // Process scale data once on mount
  useEffect(() => {
    const PARENT_KEY_INDICES = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6];
    const newProcessedScales: ProcessedScale[] = [];

    allScaleData.forEach(data => {
      PARENT_KEY_INDICES.forEach((parentKeyIndex, keyRowIndex) => {
        data.parentScaleIntervals.forEach((modeStartInterval, modeIndex) => {
          const modeRootPitch = (parentKeyIndex + modeStartInterval) % 12;
          const modeTypeIntervals = data.modeIntervals[modeIndex];
          const pitchClasses = new Set(modeTypeIntervals.map(i => (modeRootPitch + i) % 12));
          const cellId = `${data.tableId}-${keyRowIndex}-${modeIndex}`;

          // Generate diatonic chords for major scale modes
          let diatonicChords;
          if (data.tableId === 'major-scale-modes' && data.isDiatonic) {
            const chordQualities = ["", "m", "m", "", "", "m", "°"]; // Major scale pattern
            const romanNumerals = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];

            // Adjust roman numerals and qualities based on mode
            const modeAdjustedRomanNumerals: string[] = [];
            const modeAdjustedQualities: string[] = [];

            for (let i = 0; i < 7; i++) {
              const chordIndex = (modeIndex + i) % 7;
              modeAdjustedRomanNumerals.push(romanNumerals[i]);
              modeAdjustedQualities.push(chordQualities[chordIndex]);
            }

            diatonicChords = modeAdjustedQualities.map((quality, i) => {
              const chordRoot = (modeRootPitch + modeTypeIntervals[i]) % 12;
              const noteName = NOTES[chordRoot];
              return {
                roman: modeAdjustedRomanNumerals[i],
                symbol: noteName + quality,
                quality: quality === "" ? "Major" : quality === "m" ? "Minor" : "Diminished",
              };
            });
          }

          newProcessedScales.push({ 
            id: cellId, 
            pitchClasses, 
            rootNote: modeRootPitch,
            name: data.commonNames ? data.commonNames[modeIndex] : undefined,
            diatonicChords
          });
        });
      });
    });
    setProcessedScales(newProcessedScales);
  }, []);

  // Effect to handle mode changes and reset
  useEffect(() => {
    handleClearAll();
    setMidiHighlightedCellId(null);
  }, [midiMode, handleClearAll]);

  // Effect to find scale match when notes change
  useEffect(() => {
    if (midiMode === 'melody' || midiMode === 'chord') return; // Melody and chord modes have different logic (implemented in Phase 2)

    const pitchClassArray = Array.from(playedPitchClasses).sort();
    const noteNames = playedNotes.map(n => NOTES[n.number % 12]);

    if (playedPitchClasses.size === 0) {
      setMidiHighlightedCellId(null);
      if (showDebugInfo) {
        setDebugInfo(null);
      }
      return;
    }

    const playedCount = playedPitchClasses.size;
    let shouldCheck = false;
    if (midiMode === '7' && playedCount === 7) shouldCheck = true;
    if (midiMode === '5' && (playedCount === 5 || playedCount === 6)) shouldCheck = true;

    const scalesToSearch = processedScales.filter(s => s.pitchClasses.size === playedPitchClasses.size);

    // Find all scales that contain the exact same pitch classes (all possible modes)
    const allMatches = scalesToSearch.filter(scale =>
      setsAreEqual(scale.pitchClasses, playedPitchClasses)
    );

    let selectedMatch = undefined;

    if (shouldCheck) {
      if (allMatches.length > 0) {
        // Prioritize the scale that starts with the first note played
        let preferredMatch = allMatches[0]; // fallback to first match

        if (playedNotes.length > 0) {
          // Get the first note played
          const firstNotePitchClass = playedNotes[0].number % 12;

          // Find a match that starts with this note
          const matchingScale = allMatches.find(scale => scale.rootNote === firstNotePitchClass);

          if (matchingScale) {
            preferredMatch = matchingScale;
          }
        }

        setMidiHighlightedCellId(preferredMatch.id);
        const element = document.getElementById(preferredMatch.id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        selectedMatch = {
          id: preferredMatch.id,
          rootNote: preferredMatch.rootNote,
          name: preferredMatch.name
        };
      } else {
        setMidiHighlightedCellId(null);
      }
    }

    // Update debug info if debugging is enabled
    if (showDebugInfo) {
      setDebugInfo({
        notesEntered: playedCount,
        pitchClasses: pitchClassArray,
        noteNames: noteNames,
        detectionMode: midiMode,
        shouldCheck: shouldCheck,
        scalesToSearch: scalesToSearch.length,
        allMatches: allMatches.map(match => ({
          id: match.id,
          rootNote: match.rootNote,
          name: match.name,
          pitchClasses: Array.from(match.pitchClasses).sort()
        })),
        selectedMatch: selectedMatch,
        timestamp: Date.now()
      });
    }

  }, [playedNotes, playedPitchClasses, midiMode, processedScales, showDebugInfo]);

  // Effect to handle scroll for floating notes display
  useEffect(() => {
    const handleScroll = () => {
      const floatingNotesDisplay = document.getElementById('floating-notes-display');
      if (!midiStatusRef.current || !floatingNotesDisplay) return;

      const shouldShow = window.scrollY > (midiStatusRef.current.offsetTop + midiStatusRef.current.offsetHeight);
      floatingNotesDisplay.classList.toggle('visible', shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Callback to highlight a scale in the tables
  const handleHighlightScale = useCallback((scaleId: string) => {
    setMidiHighlightedCellId(scaleId);
    const element = document.getElementById(scaleId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, []);

  // Effect to initialize keySuggester
  useEffect(() => {
    if (!keySuggesterInitialized.current && processedScales.length > 0) {
      keySuggester.init('melody-suggestions-overlay', 'chord-suggestions-overlay', processedScales, handleHighlightScale);
      keySuggesterInitialized.current = true;
    }
  }, [processedScales, handleHighlightScale]);

  const playedNoteNames = playedNotes.map(n => NOTES[n.number % 12]).join(', ');

  return (
    <div className={`scale-finder ${embedded ? 'scale-finder--embedded' : ''}`}>
      {/* Suggestion Overlays */}
      <div id="melody-suggestions-overlay" className="suggestions-overlay melody-suggestions"></div>
      <div id="chord-suggestions-overlay" className="suggestions-overlay chord-suggestions"></div>

      {/* Debug Overlay */}
      {showDebugInfo && debugInfo && (
        <div className="debug-overlay">
          <div className="debug-overlay__content">
            <div className="debug-overlay__header">
              <h3>🐛 Scale Detection Debug Info</h3>
              <span className="debug-overlay__timestamp">
                {new Date(debugInfo.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="debug-overlay__section">
              <h4>Input Analysis</h4>
              <div className="debug-info-grid">
                <div className="debug-info-item">
                  <span className="debug-label">Notes Entered:</span>
                  <span className="debug-value">{debugInfo.notesEntered}</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Detection Mode:</span>
                  <span className="debug-value">{debugInfo.detectionMode}-note scale</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Should Check:</span>
                  <span className={`debug-value ${debugInfo.shouldCheck ? 'debug-value--success' : 'debug-value--warning'}`}>
                    {debugInfo.shouldCheck ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="debug-info-item debug-info-item--full">
                <span className="debug-label">Note Names:</span>
                <span className="debug-value debug-value--mono">[{debugInfo.noteNames.join(', ')}]</span>
              </div>

              <div className="debug-info-item debug-info-item--full">
                <span className="debug-label">Pitch Classes:</span>
                <span className="debug-value debug-value--mono">[{debugInfo.pitchClasses.join(', ')}]</span>
              </div>
            </div>

            <div className="debug-overlay__section">
              <h4>Scale Matching</h4>
              <div className="debug-info-grid">
                <div className="debug-info-item">
                  <span className="debug-label">Scales to Search:</span>
                  <span className="debug-value">{debugInfo.scalesToSearch}</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Matches Found:</span>
                  <span className={`debug-value ${debugInfo.allMatches.length > 0 ? 'debug-value--success' : 'debug-value--error'}`}>
                    {debugInfo.allMatches.length}
                  </span>
                </div>
              </div>

              {debugInfo.selectedMatch && (
                <div className="debug-info-item debug-info-item--full">
                  <span className="debug-label">Selected Match:</span>
                  <span className="debug-value debug-value--highlight">
                    {debugInfo.selectedMatch.name || 'Unknown'} (Root: {NOTES[debugInfo.selectedMatch.rootNote]}, ID: {debugInfo.selectedMatch.id})
                  </span>
                </div>
              )}

              {debugInfo.allMatches.length > 0 && (
                <div className="debug-matches">
                  <span className="debug-label">All Matches:</span>
                  <div className="debug-matches-list">
                    {debugInfo.allMatches.slice(0, 5).map((match, index) => (
                      <div key={match.id} className="debug-match-item">
                        <span className="debug-match-name">{match.name || 'Unknown'}</span>
                        <span className="debug-match-root">Root: {NOTES[match.rootNote]}</span>
                        <span className="debug-match-id">ID: {match.id}</span>
                      </div>
                    ))}
                    {debugInfo.allMatches.length > 5 && (
                      <div className="debug-match-item debug-match-item--more">
                        ... and {debugInfo.allMatches.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Notes Display */}
      <div id="floating-notes-display" className="floating-notes-display">
        <div id="floating-notes-content" className="floating-notes-content">
          {playedNoteNames ? `Notes: ${playedNoteNames}` : ''}
        </div>
        <button 
          onClick={handleClearAll} 
          className="floating-clear-btn btn btn--secondary btn--sm"
        >
          Clear
        </button>
      </div>

      <div className="card card--blur space-y-4">
        <div>
          <p className="text-semibold">MIDI Status: <span className="text-cyan">{status}</span></p>
          {error && <p className="text-error">Error: {error}</p>}
        </div>

        {devices.length > 0 && (
          <div>
            <label htmlFor="midi-device" className="label">
              Select MIDI Input
            </label>
            <select
              id="midi-device"
              value={selectedDevice || ''}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="select-input select-input--half"
            >
              <option value="" disabled>Select a device</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="label mb-2">Detection Mode</p>
          <div className="radio-group">
            {(['7', '5', 'melody', 'chord'] as const).map(m => (
              <label key={m} className="radio-label">
                <input
                  type="radio"
                  name="scale-type"
                  value={m}
                  checked={midiMode === m}
                  onChange={(e) => setMidiMode(e.target.value as typeof midiMode)}
                  className="radio-input"
                />
                <span>
                  {m === '7' ? '7-note Scale' : 
                   m === '5' ? '5/6-note Scale' : 
                   m === 'melody' ? 'Melody Mode' : 
                   'Chord Mode'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {midiMode === 'chord' && (
          <div className="chord-controls">
            <div className="mb-4">
              <label htmlFor="base-key-input" className="label">
                Base Key for Chord Progressions
              </label>
              <select
                id="base-key-input"
                value={baseKey}
                onChange={(e) => setBaseKey(e.target.value)}
                className="select-input select-input--half"
              >
                {NOTES.map(note => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <p className="label mb-2">Key Mode</p>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="key-mode"
                    value="major"
                    checked={keyMode === 'major'}
                    onChange={() => setKeyMode('major')}
                    className="radio-input"
                  />
                  <span>Major</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="key-mode"
                    value="minor"
                    checked={keyMode === 'minor'}
                    onChange={() => setKeyMode('minor')}
                    className="radio-input"
                  />
                  <span>Minor</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="note-display" ref={midiStatusRef}>
            <p className="text-semibold">Notes Detected:</p>
            <div className="note-display__notes">{playedNoteNames}</div>
            <div className="note-display-actions">
              <button onClick={handleClearAll} className="btn btn--secondary btn--sm">
                  Clear
              </button>
              <button 
                onClick={() => setShowPreferences(true)} 
                className="btn btn--secondary btn--sm"
                title="Open preferences"
              >
                  ⚙️ Settings
              </button>
            </div>
        </div>
      </div>

      <div className="scale-tables-container">
        {allScaleData.map(scaleGroup => (
            <div key={scaleGroup.tableId} className="card bg-slate-800/60 p-4">
                <h2 className="section-title section-title--cyan">{scaleGroup.name}</h2>
                <div className="table-container">
                    <ScaleTable 
                        scaleData={scaleGroup} 
                        highlightedCellId={highlightedCellId}
                        hoveredCell={hoveredCell}
                        setHoveredCell={setHoveredCell}
                        hoveredNote={hoveredNote}
                        setHoveredNote={setHoveredNote}
                    />
                </div>
            </div>
        ))}
      </div>

      {/* Preferences Panel */}
      <PreferencesPanel 
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
};

export default ScaleFinder;
