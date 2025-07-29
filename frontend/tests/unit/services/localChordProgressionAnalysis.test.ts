import { describe, it, expect } from 'vitest';
import { analyzeChordProgressionLocally } from '@/services/localChordProgressionAnalysis';

describe('localChordProgressionAnalysis', () => {
  it('should analyze a basic chord progression without throwing errors', async () => {
    const progression = 'C - F - G - C';
    
    // Should not throw an error
    const result = await analyzeChordProgressionLocally(progression);
    
    // Should return a valid result structure
    expect(result).toBeDefined();
    expect(result.localAnalysis.chords).toBeInstanceOf(Array);
    expect(result.localAnalysis.keyCenter).toBeDefined();
    expect(result.localAnalysis.overallMode).toBeDefined();
    expect(result.localAnalysis.confidence).toBeGreaterThanOrEqual(0);
    expect(result.localAnalysis.confidence).toBeLessThanOrEqual(1);
    expect(result.localAnalysis.source).toBeDefined();
    expect(result.localAnalysis.explanation).toBeDefined();
  });

  it('should prioritize user-provided key context', async () => {
    const progression = 'A - Db - F# - Db - A';
    const knownKey = 'A major';
    
    const result = await analyzeChordProgressionLocally(progression, knownKey);
    
    // Should prioritize user context
    expect(result.localAnalysis.keyCenter).toMatch(/A\s+(Major|major)/);
    expect(result.localAnalysis.source).toBe('user-guided');
    expect(result.localAnalysis.confidence).toBeGreaterThan(0.8); // High confidence for user context
    expect(result.userContextProvided).toBe(knownKey);
  });

  it('should provide multiple interpretations when available', async () => {
    const progression = 'A - Db - F# - Db - A';
    
    const result = await analyzeChordProgressionLocally(progression);
    
    // Should have a valid primary analysis
    expect(result.localAnalysis).toBeDefined();
    expect(result.localAnalysis.source).toBeDefined();
    
    // Alternative interpretations are optional but if present, should be valid
    if (result.alternativeInterpretations) {
      expect(result.alternativeInterpretations.length).toBeGreaterThan(0);
      // Each alternative should have required properties
      result.alternativeInterpretations.forEach(alt => {
        expect(alt.keyCenter).toBeDefined();
        expect(alt.source).toBeDefined();
        expect(alt.confidence).toBeGreaterThanOrEqual(0);
        expect(alt.explanation).toBeDefined();
      });
    }
  });

  it('should handle empty progression gracefully', async () => {
    const progression = '';
    
    const result = await analyzeChordProgressionLocally(progression);
    
    expect(result).toBeDefined();
    expect(result.localAnalysis.chords).toBeInstanceOf(Array);
    expect(result.localAnalysis.chords).toHaveLength(0);
  });

  it('should handle single chord', async () => {
    const progression = 'Cmaj7';
    
    const result = await analyzeChordProgressionLocally(progression);
    
    expect(result).toBeDefined();
    expect(result.localAnalysis.chords).toBeInstanceOf(Array);
    expect(result.localAnalysis.chords.length).toBeGreaterThan(0);
  });
});