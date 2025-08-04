/**
 * Comprehensive Music Theory Glossary with Contextual Definitions
 * 
 * Provides context-aware explanations for music theory terms based on
 * analysis type and harmonic context.
 */

export interface MusicalExample {
  chords?: string[];
  notes?: string[];
  description: string;
  audioUrl?: string; // Future: audio examples
}

export interface GlossaryTerm {
  id: string;
  term: string;
  aliases: string[]; // Alternative names for the same concept
  quickDefinition: string; // Short tooltip definition
  detailedDefinition: string; // Comprehensive explanation
  contexts: {
    functional?: string; // How it applies in functional analysis
    modal?: string; // How it applies in modal analysis
    chromatic?: string; // How it applies in chromatic analysis
    jazz?: string; // How it applies in jazz harmony
  };
  examples: MusicalExample[];
  relatedTerms: string[]; // IDs of related terms
  prerequisites?: string[]; // Terms that should be understood first
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'harmony' | 'rhythm' | 'melody' | 'form' | 'analysis';
}

export const musicTheoryGlossary: Record<string, GlossaryTerm> = {
  // CADENCES
  'authentic_cadence': {
    id: 'authentic_cadence',
    term: 'Authentic Cadence',
    aliases: ['perfect authentic cadence', 'V-I cadence', 'dominant-tonic cadence'],
    quickDefinition: 'A strong conclusive cadence from dominant (V) to tonic (I)',
    detailedDefinition: 'The most common and decisive cadence in Western tonal music, moving from the dominant chord (V) to the tonic (I). Creates a strong sense of resolution and finality through the leading tone resolving up to the tonic and the chordal seventh (if present) resolving down.',
    contexts: {
      functional: 'Represents the fundamental dominant-tonic relationship that defines tonal hierarchy',
      modal: 'Less common in modal music; when present, may not sound as conclusive due to modal scale degrees',
      chromatic: 'Often elaborated with secondary dominants (V/V-V-I) or chromatic voice leading',
      jazz: 'Extended with 7ths, 9ths, and substitutions while maintaining the V-I motion'
    },
    examples: [
      {
        chords: ['G7', 'C'],
        description: 'V7-I in C major with chordal seventh resolution'
      },
      {
        chords: ['D', 'G'],
        description: 'V-I in G major, simple authentic cadence'
      }
    ],
    relatedTerms: ['dominant', 'tonic', 'leading_tone', 'plagal_cadence'],
    prerequisites: ['dominant', 'tonic'],
    difficulty: 'beginner',
    category: 'harmony'
  },

  'plagal_cadence': {
    id: 'plagal_cadence',
    term: 'Plagal Cadence',
    aliases: ['IV-I cadence', 'amen cadence', 'subdominant-tonic cadence'],
    quickDefinition: 'A gentle cadence from subdominant (IV) to tonic (I)',
    detailedDefinition: 'A softer, less decisive cadence than the authentic cadence, moving from the subdominant (IV) to the tonic (I). Often called the "Amen cadence" due to its frequent use in hymns. Lacks the leading tone motion, creating a more relaxed resolution.',
    contexts: {
      functional: 'Represents the subdominant-tonic relationship, part of the plagal mode tradition',
      modal: 'Common in modal music, especially Mixolydian and Dorian, where it feels more natural',
      chromatic: 'Can be chromatically altered (e.g., iv-I borrowed from minor)',
      jazz: 'Used in gospel and blues progressions, often with extensions'
    },
    examples: [
      {
        chords: ['F', 'C'],
        description: 'IV-I in C major, classic plagal cadence'
      },
      {
        chords: ['Fm', 'C'],
        description: 'iv-I borrowed chord plagal cadence with minor subdominant'
      }
    ],
    relatedTerms: ['subdominant', 'tonic', 'authentic_cadence', 'borrowed_chord'],
    prerequisites: ['subdominant', 'tonic'],
    difficulty: 'beginner',
    category: 'harmony'
  },

  'deceptive_cadence': {
    id: 'deceptive_cadence',
    term: 'Deceptive Cadence',
    aliases: ['interrupted cadence', 'V-vi cadence', 'false cadence'],
    quickDefinition: 'A cadence that avoids the expected tonic resolution, typically V-vi',
    detailedDefinition: 'A cadence that sets up the expectation of an authentic cadence (V-I) but resolves to an unexpected harmony, most commonly vi (relative minor). Creates surprise and prolongs the harmonic journey before final resolution.',
    contexts: {
      functional: 'Delays tonic resolution, extending the phrase and creating harmonic interest',
      modal: 'Less common in modal music due to different tonal expectations',
      chromatic: 'Can involve chromatic voice leading or altered chords for stronger deception',
      jazz: 'Used with substitutions and extensions to create harmonic sophistication'
    },
    examples: [
      {
        chords: ['G7', 'Am'],
        description: 'V7-vi in C major, classic deceptive resolution'
      },
      {
        chords: ['G7', 'F'],
        description: 'V7-IV deceptive cadence, less common variant'
      }
    ],
    relatedTerms: ['dominant', 'tonic', 'authentic_cadence', 'relative_minor'],
    prerequisites: ['authentic_cadence', 'dominant'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  // INTERVALS AND RELATIONSHIPS
  'mediant': {
    id: 'mediant',
    term: 'Mediant',
    aliases: ['third degree', 'mediant relationship'],
    quickDefinition: 'The third degree of a scale, or a chord relationship a third apart',
    detailedDefinition: 'In scale degrees, the mediant is the third note of the scale. In harmonic analysis, mediant relationships refer to chords whose roots are a third apart, sharing two common tones. These relationships create smooth voice leading and are fundamental to tonal harmony.',
    contexts: {
      functional: 'The mediant chord (iii in major) functions as a weak tonic substitute',
      modal: 'Mediant relationships are prominent in modal progressions and folk harmony',
      chromatic: 'Chromatic mediants involve altered thirds and create colorful harmonic progressions',
      jazz: 'Extended mediant harmonies create rich, sophisticated chord progressions'
    },
    examples: [
      {
        chords: ['C', 'Em'],
        description: 'I-iii mediant relationship in C major (up a major third)'
      },
      {
        chords: ['C', 'Eb'],
        description: 'Chromatic mediant relationship (major to minor third)'
      }
    ],
    relatedTerms: ['submediant', 'chromatic_mediant', 'third', 'scale_degree'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  'submediant': {
    id: 'submediant',
    term: 'Submediant',
    aliases: ['sixth degree', 'submediant relationship'],
    quickDefinition: 'The sixth degree of a scale, or a chord relationship a third below',
    detailedDefinition: 'The sixth scale degree, or in harmonic analysis, chords whose roots are a third below (or sixth above). The submediant chord (vi in major, VI in minor) is the relative minor/major and shares two common tones with the tonic, making it an important tonic substitute.',
    contexts: {
      functional: 'The submediant (vi) is a strong tonic substitute and common deceptive resolution',
      modal: 'Important in modal harmony, especially in Aeolian and Dorian progressions',
      chromatic: 'Can be chromatically altered to create different harmonic colors',
      jazz: 'Central to ii-V-I progressions and circle of fifths movement'
    },
    examples: [
      {
        chords: ['C', 'Am'],
        description: 'I-vi submediant relationship in C major (down a major third)'
      },
      {
        chords: ['Am', 'C'],
        description: 'Relative minor to major (vi-I in C major context)'
      }
    ],
    relatedTerms: ['mediant', 'relative_minor', 'tonic_substitute', 'scale_degree'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  'chromatic_mediant': {
    id: 'chromatic_mediant',
    term: 'Chromatic Mediant',
    aliases: ['altered mediant', 'chromatic third relationship'],
    quickDefinition: 'A mediant relationship where one or both chords are chromatically altered',
    detailedDefinition: 'A harmonic relationship between chords whose roots are a third apart, but where one or both chords contain chromatic alterations. These create colorful, unexpected harmonic progressions common in Romantic music and film scores.',
    contexts: {
      functional: 'Expands traditional mediant relationships with chromatic harmony',
      modal: 'Less relevant to pure modal harmony',
      chromatic: 'Central concept in chromatic harmony and advanced tonal music',
      jazz: 'Used in sophisticated reharmonizations and modal interchange'
    },
    examples: [
      {
        chords: ['C', 'E♭'],
        description: 'Major to major chromatic mediant (C major to E♭ major)'
      },
      {
        chords: ['Am', 'C♯'],
        description: 'Minor to major chromatic mediant with sharp motion'
      }
    ],
    relatedTerms: ['mediant', 'chromatic_harmony', 'modal_interchange'],
    prerequisites: ['mediant', 'chromatic_harmony'],
    difficulty: 'advanced',
    category: 'harmony'
  },

  // CHORD FUNCTIONS
  'tonic': {
    id: 'tonic',
    term: 'Tonic',
    aliases: ['I chord', 'home chord', 'tonal center'],
    quickDefinition: 'The home chord that provides stability and resolution',
    detailedDefinition: 'The chord built on the first degree of the scale, serving as the tonal center and point of rest. All other harmonies create tension that seeks resolution back to the tonic. The tonic establishes the key and provides the reference point for all harmonic motion.',
    contexts: {
      functional: 'The primary function providing stability and resolution in tonal music',
      modal: 'The modal tonic may not provide the same sense of finality as tonal music',
      chromatic: 'Can be tonicized through secondary dominants or approached chromatically',
      jazz: 'Often extended with 6ths, 9ths, or altered for color while maintaining tonic function'
    },
    examples: [
      {
        chords: ['C'],
        description: 'C major triad as tonic in C major'
      },
      {
        chords: ['Cmaj7'],
        description: 'Extended tonic with major 7th for jazz color'
      }
    ],
    relatedTerms: ['dominant', 'subdominant', 'key_center', 'resolution'],
    difficulty: 'beginner',
    category: 'harmony'
  },

  'dominant': {
    id: 'dominant',
    term: 'Dominant',
    aliases: ['V chord', 'dominant function', 'leading tone chord'],
    quickDefinition: 'The chord built on the fifth scale degree that creates tension seeking tonic resolution',
    detailedDefinition: 'The chord built on the fifth degree of the scale, containing the leading tone that creates strong pull toward the tonic. The dominant function generates harmonic tension through tritone intervals and unstable scale degrees that demand resolution.',
    contexts: {
      functional: 'Primary tension-creating function, essential to tonal harmony',
      modal: 'May not contain a leading tone in some modes, weakening dominant function',
      chromatic: 'Can be extended, altered, or substituted while maintaining dominant function',
      jazz: 'Central to ii-V-I progressions with extensive extensions and alterations'
    },
    examples: [
      {
        chords: ['G7'],
        description: 'Dominant 7th in C major with tritone (B-F)'
      },
      {
        chords: ['G7alt'],
        description: 'Altered dominant with chromatic tensions'
      }
    ],
    relatedTerms: ['tonic', 'leading_tone', 'tritone', 'resolution'],
    difficulty: 'beginner',
    category: 'harmony'
  },

  'subdominant': {
    id: 'subdominant',
    term: 'Subdominant',
    aliases: ['IV chord', 'predominant', 'subdominant function'],
    quickDefinition: 'The chord built on the fourth scale degree, often leading to dominant',
    detailedDefinition: 'The chord built on the fourth degree of the scale, traditionally functioning as a predominant harmony that prepares the dominant. Creates a sense of departure from tonic and motion toward the dominant-tonic resolution.',
    contexts: {
      functional: 'Predominant function in the T-PD-D-T paradigm, prepares dominant arrival',
      modal: 'Important in modal progressions, especially plagal relationships',
      chromatic: 'Can be borrowed from parallel minor (iv) or chromatically altered',
      jazz: 'Part of ii-V-I progressions and cycle of fifths movement'
    },
    examples: [
      {
        chords: ['F'],
        description: 'IV chord in C major'
      },
      {
        chords: ['Fm'],
        description: 'iv borrowed from C minor for emotional color'
      }
    ],
    relatedTerms: ['dominant', 'tonic', 'predominant', 'plagal_cadence'],
    difficulty: 'beginner',
    category: 'harmony'
  },

  // CHROMATIC HARMONY
  'secondary_dominant': {
    id: 'secondary_dominant',
    term: 'Secondary Dominant',
    aliases: ['V/V', 'applied dominant', 'tonicization'],
    quickDefinition: 'A dominant chord that temporarily tonicizes a chord other than the tonic',
    detailedDefinition: 'A dominant-functioning chord that resolves to a diatonic chord other than the tonic, creating temporary tonicization. Written as V/x where x is the target chord. Introduces chromatic notes to strengthen resolution and add harmonic interest.',
    contexts: {
      functional: 'Expands functional harmony by temporarily establishing new tonal centers',
      modal: 'Conflicts with modal harmony by introducing leading tones',
      chromatic: 'Fundamental building block of chromatic harmony and modulation',
      jazz: 'Essential for creating sophisticated harmonic motion in standards'
    },
    examples: [
      {
        chords: ['D7', 'G'],
        description: 'V/V-V in C major (D7 tonicizes G)'
      },
      {
        chords: ['A7', 'Dm'],
        description: 'V/ii-ii in C major (A7 tonicizes D minor)'
      }
    ],
    relatedTerms: ['dominant', 'tonicization', 'chromatic_harmony', 'leading_tone'],
    prerequisites: ['dominant', 'tonic'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  'borrowed_chord': {
    id: 'borrowed_chord',
    term: 'Borrowed Chord',
    aliases: ['modal interchange', 'mode mixture'],
    quickDefinition: 'A chord borrowed from the parallel major or minor key',
    detailedDefinition: 'A chord taken from the parallel major or minor scale to add harmonic color and emotional depth. Most commonly involves borrowing from the parallel minor in major keys, introducing b6, b7, and b3 scale degrees.',
    contexts: {
      functional: 'Adds emotional color while maintaining functional relationships',
      modal: 'Natural in modal contexts where these scale degrees are diatonic',
      chromatic: 'Key component of chromatic harmony and modal interchange',
      jazz: 'Standard technique for reharmonization and color tones'
    },
    examples: [
      {
        chords: ['Fm'],
        description: 'iv borrowed from C minor into C major'
      },
      {
        chords: ['B♭'],
        description: 'bVII borrowed from C minor (Mixolydian character)'
      }
    ],
    relatedTerms: ['modal_interchange', 'parallel_minor', 'chromatic_harmony'],
    prerequisites: ['parallel_keys', 'major_minor'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  // HARMONIC PROGRESSION AND VOICE LEADING
  'harmonic_progression': {
    id: 'harmonic_progression',
    term: 'Harmonic Progression',
    aliases: ['chord progression', 'harmonic sequence', 'progression'],
    quickDefinition: 'A sequence of chords that creates harmonic movement and direction',
    detailedDefinition: 'A succession of chords arranged to create musical motion and structure. Harmonic progressions form the backbone of tonal music, creating tension and resolution through chord relationships and voice leading.',
    contexts: {
      functional: 'Progressions follow functional logic: T-PD-D-T cycles that create coherent harmonic motion',
      modal: 'Modal progressions emphasize characteristic scale degrees and avoid strong functional pull',
      chromatic: 'Include non-diatonic chords, secondary dominants, and altered harmonies',
      jazz: 'Feature complex chord substitutions, extensions, and sophisticated voice leading'
    },
    examples: [
      {
        chords: ['I', 'vi', 'IV', 'V'],
        description: 'Classic tonal progression with clear functional relationships'
      },
      {
        chords: ['i', 'bVII', 'IV', 'i'],
        description: 'Modal progression emphasizing natural 7th degree'
      }
    ],
    relatedTerms: ['voice_leading', 'chord_function', 'cadence'],
    difficulty: 'beginner',
    category: 'harmony'
  },

  'voice_leading': {
    id: 'voice_leading',
    term: 'Voice Leading',
    aliases: ['part writing', 'voice movement', 'melodic motion'],
    quickDefinition: 'The smooth melodic movement of individual voices in harmonic progressions',
    detailedDefinition: 'The art of moving individual musical lines (voices) smoothly from chord to chord. Good voice leading creates strong connections between harmonies through stepwise motion, common tones, and logical melodic contour.',
    contexts: {
      functional: 'Emphasizes smooth connection between chord tones and resolution of tendency tones',
      modal: 'Focuses on maintaining modal character while creating melodic coherence',
      chromatic: 'Uses chromatic motion and enharmonic relationships for sophisticated connections',
      jazz: 'Incorporates extensions and alterations while maintaining smooth voice connections'
    },
    examples: [
      {
        chords: ['C', 'Am', 'F', 'G'],
        description: 'Stepwise bass motion: C-A-F-G with smooth upper voices'
      }
    ],
    relatedTerms: ['harmonic_progression', 'chord_function', 'melodic_motion'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  'cadential': {
    id: 'cadential',
    term: 'Cadential',
    aliases: ['cadence-related', 'closing', 'conclusive'],
    quickDefinition: 'Relating to or involving a cadence; having a sense of harmonic conclusion',
    detailedDefinition: 'Describing harmonic motion that creates a sense of arrival, conclusion, or punctuation. Cadential harmony involves the approach to and arrival at points of resolution in musical phrases.',
    contexts: {
      functional: 'Cadential motion typically involves dominant-to-tonic resolution patterns',
      modal: 'Modal cadential motion may lack traditional leading tone resolution',
      chromatic: 'Can involve elaborate approaches with secondary dominants or altered chords',
      jazz: 'Often includes sophisticated substitutions and extensions while maintaining cadential function'
    },
    examples: [
      {
        chords: ['V', 'I'],
        description: 'Authentic cadential motion - strongest resolution'
      },
      {
        chords: ['IV', 'I'],
        description: 'Plagal cadential motion - gentler resolution'
      }
    ],
    relatedTerms: ['authentic_cadence', 'plagal_cadence', 'resolution'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  'chord_function': {
    id: 'chord_function',
    term: 'Chord Function',
    aliases: ['harmonic function', 'functional harmony', 'function'],
    quickDefinition: 'The role a chord plays in the harmonic progression and tonal structure',
    detailedDefinition: 'The classification of chords based on their harmonic behavior and role in establishing, maintaining, or resolving tonal relationships. The three primary functions are tonic (stability), predominant (departure), and dominant (tension seeking resolution).',
    contexts: {
      functional: 'Central concept organizing all harmonic analysis through T-PD-D relationships',
      modal: 'Functions may be weakened or altered due to modal scale degrees',
      chromatic: 'Functions can be temporarily shifted through tonicization and modulation',
      jazz: 'Functions are maintained even with complex extensions and substitutions'
    },
    examples: [
      {
        chords: ['I', 'IV', 'V', 'I'],
        description: 'T-PD-D-T functional cycle showing all three primary functions'
      }
    ],
    relatedTerms: ['tonic', 'dominant', 'subdominant', 'harmonic_progression'],
    difficulty: 'intermediate',
    category: 'harmony'
  },

  'resolution': {
    id: 'resolution',
    term: 'Resolution',
    aliases: ['resolve', 'resolving', 'harmonic resolution'],
    quickDefinition: 'The movement from dissonance or tension to consonance or stability',
    detailedDefinition: 'The process by which unstable harmonies or melodic tensions move to more stable ones. Resolution is fundamental to tonal music, creating a sense of completion and satisfaction through the release of harmonic or melodic tension.',
    contexts: {
      functional: 'Resolution follows predictable patterns, especially dominant-to-tonic motion',
      modal: 'Resolution may be less conclusive due to altered scale degrees',
      chromatic: 'Can involve complex chromatic voice leading and delayed resolution',
      jazz: 'Often features sophisticated resolution patterns with extensions and alterations'
    },
    examples: [
      {
        chords: ['G7', 'C'],
        description: 'Dominant 7th resolving to tonic - classic resolution pattern'
      }
    ],
    relatedTerms: ['cadence', 'dominant', 'tension', 'voice_leading'],
    difficulty: 'beginner',
    category: 'harmony'
  },

  // MODAL CONCEPTS
  'modal_characteristic': {
    id: 'modal_characteristic',
    term: 'Modal Characteristic',
    aliases: ['characteristic note', 'modal color tone'],
    quickDefinition: 'The scale degree that gives a mode its distinctive sound',
    detailedDefinition: 'The specific scale degree(s) that distinguish a mode from major or minor scales, creating its unique harmonic and melodic character. These notes are emphasized in modal compositions to establish modal identity.',
    contexts: {
      functional: 'Modal characteristics can conflict with functional expectations',
      modal: 'Central to modal analysis and composition, defining modal identity',
      chromatic: 'Modal characteristics can be treated as chromatic alterations',
      jazz: 'Important for modal jazz improvisation and chord-scale relationships'
    },
    examples: [
      {
        notes: ['B♭'],
        description: 'b7 in Mixolydian mode (the characteristic that distinguishes it from major)'
      },
      {
        notes: ['F♯'],
        description: '#4 in Lydian mode (the characteristic that distinguishes it from major)'
      }
    ],
    relatedTerms: ['mode', 'scale_degree', 'modal_harmony'],
    prerequisites: ['mode', 'scale'],
    difficulty: 'intermediate',
    category: 'melody'
  },

  'mode': {
    id: 'mode',
    term: 'Mode',
    aliases: ['church mode', 'modal scale'],
    quickDefinition: 'A scale with a specific pattern of intervals, creating unique harmonic character',
    detailedDefinition: 'A specific arrangement of whole and half steps that creates a scale with distinctive harmonic and melodic character. The seven church modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian) each have unique characteristics and emotional qualities.',
    contexts: {
      functional: 'Modes can be analyzed functionally but may not follow traditional voice leading',
      modal: 'The foundation of modal harmony and analysis',
      chromatic: 'Modal scales can be sources for borrowed chords and chromaticism',
      jazz: 'Essential for jazz improvisation and modal jazz compositions'
    },
    examples: [
      {
        notes: ['D', 'E', 'F', 'G', 'A', 'B', 'C'],
        description: 'D Dorian mode (natural 6th distinguishes from minor)'
      },
      {
        notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
        description: 'G Mixolydian mode (b7 distinguishes from major)'
      }
    ],
    relatedTerms: ['scale', 'modal_characteristic', 'church_mode'],
    difficulty: 'intermediate',
    category: 'melody'
  }
};

// Helper functions for contextual lookup
export const findTermByAlias = (searchTerm: string): GlossaryTerm | null => {
  const normalizedSearch = searchTerm.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  
  for (const term of Object.values(musicTheoryGlossary)) {
    if (term.term.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim() === normalizedSearch ||
        term.aliases.some(alias => 
          alias.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim() === normalizedSearch
        )) {
      return term;
    }
  }
  return null;
};

export const getContextualDefinition = (
  termId: string, 
  context: 'functional' | 'modal' | 'chromatic' | 'jazz' = 'functional'
): string => {
  const term = musicTheoryGlossary[termId];
  if (!term) return '';
  
  return term.contexts[context] || term.quickDefinition;
};

export const getRelatedTerms = (termId: string): GlossaryTerm[] => {
  const term = musicTheoryGlossary[termId];
  if (!term) return [];
  
  return term.relatedTerms
    .map(id => musicTheoryGlossary[id])
    .filter(Boolean);
};

export const searchGlossary = (query: string): GlossaryTerm[] => {
  const normalizedQuery = query.toLowerCase();
  
  return Object.values(musicTheoryGlossary).filter(term =>
    term.term.toLowerCase().includes(normalizedQuery) ||
    term.aliases.some(alias => alias.toLowerCase().includes(normalizedQuery)) ||
    term.quickDefinition.toLowerCase().includes(normalizedQuery) ||
    term.detailedDefinition.toLowerCase().includes(normalizedQuery)
  );
};