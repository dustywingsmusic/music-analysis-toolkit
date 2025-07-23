import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { buildModesFromRoot, isValidRootNote, ModeFromRoot } from '../services/scaleDataService';
import ScaleGrid from './reference/ScaleGrid';
import { trackInteraction } from '../utils/tracking';

type DiscoveryMethod = 'root' | 'notes' | 'compare' | 'explore';

interface ModeDiscoveryTabProps {
  onDiscoveryRequest: (method: DiscoveryMethod, data: any) => void;
  hasResults?: boolean;
  isLoading?: boolean;
  onDeeperAnalysis?: (mode: ModeFromRoot) => void;
}

const ModeDiscoveryTab: React.FC<ModeDiscoveryTabProps> = ({ onDiscoveryRequest, hasResults = false, isLoading = false, onDeeperAnalysis }) => {
  const [activeMethod, setActiveMethod] = useState<DiscoveryMethod>('root');
  const [rootNote, setRootNote] = useState<string>('C');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [compareMode1, setCompareMode1] = useState<string>('');
  const [compareMode2, setCompareMode2] = useState<string>('');

  // State for inline results (two-stage flow)
  const [inlineResults, setInlineResults] = useState<ModeFromRoot[] | null>(null);
  const [inlineResultsError, setInlineResultsError] = useState<string | null>(null);

  // State for tracking loading states
  const [loadingModeId, setLoadingModeId] = useState<string | null>(null);

  // Clear loading state when main loading is complete
  React.useEffect(() => {
    if (!isLoading) {
      setLoadingModeId(null);
    }
  }, [isLoading]);

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const methods = [
    { 
      id: 'root' as DiscoveryMethod, 
      label: 'Build from Root', 
      description: 'What modes can I build from this note?',
      status: 'complete',
      statusLabel: 'Ready'
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
    // Track discovery action based on method
    const methodLabels = {
      'root': 'Build from Root',
      'notes': 'Find by Notes',
      'compare': 'Compare Modes',
      'explore': 'Explore Relationships'
    };
    trackInteraction(`${methodLabels[activeMethod]} - Get Deeper Analysis`, 'Music Analysis');
    
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

  // Handle immediate note selection for two-stage flow
  const handleNoteSelect = (note: string) => {
    setRootNote(note);

    // For "Build from Root" method, show immediate results
    if (activeMethod === 'root') {
      try {
        if (!isValidRootNote(note)) {
          setInlineResultsError(`Invalid root note: ${note}`);
          setInlineResults(null);
          return;
        }

        const modes = buildModesFromRoot(note);
        setInlineResults(modes);
        setInlineResultsError(null);
      } catch (error) {
        setInlineResultsError(error instanceof Error ? error.message : 'Unknown error');
        setInlineResults(null);
      }
    }
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
                  onClick={() => {
                    trackInteraction(`Note Selector - Root Note ${note}`, 'Music Input');
                    handleNoteSelect(note);
                  }}
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
                  onClick={() => {
                    trackInteraction(`Note Selector - Multi Note ${note}`, 'Music Input');
                    toggleNote(note);
                  }}
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
                  onClick={() => {
                    trackInteraction(`Note Selector - Exploration Note ${note}`, 'Music Input');
                    setRootNote(note);
                  }}
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
              onClick={() => {
                trackInteraction(`Method Selector - ${method.label}`, 'Navigation');
                setActiveMethod(method.id);
              }}
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

        {/* Inline Results Display for Two-Stage Flow */}
        {activeMethod === 'root' && (inlineResults || inlineResultsError) && (
          <div className="inline-results">
            <div className="inline-results__header">
              <h3 className="inline-results__title">
                Modes built from {rootNote}
              </h3>
              {inlineResults && (
                <p className="inline-results__count">
                  {inlineResults.length} modes found
                </p>
              )}
            </div>

            {inlineResultsError && (
              <div className="inline-results__error">
                <p className="text-red-400">{inlineResultsError}</p>
              </div>
            )}

            {inlineResults && (
              <div className="inline-results__grid">
                <ScaleGrid
                  modes={inlineResults}
                  onModeSelect={(mode) => {
                    trackInteraction(`Build from Root - Select Mode ${mode.name}`, 'Music Analysis');
                    if (onDeeperAnalysis) {
                      setLoadingModeId(mode.id);
                      onDeeperAnalysis(mode);
                    }
                  }}
                  compact={true}
                  showCharacteristics={true}
                  enableFiltering={true}
                  interactionMode="select"
                  loadingModeId={loadingModeId}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        )}

        <div className="input-section__actions">
          <Button
            onClick={handleDiscover}
            disabled={
              // Disable during loading
              isLoading ||
              // Disable for unimplemented methods
              (activeMethod === 'notes' || activeMethod === 'compare' || activeMethod === 'explore') ||
              // For root method, disable if no inline results (no note selected yet)
              (activeMethod === 'root' && !inlineResults) ||
              // Original validation logic for implemented methods
              (activeMethod === 'notes' && selectedNotes.length === 0) ||
              (activeMethod === 'compare' && (!compareMode1.trim() || !compareMode2.trim()))
            }
          >
            {isLoading && activeMethod === 'root' 
              ? '🎵 Getting Song Examples...' 
              : (activeMethod === 'notes' || activeMethod === 'compare' || activeMethod === 'explore') 
                ? 'Coming Soon' 
                : activeMethod === 'root' && inlineResults
                  ? '🎵 Get Song Examples & Deeper Analysis'
                  : activeMethod === 'root'
                    ? 'Select a note above to see modes'
                    : 'Discover Modes'
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModeDiscoveryTab;
