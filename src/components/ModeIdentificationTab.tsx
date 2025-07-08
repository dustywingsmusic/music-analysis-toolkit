import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type IdentificationMethod = 'melody' | 'scale' | 'progression' | 'audio';

interface ValidationIssue {
  type: 'format_mismatch';
  message: string;
  suggestion: string;
  suggestedMethod: IdentificationMethod;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  detectedFormat: string;
}

interface ModeIdentificationTabProps {
  onAnalysisRequest: (method: IdentificationMethod, data: any) => void;
  hasResults?: boolean;
  initialMethod?: IdentificationMethod;
  initialMelodyNotes?: string;
  initialScaleNotes?: string;
  initialProgression?: string;
}

const ModeIdentificationTab: React.FC<ModeIdentificationTabProps> = ({ 
  onAnalysisRequest, 
  hasResults = false,
  initialMethod,
  initialMelodyNotes,
  initialScaleNotes,
  initialProgression
}) => {
  const [activeMethod, setActiveMethod] = useState<IdentificationMethod>(initialMethod || 'melody');
  const [melodyNotes, setMelodyNotes] = useState<string>(initialMelodyNotes || '');
  const [scaleNotes, setScaleNotes] = useState<string>(initialScaleNotes || '');
  const [progression, setProgression] = useState<string>(initialProgression || '');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Update state when props change (for "Return to Input" functionality)
  useEffect(() => {
    if (initialMethod !== undefined) {
      setActiveMethod(initialMethod);
    }
  }, [initialMethod]);

  useEffect(() => {
    if (initialMelodyNotes !== undefined) {
      setMelodyNotes(initialMelodyNotes);
    }
  }, [initialMelodyNotes]);

  useEffect(() => {
    if (initialScaleNotes !== undefined) {
      setScaleNotes(initialScaleNotes);
    }
  }, [initialScaleNotes]);

  useEffect(() => {
    if (initialProgression !== undefined) {
      setProgression(initialProgression);
    }
  }, [initialProgression]);

  const methods = [
    { id: 'melody' as IdentificationMethod, label: 'Melody Analysis', description: 'What mode is this melody?' },
    { id: 'scale' as IdentificationMethod, label: 'Scale Analysis', description: 'What mode uses these notes?' },
    { id: 'progression' as IdentificationMethod, label: 'Chord Progression', description: 'What mode fits this progression?' },
    { id: 'audio' as IdentificationMethod, label: 'Audio Analysis', description: 'Analyze audio input (coming soon)' },
  ];

  // Input format detection functions
  const detectInputFormat = (input: string, context?: IdentificationMethod): string => {
    const trimmed = input.trim();
    if (!trimmed) return 'empty';

    // Clean up commas and split on whitespace and/or commas
    const cleanedInput = trimmed.replace(/,/g, ' ');
    const tokens = cleanedInput.split(/\s+/).filter(token => token.length > 0);

    // Improved patterns for better detection
    const notePattern = /^[A-G][#b]?$/;
    const chordPattern = /^[A-G][#b]?(maj|min|m|M|\+|dim|aug|sus|add)[0-9]*$|^[A-G][#b]?[0-9]+$/;
    const slashChordPattern = /^[A-G][#b]?(maj|min|m|M|\+|dim|aug|sus|add)?[0-9]*\/[A-G][#b]?$/;

    let chordCount = 0;
    let noteCount = 0;
    let ambiguousCount = 0; // Simple letter names that could be either notes or chords

    tokens.forEach(token => {
      if (slashChordPattern.test(token)) {
        // Slash chords are definitely chord symbols
        chordCount++;
      } else if (notePattern.test(token)) {
        // Check if it's clearly a chord (has chord quality or number)
        if (chordPattern.test(token)) {
          chordCount++;
        } else {
          // It's a simple note name - could be ambiguous
          ambiguousCount++;
        }
      } else if (chordPattern.test(token)) {
        chordCount++;
      }
    });

    // Determine format based on patterns and context
    // If we have clear chord indicators (qualities, numbers), it's chords
    if (chordCount > 0) {
      return 'chords';
    } 
    // If we have ambiguous tokens (simple letter names), use context and heuristics to decide
    else if (ambiguousCount > 0) {
      // If user selected chord progression analysis, interpret as chords
      // BUT only if it looks like a reasonable chord progression (not a long melodic sequence)
      if (context === 'progression') {
        // Heuristic: If we have more than 6 consecutive notes, it's likely a scale/melody
        // Typical chord progressions are 2-6 chords
        if (ambiguousCount <= 6) {
          return 'chords';
        } else {
          return 'notes'; // Long sequence likely indicates notes, not chords
        }
      }
      // For melody/scale analysis or no context, interpret as notes
      else {
        return 'notes';
      }
    } 
    // If we have no recognizable tokens
    else {
      return 'unknown';
    }
  };

  const validateInputForMethod = (method: IdentificationMethod, input: string): ValidationResult => {
    const format = detectInputFormat(input, method);
    const issues: ValidationIssue[] = [];

    switch (method) {
      case 'melody':
      case 'scale':
        if (format === 'chords') {
          issues.push({
            type: 'format_mismatch',
            message: `Detected chord symbols but ${method} analysis expects note names`,
            suggestion: 'Switch to "Chord Progression" analysis or enter note names instead',
            suggestedMethod: 'progression'
          });
        }
        break;

      case 'progression':
        if (format === 'notes') {
          issues.push({
            type: 'format_mismatch', 
            message: 'Detected note names but chord progression analysis expects chord symbols',
            suggestion: 'Switch to "Melody Analysis" or "Scale Analysis", or enter chord symbols instead',
            suggestedMethod: 'melody'
          });
        }
        break;
    }

    return {
      isValid: issues.length === 0,
      issues: issues,
      detectedFormat: format
    };
  };

  // Real-time validation effect
  useEffect(() => {
    let currentInput = '';
    switch (activeMethod) {
      case 'melody':
        currentInput = melodyNotes;
        break;
      case 'scale':
        currentInput = scaleNotes;
        break;
      case 'progression':
        currentInput = progression;
        break;
      case 'audio':
        currentInput = '';
        break;
    }

    if (currentInput.trim()) {
      const validation = validateInputForMethod(activeMethod, currentInput);
      setValidationResult(validation);
    } else {
      setValidationResult(null);
    }
  }, [activeMethod, melodyNotes, scaleNotes, progression]);

  const handleMethodSwitch = (suggestedMethod: IdentificationMethod) => {
    setActiveMethod(suggestedMethod);
    setValidationResult(null); // Clear validation when switching
  };

  const handleAnalyze = () => {
    let data;
    switch (activeMethod) {
      case 'melody':
        data = { notes: melodyNotes };
        break;
      case 'scale':
        data = { notes: scaleNotes };
        break;
      case 'progression':
        data = { chords: progression };
        break;
      case 'audio':
        data = { audioFile: null }; // Future implementation
        break;
      default:
        return;
    }
    onAnalysisRequest(activeMethod, data);
  };

  const renderValidationFeedback = () => {
    if (!validationResult || validationResult.isValid) {
      return null;
    }

    return (
      <div className="validation-feedback">
        {validationResult.issues.map((issue, index) => (
          <div key={index} className="validation-feedback__issue">
            <div className="validation-feedback__message">
              <span className="validation-feedback__icon">⚠️</span>
              {issue.message}
            </div>
            <div className="validation-feedback__suggestion">
              {issue.suggestion}
            </div>
            <button
              onClick={() => handleMethodSwitch(issue.suggestedMethod)}
              className="validation-feedback__switch-btn"
            >
              Switch to {methods.find(m => m.id === issue.suggestedMethod)?.label}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderInputPanel = () => {
    switch (activeMethod) {
      case 'melody':
        return (
          <div className="input-panel">
            <div className="space-y-2">
              <Label htmlFor="melody-notes">Enter melody notes (e.g., C D E F G A B C):</Label>
              <Textarea
                id="melody-notes"
                value={melodyNotes}
                onChange={(e) => setMelodyNotes(e.target.value)}
                placeholder="C D E F G A B C"
                rows={3}
              />
            </div>
            <p className="input-panel__help">
              Enter notes in sequence as they appear in your melody. Use sharps (#) or flats (b) as needed.
            </p>
            {renderValidationFeedback()}
          </div>
        );

      case 'scale':
        return (
          <div className="input-panel">
            <div className="space-y-2">
              <Label htmlFor="scale-notes">Enter scale notes (e.g., C D E F G A B):</Label>
              <Input
                id="scale-notes"
                type="text"
                value={scaleNotes}
                onChange={(e) => setScaleNotes(e.target.value)}
                placeholder="C D E F G A B"
              />
            </div>
            <p className="input-panel__help">
              Enter all the notes that appear in your scale, in any order.
            </p>
            {renderValidationFeedback()}
          </div>
        );

      case 'progression':
        return (
          <div className="input-panel">
            <div className="space-y-2">
              <Label htmlFor="chord-progression">Enter chord progression (e.g., Am F C G):</Label>
              <Input
                id="chord-progression"
                type="text"
                value={progression}
                onChange={(e) => setProgression(e.target.value)}
                placeholder="Am F C G"
              />
            </div>
            <p className="input-panel__help">
              Enter chords separated by spaces. Use standard chord notation (Am, F, C7, etc.).
            </p>
            {renderValidationFeedback()}
          </div>
        );

      case 'audio':
        return (
          <div className="input-panel">
            <div className="input-panel__placeholder">
              <p>🎵 Audio analysis coming soon!</p>
              <p className="input-panel__help">
                This feature will allow you to upload audio files or record directly for mode identification.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mode-identification-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Mode Identification</h2>
        <p className="tab-header__subtitle">
          Identify modes from melodies, scales, or chord progressions
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
              }`}
              disabled={method.id === 'audio'} // Disable audio for now
            >
              <h3 className="method-selector__card-title">{method.label}</h3>
              <p className="method-selector__card-description">{method.description}</p>
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
              (activeMethod === 'melody' && !melodyNotes.trim()) ||
              (activeMethod === 'scale' && !scaleNotes.trim()) ||
              (activeMethod === 'progression' && !progression.trim()) ||
              activeMethod === 'audio'
            }
          >
            Analyze Mode
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModeIdentificationTab;
