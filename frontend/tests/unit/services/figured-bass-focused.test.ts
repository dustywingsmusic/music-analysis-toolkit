/**
 * Focused test to verify figured bass notation step by step
 */

import { describe, it, expect } from 'vitest';
import { FunctionalHarmonyAnalyzer } from '../../../src/services/functionalHarmonyAnalysis';

describe('Figured Bass Step-by-Step Testing', () => {
  const analyzer = new FunctionalHarmonyAnalyzer();

  describe('Step 1: Verify Slash Chord Parsing', () => {
    it('should parse chord symbols with bass notes correctly', async () => {
      const result = await analyzer.analyzeFunctionally(['C/E', 'F/A', 'Am/C'], 'C major');

      // Test that bass notes are detected
      expect(result.chords[0].bassNote).toBe(4); // E = pitch class 4
      expect(result.chords[1].bassNote).toBe(9); // A = pitch class 9
      expect(result.chords[2].bassNote).toBe(0); // C = pitch class 0

      // Test that chord symbols are preserved
      expect(result.chords[0].chordSymbol).toBe('C/E');
      expect(result.chords[1].chordSymbol).toBe('F/A');
      expect(result.chords[2].chordSymbol).toBe('Am/C');
    });
  });

  describe('Step 2: Verify Inversion Detection', () => {
    it('should correctly identify first inversions', async () => {
      const result = await analyzer.analyzeFunctionally(['C/E', 'F/A'], 'C major');

      // Both should be first inversions (bass is the 3rd of the chord)
      expect(result.chords[0].inversion).toBe(1);
      expect(result.chords[1].inversion).toBe(1);

      // Should have ⁶ figured bass
      expect(result.chords[0].figuredBass).toBe('⁶');
      expect(result.chords[1].figuredBass).toBe('⁶');
    });

    it('should correctly identify second inversions', async () => {
      const result = await analyzer.analyzeFunctionally(['C/G'], 'C major');

      // Should be second inversion (bass is the 5th of the chord)
      expect(result.chords[0].inversion).toBe(2);
      expect(result.chords[0].figuredBass).toBe('⁶₄');
    });
  });

  describe('Step 3: Verify Roman Numeral Integration', () => {
    it('should combine Roman numerals with figured bass', async () => {
      const result = await analyzer.analyzeFunctionally(['C/E', 'C/G'], 'C major');

      // Should show I⁶ and I⁶₄
      expect(result.chords[0].romanNumeral).toContain('I');
      expect(result.chords[0].romanNumeral).toContain('⁶');
      expect(result.chords[1].romanNumeral).toContain('I');
      expect(result.chords[1].romanNumeral).toContain('⁶₄');
    });
  });

  describe('Step 4: Verify Seventh Chord Inversions', () => {
    it('should handle seventh chord inversions correctly', async () => {
      const result = await analyzer.analyzeFunctionally(['G7/B', 'G7/D', 'G7/F'], 'C major');

      // First inversion: ⁶₅
      expect(result.chords[0].figuredBass).toBe('⁶₅');
      expect(result.chords[0].inversion).toBe(1);

      // Second inversion: ⁴₃
      expect(result.chords[1].figuredBass).toBe('⁴₃');
      expect(result.chords[1].inversion).toBe(2);

      // Third inversion: ²
      expect(result.chords[2].figuredBass).toBe('²');
      expect(result.chords[2].inversion).toBe(3);
    });
  });

  describe('Step 5: Test Edge Cases', () => {
    it('should handle root position chords (no figured bass)', async () => {
      const result = await analyzer.analyzeFunctionally(['C', 'F', 'G'], 'C major');

      result.chords.forEach(chord => {
        expect(chord.figuredBass).toBe('');
        expect(chord.inversion).toBe(0);
        expect(chord.bassNote).toBeUndefined();
      });
    });

    it('should handle non-chord tones in bass (slash notation fallback)', async () => {
      const result = await analyzer.analyzeFunctionally(['C/D'], 'C major');

      // D is not a chord tone of C major, so should use slash notation
      expect(result.chords[0].figuredBass).toContain('/');
      expect(result.chords[0].bassNote).toBe(2); // D = pitch class 2
    });
  });
});
