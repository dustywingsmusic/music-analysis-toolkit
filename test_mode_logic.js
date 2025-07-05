// Test script to verify the mode matching logic
// This simulates the logic implemented in the keySuggester.ts

// Mock data structures similar to what's in the app
const NOTES = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

// Simulate major scale modes (from constants/scales.ts)
const majorScaleModes = [
  { name: "Ionian", intervals: [0,2,4,5,7,9,11] },
  { name: "Dorian", intervals: [0,2,3,5,7,9,10] },
  { name: "Phrygian", intervals: [0,1,3,5,7,8,10] },
  { name: "Lydian", intervals: [0,2,4,6,7,9,11] },
  { name: "Mixolydian", intervals: [0,2,4,5,7,9,10] },
  { name: "Aeolian", intervals: [0,2,3,5,7,8,10] },
  { name: "Locrian", intervals: [0,1,3,5,6,8,10] }
];

// Generate all processed scales for major scale modes
function generateProcessedScales() {
  const processedScales = [];
  const PARENT_KEY_INDICES = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6];
  
  PARENT_KEY_INDICES.forEach((parentKeyIndex, keyRowIndex) => {
    majorScaleModes.forEach((mode, modeIndex) => {
      const modeRootPitch = (parentKeyIndex + (modeIndex * 2)) % 12; // Simplified calculation
      const pitchClasses = new Set(mode.intervals.map(i => (modeRootPitch + i) % 12));
      
      processedScales.push({
        id: `major-scale-modes-${keyRowIndex}-${modeIndex}`,
        pitchClasses: pitchClasses,
        rootNote: modeRootPitch,
        name: mode.name
      });
    });
  });
  
  return processedScales;
}

// Test the new logic
function testModeMatching() {
  console.log('=== Testing Mode Matching Logic ===\n');
  
  // Test case: C, D, E, F#, G, A, B (G major scale and its modes)
  const testPitchClasses = new Set([0, 2, 4, 6, 7, 9, 11]); // C, D, E, F#, G, A, B
  console.log('Test input notes:', Array.from(testPitchClasses).map(n => NOTES[n]).join(', '));
  console.log('Pitch classes:', Array.from(testPitchClasses).sort().join(', '));
  
  const allScales = generateProcessedScales();
  
  // Find all scales that contain all the played notes (exact matches)
  const exactMatches = allScales.filter((scale) => {
    // Check if all played notes are contained in this scale
    for (const playedNote of testPitchClasses) {
      if (!scale.pitchClasses.has(playedNote)) {
        return false;
      }
    }
    return true;
  });
  
  console.log(`\nFound ${exactMatches.length} exact matches:`);
  
  // Group exact matches by their pitch class sets
  const scaleGroups = new Map();
  exactMatches.forEach((scale) => {
    const pitchClassKey = Array.from(scale.pitchClasses).sort().join(',');
    if (!scaleGroups.has(pitchClassKey)) {
      scaleGroups.set(pitchClassKey, []);
    }
    scaleGroups.get(pitchClassKey).push(scale);
  });
  
  console.log(`\nGrouped into ${scaleGroups.size} scale groups:`);
  
  scaleGroups.forEach((scales, pitchClassKey) => {
    console.log(`\nPitch class group: [${pitchClassKey}]`);
    console.log('Modes in this group:');
    scales.forEach(scale => {
      const rootNoteName = NOTES[scale.rootNote];
      console.log(`  - ${rootNoteName} ${scale.name}`);
    });
  });
  
  // Expected result: Should show all 7 modes of the G major scale
  console.log('\n=== Expected Results ===');
  console.log('Should find all modes of G major scale:');
  console.log('- G Ionian (G major)');
  console.log('- A Dorian');
  console.log('- B Phrygian');
  console.log('- C Lydian');
  console.log('- D Mixolydian');
  console.log('- E Aeolian (E minor)');
  console.log('- F# Locrian');
}

testModeMatching();