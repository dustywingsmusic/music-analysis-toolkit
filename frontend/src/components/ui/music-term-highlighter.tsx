/**
 * Music Term Highlighter Component
 *
 * Automatically detects and wraps music theory terms with contextual tooltips
 * Provides intelligent text parsing to identify terms without interfering with
 * existing formatting or interactive elements.
 */

import React, { useMemo } from 'react';
import { ContextualTooltip } from './contextual-tooltip';
import { musicTheoryGlossary } from '../../data/musicTheoryGlossary';

// Debug: Check if glossary is imported correctly
// console.log('Glossary keys:', Object.keys(musicTheoryGlossary));
// console.log('Glossary length:', Object.keys(musicTheoryGlossary).length);

export interface AnalysisContext {
  type: 'functional' | 'modal' | 'chromatic' | 'jazz';
  subtype?: string; // e.g., 'cadence_analysis', 'chord_progression', 'modal_identification'
  keyCenter?: string;
  mode?: string;
}

interface MusicTermHighlighterProps {
  children: React.ReactNode;
  context?: AnalysisContext;
  disabled?: boolean;
  className?: string;
}

interface TermMatch {
  term: string;
  start: number;
  end: number;
  priority: number; // For handling overlapping matches
}

// Build a comprehensive list of terms and their aliases for pattern matching
const buildTermPatterns = () => {
  const patterns: Array<{ pattern: RegExp; term: string; priority: number }> = [];

  Object.values(musicTheoryGlossary).forEach(glossaryTerm => {
    const allTerms = [glossaryTerm.term, ...glossaryTerm.aliases];

    allTerms.forEach(termVariant => {
      // Create word boundary pattern that handles musical terms
      // Handle terms like "V-I cadence", "plagal cadence", "chromatic mediant"
      const escapedTerm = termVariant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Create pattern that optionally matches plural forms
      // For terms ending in 't', allow 'ts' (dominant -> dominants)
      // For terms ending in 'd', allow 'ds' (chord -> chords)
      let patternString = `\\b${escapedTerm}`;
      if (termVariant.match(/[td]$/i)) {
        patternString += 's?';
      }
      patternString += '\\b';

      const pattern = new RegExp(patternString, 'gi');

      // Priority based on term length and specificity
      const priority = termVariant.length + (termVariant.includes(' ') ? 10 : 0);

      patterns.push({
        pattern,
        term: glossaryTerm.term, // Use canonical term name
        priority
      });
    });
  });

  // Sort by priority (longer, more specific terms first)
  return patterns.sort((a, b) => b.priority - a.priority);
};

const termPatterns = buildTermPatterns();
// console.log('Built', termPatterns.length, 'term patterns'); // Debug log

// Function to find all term matches in text
const findTermMatches = (text: string): TermMatch[] => {
  const matches: TermMatch[] = [];
  // console.log('Searching for terms in text:', text); // Debug log

  termPatterns.forEach(({ pattern, term, priority }) => {
    // Reset lastIndex for each pattern to ensure proper matching
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // console.log('Found term:', match[0], 'canonical:', term); // Debug log
      matches.push({
        term,
        start: match.index,
        end: match.index + match[0].length,
        priority
      });
      // Prevent infinite loop on zero-width matches
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++;
      }
    }
  });

  // Sort by start position and priority
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.priority - a.priority;
  });

  // Remove overlapping matches (keep higher priority ones)
  const nonOverlapping: TermMatch[] = [];
  matches.forEach(match => {
    const hasOverlap = nonOverlapping.some(existing =>
      (match.start < existing.end && match.end > existing.start)
    );
    if (!hasOverlap) {
      nonOverlapping.push(match);
    }
  });

  return nonOverlapping.sort((a, b) => a.start - b.start);
};

// Function to process text and wrap terms with ContextualTooltip
const processTextWithTooltips = (
  text: string,
  context: AnalysisContext,
  disabled: boolean
): React.ReactNode[] => {
  if (disabled || typeof text !== 'string' || text.length === 0) {
    return [text];
  }

  const matches = findTermMatches(text);

  if (matches.length === 0) {
    return [text];
  }

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    // Add text before the match
    if (match.start > lastIndex) {
      result.push(text.slice(lastIndex, match.start));
    }

    // Add the wrapped term
    const matchedText = text.slice(match.start, match.end);
    result.push(
      <ContextualTooltip
        key={`term-${index}-${match.start}`}
        term={match.term}
        context={context.type}
        inline={true}
      >
        {matchedText}
      </ContextualTooltip>
    );

    lastIndex = match.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
};

// Function to recursively process React nodes
const processReactNode = (
  node: React.ReactNode,
  context: AnalysisContext,
  disabled: boolean
): React.ReactNode => {
  // Handle different types of React nodes
  if (typeof node === 'string') {
    return processTextWithTooltips(node, context, disabled);
  }

  if (typeof node === 'number' || typeof node === 'boolean' || node === null || node === undefined) {
    return node;
  }

  if (React.isValidElement(node)) {
    // Don't process certain elements that shouldn't have tooltips
    const skipElements = ['code', 'pre', 'kbd', 'input', 'textarea', 'button', 'a'];
    if (typeof node.type === 'string' && skipElements.includes(node.type)) {
      return node;
    }

    // Don't process if it already has a data-no-highlight attribute
    if (node.props && node.props['data-no-highlight']) {
      return node;
    }

    // Process children
    const processedChildren = React.Children.map(node.props.children, child =>
      processReactNode(child, context, disabled)
    );

    return React.cloneElement(node, {}, processedChildren);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) =>
      <React.Fragment key={index}>
        {processReactNode(child, context, disabled)}
      </React.Fragment>
    );
  }

  return node;
};

export const MusicTermHighlighter: React.FC<MusicTermHighlighterProps> = ({
  children,
  context = { type: 'functional' },
  disabled = false,
  className = ''
}) => {
  const processedContent = useMemo(() => {
    if (disabled) return children;
    return processReactNode(children, context, disabled);
  }, [children, context, disabled]);

  return (
    <div className={`music-term-highlighter ${className}`}>
      {processedContent}
    </div>
  );
};

// Utility component for wrapping specific analysis sections
export const FunctionalAnalysisHighlighter: React.FC<{
  children: React.ReactNode;
  keyCenter?: string;
  className?: string;
}> = ({ children, keyCenter, className }) => (
  <MusicTermHighlighter
    context={{
      type: 'functional',
      subtype: 'chord_progression',
      keyCenter
    }}
    className={className}
  >
    {children}
  </MusicTermHighlighter>
);

export const ModalAnalysisHighlighter: React.FC<{
  children: React.ReactNode;
  mode?: string;
  className?: string;
}> = ({ children, mode, className }) => (
  <MusicTermHighlighter
    context={{
      type: 'modal',
      subtype: 'modal_identification',
      mode
    }}
    className={className}
  >
    {children}
  </MusicTermHighlighter>
);

export const ChromaticAnalysisHighlighter: React.FC<{
  children: React.ReactNode;
  keyCenter?: string;
  className?: string;
}> = ({ children, keyCenter, className }) => (
  <MusicTermHighlighter
    context={{
      type: 'chromatic',
      subtype: 'chromatic_harmony',
      keyCenter
    }}
    className={className}
  >
    {children}
  </MusicTermHighlighter>
);

export default MusicTermHighlighter;
