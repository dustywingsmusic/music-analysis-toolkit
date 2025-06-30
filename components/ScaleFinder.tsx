import React, { useState, useEffect } from 'react';
import { useMidi } from '../hooks/useMidi';
import { allScaleData, NOTES } from '../constants/scales';
import { ProcessedScale } from '../types';
import ScaleTable from './ScaleTable';

const setsAreEqual = (setA: Set<number>, setB: Set<number>) => {
    if (setA.size !== setB.size) return false;
    for (const a of setA) if (!setB.has(a)) return false;
    return true;
};

interface ScaleFinderProps {
  initialHighlightId: string | null;
}

const ScaleFinder: React.FC<ScaleFinderProps> = ({ initialHighlightId }) => {
  const { status, devices, selectedDevice, setSelectedDevice, playedNotes, clearPlayedNotes, error } = useMidi();
  const [mode, setMode] = useState<'7' | '5' | 'melody'>('7');
  const [processedScales, setProcessedScales] = useState<ProcessedScale[]>([]);
  const [midiHighlightedCellId, setMidiHighlightedCellId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

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
          newProcessedScales.push({ id: cellId, pitchClasses, rootNote: modeRootPitch });
        });
      });
    });
    setProcessedScales(newProcessedScales);
  }, []);

  // Effect to handle mode changes and reset
  useEffect(() => {
    clearPlayedNotes();
    setMidiHighlightedCellId(null);
  }, [mode, clearPlayedNotes]);

  // Effect to find scale match when notes change
  useEffect(() => {
    if (mode === 'melody') return; // Melody mode has different logic (not implemented yet)

    const playedPitchClasses = new Set(playedNotes.map(n => n.number % 12));
    if (playedPitchClasses.size === 0) {
      setMidiHighlightedCellId(null);
      return;
    }

    const playedCount = playedPitchClasses.size;
    let shouldCheck = false;
    if (mode === '7' && playedCount === 7) shouldCheck = true;
    if (mode === '5' && (playedCount === 5 || playedCount === 6)) shouldCheck = true;

    if (shouldCheck) {
      const playedRootPitchClass = playedNotes.length > 0 ? Math.min(...playedNotes.map(n => n.number)) % 12 : -1;
      const scalesToSearch = processedScales.filter(s => s.pitchClasses.size === playedPitchClasses.size);

      const bestMatch = scalesToSearch.find(scale =>
        scale.rootNote === playedRootPitchClass && setsAreEqual(scale.pitchClasses, playedPitchClasses)
      );

      if (bestMatch) {
        setMidiHighlightedCellId(bestMatch.id);
        const element = document.getElementById(bestMatch.id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        setMidiHighlightedCellId(null);
      }
    }

  }, [playedNotes, mode, processedScales]);

  const playedNoteNames = playedNotes.map(n => NOTES[n.number % 12]).join(', ');

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-sm space-y-4">
        <div>
          <p className="font-semibold">MIDI Status: <span className="font-normal text-cyan-400">{status}</span></p>
          {error && <p className="text-red-400">Error: {error}</p>}
        </div>
        
        {devices.length > 0 && (
          <div>
            <label htmlFor="midi-device" className="block text-sm font-medium text-cyan-300 mb-1">
              Select MIDI Input
            </label>
            <select
              id="midi-device"
              value={selectedDevice || ''}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full md:w-1/2 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            >
              <option value="" disabled>Select a device</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="block text-sm font-medium text-cyan-300 mb-2">Detection Mode</p>
          <div className="flex gap-4">
            {(['7', '5', 'melody'] as const).map(m => (
              <label key={m} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scale-type"
                  value={m}
                  checked={mode === m}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                  className="form-radio h-4 w-4 text-cyan-600 bg-slate-700 border-slate-500 focus:ring-cyan-500"
                />
                <span>{m === '7' ? '7-note Scale' : m === '5' ? '5/6-note Scale' : 'Melody'}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <p className="font-semibold">Notes Detected:</p>
            <div className="font-mono text-cyan-300 min-h-[1.5rem]">{playedNoteNames}</div>
            <button onClick={clearPlayedNotes} className="bg-slate-600 hover:bg-slate-500 text-white font-bold text-xs py-1 px-3 rounded-md transition">
                Clear
            </button>
        </div>
      </div>
      
      <div className="space-y-8">
        {allScaleData.map(scaleGroup => (
            <div key={scaleGroup.tableId} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-cyan-300 mb-4">{scaleGroup.name}</h2>
                <div className="overflow-x-auto">
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
    </div>
  );
};

export default ScaleFinder;