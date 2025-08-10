/**
 * Ultra-Minimal Chord Builder Modal
 * Compact modal with essential functionality including bass note selection
 * Optimized for better UX with adequate touch targets
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const NOTE_DISPLAY = ['C', 'C#', 'D', 'E♭', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];
const CHORD_QUALITIES = [
  { symbol: '', name: 'Major' },
  { symbol: 'm', name: 'Minor' },
  { symbol: '7', name: 'Dominant 7' },
  { symbol: 'maj7', name: 'Major 7' },
  { symbol: 'm7', name: 'Minor 7' },
  { symbol: 'dim', name: 'Diminished' },
  { symbol: 'sus4', name: 'Suspended 4' },
  { symbol: 'sus2', name: 'Suspended 2' }
];

interface MinimalChordBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChordSelect: (chord: string) => void;
  position: { x: number; y: number };
  currentChord?: string;
  currentSlotId?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const MinimalChordBuilderModal: React.FC<MinimalChordBuilderModalProps> = ({
  isOpen,
  onClose,
  onChordSelect,
  position,
  currentChord = '',
  currentSlotId,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  const [selectedRoot, setSelectedRoot] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<typeof CHORD_QUALITIES[0] | null>(null);
  const [selectedBassNote, setSelectedBassNote] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);
  const hasUserMadeChangesRef = useRef(false);
  const originalChordRef = useRef<string>('');

  // Track if we need to reset due to slot change
  const prevSlotIdRef = useRef(currentSlotId);

  // Parse current chord or reset to defaults
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      setSelectedRoot(null);
      setSelectedQuality(null);
      setSelectedBassNote(null);
      prevSlotIdRef.current = null;
      hasUserMadeChangesRef.current = false;
      originalChordRef.current = '';
      return;
    }

    // Always reset when changing slots or opening fresh
    const slotChanged = prevSlotIdRef.current !== currentSlotId;
    if (slotChanged || prevSlotIdRef.current === null) {
      console.log('🔄 Slot changed or fresh open:', {
        prevSlot: prevSlotIdRef.current,
        currentSlot: currentSlotId,
        currentChord,
        resettingChangesFlag: true
      });
      setSelectedRoot(null);
      setSelectedQuality(null);
      setSelectedBassNote(null);
      prevSlotIdRef.current = currentSlotId;
      hasUserMadeChangesRef.current = false; // Always reset when switching slots
    }

    // Store the original chord for comparison
    originalChordRef.current = currentChord || '';
    console.log('📝 Set original chord ref:', originalChordRef.current);

    if (currentChord && currentChord.trim()) {
      // Parse existing chord after a brief delay to ensure state is reset
      const currentSlotCapture = currentSlotId; // Capture the current slot at time of setTimeout
      setTimeout(() => {
        // Double-check we're still on the same slot to avoid race conditions
        if (prevSlotIdRef.current === currentSlotCapture) {
          console.log('🔍 Parsing chord:', currentChord, 'for slot:', currentSlotCapture);
          // Enhanced parsing to handle slash chords (e.g., "Am/C")
          const slashMatch = currentChord.match(/^([A-G][#♯♭b]?)([^/]*)(?:\/([A-G][#♯♭b]?))?$/);
          if (slashMatch) {
            const [, root, quality, bassNote] = slashMatch;

            // Parse root note
            const rootIndex = NOTE_DISPLAY.findIndex(note =>
              note === root || note.includes(root.replace('♯', '#').replace('♭', 'b'))
            );
            if (rootIndex !== -1) setSelectedRoot(rootIndex);

            // Parse chord quality
            const qualityMatch = CHORD_QUALITIES.find(q => q.symbol === quality);
            if (qualityMatch) setSelectedQuality(qualityMatch);

            // Parse bass note if present
            if (bassNote) {
              const bassIndex = NOTE_DISPLAY.findIndex(note =>
                note === bassNote || note.includes(bassNote.replace('♯', '#').replace('♭', 'b'))
              );
              if (bassIndex !== -1) setSelectedBassNote(bassIndex);
            }
          }
        } else {
          console.log('⚠️ Slot changed during parsing, skipping. Expected:', currentSlotCapture, 'Current:', prevSlotIdRef.current);
        }
      }, 10);
    }
  }, [currentChord, isOpen, currentSlotId]);

  // Close on escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        // Don't trigger on navigation button clicks (they handle their own saving)
        const target = e.target as HTMLElement;
        if (target.closest('.chord-builder-modal-overlay')) {
          console.log('🚫 Click outside ignored - navigation button click');
          return;
        }

        console.log('👆 Click outside detected, saving if changed');
        // Save chord only if user made changes AND chord is different from current slot
        const chord = buildChord();
        if (chord && hasUserMadeChangesRef.current && hasChordChanged()) {
          console.log('💾 Saving on click outside');
          onChordSelect(chord);
        }
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getModalStyle = () => {
    if (!isOpen) return { display: 'none' };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 220;
    const modalHeight = 320;

    let x = position.x;
    let y = position.y;

    if (x + modalWidth > viewportWidth - 20) {
      x = position.x - modalWidth - 20;
    } else {
      x = position.x + 20;
    }

    if (y + modalHeight > viewportHeight - 40) {
      y = Math.max(20, viewportHeight - modalHeight - 40);
    }

    return {
      position: 'fixed' as const,
      left: x,
      top: y,
      zIndex: 1000,
    };
  };

  const buildChord = () => {
    if (selectedRoot === null || selectedQuality === null) return '';
    const rootNote = NOTE_DISPLAY[selectedRoot];
    const chord = `${rootNote}${selectedQuality.symbol}`;

    // Add bass note if different from root
    if (selectedBassNote !== null && selectedBassNote !== selectedRoot) {
      const bassNote = NOTE_DISPLAY[selectedBassNote];
      return `${chord}/${bassNote}`;
    }

    return chord;
  };

  const hasChordChanged = () => {
    const currentBuiltChord = buildChord();
    return currentBuiltChord !== originalChordRef.current;
  };

  // Real-time chord updates - DISABLED to prevent race conditions
  // useEffect(() => {
  //   // Skip if we're navigating or if we haven't made user changes
  //   if (!hasUserMadeChangesRef.current || isNavigatingRef.current) {
  //     return;
  //   }
  //
  //   if (selectedRoot !== null && selectedQuality !== null && currentChord && currentChord.trim()) {
  //     const chord = buildChord();
  //     console.log('🔄 Real-time update check:', {
  //       chord,
  //       currentChord,
  //       hasUserMadeChanges: hasUserMadeChangesRef.current,
  //       isNavigating: isNavigatingRef.current,
  //       different: chord !== currentChord,
  //       willUpdate: chord && chord !== currentChord
  //     });
  //     if (chord && chord !== currentChord) {
  //       console.log('✅ Real-time update triggered');
  //       // Only auto-update if we're editing an existing chord, not a blank one
  //       onChordSelect(chord);
  //     }
  //   }
  // }, [selectedRoot, selectedQuality, onChordSelect, currentChord]);

  if (!isOpen) return null;

  return (
    <div className="chord-builder-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
      <Card
        ref={modalRef}
        className="chord-builder-modal shadow-xl border-2 animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col"
        style={{...getModalStyle(), width: '220px', maxHeight: '320px'}}
      >
        <CardContent className="p-3 space-y-2 overflow-auto max-h-full">
          {/* Header - Chord name and navigation with visual progression indicators */}
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                isNavigatingRef.current = true;
                // Save chord only if user made changes AND chord is different from current slot
                const chord = buildChord();
                const hasChanges = hasUserMadeChangesRef.current;
                const chordChanged = hasChordChanged();
                console.log('⬅️ Previous navigation:', {
                  chord,
                  hasUserMadeChanges: hasChanges,
                  hasChordChanged: chordChanged,
                  originalChord: originalChordRef.current,
                  willSave: chord && hasChanges && chordChanged
                });
                if (chord && hasChanges && chordChanged) {
                  onChordSelect(chord);
                }
                onPrevious?.();
                // Reset navigation flag after a short delay
                setTimeout(() => { isNavigatingRef.current = false; }, 100);
              }}
              disabled={!hasPrevious}
              className={cn(
                "h-4 w-4 p-0 transition-all duration-200",
                hasPrevious
                  ? "hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm"
                  : "opacity-30"
              )}
              title="Previous chord - Navigate left in progression"
            >
              <ChevronLeft className="h-2 w-2" />
            </Button>

            <div className="text-center">
              <div className="text-sm font-bold text-blue-700">
                {(selectedRoot !== null && selectedQuality !== null) ? buildChord() : (currentChord || '—')}
              </div>
              {/* Enhanced visual progress indicator with spatial context */}
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                {hasPrevious && (
                  <span className="text-blue-400 opacity-60">←</span>
                )}
                <span className="font-medium">
                  Chord {(parseInt((currentSlotId?.match(/\d+/) || ['0'])[0] as string) + 1)}
                </span>
                {hasNext && (
                  <span className="text-blue-400 opacity-60">→</span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                isNavigatingRef.current = true;
                // Save chord only if user made changes AND chord is different from current slot
                const chord = buildChord();
                if (chord && hasUserMadeChangesRef.current && hasChordChanged()) {
                  onChordSelect(chord);
                }
                onNext?.();
                // Reset navigation flag after a short delay
                setTimeout(() => { isNavigatingRef.current = false; }, 100);
              }}
              disabled={!hasNext}
              className={cn(
                "h-4 w-4 p-0 transition-all duration-200",
                hasNext
                  ? "hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm"
                  : "opacity-30"
              )}
              title="Next chord - Navigate right in progression"
            >
              <ChevronRight className="h-2 w-2" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Save chord only if user made changes AND chord is different from current slot
                const chord = buildChord();
                if (chord && hasUserMadeChangesRef.current && hasChordChanged()) {
                  onChordSelect(chord);
                }
                onClose();
              }}
              className="h-4 w-4 p-0 hover:bg-red-100"
            >
              <X className="h-2 w-2" />
            </Button>
          </div>

          {/* Root notes - 6 columns */}
          <div className="text-xs font-medium text-muted-foreground mb-0.5">Root</div>
          <div className="grid grid-cols-6 gap-0.5">
            {NOTE_DISPLAY.map((note, index) => (
              <Button
                key={note}
                onClick={() => {
                  console.log('🎵 Root clicked:', NOTE_DISPLAY[index]);
                  setSelectedRoot(index);
                  hasUserMadeChangesRef.current = true;
                }}
                variant={selectedRoot === index ? "default" : "outline"}
                size="sm"
                className="h-3 text-xs font-medium min-w-0 p-0"
              >
                {note.split('/')[0]}
              </Button>
            ))}
          </div>

          {/* Chord qualities - 4 columns */}
          <div className="text-xs font-medium text-muted-foreground mb-1 mt-2">Quality</div>
          <div className="grid grid-cols-4 gap-1">
            {CHORD_QUALITIES.slice(0, 8).map((quality) => (
              <Button
                key={quality.symbol}
                onClick={() => {
                  setSelectedQuality(quality);
                  hasUserMadeChangesRef.current = true;
                }}
                variant={selectedQuality?.symbol === quality.symbol ? "default" : "outline"}
                size="sm"
                className="text-xs h-6 font-mono min-w-0 px-1.5 py-1"
                title={quality.name}
              >
                {quality.symbol || 'maj'}
              </Button>
            ))}
          </div>

          {/* Bass note selection - optional inversion with music theory terminology */}
          {selectedRoot !== null && selectedQuality !== null && (
            <>
              <div className="text-xs font-medium text-muted-foreground mb-1 mt-2">Bass Note / Inversion</div>
              <div className="grid grid-cols-6 gap-1">
                <Button
                  onClick={() => {
                    setSelectedBassNote(null);
                    hasUserMadeChangesRef.current = true;
                  }}
                  variant={selectedBassNote === null ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6 font-medium min-w-0 px-1.5 py-1"
                  title="Root position (no inversion)"
                >
                  Root
                </Button>
                {NOTE_DISPLAY.slice(0, 11).map((note, index) => {
                  // Calculate inversion type based on interval from root
                  const getInversionInfo = () => {
                    if (selectedRoot === null) return { type: '', tooltip: `${note} in bass` };

                    const interval = (index - selectedRoot + 12) % 12;
                    if (interval === 4) return { type: '1st', tooltip: `First inversion (${note} in bass)` };
                    if (interval === 7) return { type: '2nd', tooltip: `Second inversion (${note} in bass)` };
                    if (interval === 10) return { type: '3rd', tooltip: `Third inversion (${note} in bass)` };
                    return { type: '', tooltip: `Slash chord (${note} in bass)` };
                  };

                  const { type, tooltip } = getInversionInfo();

                  return (
                    <Button
                      key={note}
                      onClick={() => {
                        setSelectedBassNote(index);
                        hasUserMadeChangesRef.current = true;
                      }}
                      variant={selectedBassNote === index ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs font-medium min-w-0 px-1.5 py-1 flex flex-col justify-center"
                      title={tooltip}
                    >
                      <span className="leading-none">{note.split('/')[0]}</span>
                      {type && <span className="text-[0.55rem] opacity-70 leading-none">{type}</span>}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MinimalChordBuilderModal;
