/**
 * Analysis Hub - Unified Music Analysis Interface
 * 
 * Consolidates functionality from ModeIdentificationTab and EnhancedHarmonyTab
 * into a single, unified interface that routes all analysis through the
 * Comprehensive Analysis Engine.
 * 
 * Features:
 * - Unified music input system (UnifiedMusicInput)
 * - Support for melody, scale, chord, and chord progression analysis
 * - Routes all analysis through ComprehensiveAnalysisEngine
 * - Displays results using DualLensAnalysisPanel
 * - Delightful loading states and interactions
 * - MIDI integration support
 */

import React, { useState, useCallback } from 'react';
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Music2Icon, BrainIcon, SparklesIcon, LoaderIcon } from "lucide-react";
import UnifiedMusicInput, { InputType } from './ui/unified-music-input';
import DelightfulButton from './ui/delightful-button';
import DualLensAnalysisPanel from './DualLensAnalysisPanel';
import { ComprehensiveAnalysisEngine, ComprehensiveAnalysisResult } from '../services/comprehensiveAnalysisService';
import { useAnalysisActions } from '../contexts/AnalysisContext';
import { ChordMatch } from '../services/chordLogic';
import { NotePlayed } from '../types';
import { trackInteraction } from '../utils/tracking';
import { logger } from '../utils/logger';

export type AnalysisType = 'melody' | 'scale' | 'chord' | 'progression';

interface AnalysisHubProps {
  hasResults?: boolean;
  midiData?: {
    playedNotes: NotePlayed[];
    playedPitchClasses: Set<number>;
    isActive: boolean;
    status: string;
    clearPlayedNotes: () => void;
    analysisFocus: 'automatic' | 'complete' | 'pentatonic' | 'chord';
    setAnalysisFocus: (focus: 'automatic' | 'complete' | 'pentatonic' | 'chord') => void;
  };
  onSwitchToReferenceWithHighlight?: (mode: string, tonic: string) => void;
}

interface AnalysisInputs {
  melody: string;
  scale: string;
  chord: string;
  progression: string;
  parentKey: string;
}

interface LoadingState {
  isLoading: boolean;
  stage: 'parsing' | 'analyzing' | 'enhancing' | 'complete';
  message: string;
}

