/**
 * Dual-Lens Analysis Panel
 * Presents functional and modal analyses as equally valid analytical perspectives
 * 
 * Design Principles:
 * - Equal visual weight for both analytical approaches
 * - Educational clarity about when to use each lens
 * - Responsive: side-by-side on desktop, tabbed on mobile
 * - Progressive disclosure for different skill levels
 */

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDownIcon, ChevronRightIcon, BookOpenIcon, EyeIcon, ScaleIcon, GitCompareIcon, SparklesIcon } from "lucide-react";
import { ComprehensiveAnalysisResult } from '../services/comprehensiveAnalysisService';
import { ModalAnalysisResult } from '../services/enhancedModalAnalyzer';
import { FunctionalChordAnalysis } from '../services/functionalHarmonyAnalysis';
import { getMajorScaleInfo, getModalScaleInfo, getCompactScaleDisplay } from '../utils/scaleInformation';
import { EnhancedConfidenceDisplay, ComprehensiveConfidence } from './ui/enhanced-confidence-display';
import { EnhancedEvidenceDisplay, AnalysisEvidence } from './ui/enhanced-evidence-display';
import { UserInputDisplay } from './ui/user-input-display';
import { FunctionalAnalysisHighlighter, ModalAnalysisHighlighter, ChromaticAnalysisHighlighter } from './ui/music-term-highlighter';

interface DualLensAnalysisPanelProps {
  result: ComprehensiveAnalysisResult;
  onViewInTables?: (mode: string, tonic: string) => void;
}

// Helper function to convert simple confidence to comprehensive confidence structure
const createComprehensiveConfidence = (
  confidence: number, 
  explanation?: string,
  breakdown?: { theoretical: number; contextual: number; crossValidation: number }
): ComprehensiveConfidence => ({
  overall: Math.round(confidence * 100),
  breakdown: breakdown ? {
    theoretical: Math.round(breakdown.theoretical * 100),
    contextual: Math.round(breakdown.contextual * 100),
    crossValidation: Math.round(breakdown.crossValidation * 100)
  } : undefined,
  label: confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low',
  explanation
});

// Helper function to convert modal evidence to enhanced evidence format
const convertModalEvidence = (modalEvidence: any[]): AnalysisEvidence[] => {
  return modalEvidence.map(evidence => ({
    type: evidence.type as 'structural' | 'cadential' | 'intervallic' | 'pattern',
    strength: evidence.strength,
    description: evidence.description,
    theoreticalBasis: getTheoreticalBasis(evidence.type, evidence.description),
    musicalExample: createMusicalExample(evidence.type, evidence.description)
  }));
};

const getTheoreticalBasis = (type: string, description: string): string => {
  const basisMap: Record<string, string> = {
    cadential: "Cadential motion creates sense of resolution and tonal center establishment",
    structural: "Structural elements define the overall harmonic framework and progression logic",
    intervallic: "Characteristic intervals distinguish modal scales from major/minor tonality",
    pattern: "Recurring patterns create modal identity through repetition and emphasis"
  };
  return basisMap[type] || "Based on recognized music theory principles";
};

const createMusicalExample = (type: string, description: string): AnalysisEvidence['musicalExample'] => {
  // Extract chord progressions from descriptions for musical examples
  if (description.includes('I-bVII-IV-I')) {
    return {
      chords: ['I', 'bVII', 'IV', 'I'],
      explanation: "Classic Mixolydian progression showing the characteristic bVII chord"
    };
  }
  if (description.includes('bVII-I')) {
    return {
      chords: ['bVII', 'I'],
      explanation: "Mixolydian cadential motion with lowered seventh degree"
    };
  }
  if (description.includes('bII-I')) {
    return {
      chords: ['bII', 'I'],
      explanation: "Phrygian cadential motion with lowered second degree"
    };
  }
  if (description.includes('i-II-bIII-i')) {
    return {
      chords: ['i', 'II', 'bIII', 'i'],
      explanation: "Dorian progression showing characteristic major II chord"
    };
  }
  return undefined;
};

interface AnalysisLensCardProps {
  title: string;
  icon: React.ReactNode;
  description: string | React.ReactNode;
  confidence: ComprehensiveConfidence;
  themeColor: 'blue' | 'purple' | 'orange';
  children: React.ReactNode;
}

