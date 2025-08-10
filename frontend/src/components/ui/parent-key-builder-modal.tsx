/**
 * Parent Key Builder Modal
 * Simple modal for selecting parent key signature (root note + major/minor)
 * Uses similar architecture to MinimalChordBuilderModal for consistency
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { NOTES } from "../../constants/mappings";

// Convert NOTES format to simple display format
const NOTE_DISPLAY = NOTES.map(note => {
  // Convert "C♯/D♭" format to just "C♯" for display
  if (note.includes('/')) {
    return note.split('/')[0]; // Take first option (sharp version)
  }
  return note;
});

const KEY_QUALITIES = [
  { symbol: '', name: 'Major', display: 'Major' },
  { symbol: 'm', name: 'Minor', display: 'Minor' }
];

interface ParentKeyBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySelect: (key: string) => void; // e.g., "C Major", "Dm", or "" for not set
  position: { x: number; y: number };
  currentKey?: string; // Current parent key
}

export const ParentKeyBuilderModal: React.FC<ParentKeyBuilderModalProps> = ({
  isOpen,
  onClose,
  onKeySelect,
  position,
  currentKey = ''
}) => {
  const [selectedRoot, setSelectedRoot] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<typeof KEY_QUALITIES[0] | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse current key or reset to defaults
  useEffect(() => {
    if (!isOpen) {
      setSelectedRoot(null);
      setSelectedQuality(null);
      return;
    }

    if (currentKey && currentKey.trim()) {
      // Parse existing key (e.g., "C Major", "Dm", "F♯ Minor")
      if (currentKey.includes('Major')) {
        const root = currentKey.replace(' Major', '').trim();
        const rootIndex = NOTE_DISPLAY.findIndex(note => note === root);
        if (rootIndex !== -1) {
          setSelectedRoot(rootIndex);
          setSelectedQuality(KEY_QUALITIES[0]); // Major
        }
      } else if (currentKey.includes('Minor') || currentKey.includes('m')) {
        const root = currentKey.replace(' Minor', '').replace('m', '').trim();
        const rootIndex = NOTE_DISPLAY.findIndex(note => note === root);
        if (rootIndex !== -1) {
          setSelectedRoot(rootIndex);
          setSelectedQuality(KEY_QUALITIES[1]); // Minor
        }
      }
    }
  }, [currentKey, isOpen]);

  // Close on escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        // Don't trigger on navigation button clicks within the modal
        const target = e.target as HTMLElement;
        if (target.closest('.parent-key-modal-overlay')) {
          return;
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
    const modalWidth = 200;
    const modalHeight = 140;

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

  const buildKey = (rootIndex?: number | null, quality?: KeyQuality | null) => {
    const root = rootIndex !== undefined ? rootIndex : selectedRoot;
    const qual = quality !== undefined ? quality : selectedQuality;

    if (root === null || qual === null) return '';
    const rootNote = NOTE_DISPLAY[root];
    if (qual.symbol === '') {
      return `${rootNote} Major`;
    } else {
      return `${rootNote}${qual.symbol}`;
    }
  };

  const handleKeySelect = (key: string) => {
    onKeySelect(key);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="parent-key-modal-overlay fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
      <Card
        ref={modalRef}
        className="parent-key-modal shadow-xl border-2 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{...getModalStyle(), width: '200px', height: '140px'}}
      >
        <CardContent className="p-2 space-y-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-700">Parent Key</div>
            <div className="text-sm font-bold text-blue-700">
              {buildKey() || '—'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-4 w-4 p-0 hover:bg-red-100"
            >
              <X className="h-2 w-2" />
            </Button>
          </div>

          {/* Root notes - 6 columns, 2 rows */}
          <div className="text-xs font-medium text-muted-foreground mb-1">Root</div>
          <div className="grid grid-cols-6 gap-0.5">
            {NOTE_DISPLAY.map((note, index) => (
              <Button
                key={note}
                onClick={() => {
                  setSelectedRoot(index);
                  // Auto-apply and close if quality is also selected
                  if (selectedQuality) {
                    const key = buildKey(index, selectedQuality);
                    if (key) {
                      handleKeySelect(key);
                    }
                  }
                }}
                variant={selectedRoot === index ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-4 text-xs font-medium min-w-0 p-0 shadow-sm transition-all duration-200",
                  selectedRoot === index
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20 shadow-lg shadow-primary/20"
                    : "bg-card/50 hover:bg-primary/20 hover:border-primary/40 hover:text-primary hover:shadow-md border-border/60 text-muted-foreground hover:text-primary backdrop-blur-sm"
                )}
              >
                {note}
              </Button>
            ))}
          </div>

          {/* Quality - 3 buttons including "Not Set" */}
          <div className="text-xs font-medium text-muted-foreground mb-1">Quality</div>
          <div className="grid grid-cols-3 gap-1">
            {KEY_QUALITIES.map((quality) => (
              <Button
                key={quality.symbol}
                onClick={() => {
                  setSelectedQuality(quality);
                  // Auto-apply and close if root is also selected
                  if (selectedRoot !== null) {
                    const key = buildKey(selectedRoot, quality);
                    if (key) {
                      handleKeySelect(key);
                    }
                  }
                }}
                variant={selectedQuality?.symbol === quality.symbol ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs h-5 font-medium min-w-0 p-1 shadow-sm transition-all duration-200",
                  selectedQuality?.symbol === quality.symbol
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20 shadow-lg shadow-primary/20"
                    : "bg-card/50 hover:bg-primary/20 hover:border-primary/40 hover:text-primary hover:shadow-md border-border/60 text-muted-foreground hover:text-primary backdrop-blur-sm"
                )}
                title={quality.name}
              >
                {quality.display}
              </Button>
            ))}
            <Button
              onClick={() => handleKeySelect('')}
              variant="outline"
              size="sm"
              className={cn(
                "text-xs h-5 font-medium min-w-0 p-1 shadow-sm transition-all duration-200",
                "bg-card/30 hover:bg-warning/20 hover:border-warning/40 hover:text-warning hover:shadow-md border-border/40 text-muted-foreground/70 hover:text-warning backdrop-blur-sm"
              )}
              title="Clear parent key"
            >
              Not Set
            </Button>
          </div>

          {/* Apply button - now hidden since we auto-apply */}
          {/* Keeping for reference but commented out since auto-apply is active
          {selectedRoot !== null && selectedQuality !== null && (
            <div className="pt-1">
              <Button
                onClick={() => handleKeySelect(buildKey())}
                size="sm"
                className="w-full h-6 text-xs"
              >
                Apply
              </Button>
            </div>
          )}
          */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentKeyBuilderModal;
