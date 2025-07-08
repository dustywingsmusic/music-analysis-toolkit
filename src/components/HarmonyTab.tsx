import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HarmonyMethod = 'analyze' | 'generate' | 'substitute' | 'progression';

interface HarmonyTabProps {
  onHarmonyRequest: (method: HarmonyMethod, data: any) => void;
  hasResults?: boolean;
}

const HarmonyTab: React.FC<HarmonyTabProps> = ({ onHarmonyRequest, hasResults = false }) => {
  const [activeMethod, setActiveMethod] = useState<HarmonyMethod>('analyze');
  const [chordInput, setChordInput] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [targetChord, setTargetChord] = useState<string>('');
  const [progressionInput, setProgressionInput] = useState<string>('');

  const methods = [
    { 
      id: 'analyze' as HarmonyMethod, 
      label: 'Chord Analysis', 
      description: 'Analyze individual chords and their properties',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
    { 
      id: 'generate' as HarmonyMethod, 
      label: 'Mode to Chords', 
      description: 'What chords work in this mode?',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
    { 
      id: 'substitute' as HarmonyMethod, 
      label: 'Modal Interchange', 
      description: 'Can I use modal interchange here? From which modes? (Feature 15)',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
    { 
      id: 'progression' as HarmonyMethod, 
      label: 'Modal Chord Analysis', 
      description: 'What chords in this progression are modal and what are their modes? (Feature 16)',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
  ];

  const commonModes = [
    'C Major (Ionian)',
    'D Dorian',
    'E Phrygian',
    'F Lydian',
    'G Mixolydian',
    'A Minor (Aeolian)',
    'B Locrian',
    'A Harmonic Minor',
    'D Melodic Minor',
    'G Blues Scale'
  ];

  const handleAnalyze = () => {
    let data;
    switch (activeMethod) {
      case 'analyze':
        data = { chord: chordInput };
        break;
      case 'generate':
        data = { mode: selectedMode };
        break;
      case 'substitute':
        data = { chord: targetChord };
        break;
      case 'progression':
        data = { progression: progressionInput };
        break;
      default:
        return;
    }
    onHarmonyRequest(activeMethod, data);
  };

  const renderInputPanel = () => {
    switch (activeMethod) {
      case 'analyze':
        return (
          <div className="input-panel">
            <div className="space-y-2">
              <Label htmlFor="chord-input">Enter chord to analyze:</Label>
              <Input
                id="chord-input"
                type="text"
                value={chordInput}
                onChange={(e) => setChordInput(e.target.value)}
                placeholder="e.g., Cmaj7, Am, F#dim, Gsus4"
              />
            </div>
            <p className="input-panel__help">
              Enter any chord using standard notation. Include extensions, alterations, and bass notes.
            </p>
            <div className="chord-examples">
              <p><strong>Examples:</strong></p>
              <div className="chord-examples__list">
                <button 
                  className="chord-example" 
                  onClick={() => setChordInput('Cmaj7')}
                >
                  Cmaj7
                </button>
                <button 
                  className="chord-example" 
                  onClick={() => setChordInput('Am7')}
                >
                  Am7
                </button>
                <button 
                  className="chord-example" 
                  onClick={() => setChordInput('F#dim')}
                >
                  F#dim
                </button>
                <button 
                  className="chord-example" 
                  onClick={() => setChordInput('Gsus4')}
                >
                  Gsus4
                </button>
              </div>
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="input-panel">
            <div className="space-y-2">
              <Label htmlFor="mode-select">Select mode or scale:</Label>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger id="mode-select">
                  <SelectValue placeholder="Choose a mode..." />
                </SelectTrigger>
                <SelectContent>
                  {commonModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="input-panel__help">
              Select a mode to see all the chords that can be built from its notes.
            </p>
            <div className="mode-info">
              <div className="space-y-2">
                <Label htmlFor="custom-mode">Or enter custom mode:</Label>
                <Input
                  id="custom-mode"
                  type="text"
                  placeholder="e.g., C Dorian, F# Phrygian"
                  onChange={(e) => setSelectedMode(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'substitute':
        return (
          <div className="input-panel">
            <div className="space-y-2">
              <Label htmlFor="target-chord">Enter chord to find substitutions for:</Label>
              <Input
                id="target-chord"
                type="text"
                value={targetChord}
                onChange={(e) => setTargetChord(e.target.value)}
                placeholder="e.g., Cmaj7, G7, Am"
              />
            </div>
            <p className="input-panel__help">
              Enter a chord to find suitable substitutions and alternatives.
            </p>
            <div className="substitution-options">
              <p><strong>Substitution types we'll show:</strong></p>
              <ul>
                <li>• Functional substitutions (same harmonic function)</li>
                <li>• Modal interchange chords</li>
                <li>• Tritone substitutions</li>
                <li>• Extended and altered versions</li>
              </ul>
            </div>
          </div>
        );

      case 'progression':
        return (
          <div className="input-panel">
            <div className="space-y-2">
              <Label htmlFor="chord-progression">Enter chord progression:</Label>
              <Textarea
                id="chord-progression"
                value={progressionInput}
                onChange={(e) => setProgressionInput(e.target.value)}
                placeholder="e.g., Am F C G | Dm G Em Am"
                rows={3}
              />
            </div>
            <p className="input-panel__help">
              Enter chords separated by spaces. Use | to separate measures.
            </p>
            <div className="progression-examples">
              <p><strong>Common progressions:</strong></p>
              <div className="progression-examples__list">
                <button 
                  className="progression-example" 
                  onClick={() => setProgressionInput('Am F C G')}
                >
                  vi-IV-I-V (Am F C G)
                </button>
                <button 
                  className="progression-example" 
                  onClick={() => setProgressionInput('Dm G Em Am')}
                >
                  iv-VII-iii-vi (Dm G Em Am)
                </button>
                <button 
                  className="progression-example" 
                  onClick={() => setProgressionInput('Cmaj7 Am7 Dm7 G7')}
                >
                  I-vi-ii-V (Cmaj7 Am7 Dm7 G7)
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="harmony-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Chords & Harmony</h2>
        <p className="tab-header__subtitle">
          Analyze chords, explore modal harmony, and build progressions
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
            onClick={handleAnalyze}
            disabled={
              (activeMethod === 'analyze' && !chordInput.trim()) ||
              (activeMethod === 'generate' && !selectedMode.trim()) ||
              (activeMethod === 'substitute' && !targetChord.trim()) ||
              (activeMethod === 'progression' && !progressionInput.trim())
            }
          >
            {activeMethod === 'analyze' && 'Analyze Chord'}
            {activeMethod === 'generate' && 'Generate Chords'}
            {activeMethod === 'substitute' && 'Find Substitutions'}
            {activeMethod === 'progression' && 'Analyze Progression'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HarmonyTab;
