import React, { useEffect } from 'react';
import { NOTES, allScaleData } from '../constants/scales';
import { ProcessedScale } from '../types';

interface MidiDetectionPanelProps {
  onScaleHighlight?: (scaleId: string | null) => void;
  midiData?: {
    playedNotes: any[];
    playedPitchClasses: Set<number>;
    mode: '7' | '5' | 'melody' | 'chord';
    setMode: (mode: '7' | '5' | 'melody' | 'chord') => void;
    clearPlayedNotes: () => void;
  };
  className?: string;
}

const MidiDetectionPanel: React.FC<MidiDetectionPanelProps> = ({
  onScaleHighlight,
  midiData,
  className = ''
}) => {
  const [baseKey, setBaseKey] = React.useState<string>('C');
  const [keyMode, setKeyMode] = React.useState<'major' | 'minor'>('major');
  const [processedScales, setProcessedScales] = React.useState<ProcessedScale[]>([]);

  // Extract MIDI data from props with defaults
  const playedNotes = midiData?.playedNotes || [];
  const playedPitchClasses = midiData?.playedPitchClasses || new Set();
  const midiMode = midiData?.mode || '7';
  const setMidiMode = midiData?.setMode || (() => {});
  const clearPlayedNotes = midiData?.clearPlayedNotes || (() => {});

  const playedNoteNames = playedNotes.map(note => {
    const noteName = note.accidental ? `${note.name}${note.accidental}` : note.name;
    return `${noteName}${note.octave}`;
  }).join(' ');

  const handleClearAll = () => {
    clearPlayedNotes();
    if (onScaleHighlight) {
      onScaleHighlight(null);
    }
  };

  // Helper function to check if two sets are equal
  const setsAreEqual = (setA: Set<number>, setB: Set<number>) => {
    if (setA.size !== setB.size) return false;
    for (const a of setA) if (!setB.has(a)) return false;
    return true;
  };

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

          newProcessedScales.push({ 
            id: cellId, 
            pitchClasses, 
            rootNote: modeRootPitch,
            name: data.commonNames ? data.commonNames[modeIndex] : 
                  data.alternateNames ? data.alternateNames[modeIndex] : undefined,
          });
        });
      });
    });
    setProcessedScales(newProcessedScales);
  }, []);


  // Effect to find scale match when notes change
  useEffect(() => {
    if (midiMode === 'melody' || midiMode === 'chord' || !onScaleHighlight) return;

    if (playedPitchClasses.size === 0) {
      onScaleHighlight(null);
      return;
    }

    const playedCount = playedPitchClasses.size;
    let shouldCheck = false;
    if (midiMode === '7' && playedCount === 7) shouldCheck = true;
    if (midiMode === '5' && (playedCount === 5 || playedCount === 6)) shouldCheck = true;

    if (shouldCheck) {
      const scalesToSearch = processedScales.filter(s => s.pitchClasses.size === playedPitchClasses.size);

      // Find all scales that contain the exact same pitch classes
      const allMatches = scalesToSearch.filter(scale =>
        setsAreEqual(scale.pitchClasses, playedPitchClasses)
      );

      if (allMatches.length > 0) {
        // Prioritize the scale that starts with the first note played
        let preferredMatch = allMatches[0];

        if (playedNotes.length > 0) {
          const firstNotePitchClass = playedNotes[0].number % 12;
          const matchingScale = allMatches.find(scale => scale.rootNote === firstNotePitchClass);
          if (matchingScale) {
            preferredMatch = matchingScale;
          }
        }

        onScaleHighlight(preferredMatch.id);
      } else {
        onScaleHighlight(null);
      }
    }
  }, [playedNotes, playedPitchClasses, midiMode, processedScales, onScaleHighlight]);

  return (
    <div className={`midi-detection-panel ${className}`}>
      <div className="midi-detection-card">
        <h3 className="text-xs font-semibold mb-2 text-cyan-400">MIDI Detection</h3>

        {/* Detection Mode */}
        <div className="mb-2">
          <p className="text-xs font-medium mb-1">Detection Mode</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {(['7', '5', 'melody', 'chord'] as const).map((m) => (
              <label key={m} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="midi-mode-detection"
                  value={m}
                  checked={midiMode === m}
                  onChange={(e) => setMidiMode(e.target.value as typeof midiMode)}
                  className="w-3 h-3"
                />
                <span className="text-xs">
                  {m === '7' ? '7-note' :
                   m === '5' ? '5/6-note' :
                   m === 'melody' ? 'Melody' :
                   'Chord'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Chord Mode Settings */}
        {midiMode === 'chord' && (
          <div className="mb-2 p-1.5 bg-slate-800 rounded">
            <div className="mb-1.5">
              <label htmlFor="base-key-detection" className="block text-xs font-medium mb-0.5">
                Base Key
              </label>
              <select
                id="base-key-detection"
                value={baseKey}
                onChange={(e) => setBaseKey(e.target.value)}
                className="w-full px-1.5 py-0.5 text-xs bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-cyan-400"
              >
                {NOTES.map(note => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium mb-0.5">Key Mode</p>
              <div className="flex gap-1.5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="key-mode-detection"
                    value="major"
                    checked={keyMode === 'major'}
                    onChange={() => setKeyMode('major')}
                    className="w-3 h-3"
                  />
                  <span className="text-xs">Major</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="key-mode-detection"
                    value="minor"
                    checked={keyMode === 'minor'}
                    onChange={() => setKeyMode('minor')}
                    className="w-3 h-3"
                  />
                  <span className="text-xs">Minor</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notes Display */}
        <div className="mb-0">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-medium">Notes Detected:</p>
            <button 
              onClick={handleClearAll} 
              className="px-1.5 py-0.5 text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="min-h-[18px] p-1.5 bg-slate-800 rounded text-xs font-mono">
            {playedNoteNames || 'No notes detected'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidiDetectionPanel;
