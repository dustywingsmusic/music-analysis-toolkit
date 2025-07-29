/**
 * Enhanced Harmony Tab
 * Implements the Music Theory Integration Roadmap Phase 1
 * Uses local analysis first with AI enhancement
 */

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { trackInteraction } from '../utils/tracking';
import { useAnalysis, useAnalysisActions } from '../contexts/AnalysisContext';
import { analyzeChordProgression } from '../services/hybridAnalysisService';
import { LocalChordAnalysis } from '../services/localChordProgressionAnalysis';

type HarmonyMethod = 'analyze' | 'generate' | 'substitute' | 'progression';

interface EnhancedHarmonyTabProps {
  hasResults?: boolean;
  onSwitchToReferenceWithHighlight?: (mode: string, tonic: string) => void;
}

const EnhancedHarmonyTab: React.FC<EnhancedHarmonyTabProps> = ({ 
  hasResults = false,
  onSwitchToReferenceWithHighlight 
}) => {
  const [activeMethod, setActiveMethod] = useState<HarmonyMethod>('progression');
  const [progressionInput, setProgressionInput] = useState<string>('');
  const [knownKey, setKnownKey] = useState<string>('');

  const { state } = useAnalysis();
  const { startAnalysis, completeLocalAnalysis, completeAIEnhancement, navigateToReference, setError } = useAnalysisActions();

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
      description: 'Can I use modal interchange here? From which modes?',
      status: 'not-implemented',
      statusLabel: 'Coming Soon'
    },
    { 
      id: 'progression' as HarmonyMethod, 
      label: 'Modal Chord Analysis', 
      description: 'Enhanced analysis with local music theory algorithms',
      status: 'enhanced',
      statusLabel: 'Enhanced ✨'
    },
  ];


  const handleAnalyze = async () => {
    if (activeMethod !== 'progression' || !progressionInput.trim()) {
      return;
    }

    try {
      // Start analysis using unified context
      startAnalysis('chord_progression', progressionInput);
      
      // Perform hybrid analysis
      const analysisResult = await analyzeChordProgression(progressionInput, {
        useLocalFirst: state.preferences.useLocalAnalysisFirst,
        enableAIEnhancement: state.preferences.enableAIEnhancement,
        enableCrossValidation: state.preferences.enableCrossValidation,
        knownKey: knownKey.trim() || undefined
      });

      // Update context with results
      completeLocalAnalysis(analysisResult.localResult);
      
      if (analysisResult.aiEnhancement) {
        completeAIEnhancement(analysisResult.aiEnhancement);
      }

      trackInteraction('Enhanced Chord Progression Analysis', 'Analysis');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    }
  };

  const handleViewInTables = (mode: string, tonic: string) => {
    if (onSwitchToReferenceWithHighlight) {
      onSwitchToReferenceWithHighlight(mode, tonic);
    } else {
      navigateToReference(mode, tonic, 'chord_progression_analysis');
    }
  };

  const renderEnhancedResults = () => {
    if (!state.currentAnalysis?.results.chordProgression) {
      return null;
    }

    const chordProgressionResult = state.currentAnalysis.results.chordProgression;
    const analysis = chordProgressionResult.localAnalysis;
    const alternatives = chordProgressionResult.alternativeInterpretations;
    const aiEnhancement = state.aiEnhancement;
    const crossValidation = state.crossValidation;

    return (
      <div className="enhanced-results-panel space-y-4">
        {/* Local Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Local Analysis Results
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {(analysis.confidence * 100).toFixed(0)}% Confidence
              </Badge>
            </CardTitle>
            <CardDescription>
              Theoretically accurate analysis using local music theory algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong>Key Center:</strong> {analysis.keyCenter}
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 p-0 h-auto"
                  onClick={() => handleViewInTables(analysis.overallMode, analysis.keyCenter.split(' ')[0])}
                >
                  View in Tables →
                </Button>
              </div>
              <div><strong>Overall Mode:</strong> {analysis.overallMode}</div>
              
              {/* Chord-by-chord analysis */}
              <div>
                <strong>Chord Analysis:</strong>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {analysis.chords.map((chord: LocalChordAnalysis, index: number) => (
                    <div key={index} className="border rounded p-2 text-sm">
                      <div className="font-medium">{chord.chordSymbol}</div>
                      <div className="text-gray-600">
                        {chord.romanNumeral} - {chord.function}
                        {chord.isModal && <Badge variant="secondary" className="ml-1">Modal</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal analysis */}
              {analysis.modalChords.length > 0 && (
                <div>
                  <strong>Modal Elements:</strong>
                  <div className="text-sm text-gray-700 mt-1">
                    {analysis.modalInterchange}
                  </div>
                </div>
              )}
              
              {/* Analysis explanation */}
              {analysis.explanation && (
                <div>
                  <strong>Analysis Method:</strong>
                  <div className="text-sm text-gray-700 mt-1">
                    {analysis.explanation}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alternative Interpretations */}
        {alternatives && alternatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Alternative Interpretations
                <Badge variant="outline">
                  {alternatives.length} Option{alternatives.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
              <CardDescription>
                Other theoretically valid ways to analyze this progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alternatives.map((alt, index) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {alt.keyCenter} - {alt.source === 'user-guided' ? 'User Context' : 
                         alt.source === 'structural' ? 'Structural Analysis' : 'Algorithmic'}
                      </h4>
                      <Badge variant="secondary">
                        {(alt.confidence * 100).toFixed(0)}% Confidence
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2">
                      {alt.explanation}
                    </div>
                    
                    <div className="text-sm">
                      <strong>Roman Numerals:</strong>{' '}
                      {alt.chords.map(chord => chord.romanNumeral).join(' - ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Enhancement Results */}
        {aiEnhancement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI Enhancement
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Contextual
                </Badge>
              </CardTitle>
              <CardDescription>
                Song examples and additional musical context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiEnhancement.theoreticalExplanation && (
                  <div>
                    <strong>Theory Insights:</strong>
                    <p className="text-sm text-gray-700 mt-1">{aiEnhancement.theoreticalExplanation}</p>
                  </div>
                )}
                
                {aiEnhancement.songExamples.length > 0 && (
                  <div>
                    <strong>Song Examples:</strong>
                    <ul className="text-sm text-gray-700 mt-1">
                      {aiEnhancement.songExamples.map((song, index) => (
                        <li key={index}>• {song}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiEnhancement.genres.length > 0 && (
                  <div>
                    <strong>Common Genres:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiEnhancement.genres.map((genre, index) => (
                        <Badge key={index} variant="outline">{genre}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cross-validation Results */}
        {crossValidation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Cross-Validation
                <Badge 
                  variant="outline" 
                  className={crossValidation.agreement > 0.8 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}
                >
                  {(crossValidation.agreement * 100).toFixed(0)}% Agreement
                </Badge>
              </CardTitle>
              <CardDescription>
                Comparison between local analysis and AI results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Recommended Interpretation:</strong> 
                  <Badge variant="outline" className="ml-1">
                    {crossValidation.recommendedInterpretation}
                  </Badge>
                </div>
                
                {crossValidation.discrepancies.length > 0 && (
                  <div>
                    <strong>Discrepancies:</strong>
                    <ul className="text-sm text-gray-700 mt-1">
                      {crossValidation.discrepancies.map((discrepancy, index) => (
                        <li key={index}>• {discrepancy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderInputPanel = () => {
    if (activeMethod !== 'progression') {
      return (
        <div className="input-panel">
          <div className="text-center py-8">
            <p className="text-gray-600">This feature is coming soon!</p>
            <p className="text-sm text-gray-500 mt-2">
              Focus is currently on enhanced chord progression analysis.
            </p>
          </div>
        </div>
      );
    }

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
        
        <div className="space-y-2">
          <Label htmlFor="known-key">Known key (optional):</Label>
          <Input
            id="known-key"
            value={knownKey}
            onChange={(e) => setKnownKey(e.target.value)}
            placeholder="e.g., A major, Bb minor, F# major"
            className="w-full"
          />
          <p className="text-sm text-gray-600">
            If you know what key the music is in, enter it here to improve analysis accuracy
          </p>
        </div>
        
        <p className="input-panel__help">
          Enter chords separated by spaces. Use | to separate measures. Enhanced with local music theory analysis!
        </p>
        <div className="progression-examples">
          <p><strong>Try these progressions:</strong></p>
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
              Modal Example (Dm G Em Am)
            </button>
            <button 
              className="progression-example" 
              onClick={() => setProgressionInput('Cmaj7 Am7 Dm7 G7')}
            >
              Jazz Standard (Cmaj7 Am7 Dm7 G7)
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="harmony-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Enhanced Chords & Harmony</h2>
        <p className="tab-header__subtitle">
          Local music theory analysis with AI enhancement and cross-validation
        </p>
      </div>

      <div className="method-selector">
        <div className="method-selector__grid">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                trackInteraction(`Enhanced Method Selector - ${method.label}`, 'Navigation');
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
                  {method.status === 'enhanced' ? '✨' : method.status === 'complete' ? '✓' : method.status === 'partial' ? '⚠' : '○'}
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
            disabled={state.isAnalyzing || activeMethod !== 'progression' || !progressionInput.trim()}
          >
            {state.isAnalyzing ? 'Analyzing...' : 
             activeMethod === 'progression' ? 'Analyze Progression (Enhanced)' : 'Coming Soon'}
          </Button>
          
          {state.lastError && (
            <div className="text-red-600 text-sm mt-2">
              Error: {state.lastError}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Results Display */}
      {renderEnhancedResults()}
    </div>
  );
};

export default EnhancedHarmonyTab;