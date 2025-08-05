/**
 * Shared analysis types for the music theory toolkit
 */

export type IdentificationMethod = 'melody' | 'scale' | 'progression' | 'audio';

export interface ValidationIssue {
  type: 'format_mismatch';
  message: string;
  suggestion: string;
  suggestedMethod: IdentificationMethod;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}