const AnalysisLensCard: React.FC<AnalysisLensCardProps> = ({ 
  title, 
  icon, 
  description, 
  confidence, 
  themeColor, 
  children 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const themeClasses = {
    blue: {
      card: 'border-2 border-blue-200 bg-blue-50/20',
      header: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      icon: 'text-blue-600'
    },
    purple: {
      card: 'border-2 border-purple-200 bg-purple-50/20',
      header: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800',
      icon: 'text-purple-600'
    },
    orange: {
      card: 'border-2 border-orange-200 bg-orange-50/20',
      header: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      icon: 'text-orange-600'
    }
  };
  
  const theme = themeClasses[themeColor];
  
  return (
    <Card className={`h-full ${theme.card} transition-shadow hover:shadow-lg`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 text-lg ${theme.header}`}>
            <span className={theme.icon}>{icon}</span>
            {title}
            {confidence.overall >= 80 && (
              <Badge variant="outline" className="bg-green-100 text-green-800 text-xs ml-2">
                Primary
              </Badge>
            )}
          </CardTitle>
          <div className="flex-1">
            <EnhancedConfidenceDisplay
              confidence={confidence}
              size="md"
              showBreakdown={true}
              animate={true}
            />
          </div>
        </div>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        
        <div className="space-y-2">
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
              {showDetails ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
              {showDetails ? 'Hide' : 'Show'} Detailed Analysis
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-3">
                {/* Detailed content will be moved here */}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline text-orange-600">
              {showAdvanced ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
              {showAdvanced ? 'Hide' : 'Show'} Advanced Theory
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-3">
                {/* Advanced theoretical content */}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

const FunctionalAnalysisLens: React.FC<{ 
  result: ComprehensiveAnalysisResult;
}> = ({ result }) => {
  const functional = result.functional;
  
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
  
  // Get scale information for the functional key center
  const scaleInfo = getMajorScaleInfo(functional.keyCenter);
  const compactScale = getCompactScaleDisplay(scaleInfo);
  
  return (
    <AnalysisLensCard
      title="Functional Lens"
      icon={<BookOpenIcon className="h-5 w-5" />}
      description={
        <FunctionalAnalysisHighlighter keyCenter={functional.keyCenter}>
          Best for understanding harmonic function, voice leading, and cadential relationships
        </FunctionalAnalysisHighlighter>
      }
      confidence={createComprehensiveConfidence(
        functional.confidence, 
        "Based on Roman numeral analysis and chord function relationships",
        {
          theoretical: functional.confidence * 1.1, // Functional analysis is theoretically grounded
          contextual: functional.confidence * 0.9,   // Less contextual than modal
          crossValidation: functional.confidence     // Good cross-validation with theory
        }
      )}
      themeColor="blue"
    >
      {/* Key Information */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
          <div>
            <strong className="text-sm font-semibold text-blue-700 dark:text-blue-300">Key Center:</strong>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{functional.keyCenter}</div>
          </div>
          <div>
            <strong className="text-sm font-semibold text-blue-700 dark:text-blue-300">Key Signature:</strong>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{functional.keySignature}</div>
          </div>
        </div>
        
        {/* Roman Numerals Display */}
        <div>
          <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Roman Numeral Analysis</h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {functional.chords.map((chord: FunctionalChordAnalysis, index: number) => (
              <div key={index} className="group relative">
                <Badge 
                  variant="outline" 
                  className={`bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600 text-base font-bold px-3 py-1 cursor-help transition-all hover:scale-105 hover:shadow-md ${
                    chord.isChromatic ? 'ring-2 ring-orange-300' : ''
                  }`}
                  title={`${chord.chordSymbol} - ${formatChordFunction(chord.function)}${chord.isChromatic ? ' (Chromatic)' : ''}`}
                >
                  {chord.romanNumeral}
                  {chord.isChromatic && <span className="ml-1 text-orange-600">*</span>}
                </Badge>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {chord.chordSymbol} - {formatChordFunction(chord.function)}
                  {chord.isChromatic && <div className="text-orange-300">Chromatic chord</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Analysis in {functional.keyCenter}: {functional.chords.map(c => c.romanNumeral).join(' - ')}
            {functional.chords.some(c => c.isChromatic) && (
              <div className="mt-1 text-orange-600">* = Chromatic chord (non-diatonic)</div>
            )}
          </div>
        </div>
        
        {/* Scale Information */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
          <strong className="text-sm font-semibold text-blue-700 dark:text-blue-300">{compactScale.derivation}:</strong>
          <div className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
            <div><strong>Formula:</strong> {compactScale.formula}</div>
            <div><strong>Scale:</strong> {compactScale.scaleString}</div>
          </div>
        </div>
        
        {/* When to Use */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
          <strong className="text-sm font-semibold text-blue-700 dark:text-blue-300">When to Use Functional Analysis:</strong>
          <FunctionalAnalysisHighlighter keyCenter={functional.keyCenter}>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
              <li>• Understanding harmonic progression and voice leading</li>
              <li>• Analyzing cadential strength and resolution</li>
              <li>• Traditional tonal music analysis</li>
              <li>• Chord function relationships (T-PD-D-T)</li>
            </ul>
          </FunctionalAnalysisHighlighter>
        </div>
      </div>
    </AnalysisLensCard>
  );
};

const ModalAnalysisLens: React.FC<{ 
  result: ComprehensiveAnalysisResult;
  onViewInTables?: (mode: string, tonic: string) => void;
}> = ({ result, onViewInTables }) => {
  const modal = result.modal;
  const enhanced = modal?.enhancedAnalysis;
  
  if (!modal || !enhanced) {
    return null;
  }
  
  // Get scale information for the modal analysis
  const modalScaleInfo = getModalScaleInfo(enhanced.modeName);
  const compactModalScale = getCompactScaleDisplay(modalScaleInfo);
  
  return (
    <AnalysisLensCard
      title="Modal Lens"
      icon={<ScaleIcon className="h-5 w-5" />}
      description={
        <ModalAnalysisHighlighter mode={enhanced.modeName}>
          Best for understanding scale relationships, melodic emphasis, and modal characteristics
        </ModalAnalysisHighlighter>
      }
      confidence={createComprehensiveConfidence(
        enhanced.confidence,
        "Based on modal characteristics and evidence-based pattern detection",
        {
          theoretical: enhanced.confidence * 0.9,  // Modal analysis is evidence-based
          contextual: enhanced.confidence * 1.1,   // Strong contextual analysis
          crossValidation: enhanced.confidence * 0.95 // Good validation with local patterns
        }
      )}
      themeColor="purple"
    >
      <div className="space-y-3">
        {/* Modal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
          <div>
            <strong className="text-sm font-semibold text-purple-700 dark:text-purple-300">Tonal Center:</strong>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{enhanced.detectedTonicCenter}</div>
          </div>
          <div>
            <strong className="text-sm font-semibold text-purple-700 dark:text-purple-300">Mode:</strong>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{enhanced.modeName}</div>
          </div>
        </div>
        
        {/* Modal Roman Numerals */}
        <div>
          <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Modal Roman Numerals</h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {enhanced.romanNumerals.map((numeral, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600 text-base font-bold px-3 py-1"
              >
                {numeral}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">
            Analysis relative to {enhanced.detectedTonicCenter} as tonal center
          </div>
        </div>
        
        {/* Enhanced Supporting Evidence */}
        {enhanced.evidence.length > 0 && (
          <EnhancedEvidenceDisplay
            evidence={convertModalEvidence(enhanced.evidence)}
            title="Supporting Evidence"
            maxVisible={3}
            showMusicalExamples={true}
            themeColor="purple"
          />
        )}
        
        {/* Modal Scale Information */}
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
          <strong className="text-sm font-semibold text-purple-700 dark:text-purple-300">{compactModalScale.derivation}:</strong>
          <div className="text-sm text-purple-800 dark:text-purple-200 mt-2 space-y-1">
            <div><strong>Formula:</strong> {compactModalScale.formula}</div>
            <div><strong>Scale:</strong> {compactModalScale.scaleString}</div>
          </div>
        </div>
        
        {/* When to Use */}
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
          <strong className="text-sm font-semibold text-purple-700 dark:text-purple-300">When to Use Modal Analysis:</strong>
          <ModalAnalysisHighlighter mode={enhanced.modeName}>
            <ul className="text-sm text-purple-800 dark:text-purple-200 mt-1 space-y-1">
              <li>• Understanding scale relationships and melodic implications</li>
              <li>• Analyzing folk, Celtic, and modal music</li>
              <li>• Improvisation and scale choice contexts</li>
              <li>• Characteristic modal sound and color</li>
            </ul>
          </ModalAnalysisHighlighter>
        </div>
        
        {/* View in Tables Link */}
        {onViewInTables && (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-purple-600 dark:text-purple-400"
            onClick={() => {
              const modeParts = enhanced.modeName.split(' ');
              const tonic = modeParts[0];
              const mode = modeParts.slice(1).join(' ');
              onViewInTables(mode, tonic);
            }}
          >
            View {enhanced.modeName} in Scale Tables →
          </Button>
        )}
      </div>
    </AnalysisLensCard>
  );
};

const ChromaticAnalysisLens: React.FC<{ 
  result: ComprehensiveAnalysisResult;
}> = ({ result }) => {
  const chromatic = result.chromatic;
  
  if (!chromatic || (
    chromatic.secondaryDominants.length === 0 && 
    chromatic.borrowedChords.length === 0 && 
    chromatic.chromaticMediants.length === 0
  )) {
    return null;
  }
  
  // Calculate confidence based on number of chromatic elements detected
  const chromaticElementsCount = chromatic.secondaryDominants.length + 
                                chromatic.borrowedChords.length + 
                                chromatic.chromaticMediants.length;
  const estimatedConfidence = Math.min(0.9, 0.6 + (chromaticElementsCount * 0.1));
  
  return (
    <AnalysisLensCard
      title="Chromatic Lens"
      icon={<SparklesIcon className="h-5 w-5" />}
      description={
        <ChromaticAnalysisHighlighter keyCenter={result.functional.keyCenter}>
          Secondary dominants, borrowed chords, and advanced harmonic relationships
        </ChromaticAnalysisHighlighter>
      }
      confidence={createComprehensiveConfidence(
        estimatedConfidence,
        "Based on detection of non-diatonic harmonic elements",
        {
          theoretical: estimatedConfidence * 0.8,  // Advanced theory application
          contextual: estimatedConfidence * 1.2,   // Strong contextual analysis
          crossValidation: estimatedConfidence * 0.7 // Specialized validation
        }
      )}
      themeColor="orange"
    >
      <div className="space-y-3">
        {/* Secondary Dominants */}
        {chromatic.secondaryDominants.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">Secondary Dominants</h4>
            <div className="space-y-2">
              {chromatic.secondaryDominants.map((dominant, index) => (
                <div key={index} className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 font-bold">
                      {dominant.romanNumeral}
                    </Badge>
                    <span className="text-xs text-orange-600">
                      → {dominant.target}
                    </span>
                  </div>
                  <span className="text-sm">{dominant.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Borrowed Chords */}
        {chromatic.borrowedChords.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">Borrowed Chords</h4>
            <div className="space-y-2">
              {chromatic.borrowedChords.map((borrowed, index) => (
                <div key={index} className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 font-bold">
                      {borrowed.romanNumeral}
                    </Badge>
                    <span className="text-xs text-orange-600">
                      from {borrowed.borrowedFrom}
                    </span>
                  </div>
                  <span className="text-sm">{borrowed.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Chromatic Mediants */}
        {chromatic.chromaticMediants.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">Chromatic Mediants</h4>
            <div className="space-y-2">
              {chromatic.chromaticMediants.map((mediant, index) => (
                <div key={index} className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 font-bold">
                      {mediant.chord}
                    </Badge>
                    <span className="text-xs text-orange-600">
                      {mediant.relationship}
                    </span>
                  </div>
                  <span className="text-sm">{mediant.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Resolution Patterns */}
        {chromatic.resolutionPatterns.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">Resolution Patterns</h4>
            <div className="space-y-2">
              {chromatic.resolutionPatterns.map((pattern, index) => (
                <div key={index} className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono text-orange-800">
                      {pattern.from} → {pattern.to}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        pattern.type === 'strong' ? 'bg-green-100 text-green-800' :
                        pattern.type === 'weak' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {pattern.type}
                    </Badge>
                  </div>
                  <span className="text-sm">{pattern.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* When to Use */}
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
          <strong className="text-sm font-semibold text-orange-700 dark:text-orange-300">When to Use Chromatic Analysis:</strong>
          <ChromaticAnalysisHighlighter keyCenter={result.functional.keyCenter}>
            <ul className="text-sm text-orange-800 dark:text-orange-200 mt-1 space-y-1">
              <li>• Understanding complex harmonic progressions</li>
              <li>• Analyzing classical and romantic period music</li>
              <li>• Jazz harmony and chord substitutions</li>
              <li>• Advanced composition techniques</li>
            </ul>
          </ChromaticAnalysisHighlighter>
        </div>
      </div>
    </AnalysisLensCard>
  );
};

const AnalysisComparison: React.FC<{ 
  result: ComprehensiveAnalysisResult 
}> = ({ result }) => {
  const functional = result.functional;
  const modal = result.modal?.enhancedAnalysis;
  
  if (!modal) {
    return (
      <Card className="border-2 border-gray-200 bg-gray-50/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompareIcon className="h-5 w-5 text-gray-600" />
            Analysis Comparison
          </CardTitle>
          <CardDescription>
            Only functional analysis is applicable for this progression
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-gray-200 bg-gray-50/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompareIcon className="h-5 w-5 text-gray-600" />
          Lens Comparison
        </CardTitle>
        <CardDescription>
          Both perspectives are valid - choose based on your analytical goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Aspect</TableHead>
              <TableHead className="font-semibold text-blue-700">Functional Lens</TableHead>
              <TableHead className="font-semibold text-purple-700">Modal Lens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Roman Numerals</TableCell>
              <TableCell className="font-mono text-blue-800">
                {functional.chords.map(c => c.romanNumeral).join(' - ')}
              </TableCell>
              <TableCell className="font-mono text-purple-800">
                {modal.romanNumerals.join(' - ')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Key Center</TableCell>
              <TableCell className="text-blue-800">{functional.keyCenter}</TableCell>
              <TableCell className="text-purple-800">{modal.detectedTonicCenter} ({modal.modeName})</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Best For</TableCell>
              <TableCell className="text-blue-800">Harmonic function, voice leading</TableCell>
              <TableCell className="text-purple-800">Scale relationships, modal color</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Musical Context</TableCell>
              <TableCell className="text-blue-800">Classical, traditional tonal music</TableCell>
              <TableCell className="text-purple-800">Folk, Celtic, modal improvisation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Confidence</TableCell>
              <TableCell className="text-blue-800">{Math.round(functional.confidence * 100)}%</TableCell>
              <TableCell className="text-purple-800">{Math.round(modal.confidence * 100)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        {/* Alternative Interpretations */}
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
          <strong className="text-sm font-semibold text-amber-700 dark:text-amber-300">Alternative Interpretations:</strong>
          <div className="mt-2 space-y-2">
            <div className="text-sm">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 mr-2">Primary</Badge>
              <span className="text-blue-800">Functional: {functional.keyCenter} with {functional.chords.map(c => c.romanNumeral).join(' - ')}</span>
            </div>
            <div className="text-sm">
              <Badge variant="outline" className="bg-purple-100 text-purple-800 mr-2">Secondary</Badge>
              <span className="text-purple-800">Modal: {modal.modeName} with {modal.romanNumerals.join(' - ')}</span>
            </div>
          </div>
        </div>
        
        {/* Pedagogical Guidance */}
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
          <strong className="text-sm font-semibold text-green-700 dark:text-green-300">Pedagogical Insight:</strong>
          <p className="text-sm text-green-800 dark:text-green-200 mt-1">
            Both analyses are simultaneously true and musically valuable. Functional analysis emphasizes 
            how chords relate within {functional.keyCenter} tonality, while modal analysis
            emphasizes {modal.detectedTonicCenter} as the tonal center with characteristic modal relationships.
            Choose your analytical lens based on whether you're focusing on harmonic function or scale relationships.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const AnalysisSummary: React.FC<{ result: ComprehensiveAnalysisResult }> = ({ result }) => {
  const functional = result.functional;
  const modal = result.modal?.enhancedAnalysis;
  
  return (
    <div className="space-y-4">
      {/* User Input Display */}
      <UserInputDisplay 
        userInput={result.userInput}
        compact={true}
        showAnalysisType={false}
      />
      
      {/* Analysis Summary */}
      <Card className="border-2 border-gray-300 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            Analysis Summary
          </CardTitle>
          <CardDescription>Quick overview of all analytical perspectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-700">Primary Analysis</div>
              <div className="text-lg font-bold text-blue-900">{result.primaryApproach.charAt(0).toUpperCase() + result.primaryApproach.slice(1)}</div>
              <div className="text-xs text-blue-600">{Math.round(result.confidence * 100)}% confidence</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-700">Key Center</div>
              <div className="text-lg font-bold text-gray-900">{functional.keyCenter}</div>
              <div className="text-xs text-gray-600">{functional.keySignature}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-purple-700">Modal Context</div>
              <div className="text-lg font-bold text-purple-900">{modal ? modal.modeName : 'Not applicable'}</div>
              <div className="text-xs text-purple-600">{modal ? `${Math.round(modal.confidence * 100)}% confidence` : 'Functional only'}</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
            <div className="text-sm font-semibold mb-1">Roman Numerals:</div>
            <div className="text-lg font-mono">{functional.chords.map(c => c.romanNumeral).join(' - ')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DualLensAnalysisPanel: React.FC<DualLensAnalysisPanelProps> = ({ 
  result, 
  onViewInTables 
}) => {
  const hasModal = result.modal?.enhancedAnalysis;
  const hasChromatic = result.chromatic && (
    result.chromatic.secondaryDominants.length > 0 || 
    result.chromatic.borrowedChords.length > 0 || 
    result.chromatic.chromaticMediants.length > 0
  );
  
  // Determine the number of available lenses
  const lensCount = 1 + (hasModal ? 1 : 0) + (hasChromatic ? 1 : 0);
  
  if (!hasModal && !hasChromatic) {
    // Show only functional analysis if no other lenses available
    return (
      <div className="space-y-6">
        <AnalysisSummary result={result} />
        <FunctionalAnalysisLens result={result} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Analysis Summary - Always shown first */}
      <AnalysisSummary result={result} />
      
      {/* Desktop: Responsive grid layout */}
      <div className="hidden md:block">
        <div className={`grid gap-6 ${
          lensCount === 1 ? 'grid-cols-1' :
          lensCount === 2 ? 'grid-cols-1 lg:grid-cols-2' :
          'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
        }`}>
          <FunctionalAnalysisLens result={result} />
          {hasModal && <ModalAnalysisLens result={result} onViewInTables={onViewInTables} />}
          {hasChromatic && <ChromaticAnalysisLens result={result} />}
          <div className={`${
            lensCount === 3 ? 'lg:col-span-2 xl:col-span-3' : 
            lensCount === 2 ? 'lg:col-span-2' : 'col-span-1'
          }`}>
            <AnalysisComparison result={result} />
          </div>
        </div>
      </div>
      
      {/* Mobile: Dynamic tabbed layout */}
      <div className="md:hidden">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className={`grid w-full h-auto ${
            hasChromatic ? 'grid-cols-5' : hasModal ? 'grid-cols-4' : 'grid-cols-2'
          }`}>
            <TabsTrigger value="summary" className="flex flex-col items-center gap-1 py-2">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-xs">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="functional" className="flex flex-col items-center gap-1 py-2">
              <BookOpenIcon className="h-4 w-4" />
              <span className="text-xs">Function</span>
            </TabsTrigger>
            {hasModal && (
              <TabsTrigger value="modal" className="flex flex-col items-center gap-1 py-2">
                <ScaleIcon className="h-4 w-4" />
                <span className="text-xs">Modal</span>
              </TabsTrigger>
            )}
            {hasChromatic && (
              <TabsTrigger value="chromatic" className="flex flex-col items-center gap-1 py-2">
                <SparklesIcon className="h-4 w-4" />
                <span className="text-xs">Chromatic</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="compare" className="flex flex-col items-center gap-1 py-2">
              <GitCompareIcon className="h-4 w-4" />
              <span className="text-xs">Compare</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4">
            <AnalysisSummary result={result} />
          </TabsContent>
          
          <TabsContent value="functional" className="mt-4">
            <FunctionalAnalysisLens result={result} />
          </TabsContent>
          
          {hasModal && (
            <TabsContent value="modal" className="mt-4">
              <ModalAnalysisLens result={result} onViewInTables={onViewInTables} />
            </TabsContent>
          )}
          
          {hasChromatic && (
            <TabsContent value="chromatic" className="mt-4">
              <ChromaticAnalysisLens result={result} />
            </TabsContent>
          )}
          
          <TabsContent value="compare" className="mt-4">
            <AnalysisComparison result={result} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DualLensAnalysisPanel;