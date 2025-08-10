/**
 * Contextual Tooltip Component
 *
 * Provides context-aware tooltips for music theory terms with:
 * - Quick hover definitions
 * - Click for detailed explanations
 * - Context-sensitive content based on analysis type
 * - Progressive disclosure patterns
 */

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { BookOpenIcon, ChevronRightIcon, PlayIcon, VolumeXIcon, InfoIcon } from 'lucide-react';
import { GlossaryTerm, findTermByAlias, getContextualDefinition, getRelatedTerms } from '../../data/musicTheoryGlossary';

export interface ContextualTooltipProps {
  term: string;
  children: React.ReactNode;
  context?: 'functional' | 'modal' | 'chromatic' | 'jazz';
  inline?: boolean;
  showIcon?: boolean;
  className?: string;
}

interface DetailModalProps {
  term: GlossaryTerm;
  context?: 'functional' | 'modal' | 'chromatic' | 'jazz';
  isOpen: boolean;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ term, context = 'functional', isOpen, onClose }) => {
  const [playingExample, setPlayingExample] = useState<number | null>(null);
  const [selectedExample, setSelectedExample] = useState(0);

  const contextualDefinition = getContextualDefinition(term.id, context);
  const relatedTerms = getRelatedTerms(term.id);

  const handlePlayExample = (index: number) => {
    setPlayingExample(index);
    // TODO: Implement audio playback
    setTimeout(() => setPlayingExample(null), 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getContextColor = (contextType: string) => {
    switch (contextType) {
      case 'functional': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'modal': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'chromatic': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'jazz': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
              {term.term}
            </DialogTitle>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={getDifficultyColor(term.difficulty)}
              >
                {term.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className={getContextColor(context)}
              >
                {context}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-sm text-gray-600">
            {term.category} · {contextualDefinition}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Detailed Definition */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-900">Definition</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {term.detailedDefinition}
            </p>
          </div>

          {/* Context-Specific Information */}
          {Object.entries(term.contexts).filter(([_, value]) => value).length > 1 && (
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">In Different Contexts</h4>
              <div className="space-y-2">
                {Object.entries(term.contexts).map(([contextType, definition]) => {
                  if (!definition) return null;
                  const isCurrentContext = contextType === context;

                  return (
                    <div
                      key={contextType}
                      className={`p-3 rounded-lg border ${
                        isCurrentContext
                          ? `${getContextColor(contextType)} border-2`
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getContextColor(contextType)}`}
                        >
                          {contextType}
                        </Badge>
                        {isCurrentContext && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Current Context
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{definition}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Musical Examples */}
          {term.examples.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Musical Examples</h4>
              <div className="space-y-3">
                {term.examples.map((example, index) => (
                  <Card key={index} className="border border-blue-200 bg-blue-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          Example {index + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => handlePlayExample(index)}
                          disabled={playingExample === index}
                        >
                          {playingExample === index ? (
                            <VolumeXIcon className="h-3 w-3" />
                          ) : (
                            <PlayIcon className="h-3 w-3" />
                          )}
                          <span className="ml-1">
                            {playingExample === index ? 'Playing...' : 'Play'}
                          </span>
                        </Button>
                      </div>

                      {example.chords && (
                        <div className="mb-2">
                          <span className="text-xs text-blue-600 font-medium">Chords:</span>
                          <div className="flex gap-1 mt-1">
                            {example.chords.map((chord, chordIndex) => (
                              <React.Fragment key={chordIndex}>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-100 text-blue-800 font-mono"
                                >
                                  {chord}
                                </Badge>
                                {chordIndex < example.chords!.length - 1 && (
                                  <span className="text-blue-400 self-center">→</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {example.notes && (
                        <div className="mb-2">
                          <span className="text-xs text-blue-600 font-medium">Notes:</span>
                          <div className="text-sm font-mono text-blue-800 mt-1">
                            {example.notes.join(' - ')}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-blue-700">{example.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Related Terms */}
          {relatedTerms.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Related Concepts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {relatedTerms.map((relatedTerm) => (
                  <Card key={relatedTerm.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {relatedTerm.term}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {relatedTerm.quickDefinition.slice(0, 50)}...
                          </div>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Aliases */}
          {term.aliases.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">Also Known As</h4>
              <div className="flex flex-wrap gap-1">
                {term.aliases.map((alias, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-gray-100 text-gray-700"
                  >
                    {alias}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  term,
  children,
  context = 'functional',
  inline = false,
  showIcon = false,
  className = ''
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glossaryTerm = findTermByAlias(term);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // If term not found, return children without tooltip
  if (!glossaryTerm) {
    return <>{children}</>;
  }

  const contextualDefinition = getContextualDefinition(glossaryTerm.id, context);
  const quickDefinition = contextualDefinition || glossaryTerm.quickDefinition;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTooltipOpen(false);
    setShowDetail(true);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isHoveringTooltip) {
      closeTimeoutRef.current = setTimeout(() => {
        setTooltipOpen(false);
      }, 200); // 200ms delay
    }
  };

  const handleTooltipEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHoveringTooltip(true);
  };

  const handleTooltipLeave = () => {
    setIsHoveringTooltip(false);
    closeTimeoutRef.current = setTimeout(() => {
      setTooltipOpen(false);
    }, 100);
  };

  const containerClasses = inline
    ? `inline-flex items-center gap-1 ${className}`
    : `cursor-help ${className}`;

  const termClasses = inline
    ? "text-blue-600 hover:text-blue-800 font-medium underline decoration-dotted decoration-1 underline-offset-2"
    : "text-blue-600 hover:text-blue-800 border-b border-dotted border-blue-400 hover:border-blue-600";

  return (
    <>
      <TooltipProvider>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <span
              className={containerClasses}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className={termClasses}>
                {children}
              </span>
              {showIcon && (
                <InfoIcon className="h-3 w-3 text-blue-500 opacity-60" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs p-3 bg-white border border-gray-200 shadow-lg"
            onPointerDownOutside={() => setTooltipOpen(false)}
            onMouseEnter={handleTooltipEnter}
            onMouseLeave={handleTooltipLeave}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">
                  {glossaryTerm.term}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    context === 'functional' ? 'bg-blue-100 text-blue-800' :
                    context === 'modal' ? 'bg-purple-100 text-purple-800' :
                    context === 'chromatic' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {context}
                </Badge>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {quickDefinition}
              </p>
              <div className="pt-1 border-t border-gray-100">
                <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                  Click for detailed explanation →
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DetailModal
        term={glossaryTerm}
        context={context}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
};

export default ContextualTooltip;
