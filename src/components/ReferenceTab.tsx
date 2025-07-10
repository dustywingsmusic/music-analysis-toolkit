import React, { useState } from 'react';
import ScaleFinder from './ScaleFinder';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReferenceTabProps {
  highlightId?: string | null;
  showDebugInfo?: boolean;
  onShowUnifiedResults?: (results: any, historyId?: string) => void;
  onAddToHistory?: (method: string, data: any, results: any, tab?: string, userInputs?: any) => string;
}

const ReferenceTab: React.FC<ReferenceTabProps> = ({ 
  highlightId, 
  showDebugInfo = false, 
  onShowUnifiedResults, 
  onAddToHistory 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Scales & Modes' },
    { id: 'major', label: 'Major Scale Modes' },
    { id: 'minor', label: 'Minor Scale Modes' },
    { id: 'harmonic', label: 'Harmonic Minor Modes' },
    { id: 'melodic', label: 'Melodic Minor Modes' },
    { id: 'pentatonic', label: 'Pentatonic Scales' },
    { id: 'blues', label: 'Blues Scales' },
    { id: 'exotic', label: 'Exotic Scales' },
  ];

  const quickReference = [
    {
      category: 'Major Scale Modes',
      modes: [
        { name: 'Ionian (Major)', formula: '1 2 3 4 5 6 7', character: 'Bright, happy' },
        { name: 'Dorian', formula: '1 2 ♭3 4 5 6 ♭7', character: 'Minor with bright 6th' },
        { name: 'Phrygian', formula: '1 ♭2 ♭3 4 5 ♭6 ♭7', character: 'Dark, Spanish flavor' },
        { name: 'Lydian', formula: '1 2 3 #4 5 6 7', character: 'Dreamy, floating' },
        { name: 'Mixolydian', formula: '1 2 3 4 5 6 ♭7', character: 'Dominant, bluesy' },
        { name: 'Aeolian (Natural Minor)', formula: '1 2 ♭3 4 5 ♭6 ♭7', character: 'Sad, melancholic' },
        { name: 'Locrian', formula: '1 ♭2 ♭3 4 ♭5 ♭6 ♭7', character: 'Unstable, diminished' },
      ]
    },
    {
      category: 'Common Scales',
      modes: [
        { name: 'Harmonic Minor', formula: '1 2 ♭3 4 5 ♭6 7', character: 'Classical, exotic' },
        { name: 'Melodic Minor', formula: '1 2 ♭3 4 5 6 7', character: 'Jazz, sophisticated' },
        { name: 'Pentatonic Major', formula: '1 2 3 5 6', character: 'Simple, universal' },
        { name: 'Pentatonic Minor', formula: '1 ♭3 4 5 ♭7', character: 'Blues, rock' },
        { name: 'Blues Scale', formula: '1 ♭3 4 ♭5 5 ♭7', character: 'Blues, expressive' },
      ]
    }
  ];

  return (
    <div className="reference-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Scale Tables & Reference</h2>
        <p className="tab-header__subtitle">
          Comprehensive reference for scales, modes, and their properties
        </p>
      </div>

      <div className="reference-controls">
        <div className="search-section">
          <div className="space-y-2">
            <Label htmlFor="search-scales">Search scales and modes:</Label>
            <Input
              id="search-scales"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, notes, or characteristics..."
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="space-y-2">
            <Label htmlFor="filter-category">Filter by category:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="reference-content">
        <div className="quick-reference">
          <h3 className="quick-reference__title">Quick Reference</h3>

          {quickReference.map((section) => (
            <div key={section.category} className="reference-section">
              <h4 className="reference-section__title">{section.category}</h4>
              <div className="reference-grid">
                {section.modes.map((mode) => (
                  <div key={mode.name} className="reference-card">
                    <h5 className="reference-card__name">{mode.name}</h5>
                    <p className="reference-card__formula">{mode.formula}</p>
                    <p className="reference-card__character">{mode.character}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="scale-tables-section">
          <h3 className="scale-tables__title">Interactive Scale Tables</h3>
          <p className="scale-tables__description">
            Explore detailed scale tables with MIDI playback and note highlighting.
          </p>

          <div className="scale-finder-container">
            <ScaleFinder 
              initialHighlightId={highlightId || null}
              embedded={true}
              showDebugInfo={showDebugInfo}
              onShowUnifiedResults={onShowUnifiedResults}
              onAddToHistory={onAddToHistory}
            />
          </div>
        </div>
      </div>

      <div className="reference-footer">
        <div className="legend">
          <h4 className="legend__title">Legend</h4>
          <div className="legend__items">
            <div className="legend__item">
              <span className="legend__symbol">♭</span>
              <span className="legend__text">Flat (lower by semitone)</span>
            </div>
            <div className="legend__item">
              <span className="legend__symbol">#</span>
              <span className="legend__text">Sharp (raise by semitone)</span>
            </div>
            <div className="legend__item">
              <span className="legend__symbol">1 2 3...</span>
              <span className="legend__text">Scale degrees from root note</span>
            </div>
          </div>
        </div>

        <div className="tips">
          <h4 className="tips__title">Tips</h4>
          <ul className="tips__list">
            <li>Click on any scale in the tables to hear it played</li>
            <li>Use MIDI input to play scales directly</li>
            <li>Compare modes by switching between different root notes</li>
            <li>Look for highlighted scales when navigating from other tabs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferenceTab;
