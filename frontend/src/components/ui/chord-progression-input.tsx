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

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import MinimalChordBuilderModal from './chord-builder-modal-minimal';
import ParentKeyBuilderModal from './parent-key-builder-modal';
import { Plus, Edit2, X, Keyboard, Key, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInputMethodFor, useInputMethod, InputMethod } from '../../contexts/InputMethodContext';
import { findChordMatches } from '../../services/chordLogic';

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
  // Parent key signature support
  parentKey?: string;
  onParentKeyChange?: (parentKey: string) => void;
  // Input method support
  useGlobalInputMethod?: boolean;
  componentId?: string;
  midiData?: any;
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
  helpText = "Click [+] to add chords",
  parentKey = '',
  onParentKeyChange,
  useGlobalInputMethod = true,
  componentId,
  midiData
}) => {
  // Use global input method context
  const globalInputMethod = useInputMethodFor(componentId || 'chord-progression-input');
  const rawGlobalContext = useInputMethod();
  
  // Use raw global input method to bypass component-specific preferences
  const activeInputMethod = useGlobalInputMethod ? rawGlobalContext.activeInputMethod : 'mouse';
  
  // Force re-render when input method changes
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  useEffect(() => {
    if (useGlobalInputMethod) {
      setForceUpdateKey(prev => prev + 1);
    }
  }, [activeInputMethod, useGlobalInputMethod]);

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

  // Debug keyboardMode changes
  useEffect(() => {
    console.log('⌨️ keyboardMode changed to:', keyboardMode);
  }, [keyboardMode]);

  // Update keyboard mode based on global input method
  useEffect(() => {
    if (useGlobalInputMethod) {
      const shouldBeKeyboard = activeInputMethod === 'keyboard';
      if (keyboardMode !== shouldBeKeyboard) {
        if (shouldBeKeyboard) {
          // Switching to keyboard mode - create simple chord string
          const chordString = chordSlots
            .filter(slot => !slot.isBarLine && slot.chord)
            .map(slot => slot.chord)
            .join(' ');
          setKeyboardValue(chordString);
        }
        setKeyboardMode(shouldBeKeyboard);
      }
    }
  }, [activeInputMethod, useGlobalInputMethod, keyboardMode, chordSlots]);
  const [parentKeyModalState, setParentKeyModalState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    position: { x: 0, y: 0 }
  });
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
    const index = editableSlots.findIndex(({ slot }) => slot.id === slotId);
    // Ensure we always return a valid index for navigation
    return index >= 0 ? index : 0;
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

    console.log('📍 Slot Click:', {
      slotId,
      editableIndex,
      currentChord: slot?.chord || '',
      rectPosition: { x: rect.left + (rect.width / 2), y: rect.top - 10 }
    });

    setModalState({
      isOpen: true,
      slotId,
      position: {
        x: rect.left + (rect.width / 2),  // Center horizontally above the element
        y: rect.top - 10  // Position above the clicked element
      },
      currentChord: slot?.chord || '',
      currentSlotIndex: editableIndex
    });
  };

  const handleChordSelect = (chord: string, slotId?: string) => {
    const targetSlotId = slotId || modalState.slotId;
    if (!targetSlotId) {
      console.warn('❌ No target slot ID for chord select');
      return;
    }

    console.log('🎯 Chord Select:', {
      chord,
      targetSlotId,
      modalSlotId: modalState.slotId,
      providedSlotId: slotId
    });

    const newSlots = chordSlots.map(slot => {
      if (slot.id === targetSlotId) {
        console.log(`✅ Updating slot ${slot.id} from "${slot.chord}" to "${chord}"`);
        return { ...slot, chord };
      }
      return slot;
    });

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


  const handleParentKeyClick = (event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setParentKeyModalState({
      isOpen: true,
      position: {
        x: rect.left + (rect.width / 2),  // Center horizontally above the element
        y: rect.top - 10  // Position above the clicked element
      }
    });
  };

  const handleParentKeySelect = (key: string) => {
    if (onParentKeyChange) {
      onParentKeyChange(key);
    }
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
    if (useGlobalInputMethod) {
      // Cycle through input methods: midi → keyboard → mouse → midi
      const currentMethod = globalInputMethod.activeInputMethod;
      let nextMethod: InputMethod;
      
      switch (currentMethod) {
        case 'midi':
          nextMethod = 'keyboard';
          break;
        case 'keyboard':
          nextMethod = 'mouse';
          break;
        case 'mouse':
          nextMethod = 'midi';
          break;
        default:
          nextMethod = 'keyboard';
      }
      
      // Use the component-specific setInputMethod to update both global and component preference
      globalInputMethod.setInputMethod(nextMethod);
    } else {
      // Legacy local keyboard mode toggle
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
    }
  };

  const handleKeyboardSubmit = () => {
    onChange(keyboardValue);
    // Don't automatically switch back to visual mode - keep keyboard mode active
    // User can manually switch modes or press Escape to exit
  };

  // Calculate progressive position for any slot based on its visual position
  const calculateProgressivePosition = useCallback((slotIndex: number, fallbackPosition?: { x: number; y: number }) => {
    // Try to get actual button size from first existing chord button
    const firstChordButton = document.querySelector('[data-slot-id]') as HTMLElement;

    if (firstChordButton) {
      const firstRect = firstChordButton.getBoundingClientRect();
      const actualButtonWidth = firstRect.width;
      const actualGap = 8; // Conservative gap between buttons

      // Calculate progressive position based on actual button size
      const progressiveX = firstRect.left + (slotIndex * (actualButtonWidth + actualGap));

      return {
        x: progressiveX + (actualButtonWidth / 2), // Center on the calculated position
        y: firstRect.top - 10
      };
    }

    // Get the chord container as backup
    const chordContainer = document.querySelector('.chord-list .flex-wrap');
    if (chordContainer) {
      const containerRect = chordContainer.getBoundingClientRect();
      // Use much smaller, more realistic spacing
      const estimatedButtonWidth = 45; // More realistic chord button width (was 80!)
      const chordGap = 8;

      const progressiveX = containerRect.left + (slotIndex * (estimatedButtonWidth + chordGap)) + (estimatedButtonWidth / 2);

      return {
        x: progressiveX,
        y: containerRect.top - 10
      };
    }

    // Fallback to provided position with small incremental movement
    if (fallbackPosition) {
      return {
        x: fallbackPosition.x + ((slotIndex - modalState.currentSlotIndex) * 60), // Much smaller increment (was 80!)
        y: fallbackPosition.y
      };
    }

    // Last resort fallback
    return { x: 400, y: 100 };
  }, [modalState.currentSlotIndex]);

  // Navigation functions for the modal
  const handleNavigateToPrevious = useCallback(() => {
    const editableSlots = getEditableSlots();
    const currentIndex = modalState.currentSlotIndex;

    console.log('🔙 Navigate Previous:', {
      currentIndex,
      totalSlots: editableSlots.length,
      canNavigate: currentIndex > 0
    });

    if (currentIndex <= 0 || editableSlots.length === 0) return;

    const previousSlot = editableSlots[currentIndex - 1];
    let position: { x: number; y: number };

    // Check if element exists in DOM
    const slotElement = document.querySelector(`[data-slot-id="${previousSlot.slot.id}"]`) as HTMLElement;

    if (slotElement) {
      // Use actual element position for existing chords
      const rect = slotElement.getBoundingClientRect();
      position = {
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      };
    } else {
      // Calculate progressive position for empty slots (this is the key fix)
      position = calculateProgressivePosition(currentIndex - 1, modalState.position);
    }

    console.log('🔍 Previous slot positioning:', {
      slotId: previousSlot.slot.id,
      chord: previousSlot.slot.chord,
      elementFound: !!slotElement,
      calculatedPosition: position,
      slotIndex: currentIndex - 1
    });

    setModalState({
      isOpen: true,
      slotId: previousSlot.slot.id,
      position: position,
      currentChord: previousSlot.slot.chord || '',
      currentSlotIndex: currentIndex - 1
    });
  }, [getEditableSlots, modalState.currentSlotIndex, modalState.position, calculateProgressivePosition]);

  const handleNavigateToNext = useCallback(() => {
    const editableSlots = getEditableSlots();
    const currentIndex = modalState.currentSlotIndex;

    console.log('▶️ Navigate Next:', {
      currentIndex,
      totalSlots: editableSlots.length,
      canNavigate: currentIndex < editableSlots.length - 1
    });

    if (currentIndex < 0 || currentIndex >= editableSlots.length - 1) return;

    const nextSlot = editableSlots[currentIndex + 1];
    let position: { x: number; y: number };

    // Check if element exists in DOM
    const slotElement = document.querySelector(`[data-slot-id="${nextSlot.slot.id}"]`) as HTMLElement;

    if (slotElement) {
      // Use actual element position for existing chords
      const rect = slotElement.getBoundingClientRect();
      position = {
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      };
    } else {
      // Calculate progressive position for empty slots (this is the key fix)
      position = calculateProgressivePosition(currentIndex + 1, modalState.position);
    }

    console.log('🔍 Next slot positioning:', {
      slotId: nextSlot.slot.id,
      chord: nextSlot.slot.chord,
      elementFound: !!slotElement,
      calculatedPosition: position,
      slotIndex: currentIndex + 1
    });

    setModalState({
      isOpen: true,
      slotId: nextSlot.slot.id,
      position: position,
      currentChord: nextSlot.slot.chord || '',
      currentSlotIndex: currentIndex + 1
    });
  }, [getEditableSlots, modalState.currentSlotIndex, modalState.position, calculateProgressivePosition]);

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
    <div key={`input-method-${activeInputMethod}-${forceUpdateKey}`} className={cn("chord-progression-input space-y-3", className)}>
      {/* Simplified Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          {allowKeyboardInput && (
            <Button
              onClick={toggleKeyboardMode}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              title={useGlobalInputMethod
                ? `Current: ${activeInputMethod.charAt(0).toUpperCase() + activeInputMethod.slice(1)} - Click to switch`
                : (keyboardMode ? "Switch to visual mode" : "Switch to keyboard mode")
              }
            >
              <Keyboard className="h-3 w-3 mr-1" />
              {useGlobalInputMethod
                ? activeInputMethod.charAt(0).toUpperCase() + activeInputMethod.slice(1)
                : (keyboardMode ? 'Visual' : 'Type')
              }
            </Button>
          )}
        </div>
      </div>

      {/* Compact Parent Key Section */}
      <div className="parent-key-section">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground">Parent Key:</Label>
          <button
            onClick={handleParentKeyClick}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md border transition-all duration-200 text-xs font-medium",
              parentKey
                ? "border-green-600 bg-green-900/20 hover:bg-green-900/30 text-green-400"
                : "border-muted hover:border-blue-400 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
            title={parentKey ? `Parent key: ${parentKey}` : "Click to set parent key signature"}
          >
            <Key className="h-3 w-3" />
            <span className="min-w-[3rem]">
              {parentKey || 'Not Set'}
            </span>
            <Plus className="h-2 w-2 opacity-60" />
          </button>
          <span className="text-xs text-muted-foreground">
            (Optional underlying key signature)
          </span>
        </div>
      </div>

      {/* Input Interface */}
      {(() => {
        if (activeInputMethod === 'keyboard') {
          return (
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
                if (useGlobalInputMethod) {
                  globalInputMethod.setInputMethod('mouse');
                } else {
                  setKeyboardMode(false);
                }
              }
            }}
            onBlur={handleKeyboardSubmit} // Auto-apply when focus is lost
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Type chord names separated by spaces. Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to apply or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Escape</kbd> to return to visual mode.
          </p>
        </div>
          );
        } else if (activeInputMethod === 'midi') {
          return (
        <div className="space-y-4">
          {/* MIDI Input Interface */}
          <div className="midi-input-section bg-muted/20 border border-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">MIDI Input Active</span>
                {midiData?.deviceName && (
                  <span className="text-xs text-muted-foreground">({midiData.deviceName})</span>
                )}
              </div>
            </div>

            {/* MIDI Analysis Focus */}
            {midiData && midiData.setAnalysisFocus && (
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="text-muted-foreground">Detection mode:</span>
                <div className="flex gap-1">
                  {(['automatic', 'chord', 'complete'] as const).map(focus => {
                    const focusLabels = {
                      automatic: { label: 'Smart', tooltip: 'Automatically detects chords, scales, or individual notes' },
                      chord: { label: 'Chords', tooltip: 'Focus on chord detection - best for chord progressions' },
                      complete: { label: 'Full Scale', tooltip: 'Analyze complete scales and modes' }
                    };

                    return (
                      <button
                        key={focus}
                        onClick={() => midiData.setAnalysisFocus(focus)}
                        className={cn(
                          "px-2 py-1 rounded transition-colors text-xs",
                          midiData.analysisFocus === focus
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        )}
                        title={focusLabels[focus].tooltip}
                      >
                        {focusLabels[focus].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current MIDI Detection */}
            {midiData?.playedNotes && midiData.playedNotes.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Currently playing:</div>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(midiData.playedNotes)).map((note: any, idx: number) => {
                    // Handle both string notes and note objects
                    let noteName;
                    if (typeof note === 'string') {
                      noteName = note;
                    } else {
                      // For note objects, include accidental if present
                      const baseName = note.name || note.noteName || '';
                      const accidental = note.accidental || '';
                      noteName = baseName + accidental || `${note.number || ''}`;
                    }
                    return (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {noteName}
                      </Badge>
                    );
                  })}
                </div>

                {/* Try to detect chord from played notes using proper chord detection */}
                {(() => {
                  // Only show chord detection when in chord mode or smart mode (not in Full Scale mode)
                  if (midiData.playedNotes.length >= 3 && midiData.analysisFocus !== 'complete') {
                    // Convert notes to MIDI numbers for chord detection
                    const midiNumbers = midiData.playedNotes.map((note: any) => {
                      return typeof note === 'number' ? note : (note.number || note.noteNumber || 60);
                    });

                    // Use existing chord detection logic
                    const detectedChords = findChordMatches(midiNumbers);
                    const bestChord = detectedChords[0];

                    if (bestChord) {
                      return (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Detected chord:</span>
                          <Badge variant="secondary" className="ml-2 text-sm font-semibold bg-green-100 text-green-800 border-green-300">
                            {bestChord.chordSymbol}
                          </Badge>
                          <div className="inline-flex items-center gap-2 ml-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-6 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                // Find next empty slot and add the detected chord
                                const emptySlot = chordSlots.find(slot => !slot.isBarLine && !slot.chord);
                                if (emptySlot) {
                                  handleChordSelect(bestChord.chordSymbol, emptySlot.id);
                                  // Clear the currently playing notes after adding to progression
                                  if (midiData?.clearPlayedNotes) {
                                    midiData.clearPlayedNotes();
                                  }
                                }
                              }}
                            >
                              Add to Progression
                            </Button>
                            {midiData?.clearPlayedNotes && midiData?.playedNotes?.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={midiData.clearPlayedNotes}
                                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                                title="Clear currently playing MIDI notes"
                              >
                                Clear Notes
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      // Show notes if no chord detected
                      const noteNames = midiData.playedNotes.map((note: any) => {
                        return typeof note === 'string' ? note : (note.name || note.noteName || `Note${note.number || ''}`);
                      });
                      const noteSet = Array.from(new Set(noteNames));

                      return (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Playing {noteSet.length} notes:</span>
                          <Badge className="ml-2 text-sm font-medium" variant="outline">
                            {noteSet.join(' ')}
                          </Badge>
                          <span className="ml-2 text-xs text-muted-foreground">
                            (No chord detected)
                          </span>
                          {midiData?.clearPlayedNotes && midiData?.playedNotes?.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={midiData.clearPlayedNotes}
                              className="ml-2 text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                              title="Clear currently playing MIDI notes"
                            >
                              Clear Notes
                            </Button>
                          )}
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {midiData ? (
                  <>Play chords on your MIDI device to detect and add them to your progression</>
                ) : (
                  <>MIDI not connected. Connect a MIDI device to use this feature.</>
                )}
              </div>
            )}
          </div>

          {/* Show current progression even in MIDI mode */}
          {slotsToString(chordSlots) && (
            <div className="mt-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">Current progression:</div>
              <Badge variant="outline" className="font-mono text-xs">
                {slotsToString(chordSlots)}
              </Badge>
            </div>
          )}
        </div>
          );
        } else {
          // Default mouse/visual interface
          return (
            <div className="chord-list-container">
          {/* Simplified Chord List - Consistent Left-Aligned Layout */}
          <div className="chord-list bg-card rounded-lg border border-border p-3 pt-4">
            {/* Progression direction indicator */}
            <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>Chord progression flows left to right</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Always show existing chords first */}
              {chordSlots.map((slot, _index) => {
                if (slot.isBarLine || !slot.chord) return null;
                return (
                  <div key={slot.id} className="relative group">
                    <button
                      data-slot-id={slot.id}
                      onClick={(e) => handleSlotClick(slot.id, e)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md transition-all duration-200"
                      title={`Click to edit ${slot.chord}`}
                    >
                      <span className="font-semibold text-primary text-sm">{slot.chord}</span>
                    </button>
                    {/* Remove button positioned absolutely to avoid nested button */}
                    <button
                      onClick={(e) => handleRemoveChord(slot.id, e)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full flex items-center justify-center text-xs z-10"
                      title={`Remove ${slot.chord}`}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                );
              })}

              {/* Add chord button - always present */}
              <button
                onClick={(e) => {
                  // Find next empty slot
                  const emptySlot = chordSlots.find(slot => !slot.isBarLine && !slot.chord);
                  console.log('➕ Add chord clicked:', {
                    emptySlot: emptySlot?.id,
                    allSlots: chordSlots.map(s => ({ id: s.id, chord: s.chord, isBarLine: s.isBarLine }))
                  });
                  if (emptySlot) {
                    handleSlotClick(emptySlot.id, e);
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 rounded-md transition-all duration-200"
                title={chordSlots.filter(slot => !slot.isBarLine && slot.chord).length > 0 ? "Add another chord" : "Click to add your first chord"}
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">
                  {chordSlots.filter(slot => !slot.isBarLine && slot.chord).length > 0 ? "Add Chord" : "Add First Chord"}
                </span>
              </button>
            </div>

            {/* Compact Progression Summary */}
            {slotsToString(chordSlots) && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Progression:</span>
                  <Badge variant="outline" className="font-mono text-xs bg-muted/20 border-muted-foreground/20">
                    {slotsToString(chordSlots)}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      })()}


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
          handleChordSelect(chord, modalState.slotId || undefined);
        }}
        position={modalState.position}
        currentChord={modalState.currentChord}
        currentSlotId={modalState.slotId}
        onPrevious={handleNavigateToPrevious}
        onNext={handleNavigateToNext}
        hasPrevious={canNavigatePrevious}
        hasNext={canNavigateNext}
      />

      {/* Parent Key Builder Modal */}
      <ParentKeyBuilderModal
        isOpen={parentKeyModalState.isOpen}
        onClose={() => setParentKeyModalState(prev => ({ ...prev, isOpen: false }))}
        onKeySelect={handleParentKeySelect}
        position={parentKeyModalState.position}
        currentKey={parentKey}
      />
    </div>
  );
};
