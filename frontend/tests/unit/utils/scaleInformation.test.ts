import { describe, it, expect } from 'vitest';
import { getMajorScaleInfo, getModalScaleInfo, getCompactScaleDisplay } from '../../../src/utils/scaleInformation';

describe('Scale Information Utility', () => {
  describe('Major Scale Information', () => {
    it('should generate correct C major scale info', () => {
      const scaleInfo = getMajorScaleInfo('C major');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.formula).toBe('1 – 2 – 3 – 4 – 5 – 6 – 7');
      expect(display.scaleString).toBe('C – D – E – F – G – A – B – [C]');
      expect(display.derivation).toBe('The C major scale follows the major scale formula');
    });

    it('should generate correct A major scale info with sharps', () => {
      const scaleInfo = getMajorScaleInfo('A major');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.formula).toBe('1 – 2 – 3 – 4 – 5 – 6 – 7');
      expect(display.scaleString).toBe('A – B – C# – D – E – F# – G# – [A]');
      expect(display.derivation).toBe('The A major scale follows the major scale formula');
    });

    it('should generate correct F major scale info with flats', () => {
      const scaleInfo = getMajorScaleInfo('F major');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.formula).toBe('1 – 2 – 3 – 4 – 5 – 6 – 7');
      expect(display.scaleString).toBe('F – G – A – Bb – C – D – E – [F]');
      expect(display.derivation).toBe('The F major scale follows the major scale formula');
    });
  });

  describe('Modal Scale Information', () => {
    it('should generate correct G Mixolydian scale info', () => {
      const scaleInfo = getModalScaleInfo('G Mixolydian');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.formula).toBe('1 – 2 – 3 – 4 – 5 – 6 – ♭7');
      expect(display.scaleString).toBe('G – A – B – C – D – E – F – [G]');
      expect(display.derivation).toBe('The G Mixolydian scale is derived from the 5th mode of the C major scale');
    });

    it('should generate correct A Mixolydian scale info', () => {
      const scaleInfo = getModalScaleInfo('A Mixolydian');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.formula).toBe('1 – 2 – 3 – 4 – 5 – 6 – ♭7');
      expect(display.scaleString).toBe('A – B – C# – D – E – F# – G – [A]');
      expect(display.derivation).toBe('The A Mixolydian scale is derived from the 5th mode of the D major scale');
    });

    it('should generate correct D Dorian scale info', () => {
      const scaleInfo = getModalScaleInfo('D Dorian');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.formula).toBe('1 – 2 – ♭3 – 4 – 5 – 6 – ♭7');
      expect(display.scaleString).toBe('D – E – F – G – A – B – C – [D]');
      expect(display.derivation).toBe('The D Dorian scale is derived from the 2nd mode of the C major scale');
    });

    it('should generate correct F Lydian scale info', () => {
      const scaleInfo = getModalScaleInfo('F Lydian');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.formula).toBe('1 – 2 – 3 – #4 – 5 – 6 – 7');
      expect(display.scaleString).toBe('F – G – A – B – C – D – E – [F]');
      expect(display.derivation).toBe('The F Lydian scale is derived from the 4th mode of the C major scale');
    });

    it('should handle unknown modes gracefully', () => {
      const scaleInfo = getModalScaleInfo('G Unknown');
      const display = getCompactScaleDisplay(scaleInfo);
      
      expect(display.derivation).toContain('Mode information not available for Unknown');
    });
  });

  describe('Edge Cases', () => {
    it('should handle enharmonic equivalents', () => {
      const scaleInfo1 = getModalScaleInfo('Db Mixolydian');
      const scaleInfo2 = getModalScaleInfo('C# Mixolydian');
      
      // Both should work, even if using different notation
      expect(scaleInfo1.formula).toBe(scaleInfo2.formula);
    });

    it('should use appropriate sharps vs flats notation', () => {
      const gMixolydian = getModalScaleInfo('G Mixolydian');
      const fMixolydian = getModalScaleInfo('F Mixolydian');
      
      // G typically uses sharps in its context
      expect(getCompactScaleDisplay(gMixolydian).scaleString).toContain('F'); // Natural F, not E#
      
      // F typically uses flats in its context  
      expect(getCompactScaleDisplay(fMixolydian).scaleString).toContain('Bb'); // Bb, not A#
    });
  });
});