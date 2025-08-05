/**
 * MusicTermHighlighter - Core component for contextual music theory help
 * 
 * This component automatically detects music theory terms in text content and
 * provides contextual help through hover tooltips and click-through modals.
 * 
 * Features:
 * - Automatic term detection with regex patterns
 * - Context-aware explanations based on current analysis
 * - Progressive disclosure (tooltip → modal → related concepts)
 * - Mobile-optimized touch interactions
 * - WCAG 2.1 AA compliant accessibility
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { musicTheoryGlossary, GlossaryTerm, MusicalExample } from '../../data/musicTheoryGlossary';
import { ContextualTooltip } from './ContextualTooltip';
import { DetailModal } from './DetailModal';
import { useHelpAnalytics } from '../../hooks/useHelpAnalytics';

// Type aliases for backwards compatibility
type MusicTerm = GlossaryTerm;
type AnalysisContext = 'chord_progression' | 'melody' | 'scale' | 'mode';

interface MusicTermHighlighterProps {
  children: React.ReactNode;
  context?: AnalysisContext;
  disabled?: boolean;
  autoDetect?: boolean;
  explicitTerms?: string[]; // Manual term specification
  className?: string;
}

interface TermPosition {
  term: MusicTerm;
  start: number;
  end: number;
  element: HTMLElement;
}

/**
 * Custom hook for managing tooltip and modal state
 */
