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
import MinimalChordBuilderModal from './chord-builder-modal-minimal';
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
  helpText = "Click [+] to add chords"
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

  const handleChordSelect = (chord: string, slotId?: string) => {
    const targetSlotId = slotId || modalState.slotId;
    if (!targetSlotId) return;

    const newSlots = chordSlots.map(slot => 
      slot.id === targetSlotId 
        ? { ...slot, chord }
        : slot
    );
    
    updateProgression(newSlots);
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
          className="flex items-center justify-center w-4 h-10 text-gray-400 text-xl font-thin select-none"
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
          "flex items-center justify-center min-w-[2.5rem] h-8 rounded-md border border-dashed transition-all duration-200",
          hasChord
            ? "border-blue-500 bg-blue-50 hover:bg-blue-100 shadow-sm"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50",
          "hover:shadow-sm transform hover:scale-102 hover:-translate-y-0.5"
        )}
        title={hasChord ? `Click to edit ${slot.chord}` : "Click to add chord"}
      >
        {hasChord ? (
          <>
            <span className="font-mono font-semibold text-blue-700 px-1 text-xs">
              {slot.chord}
            </span>
            <Button
              onClick={(e) => handleRemoveChord(slot.id, e)}
              className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="destructive"
              size="sm"
              style={{ width: '1rem', height: '1rem', padding: 0 }}
            >
              <X className="h-2 w-2" />
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-center text-gray-400 hover:text-blue-600 group-hover:scale-110 transition-transform">
            <Plus className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("chord-progression-input space-y-2", className)}>
      {/* Label and Mode Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          {allowKeyboardInput && (
            <Button
              onClick={toggleKeyboardMode}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
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
          <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-br from-gray-50/80 to-blue-50/30 rounded-lg border border-gray-200 min-h-[3.5rem] shadow-sm">
            {chordSlots.map((slot, index) => renderChordSlot(slot, index))}
            
            {/* Add More Button */}
            {chordSlots.length < maxChords && (
              <Button
                onClick={handleAddMeasure}
                variant="ghost"
                className="min-w-[3rem] h-10 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                title="Add measure (4 more chord slots)"
              >
                <Plus className="h-4 w-4 text-green-600" />
                <span className="ml-1 text-xs text-green-600">Measure</span>
              </Button>
            )}
          </div>
          
          {/* Progression Preview */}
          {slotsToString(chordSlots) && (
            <div className="progression-preview mt-1 p-1.5 bg-white/80 rounded-md border border-blue-200/50">
              <div className="text-xs font-medium text-gray-600">Progression:</div>
              <Badge variant="outline" className="font-mono text-xs h-5 px-2 bg-blue-50 border-blue-300 text-blue-800">
                {slotsToString(chordSlots)}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Help Text - Only show when helpful and contextual */}
      {helpText && !keyboardMode && !slotsToString(chordSlots) && (
        <p className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
      {keyboardMode && (
        <p className="text-xs text-muted-foreground">
          Type chord names separated by spaces. Press Enter to apply or Escape to cancel.
        </p>
      )}

      {/* Chord Builder Modal */}
      <MinimalChordBuilderModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ 
          ...prev, 
          isOpen: false, 
          slotId: null, 
          currentSlotIndex: -1 
        }))}
        onChordSelect={(chord) => {
          console.log('🎯 Parent chord select called:', {
            chord,
            targetSlotId: modalState.slotId,
            currentModalState: modalState,
            stackTrace: new Error().stack
          });
          handleChordSelect(chord, modalState.slotId);
        }}
        position={modalState.position}
        currentChord={modalState.currentChord}
        currentSlotId={modalState.slotId}
        onPrevious={handleNavigateToPrevious}
        onNext={handleNavigateToNext}
        hasPrevious={canNavigatePrevious}
        hasNext={canNavigateNext}
      />
    </div>
  );
};