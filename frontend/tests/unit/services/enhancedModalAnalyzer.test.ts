/**
 * Enhanced Modal Analyzer Test Suite
 * 
 * Comprehensive unit tests for the EnhancedModalAnalyzer class
 * Tests pattern recognition, tonal center detection, evidence collection,
 * confidence scoring, and Roman numeral generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedModalAnalyzer, ModalAnalysisResult, ModalEvidence } from '../../../src/services/enhancedModalAnalyzer';

describe('EnhancedModalAnalyzer', () => {
  let analyzer: EnhancedModalAnalyzer;

  beforeEach(() => {
    analyzer = new EnhancedModalAnalyzer();
  });

  describe('Basic Analysis', () => {
    it('should return null for empty chord array', () => {
      const result = analyzer.analyzeModalCharacteristics([]);
      expect(result).toBeNull();
    });

    it('should analyze single chord with low confidence', () => {
      const result = analyzer.analyzeModalCharacteristics(['C']);
      expect(result).toBeNull(); // Single chord should not meet confidence threshold
    });

    it('should handle invalid chord symbols gracefully', () => {
      expect(() => {
        analyzer.analyzeModalCharacteristics(['InvalidChord']);
      }).toThrow('Cannot parse chord: InvalidChord');
    });
  });

  describe('Critical Modal Patterns - G F C G Fix', () => {
    it('should detect G Mixolydian in G F C G progression with high confidence', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('G');
      expect(result!.modeName).toBe('G Mixolydian');
      expect(result!.romanNumerals).toEqual(['I', 'bVII', 'IV', 'I']);
      expect(result!.confidence).toBeGreaterThan(0.8);
      
      // Should have structural evidence (starts and ends on G)
      const structuralEvidence = result!.evidence.filter(e => e.type === 'structural');
      expect(structuralEvidence.length).toBeGreaterThan(0);

      // Should have cadential evidence (bVII-I pattern)
      const cadentialEvidence = result!.evidence.filter(e => 
        e.type === 'cadential' && e.description.includes('bVII-I'));
      expect(cadentialEvidence.length).toBeGreaterThan(0);

      // Should have intervallic evidence (bVII chord)
      const intervallicEvidence = result!.evidence.filter(e => 
        e.type === 'intervallic' && e.description.includes('bVII'));
      expect(intervallicEvidence.length).toBeGreaterThan(0);
    });

    it('should still detect modal characteristics when parent key is provided', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G'], 'C major');
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('G');
      expect(result!.parentKeySignature).toBe('C major');
      expect(result!.modeName).toContain('Mixolydian');
      
      // Should have contextual evidence about tonic vs parent key difference
      const contextualEvidence = result!.evidence.filter(e => e.type === 'contextual');
      expect(contextualEvidence.length).toBeGreaterThan(0);
    });

    it('should handle other Mixolydian progressions', () => {
      const result = analyzer.analyzeModalCharacteristics(['D', 'C', 'G', 'D']);
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('D');
      expect(result!.modeName).toBe('D Mixolydian');
      expect(result!.romanNumerals).toEqual(['I', 'bVII', 'IV', 'I']);
    });
  });

  describe('Pattern Recognition', () => {
    it('should detect Dorian patterns (i-IV-i)', () => {
      const result = analyzer.analyzeModalCharacteristics(['Em', 'A', 'Em']);
      
      expect(result).not.toBeNull();
      expect(result!.modeName).toContain('Dorian');
      expect(result!.romanNumerals).toEqual(['i', 'IV', 'i']);
    });

    it('should detect Phrygian patterns (i-bII-i)', () => {
      const result = analyzer.analyzeModalCharacteristics(['Am', 'Bb', 'Am']);
      
      expect(result).not.toBeNull();
      expect(result!.modeName).toContain('Phrygian');
      expect(result!.romanNumerals).toEqual(['i', 'bII', 'i']);
      
      // Should detect bII-I cadence
      const cadentialEvidence = result!.evidence.filter(e => 
        e.description.includes('bII-I cadence'));
      expect(cadentialEvidence.length).toBeGreaterThan(0);
    });

    it('should detect Lydian patterns (I-II-I)', () => {
      const result = analyzer.analyzeModalCharacteristics(['F', 'G', 'F']);
      
      expect(result).not.toBeNull();
      expect(result!.modeName).toContain('Lydian');
      expect(result!.romanNumerals).toEqual(['I', 'II', 'I']);
    });

    it('should detect Aeolian patterns (i-bVI-bVII-i)', () => {
      const result = analyzer.analyzeModalCharacteristics(['Am', 'F', 'G', 'Am']);
      
      expect(result).not.toBeNull();
      expect(result!.modeName).toContain('Aeolian');
      expect(result!.romanNumerals).toEqual(['i', 'bVI', 'bVII', 'i']);
    });
  });

  describe('Tonal Center Detection', () => {
    it('should prioritize chords that start and end progression', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'F', 'G', 'C']);
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('C');
      
      // Should have high-strength structural evidence
      const structuralEvidence = result!.evidence.filter(e => 
        e.type === 'structural' && e.strength >= 0.7);
      expect(structuralEvidence.length).toBeGreaterThan(0);
    });

    it('should consider first chord as potential tonic when different from last', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'F']);
      
      expect(result).not.toBeNull();
      // Should still prefer G as tonic due to structural analysis
      expect(['G', 'F']).toContain(result!.detectedTonicCenter);
    });

    it('should consider parent key context in tonic detection', () => {
      const result = analyzer.analyzeModalCharacteristics(['Em', 'F', 'G', 'Em'], 'G major');
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('E');
      expect(result!.parentKeySignature).toBe('G major');
    });
  });

  describe('Roman Numeral Generation', () => {
    it('should generate correct Roman numerals relative to detected tonic', () => {
      const result = analyzer.analyzeModalCharacteristics(['A', 'G', 'D', 'A']);
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('A');
      expect(result!.romanNumerals).toEqual(['I', 'bVII', 'IV', 'I']);
    });

    it('should handle minor chord quality in Roman numerals', () => {
      const result = analyzer.analyzeModalCharacteristics(['Am', 'Dm', 'G', 'Am']);
      
      expect(result).not.toBeNull();
      expect(result!.romanNumerals[0]).toBe('i'); // Minor tonic
      expect(result!.romanNumerals[1]).toBe('iv'); // Minor subdominant
    });

    it('should handle chromatic alterations', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'F#', 'G', 'C']);
      
      expect(result).not.toBeNull();
      expect(result!.romanNumerals).toEqual(['I', '#IV', 'V', 'I']);
    });

    it('should handle flat alterations', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Db', 'F', 'C']);
      
      expect(result).not.toBeNull();
      expect(result!.romanNumerals).toEqual(['I', 'bII', 'IV', 'I']);
    });
  });

  describe('Evidence Collection', () => {
    it('should collect structural evidence for repeated tonic', () => {
      const result = analyzer.analyzeModalCharacteristics(['F', 'C', 'G', 'F']);
      
      expect(result).not.toBeNull();
      const structuralEvidence = result!.evidence.filter(e => e.type === 'structural');
      expect(structuralEvidence.length).toBeGreaterThan(0);
      expect(structuralEvidence[0].description).toContain('starts and ends on F');
      expect(structuralEvidence[0].strength).toBeGreaterThan(0.7);
    });

    it('should collect cadential evidence for modal cadences', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'G']);
      
      expect(result).not.toBeNull();
      const cadentialEvidence = result!.evidence.filter(e => 
        e.type === 'cadential' && e.description.includes('bVII-I'));
      expect(cadentialEvidence.length).toBeGreaterThan(0);
      expect(cadentialEvidence[0].strength).toBeGreaterThan(0.8);
    });

    it('should collect intervallic evidence for modal characteristics', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Bb', 'F', 'C']);
      
      expect(result).not.toBeNull();
      const intervallicEvidence = result!.evidence.filter(e => 
        e.type === 'intervallic' && e.description.includes('bVII'));
      expect(intervallicEvidence.length).toBeGreaterThan(0);
      expect(intervallicEvidence[0].strength).toBeGreaterThan(0.6);
    });

    it('should collect contextual evidence when tonic differs from parent key', () => {
      const result = analyzer.analyzeModalCharacteristics(['D', 'C', 'G', 'D'], 'C major');
      
      expect(result).not.toBeNull();
      const contextualEvidence = result!.evidence.filter(e => e.type === 'contextual');
      expect(contextualEvidence.length).toBeGreaterThan(0);
      expect(contextualEvidence[0].description).toContain('differs from parent key');
    });
  });

  describe('Confidence Scoring', () => {
    it('should give high confidence to clear modal patterns with multiple evidence types', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.confidence).toBeGreaterThan(0.8);
      
      // Should have multiple evidence types
      const evidenceTypes = new Set(result!.evidence.map(e => e.type));
      expect(evidenceTypes.size).toBeGreaterThanOrEqual(2);
    });

    it('should give lower confidence to ambiguous patterns', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'G', 'Am']);
      
      if (result) {
        expect(result.confidence).toBeLessThan(0.8);
      }
    });

    it('should not exceed maximum confidence cap', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.confidence).toBeLessThanOrEqual(0.95);
    });

    it('should apply confidence threshold correctly', () => {
      // Test a progression that should have low confidence
      const result = analyzer.analyzeModalCharacteristics(['C', 'G']);
      
      // Should return null if confidence is below 0.7 threshold
      if (result) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });
  });

  describe('Modal Characteristics Identification', () => {
    it('should identify bVII chord characteristics', () => {
      const result = analyzer.analyzeModalCharacteristics(['D', 'C', 'G', 'D']);
      
      expect(result).not.toBeNull();
      expect(result!.characteristics).toContain('Contains bVII chord (flat seventh scale degree)');
    });

    it('should identify bII chord characteristics', () => {
      const result = analyzer.analyzeModalCharacteristics(['Am', 'Bb', 'C', 'Am']);
      
      expect(result).not.toBeNull();
      expect(result!.characteristics).toContain('Contains bII chord (flat second scale degree)');
    });

    it('should identify modal cadence characteristics', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.characteristics).toContain('bVII-I cadence (Mixolydian characteristic)');
    });

    it('should identify Phrygian cadence characteristics', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Db', 'C']);
      
      expect(result).not.toBeNull();
      expect(result!.characteristics).toContain('bII-I cadence (Phrygian characteristic)');
    });
  });

  describe('Chord Parsing', () => {
    it('should parse basic major triads', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'F', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.romanNumerals).toEqual(['I', 'IV', 'V']);
    });

    it('should parse minor triads', () => {
      const result = analyzer.analyzeModalCharacteristics(['Cm', 'Fm', 'Gm']);
      
      expect(result).not.toBeNull();
      expect(result!.romanNumerals[0]).toBe('i');
      expect(result!.romanNumerals[1]).toBe('iv');
      expect(result!.romanNumerals[2]).toBe('v');
    });

    it('should parse chords with sharps and flats', () => {
      const result = analyzer.analyzeModalCharacteristics(['F#', 'B', 'C#']);
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('F#');
    });

    it('should parse seventh chords', () => {
      const result = analyzer.analyzeModalCharacteristics(['Cmaj7', 'Fmaj7', 'G7']);
      
      expect(result).not.toBeNull();
      // Should handle 7th chords in chord quality detection
      expect(result!.romanNumerals.length).toBe(3);
    });

    it('should handle diminished chords', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Ddim', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.romanNumerals.length).toBe(3);
    });

    it('should handle augmented chords', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'Faug', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.romanNumerals.length).toBe(3);
    });
  });

  describe('Parent Key Integration', () => {
    it('should infer parent key when none provided', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.parentKeySignature).toBeDefined();
      expect(result!.parentKeySignature).toContain('major');
    });

    it('should use provided parent key', () => {
      const result = analyzer.analyzeModalCharacteristics(['Em', 'F', 'G', 'Em'], 'G major');
      
      expect(result).not.toBeNull();
      expect(result!.parentKeySignature).toBe('G major');
    });

    it('should extract parent key root correctly', () => {
      const result = analyzer.analyzeModalCharacteristics(['Am', 'F', 'C', 'Am'], 'F major');
      
      expect(result).not.toBeNull();
      expect(result!.parentKeySignature).toBe('F major');
    });
  });

  describe('Multiple Tonic Candidates', () => {
    it('should evaluate multiple potential tonic centers', () => {
      const result = analyzer.analyzeModalCharacteristics(['Em', 'G', 'C', 'D']);
      
      expect(result).not.toBeNull();
      // Should pick the most likely tonic based on analysis
      expect(['E', 'G', 'C', 'D']).toContain(result!.detectedTonicCenter);
    });

    it('should prefer structural emphasis over other factors', () => {
      const result = analyzer.analyzeModalCharacteristics(['A', 'F', 'C', 'G', 'A']);
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('A'); // Starts and ends on A
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very short progressions', () => {
      const result = analyzer.analyzeModalCharacteristics(['C', 'F']);
      
      // Should either return null or low confidence result
      if (result) {
        expect(result.confidence).toBeLessThan(0.8);
      }
    });

    it('should handle repeated chords', () => {
      const result = analyzer.analyzeModalCharacteristics(['G', 'G', 'F', 'G']);
      
      expect(result).not.toBeNull();
      expect(result!.detectedTonicCenter).toBe('G');
    });

    it('should handle unknown chord roots', () => {
      expect(() => {
        analyzer.analyzeModalCharacteristics(['H', 'F', 'C']); // H is not a valid note
      }).toThrow();
    });

    it('should handle malformed chord symbols', () => {
      expect(() => {
        analyzer.analyzeModalCharacteristics(['Cmajor7th']);
      }).toThrow('Cannot parse chord: Cmajor7th');
    });
  });

  describe('Performance Requirements', () => {
    it('should analyze typical progressions quickly', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G']);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete 100 analyses in under 1 second
    });

    it('should handle longer progressions efficiently', () => {
      const longProgression = ['C', 'F', 'G', 'Am', 'Dm', 'G', 'Em', 'F', 'C'];
      const start = performance.now();
      
      const result = analyzer.analyzeModalCharacteristics(longProgression);
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should analyze in under 100ms
      expect(result).not.toBeNull();
    });
  });
});