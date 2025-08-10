/**
 * Comprehensive Analysis Engine Test Suite
 *
 * Integration tests for the ComprehensiveAnalysisEngine class
 * Tests full analysis pipeline, decision tree logic, confidence thresholds,
 * and multiple perspective analysis coordination
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComprehensiveAnalysisEngine, ComprehensiveAnalysisResult } from '../../../src/services/comprehensiveAnalysisService';
import { FunctionalHarmonyAnalyzer, FunctionalAnalysisResult } from '../../../src/services/functionalHarmonyAnalysis';
import { EnhancedModalAnalyzer, ModalAnalysisResult } from '../../../src/services/enhancedModalAnalyzer';

// Mock the dependencies
vi.mock('../../../src/services/functionalHarmonyAnalysis');
vi.mock('../../../src/services/enhancedModalAnalyzer');
vi.mock('../../../src/services/localChordProgressionAnalysis');

describe('ComprehensiveAnalysisEngine', () => {
  let engine: ComprehensiveAnalysisEngine;
  let mockFunctionalAnalyzer: FunctionalHarmonyAnalyzer;
  let mockModalAnalyzer: EnhancedModalAnalyzer;

  // Mock data for testing
  const mockFunctionalResult: FunctionalAnalysisResult = {
    keyCenter: 'C major',
    mode: 'major',
    chords: [
      { chordSymbol: 'C', romanNumeral: 'I', function: 'tonic', isChromatic: false },
      { chordSymbol: 'F', romanNumeral: 'IV', function: 'subdominant', isChromatic: false },
      { chordSymbol: 'G', romanNumeral: 'V', function: 'dominant', isChromatic: false },
      { chordSymbol: 'C', romanNumeral: 'I', function: 'tonic', isChromatic: false }
    ],
    cadences: [{ from: 'V', to: 'I', type: 'authentic', strength: 'strong' }],
    chromaticElements: [],
    confidence: 0.9,
    explanation: 'Classic I-IV-V-I progression in C major'
  };

  const mockModalResult: ModalAnalysisResult = {
    detectedTonicCenter: 'G',
    parentKeySignature: 'C major',
    modeName: 'G Mixolydian',
    romanNumerals: ['I', 'bVII', 'IV', 'I'],
    confidence: 0.85,
    evidence: [
      { type: 'structural', description: 'Starts and ends on G', strength: 0.8 },
      { type: 'cadential', description: 'bVII-I cadence', strength: 0.9 }
    ],
    characteristics: ['bVII-I cadence (Mixolydian characteristic)']
  };

  beforeEach(() => {
    engine = new ComprehensiveAnalysisEngine();
    mockFunctionalAnalyzer = vi.mocked(new FunctionalHarmonyAnalyzer());
    mockModalAnalyzer = vi.mocked(new EnhancedModalAnalyzer());
  });

  describe('Basic Analysis Pipeline', () => {
    it('should perform comprehensive analysis with all components', async () => {
      // Mock the functional analyzer
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);

      // Mock the modal analyzer
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result).toBeDefined();
      expect(result.functional).toBeDefined();
      expect(result.primaryApproach).toBeOneOf(['functional', 'modal', 'chromatic']);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.explanation).toBeDefined();
      expect(result.pedagogicalValue).toBeDefined();
    });

    it('should handle progressions without parent key', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result).toBeDefined();
      expect(result.functional).toBeDefined();
    });

    it('should handle progressions with parent key context', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G', 'C major');

      expect(result).toBeDefined();
      expect(result.functional).toBeDefined();
    });
  });

  describe('Primary Approach Decision Tree', () => {
    it('should choose functional as primary for basic tonal progressions', async () => {
      const functionalWithCadences = {
        ...mockFunctionalResult,
        cadences: [{ from: 'V', to: 'I', type: 'authentic', strength: 'strong' }]
      };

      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(functionalWithCadences);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('C F G C');

      expect(result.primaryApproach).toBe('functional');
    });

    it('should choose modal as primary when strong modal characteristics exist without functional cadences', async () => {
      const functionalWithoutCadences = {
        ...mockFunctionalResult,
        cadences: []
      };

      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(functionalWithoutCadences);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.primaryApproach).toBe('modal');
      expect(result.modal).toBeDefined();
      expect(result.modal!.enhancedAnalysis).toBeDefined();
    });

    it('should choose chromatic as primary when secondary dominants are present', async () => {
      const chromaticFunctionalResult = {
        ...mockFunctionalResult,
        chromaticElements: [
          {
            type: 'secondary_dominant' as const,
            chord: { chordSymbol: 'E7', romanNumeral: 'V/vi', function: 'dominant', isChromatic: true },
            resolution: { chordSymbol: 'Am', romanNumeral: 'vi', function: 'tonic', isChromatic: false },
            explanation: 'Secondary dominant of vi'
          }
        ]
      };

      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(chromaticFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('C E7 Am F G C');

      expect(result.primaryApproach).toBe('chromatic');
      expect(result.chromatic).toBeDefined();
      expect(result.chromatic!.secondaryDominants).toHaveLength(1);
    });
  });

  describe('Modal Enhancement Logic', () => {
    it('should include modal enhancement when enhanced modal analysis has high confidence', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue({
        ...mockModalResult,
        confidence: 0.8
      });

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.modal).toBeDefined();
      expect(result.modal!.enhancedAnalysis).toBeDefined();
      expect(result.modal!.modalCharacteristics).toContain('bVII-I cadence (Mixolydian characteristic)');
    });

    it('should not include modal enhancement when confidence is too low', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue({
        ...mockModalResult,
        confidence: 0.6
      });

      const result = await engine.analyzeComprehensively('C F G C');

      expect(result.modal).toBeUndefined();
    });

    it('should provide comparison between functional and modal approaches', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.modal).toBeDefined();
      expect(result.modal!.comparisonToFunctional).toBeDefined();
      expect(result.modal!.comparisonToFunctional).toContain('functional');
      expect(result.modal!.comparisonToFunctional).toContain('modal');
    });

    it('should explain when to use modal analysis', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.modal).toBeDefined();
      expect(result.modal!.whenToUseModal).toBeDefined();
      expect(result.modal!.whenToUseModal.length).toBeGreaterThan(0);
    });
  });

  describe('Confidence Thresholds', () => {
    it('should meet minimum confidence threshold for modal analysis', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue({
        ...mockModalResult,
        confidence: 0.7 // Exactly at threshold
      });

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.modal).toBeDefined();
      expect(result.modal!.enhancedAnalysis!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should exclude modal analysis below confidence threshold', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue({
        ...mockModalResult,
        confidence: 0.69 // Just below threshold
      });

      const result = await engine.analyzeComprehensively('C F G C');

      expect(result.modal).toBeUndefined();
    });

    it('should calculate overall confidence correctly', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Chromatic Analysis', () => {
    it('should detect and analyze secondary dominants', async () => {
      const chromaticResult = {
        ...mockFunctionalResult,
        chromaticElements: [
          {
            type: 'secondary_dominant' as const,
            chord: { chordSymbol: 'A7', romanNumeral: 'V/ii', function: 'dominant', isChromatic: true },
            resolution: { chordSymbol: 'Dm', romanNumeral: 'ii', function: 'subdominant', isChromatic: false },
            explanation: 'Secondary dominant of ii'
          }
        ]
      };

      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(chromaticResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('C A7 Dm G C');

      expect(result.chromatic).toBeDefined();
      expect(result.chromatic!.secondaryDominants).toHaveLength(1);
      expect(result.chromatic!.secondaryDominants[0].romanNumeral).toBe('V/ii');
      expect(result.chromatic!.resolutionPatterns).toHaveLength(1);
    });

    it('should detect and analyze borrowed chords', async () => {
      const borrowedChordResult = {
        ...mockFunctionalResult,
        chromaticElements: [
          {
            type: 'borrowed_chord' as const,
            chord: { chordSymbol: 'Fm', romanNumeral: 'iv', function: 'subdominant', isChromatic: true },
            explanation: 'Minor iv borrowed from parallel minor'
          }
        ]
      };

      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(borrowedChordResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('C Fm G C');

      expect(result.chromatic).toBeDefined();
      expect(result.chromatic!.borrowedChords).toHaveLength(1);
      expect(result.chromatic!.borrowedChords[0].romanNumeral).toBe('iv');
      expect(result.chromatic!.borrowedChords[0].borrowedFrom).toContain('minor');
    });

    it('should detect chromatic mediants', async () => {
      const chromaticMediantResult = {
        ...mockFunctionalResult,
        chromaticElements: [
          {
            type: 'chromatic_mediant' as const,
            chord: { chordSymbol: 'E', romanNumeral: 'III', function: 'mediant', isChromatic: true },
            explanation: 'Chromatic mediant III'
          }
        ]
      };

      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(chromaticMediantResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('C E F C');

      expect(result.chromatic).toBeDefined();
      expect(result.chromatic!.chromaticMediants).toHaveLength(1);
      expect(result.chromatic!.chromaticMediants[0].relationship).toBe('chromatic mediant');
    });
  });

  describe('Explanation Generation', () => {
    it('should generate comprehensive explanation for functional primary approach', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('C F G C');

      expect(result.explanation).toContain('Primary analysis:');
      expect(result.explanation).toContain(mockFunctionalResult.explanation);
    });

    it('should generate comprehensive explanation for modal primary approach', async () => {
      const functionalWithoutCadences = {
        ...mockFunctionalResult,
        cadences: []
      };

      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(functionalWithoutCadences);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.explanation).toContain('Primary analysis: Modal progression');
      expect(result.explanation).toContain('Functional context:');
    });

    it('should generate pedagogical explanation', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('C F G C');

      expect(result.pedagogicalValue).toBeDefined();
      expect(result.pedagogicalValue.length).toBeGreaterThan(0);
      expect(result.pedagogicalValue).toContain('functional harmony');
    });
  });

  describe('Input Processing', () => {
    it('should parse chord progressions with various separators', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);

      // Test various input formats
      const inputs = [
        'C F G C',           // Space separated
        'C | F | G | C',     // Bar separated
        'C  F   G    C',     // Multiple spaces
        'C|F|G|C',          // No spaces with bars
      ];

      for (const input of inputs) {
        const result = await engine.analyzeComprehensively(input);
        expect(result).toBeDefined();
        expect(result.functional).toBeDefined();
      }
    });

    it('should handle empty and malformed input gracefully', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue({
        ...mockFunctionalResult,
        chords: [],
        confidence: 0
      });

      const result = await engine.analyzeComprehensively('');

      expect(result).toBeDefined();
      expect(result.functional.chords).toHaveLength(0);
    });
  });

  describe('Performance Requirements', () => {
    it('should complete analysis within reasonable time', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const start = performance.now();
      await engine.analyzeComprehensively('G F C G');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle longer progressions efficiently', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(mockModalResult);

      const longProgression = 'C F G Am Dm G Em F C G Am F C';

      const start = performance.now();
      const result = await engine.analyzeComprehensively(longProgression);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(2000); // Should handle long progressions in under 2 seconds
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle functional analyzer errors gracefully', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockRejectedValue(new Error('Functional analysis failed'));

      await expect(engine.analyzeComprehensively('C F G C')).rejects.toThrow('Functional analysis failed');
    });

    it('should continue analysis if modal analyzer fails', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockImplementation(() => {
        throw new Error('Modal analysis failed');
      });

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result).toBeDefined();
      expect(result.functional).toBeDefined();
      expect(result.modal).toBeUndefined(); // Modal analysis should be omitted due to error
    });
  });

  describe('Integration with Legacy Systems', () => {
    it('should provide comparison with legacy modal analysis when enhanced analysis is available', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue({
        ...mockModalResult,
        confidence: 0.8
      });

      const result = await engine.analyzeComprehensively('G F C G');

      expect(result.modal).toBeDefined();
      expect(result.modal!.applicableAnalysis).toBeDefined(); // Legacy analysis
      expect(result.modal!.enhancedAnalysis).toBeDefined();   // Enhanced analysis
    });

    it('should fall back to legacy modal analysis when enhanced analysis fails', async () => {
      vi.mocked(mockFunctionalAnalyzer.analyzeFunctionally).mockResolvedValue(mockFunctionalResult);
      vi.mocked(mockModalAnalyzer.analyzeModalCharacteristics).mockReturnValue(null);

      const result = await engine.analyzeComprehensively('G F C G');

      // Should still try legacy modal detection
      expect(result).toBeDefined();
      expect(result.functional).toBeDefined();
    });
  });
});
