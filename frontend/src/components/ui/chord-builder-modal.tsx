/**
 * Compact Chord Builder Modal
 * 
 * An elegant, non-obtrusive chord input interface that appears as a small modal
 * next to chord positions. Features circular note selection, chord quality buttons,
 * and quick presets for fast chord building.
 * 
 * Design Philosophy: "Invisible until needed, then focused and efficient"
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { X, Music } from 'lucide-react';
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

const CHORD_QUALITIES: ChordQuality[] = [
  // Basic triads
  { symbol: '', name: 'Major', intervals: [0, 4, 7], category: 'basic' },
  { symbol: 'm', name: 'Minor', intervals: [0, 3, 7], category: 'basic' },
  { symbol: 'dim', name: 'Diminished', intervals: [0, 3, 6], category: 'basic' },
  { symbol: 'aug', name: 'Augmented', intervals: [0, 4, 8], category: 'basic' },
  
  // Seventh chords
  { symbol: '7', name: 'Dominant 7th', intervals: [0, 4, 7, 10], category: 'seventh' },
  { symbol: 'maj7', name: 'Major 7th', intervals: [0, 4, 7, 11], category: 'seventh' },
  { symbol: 'm7', name: 'Minor 7th', intervals: [0, 3, 7, 10], category: 'seventh' },
  { symbol: 'mM7', name: 'Minor Major 7th', intervals: [0, 3, 7, 11], category: 'seventh' },
  { symbol: 'dim7', name: 'Diminished 7th', intervals: [0, 3, 6, 9], category: 'seventh' },
  { symbol: 'm7♭5', name: 'Half Diminished', intervals: [0, 3, 6, 10], category: 'seventh' },
  
  // Extended chords (common ones)
  { symbol: '9', name: 'Dominant 9th', intervals: [0, 4, 7, 10, 14], category: 'extended' },
  { symbol: 'maj9', name: 'Major 9th', intervals: [0, 4, 7, 11, 14], category: 'extended' },
  { symbol: 'add9', name: 'Add 9', intervals: [0, 4, 7, 14], category: 'extended' },
  { symbol: 'sus2', name: 'Suspended 2nd', intervals: [0, 2, 7], category: 'basic' },
  { symbol: 'sus4', name: 'Suspended 4th', intervals: [0, 5, 7], category: 'basic' },
];

// Common chord presets for quick selection
const COMMON_CHORDS = [
  'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim',  // C major scale chords
  'G7', 'C7', 'F7', 'Am7', 'Dm7', 'Cmaj7'   // Common sevenths
];

interface ChordBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChordSelect: (chord: string) => void;
  position: { x: number; y: number };
  currentChord?: string;
  className?: string;
}

export const ChordBuilderModal: React.FC<ChordBuilderModalProps> = ({
  isOpen,
  onClose,
  onChordSelect,
  position,
  currentChord = '',
  className
}) => {
  const [selectedRoot, setSelectedRoot] = useState<number>(0); // C
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>(CHORD_QUALITIES[0]);
  const [showExtended, setShowExtended] = useState(false);
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

  // Auto-position modal to stay within viewport
  const getModalStyle = () => {
    if (!isOpen) return { display: 'none' };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 320; // Approximate modal width
    const modalHeight = 480; // Approximate modal height
    
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
          "chord-builder-modal w-80 shadow-xl border-2 animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        style={getModalStyle()}
      >
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-sm">Build Chord</h3>
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

          {/* Current Chord Preview */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700 bg-blue-50 rounded-lg p-3">
              {buildChord()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{selectedQuality.name}</p>
          </div>

          {/* Root Note Selector - Circular Layout */}
          <div>
            <h4 className="text-sm font-medium mb-2">Root Note</h4>
            <div className="relative w-48 h-48 mx-auto">
              {NOTE_DISPLAY.map((note, index) => {
                const angle = (index * 30) - 90; // Start at top (12 o'clock)
                const radian = (angle * Math.PI) / 180;
                const radius = 75;
                const x = Math.cos(radian) * radius + 96;
                const y = Math.sin(radian) * radius + 96;
                
                return (
                  <Button
                    key={note}
                    onClick={() => setSelectedRoot(index)}
                    className={cn(
                      "absolute w-8 h-8 rounded-full text-xs font-medium transition-all duration-200",
                      "transform -translate-x-4 -translate-y-4",
                      selectedRoot === index
                        ? "bg-blue-600 text-white shadow-lg scale-110"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                    )}
                    style={{ left: x, top: y }}
                  >
                    {note.split('/')[0]}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Chord Quality Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Chord Quality</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExtended(!showExtended)}
                className="text-xs h-6"
              >
                {showExtended ? 'Basic' : 'Extended'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
              {CHORD_QUALITIES
                .filter(quality => showExtended || quality.category !== 'extended')
                .map((quality) => (
                  <Button
                    key={quality.symbol}
                    onClick={() => setSelectedQuality(quality)}
                    variant={selectedQuality.symbol === quality.symbol ? "default" : "outline"}
                    size="sm"
                    className="text-xs justify-start h-8"
                  >
                    <span className="font-mono min-w-[2rem] text-left">
                      {quality.symbol || 'maj'}
                    </span>
                    <span className="ml-1 truncate">{quality.name}</span>
                  </Button>
                ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <h4 className="text-sm font-medium mb-2">Quick Presets</h4>
            <div className="grid grid-cols-4 gap-1">
              {COMMON_CHORDS.map((chord) => (
                <Button
                  key={chord}
                  onClick={() => handlePresetChord(chord)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 font-mono"
                >
                  {chord}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
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