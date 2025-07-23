import React, { useEffect } from 'react';
import { NOTES, allScaleData } from '../constants/scales';
import { ProcessedScale } from '../types';

interface MidiDetectionPanelProps {
  onScaleHighlight?: (scaleId: string | null) => void;
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
  className?: string;
}

const MidiDetectionPanel: React.FC<MidiDetectionPanelProps> = ({
  onScaleHighlight,
  midiData,
  className = ''
}) => {
  const [processedScales, setProcessedScales] = React.useState<ProcessedScale[]>([]);

  // Extract MIDI data from props with defaults
  const playedNotes = midiData?.playedNotes || [];
  const playedPitchClasses = midiData?.playedPitchClasses || new Set();
  const detectionEnabled = midiData?.detectionEnabled ?? true;
  const setDetectionEnabled = midiData?.setDetectionEnabled || (() => {});
  const analysisFocus = midiData?.analysisFocus || 'automatic';
  const setAnalysisFocus = midiData?.setAnalysisFocus || (() => {});
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
    if (!detectionEnabled || analysisFocus === 'chord' || !onScaleHighlight) return;

    if (playedPitchClasses.size === 0) {
      onScaleHighlight(null);
      return;
    }

    const playedCount = playedPitchClasses.size;
    let shouldCheck = false;
    if (analysisFocus === 'complete' && playedCount === 7) shouldCheck = true;
    if (analysisFocus === 'pentatonic' && (playedCount === 5 || playedCount === 6)) shouldCheck = true;
    if (analysisFocus === 'automatic' && (playedCount === 5 || playedCount === 6 || playedCount === 7)) shouldCheck = true;

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
  }, [playedNotes, playedPitchClasses, detectionEnabled, analysisFocus, processedScales, onScaleHighlight]);

  return (
    <div className={`midi-detection-panel ${className}`}>
      <div className="midi-detection-card">
        <h3 className="text-xs font-semibold mb-2 text-cyan-400">Live Input Analysis</h3>

        {/* Detection Toggle */}
        <div className="mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={detectionEnabled}
              onChange={(e) => setDetectionEnabled(e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-xs font-medium">Enable Detection</span>
          </label>
        </div>

        {/* Analysis Focus */}
        {detectionEnabled && (
          <div className="mb-2">
            <p className="text-xs font-medium mb-1">Analysis Focus</p>
            <select
              value={analysisFocus}
              onChange={(e) => setAnalysisFocus(e.target.value as typeof analysisFocus)}
              className="w-full px-1.5 py-0.5 text-xs bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-cyan-400"
            >
              <option value="automatic">Automatic</option>
              <option value="complete">Complete (7-note)</option>
              <option value="pentatonic">Pentatonic (5/6-note)</option>
              <option value="chord">Chord</option>
            </select>
          </div>
        )}


        {/* Notes Display */}
        <div className="mb-0">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-medium">Notes Detected:</p>
            <div className="flex gap-1">
              <button 
                onClick={handleClearAll} 
                className="px-1.5 py-0.5 text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors"
              >
                Clear
              </button>
              {midiData?.resetMidiConnection && (
                <button 
                  onClick={() => midiData.resetMidiConnection?.()} 
                  className="px-1.5 py-0.5 text-xs bg-yellow-600 hover:bg-yellow-500 rounded transition-colors"
                  title="Reset MIDI Connection"
                >
                  Reset
                </button>
              )}
            </div>
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
