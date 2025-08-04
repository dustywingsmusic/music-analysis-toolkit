import React, { useState, useEffect } from 'react';
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { logger } from '../utils/logger';
import { trackInteraction } from '../utils/tracking';
import DelightfulButton from './ui/delightful-button';
import MusicalLoading from './ui/musical-loading';
import EmptyState from './ui/empty-state';
import FriendlyError from './ui/friendly-error';
import MidiVisualizer from './ui/midi-visualizer';
import SuccessCelebration from './ui/success-celebration';
import { cn } from '../lib/utils';

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

interface EnhancedModeIdentificationTabProps {
  onAnalysisRequest: (method: IdentificationMethod, data: any) => void;
  hasResults?: boolean;
  isLoading?: boolean;
  analysisSuccess?: boolean;
  error?: string;
  initialMethod?: IdentificationMethod;
  initialMelodyNotes?: string;
  initialScaleNotes?: string;
  initialProgression?: string;
  midiData?: {
    playedNotes: string[];
    isActive: boolean;
  };
}

const EnhancedModeIdentificationTab: React.FC<EnhancedModeIdentificationTabProps> = ({ 
  onAnalysisRequest, 
  hasResults = false,
  isLoading = false,
  analysisSuccess = false,
  error,
  initialMethod,
  initialMelodyNotes,
  initialScaleNotes,
  initialProgression,
  midiData
}) => {
  const [activeMethod, setActiveMethod] = useState<IdentificationMethod>(initialMethod || 'melody');
  const [melodyNotes, setMelodyNotes] = useState<string>(initialMelodyNotes || '');
  const [scaleNotes, setScaleNotes] = useState<string>(initialScaleNotes || '');
  const [progression, setProgression] = useState<string>(initialProgression || '');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

  // Trigger success celebration when analysis completes successfully
  useEffect(() => {
    if (analysisSuccess && !isLoading) {
      setShowSuccessCelebration(true);
    }
  }, [analysisSuccess, isLoading]);

  // Update state when props change (for "Return to Input" functionality)
  useEffect(() => {
    if (initialMethod !== undefined) setActiveMethod(initialMethod);
  }, [initialMethod]);

  useEffect(() => {
    if (initialMelodyNotes !== undefined) setMelodyNotes(initialMelodyNotes);
  }, [initialMelodyNotes]);

  useEffect(() => {
    if (initialScaleNotes !== undefined) setScaleNotes(initialScaleNotes);
  }, [initialScaleNotes]);

  useEffect(() => {
    if (initialProgression !== undefined) setProgression(initialProgression);
  }, [initialProgression]);

  const methods = [
    { 
      id: 'melody' as IdentificationMethod, 
      label: 'Melody Analysis', 
      description: 'What mode is this melody?',
      emoji: '🎵',
      tips: 'Enter notes in the order they appear in your melody'
    },
    { 
      id: 'scale' as IdentificationMethod, 
      label: 'Scale Analysis', 
      description: 'What mode uses these notes?',
      emoji: '🎼',
      tips: 'Enter all the unique notes that appear, any order works'
    },
    { 
      id: 'progression' as IdentificationMethod, 
      label: 'Chord Progression', 
      description: 'What mode fits this progression?',
      emoji: '🎹',
      tips: 'Use standard chord notation like Am, F, C7, Gmaj7'
    },
    { 
      id: 'audio' as IdentificationMethod, 
      label: 'Audio Analysis', 
      description: 'Analyze audio input',
      emoji: '🎙️',
      tips: 'Upload audio files or record directly (coming soon!)'
    },
  ];

  // Input validation logic (simplified from original)
  const validateInput = (method: IdentificationMethod, input: string): ValidationResult => {
    if (!input.trim()) {
      return { isValid: true, issues: [], detectedFormat: 'empty' };
    }
    
    // Basic validation - you can expand this
    return { isValid: true, issues: [], detectedFormat: 'valid' };
  };

  // Real-time validation
  useEffect(() => {
    let currentInput = '';
    switch (activeMethod) {
      case 'melody': currentInput = melodyNotes; break;
      case 'scale': currentInput = scaleNotes; break;
      case 'progression': currentInput = progression; break;
      case 'audio': currentInput = ''; break;
    }

    if (currentInput.trim()) {
      const validation = validateInput(activeMethod, currentInput);
      setValidationResult(validation);
    } else {
      setValidationResult(null);
    }
  }, [activeMethod, melodyNotes, scaleNotes, progression]);

  const handleAnalyze = () => {
    let data;
    switch (activeMethod) {
      case 'melody': data = { notes: melodyNotes }; break;
      case 'scale': data = { notes: scaleNotes }; break;
      case 'progression': data = { chords: progression }; break;
      case 'audio': data = { audioFile: null }; break;
      default: return;
    }
    
    // Track the analysis request
    trackInteraction(`Enhanced Analysis - ${activeMethod}`, 'Analysis');
    onAnalysisRequest(activeMethod, data);
  };

  const handleClearInput = () => {
    setMelodyNotes('');
    setScaleNotes('');
    setProgression('');
    setValidationResult(null);
  };

  const getCurrentInput = () => {
    switch (activeMethod) {
      case 'melody': return melodyNotes;
      case 'scale': return scaleNotes;
      case 'progression': return progression;
      default: return '';
    }
  };

  const hasInput = getCurrentInput().trim().length > 0;
  const canAnalyze = hasInput && !isLoading && activeMethod !== 'audio';

  return (
    <div className="enhanced-mode-identification-tab space-y-6">
      {/* Success Celebration */}
      <SuccessCelebration 
        trigger={showSuccessCelebration}
        variant="mode-found"
      />
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
          <span className="animate-bounce-gentle">🔍</span>
          Mode Identification
        </h2>
        <p className="text-muted-foreground">
          Discover the modes hiding in your music with AI-powered analysis
        </p>
      </div>

      {/* Method Selector */}
      <div className="method-selector space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Choose your analysis method:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                trackInteraction(`Enhanced Method Selector - ${method.label}`, 'Navigation');
                setActiveMethod(method.id);
              }}
              className={cn(
                "p-4 rounded-lg border-2 transition-all duration-200 text-left space-y-2 hover:shadow-md",
                activeMethod === method.id 
                  ? "border-primary bg-primary/5 shadow-md hover-lift" 
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{method.emoji}</span>
                <div>
                  <h4 className="font-semibold text-foreground">{method.label}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">💡 {method.tips}</p>
            </button>
          ))}
        </div>
      </div>

      {/* MIDI Visualizer */}
      {midiData && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">MIDI Input (Real-time)</Label>
          <MidiVisualizer 
            playedNotes={midiData.playedNotes}
            isActive={midiData.isActive}
          />
        </div>
      )}

      {/* Input Panel */}
      <div className="input-panel space-y-4">
        {activeMethod === 'melody' && (
          <div className="space-y-2">
            <Label htmlFor="melody-notes" className="flex items-center gap-2">
              <span>🎵</span>
              Enter melody notes (e.g., C D E F G A B C):
            </Label>
            <Textarea
              id="melody-notes"
              value={melodyNotes}
              onChange={(e) => setMelodyNotes(e.target.value)}
              placeholder="C D E F G A B C"
              rows={3}
              className="transition-all duration-200 focus:shadow-md"
            />
            <p className="text-sm text-muted-foreground">
              Enter notes in sequence as they appear in your melody. Use sharps (#) or flats (b) as needed.
            </p>
          </div>
        )}

        {activeMethod === 'scale' && (
          <div className="space-y-2">
            <Label htmlFor="scale-notes" className="flex items-center gap-2">
              <span>🎼</span>
              Enter scale notes (e.g., C D E F G A B):
            </Label>
            <Input
              id="scale-notes"
              type="text"
              value={scaleNotes}
              onChange={(e) => setScaleNotes(e.target.value)}
              placeholder="C D E F G A B"
              className="transition-all duration-200 focus:shadow-md"
            />
            <p className="text-sm text-muted-foreground">
              Enter all the notes that appear in your scale, in any order.
            </p>
          </div>
        )}

        {activeMethod === 'progression' && (
          <div className="space-y-2">
            <Label htmlFor="chord-progression" className="flex items-center gap-2">
              <span>🎹</span>
              Enter chord progression (e.g., Am F C G):
            </Label>
            <Input
              id="chord-progression"
              type="text"
              value={progression}
              onChange={(e) => setProgression(e.target.value)}
              placeholder="Am F C G"
              className="transition-all duration-200 focus:shadow-md"
            />
            <p className="text-sm text-muted-foreground">
              Enter chords separated by spaces. Use standard chord notation (Am, F, C7, etc.).
            </p>
          </div>
        )}

        {activeMethod === 'audio' && (
          <EmptyState
            variant="coming-soon"
            title="Audio Analysis Coming Soon!"
            description="We're working on bringing you powerful audio analysis capabilities."
            actionLabel="Try Another Method"
            onAction={() => setActiveMethod('melody')}
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <FriendlyError
          message={error}
          suggestions={[
            "Double-check your note names and format",
            "Try a different analysis method",  
            "Make sure notes are separated by spaces"
          ]}
          onRetry={() => handleAnalyze()}
          onClear={handleClearInput}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <MusicalLoading 
          variant="analysis"
          size="md"
          className="my-8"
        />
      )}

      {/* Actions */}
      {!isLoading && activeMethod !== 'audio' && (
        <div className="flex items-center gap-3">
          <DelightfulButton
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            musical
            sparkle
            className="flex-1"
          >
            {canAnalyze ? '🔍 Analyze Mode' : 'Enter some music first'}
          </DelightfulButton>
          
          {hasInput && (
            <DelightfulButton
              onClick={handleClearInput}
              variant="outline"
              className="px-6"
            >
              Clear
            </DelightfulButton>
          )}
        </div>
      )}

      {/* Empty State when no input */}
      {!hasInput && !isLoading && activeMethod !== 'audio' && (
        <EmptyState
          variant="no-input"
          className="mt-8"
        />
      )}
    </div>
  );
};

export default EnhancedModeIdentificationTab;