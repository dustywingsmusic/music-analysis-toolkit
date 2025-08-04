/**
 * CRITICAL MODAL ANALYSIS TESTS
 * 
 * This test suite contains only the most critical modal analysis functionality
 * that MUST work for production deployment. These tests should NEVER fail.
 * 
 * Success Criteria: 100% pass rate required for production deployment
 * 
 * Test Categories:
 * - Core modal detection (Ionian, Dorian, Mixolydian, etc.)
 * - Functional harmony rejection (I-V-I, ii-V-I should NOT be modal)
 * - 7th chord mode discrimination (I7 = Mixolydian, iø7 = Locrian)
 * - Parent key context handling
 * - Confidence thresholds
 */

import { describe, it, expect } from 'vitest';
import { EnhancedModalAnalyzer } from '../../../src/services/enhancedModalAnalyzer';

describe('Critical Modal Analysis Tests - Production Gate', () => {
  const analyzer = new EnhancedModalAnalyzer();

  describe('Core Modal Detection (CRITICAL)', () => {
    it('should detect C Mixolydian from I-bVII-I pattern with parent key', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Bb', 'C'], 'F major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('C Mixolydian');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect C Dorian from i-IV-i pattern with parent key', () => {
      const result = analyzer.analyzeModalCharacteristics(['Cm', 'F', 'Cm'], 'Bb major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('C Dorian');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect C Lydian from I-II-I pattern with parent key', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'D', 'C'], 'G major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('C Lydian');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Functional Harmony Rejection (CRITICAL)', () => {
    it('should NOT detect I-V-I as modal (functional cadence)', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'G', 'C']);
      // Should either be null or have very low confidence
      if (result !== null) {
        expect(result.confidence).toBeLessThan(0.7);
      }
    });

    it('should NOT detect ii-V-I as modal (jazz progression)', () => {
      const result = analyzer.analyzeModalCharacteristics(['Dm', 'G', 'C']);
      // Should either be null or have very low confidence  
      if (result !== null) {
        expect(result.confidence).toBeLessThan(0.7);
      }
    });

    it('should NOT detect vi-IV-I-V as modal (pop progression)', () => {
      const result = analyzer.analyzeModalCharacteristics(['Am', 'F', 'C', 'G']);
      // Should either be null or have very low confidence
      if (result !== null) {
        expect(result.confidence).toBeLessThan(0.7);
      }
    });
  });

  describe('7th Chord Mode Discrimination (CRITICAL)', () => {
    it('should detect Mixolydian from I7-IV-I7 pattern', () => {
      const result = analyzer.analyzeModalCharacteristics(['C7', 'F', 'C7'], 'F major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('C Mixolydian');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect Locrian from iø7-bII-iø7 pattern', () => {
      const result = analyzer.analyzeModalCharacteristics(['Cm7b5', 'Db', 'Cm7b5'], 'Db major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('C Locrian');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Parent Key Context (CRITICAL)', () => {
    it('should use parent key context for ambiguous I-IV patterns', () => {
      // G-C in C major should be G Mixolydian (G is 5th degree of C major)
      const result = analyzer.analyzeModalCharacteristics(['G', 'C'], 'C major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('G Mixolydian');
    });

    it('should handle missing parent key gracefully', () => {
      // Same progression without parent key should have lower confidence
      const result = analyzer.analyzeModalCharacteristics(['G', 'C']);
      if (result !== null) {
        expect(result.confidence).toBeLessThan(0.7); // Ambiguous without context
      }
    });
  });

  describe('Confidence Calibration (CRITICAL)', () => {
    it('should return high confidence for clear modal patterns with parent key', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Bb', 'F', 'C'], 'F major'); // I-bVII-IV-I
      expect(result).not.toBeNull();
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should return null or low confidence for unclear patterns', () => {
      const result = analyzer.analyzeModalCharacteristics(['C']); // Single chord
      expect(result).toBeNull();
    });
  });

  describe('Regression Prevention (CRITICAL)', () => {
    it('should preserve the sophisticated G-F-C-G Mixolydian detection with parent key', () => {
      // This is a real-world pattern that should work excellently
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G'], 'C major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('G Mixolydian');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.8); // High confidence expected
    });

    it('should maintain I-IV Ionian vamp detection', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'F'], 'C major');
      expect(result).not.toBeNull();
      expect(result!.modeName).toBe('C Ionian');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });
});