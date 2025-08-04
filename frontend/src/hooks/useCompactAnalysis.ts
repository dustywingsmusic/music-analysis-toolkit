/**
 * Compact Analysis Hook
 * 
 * Lightweight analysis engine optimized for MIDI Widget use cases:
 * - Fast response times (< 100ms)
 * - Minimal memory footprint
 * - Essential analysis only
 * - Chrome plugin compatible
 * - No external API dependencies
 */

import { useState, useCallback, useMemo } from 'react';
import { NOTES, allScaleData } from '../constants/scales';

export interface CompactModeDetection {
  name: string;
  parentKey: string;
  rootNote: string;
  confidence: number;
  scaleTableId: string;
  intervals: number[];
}

export interface CompactChordAnalysis {
  chordSymbol: string;
  romanNumeral: string;
  function: 'tonic' | 'predominant' | 'dominant' | 'other';
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'other';
  confidence: number;
}

export interface CompactAnalysisResult {
  detectedModes: CompactModeDetection[];
  chordAnalysis?: CompactChordAnalysis;
  quickInsights: string[];
  confidence: number;
  processingTime: number;
}

/**
 * Hook for lightweight, real-time musical analysis
 */
export const useCompactAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<CompactAnalysisResult | null>(null);

  // Pre-computed scale lookup for fast matching
  const scaleDatabase = useMemo(() => {
    const scales: Array<{
      pitchClasses: Set<number>;
      name: string;
      parentKey: string;
      rootNote: number;
      scaleTableId: string;
      intervals: number[];
    }> = [];

    const PARENT_KEY_INDICES = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6];

    allScaleData.forEach(data => {
      PARENT_KEY_INDICES.forEach((parentKeyIndex, keyRowIndex) => {
        data.parentScaleIntervals.forEach((modeStartInterval, modeIndex) => {
          const modeRootPitch = (parentKeyIndex + modeStartInterval) % 12;
          const modeTypeIntervals = data.modeIntervals[modeIndex];
          const pitchClasses = new Set(modeTypeIntervals.map(i => (modeRootPitch + i) % 12));
          
          scales.push({
            pitchClasses,
            name: data.commonNames?.[modeIndex] || `Mode ${modeIndex + 1}`,
            parentKey: `${NOTES[parentKeyIndex]} ${data.name}`,
            rootNote: modeRootPitch,
            scaleTableId: `${data.tableId}-${keyRowIndex}-${modeIndex}`,
            intervals: modeTypeIntervals
          });
        });
      });
    });

    return scales;
  }, []);

  // Fast chord recognition patterns
  const chordPatterns = useMemo(() => {
    return [
      // Major triads
      { intervals: [0, 4, 7], symbol: '', quality: 'major' as const, function: 'tonic' as const },
      // Minor triads  
      { intervals: [0, 3, 7], symbol: 'm', quality: 'minor' as const, function: 'tonic' as const },
      // Dominant 7ths
      { intervals: [0, 4, 7, 10], symbol: '7', quality: 'major' as const, function: 'dominant' as const },
      // Minor 7ths
      { intervals: [0, 3, 7, 10], symbol: 'm7', quality: 'minor' as const, function: 'predominant' as const },
      // Major 7ths
      { intervals: [0, 4, 7, 11], symbol: 'maj7', quality: 'major' as const, function: 'tonic' as const },
      // Diminished
      { intervals: [0, 3, 6], symbol: 'dim', quality: 'diminished' as const, function: 'other' as const },
      // Augmented
      { intervals: [0, 4, 8], symbol: 'aug', quality: 'augmented' as const, function: 'other' as const },
    ];
  }, []);

  /**
   * Fast scale/mode detection from pitch classes
   */
  const detectModes = useCallback((pitchClasses: Set<number>): CompactModeDetection[] => {
    if (pitchClasses.size < 5 || pitchClasses.size > 7) {
      return [];
    }

    const matches: CompactModeDetection[] = [];
    const pitchClassArray = Array.from(pitchClasses);

    // Find exact matches in pre-computed database
    for (const scale of scaleDatabase) {
      if (scale.pitchClasses.size === pitchClasses.size) {
        const isMatch = pitchClassArray.every(pc => scale.pitchClasses.has(pc));
        
        if (isMatch) {
          matches.push({
            name: scale.name,
            parentKey: scale.parentKey,
            rootNote: NOTES[scale.rootNote],
            confidence: 1.0, // Exact match
            scaleTableId: scale.scaleTableId,
            intervals: scale.intervals
          });
        }
      }
    }

    // Sort by preference (favor common modes)
    return matches.sort((a, b) => {
      const commonModes = ['Major', 'Natural Minor', 'Dorian', 'Mixolydian'];
      const aScore = commonModes.indexOf(a.name);
      const bScore = commonModes.indexOf(b.name);
      
      if (aScore !== -1 && bScore !== -1) return aScore - bScore;
      if (aScore !== -1) return -1;
      if (bScore !== -1) return 1;
      return 0;
    }).slice(0, 3); // Return top 3 matches
  }, [scaleDatabase]);

  /**
   * Fast chord analysis from pitch classes
   */
  const analyzeChord = useCallback((pitchClasses: Set<number>): CompactChordAnalysis | null => {
    if (pitchClasses.size < 3 || pitchClasses.size > 5) {
      return null;
    }

    const pitchClassArray = Array.from(pitchClasses).sort();
    const root = pitchClassArray[0];
    
    // Normalize to root position intervals
    const intervals = pitchClassArray.map(pc => (pc - root + 12) % 12).sort();

    // Find matching chord pattern
    for (const pattern of chordPatterns) {
      if (intervals.length === pattern.intervals.length) {
        const isMatch = intervals.every((interval, idx) => interval === pattern.intervals[idx]);
        
        if (isMatch) {
          return {
            chordSymbol: `${NOTES[root]}${pattern.symbol}`,
            romanNumeral: 'I', // Simplified - would need key context for accurate Roman numerals
            function: pattern.function,
            quality: pattern.quality,
            confidence: 1.0
          };
        }
      }
    }

    // Fallback for unrecognized chords
    return {
      chordSymbol: `${NOTES[root]} chord`,
      romanNumeral: '?',
      function: 'other',
      quality: 'other',
      confidence: 0.5
    };
  }, [chordPatterns]);

  /**
   * Generate quick insights for display
   */
  const generateInsights = useCallback((
    modes: CompactModeDetection[], 
    chord: CompactChordAnalysis | null,
    pitchClasses: Set<number>
  ): string[] => {
    const insights: string[] = [];

    if (chord) {
      insights.push(`${chord.function} function`);
      insights.push(`${chord.quality} quality`);
    }

    if (modes.length > 0) {
      const primaryMode = modes[0];
      insights.push(`${primaryMode.name} mode`);
      
      if (modes.length > 1) {
        insights.push(`${modes.length} possible modes`);
      }
    }

    if (pitchClasses.size === 7) {
      insights.push('Full heptatonic scale');
    } else if (pitchClasses.size === 5) {
      insights.push('Pentatonic scale');
    }

    return insights.slice(0, 3); // Limit to 3 key insights
  }, []);

  /**
   * Main analysis function - optimized for speed
   */
  const analyzeQuickly = useCallback(async (pitchClasses: Set<number>): Promise<CompactAnalysisResult> => {
    const startTime = performance.now();
    setIsAnalyzing(true);

    try {
      // Parallel analysis for speed
      const [detectedModes, chordAnalysis] = await Promise.all([
        Promise.resolve(detectModes(pitchClasses)),
        Promise.resolve(analyzeChord(pitchClasses))
      ]);

      const quickInsights = generateInsights(detectedModes, chordAnalysis, pitchClasses);
      
      // Calculate overall confidence
      let confidence = 0;
      if (detectedModes.length > 0) confidence += 0.6;
      if (chordAnalysis && chordAnalysis.confidence > 0.8) confidence += 0.4;
      
      const result: CompactAnalysisResult = {
        detectedModes,
        chordAnalysis: chordAnalysis || undefined,
        quickInsights,
        confidence: Math.min(confidence, 1.0),
        processingTime: performance.now() - startTime
      };

      setLastAnalysis(result);
      return result;

    } finally {
      setIsAnalyzing(false);
    }
  }, [detectModes, analyzeChord, generateInsights]);

  /**
   * Quick mode detection only (for scale-focused analysis)
   */
  const detectModesOnly = useCallback(async (pitchClasses: Set<number>): Promise<CompactModeDetection[]> => {
    return detectModes(pitchClasses);
  }, [detectModes]);

  /**
   * Quick chord detection only (for chord-focused analysis)
   */
  const analyzeChordOnly = useCallback(async (pitchClasses: Set<number>): Promise<CompactChordAnalysis | null> => {
    return analyzeChord(pitchClasses);
  }, [analyzeChord]);

  return {
    // Main analysis function
    analyzeQuickly,
    
    // Specialized analysis functions
    detectModesOnly,
    analyzeChordOnly,
    
    // State
    isAnalyzing,
    lastAnalysis,
    
    // Utilities
    scaleDatabase: scaleDatabase.length, // Return count for debugging
    chordPatterns: chordPatterns.length
  };
};

export default useCompactAnalysis;