/**
 * Chord Progression Input Component
 * 
 * An elegant chord progression input system with clickable placeholders that
 * open compact modal chord builders. Supports editing existing chords and
 * maintains a clean, minimal interface when not in use.
 * 
 * Features:
 * - Clickable [+] placeholders for new chords
 * - Clickable existing chords for editing
 * - Drag and drop reordering (future enhancement)
 * - Keyboard shortcuts for power users
 * - Auto-saves progression state
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { ChordBuilderModal } from './chord-builder-modal';
import { Plus, Edit2, X, RotateCcw, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChordProgressionInputProps {
  value: string;
  onChange: (progression: string) => void;
  maxChords?: number;
  showBarLines?: boolean;
  allowKeyboardInput?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  helpText?: string;
}

interface ChordSlot {
  id: string;
  chord: string | null;
  isBarLine?: boolean;
}

export const ChordProgressionInput: React.FC<ChordProgressionInputProps> = ({
  value,
  onChange,
  maxChords = 16,
  showBarLines = true,
  allowKeyboardInput = true,
  placeholder = "Click [+] to add chords",
  className,
  label = "Chord Progression",
  helpText = "Build your progression by clicking the [+] buttons to add chords"
}) => {
  const [chordSlots, setChordSlots] = useState<ChordSlot[]>(() => {
    // Initialize slots from value prop
    if (value.trim()) {
      const chords = value.trim().split(/\s+/);
      return chords.map((chord, index) => ({
        id: `slot-${index}`,
        chord: chord === '|' ? null : chord,
        isBarLine: chord === '|'
      }));
    }
    
    // Default: 4 empty slots with bar lines
    return [
      { id: 'slot-0', chord: null },
      { id: 'slot-1', chord: null },
      { id: 'slot-2', chord: null },
      { id: 'slot-3', chord: null },
      { id: 'bar-1', chord: null, isBarLine: true },
      { id: 'slot-4', chord: null },
      { id: 'slot-5', chord: null },
      { id: 'slot-6', chord: null },
      { id: 'slot-7', chord: null },
    ];
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    slotId: string | null;
    position: { x: number; y: number };
    currentChord: string;
    currentSlotIndex: number;
  }>({
    isOpen: false,
    slotId: null,
    position: { x: 0, y: 0 },
    currentChord: '',
    currentSlotIndex: -1
  });

  const [keyboardMode, setKeyboardMode] = useState(false);
  const [keyboardValue, setKeyboardValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert chord slots back to string format
  const slotsToString = useCallback((slots: ChordSlot[]): string => {
    return slots
      .filter(slot => slot.chord !== null || slot.isBarLine)
      .map(slot => slot.isBarLine ? '|' : slot.chord)
      .join(' ')
      .trim();
  }, []);

  // Get editable (non-bar line) slots for navigation
  const getEditableSlots = useCallback(() => {
    return chordSlots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => !slot.isBarLine);
  }, [chordSlots]);

  // Find the current slot index in the editable slots array
  const getCurrentEditableIndex = useCallback((slotId: string) => {
    const editableSlots = getEditableSlots();
    return editableSlots.findIndex(({ slot }) => slot.id === slotId);
  }, [getEditableSlots]);

  // Update parent component when slots change
  const updateProgression = useCallback((newSlots: ChordSlot[]) => {
    setChordSlots(newSlots);
    const progressionString = slotsToString(newSlots);
    onChange(progressionString);
  }, [onChange, slotsToString]);

  const handleSlotClick = (slotId: string, event: React.MouseEvent) => {
    if (keyboardMode) return;
    
    const slot = chordSlots.find(s => s.id === slotId);
    if (slot?.isBarLine) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const editableIndex = getCurrentEditableIndex(slotId);
    
    setModalState({
      isOpen: true,
      slotId,
      position: {
        x: rect.right + 10,  // Position to the right of the clicked element
        y: rect.top
      },
      currentChord: slot?.chord || '',
      currentSlotIndex: editableIndex
    });
  };

  const handleChordSelect = (chord: string) => {
    if (!modalState.slotId) return;

    const newSlots = chordSlots.map(slot => 
      slot.id === modalState.slotId 
        ? { ...slot, chord }
        : slot
    );
    
    updateProgression(newSlots);
    setModalState(prev => ({ 
      ...prev, 
      isOpen: false, 
      slotId: null, 
      currentSlotIndex: -1 
    }));
  };

  const handleRemoveChord = (slotId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newSlots = chordSlots.map(slot => 
      slot.id === slotId 
        ? { ...slot, chord: null }
        : slot
    );
    
    updateProgression(newSlots);
  };

  const handleClearAll = () => {
    const clearedSlots = chordSlots.map(slot => ({ ...slot, chord: null }));
    updateProgression(clearedSlots);
  };

  const handleAddMeasure = () => {
    if (chordSlots.length >= maxChords) return;
    
    const nextId = chordSlots.length;
    const newSlots = [
      ...chordSlots,
      { id: `bar-${Math.floor(nextId / 4)}`, chord: null, isBarLine: true },
      { id: `slot-${nextId}`, chord: null },
      { id: `slot-${nextId + 1}`, chord: null },
      { id: `slot-${nextId + 2}`, chord: null },
      { id: `slot-${nextId + 3}`, chord: null },
    ];
    
    updateProgression(newSlots.slice(0, maxChords));
  };

  const toggleKeyboardMode = () => {
    if (keyboardMode) {
      // Switching from keyboard to visual mode
      // Parse the keyboard input and update slots
      const chords = keyboardValue.trim().split(/\s+/).filter(c => c.length > 0);
      const newSlots = chords.map((chord, index) => ({
        id: `slot-${index}`,
        chord: chord === '|' ? null : chord,
        isBarLine: chord === '|'
      }));
      
      // Fill remaining slots up to current length
      while (newSlots.length < chordSlots.length) {
        newSlots.push({
          id: `slot-${newSlots.length}`,
          chord: null
        });
      }
      
      updateProgression(newSlots);
    } else {
      // Switching from visual to keyboard mode
      setKeyboardValue(slotsToString(chordSlots));
    }
    
    setKeyboardMode(!keyboardMode);
  };

  const handleKeyboardSubmit = () => {
    onChange(keyboardValue);
    setKeyboardMode(false);
  };

  // Navigation functions for the modal
  const handleNavigateToPrevious = useCallback(() => {
    const editableSlots = getEditableSlots();
    const currentIndex = modalState.currentSlotIndex;
    
    if (currentIndex <= 0 || currentIndex >= editableSlots.length) return;
    
    const previousSlot = editableSlots[currentIndex - 1];
    const slotElement = document.querySelector(`[data-slot-id="${previousSlot.slot.id}"]`) as HTMLElement;
    
    if (slotElement) {
      const rect = slotElement.getBoundingClientRect();
      setModalState({
        isOpen: true,
        slotId: previousSlot.slot.id,
        position: {
          x: rect.right + 10,
          y: rect.top
        },
        currentChord: previousSlot.slot.chord || '',
        currentSlotIndex: currentIndex - 1
      });
    }
  }, [getEditableSlots, modalState.currentSlotIndex]);

  const handleNavigateToNext = useCallback(() => {
    const editableSlots = getEditableSlots();
    const currentIndex = modalState.currentSlotIndex;
    
    if (currentIndex < 0 || currentIndex >= editableSlots.length - 1) return;
    
    const nextSlot = editableSlots[currentIndex + 1];
    const slotElement = document.querySelector(`[data-slot-id="${nextSlot.slot.id}"]`) as HTMLElement;
    
    if (slotElement) {
      const rect = slotElement.getBoundingClientRect();
      setModalState({
        isOpen: true,
        slotId: nextSlot.slot.id,
        position: {
          x: rect.right + 10,
          y: rect.top
        },
        currentChord: nextSlot.slot.chord || '',
        currentSlotIndex: currentIndex + 1
      });
    }
  }, [getEditableSlots, modalState.currentSlotIndex]);

  // Check if navigation is available
  const canNavigatePrevious = modalState.currentSlotIndex > 0;
  const canNavigateNext = modalState.currentSlotIndex >= 0 && 
    modalState.currentSlotIndex < getEditableSlots().length - 1;

  const renderChordSlot = (slot: ChordSlot, index: number) => {
    if (slot.isBarLine) {
      return (
        <div 
          key={slot.id}
          className="flex items-center justify-center w-6 h-12 text-gray-400 text-2xl font-thin select-none"
        >
          |
        </div>
      );
    }

    const hasChord = slot.chord !== null && slot.chord !== '';
    
    return (
      <div
        key={slot.id}
        data-slot-id={slot.id}
        onClick={(e) => handleSlotClick(slot.id, e)}
        className={cn(
          "relative group cursor-pointer transition-all duration-200 select-none",
          "flex items-center justify-center min-w-[4rem] h-12 rounded-lg border-2 border-dashed",
          hasChord
            ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50",
          "hover:shadow-md transform hover:scale-105"
        )}
        title={hasChord ? `Click to edit ${slot.chord}` : "Click to add chord"}
      >
        {hasChord ? (
          <>
            <span className="font-mono font-medium text-blue-700 px-2">
              {slot.chord}
            </span>
            <Button
              onClick={(e) => handleRemoveChord(slot.id, e)}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="destructive"
              size="sm"
              style={{ width: '1.5rem', height: '1.5rem', padding: 0 }}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-center text-gray-500 hover:text-blue-600">
            <Plus className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("chord-progression-input space-y-3", className)}>
      {/* Label and Mode Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          {allowKeyboardInput && (
            <Button
              onClick={toggleKeyboardMode}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              title={keyboardMode ? "Switch to visual mode" : "Switch to keyboard mode"}
            >
              <Keyboard className="h-3 w-3 mr-1" />
              {keyboardMode ? 'Visual' : 'Type'}
            </Button>
          )}
          <Button
            onClick={handleClearAll}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Clear all chords"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Input Interface */}
      {keyboardMode ? (
        <div className="space-y-2">
          <Input
            ref={inputRef}
            value={keyboardValue}
            onChange={(e) => setKeyboardValue(e.target.value)}
            placeholder="e.g., Am F C G | Dm G Em Am"
            className="font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleKeyboardSubmit();
              } else if (e.key === 'Escape') {
                setKeyboardMode(false);
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleKeyboardSubmit} size="sm">
              Apply
            </Button>
            <Button onClick={() => setKeyboardMode(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="chord-slots-container">
          {/* Visual Chord Grid */}
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 rounded-lg border border-gray-200 min-h-[5rem]">
            {chordSlots.map((slot, index) => renderChordSlot(slot, index))}
            
            {/* Add More Button */}
            {chordSlots.length < maxChords && (
              <Button
                onClick={handleAddMeasure}
                variant="ghost"
                className="min-w-[4rem] h-12 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                title="Add measure (4 more chord slots)"
              >
                <Plus className="h-4 w-4 text-green-600" />
                <span className="ml-1 text-xs text-green-600">Measure</span>
              </Button>
            )}
          </div>
          
          {/* Progression Preview */}
          {slotsToString(chordSlots) && (
            <div className="progression-preview">
              <Badge variant="outline" className="font-mono text-xs">
                {slotsToString(chordSlots)}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}

      {/* Chord Builder Modal */}
      <ChordBuilderModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ 
          ...prev, 
          isOpen: false, 
          slotId: null, 
          currentSlotIndex: -1 
        }))}
        onChordSelect={handleChordSelect}
        position={modalState.position}
        currentChord={modalState.currentChord}
        onPrevious={handleNavigateToPrevious}
        onNext={handleNavigateToNext}
        hasPrevious={canNavigatePrevious}
        hasNext={canNavigateNext}
      />
    </div>
  );
};