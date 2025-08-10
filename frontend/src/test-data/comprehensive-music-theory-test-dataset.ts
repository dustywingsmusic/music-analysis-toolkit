/**
 * Comprehensive Test Dataset for Music Theory Analysis Framework
 *
 * This dataset provides exhaustive test cases for validating:
 * - Functional harmony analysis (Roman numerals, chord functions, cadences)
 * - Modal analysis (parent key + local tonic approach)
 * - Chromatic harmony (secondary dominants, borrowed chords)
 * - Multiple interpretations with confidence scoring
 *
 * Each test case includes expected outputs for all analytical approaches
 * to ensure the framework handles complex musical scenarios accurately.
 */

export interface MusicTheoryTestCase {
  input: string;
  parentKey?: string;
  expectedPrimary: 'functional' | 'modal' | 'chromatic';
  expectedRomanNumerals: string[];
  expectedChromaticElements?: {
    secondaryDominants?: string[];
    borrowedChords?: string[];
    chromaticMediants?: string[];
  };
  confidence: [number, number]; // [min, max] range
  description: string;
  category: string;
  alternativeInterpretations?: {
    approach: 'functional' | 'modal' | 'chromatic';
    romanNumerals: string[];
    confidence: [number, number];
    explanation: string;
  }[];
}

export const comprehensiveMusicTheoryTestDataset: MusicTheoryTestCase[] = [
  // =================
  // BASIC FUNCTIONAL PROGRESSIONS
  // =================
  {
    input: "C F G C",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "IV", "V", "I"],
    confidence: [0.9, 1.0],
    description: "Classic I-IV-V-I progression in C major - fundamental tonal progression",
    category: "Basic Functional"
  },
  {
    input: "A D E A",
    parentKey: "A major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "IV", "V", "I"],
    confidence: [0.9, 1.0],
    description: "I-IV-V-I in A major - tests transposition of basic functional harmony",
    category: "Basic Functional"
  },
  {
    input: "Am Dm Em Am",
    parentKey: "A minor",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["i", "iv", "v", "i"],
    confidence: [0.85, 0.95],
    description: "i-iv-v-i in A minor - minor key functional harmony",
    category: "Basic Functional"
  },
  {
    input: "Am Dm E Am",
    parentKey: "A minor",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["i", "iv", "V", "i"],
    confidence: [0.9, 1.0],
    description: "i-iv-V-i with raised leading tone - standard minor key cadence",
    category: "Basic Functional"
  },
  {
    input: "Dm G C F",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["ii", "V", "I", "IV"],
    confidence: [0.85, 0.95],
    description: "ii-V-I-IV progression - jazz-influenced tonal harmony",
    category: "Basic Functional"
  },
  {
    input: "Em A D G",
    parentKey: "D major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["ii", "V", "I", "IV"],
    confidence: [0.85, 0.95],
    description: "ii-V-I-IV in D major - tests key context dependency",
    category: "Basic Functional"
  },
  {
    input: "F C Dm G",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["IV", "I", "ii", "V"],
    confidence: [0.8, 0.9],
    description: "IV-I-ii-V - plagal motion followed by dominant preparation",
    category: "Basic Functional"
  },
  {
    input: "C Am F G",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "vi", "IV", "V"],
    confidence: [0.9, 1.0],
    description: "I-vi-IV-V progression - classic pop/rock harmony",
    category: "Basic Functional"
  },

  // Circle of Fifths Progressions
  {
    input: "C F Bb Eb Ab",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "IV", "bVII", "bIII", "bVI"],
    expectedChromaticElements: {
      borrowedChords: ["bVII", "bIII", "bVI"]
    },
    confidence: [0.7, 0.85],
    description: "Circle of fifths with borrowed chords from parallel minor",
    category: "Basic Functional"
  },
  {
    input: "Am Dm G C F",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["vi", "ii", "V", "I", "IV"],
    confidence: [0.85, 0.95],
    description: "Circle of fifths progression in major key context",
    category: "Basic Functional"
  },

  // Cadence Types
  {
    input: "F G C",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["IV", "V", "I"],
    confidence: [0.9, 1.0],
    description: "Authentic cadence - V-I preceded by subdominant",
    category: "Cadences"
  },
  {
    input: "F C",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["IV", "I"],
    confidence: [0.85, 0.95],
    description: "Plagal cadence - IV-I 'Amen' cadence",
    category: "Cadences"
  },
  {
    input: "G Am",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["V", "vi"],
    confidence: [0.8, 0.9],
    description: "Deceptive cadence - V-vi instead of expected V-I",
    category: "Cadences"
  },
  {
    input: "C G",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "V"],
    confidence: [0.8, 0.9],
    description: "Half cadence - ends on dominant, creates tension",
    category: "Cadences"
  },

  // =================
  // MODAL PROGRESSIONS
  // =================
  {
    input: "G F C G",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["I", "bVII", "IV", "I"],
    confidence: [0.8, 0.9],
    description: "Mixolydian progression - characteristic bVII chord",
    category: "Modal - No Parent Key",
    alternativeInterpretations: [{
      approach: "functional",
      romanNumerals: ["V", "IV", "I", "V"],
      confidence: [0.6, 0.75],
      explanation: "Could be V-IV-I-V in C major, but lacks strong tonal center on C"
    }]
  },
  {
    input: "G F C G",
    parentKey: "C major",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["V", "IV", "I", "V"],
    confidence: [0.7, 0.85],
    description: "G Mixolydian in C major context - modal analysis preferred due to G emphasis",
    category: "Modal - With Parent Key",
    alternativeInterpretations: [{
      approach: "functional",
      romanNumerals: ["V", "IV", "I", "V"],
      confidence: [0.6, 0.75],
      explanation: "Functional interpretation in C major, but G acts as local tonic"
    }]
  },
  {
    input: "D C G D",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["I", "bVII", "IV", "I"],
    confidence: [0.8, 0.9],
    description: "D Mixolydian - natural 7th creates modal character",
    category: "Modal - No Parent Key"
  },
  {
    input: "Am Bb C Am",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["i", "bII", "bIII", "i"],
    confidence: [0.75, 0.85],
    description: "A Phrygian - characteristic bII chord (Neapolitan relationship)",
    category: "Modal - No Parent Key"
  },
  {
    input: "Em F# G Em",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["i", "II", "bIII", "i"],
    confidence: [0.8, 0.9],
    description: "E Dorian - raised 6th degree creates major II chord",
    category: "Modal - No Parent Key"
  },
  {
    input: "F G Am Bb F",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["I", "II", "iii", "IV", "I"],
    confidence: [0.8, 0.9],
    description: "F Lydian - characteristic raised 4th (II chord)",
    category: "Modal - No Parent Key"
  },
  {
    input: "Bm A G Bm",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["i", "bVII", "bVI", "i"],
    confidence: [0.8, 0.9],
    description: "B Aeolian (natural minor) - bVII and bVI chords",
    category: "Modal - No Parent Key"
  },
  {
    input: "C Db Eb C",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["I", "bII", "bIII", "I"],
    confidence: [0.75, 0.85],
    description: "C Phrygian - rare mode with distinctive bII interval",
    category: "Modal - No Parent Key"
  },

  // Modal with Parent Key Context
  {
    input: "Em F# G Em",
    parentKey: "G major",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["vi", "VII", "I", "vi"],
    confidence: [0.8, 0.9],
    description: "E Dorian within G major - parent key context confirms modal center on E",
    category: "Modal - With Parent Key"
  },
  {
    input: "Am Bb C Am",
    parentKey: "F major",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["iii", "IV", "V", "iii"],
    confidence: [0.75, 0.85],
    description: "A Phrygian in F major context - modal emphasis on iii chord",
    category: "Modal - With Parent Key"
  },

  // =================
  // CHROMATIC HARMONY
  // =================
  {
    input: "C E7 Am F G C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "V/vi", "vi", "IV", "V", "I"],
    expectedChromaticElements: {
      secondaryDominants: ["V/vi"]
    },
    confidence: [0.85, 0.95],
    description: "Secondary dominant V/vi - tonicizes vi chord",
    category: "Secondary Dominants"
  },
  {
    input: "C A7 Dm G C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "V/ii", "ii", "V", "I"],
    expectedChromaticElements: {
      secondaryDominants: ["V/ii"]
    },
    confidence: [0.85, 0.95],
    description: "V/ii secondary dominant - temporarily tonicizes ii chord",
    category: "Secondary Dominants"
  },
  {
    input: "F B7 Em Am Dm G C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["IV", "V/iii", "iii", "vi", "ii", "V", "I"],
    expectedChromaticElements: {
      secondaryDominants: ["V/iii"]
    },
    confidence: [0.8, 0.9],
    description: "V/iii in longer progression - chromatic harmony within functional context",
    category: "Secondary Dominants"
  },
  {
    input: "C D7 G C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "V/V", "V", "I"],
    expectedChromaticElements: {
      secondaryDominants: ["V/V"]
    },
    confidence: [0.9, 1.0],
    description: "Classic V/V (five of five) - secondary dominant of dominant",
    category: "Secondary Dominants"
  },

  // Borrowed Chords
  {
    input: "C F Ab G C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "IV", "bVI", "V", "I"],
    expectedChromaticElements: {
      borrowedChords: ["bVI"]
    },
    confidence: [0.8, 0.9],
    description: "bVI borrowed from parallel minor - common in pop music",
    category: "Borrowed Chords"
  },
  {
    input: "C Fm G C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "iv", "V", "I"],
    expectedChromaticElements: {
      borrowedChords: ["iv"]
    },
    confidence: [0.85, 0.95],
    description: "Minor iv chord borrowed from parallel minor",
    category: "Borrowed Chords"
  },
  {
    input: "C Bb F C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "bVII", "IV", "I"],
    expectedChromaticElements: {
      borrowedChords: ["bVII"]
    },
    confidence: [0.8, 0.9],
    description: "bVII borrowed chord - common in rock progressions",
    category: "Borrowed Chords"
  },
  {
    input: "Am C F Fm C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["vi", "I", "IV", "iv", "I"],
    expectedChromaticElements: {
      borrowedChords: ["iv"]
    },
    confidence: [0.8, 0.9],
    description: "Borrowed iv chord in context - creates poignant harmonic color",
    category: "Borrowed Chords"
  },

  // Chromatic Mediants
  {
    input: "C E F C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "III", "IV", "I"],
    expectedChromaticElements: {
      chromaticMediants: ["III"]
    },
    confidence: [0.75, 0.85],
    description: "Chromatic mediant III - dramatic harmonic shift",
    category: "Chromatic Mediants"
  },
  {
    input: "C Ab F C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "bVI", "IV", "I"],
    expectedChromaticElements: {
      chromaticMediants: ["bVI"]
    },
    confidence: [0.8, 0.9],
    description: "bVI as chromatic mediant - romantic harmonic progression",
    category: "Chromatic Mediants"
  },

  // =================
  // COMPLEX JAZZ HARMONIES
  // =================
  {
    input: "Cmaj7 A7 Dm7 G7 Em7 A7 Dm7 G7 Cmaj7",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["Imaj7", "V7/ii", "ii7", "V7", "iii7", "V7/ii", "ii7", "V7", "Imaj7"],
    expectedChromaticElements: {
      secondaryDominants: ["V7/ii", "V7/ii"]
    },
    confidence: [0.85, 0.95],
    description: "Jazz ii-V-I with secondary dominants and 7th chords",
    category: "Jazz Harmony"
  },
  {
    input: "Fmaj7 Bm7b5 E7 Am7 D7 Dm7 G7 Cmaj7",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["IVmaj7", "viiø7/vi", "V7/vi", "vi7", "V7/ii", "ii7", "V7", "Imaj7"],
    expectedChromaticElements: {
      secondaryDominants: ["V7/vi", "V7/ii"]
    },
    confidence: [0.8, 0.9],
    description: "Complex jazz progression with multiple secondary dominants",
    category: "Jazz Harmony"
  },

  // =================
  // AMBIGUOUS PROGRESSIONS
  // =================
  {
    input: "Am F C G",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["vi", "IV", "I", "V"],
    confidence: [0.6, 0.75],
    description: "Ambiguous progression - could be vi-IV-I-V in C or i-VI-III-VII in Am",
    category: "Ambiguous Cases",
    alternativeInterpretations: [
      {
        approach: "modal",
        romanNumerals: ["i", "VI", "III", "VII"],
        confidence: [0.5, 0.7],
        explanation: "A Aeolian interpretation with characteristic bVI, bIII, bVII chords"
      },
      {
        approach: "functional",
        romanNumerals: ["vi", "IV", "I", "V"],
        confidence: [0.6, 0.75],
        explanation: "C major functional harmony starting on vi"
      }
    ]
  },
  {
    input: "Em C G D",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["iii", "I", "V", "II"],
    confidence: [0.5, 0.7],
    description: "Highly ambiguous - could be in C major, G major, or E modal",
    category: "Ambiguous Cases",
    alternativeInterpretations: [
      {
        approach: "functional",
        romanNumerals: ["vi", "IV", "I", "V"],
        confidence: [0.6, 0.75],
        explanation: "G major: vi-IV-I-V progression"
      },
      {
        approach: "modal",
        romanNumerals: ["i", "VI", "III", "VII"],
        confidence: [0.4, 0.6],
        explanation: "E Aeolian modal interpretation"
      }
    ]
  },
  {
    input: "F G Am",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["IV", "V", "vi"],
    confidence: [0.6, 0.75],
    description: "Incomplete progression - ambiguous without resolution",
    category: "Ambiguous Cases",
    alternativeInterpretations: [{
      approach: "modal",
      romanNumerals: ["VI", "VII", "i"],
      confidence: [0.5, 0.65],
      explanation: "Could be A Aeolian with bVI-bVII-i progression"
    }]
  },

  // Parent Key Context Changes Analysis
  {
    input: "G F C G",
    parentKey: "G major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "bVII", "IV", "I"],
    expectedChromaticElements: {
      borrowedChords: ["bVII"]
    },
    confidence: [0.7, 0.85],
    description: "Same progression as modal example, but parent key changes analysis to functional with borrowed chord",
    category: "Context-Dependent"
  },
  {
    input: "Am Bb C Am",
    parentKey: "C major",
    expectedPrimary: "modal",
    expectedRomanNumerals: ["vi", "bVII", "I", "vi"],
    confidence: [0.7, 0.85],
    description: "Parent key context confirms this as modal rather than functional",
    category: "Context-Dependent"
  },

  // =================
  // EDGE CASES
  // =================
  {
    input: "C",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I"],
    confidence: [0.8, 0.9],
    description: "Single chord - limited analytical context",
    category: "Edge Cases"
  },
  {
    input: "C Db C",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "bII", "I"],
    expectedChromaticElements: {
      borrowedChords: ["bII"]
    },
    confidence: [0.7, 0.8],
    description: "Neapolitan chord usage - rare but distinctive harmonic move",
    category: "Edge Cases"
  },
  {
    input: "C F# G C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "#IV", "V", "I"],
    expectedChromaticElements: {
      chromaticMediants: ["#IV"]
    },
    confidence: [0.6, 0.75],
    description: "Augmented fourth relationship - highly chromatic harmonic motion",
    category: "Edge Cases"
  },
  {
    input: "Cmaj7 Fmaj7 Gmaj7 Cmaj7",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["Imaj7", "IVmaj7", "Vmaj7", "Imaj7"],
    confidence: [0.85, 0.95],
    description: "All major 7th chords - tests chord quality recognition",
    category: "Chord Quality"
  },
  {
    input: "Cm Fm Gm Cm",
    parentKey: "C minor",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["i", "iv", "v", "i"],
    confidence: [0.85, 0.95],
    description: "All minor chords in minor key - natural minor harmony",
    category: "Chord Quality"
  },

  // =================
  // ENHARMONIC EQUIVALENTS
  // =================
  {
    input: "C F Bb C",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "IV", "bVII", "I"],
    expectedChromaticElements: {
      borrowedChords: ["bVII"]
    },
    confidence: [0.8, 0.9],
    description: "Tests enharmonic spelling - Bb vs A# in context",
    category: "Enharmonic"
  },
  {
    input: "C Gb F C",
    parentKey: "C major",
    expectedPrimary: "chromatic",
    expectedRomanNumerals: ["I", "bV", "IV", "I"],
    expectedChromaticElements: {
      chromaticMediants: ["bV"]
    },
    confidence: [0.6, 0.75],
    description: "Tritone substitution harmony - advanced chromatic relationship",
    category: "Enharmonic"
  },

  // =================
  // MODULATION SCENARIOS
  // =================
  {
    input: "C F G Am Dm Em F G C",
    parentKey: "C major",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["I", "IV", "V", "vi", "ii", "iii", "IV", "V", "I"],
    confidence: [0.85, 0.95],
    description: "Extended functional progression - tests sustained tonality",
    category: "Extended Progressions"
  },
  {
    input: "C Am F G C G D G",
    expectedPrimary: "functional",
    expectedRomanNumerals: ["IV", "ii", "bVII", "I", "IV", "I", "V", "I"],
    confidence: [0.7, 0.85],
    description: "Apparent modulation from C major to G major - tests pivot analysis",
    category: "Modulation",
    alternativeInterpretations: [{
      approach: "functional",
      romanNumerals: ["I", "vi", "IV", "V", "I", "V", "V/V", "V"],
      confidence: [0.6, 0.75],
      explanation: "Could remain in C major with tonicization of G"
    }]
  }
];

