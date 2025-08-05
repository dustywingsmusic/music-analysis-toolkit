/**
 * ContextualTooltip - Smart tooltip component for music theory terms
 * 
 * Provides quick definitions with contextual relevance based on current analysis.
 * Features adaptive positioning, touch-friendly interactions, and progressive
 * disclosure to detailed explanations.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ExternalLinkIcon, VolumeIcon, BookOpenIcon } from 'lucide-react';
import { GlossaryTerm, MusicalExample } from '../../data/musicTheoryGlossary';

// Type aliases for backwards compatibility
type MusicTerm = GlossaryTerm;
type AnalysisContext = 'chord_progression' | 'melody' | 'scale' | 'mode';

interface ContextualTooltipProps {
  term: MusicTerm;
  position: { x: number; y: number };
  context?: AnalysisContext;
  onClose: () => void;
  onShowDetail: () => void;
  onViewInTables?: (mode: string, tonic: string) => void;
}

/**
 * Calculate optimal tooltip position to stay within viewport
 */
const calculatePosition = (
  triggerX: number, 
  triggerY: number, 
  tooltipWidth: number, 
  tooltipHeight: number
) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  const padding = 16;
  let x = triggerX - tooltipWidth / 2;
  let y = triggerY - tooltipHeight - 12; // Position above trigger
  
  // Horizontal constraints
  if (x < padding) {
    x = padding;
  } else if (x + tooltipWidth > viewport.width - padding) {
    x = viewport.width - tooltipWidth - padding;
  }
  
  // Vertical constraints - flip to bottom if not enough space above
  if (y < padding) {
    y = triggerY + 32; // Position below trigger
  }
  
  return { x, y };
};

/**
 * Get contextual definition based on current analysis context
 */
const getContextualContent = (term: MusicTerm, context?: AnalysisContext) => {
  if (!context || !term.definitions.contextual[context.type]) {
    return {
      definition: term.definitions.quick,
      contextNote: null
    };
  }
  
  const contextualDef = term.definitions.contextual[context.type];
  return {
    definition: contextualDef,
    contextNote: `In ${context.type} analysis`
  };
};

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  term,
  position,
  context,
  onClose,
  onShowDetail,
  onViewInTables
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Calculate position once tooltip dimensions are known
  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const newPosition = calculatePosition(
        position.x,
        position.y,
        rect.width,
        rect.height
      );
      setCalculatedPosition(newPosition);
      setIsVisible(true);
    }
  }, [position.x, position.y]);

  // Auto-close tooltip after delay on mobile
  useEffect(() => {
    const isMobile = 'ontouchstart' in window;
    if (isMobile) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // 5 second auto-close on mobile
      
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  // Get content based on context
  const { definition, contextNote } = getContextualContent(term, context);
  
  // Determine if this term has examples that could link to scale tables
  const hasScaleTableLink = term.category === 'modal' && onViewInTables;
  
  // Get difficulty badge color
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div
      ref={tooltipRef}
      className={`contextual-tooltip ${isVisible ? 'contextual-tooltip--visible' : ''}`}
      style={{
        left: calculatedPosition.x,
        top: calculatedPosition.y,
        opacity: isVisible ? 1 : 0
      }}
      role="tooltip"
      aria-live="polite"
      onMouseEnter={(e) => e.stopPropagation()} // Prevent tooltip from closing on hover
    >
      {/* Header */}
      <div className="contextual-tooltip__header">
        <div className="contextual-tooltip__title-section">
          <h4 className="contextual-tooltip__title">{term.term}</h4>
          <div className="contextual-tooltip__badges">
            <Badge 
              variant="outline" 
              className={`contextual-tooltip__difficulty ${difficultyColors[term.difficulty]}`}
            >
              {term.difficulty}
            </Badge>
            {contextNote && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {contextNote}
              </Badge>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="contextual-tooltip__close"
          aria-label="Close help tooltip"
        >
          ×
        </Button>
      </div>

      {/* Definition */}
      <div className="contextual-tooltip__content">
        <p className="contextual-tooltip__definition">{definition}</p>
        
        {/* Quick Examples */}
        {term.examples.musical.length > 0 && (
          <div className="contextual-tooltip__examples">
            <div className="contextual-tooltip__example">
              <span className="contextual-tooltip__example-label">Example:</span>
              <span className="contextual-tooltip__example-text">
                {term.examples.musical[0].notation || term.examples.musical[0].song}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="contextual-tooltip__actions">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowDetail}
          className="contextual-tooltip__action-btn contextual-tooltip__action-btn--primary"
        >
          <BookOpenIcon className="w-4 h-4 mr-1" />
          Learn More
        </Button>
        
        {hasScaleTableLink && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Extract mode and tonic from first musical example
              const firstExample = term.examples.musical[0];
              if (firstExample.notation) {
                // Parse notation like "F→C in key of C major" 
                // or look for mode indicators
                onViewInTables?.(term.term, 'C'); // Default fallback
              }
            }}
            className="contextual-tooltip__action-btn"
          >
            <ExternalLinkIcon className="w-4 h-4 mr-1" />
            View Tables
          </Button>
        )}
        
        {term.examples.audio && term.examples.audio.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Play audio example
              const audio = new Audio(term.examples.audio[0]);
              audio.play().catch(console.warn);
            }}
            className="contextual-tooltip__action-btn"
          >
            <VolumeIcon className="w-4 h-4 mr-1" />
            Hear
          </Button>
        )}
      </div>

      {/* Arrow pointer */}
      <div className="contextual-tooltip__arrow" />
    </div>
  );
};

