import React, { useEffect } from 'react';
import { NOTES, allScaleData } from '../constants/scales';
import { ProcessedScale } from '../types';

interface MidiDetectionPanelProps {
  onScaleHighlight?: (scaleId: string | null) => void;
  midiData?: {
    playedNotes: any[];
    playedPitchClasses: Set<number>;
    clearPlayedNotes: () => void;
    forceCleanup?: () => void;
    resetMidiConnection?: () => Promise<void>;
  };
  className?: string;
  currentRoot?: number | null;
  onRootSelect?: (pitchClass: number) => void;
  onResetRoot?: () => void;
  rootLocked?: boolean;
  historyPitchClasses?: number[];
}

const MidiDetectionPanel: React.FC<MidiDetectionPanelProps> = ({
  onScaleHighlight,
  midiData,
  className = '',
  currentRoot,
  onRootSelect,
  onResetRoot,
  rootLocked = false,
  historyPitchClasses = []
}) => {
  const [processedScales, setProcessedScales] = React.useState<ProcessedScale[]>([]);

  // Extract MIDI data from props with defaults
  const playedNotes = midiData?.playedNotes || [];
  const playedPitchClasses = midiData?.playedPitchClasses || new Set();
  const clearPlayedNotes = midiData?.clearPlayedNotes || (() => {});


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
    if (!onScaleHighlight) return;

    if (playedPitchClasses.size === 0) {
      onScaleHighlight(null);
      return;
    }

    const playedCount = playedPitchClasses.size;
    if (playedCount >= 5 && playedCount <= 7) {
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
  }, [playedNotes, playedPitchClasses, processedScales, onScaleHighlight]);

  return (
    <div className={`midi-detection-panel ${className}`}>
      <div className="midi-detection-card">
        <h3 className="text-xs font-semibold mb-2 text-cyan-400">Live Input Analysis</h3>




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
          <div className="min-h-[18px] p-1.5 bg-slate-800 rounded text-xs font-mono flex flex-wrap gap-1 items-center">
            {(historyPitchClasses.length > 0 || playedNotes.length > 0) ? (
              <>
                {(historyPitchClasses.length > 0 ? historyPitchClasses.map((pc, idx) => {
                    const display = NOTES[pc];
                    const pitchClass = pc;
                    const isRoot = pitchClass === currentRoot;
                    return (
                      <button
                        key={idx}
                        onClick={() => onRootSelect && onRootSelect(pitchClass)}
                        className={`note-button${isRoot ? ' root-note' : ''}`}
                        title="Set as tonic"
                      >
                        {display}
                      </button>
                    );
                  }) : playedNotes.map((note, idx) => {
                    const noteName = note.accidental ? `${note.name}${note.accidental}` : note.name;
                    const display = `${noteName}${note.octave}`;
                    const pitchClass = note.number % 12;
                    const isRoot = pitchClass === currentRoot;
                    return (
                      <button
                        key={idx}
                        onClick={() => onRootSelect && onRootSelect(pitchClass)}
                        className={`note-button${isRoot ? ' root-note' : ''}`}
                        title="Set as tonic"
                      >
                        {display}
                      </button>
                    );
                  }))}
                {rootLocked && (
                  <button
                    onClick={onResetRoot}
                    className="ml-1 px-1.5 py-0.5 rounded bg-slate-600 hover:bg-slate-500"
                  >
                    Reset to Lowest Note
                  </button>
                )}
              </>
            ) : (
              'No notes detected'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidiDetectionPanel;
