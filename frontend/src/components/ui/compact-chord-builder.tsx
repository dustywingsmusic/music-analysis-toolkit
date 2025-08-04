/**
 * CompactChordBuilder - Enhanced Mouse Input for Chord Progressions
 * 
 * A space-efficient chord progression builder that allows users to:
 * - Build chords one at a time with clear visual feedback
 * - Navigate between chords with next/previous arrows
 * - Manage chord sequences for progression analysis
 * - Integrate seamlessly with existing input systems
 * 
 * Based on MOUSE_CHORD_INPUT_DESIGN.md but simplified for tight spaces.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import DelightfulButton from './delightful-button';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, PlayIcon } from 'lucide-react';
import { NOTES } from '../../constants/scales';

export interface ChordData {
  root: string;
  quality: string;
  extensions: string[];
  symbol: string; // Generated chord symbol (e.g., "Cmaj7")
}

interface CompactChordBuilderProps {
  value: string; // Current progression as space-separated chord symbols
  onChange: (progression: string) => void;
  className?: string;
  maxChords?: number;
  showPlayback?: boolean;
}

// Chord building data
const ROOT_NOTES = NOTES.map(note => note.split('/')[0]); // Use first spelling of each note
const CHORD_QUALITIES = [
  { id: 'maj', label: 'Major', symbol: '' },
  { id: 'min', label: 'Minor', symbol: 'm' },
  { id: 'dom7', label: 'Dominant 7', symbol: '7' },
  { id: 'maj7', label: 'Major 7', symbol: 'maj7' },
  { id: 'min7', label: 'Minor 7', symbol: 'm7' },
  { id: 'dim', label: 'Diminished', symbol: 'dim' },
  { id: 'aug', label: 'Augmented', symbol: 'aug' },
  { id: 'sus2', label: 'Sus 2', symbol: 'sus2' },
  { id: 'sus4', label: 'Sus 4', symbol: 'sus4' },
];

const CHORD_EXTENSIONS = [
  { id: 'add9', label: 'Add 9', symbol: 'add9' },
  { id: '9', label: '9th', symbol: '9' },
  { id: '11', label: '11th', symbol: '11' },
  { id: '13', label: '13th', symbol: '13' },
  { id: 'b5', label: '♭5', symbol: '♭5' },
  { id: '#5', label: '♯5', symbol: '♯5' },
  { id: '#11', label: '♯11', symbol: '♯11' },
];

// Common chord progressions for quick selection
const QUICK_PROGRESSIONS = [
  { name: 'vi-IV-I-V', chords: ['Am', 'F', 'C', 'G'] },
  { name: 'I-V-vi-IV', chords: ['C', 'G', 'Am', 'F'] },
  { name: 'ii-V-I', chords: ['Dm', 'G', 'C'] },
  { name: 'I-vi-IV-V', chords: ['C', 'Am', 'F', 'G'] },
  { name: 'vi-V-IV-V', chords: ['Am', 'G', 'F', 'G'] },
];

const CompactChordBuilder: React.FC<CompactChordBuilderProps> = ({
  value,
  onChange,
  className,
  maxChords = 8,
  showPlayback = false
}) => {
  // Parse current progression
  const currentChords = useMemo(() => {
    if (!value.trim()) return [];
    return value.trim().split(/\s+/).filter(chord => chord.length > 0);
  }, [value]);

  // State for chord building
  const [activeChordIndex, setActiveChordIndex] = useState(0);
  const [buildingChord, setBuildingChord] = useState<{
    root: string;
    quality: string;
    extensions: string[];
  }>({
    root: 'C',
    quality: 'maj',
    extensions: []
  });

  // Generate chord symbol from parts
  const generateChordSymbol = useCallback((root: string, quality: string, extensions: string[]): string => {
    const qualityData = CHORD_QUALITIES.find(q => q.id === quality);
    const qualitySymbol = qualityData?.symbol || '';
    const extensionSymbols = extensions.map(ext => {
      const extData = CHORD_EXTENSIONS.find(e => e.id === ext);
      return extData?.symbol || ext;
    }).join('');
    
    return `${root}${qualitySymbol}${extensionSymbols}`;
  }, []);

  // Update building chord and preview
  const updateBuildingChord = useCallback((updates: Partial<typeof buildingChord>) => {
    setBuildingChord(prev => ({ ...prev, ...updates }));
  }, []);

  // Add/replace chord in progression
  const addChordToProgression = useCallback(() => {
    const chordSymbol = generateChordSymbol(buildingChord.root, buildingChord.quality, buildingChord.extensions);
    const newChords = [...currentChords];
    
    if (activeChordIndex < newChords.length) {
      // Replace existing chord
      newChords[activeChordIndex] = chordSymbol;
    } else {
      // Add new chord
      newChords.push(chordSymbol);
    }
    
    onChange(newChords.join(' '));
    
    // Move to next chord position
    if (activeChordIndex < Math.min(newChords.length, maxChords - 1)) {
      setActiveChordIndex(activeChordIndex + 1);
    }
  }, [buildingChord, currentChords, activeChordIndex, maxChords, onChange, generateChordSymbol]);

  // Remove chord from progression
  const removeChord = useCallback((index: number) => {
    const newChords = currentChords.filter((_, i) => i !== index);
    onChange(newChords.join(' '));
    
    // Adjust active index if needed
    if (activeChordIndex >= newChords.length && newChords.length > 0) {
      setActiveChordIndex(newChords.length - 1);
    } else if (newChords.length === 0) {
      setActiveChordIndex(0);
    }
  }, [currentChords, activeChordIndex, onChange]);

  // Load chord at index for editing
  const loadChordForEditing = useCallback((index: number) => {
    if (index >= 0 && index < currentChords.length) {
      const chordSymbol = currentChords[index];
      // Simple parsing - in a full implementation, you'd have sophisticated chord parsing
      const root = chordSymbol.charAt(0) + (chordSymbol.charAt(1) && ['#', 'b', '♯', '♭'].includes(chordSymbol.charAt(1)) ? chordSymbol.charAt(1) : '');
      
      // Find matching quality (simplified)
      let quality = 'maj';
      let extensions: string[] = [];
      
      if (chordSymbol.includes('m7')) quality = 'min7';
      else if (chordSymbol.includes('maj7')) quality = 'maj7';
      else if (chordSymbol.includes('7')) quality = 'dom7';
      else if (chordSymbol.includes('m')) quality = 'min';
      else if (chordSymbol.includes('dim')) quality = 'dim';
      else if (chordSymbol.includes('aug')) quality = 'aug';
      else if (chordSymbol.includes('sus2')) quality = 'sus2';
      else if (chordSymbol.includes('sus4')) quality = 'sus4';
      
      setBuildingChord({ root, quality, extensions });
    }
    setActiveChordIndex(index);
  }, [currentChords]);

  // Load quick progression
  const loadQuickProgression = useCallback((progression: typeof QUICK_PROGRESSIONS[0]) => {
    onChange(progression.chords.join(' '));
    setActiveChordIndex(0);
  }, [onChange]);

  // Clear all
  const clearAll = useCallback(() => {
    onChange('');
    setActiveChordIndex(0);
    setBuildingChord({ root: 'C', quality: 'maj', extensions: [] });
  }, [onChange]);

  // Current chord symbol preview
  const previewChordSymbol = generateChordSymbol(buildingChord.root, buildingChord.quality, buildingChord.extensions);

  return (
    <div className={cn("compact-chord-builder space-y-4", className)}>
      {/* Quick Progressions */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Quick select:</div>
        <div className="flex flex-wrap gap-1">
          {QUICK_PROGRESSIONS.map((prog) => (
            <Button
              key={prog.name}
              onClick={() => loadQuickProgression(prog)}
              variant="outline"
              size="sm"
              className="text-xs h-7"
            >
              {prog.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Progression Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            Progression ({currentChords.length}/{maxChords}):
          </div>
          {currentChords.length > 0 && (
            <Button
              onClick={clearAll}
              variant="ghost"
              size="sm"
              className="text-xs h-6 text-destructive hover:text-destructive"
              title="Clear all chords"
            >
              <TrashIcon className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-3">
            {currentChords.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-2">
                No chords yet - build your first chord below
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentChords.map((chord, index) => (
                  <div key={`${chord}-${index}`} className="flex items-center gap-1">
                    <Badge
                      variant={index === activeChordIndex ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer transition-all hover:scale-105",
                        index === activeChordIndex && "ring-2 ring-primary/50"
                      )}
                      onClick={() => loadChordForEditing(index)}
                    >
                      <span className="text-xs font-mono">{chord}</span>
                      {index === activeChordIndex && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChord(index);
                          }}
                          variant="ghost"
                          size="sm"
                          className="w-3 h-3 p-0 ml-1 hover:bg-destructive/30"
                        >
                          ×
                        </Button>
                      )}
                    </Badge>
                    {index < currentChords.length - 1 && (
                      <ChevronRightIcon className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
                
                {/* Add new chord indicator */}
                {currentChords.length < maxChords && (
                  <>
                    {currentChords.length > 0 && (
                      <ChevronRightIcon className="w-3 h-3 text-muted-foreground" />
                    )}
                    <Button
                      onClick={() => setActiveChordIndex(currentChords.length)}
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 border-dashed"
                      title="Add new chord"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chord Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            {activeChordIndex < currentChords.length ? 'Edit' : 'Build'} chord {activeChordIndex + 1}:
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation arrows */}
            <Button
              onClick={() => setActiveChordIndex(Math.max(0, activeChordIndex - 1))}
              disabled={activeChordIndex === 0}
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <ChevronLeftIcon className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setActiveChordIndex(Math.min(maxChords - 1, activeChordIndex + 1))}
              disabled={activeChordIndex >= maxChords - 1}
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <ChevronRightIcon className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Chord Preview */}
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="text-lg font-mono px-4 py-2 bg-primary/5 border-primary/30">
            {previewChordSymbol}
          </Badge>
        </div>

        {/* Root Note Selection */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Root Note:</div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
            {ROOT_NOTES.map((note) => (
              <DelightfulButton
                key={note}
                onClick={() => updateBuildingChord({ root: note })}
                variant={buildingChord.root === note ? "default" : "outline"}
                size="sm"
                className="aspect-square text-xs"
                musical
                sparkle={buildingChord.root === note}
              >
                {note}
              </DelightfulButton>
            ))}
          </div>
        </div>

        {/* Chord Quality Selection */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Chord Quality:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {CHORD_QUALITIES.map((quality) => (
              <DelightfulButton
                key={quality.id}
                onClick={() => updateBuildingChord({ quality: quality.id })}
                variant={buildingChord.quality === quality.id ? "default" : "outline"}
                size="sm"
                className="text-xs h-8"
                sparkle={buildingChord.quality === quality.id}
              >
                {quality.label}
              </DelightfulButton>
            ))}
          </div>
        </div>

        {/* Extensions (Optional) */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Extensions (optional):</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
            {CHORD_EXTENSIONS.map((ext) => {
              const isSelected = buildingChord.extensions.includes(ext.id);
              return (
                <DelightfulButton
                  key={ext.id}
                  onClick={() => {
                    const newExtensions = isSelected
                      ? buildingChord.extensions.filter(e => e !== ext.id)
                      : [...buildingChord.extensions, ext.id];
                    updateBuildingChord({ extensions: newExtensions });
                  }}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  sparkle={isSelected}
                >
                  {ext.label}
                </DelightfulButton>
              );
            })}
          </div>
        </div>

        {/* Add/Update Chord Button */}
        <DelightfulButton
          onClick={addChordToProgression}
          className="w-full"
          size="lg"
          sparkle
          musical
        >
          {activeChordIndex < currentChords.length ? (
            <>Update Chord {activeChordIndex + 1}</>
          ) : (
            <>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Chord to Progression
            </>
          )}
        </DelightfulButton>
      </div>
    </div>
  );
};

export default CompactChordBuilder;