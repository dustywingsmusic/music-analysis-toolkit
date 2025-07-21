import { describe, expect, test } from 'vitest';
import { updateUnifiedDetection, sortSuggestionsByPriority } from '@/services/keySuggester';

describe('5-6 Note Analysis Prioritization', () => {
  test('should prioritize pentatonic matches over complete scale matches for 5 notes', () => {
    const pentatonicNotes = new Set([0, 2, 4, 7, 9]);

    const result = updateUnifiedDetection(pentatonicNotes, 'automatic');

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0].matchType).toBe('pentatonic');
    const completeScaleMatch = result.suggestions.find(s => s.matchType === 'complete');
    if (completeScaleMatch) {
      expect(completeScaleMatch.priority).toBeGreaterThan(result.suggestions[0].priority);
    }
  });

  test('should prioritize hexatonic matches over complete scale matches for 6 notes', () => {
    const hexatonicNotes = new Set([0, 2, 4, 6, 8, 10]);

    const result = updateUnifiedDetection(hexatonicNotes, 'automatic');

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0].matchType).toBe('hexatonic');
  });

  test('should sort suggestions by priority then completeness', () => {
    const suggestions = [
      { matchType: 'complete', priority: 2, closeness: 0.8 },
      { matchType: 'pentatonic', priority: 1, closeness: 0.9 },
      { matchType: 'complete', priority: 2, closeness: 0.9 },
      { matchType: 'pentatonic', priority: 1, closeness: 0.8 }
    ];

    const sorted = sortSuggestionsByPriority(suggestions);

    expect(sorted[0].priority).toBeLessThanOrEqual(sorted[1].priority);
    expect(sorted[0].closeness).toBeGreaterThan(sorted[1].closeness);
  });
});
