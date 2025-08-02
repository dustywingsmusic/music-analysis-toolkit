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
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDownIcon, ChevronRightIcon, BookOpenIcon, EyeIcon, ScaleIcon, GitCompareIcon } from "lucide-react";
import { ComprehensiveAnalysisResult } from '../services/comprehensiveAnalysisService';
import { ModalAnalysisResult } from '../services/enhancedModalAnalyzer';
import { FunctionalChordAnalysis } from '../services/functionalHarmonyAnalysis';
import { getMajorScaleInfo, getModalScaleInfo, getCompactScaleDisplay } from '../utils/scaleInformation';

interface DualLensAnalysisPanelProps {
  result: ComprehensiveAnalysisResult;
  onViewInTables?: (mode: string, tonic: string) => void;
}

interface AnalysisLensCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  confidence: number;
  themeColor: 'blue' | 'purple';
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
  const [showDetails, setShowDetails] = useState(true);
  
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
          </CardTitle>
          <Badge variant="outline" className={`${theme.badge} font-medium`}>
            {confidence}% confidence
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
            {showDetails ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
            {showDetails ? 'Hide' : 'Show'} Analysis Details
          </CollapsibleTrigger>
        </Collapsible>
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
      description="Best for understanding harmonic function, voice leading, and cadential relationships"
      confidence={Math.round(functional.confidence * 100)}
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
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600 text-base font-bold px-3 py-1"
              >
                {chord.romanNumeral}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Analysis in {functional.keyCenter}: {functional.chords.map(c => c.romanNumeral).join(' - ')}
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
          <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
            <li>• Understanding harmonic progression and voice leading</li>
            <li>• Analyzing cadential strength and resolution</li>
            <li>• Traditional tonal music analysis</li>
            <li>• Chord function relationships (T-PD-D-T)</li>
          </ul>
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
      description="Best for understanding scale relationships, melodic emphasis, and modal characteristics"
      confidence={Math.round(enhanced.confidence * 100)}
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
        
        {/* Supporting Evidence */}
        {enhanced.evidence.length > 0 && (
          <div>
            <h5 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Supporting Evidence</h5>
            <div className="space-y-2">
              {enhanced.evidence.slice(0, 2).map((evidence, index) => (
                <div key={index} className="p-2 bg-card rounded border flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${ 
                    evidence.type === 'structural' ? 'bg-blue-100 text-blue-700' :
                    evidence.type === 'cadential' ? 'bg-green-100 text-green-700' :
                    evidence.type === 'intervallic' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {evidence.type}
                  </Badge>
                  <span className="text-sm">{evidence.description}</span>
                </div>
              ))}
            </div>
          </div>
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
          <ul className="text-sm text-purple-800 dark:text-purple-200 mt-1 space-y-1">
            <li>• Understanding scale relationships and melodic implications</li>
            <li>• Analyzing folk, Celtic, and modal music</li>
            <li>• Improvisation and scale choice contexts</li>
            <li>• Characteristic modal sound and color</li>
          </ul>
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
          <TableHead>
            <TableRow>
              <TableHead className="font-semibold">Aspect</TableHead>
              <TableHead className="font-semibold text-blue-700">Functional Lens</TableHead>
              <TableHead className="font-semibold text-purple-700">Modal Lens</TableHead>
            </TableRow>
          </TableHead>
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

const DualLensAnalysisPanel: React.FC<DualLensAnalysisPanelProps> = ({ 
  result, 
  onViewInTables 
}) => {
  const hasModal = result.modal?.enhancedAnalysis;
  
  if (!hasModal) {
    // Show only functional analysis if no modal characteristics detected
    return (
      <div className="space-y-6">
        <FunctionalAnalysisLens result={result} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Desktop: Side-by-side layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <FunctionalAnalysisLens result={result} />
          <ModalAnalysisLens result={result} onViewInTables={onViewInTables} />
          <div className="lg:col-span-2 xl:col-span-1">
            <AnalysisComparison result={result} />
          </div>
        </div>
      </div>
      
      {/* Mobile: Tabbed layout */}
      <div className="md:hidden">
        <Tabs defaultValue="functional" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="functional" className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              Functional
            </TabsTrigger>
            <TabsTrigger value="modal" className="flex items-center gap-1">
              <ScaleIcon className="h-4 w-4" />
              Modal
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-1">
              <GitCompareIcon className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="functional" className="mt-4">
            <FunctionalAnalysisLens result={result} />
          </TabsContent>
          
          <TabsContent value="modal" className="mt-4">
            <ModalAnalysisLens result={result} onViewInTables={onViewInTables} />
          </TabsContent>
          
          <TabsContent value="compare" className="mt-4">
            <AnalysisComparison result={result} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DualLensAnalysisPanel;