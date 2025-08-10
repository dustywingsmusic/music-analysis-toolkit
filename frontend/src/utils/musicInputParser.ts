/**
 * Music Input Parser and Validation Utilities
 *
 * This module provides comprehensive parsing and validation for various types of musical input
 * including notes, chords, progressions, and Roman numerals.
 */

import { NOTES } from '../constants/scales';
import { findChordMatches, ChordMatch } from '../services/chordLogic';

export type InputType = 'melody' | 'scale' | 'chord' | 'progression';

export interface ValidationResult {
  isValid: boolean;
  suggestions: string[];
  detectedChords: ChordMatch[];
  parsedTokens: ParsedToken[];
}

export interface ParsedToken {
  original: string;
  normalized: string;
  type: 'note' | 'chord' | 'roman' | 'unknown';
  pitchClass?: number;
  isValid: boolean;
}

// Enhanced validation patterns
const NOTE_PATTERN = /^[A-G][#b♯♭]?$/;
const CHORD_PATTERN = /^[A-G][#b♯♭]?(maj|min|m|M|\+|dim|aug|sus|add|°)?[0-9]*$/;
const ROMAN_PATTERN = /^[ivxIVX]+[°+]?$/;
const SLASH_CHORD_PATTERN = /^[A-G][#b♯♭]?(maj|min|m|M|\+|dim|aug|sus|add|°)?[0-9]*\/[A-G][#b♯♭]?$/;

/**
 * Parse a single musical token and determine its type and validity
 */
export function parseToken(token: string): ParsedToken {
  const trimmed = token.trim();

  if (NOTE_PATTERN.test(trimmed)) {
    const pitchClass = noteToPitchClass(trimmed);
    return {
      original: token,
      normalized: trimmed,
      type: 'note',
      pitchClass,
      isValid: pitchClass !== -1
    };
  }

  if (CHORD_PATTERN.test(trimmed) || SLASH_CHORD_PATTERN.test(trimmed)) {
    return {
      original: token,
      normalized: trimmed,
      type: 'chord',
      isValid: true
    };
  }

  if (ROMAN_PATTERN.test(trimmed)) {
    return {
      original: token,
      normalized: trimmed,
      type: 'roman',
      isValid: true
    };
  }

  return {
    original: token,
    normalized: trimmed,
    type: 'unknown',
    isValid: false
  };
}

/**
 * Convert note name to pitch class (0-11)
 */
export function noteToPitchClass(noteName: string): number {
  const normalizedNote = noteName.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
  return NOTES.findIndex(note => {
    const noteParts = note.toUpperCase().split('/');
    return noteParts.some(part => part === normalizedNote);
  });
}

/**
 * Convert multiple note names to pitch classes
 */
export function notesToPitchClasses(noteNames: string[]): number[] {
  return noteNames.map(noteToPitchClass).filter(pc => pc !== -1);
}

/**
 * Validate musical input based on type
 */
export function validateMusicInput(input: string, inputType: InputType): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: true, suggestions: [], detectedChords: [], parsedTokens: [] };
  }

  const tokens = trimmed.split(/[\s,]+/).filter(t => t.length > 0);
  const parsedTokens = tokens.map(parseToken);
  const suggestions: string[] = [];
  let detectedChords: ChordMatch[] = [];

  // Type-specific validation
  switch (inputType) {
    case 'melody':
    case 'scale':
      // Should contain only notes
      parsedTokens.forEach(token => {
        if (token.type !== 'note' || !token.isValid) {
          suggestions.push(`'${token.original}' is not a valid note name. Try: C, D, E, F, G, A, B (with optional # or ♭)`);
        }
      });

      // Try chord detection for scale input if we have enough notes
      if (inputType === 'scale' && parsedTokens.length >= 3) {
        const validPitchClasses = parsedTokens
          .filter(t => t.isValid && t.pitchClass !== undefined)
          .map(t => t.pitchClass!);

        if (validPitchClasses.length >= 3) {
          const midiNotes = validPitchClasses.map(pc => pc + 60);
          detectedChords = findChordMatches(midiNotes);
        }
      }
      break;

    case 'chord':
      // Should contain one chord
      if (parsedTokens.length > 1) {
        suggestions.push('Chord input should contain only one chord symbol');
      }

      parsedTokens.forEach(token => {
        if (token.type !== 'chord' || !token.isValid) {
          suggestions.push(`'${token.original}' is not a valid chord symbol. Try: C, Am, Fmaj7, etc.`);
        }
      });
      break;

    case 'progression': {
      // Can contain chords or Roman numerals, but should be consistent
      const hasChords = parsedTokens.some(t => t.type === 'chord');
      const hasRoman = parsedTokens.some(t => t.type === 'roman');

      if (hasChords && hasRoman) {
        suggestions.push('Mix of chord symbols and Roman numerals detected. Try using one format consistently.');
      }

      parsedTokens.forEach(token => {
        if (token.type === 'unknown' || !token.isValid) {
          suggestions.push(`'${token.original}' is not a valid chord symbol or Roman numeral`);
        }
      });
      break;
    }
  }

  const isValid = suggestions.length === 0;

  return {
    isValid,
    suggestions,
    detectedChords,
    parsedTokens
  };
}