/**
 * Helper function to get test cases by category
 */
export function getTestCasesByCategory(category: string): MusicTheoryTestCase[] {
  return comprehensiveMusicTheoryTestDataset.filter(testCase =>
    testCase.category === category
  );
}

/**
 * Helper function to get test cases by expected primary analysis approach
 */
export function getTestCasesByPrimaryApproach(approach: 'functional' | 'modal' | 'chromatic'): MusicTheoryTestCase[] {
  return comprehensiveMusicTheoryTestDataset.filter(testCase =>
    testCase.expectedPrimary === approach
  );
}

/**
 * Helper function to get test cases with chromatic elements
 */
export function getTestCasesWithChromaticElements(): MusicTheoryTestCase[] {
  return comprehensiveMusicTheoryTestDataset.filter(testCase =>
    testCase.expectedChromaticElements &&
    (testCase.expectedChromaticElements.secondaryDominants?.length ||
     testCase.expectedChromaticElements.borrowedChords?.length ||
     testCase.expectedChromaticElements.chromaticMediants?.length)
  );
}

/**
 * Helper function to get ambiguous test cases (those with alternative interpretations)
 */
export function getAmbiguousTestCases(): MusicTheoryTestCase[] {
  return comprehensiveMusicTheoryTestDataset.filter(testCase =>
    testCase.alternativeInterpretations && testCase.alternativeInterpretations.length > 0
  );
}

/**
 * Test case categories for organized testing
 */
export const TEST_CATEGORIES = [
  'Basic Functional',
  'Cadences',
  'Modal - No Parent Key',
  'Modal - With Parent Key',
  'Secondary Dominants',
  'Borrowed Chords',
  'Chromatic Mediants',
  'Jazz Harmony',
  'Ambiguous Cases',
  'Context-Dependent',
  'Edge Cases',
  'Chord Quality',
  'Enharmonic',
  'Extended Progressions',
  'Modulation'
] as const;

export type TestCategory = typeof TEST_CATEGORIES[number];
