// Test script to reproduce the mode matching issue
// Example: C, D, E, F#, G, A, B should show all possible modes

const testNotes = [0, 2, 4, 6, 7, 9, 11]; // C, D, E, F#, G, A, B
const testPitchClasses = new Set(testNotes);

console.log('Testing mode matching for notes:', testNotes.map(n => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][n]).join(', '));
console.log('Pitch classes set:', testPitchClasses);

// This represents the G major scale and all its modes:
// G Ionian (G major): G, A, B, C, D, E, F#
// A Dorian: A, B, C, D, E, F#, G  
// B Phrygian: B, C, D, E, F#, G, A
// C Lydian: C, D, E, F#, G, A, B
// D Mixolydian: D, E, F#, G, A, B, C
// E Aeolian (E minor): E, F#, G, A, B, C, D
// F# Locrian: F#, G, A, B, C, D, E

console.log('\nExpected modes that should match:');
console.log('- G Ionian (G major)');
console.log('- A Dorian'); 
console.log('- B Phrygian');
console.log('- C Lydian');
console.log('- D Mixolydian');
console.log('- E Aeolian (E minor)');
console.log('- F# Locrian');

console.log('\nAll these modes contain the same pitch classes but with different root notes.');