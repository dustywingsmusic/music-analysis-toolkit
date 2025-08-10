/**
 * Test script for chord progression analysis
 * 
 * @deprecated This is a development/testing helper script, not used in production.
 * @warning This file is not imported by runtime code - dev/test tool only.
 * 
 * This can be run in the browser console to verify functionality.
 * Status: DEV TOOL - Used in unit testing context only.
 */

import { analyzeChordProgressionLocally } from '../localChordProgressionAnalysis';

export async function testChordProgressionAnalysis() {
  console.log('🧪 Testing Enhanced Chord Progression Analysis...');

  const testProgressions = [
    'Am F C G',           // vi-IV-I-V in C Major
    'Dm G Em Am',         // Modal progression
    'Cmaj7 Am7 Dm7 G7',   // Jazz ii-V-I
    'C F G C',            // Simple I-IV-V-I
    'Em C G D'            // Another common progression
  ];

  for (const progression of testProgressions) {
    try {
      console.log(`\n🎼 Testing progression: "${progression}"`);

      const startTime = performance.now();
      const result = await analyzeChordProgressionLocally(progression);
      const endTime = performance.now();

      console.log(`✅ Analysis completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`🎯 Key Center: ${result.localAnalysis.keyCenter}`);
      console.log(`🎵 Overall Mode: ${result.localAnalysis.overallMode}`);
      console.log(`🎪 Confidence: ${(result.localAnalysis.confidence * 100).toFixed(1)}%`);

      // Log chord-by-chord analysis
      console.log('🎹 Chord Analysis:');
      result.localAnalysis.chords.forEach((chord, index) => {
        console.log(`  ${index + 1}. ${chord.chordSymbol} (${chord.romanNumeral}) - ${chord.function}${chord.isModal ? ' [MODAL]' : ''}`);
      });

      // Log modal elements if any
      if (result.localAnalysis.modalChords.length > 0) {
        console.log(`🌈 Modal Elements: ${result.localAnalysis.modalChords.map(c => c.chordSymbol).join(', ')}`);
      }

      console.log(`📝 Modal Interchange: ${result.localAnalysis.modalInterchange}`);

    } catch (error) {
      console.error(`❌ Error analyzing "${progression}":`, error);
    }
  }

  console.log('\n🎉 Chord progression analysis test complete!');
}

// Export for use in browser console
(window as any).testChordProgressionAnalysis = testChordProgressionAnalysis;