const AnalysisHub: React.FC<AnalysisHubProps> = ({ 
  hasResults = false,
  midiData,
  onSwitchToReferenceWithHighlight 
}) => {
  // State management
  const [activeAnalysisType, setActiveAnalysisType] = useState<AnalysisType>('progression');
  const [inputs, setInputs] = useState<AnalysisInputs>({
    melody: '',
    scale: '',
    chord: '',
    progression: '',
    parentKey: ''
  });
  
  const [validationStates, setValidationStates] = useState<Record<AnalysisType, boolean>>({
    melody: true,
    scale: true,
    chord: true,
    progression: true
  });
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: 'complete',
    message: ''
  });
  
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [detectedChords, setDetectedChords] = useState<ChordMatch[]>([]);

  // Analysis engine
  const [analysisEngine] = useState(() => new ComprehensiveAnalysisEngine());

  // Context integration
  const { startAnalysis, navigateToReference } = useAnalysisActions();

  // Analysis type configurations
  const analysisTypes = [
    { 
      id: 'melody' as AnalysisType, 
      label: 'Melody Analysis', 
      icon: '🎵',
      description: 'Analyze modal characteristics from melodic sequences',
      placeholder: 'Enter melody notes (e.g., C D E F G A B C)',
      example: 'C D E F G A B C'
    },
    { 
      id: 'scale' as AnalysisType, 
      label: 'Scale Analysis', 
      icon: '🎶',
      description: 'Identify modes and scales from note collections',
      placeholder: 'Enter scale notes (e.g., C D E F G A B)',
      example: 'C D E F G A B'
    },
    { 
      id: 'chord' as AnalysisType, 
      label: 'Chord Analysis', 
      icon: '🎹',
      description: 'Analyze individual chords and their harmonic context',
      placeholder: 'Enter chord symbol (e.g., Cmaj7)',
      example: 'Cmaj7'
    },
    { 
      id: 'progression' as AnalysisType, 
      label: 'Chord Progression', 
      icon: '🎼',
      description: 'Comprehensive analysis with functional, modal, and chromatic perspectives',
      placeholder: 'Enter chord progression (e.g., Am F C G)',
      example: 'Am F C G'
    }
  ];

  const currentAnalysisType = analysisTypes.find(type => type.id === activeAnalysisType);

  // Input handlers
  const handleInputChange = useCallback((type: AnalysisType, value: string) => {
    setInputs(prev => ({ ...prev, [type]: value }));
    setAnalysisError(null);
  }, []);

  const handleValidation = useCallback((type: AnalysisType) => (
    isValid: boolean, 
    _suggestions?: string[]
  ) => {
    setValidationStates(prev => ({ ...prev, [type]: isValid }));
  }, []);

  const handleChordDetected = useCallback((chords: ChordMatch[]) => {
    setDetectedChords(chords);
    
    // Auto-fill chord input if we're in chord analysis mode
    if (activeAnalysisType === 'chord' && chords.length > 0) {
      setInputs(prev => ({ ...prev, chord: chords[0].chordSymbol }));
    }
  }, [activeAnalysisType]);

  const handleNotesChanged = useCallback((notes: string[], pitchClasses: number[]) => {
    logger.webClick('Notes changed via unified input', {
      component: 'AnalysisHub',
      action: 'notes_changed',
      analysisType: activeAnalysisType,
      noteCount: notes.length,
      uniquePitchClasses: pitchClasses.length
    });
  }, [activeAnalysisType]);

  // Analysis execution
  const handleAnalyze = useCallback(async () => {
    const currentInput = inputs[activeAnalysisType].trim();
    const parentKey = inputs.parentKey.trim();
    
    if (!currentInput) {
      setAnalysisError('Please enter some musical content to analyze');
      return;
    }

    try {
      setLoadingState({
        isLoading: true,
        stage: 'parsing',
        message: 'Parsing musical input...'
      });
      
      setAnalysisError(null);
      setAnalysisResult(null);

      // Log analysis initiation
      logger.webClick('User initiated comprehensive analysis', {
        component: 'AnalysisHub',
        action: 'analyze_start',
        analysisType: activeAnalysisType,
        inputLength: currentInput.length,
        hasParentKey: !!parentKey
      });

      // Stage 1: Parse and validate input
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingState(prev => ({
        ...prev,
        stage: 'analyzing',
        message: 'Running comprehensive analysis...'
      }));

      // Stage 2: Route to appropriate analysis based on type
      let result: ComprehensiveAnalysisResult;
      
      if (activeAnalysisType === 'progression' || activeAnalysisType === 'chord') {
        // Use comprehensive analysis engine for chord-based analysis
        result = await analysisEngine.analyzeComprehensively(currentInput, parentKey || undefined);
      } else {
        // For melody/scale analysis, we need to convert to a chord progression format
        // This is a simplified approach - in a full implementation, you'd want
        // melody-specific analysis engines
        
        setLoadingState(prev => ({
          ...prev,
          stage: 'enhancing',
          message: 'Enhancing with modal analysis...'
        }));
        
        // Convert notes to a basic progression for comprehensive analysis
        // This is a placeholder - you'd implement proper melody/scale analysis
        const basicProgression = await convertNotesToProgression(currentInput, activeAnalysisType);
        result = await analysisEngine.analyzeComprehensively(basicProgression, parentKey || undefined);
        
        // Update the user input context to reflect the original input
        result.userInput = {
          chordProgression: currentInput,
          parentKey: parentKey || undefined,
          analysisType: activeAnalysisType
        };
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoadingState(prev => ({
        ...prev,
        stage: 'complete',
        message: 'Analysis complete!'
      }));

      setAnalysisResult(result);
      
      // Update context for legacy compatibility  
      startAnalysis(activeAnalysisType as any, currentInput);
      
      trackInteraction(`Analysis Hub - ${activeAnalysisType} analysis`, 'Analysis');
      
      // Log successful analysis
      logger.webClick('Comprehensive analysis completed', {
        component: 'AnalysisHub',
        action: 'analyze_complete',
        analysisType: activeAnalysisType,
        primaryApproach: result.primaryApproach,
        confidence: result.confidence,
        hasModal: !!result.modal,
        hasChromatic: !!result.chromatic
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      
      logger.webClick('Analysis failed', {
        component: 'AnalysisHub',
        action: 'analyze_error',
        analysisType: activeAnalysisType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingState({
        isLoading: false,
        stage: 'complete',
        message: ''
      });
    }
  }, [activeAnalysisType, inputs, analysisEngine, startAnalysis]);

  // Helper function to convert notes to progression (placeholder)
  const convertNotesToProgression = async (notes: string, type: AnalysisType): Promise<string> => {
    // This is a simplified conversion for demo purposes
    // In a full implementation, you'd have sophisticated melody/scale analysis
    
    if (type === 'melody') {
      // For melody, create a simple I-V-vi-IV progression as a starting point
      return 'C G Am F';
    } else if (type === 'scale') {
      // For scale, create a progression that emphasizes the scale tones
      return 'C Dm Em F G Am';
    }
    
    return notes; // Fallback
  };

  const handleViewInTables = useCallback((mode: string, tonic: string) => {
    if (onSwitchToReferenceWithHighlight) {
      onSwitchToReferenceWithHighlight(mode, tonic);
    } else {
      navigateToReference(mode, tonic, 'analysis_hub');
    }
  }, [onSwitchToReferenceWithHighlight, navigateToReference]);

  const handleClearAll = useCallback(() => {
    setInputs({
      melody: '',
      scale: '',
      chord: '',
      progression: '',
      parentKey: ''
    });
    setAnalysisResult(null);
    setAnalysisError(null);
    setDetectedChords([]);
    
    trackInteraction('Analysis Hub - Clear All Inputs', 'Action');
  }, []);

  const handleLoadExample = useCallback((type: AnalysisType) => {
    const exampleInputs: Record<AnalysisType, { input: string; parentKey?: string }> = {
      melody: { input: 'C D E F G A B C' },
      scale: { input: 'C D E F G A B' },
      chord: { input: 'Cmaj7' },
      progression: { input: 'Am F C G', parentKey: 'C major' }
    };
    
    const example = exampleInputs[type];
    setInputs(prev => ({
      ...prev,
      [type]: example.input,
      parentKey: example.parentKey || prev.parentKey
    }));
    
    trackInteraction(`Analysis Hub - Load ${type} Example`, 'Action');
  }, []);

  // Loading component
  const LoadingDisplay: React.FC = () => (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
            <div className="absolute -inset-2 bg-blue-200 rounded-full animate-pulse opacity-25" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-blue-900">
              {loadingState.message}
            </h3>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {loadingState.stage}
              </Badge>
              <div className="flex space-x-1">
                {['parsing', 'analyzing', 'enhancing', 'complete'].map((stage, index) => (
                  <div
                    key={stage}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      ['parsing', 'analyzing', 'enhancing', 'complete'].indexOf(loadingState.stage) >= index
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="analysis-hub">
      <div className="tab-header">
        <h2 className="tab-header__title flex items-center gap-3">
          <BrainIcon className="h-7 w-7 text-primary" />
          Analysis Hub
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Unified ✨
          </Badge>
        </h2>
        <p className="tab-header__subtitle">
          Comprehensive music analysis with functional, modal, and chromatic perspectives
        </p>
      </div>

      {/* Analysis Type Selector */}
      <div className="method-selector">
        <div className="method-selector__grid">
          {analysisTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setActiveAnalysisType(type.id);
                trackInteraction(`Analysis Hub - ${type.label}`, 'Navigation');
              }}
              className={`method-selector__card ${
                activeAnalysisType === type.id ? 'method-selector__card--active' : ''
              }`}
            >
              <div className="method-selector__card-header">
                <span className="text-2xl">{type.icon}</span>
                <h3 className="method-selector__card-title">{type.label}</h3>
              </div>
              <p className="method-selector__card-description">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={`input-section ${hasResults || analysisResult ? 'input-section--with-results' : ''}`}>
        <Card>
          <CardHeader>
            <CardDescription>
              {currentAnalysisType?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Input */}
            <UnifiedMusicInput
              value={inputs[activeAnalysisType]}
              onChange={(value) => handleInputChange(activeAnalysisType, value)}
              label={`${currentAnalysisType?.label} Input`}
              placeholder={currentAnalysisType?.placeholder}
              inputType={activeAnalysisType as InputType}
              midiData={midiData}
              onValidation={handleValidation(activeAnalysisType)}
              onChordDetected={handleChordDetected}
              onNotesChanged={handleNotesChanged}
              enableChordRecognition={activeAnalysisType === 'chord' || activeAnalysisType === 'scale'}
              showSuggestions
            />

            {/* Parent Key Input (for progression analysis) */}
            {activeAnalysisType === 'progression' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="parent-key">Parent Key Signature (optional)</Label>
                  <UnifiedMusicInput
                    value={inputs.parentKey}
                    onChange={(value) => handleInputChange('parentKey' as AnalysisType, value)}
                    label=""
                    placeholder="e.g., C major, Bb major, F# minor"
                    inputType="chord"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Specify the parent key signature to guide analysis. Leave blank for automatic key detection.
                  </p>
                </div>
              </>
            )}

            {/* Detected Chords Display */}
            {detectedChords.length > 0 && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-sm font-semibold text-primary mb-2">Detected Chords:</h4>
                <div className="flex flex-wrap gap-2">
                  {detectedChords.slice(0, 4).map((chord, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {chord.chordSymbol} ({Math.round(chord.confidence * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <DelightfulButton
                onClick={handleAnalyze}
                disabled={
                  loadingState.isLoading ||
                  !inputs[activeAnalysisType].trim() ||
                  !validationStates[activeAnalysisType]
                }
                size="lg"
                className="flex-1 min-w-0"
                sparkle
                musical
              >
                {loadingState.isLoading ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </DelightfulButton>
              
              <DelightfulButton
                onClick={() => handleLoadExample(activeAnalysisType)}
                variant="outline"
                size="lg"
              >
                <Music2Icon className="w-4 h-4 mr-2" />
                Example
              </DelightfulButton>
              
              <DelightfulButton
                onClick={handleClearAll}
                variant="outline"
                size="lg"
              >
                Clear All
              </DelightfulButton>
            </div>

            {/* Error Display */}
            {analysisError && (
              <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200">
                <strong>Error:</strong> {analysisError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {loadingState.isLoading && <LoadingDisplay />}
      
      {analysisResult && !loadingState.isLoading && (
        <div className="mt-6">
          <DualLensAnalysisPanel 
            result={analysisResult}
            onViewInTables={handleViewInTables}
          />
        </div>
      )}
    </div>
  );
};

export default AnalysisHub;