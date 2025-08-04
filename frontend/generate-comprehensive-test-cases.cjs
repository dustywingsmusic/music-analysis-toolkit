/**
 * Comprehensive Modal Test Case Generator
 *
 * Algorithmically generates ALL possible modal test scenarios
 * to ensure complete coverage without manual test case definition.
 */

const fs = require('fs');

// --- Pitch-class helpers for correct enharmonic handling ---
const UNICODE_TO_ASCII = (s) => s.replace(/♭/g, 'b').replace(/♯/g, '#');

const NOTE_TO_INDEX = {
    'C': 0, 'B#': 0,
    'C#': 1, 'Db': 1,
    'D': 2,
    'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'E#': 5, 'F': 5,
    'F#': 6, 'Gb': 6,
    'G': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,
    'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11
};

const INDEX_TO_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INDEX_TO_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Conventional major-key spellings for parent keys (avoid A# major, etc.)
const MAJOR_KEY_NAME_BY_INDEX = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const FLAT_MAJOR_ROOTS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']);

function parseRootName(s) {
    const ascii = UNICODE_TO_ASCII(s);
    const m = ascii.match(/^[A-G](?:#|b)?/);
    return m ? m[0] : ascii;
}

function prefersFlatsFromRoot(root) {
    const r = parseRootName(root);
    if (r.includes('b')) return true;
    if (r.includes('#')) return false;
    const idx = NOTE_TO_INDEX[r];
    if (idx == null) return false;
    return FLAT_MAJOR_ROOTS.has(MAJOR_KEY_NAME_BY_INDEX[idx]);
}

// Core musical data for systematic generation
const ROOTS = MAJOR_KEY_NAME_BY_INDEX.slice();
const MAJOR_KEYS = ROOTS.map(root => `${root} major`);
const MINOR_KEYS = ROOTS.map(root => `${root} minor`);

const MODES = [
    {name: 'Ionian', degree: 1, characteristic: 'major_seventh'},
    {name: 'Dorian', degree: 2, characteristic: 'minor_with_major_sixth'},
    {name: 'Phrygian', degree: 3, characteristic: 'minor_with_flat_second'},
    {name: 'Lydian', degree: 4, characteristic: 'major_with_sharp_fourth'},
    {name: 'Mixolydian', degree: 5, characteristic: 'major_with_flat_seventh'},
    {name: 'Aeolian', degree: 6, characteristic: 'natural_minor'},
    {name: 'Locrian', degree: 7, characteristic: 'diminished_with_flat_second'}
];

class ComprehensiveTestGenerator {
    constructor() {
        this.testCases = [];
        this.caseId = 1;
    }

    /**
     * Generate ALL possible modal test scenarios systematically
     */
    generateAllTestCases() {
        console.log('🔄 Generating comprehensive modal test cases...');

        this.testCases = [];
        this.caseId = 1;

        // 1. Generate characteristic modal progressions for every mode and root
        this.generateModalCharacteristicCases();

        // 2. Generate clear functional progressions in every key
        this.generateFunctionalCases();

        // 3. Generate ambiguous cases (modal vs functional boundaries)
        this.generateAmbiguousCases();

        // 4. Generate edge cases and error conditions
        this.generateEdgeCases();

        // 5. Generate cross-modal comparison cases
        this.generateCrossModalCases();

        console.log(`✅ Generated ${this.testCases.length} comprehensive test cases`);
        return this.testCases;
    }

    /**
     * 1. MODAL CHARACTERISTIC CASES
     * Generate the defining progressions for each mode in every key
     */
    generateModalCharacteristicCases() {
        console.log('  Generating modal characteristic cases...');

        for (const root of ROOTS) {
            for (const mode of MODES) {
                const parentKey = this.getParentKey(root, mode.name);

                // Generate characteristic progressions for this mode
                const progressions = this.getCharacteristicProgressions(root, mode.name, parentKey);

                // Add tagged variants for each progression
                for (const progression of progressions) {
                    let category = 'modal_characteristic';
                    let expectedModal = true;
                    if (progression.variant === 'seventh') category = 'modal_seventh_variant';
                    else if (progression.variant === 'vamp') category = 'modal_vamp';
                    else if (progression.variant === 'foil') { category = 'modal_foil'; expectedModal = false; }

                    this.addTestCase({
                        chords: progression.chords,
                        parentKey,
                        expectedModal,
                        expectedMode: expectedModal ? `${root} ${mode.name}` : undefined,
                        description: `${root} ${mode.name} ${progression.pattern}`,
                        category,
                        theoreticalBasis: `${mode.name} ${progression.variant} — ${progression.reasoning}`
                    });
                }

                // Add an ambiguous duplicate (no parent key) for the 'long' variant to test context-free classification
                const longProg = progressions.find(p => p.variant === 'long');
                if (longProg) {
                    this.addTestCase({
                        chords: longProg.chords,
                        parentKey: undefined,
                        expectedModal: false,
                        description: `${root} ${mode.name} ${longProg.pattern} (no parent key)`,
                        category: 'ambiguous',
                        theoreticalBasis: 'Omit parent key to force boundary decision between modal and functional'
                    });
                }
            }
        }
    }

    /**
     * 2. FUNCTIONAL CASES
     * Generate clear functional progressions that should NOT be detected as modal
     */
    generateFunctionalCases() {
        console.log('  Generating functional cases...');

        const functionalPatterns = [
            { pattern: ['1', '4', '5', '1'], name: 'I-IV-V-I', description: 'Classic functional cadence' },
            { pattern: ['1', '6', '4', '5'], name: 'I-vi-IV-V', description: 'Pop progression' },
            { pattern: ['6', '4', '1', '5'], name: 'vi-IV-I-V', description: 'Pop progression starting on vi' },
            { pattern: ['2', '5', '1'],      name: 'ii-V-I',    description: 'Jazz ii-V-I' },
            { pattern: ['1', '5', '6', '4'], name: 'I-V-vi-IV', description: 'Pop ballad progression' }
        ];

        for (const root of ROOTS) {
            const majorKey = `${root} major`;

            for (const functionalPattern of functionalPatterns) {
                const chords = this.convertPatternToChords(root, 'major', functionalPattern.pattern);

                this.addTestCase({
                    chords,
                    parentKey: majorKey,
                    expectedModal: false,
                    description: `${root} major ${functionalPattern.name} functional`,
                    category: 'functional_clear',
                    theoreticalBasis: `${functionalPattern.description} - pure functional harmony`
                });
            }
        }
    }

    /**
     * 3. AMBIGUOUS CASES
     * Generate cases that test decision boundaries between modal and functional
     */
    generateAmbiguousCases() {
        console.log('  Generating ambiguous cases...');

        // Test cases without parent key context
        const ambiguousPatterns = [
            { chords: ['C', 'F', 'G', 'C'],  description: 'Could be C major functional or C Ionian modal' },
            { chords: ['Am', 'F', 'C', 'G'], description: 'Could be A Aeolian or vi-IV-I-V in C' },
            { chords: ['D', 'G', 'A', 'D'],  description: 'Could be D major or D Mixolydian in G' }
        ];

        for (const pattern of ambiguousPatterns) {
            this.addTestCase({
                chords: pattern.chords,
                parentKey: undefined,
                expectedModal: false, // Default to functional when ambiguous
                description: `Ambiguous: ${pattern.description}`,
                category: 'ambiguous',
                theoreticalBasis: 'Without parent key context, functional interpretation is more likely'
            });
        }

        // Test cases with explicit modal resolution via parent key (spell chords by parent key)
        for (const root of ['C', 'G', 'D', 'A']) {
            // Parent key a fourth up from the modal root (I-bVII-IV-I in Mixolydian)
            let pkRoot = this.getNoteAtInterval(root, 5, { forKeyNameMajor: true });
            if (prefersFlatsFromRoot(root) && pkRoot === 'F#') pkRoot = 'Gb';
            const parentKey = `${pkRoot} major`;

            // Choose chord spelling preference based on the parent key accidental
            const prefer = parentKey.includes('b') ? 'flats' : parentKey.includes('#') ? 'sharps' : 'auto';

            const chords = [
                root,
                this.getNoteAtInterval(root, 10, { prefer }), // bVII
                this.getNoteAtInterval(root, 5, { prefer }),  // IV
                root
            ];

            this.addTestCase({
                chords,
                parentKey,
                expectedModal: true,
                expectedMode: `${root} Mixolydian`,
                description: `${root} Mixolydian with parent key context`,
                category: 'ambiguous',
                theoreticalBasis: 'Parent key context resolves modal vs functional ambiguity'
            });
        }
    }

        /**
         * 4. EDGE CASES
         * Generate error conditions and boundary cases
         */
        generateEdgeCases()
        {
            console.log('  Generating edge cases...');

            const edgeCases = [
                {
                    chords: ['C'],
                    description: 'Single chord',
                    expectedModal: false,
                    reasoning: 'No harmonic progression'
                },
                {
                    chords: ['G', 'G', 'G'],
                    description: 'Repeated chord',
                    expectedModal: false,
                    reasoning: 'Static harmony'
                },
                {
                    chords: ['C', 'C#', 'D'],
                    description: 'Chromatic progression',
                    expectedModal: false,
                    reasoning: 'Non-diatonic movement'
                },
                {
                    chords: ['F#', 'Gb'],
                    description: 'Enharmonic equivalents',
                    expectedModal: false,
                    reasoning: 'Enharmonic handling test'
                },
                {
                    chords: ['C', 'F#', 'B', 'E'],
                    description: 'Wide interval jumps',
                    expectedModal: false,
                    reasoning: 'Non-functional movement'
                }
            ];

            for (const edgeCase of edgeCases) {
                this.addTestCase({
                    chords: edgeCase.chords,
                    parentKey: undefined,
                    expectedModal: edgeCase.expectedModal,
                    description: `Edge case: ${edgeCase.description}`,
                    category: 'edge_case',
                    theoreticalBasis: edgeCase.reasoning
                });
            }
        }

    /**
     * 5. CROSS-MODAL COMPARISON CASES
     * Generate cases that distinguish between different modes
     */
    generateCrossModalCases() {
        console.log('  Generating cross-modal comparison cases...');

        // For each parent root, generate progressions that could be multiple modes
        for (const root of ['C', 'G', 'D', 'A']) {
            const parentKey = `${root} major`;

            // Test mode distinctions within the same parent key
            const modes = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];

            for (const mode of modes) {
                const modalRoot = this.getModalRoot(root, mode);
                const progressions = this.getCharacteristicProgressions(modalRoot, mode, parentKey);

                for (const progression of progressions) {
                    let category = 'modal_characteristic';
                    let expectedModal = true;

                    if (progression.variant === 'seventh') category = 'modal_seventh_variant';
                    else if (progression.variant === 'vamp') category = 'modal_vamp';
                    else if (progression.variant === 'foil') { category = 'modal_foil'; expectedModal = false; }

                    this.addTestCase({
                        chords: progression.chords,
                        parentKey,
                        expectedModal,
                        expectedMode: expectedModal ? `${modalRoot} ${mode}` : undefined,
                        description: `${modalRoot} ${mode} in ${parentKey} context — ${progression.pattern}`,
                        category,
                        theoreticalBasis: `Distinguishes ${mode} from other modes in same parent key; variant=${progression.variant}`
                    });

                    // Add an ambiguous duplicate for the long variant
                    if (progression.variant === 'long') {
                        this.addTestCase({
                            chords: progression.chords,
                            parentKey: undefined,
                            expectedModal: false,
                            description: `${modalRoot} ${mode} ${progression.pattern} (no parent key)`,
                            category: 'ambiguous',
                            theoreticalBasis: 'Boundary test without parent-key context'
                        });
                    }
                }
            }
        }
    }

        /**
         * HELPER METHODS
         */

        addTestCase(params)
        {
            this.testCases.push({
                id: `test-${this.caseId++}`,
                ...params
            });
        }

        getParentKey(modalRoot, modeName)
        {
            const modeToParentOffsets = {
                'Ionian': 0,
                'Dorian': 10,
                'Phrygian': 8,
                'Lydian': 7,
                'Mixolydian': 5,
                'Aeolian': 3,
                'Locrian': 1
            };

            const offset = modeToParentOffsets[modeName];
            // Compute the parent root using conventional major-key names first
            let parentRoot = this.getNoteAtInterval(modalRoot, offset, { forKeyNameMajor: true });

            // If the modal root prefers flats (e.g., Ab, Eb), respell F# as Gb for the parent major key
            const preferFlats = prefersFlatsFromRoot(modalRoot);
            if (preferFlats && parentRoot === 'F#') parentRoot = 'Gb';

            return `${parentRoot} major`;
        }

        getModalRoot(parentRoot, modeName)
        {
            const parentToModalOffsets = {
                'Ionian': 0,     // C major -> C Ionian
                'Dorian': 2,     // C major -> D Dorian
                'Phrygian': 4,   // C major -> E Phrygian
                'Lydian': 5,     // C major -> F Lydian
                'Mixolydian': 7, // C major -> G Mixolydian
                'Aeolian': 9,    // C major -> A Aeolian
                'Locrian': 11    // C major -> B Locrian
            };

            const offset = parentToModalOffsets[modeName];
            return this.getNoteAtInterval(parentRoot, offset);
        }

        getCharacteristicProgressions(root, modeName, parentKey)
        {
            // Decide accidental preference by context: parent key first, then modal root
            let prefer = 'auto';
            const pk = parentKey || '';
            const pkRoot = pk ? parseRootName(pk) : '';

            if (pkRoot && FLAT_MAJOR_ROOTS.has(pkRoot)) {
              // F, Bb, Eb, Ab, Db, Gb, Cb → prefer flats
              prefer = 'flats';
            } else if (pk.includes('#')) {
              // Explicit sharp key names (e.g., F# major) → prefer sharps
              prefer = 'sharps';
            } else if (parseRootName(root).includes('b')) {
              prefer = 'flats';
            } else if (parseRootName(root).includes('#')) {
              prefer = 'sharps';
            }

            // Optional notational refinement: in strongly flat parents, respell certain naturals diatonically
            const adjustByParentKey = (n) => {
              if (!parentKey) return n;
              const r = pkRoot;
              if (FLAT_MAJOR_ROOTS.has(r)) {
                // In Gb/Db/Cb families, prefer Cb over B for certain degrees (e.g., bVII of Db)
                if ((r === 'Gb' || r === 'Db' || r === 'Cb') && n === 'B') return 'Cb';
                // Very rare, but if Cb major contexts appear and we hit E, prefer Fb
                if (r === 'Cb' && n === 'E') return 'Fb';
              }
              return n;
            };

            const deg = (semitones) => adjustByParentKey(this.getNoteAtInterval(root, semitones, { prefer }));

            switch (modeName) {
                case 'Mixolydian': {
                    return [
                        { variant: 'long',    chords: [root, deg(10), deg(5), root],             pattern: 'I-bVII-IV-I',    reasoning: 'bVII and IV emphasize modal dominant-less cadence' },
                        { variant: 'short',   chords: [root, deg(10), root],                      pattern: 'I-bVII-I',       reasoning: 'bVII-I cadence is a core Mixolydian marker' },
                        { variant: 'seventh', chords: [`${root}7`, deg(5), `${root}7`],          pattern: 'I7-IV-I7',       reasoning: 'dominant-quality tonic is idiomatic in Mixolydian' },
                        { variant: 'vamp',    chords: [root, deg(5)],                             pattern: 'I-IV (vamp)',    reasoning: 'sustained modal color without functional V' },
                        { variant: 'foil',    chords: [root, deg(7), root],                       pattern: 'I-V-I (foil)',   reasoning: 'leading-tone V implies functional major over modal' }
                    ];
                }
                case 'Dorian': {
                    return [
                        { variant: 'long',    chords: [`${root}m`, deg(5), deg(10), `${root}m`], pattern: 'i-IV-bVII-i',    reasoning: 'major IV and bVII with minor tonic' },
                        { variant: 'short',   chords: [`${root}m`, deg(5), `${root}m`],          pattern: 'i-IV-i',         reasoning: 'major IV against minor tonic defines Dorian' },
                        { variant: 'seventh', chords: [`${root}m7`, `${deg(5)}maj7`, `${root}m7`], pattern: 'i7-IVmaj7-i7', reasoning: 'seventh-quality voicings, modal color intact' },
                        { variant: 'vamp',    chords: [`${root}m`, deg(5)],                      pattern: 'i-IV (vamp)',    reasoning: 'two-chord Dorian vamp' },
                        { variant: 'foil',    chords: [`${root}m`, `${deg(5)}m`, `${root}m`],    pattern: 'i-iv-i (foil)',  reasoning: 'minor iv pulls toward Aeolian' }
                    ];
                }
                case 'Phrygian': {
                    return [
                        { variant: 'long',    chords: [`${root}m`, deg(1), deg(10), `${root}m`], pattern: 'i-bII-bVII-i',   reasoning: 'bII with bVII underscores Phrygian' },
                        { variant: 'short',   chords: [`${root}m`, deg(1), `${root}m`],          pattern: 'i-bII-i',        reasoning: 'flat second is the signature degree' },
                        { variant: 'seventh', chords: [`${root}m7`, deg(1), `${root}m7`],        pattern: 'i7-bII-i7',      reasoning: 'seventh voicing maintains Phrygian color' },
                        { variant: 'vamp',    chords: [`${root}m`, deg(1)],                      pattern: 'i-bII (vamp)',   reasoning: 'pedal vamp on tonic and bII' },
                        { variant: 'foil',    chords: [`${root}m`, deg(2), `${root}m`],          pattern: 'i-II-i (foil)',  reasoning: 'natural 2 undermines Phrygian' }
                    ];
                }
                case 'Lydian': {
                    return [
                        { variant: 'long',    chords: [root, deg(2), deg(7), root],              pattern: 'I-II-V-I',       reasoning: 'raised 4th via II; keeps functional V at bay contextually' },
                        { variant: 'long_nov', chords: [root, deg(2), root, deg(2)],             pattern: 'I-II-I-II',      reasoning: 'strict Lydian motion emphasizing #4, avoids V' },
                        { variant: 'short',   chords: [root, deg(2), root],                      pattern: 'I-II-I',         reasoning: 'II (diatonic) emphasizes #4 over IV' },
                        { variant: 'seventh', chords: [`${root}maj7`, deg(2), `${root}maj7`],    pattern: 'Imaj7-II-Imaj7', reasoning: 'Imaj7 with implied #11 color' },
                        { variant: 'vamp',    chords: [root, deg(2)],                            pattern: 'I-II (vamp)',    reasoning: 'two-chord Lydian vamp' },
                        { variant: 'foil',    chords: [root, deg(7), root],                      pattern: 'I-V-I (foil)',   reasoning: 'authentic cadence reduces Lydian feel' }
                    ];
                }
                case 'Aeolian': {
                    return [
                        { variant: 'long',    chords: [`${root}m`, deg(8), deg(10), `${root}m`], pattern: 'i-bVI-bVII-i',   reasoning: 'natural minor hallmark bVI, bVII' },
                        { variant: 'short',   chords: [`${root}m`, deg(10), `${root}m`],         pattern: 'i-bVII-i',       reasoning: 'Aeolian cadence without leading tone' },
                        { variant: 'seventh', chords: [`${root}m7`, deg(8), deg(10), `${root}m7`], pattern: 'i7-bVI-bVII-i7', reasoning: 'seventh voicings in Aeolian' },
                        { variant: 'vamp',    chords: [`${root}m`, deg(10)],                     pattern: 'i-bVII (vamp)',  reasoning: 'two-chord Aeolian vamp' },
                        { variant: 'foil',    chords: [`${root}m`, `${deg(7)}7`, `${root}m`],    pattern: 'i-V7-i (foil)',  reasoning: 'leading-tone dominant suggests harmonic minor' }
                    ];
                }
                case 'Locrian': {
                    return [
                        { variant: 'long',    chords: [`${root}dim`, deg(1), `${deg(6)}m`, `${root}dim`], pattern: 'i°-bII-v-i°',  reasoning: 'Locrian with bII and minor v (no true V)' },
                        { variant: 'short',   chords: [`${root}dim`, deg(1), `${root}dim`],                  pattern: 'i°-bII-i°',    reasoning: 'diminished tonic and Neapolitan color' },
                        { variant: 'seventh', chords: [`${root}m7b5`, deg(1), `${root}m7b5`],                pattern: 'iø7-bII-iø7',  reasoning: 'half-diminished tonic is idiomatic for Locrian' },
                        { variant: 'vamp',    chords: [`${root}dim`, deg(1)],                                pattern: 'i°-bII (vamp)', reasoning: 'two-chord Locrian vamp' },
                        { variant: 'foil',    chords: [`${root}dim`, `${deg(7)}7`, `${root}dim`],            pattern: 'i°-V7-i° (foil)', reasoning: 'true V7 contradicts Locrian' }
                    ];
                }
                default: { // Ionian
                    return [
                        { variant: 'short',   chords: [root, deg(5), root],                                   pattern: 'I-IV-I',           reasoning: 'plagal movement as modal color' },
                        { variant: 'seventh', chords: [`${root}maj7`, `${deg(5)}maj7`, `${root}maj7`],        pattern: 'Imaj7-IVmaj7-Imaj7', reasoning: 'Ionian color with 7ths' },
                        { variant: 'vamp',    chords: [root, deg(5)],                                         pattern: 'I-IV (vamp)',      reasoning: 'sustained Ionian color' },
                        { variant: 'foil',    chords: [root, deg(7), root],                                   pattern: 'I-V-I (foil)',     reasoning: 'authentic cadence is functional, not modal' }
                    ];
                }
            }
        }

        convertPatternToChords(root, mode, pattern)
        {
            const scale = this.getScaleNotes(root, mode);
            return pattern.map(degree => {
                const degreeNum = parseInt(degree) - 1;
                return scale[degreeNum] || root;
            });
        }

        getScaleNotes(root, mode)
        {
            // Simplified - major scale degrees only (functional tests use major)
            const prefer = prefersFlatsFromRoot(root) ? 'flats' : 'sharps';
            const majorScale = [0, 2, 4, 5, 7, 9, 11].map(ivl => this.getNoteAtInterval(root, ivl, {prefer}));
            return majorScale;
        }

        getNoteAtInterval(root, semitones, opts = {})
        {
            const {prefer = 'auto', forKeyNameMajor = false} = opts;
            const base = parseRootName(root);
            const baseIdx = NOTE_TO_INDEX[base];
            if (baseIdx == null) return root; // unknown symbol; fail soft

            let targetIdx = (baseIdx + (semitones % 12) + 12) % 12;

            if (forKeyNameMajor) {
                return MAJOR_KEY_NAME_BY_INDEX[targetIdx];
            }

            let useFlats;
            if (prefer === 'flats') useFlats = true;
            else if (prefer === 'sharps') useFlats = false;
            else useFlats = prefersFlatsFromRoot(root);

            return useFlats ? INDEX_TO_FLATS[targetIdx] : INDEX_TO_SHARPS[targetIdx];
        }

        /**
         * Export test cases to JSON for external analysis
         */
        exportToJSON()
        {
            return JSON.stringify({
                metadata: {
                    generated: new Date().toISOString(),
                    totalCases: this.testCases.length,
                    categories: {
                        modal_characteristic: this.testCases.filter(t => t.category === 'modal_characteristic').length,
                        modal_seventh_variant: this.testCases.filter(t => t.category === 'modal_seventh_variant').length,
                        modal_vamp: this.testCases.filter(t => t.category === 'modal_vamp').length,
                        modal_foil: this.testCases.filter(t => t.category === 'modal_foil').length,
                        functional_clear: this.testCases.filter(t => t.category === 'functional_clear').length,
                        ambiguous: this.testCases.filter(t => t.category === 'ambiguous').length,
                        edge_case: this.testCases.filter(t => t.category === 'edge_case').length
                    }
                },
                testCases: this.testCases
            }, null, 2);
        }
    }

// Generate and export comprehensive test cases
function generateComprehensiveTestCases() {
    const generator = new ComprehensiveTestGenerator();
    return generator.generateAllTestCases();
}

// Export to JSON file for external analysis
function exportComprehensiveTestCases() {
    const generator = new ComprehensiveTestGenerator();
    const testCases = generator.generateAllTestCases();

    console.log('\n📊 COMPREHENSIVE TEST CASE GENERATION COMPLETE');
    console.log(`Generated ${testCases.length} test cases`);

    const jsonOutput = generator.exportToJSON();

    // Save to file
    fs.writeFileSync('./comprehensive-modal-test-cases.json', jsonOutput);
    console.log('💾 Test cases saved to comprehensive-modal-test-cases.json');

    console.log('\n📋 Test Case Breakdown:');
    const categories = testCases.reduce((acc, tc) => {
        acc[tc.category] = (acc[tc.category] || 0) + 1;
        return acc;
    }, {});

    Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} cases`);
    });

    // Show a few examples
    console.log('\n🎯 Example Generated Test Cases:');

    // Find an A Aeolian characteristic case
    const aAeolianCase = testCases.find(tc =>
        tc.expectedMode === 'A Aeolian' && tc.description.includes('i-bVI-bVII-i')
    );

    if (aAeolianCase) {
        console.log('\n  ✅ Found A Aeolian characteristic case:');
        console.log(`     ${aAeolianCase.id}: ${aAeolianCase.description}`);
        console.log(`     Chords: ${aAeolianCase.chords.join(' ')}`);
        console.log(`     Parent Key: ${aAeolianCase.parentKey || 'none'}`);
        console.log(`     Expected: ${aAeolianCase.expectedModal ? 'MODAL' : 'FUNCTIONAL'} (${aAeolianCase.expectedMode || 'none'})`);
    }

    // Show a few more examples
    console.log('\n  📋 More examples:');
    testCases.slice(0, 5).forEach(tc => {
        console.log(`     ${tc.id}: ${tc.description}`);
        console.log(`       ${tc.chords.join(' ')} (${tc.parentKey || 'no parent'})`);
    });

    return testCases;
}

// Run if executed directly
if (require.main === module) {
    exportComprehensiveTestCases();
}