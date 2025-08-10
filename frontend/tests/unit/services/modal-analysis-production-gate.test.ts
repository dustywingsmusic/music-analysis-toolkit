/**
 * PRODUCTION GATE TESTS
 *
 * This test suite serves as the final gate before production deployment.
 * These tests verify that the Enhanced Modal Analyzer meets production
 * quality standards and hasn't regressed on core functionality.
 *
 * Success Criteria:
 * - All tests MUST pass for production deployment
 * - Any failure blocks production release
 * - Tests focus on user-facing functionality and reliability
 */

import { describe, it, expect } from 'vitest';
import { EnhancedModalAnalyzer } from '../../../src/services/enhancedModalAnalyzer';

describe('Production Gate - Enhanced Modal Analyzer', () => {
  const analyzer = new EnhancedModalAnalyzer();

  describe('Reliability & Error Handling', () => {
    it('should handle empty input gracefully', () => {
      const result = analyzer.analyzeModalCharacteristics([]);
      expect(result).toBeNull();
    });

    it('should handle single chord input gracefully', () => {
      const result = analyzer.analyzeModalCharacteristics(['C']);
      expect(result).toBeNull();
    });

    it('should handle invalid chord symbols gracefully', () => {
      // Should not crash on invalid input
      expect(() => {
        analyzer.analyzeModalCharacteristics(['InvalidChord', 'AnotherBad']);
      }).not.toThrow();
    });

    it('should handle edge case chord symbols', () => {
      // Common edge cases that users might input
      const edgeCases = [
        ['C#', 'F#'],  // Sharp keys
        ['Db', 'Gb'],  // Flat keys
        ['C/E', 'F'],  // Slash chords (should parse root)
        ['Csus4', 'F'] // Suspended chords
      ];

      edgeCases.forEach(chords => {
        expect(() => {
          const result = analyzer.analyzeModalCharacteristics(chords);
          // Result can be null or valid, but shouldn't crash
          if (result) {
            expect(typeof result.modeName).toBe('string');
            expect(typeof result.confidence).toBe('number');
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
          }
        }).not.toThrow();
      });
    });
  });

  describe('Core User Experience', () => {
    it('should provide confident results for clear modal patterns with parent key', () => {
      const clearModalPatterns = [
        { chords: ['C', 'Bb', 'C'], parentKey: 'F major', expectedMode: 'C Mixolydian' },
        { chords: ['Cm', 'F', 'Cm'], parentKey: 'Bb major', expectedMode: 'C Dorian' },
        { chords: ['C', 'D', 'C'], parentKey: 'G major', expectedMode: 'C Lydian' },
        { chords: ['Cm', 'Db', 'Cm'], parentKey: 'Ab major', expectedMode: 'C Phrygian' }
      ];

      clearModalPatterns.forEach(({ chords, parentKey, expectedMode }) => {
        const result = analyzer.analyzeModalCharacteristics(chords, parentKey);
        expect(result).not.toBeNull();
        expect(result!.modeName).toBe(expectedMode);
        expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('should reject obvious functional progressions', () => {
      const functionalPatterns = [
        ['C', 'G', 'C'],     // I-V-I
        ['Dm', 'G', 'C'],    // ii-V-I
        ['Am', 'F', 'C', 'G'], // vi-IV-I-V
        ['C', 'F', 'G', 'C']  // I-IV-V-I
      ];

      functionalPatterns.forEach(chords => {
        const result = analyzer.analyzeModalCharacteristics(chords);
        // Should either return null or very low confidence
        if (result !== null) {
          expect(result.confidence).toBeLessThan(0.7);
        }
      });
    });

    it('should handle parent key context appropriately', () => {
      // Same progression with and without parent key
      const chordsWithContext = analyzer.analyzeModalCharacteristics(['G', 'C'], 'C major');
      const chordsWithoutContext = analyzer.analyzeModalCharacteristics(['G', 'C']);

      expect(chordsWithContext).not.toBeNull();
      expect(chordsWithContext!.modeName).toBe('G Mixolydian');

      // Without context should be less confident or different result
      if (chordsWithoutContext !== null) {
        expect(chordsWithoutContext.confidence).toBeLessThan(chordsWithContext!.confidence);
      }
    });
  });

  describe('Performance & Consistency', () => {
    it('should return consistent results for identical input', () => {
      const chords = ['C', 'Bb', 'F', 'C'];

      const result1 = analyzer.analyzeModalCharacteristics(chords);
      const result2 = analyzer.analyzeModalCharacteristics(chords);

      expect(result1).toEqual(result2);
    });

    it('should complete analysis in reasonable time', () => {
      const start = Date.now();

      // Test with a complex progression
      const result = analyzer.analyzeModalCharacteristics([
        'C', 'Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'C'
      ]);

      const duration = Date.now() - start;

      // Should complete in under 100ms for reasonable user experience
      expect(duration).toBeLessThan(100);

      // Should still return a valid result
      expect(result).not.toBeNull();
    });
  });

  describe('Integration Compatibility', () => {
    it('should return results compatible with local analysis interface', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Bb', 'C']);

      if (result !== null) {
        // Check that result has expected interface
        expect(result).toHaveProperty('modeName');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('romanNumerals');

        expect(typeof result.modeName).toBe('string');
        expect(typeof result.confidence).toBe('number');
        expect(Array.isArray(result.romanNumerals)).toBe(true);

        // Mode name should follow expected format
        expect(result.modeName).toMatch(/^[A-G][#b]? (Ionian|Dorian|Phrygian|Lydian|Mixolydian|Aeolian|Locrian)$/);
      }
    });

    it('should handle all common chord progressions without crashes', () => {
      const commonProgressions = [
        ['C', 'Am', 'F', 'G'],      // Pop progression
        ['Cm', 'Fm', 'Bb', 'Cm'],  // Minor progression
        ['C', 'F', 'C'],           // I-IV-I
        ['Cm', 'F', 'Cm'],         // i-IV-i (Dorian)
        ['C', 'Bb', 'C'],          // I-bVII-I (Mixolydian)
        ['C', 'D', 'G', 'C'],      // I-II-V-I (Lydian flavor)
        ['Am', 'Bb', 'C'],         // vi-bVII-I
        ['C7', 'F', 'C7'],         // I7-IV-I7 (Mixolydian 7th)
      ];

      commonProgressions.forEach(chords => {
        expect(() => {
          const result = analyzer.analyzeModalCharacteristics(chords);
          // Verify result format if not null
          if (result) {
            expect(typeof result.modeName).toBe('string');
            expect(typeof result.confidence).toBe('number');
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
          }
        }).not.toThrow();
      });
    });
  });

  describe('Quality Assurance', () => {
    it('should maintain high accuracy on test suite sample', () => {
      // Sample of progressions that should definitely work
      const testSample = [
        { chords: ['C', 'Bb', 'C'], parentKey: 'F major', expected: 'C Mixolydian', shouldPass: true },
        { chords: ['Cm', 'F', 'Cm'], parentKey: 'Bb major', expected: 'C Dorian', shouldPass: true },
        { chords: ['C', 'G', 'C'], expected: null, shouldPass: false }, // Functional
        { chords: ['C7', 'F', 'C7'], parentKey: 'F major', expected: 'C Mixolydian', shouldPass: true },
      ];

      let passed = 0;
      let total = testSample.length;

      testSample.forEach(({ chords, parentKey, expected, shouldPass }) => {
        const result = analyzer.analyzeModalCharacteristics(chords, parentKey);

        if (shouldPass) {
          if (result !== null && result.modeName === expected && result.confidence >= 0.7) {
            passed++;
          }
        } else {
          if (result === null || result.confidence < 0.7) {
            passed++;
          }
        }
      });

      const accuracy = passed / total;
      expect(accuracy).toBeGreaterThanOrEqual(1.0); // 100% on this critical sample
    });
  });
});
