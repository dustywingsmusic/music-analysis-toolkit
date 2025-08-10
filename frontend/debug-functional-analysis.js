// Debug script to test the problematic chord progression
// Run with: node debug-functional-analysis.js

// Import the functional harmony analyzer (simulated for debugging)
const chordProgression = ['A7/G', 'G7', 'G7+', 'A7', 'D/F#'];

console.log('Testing problematic chord progression:', chordProgression.join(' - '));

// Simulate the analysis process step by step
console.log('\n=== FUNCTIONAL HARMONY ANALYSIS DEBUG ===');

// Step 1: Parse chord symbols
chordProgression.forEach((chord, index) => {
  console.log(`\nChord ${index + 1}: ${chord}`);

  // Extract root note
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  const root = rootMatch ? rootMatch[1] : 'Unknown';
  console.log(`  Root: ${root}`);

  // Extract bass note if slash chord
  const slashMatch = chord.match(/\/([A-G][#b]?)$/);
  const bassNote = slashMatch ? slashMatch[1] : root;
  console.log(`  Bass: ${bassNote}`);

  // Extract chord quality
  let chordQuality = chord.replace(rootMatch ? rootMatch[0] : '', '');
  if (slashMatch) {
    chordQuality = chordQuality.replace(slashMatch[0], '');
  }
  console.log(`  Quality: ${chordQuality || 'major'}`);

  // Determine if it's a dominant 7th
  const isDom7 = chordQuality.includes('7') && !chordQuality.includes('maj7') && !chordQuality.includes('m7');
  console.log(`  Is Dominant 7th: ${isDom7}`);
});

// Step 2: Analyze in key context
console.log('\n=== KEY ANALYSIS ===');
console.log('Assuming D major key (2 sharps: F#, C#)');

const dMajorScale = ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'];
console.log('D Major scale:', dMajorScale.join(' - '));

const noteToInterval = {
  'D': 0, 'E': 2, 'F#': 4, 'G': 5, 'A': 7, 'B': 9, 'C#': 11
};

chordProgression.forEach((chord, index) => {
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  const root = rootMatch ? rootMatch[1] : '';
  const interval = noteToInterval[root];

  console.log(`\n${chord}: Root ${root} is interval ${interval} in D major`);

  // Determine Roman numeral
  let romanNumeral = '?';
  const quality = chord.includes('7') && !chord.includes('maj7') && !chord.includes('m7') ? 'dominant7' : 'major';

  if (root === 'A' && quality === 'dominant7') {
    // A7 in D major - this should be V7/ii (dominant of ii)
    // ii in D major is Em, so A7 is the dominant of Em
    romanNumeral = 'V7/ii';
    console.log(`  -> ${romanNumeral} (dominant of ii)`);
  } else if (root === 'G' && quality === 'dominant7') {
    // G7 in D major - this is bVII7 (borrowed from parallel minor)
    romanNumeral = 'bVII7';
    console.log(`  -> ${romanNumeral} (borrowed chord)`);
  } else if (root === 'D') {
    romanNumeral = 'I';
    if (chord.includes('/F#')) {
      romanNumeral += '⁶'; // First inversion
    }
    console.log(`  -> ${romanNumeral}`);
  } else {
    console.log(`  -> Need to implement analysis for ${root}`);
  }
});

console.log('\n=== EXPECTED OUTPUT ===');
console.log('A7/G - G7 - G7+ - A7 - D/F♯');
console.log('Should be: V⁶₅/ii - bVII7 - bVII7+ - V7/ii - I⁶');
console.log('NOT: Chr0² - bVII - bVII - Chr0 - IV');

console.log('\n=== ISSUES TO FIX ===');
console.log('1. "Chr0" placeholder should be proper secondary dominant notation (V7/ii)');
console.log('2. Figured bass notation missing (⁶₅ for slash chords)');
console.log('3. Scale information errors need correction');
console.log('4. Confidence logic defaulting to chromatic instead of functional');
