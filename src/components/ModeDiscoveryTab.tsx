import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DiscoveryMethod = 'root' | 'notes' | 'compare' | 'explore';

interface ModeDiscoveryTabProps {
  onDiscoveryRequest: (method: DiscoveryMethod, data: any) => void;
  hasResults?: boolean;
}

const ModeDiscoveryTab: React.FC<ModeDiscoveryTabProps> = ({ onDiscoveryRequest, hasResults = false }) => {
  const [activeMethod, setActiveMethod] = useState<DiscoveryMethod>('root');
  const [rootNote, setRootNote] = useState<string>('C');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [compareMode1, setCompareMode1] = useState<string>('');
  const [compareMode2, setCompareMode2] = useState<string>('');

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const methods = [
    { 
      id: 'root' as DiscoveryMethod, 
      label: 'Build from Root', 
      description: 'What modes can I build from this note?',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
    { 
      id: 'notes' as DiscoveryMethod, 
      label: 'Find by Notes', 
      description: 'What modes contain these specific notes?',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
    { 
      id: 'compare' as DiscoveryMethod, 
      label: 'Compare Modes', 
      description: 'How do these modes differ?',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
    { 
      id: 'explore' as DiscoveryMethod, 
      label: 'Explore Relationships', 
      description: 'Show me related scales and modes',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
  ];

  const handleDiscover = () => {
    let data;
    switch (activeMethod) {
      case 'root':
        data = { rootNote };
        break;
      case 'notes':
        data = { notes: selectedNotes };
        break;
      case 'compare':
        data = { mode1: compareMode1, mode2: compareMode2 };
        break;
      case 'explore':
        data = { rootNote }; // Start exploration from root note
        break;
      default:
        return;
    }
    onDiscoveryRequest(activeMethod, data);
  };

  const toggleNote = (note: string) => {
    setSelectedNotes(prev => 
      prev.includes(note) 
        ? prev.filter(n => n !== note)
        : [...prev, note]
    );
  };

  const renderInputPanel = () => {
    switch (activeMethod) {
      case 'root':
        return (
          <div className="input-panel">
            <Label>Select root note:</Label>
            <div className="note-selector">
              {notes.map((note) => (
                <button
                  key={note}
                  onClick={() => setRootNote(note)}
                  className={`note-selector__note ${
                    rootNote === note ? 'note-selector__note--active' : ''
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
            <p className="input-panel__help">
              Select a root note to see all modes that can be built from it.
            </p>
          </div>
        );

      case 'notes':
        return (
          <div className="input-panel">
            <Label>Select notes to include:</Label>
            <div className="note-selector">
              {notes.map((note) => (
                <button
                  key={note}
                  onClick={() => toggleNote(note)}
                  className={`note-selector__note ${
                    selectedNotes.includes(note) ? 'note-selector__note--active' : ''
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
            <p className="input-panel__help">
              Select the notes you want to include. We'll find modes that contain these notes.
            </p>
            {selectedNotes.length > 0 && (
              <div className="selected-notes">
                <strong>Selected notes:</strong> {selectedNotes.join(', ')}
              </div>
            )}
          </div>
        );

      case 'compare':
        return (
          <div className="input-panel">
            <div className="compare-inputs">
              <div className="compare-input">
                <div className="space-y-2">
                  <Label htmlFor="compare-mode-1">First mode/scale:</Label>
                  <Input
                    id="compare-mode-1"
                    type="text"
                    value={compareMode1}
                    onChange={(e) => setCompareMode1(e.target.value)}
                    placeholder="e.g., C Major, D Dorian"
                  />
                </div>
              </div>
              <div className="compare-input">
                <div className="space-y-2">
                  <Label htmlFor="compare-mode-2">Second mode/scale:</Label>
                  <Input
                    id="compare-mode-2"
                    type="text"
                    value={compareMode2}
                    onChange={(e) => setCompareMode2(e.target.value)}
                    placeholder="e.g., A Minor, E Phrygian"
                  />
                </div>
              </div>
            </div>
            <p className="input-panel__help">
              Enter two modes or scales to compare their differences and similarities.
            </p>
          </div>
        );

      case 'explore':
        return (
          <div className="input-panel">
            <Label>Starting point for exploration:</Label>
            <div className="note-selector">
              {notes.map((note) => (
                <button
                  key={note}
                  onClick={() => setRootNote(note)}
                  className={`note-selector__note ${
                    rootNote === note ? 'note-selector__note--active' : ''
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
            <p className="input-panel__help">
              Choose a starting note to explore scale relationships, parent scales, and mode families.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mode-discovery-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Mode Discovery</h2>
        <p className="tab-header__subtitle">
          Discover and explore modes, scales, and their relationships
        </p>
      </div>

      <div className="method-selector">
        <div className="method-selector__grid">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveMethod(method.id)}
              className={`method-selector__card ${
                activeMethod === method.id ? 'method-selector__card--active' : ''
              } method-selector__card--${method.status}`}
              title={`${method.label} - ${method.statusLabel}`}
            >
              <div className="method-selector__card-header">
                <h3 className="method-selector__card-title">{method.label}</h3>
                <span className={`method-selector__card-status method-selector__card-status--${method.status}`}>
                  {method.status === 'complete' ? '✓' : method.status === 'partial' ? '⚠' : '○'}
                </span>
              </div>
              <p className="method-selector__card-description">{method.description}</p>
              <div className="method-selector__card-status-label">
                {method.statusLabel}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`input-section ${hasResults ? 'input-section--with-results' : ''}`}>
        {renderInputPanel()}

        <div className="input-section__actions">
          <Button
            onClick={handleDiscover}
            disabled={
              (activeMethod === 'notes' && selectedNotes.length === 0) ||
              (activeMethod === 'compare' && (!compareMode1.trim() || !compareMode2.trim()))
            }
          >
            Discover Modes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModeDiscoveryTab;
