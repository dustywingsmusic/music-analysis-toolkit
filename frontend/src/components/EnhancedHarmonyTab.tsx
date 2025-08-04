/**
 * Enhanced Harmony Tab
 * Implements Comprehensive Music Theory Analysis with Functional-First Approach
 * 
 * UI Hierarchy:
 * 1. Functional Analysis (PRIMARY) - Roman numerals, chord functions, cadences
 * 2. Modal Enhancement (SECONDARY) - When modal characteristics detected
 * 3. Chromatic Analysis (ADVANCED) - Secondary dominants, borrowed chords
 * 
 * Progressive Disclosure: Simple → Advanced for educational value
 */

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChordProgressionInput } from "./ui/chord-progression-input";
import { ChevronDownIcon, ChevronRightIcon, BookOpenIcon, TrendingUpIcon, SparklesIcon } from "lucide-react";
import { trackInteraction } from '../utils/tracking';
import { useAnalysis, useAnalysisActions } from '../contexts/AnalysisContext';
import { ComprehensiveAnalysisEngine, ComprehensiveAnalysisResult } from '../services/comprehensiveAnalysisService';
import { FunctionalChordAnalysis } from '../services/functionalHarmonyAnalysis';
import DualLensAnalysisPanel from './DualLensAnalysisPanel';

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
  const [comprehensiveResult, setComprehensiveResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // UI State for progressive disclosure
  const [showModalEnhancement, setShowModalEnhancement] = useState(false);
  const [showChromaticAnalysis, setShowChromaticAnalysis] = useState(false);

  const { startAnalysis, navigateToReference } = useAnalysisActions();
  
  // Initialize comprehensive analysis engine
  const [analysisEngine] = useState(() => new ComprehensiveAnalysisEngine());

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
      label: 'Comprehensive Analysis', 
      description: 'Functional harmony with modal and chromatic enhancements',
      status: 'enhanced',
      statusLabel: 'Enhanced ✨'
    },
  ];


  const handleAnalyze = async () => {
    if (activeMethod !== 'progression' || !progressionInput.trim()) {
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      // Perform comprehensive analysis
      const result = await analysisEngine.analyzeComprehensively(
        progressionInput, 
        knownKey.trim() || undefined
      );
      
      setComprehensiveResult(result);
      
      // Auto-expand sections based on analysis content
      if (result.modal) {
        setShowModalEnhancement(true);
      }
      if (result.chromatic) {
        setShowChromaticAnalysis(true);
      }
      
      // Update legacy context for compatibility
      startAnalysis('chord_progression', progressionInput);
      
      trackInteraction('Comprehensive Chord Progression Analysis', 'Analysis');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewInTables = (mode: string, tonic: string) => {
    if (onSwitchToReferenceWithHighlight) {
      onSwitchToReferenceWithHighlight(mode, tonic);
    } else {
      navigateToReference(mode, tonic, 'chord_progression_analysis');
    }
  };
  
  const formatChordFunction = (func: string): string => {
    const functionLabels: Record<string, string> = {
      'tonic': 'Tonic (T)',
      'predominant': 'Predominant (PD)', 
      'dominant': 'Dominant (D)',
      'subdominant': 'Subdominant (S)',
      'leading_tone': 'Leading Tone (LT)',
      'chromatic': 'Chromatic'
    };
    return functionLabels[func] || func;
  };
  
  const getProgressionTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'authentic_cadence': 'Features strong V-I authentic cadences',
      'plagal_cadence': 'Features IV-I plagal cadences ("Amen" cadence)',
      'deceptive_cadence': 'Features V-vi deceptive cadences',
      'half_cadence': 'Ends on dominant harmony (half cadence)',
      'circle_of_fifths': 'Follows circle of fifths harmonic sequence',
      'jazz_standard': 'ii-V-I jazz progression pattern',
      'blues_progression': 'I-IV-V blues harmonic structure',
      'modal_progression': 'Emphasizes modal scale relationships',
      'chromatic_sequence': 'Uses chromatic harmonic sequences',
      'other': 'Mixed or unique harmonic progression'
    };
    return descriptions[type] || type.replace('_', ' ');
  };

  const renderComprehensiveResults = () => {
    if (!comprehensiveResult) {
      return null;
    }

    return (
      <div className="comprehensive-results-panel space-y-6">
        {/* New Dual-Lens Analysis Panel */}
        <DualLensAnalysisPanel 
          result={comprehensiveResult}
          onViewInTables={handleViewInTables}
        />
        
        {/* TERTIARY: Chromatic Analysis (Advanced) - Keep as-is for now */}
        {comprehensiveResult.chromatic && (
          <Collapsible open={showChromaticAnalysis} onOpenChange={setShowChromaticAnalysis}>
            <Card className="border-2 border-orange-200 bg-orange-50/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-orange-50/50 transition-colors">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {showChromaticAnalysis ? (
                      <ChevronDownIcon className="h-5 w-5 text-orange-600" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-orange-600" />
                    )}
                    <TrendingUpIcon className="h-5 w-5 text-orange-600" />
                    Chromatic Harmony Analysis
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      Advanced
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Click to {showChromaticAnalysis ? 'collapse' : 'expand'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Advanced harmonic techniques: secondary dominants, borrowed chords, and chromatic mediants
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Secondary Dominants */}
                  {comprehensiveResult.chromatic.secondaryDominants.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Secondary Dominants</h4>
                      <div className="space-y-2">
                        {comprehensiveResult.chromatic.secondaryDominants.map((secondary, index) => (
                          <div key={index} className="p-3 bg-card rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{secondary.chord} ({secondary.romanNumeral})</span>
                              <Badge variant="outline" className="bg-orange-100 text-orange-700">
                                → {secondary.target}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{secondary.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Borrowed Chords */}
                  {comprehensiveResult.chromatic.borrowedChords.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Borrowed Chords</h4>
                      <div className="space-y-2">
                        {comprehensiveResult.chromatic.borrowedChords.map((borrowed, index) => (
                          <div key={index} className="p-3 bg-card rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{borrowed.chord} ({borrowed.romanNumeral})</span>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                from {borrowed.borrowedFrom}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{borrowed.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resolution Patterns */}
                  {comprehensiveResult.chromatic.resolutionPatterns.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Harmonic Resolutions</h4>
                      <div className="space-y-2">
                        {comprehensiveResult.chromatic.resolutionPatterns.map((pattern, index) => (
                          <div key={index} className="p-3 bg-card rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{pattern.from} → {pattern.to}</span>
                              <Badge variant="outline" className={`${
                                pattern.type === 'strong' ? 'bg-green-100 text-green-700' :
                                pattern.type === 'weak' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {pattern.type} resolution
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{pattern.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
        
        {/* Pedagogical Guidance */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpenIcon className="h-5 w-5 text-green-600" />
              Learning Guidance
            </CardTitle>
            <CardDescription>
              Understanding which analytical approach works best for this progression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong className="text-sm font-semibold text-green-700">Recommended Approach:</strong>
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 capitalize">
                {comprehensiveResult.primaryApproach} Analysis
              </Badge>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">{comprehensiveResult.pedagogicalValue}</p>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <strong className="text-sm font-semibold text-card-foreground">Comprehensive Explanation:</strong>
              <p className="text-sm text-card-foreground mt-1">{comprehensiveResult.explanation}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInputPanel = () => {
    if (activeMethod !== 'progression') {
      return (
        <div className="input-panel">
          <div className="text-center py-8">
            <p className="text-muted-foreground">This feature is coming soon!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Focus is currently on enhanced chord progression analysis.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="input-panel space-y-6">
        {/* Enhanced Chord Progression Input */}
        <ChordProgressionInput
          value={progressionInput}
          onChange={setProgressionInput}
          label="Chord Progression"
          helpText="Build your progression visually or type it directly. Use | to separate measures."
          maxChords={20}
          showBarLines={true}
          allowKeyboardInput={true}
          className="chord-progression-section"
        />
        
        {/* Parent Key Signature Input */}
        <div className="space-y-2">
          <Label htmlFor="parent-key-signature">Parent key signature (optional):</Label>
          <Input
            id="parent-key-signature"
            value={knownKey}
            onChange={(e) => setKnownKey(e.target.value)}
            placeholder="e.g., C major, Bb major, F# minor"
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Optional: Specify the parent key signature to guide analysis. Leave blank for automatic key detection using functional harmony principles.
          </p>
        </div>
        {/* Example Progressions - Quick Load Buttons */}
        <div className="progression-examples">
          <p className="text-sm font-medium mb-3">Try these example progressions:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button 
              className="p-3 text-left border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-blue-200 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-700" 
              onClick={() => {
                setProgressionInput('Am F C G');
                setKnownKey('C major');
              }}
              title="Classic functional progression - great for learning Roman numeral analysis"
            >
              <div className="font-medium text-blue-800 dark:text-blue-200">Functional Example</div>
              <div className="text-sm text-blue-600 dark:text-blue-300 font-mono">Am F C G</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">vi-IV-I-V progression</div>
            </button>
            <button 
              className="p-3 text-left border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-purple-200 bg-purple-50/30 dark:bg-purple-900/10 dark:border-purple-700" 
              onClick={() => {
                setProgressionInput('G F C G');
                setKnownKey('C major');
              }}
              title="Mixolydian modal progression - demonstrates when modal analysis adds value"
            >
              <div className="font-medium text-purple-800 dark:text-purple-200">Modal Example</div> 
              <div className="text-sm text-purple-600 dark:text-purple-300 font-mono">G F C G</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">bVII-I cadence (G Mixolydian)</div>
            </button>
            <button 
              className="p-3 text-left border rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border-orange-200 bg-orange-50/30 dark:bg-orange-900/10 dark:border-orange-700" 
              onClick={() => {
                setProgressionInput('C A7 Dm G7 C');
                setKnownKey('C major');
              }}
              title="Secondary dominants - showcases chromatic harmony analysis"
            >
              <div className="font-medium text-orange-800 dark:text-orange-200">Chromatic Example</div>
              <div className="text-sm text-orange-600 dark:text-orange-300 font-mono">C A7 Dm G7 C</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">I-V/ii-ii-V-I</div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="harmony-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Comprehensive Harmony Analysis</h2>
        <p className="tab-header__subtitle">
          Functional harmony foundation with modal and chromatic enhancements - educational progressive disclosure
        </p>
      </div>

      <div className="method-selector">
        <div className="method-selector__grid">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                trackInteraction(`Comprehensive Method Selector - ${method.label}`, 'Navigation');
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
            disabled={isAnalyzing || activeMethod !== 'progression' || !progressionInput.trim()}
            size="lg"
            className="w-full md:w-auto"
          >
            {isAnalyzing ? 'Analyzing...' : 
             activeMethod === 'progression' ? 'Analyze with Comprehensive Framework' : 'Coming Soon'}
          </Button>
          
          {analysisError && (
            <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200">
              <strong>Error:</strong> {analysisError}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Results Display */}
      {renderComprehensiveResults()}
    </div>
  );
};

export default EnhancedHarmonyTab;