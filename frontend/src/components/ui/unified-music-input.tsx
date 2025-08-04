import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import DelightfulButton from './delightful-button';
import MidiVisualizer from './midi-visualizer';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './tooltip';
import { NOTES } from '../../constants/scales';
import { findChordMatches, ChordMatch } from '../../services/chordLogic';
import { NotePlayed } from '../../types';

export type InputMethod = 'keyboard' | 'mouse' | 'midi';
export type InputType = 'melody' | 'scale' | 'chord' | 'progression';

interface UnifiedMusicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  inputType?: InputType;
  className?: string;
  // Enhanced MIDI integration
  midiData?: {
    playedNotes: NotePlayed[];
    playedPitchClasses: Set<number>;
    isActive: boolean;
    status: string;
    clearPlayedNotes: () => void;
    analysisFocus: 'automatic' | 'complete' | 'pentatonic' | 'chord';
    setAnalysisFocus: (focus: 'automatic' | 'complete' | 'pentatonic' | 'chord') => void;
  };
  // Validation and feedback
  onValidation?: (isValid: boolean, suggestions?: string[]) => void;
  showSuggestions?: boolean;
  enableChordRecognition?: boolean;
  // Callbacks for specific actions
  onChordDetected?: (chords: ChordMatch[]) => void;
  onNotesChanged?: (notes: string[], pitchClasses: number[]) => void;
}

// Enhanced chord and note data
const CHROMATIC_NOTES = NOTES.map(note => note.split('/')[0]); // Use first spelling
const COMMON_CHORDS = [
  'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', // C major diatonic
  'Cm', 'D', 'E♭', 'Fm', 'Gm', 'A♭', 'B♭', // Additional common chords
  'C7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5'
];
const CHORD_INVERSIONS = ['root', '1st inv', '2nd inv', '3rd inv'];
const ROMAN_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

