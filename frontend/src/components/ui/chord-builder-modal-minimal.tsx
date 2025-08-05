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
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  const [selectedRoot, setSelectedRoot] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<typeof CHORD_QUALITIES[0] | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse current chord or reset to defaults
  useEffect(() => {
    if (!isOpen) return;
    
    if (currentChord && currentChord.trim()) {
      // Parse existing chord
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
      // Reset to no selection for blank chord
      setSelectedRoot(null);
      setSelectedQuality(null);
    }
  }, [currentChord, isOpen]);

  // Close on escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        const chord = buildChord();
        onChordSelect(chord);
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

  // Real-time chord updates
  useEffect(() => {
    if (selectedRoot !== null && selectedQuality !== null) {
      const chord = buildChord();
      if (chord && chord !== currentChord) {
        onChordSelect(chord);
      }
    }
  }, [selectedRoot, selectedQuality, onChordSelect, currentChord]);

  if (!isOpen) return null;

  return (
    <div className="chord-builder-modal-overlay fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
      <Card 
        ref={modalRef}
        className="chord-builder-modal shadow-xl border-2 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{...getModalStyle(), width: '160px', height: '160px'}}
      >
        <CardContent className="p-1 space-y-1 overflow-hidden">
          {/* Header - Chord name and navigation */}
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const chord = buildChord();
                onChordSelect(chord);
                onPrevious?.();
              }}
              disabled={!hasPrevious}
              className="h-4 w-4 p-0"
            >
              <ChevronLeft className="h-2 w-2" />
            </Button>
            
            <div className="text-sm font-bold text-blue-700">
              {buildChord() || '—'}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const chord = buildChord();
                onChordSelect(chord);
                onNext?.();
              }}
              disabled={!hasNext}
              className="h-4 w-4 p-0"
            >
              <ChevronRight className="h-2 w-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                const chord = buildChord();
                onChordSelect(chord);
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
                onClick={() => setSelectedRoot(index)}
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
                onClick={() => setSelectedQuality(quality)}
                variant={selectedQuality.symbol === quality.symbol ? "default" : "outline"}
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