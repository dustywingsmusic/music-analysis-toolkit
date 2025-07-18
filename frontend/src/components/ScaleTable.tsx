import React from 'react';
import type { ScaleData } from '../types';
import { PARENT_KEYS, PARENT_KEY_INDICES, PITCH_CLASS_NAMES } from '../constants/scales';
import { generateDiatonicScale } from '../utils/music';

interface ScaleTableProps {
  scaleData: ScaleData;
  highlightedCellId: string | null;
  hoveredCell: string | null;
  setHoveredCell: (id: string | null) => void;
  hoveredNote: string | null;
  setHoveredNote: (note: string | null) => void;
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
    const classes = ['scale-table__cell', 'scale-table__cell--note'];
    if (cellId === highlightedCellId) {
      classes.push('scale-table__cell--highlighted');
    } else if (cellId === hoveredCell) {
      classes.push('scale-table__cell--hovered');
    } else if (hoveredNote && noteName !== '?' && noteName === hoveredNote) {
      classes.push('scale-table__cell--note-match');
    }
    return classes.join(' ');
  };

  const isRowHovered = (keyRowIndex: number) => {
    return hoveredCell && hoveredCell.startsWith(`${scaleData.tableId}-${keyRowIndex}`);
  };

  const getDataRowClass = () => {
    return 'scale-table__row scale-table__row--data';
  }

  return (
    <table 
        className="scale-table"
        onMouseLeave={() => {
            setHoveredCell(null);
            setHoveredNote(null);
        }}
    >
      <thead>
        <tr className="scale-table__header-row">
          {scaleData.headers.map((header, index) => (
            <th key={index} className="scale-table__header-cell">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className={getDataRowClass()}>
          <td className="scale-table__cell scale-table__cell--header">Formula</td>
          {scaleData.formulas.map((formula, index) => (
            <td key={index} className="scale-table__cell font-mono text-xs"><code>{formula}</code></td>
          ))}
        </tr>
        <tr className={getDataRowClass()}>
          <td className="scale-table__cell scale-table__cell--header">Intervals</td>
          {scaleData.modeIntervals.map((intervals, index) => (
            <td key={index} className="scale-table__cell font-mono text-xs">{intervals.join(', ')}</td>
          ))}
        </tr>
        {!scaleData.skipCommonNames && scaleData.commonNames && (
          <tr className={getDataRowClass()}>
            <td className="scale-table__cell scale-table__cell--header">Common Name</td>
            {scaleData.commonNames.map((name, index) => (
              <td key={index} className="scale-table__cell">{name}</td>
            ))}
          </tr>
        )}
         {scaleData.alternateNames && (
            <tr className={getDataRowClass()}>
                <td className="scale-table__cell scale-table__cell--header">Alternate Names</td>
                {scaleData.alternateNames.map((name, index) => (
                    <td key={index} className="scale-table__cell">{name}</td>
                ))}
            </tr>
        )}

        {PARENT_KEY_INDICES.map((parentKeyIndex, keyRowIndex) => {
          const rootName = PARENT_KEYS[parentKeyIndex as keyof typeof PARENT_KEYS];

          return (
            <tr key={keyRowIndex} className={`scale-table__row ${isRowHovered(keyRowIndex) ? 'scale-table__row--hovered' : ''}`}>
              <td className="scale-table__cell scale-table__cell--header">{`${rootName} ${scaleData.name}`}</td>
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