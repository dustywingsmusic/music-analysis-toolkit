/**
 * Debug test for suspended chord analysis
 * Run with: npx vitest debug-chord-analysis.test.ts --run
 */

import { describe, it, expect } from 'vitest';
import { findChordMatches } from '@/services/chordLogic';

function analyzeChord(notes: number[], description: string) {
  console.log(`\n=== ${description} ===`);
  console.log(`Notes: ${notes} (MIDI)`);

  const matches = findChordMatches(notes);

  if (matches.length === 0) {
    console.log('No matches found');
    return matches;
  }

  console.log('Top matches:');
  matches.slice(0, 5).forEach((match, i) => {
    console.log(`${i+1}. ${match.chordSymbol} (${match.confidence.toFixed(3)}) - ${match.chordName}`);
    if (match.isPartial) {
      console.log(`   Partial chord, missing: ${match.missingNotes?.join(', ') || 'none'}`);
    }
    if (match.pedagogicalNote) {
      console.log(`   Note: ${match.pedagogicalNote}`);
    }
    if (match.inversion) {
      console.log(`   Inversion: ${match.inversion}`);
    }
  });

  return matches;
}

describe('Debug Suspended Chord Analysis', () => {
  it('should analyze suspended chord constructions', () => {
    console.log('SUSPENDED CHORD ANALYSIS DEBUG');
    console.log('=====================================');

    // Asus4(no5) - A + D only
    const asus4Matches = analyzeChord([69, 74], 'Asus4(no5) - A + D only');

    // Dsus2/A - D suspended 2nd with A in bass
    const dsus2Matches = analyzeChord([57, 62, 64], 'Dsus2/A - D-E-A with A bass');

    // Other test cases for comparison
    const aCsharpDMatches = analyzeChord([69, 73, 74], 'A-C#-D (major 3rd + 4th)');
    const aCDMatches = analyzeChord([69, 72, 74], 'A-C-D (minor 3rd + 4th)');
    const csus2Matches = analyzeChord([60, 62, 67], 'Csus2 complete');
    const csus4Matches = analyzeChord([60, 65, 67], 'Csus4 complete');

    console.log('\n=====================================');

    // Basic validation
    expect(asus4Matches.length).toBeGreaterThan(0);
    expect(dsus2Matches.length).toBeGreaterThan(0);

    // Check if Asus4(no5) is properly identified
    const asus4Match = asus4Matches.find(m =>
      m.chordSymbol.includes('sus4') && m.rootName === 'A'
    );
    expect(asus4Match, 'Should identify A-D as Asus4').toBeTruthy();

    // Check if Dsus2/A is properly identified
    const dsus2InversionMatch = dsus2Matches.find(m =>
      m.rootName === 'D' && m.chordSymbol.includes('sus2') && m.inversion === '/A'
    );
    expect(dsus2InversionMatch, 'Should identify D-E-A with A bass as Dsus2/A').toBeTruthy();
  });
});
