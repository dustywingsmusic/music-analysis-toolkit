/**
 * Enhanced Evidence Display Components
 * 
 * Provides sophisticated evidence visualization with:
 * - Strength meters with color coding
 * - Evidence type categorization
 * - Musical examples and explanations
 * - Progressive disclosure for detailed evidence
 */

import React, { useState } from 'react';
import { Badge } from "./badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Button } from "./button";
import { ChevronDownIcon, ChevronRightIcon, PlayIcon, VolumeXIcon } from "lucide-react";
import { ConfidenceMeter } from './enhanced-confidence-display';

export interface AnalysisEvidence {
  type: 'structural' | 'cadential' | 'intervallic' | 'pattern' | 'harmonic';
  strength: number;
  description: string;
  musicalExample?: {
    chords?: string[];
    notes?: string[];
    explanation: string;
  };
  theoreticalBasis?: string;
}

interface EnhancedEvidenceDisplayProps {
  evidence: AnalysisEvidence[];
  title?: string;
  maxVisible?: number;
  showMusicalExamples?: boolean;
  themeColor?: 'blue' | 'purple' | 'orange' | 'green';
}

const getEvidenceTypeInfo = (type: string) => {
  const typeMap = {
    structural: {
      label: 'Structural',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: '🏗️',
      description: 'Based on chord progression structure'
    },
    cadential: {
      label: 'Cadential',
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: '🎯',
      description: 'Based on cadential movement patterns'
    },
    intervallic: {
      label: 'Intervallic',
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      icon: '📐',
      description: 'Based on characteristic intervals'
    },
    pattern: {
      label: 'Pattern',
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      icon: '🔄',
      description: 'Based on recognizable modal patterns'
    },
    harmonic: {
      label: 'Harmonic',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      icon: '🎵',
      description: 'Based on harmonic function analysis'
    }
  };
  
  return typeMap[type as keyof typeof typeMap] || {
    label: type,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: '❓',
    description: 'Additional evidence'
  };
};

const EvidenceItem: React.FC<{
  evidence: AnalysisEvidence;
  showMusicalExample?: boolean;
  themeColor?: string;
}> = ({ evidence, showMusicalExample = true, themeColor = 'purple' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [playingExample, setPlayingExample] = useState(false);
  const typeInfo = getEvidenceTypeInfo(evidence.type);
  
  const handlePlayExample = () => {
    if (evidence.musicalExample) {
      setPlayingExample(true);
      // TODO: Implement audio playback
      setTimeout(() => setPlayingExample(false), 2000);
    }
  };
  
  return (
    <Card className="evidence-item border hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{typeInfo.icon}</span>
            <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
              {typeInfo.label}
            </Badge>
          </div>
          <ConfidenceMeter 
            value={Math.round(evidence.strength * 100)}
            size="sm"
            showValue={true}
            animate={false}
          />
        </div>
        <CardDescription className="text-sm">
          {evidence.description}
        </CardDescription>
      </CardHeader>
      
      {(evidence.musicalExample || evidence.theoreticalBasis) && (
        <CardContent className="pt-0">
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800 transition-colors">
              {showDetails ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
              )}
              {showDetails ? 'Hide' : 'Show'} Details
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {/* Theoretical Basis */}
                {evidence.theoreticalBasis && (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/20 rounded text-xs">
                    <strong>Theoretical Basis:</strong> {evidence.theoreticalBasis}
                  </div>
                )}
                
                {/* Musical Example */}
                {evidence.musicalExample && showMusicalExample && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-700">Musical Example</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={handlePlayExample}
                        disabled={playingExample}
                      >
                        {playingExample ? (
                          <VolumeXIcon className="h-3 w-3" />
                        ) : (
                          <PlayIcon className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    
                    {evidence.musicalExample.chords && (
                      <div className="mb-1">
                        <span className="text-xs text-blue-600">Chords:</span>
                        <div className="flex gap-1 mt-1">
                          {evidence.musicalExample.chords.map((chord, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              {chord}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {evidence.musicalExample.notes && (
                      <div className="mb-1">
                        <span className="text-xs text-blue-600">Notes:</span>
                        <div className="text-xs font-mono text-blue-800 mt-1">
                          {evidence.musicalExample.notes.join(' - ')}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-blue-700">
                      {evidence.musicalExample.explanation}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
};

export const EnhancedEvidenceDisplay: React.FC<EnhancedEvidenceDisplayProps> = ({
  evidence,
  title = "Supporting Evidence",
  maxVisible = 3,
  showMusicalExamples = true,
  themeColor = 'purple'
}) => {
  const [showAll, setShowAll] = useState(false);
  
  const visibleEvidence = showAll ? evidence : evidence.slice(0, maxVisible);
  const hasMore = evidence.length > maxVisible;
  
  // Calculate overall evidence strength
  const overallStrength = evidence.length > 0 ? 
    evidence.reduce((sum, e) => sum + e.strength, 0) / evidence.length : 0;
  
  // Group evidence by type
  const evidenceByType = evidence.reduce((groups, item) => {
    const type = item.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
    return groups;
  }, {} as Record<string, AnalysisEvidence[]>);
  
  if (evidence.length === 0) {
    return null;
  }
  
  return (
    <div className="enhanced-evidence-display space-y-3">
      {/* Evidence Summary */}
      <div className="evidence-summary">
        <div className="flex items-center justify-between mb-2">
          <h5 className={`font-semibold text-${themeColor}-700 dark:text-${themeColor}-300`}>
            {title}
          </h5>
          <div className="flex items-center gap-2">
            <ConfidenceMeter 
              value={Math.round(overallStrength * 100)}
              label="Overall Strength"
              size="sm"
              animate={false}
            />
          </div>
        </div>
        
        <div className="text-xs text-gray-600 mb-3">
          {evidence.length} piece{evidence.length !== 1 ? 's' : ''} of evidence across {Object.keys(evidenceByType).length} categor{Object.keys(evidenceByType).length !== 1 ? 'ies' : 'y'}
        </div>
      </div>
      
      {/* Evidence Items */}
      <div className="evidence-items space-y-2">
        {visibleEvidence.map((item, index) => (
          <EvidenceItem
            key={index}
            evidence={item}
            showMusicalExample={showMusicalExamples}
            themeColor={themeColor}
          />
        ))}
      </div>
      
      {/* Show More/Less Button */}
      {hasMore && (
        <Button
          variant="link"
          size="sm"
          className={`text-xs text-${themeColor}-600 hover:text-${themeColor}-800 p-0 h-auto`}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll 
            ? `Hide ${evidence.length - maxVisible} evidence items`
            : `Show ${evidence.length - maxVisible} more evidence items...`
          }
        </Button>
      )}
      
      {/* Evidence Type Summary */}
      {Object.keys(evidenceByType).length > 1 && (
        <div className="evidence-type-summary p-2 bg-gray-50 dark:bg-gray-800/20 rounded border">
          <div className="text-xs font-semibold text-gray-700 mb-1">Evidence Types:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(evidenceByType).map(([type, items]) => {
              const typeInfo = getEvidenceTypeInfo(type);
              return (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className={`text-xs ${typeInfo.color}`}
                  title={typeInfo.description}
                >
                  {typeInfo.icon} {typeInfo.label} ({items.length})
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEvidenceDisplay;