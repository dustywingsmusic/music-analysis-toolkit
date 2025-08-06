/**
 * Ultra-Minimal Chord Builder Modal
 * Fits in 160x140px with essential functionality only
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
          const match = currentChord.match(/^([A-G][#♯♭b]?)(.*)$/);
          if (match) {
            const [, root, quality] = match;
            const rootIndex = NOTE_DISPLAY.findIndex(note => 
              note === root || note.includes(root.replace('♯', '#').replace('♭', 'b'))
            );
            if (rootIndex !== -1) setSelectedRoot(rootIndex);
            
            const qualityMatch = CHORD_QUALITIES.find(q => q.symbol === quality);
            if (qualityMatch) setSelectedQuality(qualityMatch);
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
    const modalWidth = 160;
    const modalHeight = 160;
    
    let x = position.x;
    let y = position.y;
    
    if (x + modalWidth > viewportWidth - 20) {
      x = position.x - modalWidth - 20;
    } else {
      x = position.x + 20;
    }
    
    if (y + modalHeight > viewportHeight - 20) {
      y = viewportHeight - modalHeight - 20;
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
    return `${rootNote}${selectedQuality.symbol}`;
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
    <div className="chord-builder-modal-overlay fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
      <Card 
        ref={modalRef}
        className="chord-builder-modal shadow-xl border-2 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{...getModalStyle(), width: '160px', height: '170px'}}
      >
        <CardContent className="p-1 space-y-1 overflow-hidden">
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
                  Chord {((currentSlotId?.match(/\d+/) || ['0'])[0] as string)}
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
          <div className="text-xs font-medium text-muted-foreground mb-0.5">Quality</div>
          <div className="grid grid-cols-4 gap-0.5">
            {CHORD_QUALITIES.slice(0, 8).map((quality) => (
              <Button
                key={quality.symbol}
                onClick={() => {
                  setSelectedQuality(quality);
                  hasUserMadeChangesRef.current = true;
                }}
                variant={selectedQuality?.symbol === quality.symbol ? "default" : "outline"}
                size="sm"
                className="text-xs h-3 font-mono min-w-0 p-0"
                title={quality.name}
              >
                {quality.symbol || 'maj'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinimalChordBuilderModal;