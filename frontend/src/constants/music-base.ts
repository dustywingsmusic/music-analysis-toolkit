/**
 * Base Music Constants - Single Source of Truth
 *
 * This file contains the fundamental musical constants used throughout the application.
 * All other constants files import from here to prevent duplication and ensure consistency.
 */

// ============================================================================
// FUNDAMENTAL NOTE AND PITCH MAPPINGS
// ============================================================================

/**
 * Standard note names with enharmonic equivalents
 */
export const NOTES = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

/**
 * Parent key indices for scale table organization
 */
export const PARENT_KEY_INDICES = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6];

/**
 * Parent key pitch class to note name mapping
 */
export const PARENT_KEYS = {
    0: 'C', 1: 'D♭', 2: 'D', 3: 'E♭', 4: 'E', 5: 'F',
    6: 'G♭', 7: 'G', 8: 'A♭', 9: 'A', 10: 'B♭', 11: 'B'
};

/**
 * Basic note letters for theoretical calculations
 */
export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Pitch class names with enharmonic equivalents for display
 */
export const PITCH_CLASS_NAMES: { [key: number]: { normal: string; sharp?: string; flat?: string; } } = {
    0: { normal: 'C', sharp: 'B♯', flat: 'D♭♭' },
    1: { normal: 'C♯', flat: 'D♭' },
    2: { normal: 'D', sharp: 'C♯♯', flat: 'E♭♭' },
    3: { normal: 'E♭', sharp: 'D♯' },
    4: { normal: 'E', flat: 'F♭', sharp: 'D♯♯' },
    5: { normal: 'F', sharp: 'E♯', flat: 'G♭♭' },
    6: { normal: 'F♯', flat: 'G♭' },
    7: { normal: 'G', sharp: 'F♯♯', flat: 'A♭♭' },
    8: { normal: 'A♭', sharp: 'G♯' },
    9: { normal: 'A', sharp: 'G♯♯', flat: 'B♭♭' },
    10: { normal: 'B♭', sharp: 'A♯' },
    11: { normal: 'B', flat: 'C♭', sharp: 'A♯♯' }
};
