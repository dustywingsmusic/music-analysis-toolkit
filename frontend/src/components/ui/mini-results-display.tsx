/**
 * Mini Results Display Component
 * 
 * Compact display optimized for widget constraints:
 * - Minimal vertical space usage
 * - Essential information only
 * - Quick action buttons
 * - Chrome plugin compatible
 */

import React from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { ExternalLink, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MiniAnalysisResult {
  detectedMode?: string;
  parentKey?: string;
  chordFunction?: string;
  confidence: number;
  quickInsights: string[];
  scaleTableId?: string;
  processingTime?: number;
}

interface MiniResultsDisplayProps {
  result: MiniAnalysisResult;
  onNavigateToReference?: () => void;
  onNavigateToFullAnalysis?: () => void;
  onShowDetails?: () => void;
  compact?: boolean;
  className?: string;
}

export const MiniResultsDisplay: React.FC<MiniResultsDisplayProps> = ({
  result,
  onNavigateToReference,
  onNavigateToFullAnalysis,
  onShowDetails,
  compact = false,
  className
}) => {
  const confidenceColor = result.confidence >= 0.8 
    ? 'text-green-600' 
    : result.confidence >= 0.6 
    ? 'text-yellow-600' 
    : 'text-red-600';

  const confidenceText = result.confidence >= 0.8 
    ? 'High' 
    : result.confidence >= 0.6 
    ? 'Medium' 
    : 'Low';

  if (compact) {
    return (
      <div className={cn("mini-results-compact p-2 bg-card rounded border", className)}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {result.detectedMode && (
              <div className="text-sm font-medium truncate">{result.detectedMode}</div>
            )}
            {result.chordFunction && (
              <div className="text-xs text-muted-foreground truncate">{result.chordFunction}</div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <div className={cn("w-2 h-2 rounded-full", {
              'bg-green-500': result.confidence >= 0.8,
              'bg-yellow-500': result.confidence >= 0.6 && result.confidence < 0.8,
              'bg-red-500': result.confidence < 0.6
            })} />
            {onNavigateToReference && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToReference}
                className="h-6 w-6 p-0"
                disabled={!result.scaleTableId}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mini-results-display space-y-2", className)}>
      {/* Primary Result */}
      <div className="space-y-1">
        {result.detectedMode && (
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{result.detectedMode}</div>
            <div className={cn("text-xs font-medium", confidenceColor)}>
              {confidenceText}
            </div>
          </div>
        )}
        
        {result.parentKey && result.parentKey !== result.detectedMode && (
          <div className="text-xs text-muted-foreground">
            Parent: {result.parentKey}
          </div>
        )}
        
        {result.chordFunction && (
          <div className="text-xs text-muted-foreground">
            Function: {result.chordFunction}
          </div>
        )}
      </div>

      {/* Quick Insights */}
      {result.quickInsights.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {result.quickInsights.slice(0, 3).map((insight, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {insight}
            </Badge>
          ))}
        </div>
      )}

      {/* Confidence and Performance */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Confidence: {Math.round(result.confidence * 100)}%</span>
        {result.processingTime && (
          <span>{Math.round(result.processingTime)}ms</span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        {onNavigateToReference && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToReference}
            className="flex-1 h-7 text-xs"
            disabled={!result.scaleTableId}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Tables
          </Button>
        )}
        
        {onNavigateToFullAnalysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToFullAnalysis}
            className="flex-1 h-7 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Analyze
          </Button>
        )}
        
        {onShowDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowDetails}
            className="h-7 w-7 p-0"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MiniResultsDisplay;