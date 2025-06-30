import React from 'react';
import { ScaleData } from '../types';
import { PARENT_KEYS, PARENT_KEY_INDICES, NOTE_LETTERS, PITCH_CLASS_NAMES } from '../constants/scales';

interface ScaleTableProps {
  scaleData: ScaleData;
  highlightedCellId: string | null;
  hoveredCell: string | null;
  setHoveredCell: (id: string | null) => void;
  hoveredNote: string | null;
  setHoveredNote: (note: string | null) => void;
}

const generateDiatonicScale = (rootPitchClass: number, rootName: string, intervalPattern: number[]) => {
    let scaleNotes = [rootName];
    let currentPitch = rootPitchClass;
    let rootLetter_idx = NOTE_LETTERS.indexOf(rootName.charAt(0));

    // This loop is for the 6 notes after the root
    for (let i = 0; i < 6; i++) {
        currentPitch = (currentPitch + intervalPattern[i]) % 12;
        const nextLetter = NOTE_LETTERS[(rootLetter_idx + i + 1) % 7];

        let foundNote = false;
        const pitchNameOptions = PITCH_CLASS_NAMES[currentPitch];

        for (const spelling in pitchNameOptions) {
            const noteName = pitchNameOptions[spelling as keyof typeof pitchNameOptions];
            if (noteName && noteName.charAt(0) === nextLetter) {
                scaleNotes.push(noteName);
                foundNote = true;
                break;
            }
        }
        if (!foundNote) {
             const fallbackName = pitchNameOptions.normal || pitchNameOptions.sharp || pitchNameOptions.flat || "?";
             scaleNotes.push(fallbackName)
        }
    }
    return scaleNotes;
}

const ScaleTable: React.FC<ScaleTableProps> = ({ 
    scaleData, 
    highlightedCellId,
    hoveredCell,
    setHoveredCell,
    hoveredNote,
    setHoveredNote
}) => {

  const getCellClasses = (cellId: string, noteName: string) => {
    let classes = "p-2 sm:p-3 text-center transition-colors duration-150 whitespace-nowrap cursor-pointer";
    if (cellId === highlightedCellId) {
      classes += " bg-yellow-400 text-black font-bold ring-2 ring-yellow-200"; // .highlight
    } else if (cellId === hoveredCell) {
      classes += " bg-cyan-600 ring-2 ring-cyan-400"; // .hover-highlight
    } else if (hoveredNote && noteName !== '?' && noteName === hoveredNote) {
      classes += " bg-slate-600 border-2 border-cyan-500 box-border"; // .note-match-highlight
    } else {
      classes += " bg-slate-700/50";
    }
    return classes;
  };
  
  const isRowHovered = (keyRowIndex: number) => {
    return hoveredCell && hoveredCell.startsWith(`${scaleData.tableId}-${keyRowIndex}`);
  };

  return (
    <table 
        className="min-w-full border-collapse text-sm text-slate-300"
        onMouseLeave={() => {
            setHoveredCell(null);
            setHoveredNote(null);
        }}
    >
      <thead>
        <tr className="bg-slate-800">
          {scaleData.headers.map((header, index) => (
            <th key={index} className="p-2 sm:p-3 font-semibold text-left sticky top-0 bg-slate-800 z-10">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="bg-slate-800/50">
          <td className="p-2 sm:p-3 font-semibold text-left">Formula</td>
          {scaleData.formulas.map((formula, index) => (
            <td key={index} className="p-2 sm:p-3 text-left font-mono text-xs"><code>{formula}</code></td>
          ))}
        </tr>
        <tr className="bg-slate-800/50">
          <td className="p-2 sm:p-3 font-semibold text-left">Intervals</td>
          {scaleData.modeIntervals.map((intervals, index) => (
            <td key={index} className="p-2 sm:p-3 text-left font-mono text-xs">{intervals.join(', ')}</td>
          ))}
        </tr>
        {!scaleData.skipCommonNames && scaleData.commonNames && (
          <tr className="bg-slate-800/50">
            <td className="p-2 sm:p-3 font-semibold text-left">Common Name</td>
            {scaleData.commonNames.map((name, index) => (
              <td key={index} className="p-2 sm:p-3 text-left">{name}</td>
            ))}
          </tr>
        )}
         {scaleData.alternateNames && (
            <tr className="bg-slate-800/50">
                <td className="p-2 sm:p-3 font-semibold text-left">Alternate Names</td>
                {scaleData.alternateNames.map((name, index) => (
                    <td key={index} className="p-2 sm:p-3 text-left">{name}</td>
                ))}
            </tr>
        )}
        
        {PARENT_KEY_INDICES.map((parentKeyIndex, keyRowIndex) => {
          const rootName = PARENT_KEYS[parentKeyIndex as keyof typeof PARENT_KEYS];

          return (
            <tr key={keyRowIndex} className={`border-t border-slate-700 ${isRowHovered(keyRowIndex) ? 'bg-slate-700' : ''}`}>
              <td className="p-2 sm:p-3 font-semibold text-left">{`${rootName} ${scaleData.name}`}</td>
              {scaleData.modeIntervals.map((_, modeIndex) => {
                const modeRootPitch = (parentKeyIndex + scaleData.parentScaleIntervals[modeIndex]) % 12;
                let cellNoteText = '?';

                if (scaleData.isDiatonic && scaleData.parentScaleIntervalPattern) {
                    const diatonicParent = generateDiatonicScale(parentKeyIndex, rootName, scaleData.parentScaleIntervalPattern);
                    cellNoteText = diatonicParent[modeIndex];
                } else {
                    let effectiveKeyName = rootName;
                    if (scaleData.tableId === "blues-scale-modes" && rootName === "G♭") {
                        effectiveKeyName = "F♯";
                    }

                    const pitchEntry = PITCH_CLASS_NAMES[modeRootPitch];
                    if (effectiveKeyName.includes('♭') && pitchEntry.flat && !pitchEntry.flat.includes('♭♭')) {
                        cellNoteText = pitchEntry.flat;
                    } else if (pitchEntry.normal && !pitchEntry.normal.includes('♭♭') && !pitchEntry.normal.includes('♯♯')) {
                        cellNoteText = pitchEntry.normal;
                    } else if (pitchEntry.sharp && !pitchEntry.sharp.includes('♯♯')) {
                        cellNoteText = pitchEntry.sharp;
                    } else {
                        cellNoteText = pitchEntry.normal || '?';
                    }
                }
                
                const cellId = `${scaleData.tableId}-${keyRowIndex}-${modeIndex}`;
                
                return (
                  <td
                    key={modeIndex}
                    id={cellId}
                    className={getCellClasses(cellId, cellNoteText)}
                    onMouseEnter={() => {
                        setHoveredCell(cellId);
                        setHoveredNote(cellNoteText);
                    }}
                  >
                    {cellNoteText}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ScaleTable;