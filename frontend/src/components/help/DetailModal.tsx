/**
 * DetailModal - Comprehensive modal for in-depth music theory explanations
 * 
 * Provides detailed definitions, contextual explanations, musical examples,
 * and related concept navigation for deep learning.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  BookOpenIcon, 
  VolumeIcon, 
  ExternalLinkIcon, 
  ArrowLeftIcon,
  ArrowRightIcon,
  XIcon,
  PlayIcon,
  StopCircleIcon
} from 'lucide-react';
import { GlossaryTerm, MusicalExample, musicTheoryGlossary } from '../../data/musicTheoryGlossary';
import { useHelpAnalytics } from '../../hooks/useHelpAnalytics';

// Type aliases for backwards compatibility
type MusicTerm = GlossaryTerm;
type AnalysisContext = 'chord_progression' | 'melody' | 'scale' | 'mode';

interface DetailModalProps {
  term: MusicTerm;
  context?: AnalysisContext;
  onClose: () => void;
  onNavigateToTerm: (termId: string) => void;
  onViewInTables?: (mode: string, tonic: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  term,
  context,
  onClose,
  onNavigateToTerm,
  onViewInTables
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([term.id]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { trackHelpInteraction, trackLearningProgress } = useHelpAnalytics();

  // Track modal open
  useEffect(() => {
    trackHelpInteraction(term.id, 'modal_open', context?.type);
    
    const startTime = Date.now();
    return () => {
      const timeSpent = Date.now() - startTime;
      trackLearningProgress({
        termId: term.id,
        isFirstView: !localStorage.getItem(`help_viewed_${term.id}`),
        timeSpent,
        interactionPath: navigationHistory,
        completedRelatedTerms: []
      });
      
      localStorage.setItem(`help_viewed_${term.id}`, 'true');
    };
  }, [term.id, context?.type, navigationHistory, trackHelpInteraction, trackLearningProgress]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
        navigateBack();
      } else if (event.key === 'ArrowRight' && currentIndex < navigationHistory.length - 1) {
        navigateForward();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, navigationHistory.length, onClose]);

  // Focus management
  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      const firstFocusable = modal.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [term.id]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlaying(false);
      }
    };
  }, [currentAudio]);

  const navigateToRelatedTerm = (termId: string) => {
    const relatedTerm = musicTheoryGlossary[termId];
    if (!relatedTerm) return;

    trackHelpInteraction(termId, 'related_term_click', context?.type);
    
    // Update navigation history
    const newHistory = navigationHistory.slice(0, currentIndex + 1);
    newHistory.push(termId);
    setNavigationHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    
    onNavigateToTerm(termId);
  };

  const navigateBack = () => {
    if (currentIndex > 0) {
      const previousTermId = navigationHistory[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      onNavigateToTerm(previousTermId);
    }
  };

  const navigateForward = () => {
    if (currentIndex < navigationHistory.length - 1) {
      const nextTermId = navigationHistory[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      onNavigateToTerm(nextTermId);
    }
  };

  const playAudioExample = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(audioUrl);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    });

    audio.play().then(() => {
      setCurrentAudio(audio);
      setIsPlaying(true);
    }).catch(error => {
      console.warn('Failed to play audio:', error);
    });
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  // Get contextual definition
  const getDefinition = () => {
    if (context && term.definitions.contextual[context.type]) {
      return term.definitions.contextual[context.type];
    }
    return term.definitions.detailed;
  };

  // Get related terms that exist in glossary
  const getValidRelatedTerms = () => {
    return term.relatedTerms
      .map(id => musicTheoryGlossary[id])
      .filter(Boolean);
  };

  // Get prerequisite terms
  const getValidPrerequisiteTerms = () => {
    return term.prerequisiteTerms
      .map(id => musicTheoryGlossary[id])
      .filter(Boolean);
  };

  // Get difficulty color scheme
  const getDifficultyColors = () => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[term.difficulty];
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className="detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header */}
        <div className="detail-modal__header">
          <div className="detail-modal__navigation">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              disabled={currentIndex === 0}
              title="Previous term"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              onClick={navigateForward}
              disabled={currentIndex === navigationHistory.length - 1}
              title="Next term"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="detail-modal__title-section">
            <h2 id="modal-title" className="detail-modal__title">
              🎵 {term.term}
            </h2>
            <div className="detail-modal__badges">
              <Badge variant="outline" className={getDifficultyColors()}>
                {term.difficulty}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {term.category}
              </Badge>
              {context && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                  {context.type} context
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="detail-modal__close"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="detail-modal__content">
          {/* Main Definition */}
          <Card className="detail-modal__definition-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p id="modal-description" className="detail-modal__definition">
                {getDefinition()}
              </p>
            </CardContent>
          </Card>

          {/* Context-Specific Information */}
          {context && term.definitions.contextual[context.type] && (
            <Card className="detail-modal__context-card">
              <CardHeader>
                <CardTitle>In Your Current Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="detail-modal__context-explanation">
                  This term is particularly relevant to your {context.type} analysis. 
                  {context.subtype && ` Specifically in the context of ${context.subtype}.`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Musical Examples */}
          {term.examples.musical.length > 0 && (
            <Card className="detail-modal__examples-card">
              <CardHeader>
                <CardTitle>Musical Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="detail-modal__examples-grid">
                  {term.examples.musical.map((example, index) => (
                    <div key={index} className="detail-modal__example">
                      {example.notation && (
                        <div className="detail-modal__example-notation">
                          <code>{example.notation}</code>
                        </div>
                      )}
                      {example.song && (
                        <div className="detail-modal__example-song">
                          <strong>{example.song}</strong>
                          {example.artist && <span> by {example.artist}</span>}
                          {example.measure && <span> - {example.measure}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Examples */}
          {term.examples.audio && term.examples.audio.length > 0 && (
            <Card className="detail-modal__audio-card">
              <CardHeader>
                <CardTitle>Audio Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="detail-modal__audio-controls">
                  {term.examples.audio.map((audioUrl, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => isPlaying ? stopAudio() : playAudioExample(audioUrl)}
                      className="detail-modal__audio-btn"
                    >
                      {isPlaying ? (
                        <>
                          <StopIcon className="w-4 h-4 mr-2" />
                          Stop Example
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Play Example {index + 1}
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {getValidPrerequisiteTerms().length > 0 && (
            <Card className="detail-modal__prerequisites-card">
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Understanding these concepts first will help you grasp this term better:
                </p>
                <div className="detail-modal__term-links">
                  {getValidPrerequisiteTerms().map((prereq) => (
                    <Button
                      key={prereq.id}
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToRelatedTerm(prereq.id)}
                      className="detail-modal__term-link detail-modal__term-link--prerequisite"
                    >
                      {prereq.term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Concepts */}
          {getValidRelatedTerms().length > 0 && (
            <Card className="detail-modal__related-card">
              <CardHeader>
                <CardTitle>Related Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Explore these related music theory concepts:
                </p>
                <div className="detail-modal__term-links">
                  {getValidRelatedTerms().map((related) => (
                    <Button
                      key={related.id}
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToRelatedTerm(related.id)}
                      className="detail-modal__term-link"
                    >
                      {related.term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="detail-modal__actions">
            {onViewInTables && term.category === 'modal' && (
              <Button
                variant="outline"
                onClick={() => {
                  // Extract mode information for scale tables
                  onViewInTables(term.term, 'C'); // Default implementation
                }}
                className="detail-modal__action-btn"
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                View in Scale Tables
              </Button>
            )}
            
            <Button
              onClick={onClose}
              className="detail-modal__action-btn detail-modal__action-btn--primary"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS styles for the modal (would normally be in a separate .css file)
const modalStyles = `
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.detail-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.detail-modal__navigation {
  display: flex;
  gap: 4px;
}

.detail-modal__title-section {
  flex: 1;
  text-align: center;
  margin: 0 16px;
}

.detail-modal__title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.detail-modal__badges {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.detail-modal__close {
  padding: 8px;
  color: #6b7280;
}

.detail-modal__content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  space-y: 20px;
}

.detail-modal__definition-card {
  border: 2px solid #dbeafe;
  background: #eff6ff;
}

.detail-modal__definition {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}

.detail-modal__context-card {
  border: 2px solid #e0e7ff;
  background: #f0f4ff;
}

.detail-modal__context-explanation {
  font-size: 14px;
  color: #4f46e5;
  margin: 0;
}

.detail-modal__examples-grid {
  display: grid;
  gap: 12px;
}

.detail-modal__example {
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.detail-modal__example-notation {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.detail-modal__example-song {
  font-size: 14px;
  color: #374151;
}

.detail-modal__audio-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-modal__audio-btn {
  background: #f0f9ff;
  border-color: #0ea5e9;
  color: #0369a1;
}

.detail-modal__term-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-modal__term-link {
  font-size: 13px;
  height: 32px;
  padding: 0 12px;
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.detail-modal__term-link:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.detail-modal__term-link--prerequisite {
  background: #fef7ff;
  border-color: #d8b4fe;
  color: #7c3aed;
}

.detail-modal__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.detail-modal__action-btn {
  padding: 8px 16px;
}

.detail-modal__action-btn--primary {
  background: #3b82f6;
  color: white;
  border: none;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .detail-modal-overlay {
    padding: 8px;
  }
  
  .detail-modal {
    max-height: 95vh;
  }
  
  .detail-modal__header {
    padding: 16px 20px 12px;
  }
  
  .detail-modal__title {
    font-size: 20px;
  }
  
  .detail-modal__content {
    padding: 20px;
  }
  
  .detail-modal__actions {
    flex-direction: column;
  }
  
  .detail-modal__action-btn {
    width: 100%;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .detail-modal {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .detail-modal__header {
    background: #111827;
    border-color: #374151;
  }
  
  .detail-modal__title {
    color: #f9fafb;
  }
  
  .detail-modal__definition-card {
    background: #1e3a8a;
    border-color: #3b82f6;
  }
  
  .detail-modal__context-card {
    background: #312e81;
    border-color: #6366f1;
  }
  
  .detail-modal__example {
    background: #374151;
    border-color: #4b5563;
  }
  
  .detail-modal__actions {
    border-color: #374151;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = modalStyles;
  document.head.appendChild(styleSheet);
}