/**
 * Compact Chord Builder Modal
 * 
 * A simplified, compact chord input interface that appears as a small modal
 * next to chord positions. Features compact grid note selection, chord quality buttons,
 * quick presets, and navigation arrows for chord progression building.
 * 
 * Design Philosophy: "Single mode, all controls visible, maximum 280×250px"
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { X, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Core music theory data
const NOTES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
const NOTE_DISPLAY = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

interface ChordQuality {
  symbol: string;
  name: string;
  intervals: number[];
  category: 'basic' | 'seventh' | 'extended';
}

// Simplified chord qualities for compact display
const CHORD_QUALITIES: ChordQuality[] = [
  // Basic triads (most common)
  { symbol: '', name: 'Major', intervals: [0, 4, 7], category: 'basic' },
  { symbol: 'm', name: 'Minor', intervals: [0, 3, 7], category: 'basic' },
  { symbol: 'dim', name: 'Diminished', intervals: [0, 3, 6], category: 'basic' },
  { symbol: '7', name: 'Dominant 7th', intervals: [0, 4, 7, 10], category: 'seventh' },
  { symbol: 'maj7', name: 'Major 7th', intervals: [0, 4, 7, 11], category: 'seventh' },
  { symbol: 'm7', name: 'Minor 7th', intervals: [0, 3, 7, 10], category: 'seventh' },
  { symbol: 'sus4', name: 'Suspended 4th', intervals: [0, 5, 7], category: 'basic' },
  { symbol: 'sus2', name: 'Suspended 2nd', intervals: [0, 2, 7], category: 'basic' },
];

// Common chord presets for quick selection (6 most common)
const COMMON_CHORDS = [
  'C', 'Dm', 'Em', 'F', 'G', 'Am'
];

interface ChordBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChordSelect: (chord: string) => void;
  position: { x: number; y: number };
  currentChord?: string;
  className?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const ChordBuilderModal: React.FC<ChordBuilderModalProps> = ({
  isOpen,
  onClose,
  onChordSelect,
  position,
  currentChord = '',
  className,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  const [selectedRoot, setSelectedRoot] = useState<number>(0); // C
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>(CHORD_QUALITIES[0]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse current chord to set initial state
  useEffect(() => {
    if (currentChord && isOpen) {
      // Simple chord parsing - can be enhanced
      const match = currentChord.match(/^([A-G][#♯♭b]?)(.*)$/);
      if (match) {
        const [, root, quality] = match;
        const rootIndex = NOTE_DISPLAY.findIndex(note => 
          note === root || note.includes(root.replace('♯', '#').replace('♭', 'b'))
        );
        if (rootIndex !== -1) {
          setSelectedRoot(rootIndex);
        }
        
        const qualityMatch = CHORD_QUALITIES.find(q => q.symbol === quality);
        if (qualityMatch) {
          setSelectedQuality(qualityMatch);
        }
      }
    }
  }, [currentChord, isOpen]);

  // Close on escape key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Auto-position modal to stay within viewport (compact size)
  const getModalStyle = () => {
    if (!isOpen) return { display: 'none' };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 280; // Compact modal width
    const modalHeight = 250; // Compact modal height
    
    let x = position.x;
    let y = position.y;
    
    // Adjust horizontal position
    if (x + modalWidth > viewportWidth - 20) {
      x = position.x - modalWidth - 10; // Position to the left instead
    }
    
    // Adjust vertical position
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
    const rootNote = NOTE_DISPLAY[selectedRoot];
    return `${rootNote}${selectedQuality.symbol}`;
  };

  const handleChordConfirm = () => {
    const chord = buildChord();
    onChordSelect(chord);
    onClose();
  };

  const handlePresetChord = (chord: string) => {
    onChordSelect(chord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="chord-builder-modal-overlay fixed inset-0 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
    >
      <Card 
        ref={modalRef}
        className={cn(
          "chord-builder-modal shadow-xl border-2 animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        style={{...getModalStyle(), width: '280px', maxHeight: '250px'}}
      >
        <CardContent className="p-3 space-y-2 overflow-hidden">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious || !onPrevious}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <div className="flex flex-col items-center min-w-[5rem]">
                <div className="text-lg font-bold text-blue-700">
                  {buildChord()}
                </div>
                <div className="text-xs text-muted-foreground leading-tight">{selectedQuality.name}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext || !onNext}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-red-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Root Note Selector - Compact Grid */}
          <div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {NOTE_DISPLAY.map((note, index) => (
                <Button
                  key={note}
                  onClick={() => setSelectedRoot(index)}
                  variant={selectedRoot === index ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs font-medium min-w-0 px-1"
                >
                  {note.split('/')[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Chord Quality Selector */}
          <div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {CHORD_QUALITIES.map((quality) => (
                <Button
                  key={quality.symbol}
                  onClick={() => setSelectedQuality(quality)}
                  variant={selectedQuality.symbol === quality.symbol ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6 font-mono px-1 min-w-0"
                >
                  {quality.symbol || 'maj'}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="grid grid-cols-6 gap-1 mb-2">
              {COMMON_CHORDS.map((chord) => (
                <Button
                  key={chord}
                  onClick={() => handlePresetChord(chord)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 font-mono px-1 min-w-0"
                >
                  {chord}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1 border-t">
            <Button 
              onClick={handleChordConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Use Chord
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};