// Input validation patterns
const NOTE_PATTERN = /^[A-G][#b♯♭]?$/;
const CHORD_PATTERN = /^[A-G][#b♯♭]?(maj|min|m|M|\+|dim|aug|sus|add|°)?[0-9]*$/;
const ROMAN_PATTERN = /^[ivxIVX]+[°+]?$/;

const UnifiedMusicInput: React.FC<UnifiedMusicInputProps> = ({
  value,
  onChange,
  placeholder = "Enter notes or chords...",
  label,
  inputType = 'melody',
  className,
  midiData,
  onValidation,
  showSuggestions = true,
  enableChordRecognition = true,
  onChordDetected,
  onNotesChanged
}) => {
  const [activeInputMethod, setActiveInputMethod] = useState<InputMethod>('keyboard');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    suggestions: string[];
    detectedChords: ChordMatch[];
  }>({ isValid: true, suggestions: [], detectedChords: [] });
  const [inputHistory, setInputHistory] = useState<string[]>([]);

  // Enhanced input validation and parsing
  const validateInput = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return { isValid: true, suggestions: [], detectedChords: [] };

    const tokens = trimmed.split(/[\s,]+/).filter(t => t.length > 0);
    const suggestions: string[] = [];
    const detectedChords: ChordMatch[] = [];
    let isValid = true;

    // Validate based on input type
    if (inputType === 'melody' || inputType === 'scale') {
      tokens.forEach(token => {
        if (!NOTE_PATTERN.test(token)) {
          isValid = false;
          suggestions.push(`'${token}' is not a valid note name. Try: C, D, E, F, G, A, B (with optional # or b)`);
        }
      });
    } else if (inputType === 'chord') {
      tokens.forEach(token => {
        if (!CHORD_PATTERN.test(token) && !ROMAN_PATTERN.test(token)) {
          isValid = false;
          suggestions.push(`'${token}' is not a valid chord. Try: C, Dm, Am7, etc.`);
        }
      });
    } else if (inputType === 'progression') {
      // More flexible validation for chord progressions
      tokens.forEach(token => {
        if (!CHORD_PATTERN.test(token) && !ROMAN_PATTERN.test(token)) {
          isValid = false;
          suggestions.push(`'${token}' is not a valid chord in progression`);
        }
      });
    }

    return { isValid, suggestions, detectedChords };
  }, [inputType]);

  // Convert note names to pitch classes for chord recognition
  const notesToPitchClasses = useCallback((notes: string[]): number[] => {
    return notes.map(note => {
      const normalizedNote = note.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
      const noteIndex = NOTES.findIndex(n => {
        const noteParts = n.toUpperCase().split('/');
        return noteParts.some(part => part === normalizedNote);
      });
      return noteIndex !== -1 ? noteIndex : 0;
    });
  }, []);

  // Handle note/chord selection from visual picker
  const handleNoteToggle = useCallback((note: string) => {
    const currentNotes = value.split(/[\s,]+/).filter(n => n.trim());
    const isSelected = currentNotes.includes(note);
    
    let newNotes;
    if (isSelected) {
      newNotes = currentNotes.filter(n => n !== note);
    } else {
      newNotes = [...currentNotes, note];
    }
    
    const newValue = newNotes.join(' ');
    onChange(newValue);
    setSelectedNotes(newNotes);

    // Trigger chord recognition if enabled
    if (enableChordRecognition && newNotes.length >= 3 && (inputType === 'chord' || inputType === 'scale')) {
      const pitchClasses = notesToPitchClasses(newNotes);
      const midiNotes = pitchClasses.map(pc => pc + 60); // Convert to MIDI note numbers
      const chords = findChordMatches(midiNotes);
      if (chords.length > 0 && onChordDetected) {
        onChordDetected(chords);
      }
    }

    // Trigger notes changed callback
    if (onNotesChanged) {
      const pitchClasses = notesToPitchClasses(newNotes);
      onNotesChanged(newNotes, pitchClasses);
    }
  }, [value, onChange, enableChordRecognition, inputType, notesToPitchClasses, onChordDetected, onNotesChanged]);

  // Enhanced MIDI input integration with chord recognition
  useEffect(() => {
    if (midiData && midiData.playedNotes.length > 0) {
      setActiveInputMethod('midi');
      
      // Convert MIDI notes to note names
      const noteNames = midiData.playedNotes.map(note => {
        const noteName = note.accidental ? `${note.name}${note.accidental}` : note.name;
        return noteName;
      });
      
      // For chord input type, detect chords from simultaneous notes
      if (inputType === 'chord' && enableChordRecognition && midiData.analysisFocus === 'chord') {
        if (noteNames.length >= 3) {
          const midiNumbers = midiData.playedNotes.map(note => note.number);
          const chords = findChordMatches(midiNumbers);
          
          if (chords.length > 0) {
            // Use the best matching chord
            const bestChord = chords[0];
            onChange(bestChord.chordSymbol);
            
            setValidationState(prev => ({
              ...prev,
              detectedChords: chords
            }));
            
            if (onChordDetected) {
              onChordDetected(chords);
            }
            return;
          }
        }
      }
      
      // For melody/scale input, accumulate notes
      if (inputType === 'melody' || inputType === 'scale') {
        // Use pitch classes to avoid duplicates but preserve order for melody
        if (inputType === 'melody') {
          // For melody, preserve the sequence order
          const currentNotes = value.split(/[\s,]+/).filter(n => n.trim());
          const newNotes = [...currentNotes, ...noteNames];
          onChange(newNotes.join(' '));
        } else {
          // For scale, remove duplicates by pitch class
          const currentNotes = value.split(/[\s,]+/).filter(n => n.trim());
          const existingPitchClasses = new Set(notesToPitchClasses(currentNotes));
          const newPitchClasses = notesToPitchClasses(noteNames);
          
          const uniqueNewNotes = noteNames.filter((_, idx) => 
            !existingPitchClasses.has(newPitchClasses[idx])
          );
          
          if (uniqueNewNotes.length > 0) {
            const allNotes = [...currentNotes, ...uniqueNewNotes];
            onChange(allNotes.join(' '));
          }
        }
      }
      
      // Trigger callbacks (removed from dependency array to prevent infinite loops)
      if (onNotesChanged) {
        const pitchClasses = noteNames.map(note => {
          const normalizedNote = note.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
          const noteIndex = NOTES.findIndex(n => {
            const noteParts = n.toUpperCase().split('/');
            return noteParts.some(part => part === normalizedNote);
          });
          return noteIndex !== -1 ? noteIndex : 0;
        });
        onNotesChanged(noteNames, pitchClasses);
      }
    }
  }, [midiData?.playedNotes, midiData?.analysisFocus, inputType, enableChordRecognition, onChange, value]);

  // Validation effect
  useEffect(() => {
    const validation = validateInput(value);
    setValidationState(validation);
    // Call onValidation but don't include it in dependencies to prevent infinite loops
    if (onValidation) {
      onValidation(validation.isValid, validation.suggestions);
    }
  }, [value, inputType]);

  // Add to input history on successful validation
  useEffect(() => {
    if (value && validationState.isValid && !inputHistory.includes(value)) {
      setInputHistory(prev => [value, ...prev.slice(0, 4)]); // Keep last 5 entries
    }
  }, [value, validationState.isValid, inputHistory]);

  // Enhanced input method configuration
  const inputMethods = useMemo(() => [
    { 
      id: 'keyboard' as const, 
      label: 'Type', 
      icon: '⌨️', 
      description: `Type ${inputType === 'progression' ? 'chord symbols or Roman numerals' : inputType === 'chord' ? 'chord name' : 'note names'} directly`
    },
    { 
      id: 'mouse' as const, 
      label: 'Click', 
      icon: '🖱️', 
      description: `Click to select ${inputType === 'chord' || inputType === 'progression' ? 'chords' : 'notes'}`
    },
    { 
      id: 'midi' as const, 
      label: 'Play', 
      icon: '🎹', 
      description: `Play your MIDI keyboard${inputType === 'chord' ? ' (hold notes for chords)' : ''}`
    },
  ], [inputType]);

  // Dynamic input data based on type
  const currentInputData = useMemo(() => {
    switch (inputType) {
      case 'chord':
        return COMMON_CHORDS;
      case 'progression':
        return [...COMMON_CHORDS, ...ROMAN_NUMERALS];
      case 'melody':
      case 'scale':
      default:
        return CHROMATIC_NOTES;
    }
  }, [inputType]);

  const currentValueArray = value.split(/[\s,]+/).filter(n => n.trim());
  
  // Enhanced placeholder text
  const dynamicPlaceholder = useMemo(() => {
    if (placeholder !== "Enter notes or chords...") return placeholder;
    
    switch (inputType) {
      case 'melody':
        return "Enter melody notes (e.g., C D E F G)";
      case 'scale':
        return "Enter scale notes (e.g., C D E F G A B)";
      case 'chord':
        return "Enter chord name (e.g., Cmaj7, Am)";
      case 'progression':
        return "Enter chord progression (e.g., C G Am F)";
      default:
        return "Enter musical input...";
    }
  }, [placeholder, inputType]);

  return (
    <TooltipProvider>
      <div className={cn("unified-music-input space-y-4", className)}>
      {/* Enhanced Label with Status */}
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <span>
              {inputType === 'chord' ? '🎹' : 
               inputType === 'progression' ? '🎼' :
               inputType === 'melody' ? '🎵' : '🎶'}
            </span>
            {label}
          </Label>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {midiData?.isActive && (
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                MIDI
              </Badge>
            )}
            {validationState.detectedChords.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs cursor-help">
                    {validationState.detectedChords.length} chord{validationState.detectedChords.length > 1 ? 's' : ''}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    {validationState.detectedChords.slice(0, 3).map(chord => (
                      <div key={chord.chordSymbol}>{chord.chordSymbol} - {chord.chordName}</div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {!validationState.isValid && (
              <Badge variant="destructive" className="text-xs">
                Invalid
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Input Method Selector */}
      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
        {inputMethods.map((method) => {
          const isDisabled = method.id === 'midi' && !midiData?.isActive;
          return (
            <Tooltip key={method.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => !isDisabled && setActiveInputMethod(method.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    activeInputMethod === method.id
                      ? "bg-background shadow-sm text-foreground"
                      : isDisabled
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <span>{method.icon}</span>
                  {method.label}
                  {method.id === 'midi' && midiData?.isActive && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{method.description}</p>
                {isDisabled && (
                  <p className="text-xs text-muted-foreground">MIDI device not connected</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Input Method Content */}
      <div className="space-y-3">
        {/* Enhanced Keyboard Input */}
        {activeInputMethod === 'keyboard' && (
          <div className="space-y-3">
            <div className="relative">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={dynamicPlaceholder}
                className={cn(
                  "transition-all duration-200 focus:shadow-md pr-20",
                  !validationState.isValid && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {/* Clear button */}
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                >
                  ×
                </Button>
              )}
            </div>
            
            {/* Validation feedback */}
            {!validationState.isValid && validationState.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-destructive font-medium">Input issues:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {validationState.suggestions.slice(0, 3).map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Input format help */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Format examples:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {inputType === 'melody' && (
                  <><span>• C D E F G A B</span><span>• C# Eb F# Ab</span></>
                )}
                {inputType === 'scale' && (
                  <><span>• C D E F G A B</span><span>• C Eb F G Bb</span></>
                )}
                {inputType === 'chord' && (
                  <><span>• Cmaj7</span><span>• Am, F#dim</span></>
                )}
                {inputType === 'progression' && (
                  <><span>• C G Am F</span><span>• I V vi IV</span></>
                )}
              </div>
            </div>
            
            {/* Input history */}
            {inputHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recent inputs:</p>
                <div className="flex flex-wrap gap-1">
                  {inputHistory.slice(0, 3).map((historyItem, idx) => (
                    <button
                      key={idx}
                      onClick={() => onChange(historyItem)}
                      className="text-xs px-2 py-1 bg-muted/50 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {historyItem.length > 20 ? `${historyItem.slice(0, 20)}...` : historyItem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Mouse Input - Visual Picker */}
        {activeInputMethod === 'mouse' && (
          <div className="space-y-4">
            {/* Category selector for chord progressions */}
            {inputType === 'progression' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Quick select:</span>
                <button
                  onClick={() => onChange('C G Am F')}
                  className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded text-primary transition-colors"
                >
                  vi-IV-I-V
                </button>
                <button
                  onClick={() => onChange('Am F C G')}
                  className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded text-primary transition-colors"
                >
                  Pop progression
                </button>
              </div>
            )}
            
            {/* Enhanced grid layout based on input type */}
            <div className={cn(
              "grid gap-2",
              inputType === 'chord' || inputType === 'progression' 
                ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"
                : "grid-cols-6 sm:grid-cols-8 md:grid-cols-12"
            )}>
              {currentInputData.map((item) => {
                const isSelected = currentValueArray.includes(item);
                const isChordButton = inputType === 'chord' || inputType === 'progression';
                
                return (
                  <Tooltip key={item}>
                    <TooltipTrigger asChild>
                      <DelightfulButton
                        onClick={() => handleNoteToggle(item)}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "transition-all duration-200 hover:scale-105",
                          isChordButton ? "h-10" : "aspect-square",
                          isSelected && "shadow-md scale-105 border-primary"
                        )}
                        musical={!isChordButton}
                        sparkle={isSelected}
                      >
                        {item}
                      </DelightfulButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {isChordButton 
                          ? `Add ${item} to progression`
                          : `Add ${item} note`
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            
            {/* Enhanced selected items display */}
            {currentValueArray.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Selected ({currentValueArray.length}):
                  </span>
                  {enableChordRecognition && currentValueArray.length >= 3 && (inputType === 'chord' || inputType === 'scale') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const pitchClasses = notesToPitchClasses(currentValueArray);
                        const midiNotes = pitchClasses.map(pc => pc + 60);
                        const chords = findChordMatches(midiNotes);
                        if (chords.length > 0 && onChordDetected) {
                          onChordDetected(chords);
                        }
                      }}
                      className="text-xs h-6"
                    >
                      🎵 Analyze
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md">
                  {currentValueArray.map((item, index) => (
                    <Badge
                      key={`${item}-${index}`}
                      variant="secondary"
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                      onClick={() => handleNoteToggle(item)}
                    >
                      {item}
                      <span className="w-3 h-3 flex items-center justify-center text-xs hover:bg-destructive/30 rounded">
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>
                
                {/* Chord analysis results */}
                {validationState.detectedChords.length > 0 && (
                  <div className="p-2 bg-primary/5 rounded-md border border-primary/20">
                    <p className="text-xs font-medium text-primary mb-1">Detected chords:</p>
                    <div className="flex flex-wrap gap-1">
                      {validationState.detectedChords.slice(0, 3).map(chord => (
                        <Badge key={chord.chordSymbol} variant="outline" className="text-xs">
                          {chord.chordSymbol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <DelightfulButton
                onClick={() => onChange('')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Clear All
              </DelightfulButton>
              <DelightfulButton
                onClick={() => {
                  const randomSelection = currentInputData
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(Math.random() * 4) + 3);
                  onChange(randomSelection.join(' '));
                }}
                variant="outline"
                size="sm"
                className="flex-1"
                sparkle
              >
                🎲 Random
              </DelightfulButton>
            </div>
          </div>
        )}

        {/* Enhanced MIDI Input */}
        {activeInputMethod === 'midi' && (
          <div className="space-y-4">
            {/* MIDI Analysis Focus Selector */}
            {midiData && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Analysis focus:</span>
                <div className="flex gap-1">
                  {(['automatic', 'chord', 'complete'] as const).map(focus => (
                    <button
                      key={focus}
                      onClick={() => midiData.setAnalysisFocus(focus)}
                      className={cn(
                        "px-2 py-1 rounded transition-colors",
                        midiData.analysisFocus === focus
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      {focus === 'automatic' ? 'Auto' : focus === 'chord' ? 'Chord' : 'Scale'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <MidiVisualizer 
              playedNotes={midiData?.playedNotes?.map(note => {
                const noteName = note.accidental ? `${note.name}${note.accidental}` : note.name;
                return noteName;
              }) || []}
              isActive={midiData?.isActive || false}
            />
            
            {/* Enhanced MIDI input display */}
            <div className="space-y-2">
              {midiData?.status && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={cn(
                    "font-medium",
                    midiData.isActive ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {midiData.status}
                  </span>
                </div>
              )}
              
              {value && (
                <div className="bg-muted/50 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Detected:</span>
                    <span className="font-mono text-sm text-foreground">{value}</span>
                  </div>
                </div>
              )}
              
              {midiData?.playedPitchClasses && midiData.playedPitchClasses.size > 0 && (
                <div className="bg-primary/5 rounded-md p-3 border border-primary/20">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-primary font-medium">Live notes:</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(midiData.playedPitchClasses).map(pc => (
                        <Badge key={pc} variant="outline" className="text-xs">
                          {NOTES[pc].split('/')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* MIDI controls */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {midiData?.isActive 
                  ? "🎹 MIDI connected - play your keyboard!"
                  : "🔌 Connect a MIDI keyboard to use this input method"
                }
              </p>
              
              {midiData?.clearPlayedNotes && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={midiData.clearPlayedNotes}
                  className="text-xs h-6"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Dynamic Examples */}
      {!value && (
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Quick examples:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {inputType === 'melody' && (
              <>
                <DelightfulButton
                  onClick={() => onChange('C D E F G A B C')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  musical
                >
                  🎵 Major scale
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('C D E♭ F G A♭ B♭ C')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  musical
                >
                  🎵 Minor scale
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('C E F G B♭ C')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  musical
                  sparkle
                >
                  🎵 Pentatonic
                </DelightfulButton>
              </>
            )}
            
            {inputType === 'scale' && (
              <>
                <DelightfulButton
                  onClick={() => onChange('C D E F G A B')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  C Major
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('D E F G A B C')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  D Dorian
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('G A B C D E F')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  sparkle
                >
                  G Mixolydian
                </DelightfulButton>
              </>
            )}
            
            {inputType === 'chord' && (
              <>
                <DelightfulButton
                  onClick={() => onChange('Cmaj7')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cmaj7
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('Am7')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Am7
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('F#dim7')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  sparkle
                >
                  F#dim7
                </DelightfulButton>
              </>
            )}
            
            {inputType === 'progression' && (
              <>
                <DelightfulButton
                  onClick={() => onChange('C G Am F')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  🎼 vi-IV-I-V
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('Am F C G')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  🎼 Pop progression
                </DelightfulButton>
                <DelightfulButton
                  onClick={() => onChange('I V vi IV')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  sparkle
                >
                  🎼 Roman numerals
                </DelightfulButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
};

export default UnifiedMusicInput;