// This function is attached to the global window object to ensure it's accessible
// by other scripts, preventing the scope errors we encountered before.
// It populates all tables and returns the master list of all scales for MIDI matching.
window.populateAllTables = function() {
    console.log("tables.js: Running populateAllTables()...");

    // --- Data and Constants ---
    const PARENT_KEYS = {
        0: 'C', 1: 'D♭', 2: 'D', 3: 'E♭', 4: 'E', 5: 'F', 6: 'G♭', 7: 'G', 8: 'A♭', 9: 'A', 10: 'B♭', 11: 'B'
    };
    const PARENT_KEY_INDICES = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6];

    // --- DATA FOR 7-NOTE SCALES ---
    const MAJOR_MODES_DATA = {
        headers: ["Mode / Scale Degree", "Ionian (I)", "Dorian (II)", "Phrygian (III)", "Lydian (IV)", "Mixolydian (V)", "Aeolian (VI)", "Locrian (VII)"],
        formulas: ["1, 2, 3, 4, 5, 6, 7", "1, 2, ♭3, 4, 5, 6, ♭7", "1, ♭2, ♭3, 4, 5, ♭6, ♭7", "1, 2, 3, ♯4, 5, 6, 7", "1, 2, 3, 4, 5, 6, ♭7", "1, 2, ♭3, 4, 5, ♭6, ♭7", "1, ♭2, ♭3, 4, ♭5, ♭6, ♭7"],
        commonNames: ["Major Scale", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Natural Minor", "Locrian"],
        modeIntervals: [[0,2,4,5,7,9,11], [0,2,3,5,7,9,10], [0,1,3,5,7,8,10], [0,2,4,6,7,9,11], [0,2,4,5,7,9,10], [0,2,3,5,7,8,10], [0,1,3,5,6,8,10]],
        parentScaleIntervals: [0, 2, 4, 5, 7, 9, 11],
        parentScaleIntervalPattern: [2, 2, 1, 2, 2, 2, 1]
    };
    const MELODIC_MINOR_MODES_DATA = {
        headers: ["Mode / Scale Degree", "Melodic Minor (I)", "Dorian ♭2 (II)", "Lydian Aug (III)", "Lydian Dom (IV)", "Mixo ♭6 (V)", "Locrian ♮2 (VI)", "Altered (VII)"],
        formulas: ["1, 2, ♭3, 4, 5, 6, 7","1, ♭2, ♭3, 4, 5, 6, ♭7","1, 2, 3, ♯4, ♯5, 6, 7","1, 2, 3, ♯4, 5, 6, ♭7","1, 2, 3, 4, 5, ♭6, ♭7","1, 2, ♭3, 4, ♭5, ♭6, ♭7","1, ♭2, ♭3, ♭4, ♭5, ♭6, ♭7"],
        commonNames: ["Melodic Minor", "Phrygian ♮6", "Lydian Augmented", "Lydian Dominant", "Aeolian Dominant", "Half-Diminished ♮2", "Altered Scale"],
        modeIntervals: [[0,2,3,5,7,9,11], [0,1,3,5,7,9,10], [0,2,4,6,8,9,11], [0,2,4,6,7,9,10], [0,2,4,5,7,8,10], [0,2,3,5,6,8,10], [0,1,3,4,6,8,10]],
        parentScaleIntervals: [0, 2, 3, 5, 7, 9, 11],
        parentScaleIntervalPattern: [2, 1, 2, 2, 2, 2, 1]
    };
    const HARMONIC_MINOR_DATA = {
        headers: ["Mode / Scale Degree", "Harmonic Minor (I)", "Locrian ♮6 (II)", "Ionian Aug (III)", "Dorian ♯4 (IV)", "Phrygian Dom (V)", "Lydian ♯2 (VI)", "Altered Dim (VII)"],
        formulas: ["1, 2, ♭3, 4, 5, ♭6, 7", "1, ♭2, ♭3, 4, ♭5, 6, ♭7", "1, 2, 3, 4, ♯5, 6, 7", "1, 2, ♭3, ♯4, 5, 6, ♭7", "1, ♭2, 3, 4, 5, ♭6, ♭7", "1, ♯2, 3, ♯4, 5, 6, 7", "1, ♭2, ♭3, ♭4, ♭5, ♭6, ♭♭7"],
        commonNames: ["Harmonic Minor", "Locrian ♮6", "Ionian Augmented", "Ukrainian Dorian", "Phrygian Dominant", "Lydian ♯2", "Altered Diminished"],
        modeIntervals: [[0,2,3,5,7,8,11], [0,1,3,5,6,8,10], [0,2,4,5,8,9,11], [0,2,3,6,7,9,10], [0,1,4,5,7,8,10], [0,3,4,7,8,10,11], [0,1,3,4,6,7,9]],
        parentScaleIntervals: [0, 2, 3, 5, 7, 8, 11],
        parentScaleIntervalPattern: [2, 1, 2, 2, 1, 3, 1]
    };
    const HARMONIC_MAJOR_DATA = {
        headers: ["Mode / Scale Degree", "Harmonic Major (I)", "Dorian ♭5 (II)", "Phrygian ♭4 (III)", "Lydian ♭3 (IV)", "Mixo ♭2 (V)", "Lydian Aug ♯2 (VI)", "Locrian ♭♭7 (VII)"],
        formulas: ["1, 2, 3, 4, 5, ♭6, 7", "1, 2, ♭3, 4, ♭5, 6, ♭7", "1, ♭2, ♭3, ♭4, 5, ♭6, ♭7", "1, 2, ♭3, ♯4, 5, 6, 7", "1, ♭2, 3, 4, 5, 6, ♭7", "1, ♯2, 3, ♯4, ♯5, 6, 7", "1, ♭2, ♭3, 4, ♭5, ♭6, ♭♭7"],
        commonNames: ["Harmonic Major", "Dorian ♭5", "Phrygian ♭4", "Lydian ♭3", "Mixolydian ♭2", "Lydian Aug ♯2", "Locrian ♭♭7"],
        modeIntervals: [[0,2,4,5,7,8,11], [0,2,3,5,6,9,10], [0,1,3,4,7,8,10], [0,2,3,6,7,9,11], [0,1,4,5,7,9,10], [0,3,4,7,9,10,11], [0,1,3,5,6,8,9]],
        parentScaleIntervals: [0, 2, 4, 5, 7, 8, 11],
        parentScaleIntervalPattern: [2, 2, 1, 2, 1, 3, 1]
    };
    const DOUBLE_HARMONIC_MAJOR_DATA = {
        headers: ["Mode / Scale Degree", "Double Harmonic (I)", "Lydian ♯2 ♯6 (II)", "Ultraphrygian (III)", "Hungarian Minor (IV)", "Oriental (V)", "Ionian Aug ♯2 (VI)", "Locrian ♭♭3 ♭♭7 (VII)"],
        formulas: ["1, ♭2, 3, 4, 5, ♭6, 7", "1, ♯2, 3, ♯4, 5, ♯6, 7", "1, ♭2, ♭3, ♭4, 5, 6, ♭7", "1, 2, ♭3, ♯4, 5, ♭6, ♭7", "1, ♭2, 3, 4, ♭5, 6, ♭7", "1, ♯2, 3, 4, ♯5, 6, 7", "1, ♭2, ♭♭3, ♭4, ♭5, ♭6, ♭♭7"],
        commonNames: ["Byzantine Scale", "Lydian ♯2 ♯6", "Ultraphrygian", "Hungarian Minor", "Oriental", "Ionian Augmented ♯2", "Locrian ♭♭3 ♭♭7"],
        modeIntervals: [[0,1,4,5,7,8,11], [0,3,4,6,7,10,11], [0,1,3,4,7,9,10], [0,2,3,6,7,8,10], [0,1,4,5,6,9,10], [0,3,4,5,8,9,11], [0,1,2,4,5,7,8]],
        parentScaleIntervals: [0, 1, 4, 5, 7, 8, 11],
        parentScaleIntervalPattern: [1, 3, 1, 2, 1, 3, 1]
    };

    // --- NEW: DATA FOR PENTATONIC/BLUES SCALES ---
    const MAJOR_PENTATONIC_DATA = {
        headers: ["Key", "Formula", "Notes"],
        formula: "1, 2, 3, 5, 6",
        intervals: [0, 2, 4, 7, 9]
    };
    const MINOR_PENTATONIC_DATA = {
        headers: ["Key", "Formula", "Notes"],
        formula: "1, ♭3, 4, 5, ♭7",
        intervals: [0, 3, 5, 7, 10]
    };
    const BLUES_SCALE_DATA = {
        headers: ["Key", "Formula", "Notes"],
        formula: "1, ♭3, 4, ♭5, 5, ♭7",
        intervals: [0, 3, 5, 6, 7, 10]
    };

    let allScales = [];
    const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const PITCH_CLASS_NAMES = {
        0: { normal: 'C' }, 1: { normal: 'D♭', sharp: 'C♯' }, 2: { normal: 'D' }, 3: { normal: 'E♭', sharp: 'D♯' },
        4: { normal: 'E' }, 5: { normal: 'F' }, 6: { normal: 'G♭', sharp: 'F♯' }, 7: { normal: 'G' },
        8: { normal: 'A♭', sharp: 'G♯' }, 9: { normal: 'A' }, 10: { normal: 'B♭', sharp: 'A♯' }, 11: { normal: 'B' }
    };

    function generateDiatonicScale(rootPitchClass, rootName, intervalPattern) {
        let scaleNotes = [rootName];
        let currentPitch = rootPitchClass;
        let rootLetter_idx = NOTE_LETTERS.indexOf(rootName.charAt(0));

        for (let i = 0; i < 6; i++) {
            currentPitch = (currentPitch + intervalPattern[i]) % 12;
            const nextLetter = NOTE_LETTERS[(rootLetter_idx + i + 1) % 7];

            let foundNote = false;
            for (const spelling in PITCH_CLASS_NAMES[currentPitch]) {
                const noteName = PITCH_CLASS_NAMES[currentPitch][spelling];
                if (noteName && noteName.charAt(0) === nextLetter) {
                    scaleNotes.push(noteName);
                    foundNote = true;
                    break;
                }
            }
            if (!foundNote) {
                scaleNotes.push('?');
            }
        }
        return scaleNotes;
    }

    function buildModalTable(tableId, data, parentScaleName) {
        const table = document.getElementById(tableId);
        if (!table) return;
        table.innerHTML = '';

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        data.headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();
        const formulaRow = tbody.insertRow();
        formulaRow.insertCell().textContent = "Formula";
        data.formulas.forEach(formulaText => {
            const cell = formulaRow.insertCell();
            cell.innerHTML = `<code>(${formulaText})</code>`;
        });
        const commonNameRow = tbody.insertRow();
        commonNameRow.insertCell().textContent = "Common Name";
        data.commonNames.forEach(name => {
            commonNameRow.insertCell().textContent = name;
        });

        PARENT_KEY_INDICES.forEach((parentKeyIndex, keyRowIndex) => {
            const rootName = PARENT_KEYS[parentKeyIndex];
            const noteRow = tbody.insertRow();
            noteRow.insertCell().textContent = `${rootName} ${parentScaleName}`;

            const parentScaleNotes = generateDiatonicScale(parentKeyIndex, rootName, data.parentScaleIntervalPattern);

            parentScaleNotes.forEach((cellNoteText, modeIndex) => {
                const cell = noteRow.insertCell();
                cell.textContent = cellNoteText;
                cell.classList.add('note-cell');

                const modeRootNoteIndex = (parentKeyIndex + data.parentScaleIntervals[modeIndex]) % 12;
                const modeTypeIntervals = data.modeIntervals[modeIndex];
                const pitchClasses = new Set(modeTypeIntervals.map(i => (modeRootNoteIndex + i) % 12));
                const cellId = `${tableId}-${keyRowIndex}-${modeIndex}`;
                cell.id = cellId;

                allScales.push({ id: cellId, pitchClasses: pitchClasses, rootNote: modeRootNoteIndex });

                cell.addEventListener('mouseover', (event) => {
                    const currentCell = event.target;
                    const noteToMatch = currentCell.textContent.trim();

                    if (noteToMatch) {
                        currentCell.parentElement.classList.add('row-highlight');
                        currentCell.classList.add('hover-highlight');

                        const allNoteCells = document.querySelectorAll('.note-cell');
                        allNoteCells.forEach(otherCell => {
                            if (otherCell.textContent.trim() === noteToMatch) {
                                otherCell.classList.add('note-match-highlight');
                            }
                        });
                    }
                });

                cell.addEventListener('mouseout', (event) => {
                    document.querySelectorAll('.row-highlight').forEach(r => r.classList.remove('row-highlight'));
                    document.querySelectorAll('.note-match-highlight').forEach(c => c.classList.remove('note-match-highlight'));
                    document.querySelectorAll('.hover-highlight').forEach(c => c.classList.remove('hover-highlight'));
                });
            });
        });
    }

    // --- NEW: Function to build the simpler Pentatonic/Blues tables ---
    function buildSimpleTable(tableId, data) {
        const table = document.getElementById(tableId);
        if (!table) return;
        table.innerHTML = '';
        const NOTES = ["C", "C♯/D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];


        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        data.headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();

        PARENT_KEY_INDICES.forEach((keyIndex, rowIndex) => {
            const row = tbody.insertRow();
            // Key Cell
            row.insertCell().textContent = PARENT_KEYS[keyIndex];
            // Formula Cell
            row.insertCell().innerHTML = `<code>${data.formula}</code>`;
            // Notes Cell
            const notesCell = row.insertCell();
            const pitchClasses = new Set(data.intervals.map(i => (keyIndex + i) % 12));
            const notesText = Array.from(pitchClasses).sort((a, b) => a - b).map(pc => NOTES[pc]).join(', ');
            notesCell.textContent = notesText;

            // Add to master scale list for MIDI matching
            const cellId = `${tableId}-${rowIndex}`;
            notesCell.id = cellId;
            allScales.push({ id: cellId, pitchClasses: pitchClasses, rootNote: keyIndex });
        });
    }

    buildModalTable('major-scale-modes', MAJOR_MODES_DATA, 'Major Scale');
    buildModalTable('melodic-minor-modes', MELODIC_MINOR_MODES_DATA, 'Melodic Minor');
    buildModalTable('harmonic-minor-modes', HARMONIC_MINOR_DATA, 'Harmonic Minor');
    buildModalTable('harmonic-major-modes', HARMONIC_MAJOR_DATA, 'Harmonic Major');
    buildModalTable('double-harmonic-major-modes', DOUBLE_HARMONIC_MAJOR_DATA, 'Double Harmonic Major');

    buildSimpleTable('major-pentatonic-scale', MAJOR_PENTATONIC_DATA);
    buildSimpleTable('minor-pentatonic-scale', MINOR_PENTATONIC_DATA);
    buildSimpleTable('blues-scale', BLUES_SCALE_DATA);

    console.log("tables.js: Finished populating all tables.");
    return allScales;
};