const useHelpInteraction = () => {
  const [activeTooltip, setActiveTooltip] = useState<{
    term: MusicTerm;
    position: { x: number; y: number };
    context?: AnalysisContext;
  } | null>(null);
  
  const [activeModal, setActiveModal] = useState<{
    term: MusicTerm;
    context?: AnalysisContext;
  } | null>(null);

  const closeTooltip = useCallback(() => setActiveTooltip(null), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return {
    activeTooltip,
    setActiveTooltip,
    activeModal,
    setActiveModal,
    closeTooltip,
    closeModal
  };
};

/**
 * Term detection patterns for automatic highlighting
 */
const createTermPatterns = (): Map<string, MusicTerm> => {
  const patterns = new Map<string, MusicTerm>();
  
  Object.values(musicTheoryGlossary).forEach(term => {
    // Add main term
    patterns.set(term.term.toLowerCase(), term);
    
    // Add aliases
    term.aliases.forEach(alias => {
      patterns.set(alias.toLowerCase(), term);
    });
  });
  
  return patterns;
};

const MusicTermHighlighter: React.FC<MusicTermHighlighterProps> = ({
  children,
  context,
  disabled = false,
  autoDetect = true,
  explicitTerms = [],
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termPatternsRef = useRef<Map<string, MusicTerm>>();
  const { trackHelpInteraction } = useHelpAnalytics();
  
  const {
    activeTooltip,
    setActiveTooltip,
    activeModal,
    setActiveModal,
    closeTooltip,
    closeModal
  } = useHelpInteraction();

  // Initialize term patterns on mount
  useEffect(() => {
    if (!termPatternsRef.current) {
      termPatternsRef.current = createTermPatterns();
    }
  }, []);

  /**
   * Find and highlight music theory terms in text content
   */
  const highlightTerms = useCallback((element: HTMLElement) => {
    if (!autoDetect || disabled || !termPatternsRef.current) return;

    const termPatterns = termPatternsRef.current;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes: Node[] = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      const parent = textNode.parentElement;
      
      if (!parent || parent.classList.contains('music-term-highlighted')) {
        return; // Skip already processed nodes
      }

      let modifiedText = text;
      const terms: TermPosition[] = [];

      // Find all term matches
      for (const [pattern, term] of termPatterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          // Check if this position is already covered by a longer term
          const isOverlapped = terms.some(existing => 
            match.index < existing.end && match.index + match[0].length > existing.start
          );
          
          if (!isOverlapped) {
            terms.push({
              term,
              start: match.index,
              end: match.index + match[0].length,
              element: parent
            });
          }
        }
      }

      // Sort terms by position (reverse order for proper replacement)
      terms.sort((a, b) => b.start - a.start);

      // Replace terms with highlighted spans
      terms.forEach(({ term, start, end }) => {
        const termText = text.substring(start, end);
        const beforeText = modifiedText.substring(0, start);
        const afterText = modifiedText.substring(end);
        
        const termSpan = `<span 
          class="music-term" 
          data-term-id="${term.id}"
          role="button"
          tabindex="0"
          aria-describedby="help-tooltip-${term.id}"
          aria-label="Get help with ${term.term}"
          title="Click for help with ${term.term}"
        >${termText}</span>`;
        
        modifiedText = beforeText + termSpan + afterText;
      });

      if (terms.length > 0) {
        parent.innerHTML = modifiedText;
        parent.classList.add('music-term-highlighted');
      }
    });
  }, [autoDetect, disabled]);

  /**
   * Handle term interaction (hover, click, touch)
   */
  const handleTermInteraction = useCallback((
    event: MouseEvent | TouchEvent,
    termId: string,
    interactionType: 'hover' | 'click' | 'touch'
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const term = Object.values(musicTheoryGlossary).find(t => t.id === termId);
    if (!term) return;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    trackHelpInteraction(term.id, interactionType, context?.type);

    if (interactionType === 'hover') {
      setActiveTooltip({
        term,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top
        },
        context
      });
    } else {
      // Click or touch - show modal for detailed explanation
      setActiveModal({ term, context });
      closeTooltip();
    }
  }, [context, trackHelpInteraction, setActiveTooltip, setActiveModal, closeTooltip]);

  /**
   * Set up event listeners for highlighted terms
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    // Highlight terms after content updates
    highlightTerms(container);

    // Add event listeners for term interactions
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('music-term')) {
        const termId = target.dataset.termId;
        if (termId) {
          handleTermInteraction(event, termId, 'hover');
        }
      }
    };

    const handleMouseLeave = () => {
      // Add small delay to prevent tooltip flicker
      setTimeout(() => {
        if (!activeTooltip) return;
        
        // Check if mouse is over tooltip
        const tooltipElement = document.querySelector('.contextual-tooltip');
        if (!tooltipElement?.matches(':hover')) {
          closeTooltip();
        }
      }, 100);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('music-term')) {
        const termId = target.dataset.termId;
        if (termId) {
          handleTermInteraction(event, termId, 'click');
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('music-term')) {
        if (event.key === 'Enter' || event.key === ' ') {
          const termId = target.dataset.termId;
          if (termId) {
            handleTermInteraction(event as any, termId, 'click');
          }
        }
      }
    };

    // Touch events for mobile
    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('music-term')) {
        const termId = target.dataset.termId;
        if (termId) {
          // Single touch shows tooltip, will upgrade to modal on touchend
          handleTermInteraction(event, termId, 'touch');
        }
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);
    container.addEventListener('click', handleClick);
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, true);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('touchstart', handleTouchStart, true);
    };
  }, [disabled, highlightTerms, handleTermInteraction, activeTooltip, closeTooltip]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.contextual-tooltip') && !target.classList.contains('music-term')) {
        closeTooltip();
      }
    };

    if (activeTooltip) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeTooltip, closeTooltip]);

  return (
    <>
      <div 
        ref={containerRef}
        className={`music-term-highlighter ${className}`}
        data-context-type={context?.type}
        data-context-subtype={context?.subtype}
      >
        {children}
      </div>

      {/* Tooltip Portal */}
      {activeTooltip && createPortal(
        <ContextualTooltip
          term={activeTooltip.term}
          position={activeTooltip.position}
          context={activeTooltip.context}
          onClose={closeTooltip}
          onShowDetail={() => {
            setActiveModal({ 
              term: activeTooltip.term, 
              context: activeTooltip.context 
            });
            closeTooltip();
          }}
        />,
        document.body
      )}

      {/* Modal Portal */}
      {activeModal && createPortal(
        <DetailModal
          term={activeModal.term}
          context={activeModal.context}
          onClose={closeModal}
          onNavigateToTerm={(termId) => {
            const newTerm = Object.values(musicTheoryGlossary).find(t => t.id === termId);
            if (newTerm) {
              setActiveModal({ term: newTerm, context: activeModal.context });
            }
          }}
        />,
        document.body
      )}
    </>
  );
};

export default MusicTermHighlighter;