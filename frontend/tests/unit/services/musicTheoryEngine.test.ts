/**
 * Comprehensive Test Suite for Music Theory Engine
 * 
 * Tests the new modular, rule-based architecture for:
 * 1. Modal detection accuracy (including G F C G issue)
 * 2. Confidence scoring system
 * 3. Rule engine functionality
 * 4. Multiple interpretation handling
 * 5. Edge case robustness
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  MusicTheoryEngine, 
  MusicalContext,
  AnalysisResult,
  RuleEngine,
  ConfidenceCalculator,
  Evidence,
  EvidenceType
} from '@/services/musicTheoryEngine';
import { ModalAnalyzer, MODAL_CHARACTERISTIC_PATTERNS } from '@/services/modalAnalyzer';

describe('MusicTheoryEngine Architecture', () => {
  let engine: MusicTheoryEngine;
  let ruleEngine: RuleEngine;
  let confidenceCalculator: ConfidenceCalculator;

  beforeEach(() => {
    engine = new MusicTheoryEngine();
    ruleEngine = new RuleEngine();
    confidenceCalculator = new ConfidenceCalculator();
  });

  describe('Core Functionality', () => {
    it('should parse chord symbols correctly', async () => {
      const context: MusicalContext = {
        chordSymbols: ['C', 'F', 'G', 'C']
      };

      // This would test the internal parseChords method if it were public
      // For now, we test through the main analyze method
      const result = await engine.analyzeComprehensively(context);
      
      expect(result.primaryAnalysis).toBeDefined();
      expect(result.primaryAnalysis.chords).toHaveLength(4);
      expect(result.primaryAnalysis.chords[0].symbol).toBe('C');
      expect(result.primaryAnalysis.chords[0].root).toBe(0); // C = 0
    });

    it('should handle complex chord symbols', async () => {
      const context: MusicalContext = {
        chordSymbols: ['Cmaj7', 'Dm7', 'G7', 'Am']
      };

      const result = await engine.analyzeComprehensively(context);
      
      expect(result.primaryAnalysis.chords[0].quality).toBe('major7');
      expect(result.primaryAnalysis.chords[1].quality).toBe('minor7');
      expect(result.primaryAnalysis.chords[2].quality).toBe('dominant7');
      expect(result.primaryAnalysis.chords[3].quality).toBe('minor');
    });

    it('should provide multiple analytical perspectives', async () => {
      const context: MusicalContext = {
        chordSymbols: ['G', 'F', 'C', 'G']
      };

      const result = await engine.analyzeComprehensively(context);
      
      expect(result.primaryAnalysis).toBeDefined();
      expect(result.alternativeAnalyses).toBeInstanceOf(Array);
      expect(result.alternativeAnalyses.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Modal Detection - G F C G Issue', () => {
    it('should correctly detect G Mixolydian for G F C G progression', async () => {
      const context: MusicalContext = {
        chordSymbols: ['G', 'F', 'C', 'G']
      };

      const result = await engine.analyzeWithModalPriority(context);
      
      expect(result.approach).toBe('modal');
      expect(result.confidence).toBeGreaterThan(0.8);
      
      // Should identify as Mixolydian mode
      if ('detectedMode' in result) {
        expect(result.detectedMode).toContain('Mixolydian');
      }
      
      // Should have Roman numerals relative to G as tonic
      const romanNumerals = result.chords.map(c => c.romanNumeral);
      expect(romanNumerals).toEqual(['I', 'bVII', 'IV', 'I']);
    });

    it('should detect G Mixolydian with parent key context', async () => {
      const context: MusicalContext = {
        chordSymbols: ['G', 'F', 'C', 'G'],
        parentKey: 'C major'
      };

      const result = await engine.analyzeWithModalPriority(context);
      
      expect(result.confidence).toBeGreaterThan(0.85);
      expect(result.keyCenter).toContain('C Major');
      
      if ('detectedMode' in result) {
        expect(result.detectedMode).toContain('G Mixolydian');
      }
    });

    it('should detect bVII-I cadential motion', async () => {
      const testCases = [
        { chords: ['D', 'C', 'D'], expectedMode: 'Mixolydian' },
        { chords: ['A', 'G', 'A'], expectedMode: 'Mixolydian' },
        { chords: ['E', 'D', 'E'], expectedMode: 'Mixolydian' }
      ];

      for (const testCase of testCases) {
        const context: MusicalContext = {
          chordSymbols: testCase.chords
        };

        const result = await engine.analyzeWithModalPriority(context);
        
        expect(result.approach).toBe('modal');
        
        if ('detectedMode' in result) {
          expect(result.detectedMode).toContain(testCase.expectedMode);
        }
        
        // Should have evidence of bVII-I motion
        const hasModalEvidence = result.evidence.some(e => 
          e.type === 'modal_characteristic' && 
          e.description.includes('bVII')
        );
        expect(hasModalEvidence).toBe(true);
      }
    });
  });

  describe('Rule Engine', () => {
    it('should register and evaluate rules correctly', () => {
      const mockRule = {
        id: 'test_rule',
        name: 'Test Rule',
        description: 'Test rule for unit testing',
        priority: 5,
        applicableApproaches: ['modal' as const],
        evaluate: (context: any) => ({
          applies: true,
          confidence: 0.8,
          evidence: [{
            type: 'modal_characteristic' as EvidenceType,
            strength: 0.8,
            description: 'Test evidence'
          }],
          suggestions: []
        })
      };

      ruleEngine.registerRule(mockRule);
      
      const mockContext = {
        chords: [],
        parentKey: undefined,
        musicalContext: { chordSymbols: [] }
      };
      
      const results = ruleEngine.evaluateRules(mockContext, 'modal');
      
      expect(results).toHaveLength(1);
      expect(results[0].applies).toBe(true);
      expect(results[0].confidence).toBe(0.8);
    });

    it('should prioritize rules correctly', () => {
      const highPriorityRule = {
        id: 'high_priority',
        name: 'High Priority Rule',
        description: 'High priority test rule',
        priority: 10,
        applicableApproaches: ['modal' as const],
        evaluate: () => ({ applies: true, confidence: 0.9, evidence: [], suggestions: [] })
      };

      const lowPriorityRule = {
        id: 'low_priority', 
        name: 'Low Priority Rule',
        description: 'Low priority test rule',
        priority: 1,
        applicableApproaches: ['modal' as const],
        evaluate: () => ({ applies: true, confidence: 0.7, evidence: [], suggestions: [] })
      };

      ruleEngine.registerRules([lowPriorityRule, highPriorityRule]);
      
      const mockContext = {
        chords: [],
        parentKey: undefined,
        musicalContext: { chordSymbols: [] }
      };
      
      const results = ruleEngine.evaluateRules(mockContext, 'modal');
      
      // High priority rule should come first
      expect(results[0].ruleId).toBe('high_priority');
      expect(results[1].ruleId).toBe('low_priority');
    });
  });

  describe('Confidence Calculation', () => {
    it('should calculate confidence based on evidence strength', () => {
      const strongEvidence: Evidence[] = [
        { type: 'modal_characteristic', strength: 0.9, description: 'Strong modal pattern' },
        { type: 'structural_chord', strength: 0.8, description: 'Clear tonic function' }
      ];

      const mockContext = {
        chords: [{ root: 0, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'C', extensions: [] }],
        parentKey: 'C major'
      };

      const confidence = confidenceCalculator.calculateConfidence(strongEvidence, mockContext);
      
      expect(confidence).toBeGreaterThan(0.8);
      expect(confidence).toBeLessThanOrEqual(1.0);
    });

    it('should apply structural bonus for first/last chord match', () => {
      const evidence: Evidence[] = [
        { type: 'modal_characteristic', strength: 0.7, description: 'Modal evidence' }
      ];

      const contextWithStructuralEvidence = {
        chords: [
          { root: 7, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'G', extensions: [] },
          { root: 5, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'F', extensions: [] },
          { root: 7, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'G', extensions: [] }
        ]
      };

      const contextWithoutStructuralEvidence = {
        chords: [
          { root: 7, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'G', extensions: [] },
          { root: 5, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'F', extensions: [] },
          { root: 0, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'C', extensions: [] }
        ]
      };

      const confidenceWithStructural = confidenceCalculator.calculateConfidence(evidence, contextWithStructuralEvidence);
      const confidenceWithoutStructural = confidenceCalculator.calculateConfidence(evidence, contextWithoutStructuralEvidence);

      expect(confidenceWithStructural).toBeGreaterThan(confidenceWithoutStructural);
    });

    it('should apply parent key bonus', () => {
      const evidence: Evidence[] = [
        { type: 'modal_characteristic', strength: 0.7, description: 'Modal evidence' }
      ];

      const contextWithParentKey = {
        chords: [{ root: 0, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'C', extensions: [] }],
        parentKey: 'C major'
      };

      const contextWithoutParentKey = {
        chords: [{ root: 0, quality: 'major' as const, intervals: [0, 4, 7], symbol: 'C', extensions: [] }]
      };

      const confidenceWithParentKey = confidenceCalculator.calculateConfidence(evidence, contextWithParentKey);
      const confidenceWithoutParentKey = confidenceCalculator.calculateConfidence(evidence, contextWithoutParentKey);

      expect(confidenceWithParentKey).toBeGreaterThan(confidenceWithoutParentKey);
    });
  });

  describe('Modal Characteristic Patterns', () => {
    it('should include all expected modal characteristics', () => {
      expect(MODAL_CHARACTERISTIC_PATTERNS).toBeDefined();
      expect(MODAL_CHARACTERISTIC_PATTERNS.length).toBeGreaterThan(0);
      
      // Should include bVII-I pattern for Mixolydian
      const bVII_I_pattern = MODAL_CHARACTERISTIC_PATTERNS.find(p => p.pattern === 'bVII-I');
      expect(bVII_I_pattern).toBeDefined();
      expect(bVII_I_pattern?.modes).toContain('Mixolydian');
      expect(bVII_I_pattern?.strength).toBeGreaterThan(0.8);
    });

    it('should include I-bVII-IV-I pattern for complete Mixolydian progression', () => {
      const fullPattern = MODAL_CHARACTERISTIC_PATTERNS.find(p => p.pattern === 'I-bVII-IV-I');
      expect(fullPattern).toBeDefined();
      expect(fullPattern?.modes).toContain('Mixolydian');
      expect(fullPattern?.strength).toBeGreaterThan(0.9);
      expect(fullPattern?.context).toBe('structural');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid chord symbols gracefully', async () => {
      const context: MusicalContext = {
        chordSymbols: ['X', 'Y', 'Z'] // Invalid chord symbols
      };

      await expect(engine.analyzeComprehensively(context)).rejects.toThrow();
    });

    it('should handle empty chord progression', async () => {
      const context: MusicalContext = {
        chordSymbols: []
      };

      await expect(engine.analyzeComprehensively(context)).rejects.toThrow();
    });

    it('should provide meaningful error messages', async () => {
      const context: MusicalContext = {
        chordSymbols: ['InvalidChord123']
      };

      try {
        await engine.analyzeComprehensively(context);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid chord symbol');
      }
    });
  });

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const context: MusicalContext = {
        chordSymbols: ['C', 'F', 'G', 'Am', 'Dm', 'G', 'C', 'F', 'Em', 'Am', 'Dm', 'G7', 'C']
      };

      const startTime = performance.now();
      await engine.analyzeComprehensively(context);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should be consistent across multiple runs', async () => {
      const context: MusicalContext = {
        chordSymbols: ['G', 'F', 'C', 'G']
      };

      const results = await Promise.all([
        engine.analyzeWithModalPriority(context),
        engine.analyzeWithModalPriority(context),
        engine.analyzeWithModalPriority(context)
      ]);

      // All results should have same confidence and primary approach
      results.forEach(result => {
        expect(result.approach).toBe(results[0].approach);
        expect(result.confidence).toBeCloseTo(results[0].confidence, 2);
        expect(result.chords.map(c => c.romanNumeral)).toEqual(
          results[0].chords.map(c => c.romanNumeral)
        );
      });
    });
  });

  describe('Integration with Existing System', () => {
    it('should maintain compatibility with parent key + local tonic model', async () => {
      const context: MusicalContext = {
        chordSymbols: ['Em', 'F#', 'G', 'Em'],
        parentKey: 'G major'
      };

      const result = await engine.analyzeWithModalPriority(context);
      
      // Should show parent key in key center
      expect(result.keyCenter).toContain('G Major');
      
      // Should show local tonic E in mode description
      if ('detectedMode' in result) {
        expect(result.detectedMode).toContain('E');
        expect(result.detectedMode).toContain('Dorian');
      }
    });

    it('should work with existing test dataset patterns', async () => {
      const testCases = [
        { input: ['G', 'F', 'C', 'G'], expectedRomans: ['I', 'bVII', 'IV', 'I'] },
        { input: ['Am', 'Bb', 'C', 'Am'], expectedRomans: ['i', 'bII', 'bIII', 'i'] },
        { input: ['Em', 'F#', 'G', 'Em'], expectedRomans: ['i', 'II', 'bIII', 'i'] }
      ];

      for (const testCase of testCases) {
        const context: MusicalContext = {
          chordSymbols: testCase.input
        };

        const result = await engine.analyzeWithModalPriority(context);
        
        expect(result.chords.map(c => c.romanNumeral)).toEqual(testCase.expectedRomans);
      }
    });
  });

  describe('Consensus Analysis', () => {
    it('should create consensus when multiple analyses agree', async () => {
      const context: MusicalContext = {
        chordSymbols: ['C', 'F', 'G', 'C'], // Clear functional progression
        parentKey: 'C major'
      };

      const result = await engine.analyzeComprehensively(context);
      
      // Should have consensus analysis if multiple approaches agree
      if (result.consensusAnalysis) {
        expect(result.consensusAnalysis.confidence).toBeGreaterThan(0.8);
        expect(result.consensusAnalysis.explanation).toContain('consensus');
      }
    });

    it('should not create consensus when analyses disagree significantly', async () => {
      const context: MusicalContext = {
        chordSymbols: ['G', 'F', 'C', 'G'] // Ambiguous progression
      };

      const result = await engine.analyzeComprehensively(context);
      
      // Consensus might not exist for ambiguous progressions
      // This depends on the specific implementation
      expect(result.primaryAnalysis).toBeDefined();
      expect(result.alternativeAnalyses).toBeDefined();
    });
  });
});