/**
 * Enhanced Confidence Display Components
 *
 * Provides multi-dimensional confidence visualization with:
 * - Primary confidence meter with animation
 * - Breakdown by analysis source (theoretical vs contextual)
 * - Cross-validation agreement display
 * - Progressive disclosure for detailed metrics
 */

import React, { useState } from 'react';
import { Badge } from "./badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { ChevronDownIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export interface ComprehensiveConfidence {
  overall: number;
  breakdown?: {
    theoretical: number;    // Local analysis confidence
    contextual: number;     // AI enhancement confidence
    crossValidation: number; // Agreement between methods
  };
  label: 'High' | 'Medium' | 'Low';
  explanation?: string;
}

interface EnhancedConfidenceDisplayProps {
  confidence: ComprehensiveConfidence;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  animate?: boolean;
}

const getConfidenceColor = (value: number) => {
  if (value >= 80) return 'green';
  if (value >= 60) return 'yellow';
  return 'red';
};

const getConfidenceClasses = (value: number) => {
  const color = getConfidenceColor(value);
  return {
    bg: color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500',
    bgLight: color === 'green' ? 'bg-green-100' : color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100',
    text: color === 'green' ? 'text-green-800' : color === 'yellow' ? 'text-yellow-800' : 'text-red-800',
    border: color === 'green' ? 'border-green-300' : color === 'yellow' ? 'border-yellow-300' : 'border-red-300'
  };
};

export const ConfidenceMeter: React.FC<{
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animate?: boolean;
}> = ({ value, label, size = 'md', showValue = true, animate = true }) => {
  const classes = getConfidenceClasses(value);

  const sizeClasses = {
    sm: 'w-12 h-1.5',
    md: 'w-16 h-2',
    lg: 'w-24 h-3'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full transition-all duration-700 ease-out ${classes.bg} ${animate ? 'animate-pulse' : ''}`}
          style={{
            width: `${value}%`,
            animationDuration: animate ? '1s' : '0s',
            animationIterationCount: 1
          }}
        />
      </div>
      {showValue && (
        <span className={`text-xs font-medium ${classes.text}`}>
          {value}%
        </span>
      )}
      {label && (
        <span className="text-xs text-gray-600">
          {label}
        </span>
      )}
    </div>
  );
};

export const EnhancedConfidenceDisplay: React.FC<EnhancedConfidenceDisplayProps> = ({
  confidence,
  size = 'md',
  showBreakdown = true,
  animate = true
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const classes = getConfidenceClasses(confidence.overall);

  return (
    <div className="enhanced-confidence-display space-y-2">
      {/* Primary Confidence Display */}
      <div className="primary-confidence-display">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Confidence</span>
            {confidence.explanation && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{confidence.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${classes.bgLight} ${classes.text} ${classes.border}`}
            >
              {confidence.overall}%
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${classes.bgLight} ${classes.text} ${classes.border}`}
            >
              {confidence.label}
            </Badge>
          </div>
        </div>

        <ConfidenceMeter
          value={confidence.overall}
          size={size}
          showValue={false}
          animate={animate}
        />
      </div>

      {/* Confidence Breakdown */}
      {showBreakdown && confidence.breakdown && (
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors">
            {showDetails ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" />
            )}
            {showDetails ? 'Hide' : 'Show'} Confidence Breakdown
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2 p-3 bg-gray-50 dark:bg-gray-800/20 rounded-lg border">
              <ConfidenceBreakdownItem
                label="Theoretical Foundation"
                value={confidence.breakdown.theoretical}
                description="Based on music theory algorithms"
                icon="🎼"
              />
              <ConfidenceBreakdownItem
                label="Contextual Analysis"
                value={confidence.breakdown.contextual}
                description="AI-enhanced pattern recognition"
                icon="🤖"
              />
              <ConfidenceBreakdownItem
                label="Cross-Validation"
                value={confidence.breakdown.crossValidation}
                description="Agreement between analysis methods"
                icon="✓"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

const ConfidenceBreakdownItem: React.FC<{
  label: string;
  value: number;
  description: string;
  icon: string;
}> = ({ label, value, description, icon }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <div>
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {label}
          </div>
          <div className="text-xs text-gray-500">
            {description}
          </div>
        </div>
      </div>
      <ConfidenceMeter
        value={value}
        size="sm"
        showValue={true}
        animate={false}
      />
    </div>
  );
};

export const AnalysisConfidenceCard: React.FC<{
  title: string;
  confidence: ComprehensiveConfidence;
  children?: React.ReactNode;
}> = ({ title, confidence, children }) => {
  const classes = getConfidenceClasses(confidence.overall);

  return (
    <Card className={`confidence-card border-2 ${classes.border} ${classes.bgLight}/20`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <Badge variant="outline" className={`${classes.bgLight} ${classes.text} font-bold`}>
            {confidence.label}
          </Badge>
        </div>
        <EnhancedConfidenceDisplay
          confidence={confidence}
          size="md"
          showBreakdown={true}
          animate={true}
        />
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedConfidenceDisplay;