/**
 * Extract chord progression patterns
 */
export function analyzeProgression(tokens: ParsedToken[]): {
  pattern: string;
  key?: string;
  romanNumerals?: string[];
} {
  const chordTokens = tokens.filter(t => t.type === 'chord' && t.isValid);

  if (chordTokens.length === 0) {
    return { pattern: 'unknown' };
  }

  // Simple pattern recognition for common progressions
  const chordNames = chordTokens.map(t => t.normalized);
  const pattern = chordNames.join('-');

  // Check for common patterns
  const commonPatterns = {
    'C-G-Am-F': 'vi-IV-I-V (Pop progression)',
    'Am-F-C-G': 'vi-IV-I-V (Alternative)',
    'C-Am-F-G': 'I-vi-IV-V (50s progression)',
    'F-G-C-Am': 'IV-V-I-vi',
    'Dm-G-C': 'ii-V-I (Jazz turnaround)'
  };

  return {
    pattern: commonPatterns[pattern as keyof typeof commonPatterns] || pattern,
    key: inferKeyFromChords(chordNames)
  };
}

/**
 * Infer key from chord progression (basic implementation)
 */
function inferKeyFromChords(chords: string[]): string | undefined {
  // Very basic key inference - would need more sophisticated analysis
  const firstChord = chords[0];
  if (firstChord && NOTE_PATTERN.test(firstChord.charAt(0))) {
    return firstChord.charAt(0);
  }
  return undefined;
}

/**
 * Generate suggestions for completing partial input
 */
export function generateSuggestions(input: string, inputType: InputType): string[] {
  const suggestions: string[] = [];

  if (!input.trim()) {
    switch (inputType) {
      case 'melody':
        suggestions.push('C D E F G', 'G A B C D', 'A B C D E');
        break;
      case 'scale':
        suggestions.push('C D E F G A B', 'A B C D E F G', 'D E F G A B C');
        break;
      case 'chord':
        suggestions.push('Cmaj7', 'Am7', 'Dm9', 'G7');
        break;
      case 'progression':
        suggestions.push('C G Am F', 'Am F C G', 'I V vi IV');
        break;
    }
  }

  return suggestions;
}

/**
 * Format input for display (normalize spacing, case, etc.)
 */
export function formatMusicInput(input: string, inputType: InputType): string {
  const tokens = input.split(/[\s,]+/).filter(t => t.length > 0);
  const parsedTokens = tokens.map(parseToken);

  return parsedTokens
    .map(token => token.normalized)
    .join(' ');
}
