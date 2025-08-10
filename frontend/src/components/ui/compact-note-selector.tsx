/**
 * CompactNoteSelector - Enhanced Mouse Input for Individual Notes (Melodies)
 *
 * A space-efficient note selection interface that allows users to:
 * - Select individual notes from a 12-note chromatic selector
 * - Build melodies with clear visual feedback and sequence display
 * - Choose between horizontal and circular layout options
 * - Maintain note order for melodic sequences
 * - Remove duplicates for scale input
 *
 * Uses the NOTES constant from scales.ts for consistent note representation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import DelightfulButton from './delightful-button';
import { TrashIcon, ShuffleIcon, RotateCcwIcon } from 'lucide-react';
import { NOTES } from '../../constants/scales';

export type NoteLayout = 'horizontal' | 'circular';
export type NoteInputMode = 'melody' | 'scale';

interface CompactNoteSelectorProps {
  value: string; // Current notes as space-separated string
  onChange: (notes: string) => void;
  mode?: NoteInputMode; // 'melody' preserves order and duplicates, 'scale' removes duplicates
  layout?: NoteLayout;
  className?: string;
  maxNotes?: number;
  showOctaves?: boolean;
}

// Extract clean note names from NOTES constant
const CHROMATIC_NOTES = NOTES.map(note => ({
  note: note.split('/')[0], // Primary spelling (e.g., "C#" from "C#/Db")
  alternate: note.includes('/') ? note.split('/')[1] : null, // Alternate spelling
  pitchClass: NOTES.indexOf(note)
}));

// Circle of fifths order for circular layout
const CIRCLE_OF_FIFTHS_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // C, G, D, A, E, B, F#, C#, G#, Eb, Bb, F

// Quick note collections for melody/scale input
const QUICK_SELECTIONS = {
  melody: [
    { name: 'C Major Scale', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
    { name: 'Pentatonic', notes: ['C', 'D', 'E', 'G', 'A'] },
    { name: 'Blues Scale', notes: ['C', 'E♭', 'F', 'F♯', 'G', 'B♭'] },
    { name: 'Chromatic', notes: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] },
  ],
  scale: [
    { name: 'Major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
    { name: 'Natural Minor', notes: ['C', 'D', 'E♭', 'F', 'G', 'A♭', 'B♭'] },
    { name: 'Dorian', notes: ['C', 'D', 'E♭', 'F', 'G', 'A', 'B♭'] },
    { name: 'Mixolydian', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B♭'] },
  ]
};

const CompactNoteSelector: React.FC<CompactNoteSelectorProps> = ({
  value,
  onChange,
  mode = 'melody',
  layout: initialLayout = 'horizontal',
  className,
  maxNotes = 20,
  showOctaves = false
}) => {
  // Internal layout state
  const [layout, setLayout] = useState<NoteLayout>(initialLayout);

  // Parse current notes
  const currentNotes = useMemo(() => {
    if (!value.trim()) return [];
    return value.trim().split(/\s+/).filter(note => note.length > 0);
  }, [value]);

  // State for octave selection
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [showAlternateSpellings, setShowAlternateSpellings] = useState(false);

  // Get notes in layout order
  const notesInOrder = useMemo(() => {
    if (layout === 'circular') {
      return CIRCLE_OF_FIFTHS_ORDER.map(pc => CHROMATIC_NOTES[pc]);
    }
    return CHROMATIC_NOTES;
  }, [layout]);

  // Handle note selection
  const handleNoteSelect = useCallback((noteData: typeof CHROMATIC_NOTES[0]) => {
    const noteName = showAlternateSpellings && noteData.alternate ? noteData.alternate : noteData.note;
    const finalNoteName = showOctaves ? `${noteName}${selectedOctave}` : noteName;

    if (mode === 'melody') {
      // For melody: preserve order and allow duplicates
      const newNotes = [...currentNotes, finalNoteName];
      if (newNotes.length <= maxNotes) {
        onChange(newNotes.join(' '));
      }
    } else {
      // For scale: remove duplicates by pitch class but preserve order of first occurrence
      const existingPitchClasses = new Set(
        currentNotes.map(note => {
          const cleanNote = note.replace(/[0-9]/g, ''); // Remove octave numbers
          const pitchClass = CHROMATIC_NOTES.find(n =>
            n.note === cleanNote || n.alternate === cleanNote
          )?.pitchClass;
          return pitchClass;
        }).filter(pc => pc !== undefined)
      );

      if (!existingPitchClasses.has(noteData.pitchClass)) {
        const newNotes = [...currentNotes, finalNoteName];
        if (newNotes.length <= maxNotes) {
          onChange(newNotes.join(' '));
        }
      }
    }
  }, [currentNotes, mode, maxNotes, onChange, selectedOctave, showOctaves, showAlternateSpellings]);

  // Remove note at specific index (for melody) or by pitch class (for scale)
  const handleNoteRemove = useCallback((index: number) => {
    const newNotes = currentNotes.filter((_, i) => i !== index);
    onChange(newNotes.join(' '));
  }, [currentNotes, onChange]);

  // Load quick selection
  const loadQuickSelection = useCallback((selection: typeof QUICK_SELECTIONS.melody[0]) => {
    onChange(selection.notes.join(' '));
  }, [onChange]);

  // Clear all notes
  const clearAll = useCallback(() => {
    onChange('');
  }, [onChange]);

  // Randomize note order (melody only)
  const randomizeOrder = useCallback(() => {
    if (mode === 'melody' && currentNotes.length > 1) {
      const shuffled = [...currentNotes].sort(() => Math.random() - 0.5);
      onChange(shuffled.join(' '));
    }
  }, [currentNotes, mode, onChange]);

  // Get selected pitch classes for visual feedback
  const selectedPitchClasses = useMemo(() => {
    return new Set(
      currentNotes.map(note => {
        const cleanNote = note.replace(/[0-9]/g, '');
        const pitchClass = CHROMATIC_NOTES.find(n =>
          n.note === cleanNote || n.alternate === cleanNote
        )?.pitchClass;
        return pitchClass;
      }).filter(pc => pc !== undefined)
    );
  }, [currentNotes]);

  return (
    <div className={cn("compact-note-selector space-y-4", className)}>
      {/* Quick Selections */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Quick select:</div>
        <div className="flex flex-wrap gap-1">
          {QUICK_SELECTIONS[mode].map((selection) => (
            <Button
              key={selection.name}
              onClick={() => loadQuickSelection(selection)}
              variant="outline"
              size="sm"
              className="text-xs h-7"
            >
              {selection.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Layout Toggle */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Layout:</span>
            <Button
              onClick={() => setLayout(layout === 'horizontal' ? 'circular' : 'horizontal')}
              variant="outline"
              size="sm"
              className="h-6 text-xs"
            >
              {layout === 'horizontal' ? '📏 Linear' : '⭕ Circle'}
            </Button>
          </div>

          {/* Alternate Spellings Toggle */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Spellings:</span>
            <Button
              onClick={() => setShowAlternateSpellings(!showAlternateSpellings)}
              variant="outline"
              size="sm"
              className="h-6 text-xs"
            >
              {showAlternateSpellings ? '♭ Flats' : '♯ Sharps'}
            </Button>
          </div>
        </div>

        {/* Octave Selector (if enabled) */}
        {showOctaves && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Octave:</span>
            <select
              value={selectedOctave}
              onChange={(e) => setSelectedOctave(Number(e.target.value))}
              className="text-xs border rounded px-1 py-0.5 bg-background"
            >
              {[2, 3, 4, 5, 6].map(octave => (
                <option key={octave} value={octave}>{octave}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Note Grid */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Select notes:</div>

        <div className={cn(
          "grid gap-2",
          layout === 'horizontal'
            ? "grid-cols-6 sm:grid-cols-12"
            : "grid-cols-6 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6"
        )}>
          {notesInOrder.map((noteData) => {
            const displayNote = showAlternateSpellings && noteData.alternate ? noteData.alternate : noteData.note;
            const isSelected = selectedPitchClasses.has(noteData.pitchClass);

            return (
              <DelightfulButton
                key={noteData.pitchClass}
                onClick={() => handleNoteSelect(noteData)}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={cn(
                  "aspect-square transition-all duration-200 hover:scale-105 text-sm font-medium",
                  isSelected && "shadow-md scale-105 border-primary ring-2 ring-primary/20"
                )}
                musical
                sparkle={isSelected}
                disabled={mode === 'scale' && isSelected} // Prevent duplicates in scale mode
              >
                {displayNote}
              </DelightfulButton>
            );
          })}
        </div>
      </div>

      {/* Selected Notes Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            Selected notes ({currentNotes.length}/{maxNotes}):
          </div>

          <div className="flex items-center gap-1">
            {mode === 'melody' && currentNotes.length > 1 && (
              <Button
                onClick={randomizeOrder}
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                title="Randomize order"
              >
                <ShuffleIcon className="w-3 h-3" />
              </Button>
            )}
            {currentNotes.length > 0 && (
              <Button
                onClick={clearAll}
                variant="ghost"
                size="sm"
                className="text-xs h-6 text-destructive hover:text-destructive"
                title="Clear all notes"
              >
                <TrashIcon className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-3">
            {currentNotes.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-2">
                No notes selected - click notes above to build your {mode}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentNotes.map((note, index) => (
                  <Badge
                    key={`${note}-${index}`}
                    variant="secondary"
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                    onClick={() => handleNoteRemove(index)}
                    title={`Remove ${note} (position ${index + 1})`}
                  >
                    <span className="font-mono">{note}</span>
                    {mode === 'melody' && (
                      <span className="text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                    <span className="w-3 h-3 flex items-center justify-center text-xs hover:bg-destructive/30 rounded">
                      ×
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mode-specific Information */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
        {mode === 'melody' ? (
          <div className="space-y-1">
            <div className="font-medium">Melody Mode:</div>
            <div>• Order matters - notes will be played in sequence</div>
            <div>• Duplicates allowed - repeat notes as needed</div>
            <div>• Numbers show sequence position</div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="font-medium">Scale Mode:</div>
            <div>• Order preserved but duplicates removed</div>
            <div>• Click selected notes to remove them</div>
            <div>• Focus on unique pitch classes</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactNoteSelector;
