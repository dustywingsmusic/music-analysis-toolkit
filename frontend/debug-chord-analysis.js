// Simple script to debug chord analysis
const { findChordMatches } = require('./src/services/chordLogic.ts');

function analyzeChord(notes, description) {
  console.log(`\n=== ${description} ===`);
  console.log(`Notes: ${notes} (MIDI)`);
  
  const matches = findChordMatches(notes);
  
  if (matches.length === 0) {
    console.log('No matches found');
    return;
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
  });
}

// Test cases from user query
console.log('SUSPENDED CHORD ANALYSIS DEBUG');
console.log('=====================================');

// Asus4(no5) - A + D only
analyzeChord([69, 74], 'Asus4(no5) - A + D only');

// Dsus2/A - D suspended 2nd with A in bass
analyzeChord([57, 62, 64], 'Dsus2/A - D-E-A with A bass');

// Other test cases for comparison
analyzeChord([69, 73, 74], 'A-C#-D (major 3rd + 4th)');
analyzeChord([69, 72, 74], 'A-C-D (minor 3rd + 4th)');
analyzeChord([60, 62, 67], 'Csus2 complete');
analyzeChord([60, 65, 67], 'Csus4 complete');

console.log('\n=====================================');