// CSS styles (would normally be in a separate .css file)
const tooltipStyles = `
.contextual-tooltip {
  position: fixed;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 102, 204, 0.2);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 320px;
  min-width: 280px;
  padding: 0;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-size: 14px;
  line-height: 1.4;
}

.contextual-tooltip--visible {
  opacity: 1;
  transform: translateY(0);
}

.contextual-tooltip__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(0, 102, 204, 0.1);
}

.contextual-tooltip__title-section {
  flex: 1;
}

.contextual-tooltip__title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.contextual-tooltip__badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.contextual-tooltip__difficulty {
  font-size: 11px;
  padding: 2px 6px;
}

.contextual-tooltip__close {
  padding: 4px;
  margin: -4px -4px 0 8px;
  color: #666;
  font-size: 18px;
  line-height: 1;
}

.contextual-tooltip__content {
  padding: 12px 16px;
}

.contextual-tooltip__definition {
  margin: 0 0 8px 0;
  color: #333;
}

.contextual-tooltip__examples {
  margin-top: 8px;
}

.contextual-tooltip__example {
  font-size: 13px;
  color: #666;
}

.contextual-tooltip__example-label {
  font-weight: 500;
  margin-right: 4px;
}

.contextual-tooltip__example-text {
  font-family: 'Monaco', 'Menlo', monospace;
  background: rgba(0, 102, 204, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
}

.contextual-tooltip__actions {
  display: flex;
  gap: 8px;
  padding: 8px 16px 12px;
  border-top: 1px solid rgba(0, 102, 204, 0.1);
  flex-wrap: wrap;
}

.contextual-tooltip__action-btn {
  font-size: 12px;
  height: 28px;
  padding: 0 8px;
  border-color: rgba(0, 102, 204, 0.3);
}

.contextual-tooltip__action-btn--primary {
  background-color: rgba(0, 102, 204, 0.05);
  border-color: rgba(0, 102, 204, 0.5);
  color: #0066cc;
}

.contextual-tooltip__action-btn:hover {
  background-color: rgba(0, 102, 204, 0.1);
  border-color: rgba(0, 102, 204, 0.6);
}

.contextual-tooltip__arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 6px;
  background: rgba(255, 255, 255, 0.98);
  border-left: 1px solid rgba(0, 102, 204, 0.2);
  border-bottom: 1px solid rgba(0, 102, 204, 0.2);
  transform: translateX(-50%) rotate(-45deg);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .contextual-tooltip {
    max-width: calc(100vw - 32px);
    min-width: 280px;
  }
  
  .contextual-tooltip__actions {
    justify-content: space-between;
  }
  
  .contextual-tooltip__action-btn {
    flex: 1;
    min-width: 0;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .contextual-tooltip {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(0, 102, 204, 0.3);
    color: #f9fafb;
  }
  
  .contextual-tooltip__title {
    color: #f9fafb;
  }
  
  .contextual-tooltip__definition {
    color: #e5e7eb;
  }
  
  .contextual-tooltip__example {
    color: #9ca3af;
  }
  
  .contextual-tooltip__arrow {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(0, 102, 204, 0.3);
  }
}
`;

// Inject styles (in a real implementation, this would be in a CSS file)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tooltipStyles;
  document.head.appendChild(styleSheet);
}