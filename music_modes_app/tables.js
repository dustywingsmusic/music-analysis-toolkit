window.populateAllTables = function() {
    console.log("tables.js: Running populateAllTables()...");

    // --- Data and Constants ---
    const PARENT_KEYS = {
        0: 'C', 1: 'D♭', 2: 'D', 3: 'E♭', 4: 'E', 5: 'F', 6: 'G♭', 7: 'G', 8: 'A♭', 9: 'A', 10: 'B♭', 11: 'B'
    };
    const PARENT_KEY_INDICES = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6];

    const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const PITCH_CLASS_NAMES = {
        0: { normal: 'C', sharp: 'B♯', flat: 'D♭♭' }, 1: { normal: 'C♯', flat: 'D♭' },
        2: { normal: 'D', sharp: 'C♯♯', flat: 'E♭♭' }, 3: { normal: 'E♭', sharp: 'D♯' },
        4: { normal: 'E', flat: 'F♭', sharp: 'D♯♯' }, 5: { normal: 'F', sharp: 'E♯', flat: 'G♭♭' },
        6: { normal: 'F♯', flat: 'G♭' }, 7: { normal: 'G', sharp: 'F♯♯', flat: 'A♭♭' },
        8: { normal: 'A♭', sharp: 'G♯' }, 9: { normal: 'A', sharp: 'G♯♯', flat: 'B♭♭' },
        10: { normal: 'B♭', sharp: 'A♯' }, 11: { normal: 'B', flat: 'C♭', sharp: 'A♯♯' }
    };

    const allScaleData = [
      {
        name: "Major Scale",
        tableId: "major-scale-modes",
        isDiatonic: true,
        headers: ["Mode / Scale Degree", "Ionian (I)", "Dorian (II)", "Phrygian (III)", "Lydian (IV)", "Mixolydian (V)", "Aeolian (VI)", "Locrian (VII)"],
        formulas: [
          "1, 2, 3, 4, 5, 6, 7",
          "1, 2, ♭3, 4, 5, 6, ♭7",
          "1, ♭2, ♭3, 4, 5, ♭6, ♭7",
          "1, 2, 3, ♯4, 5, 6, 7",
          "1, 2, 3, 4, 5, 6, ♭7",
          "1, 2, ♭3, 4, 5, ♭6, ♭7",
          "1, ♭2, ♭3, 4, ♭5, ♭6, ♭7"
        ],
        commonNames: ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"],
        modeIntervals: [
          [0,2,4,5,7,9,11],
          [0,2,3,5,7,9,10],
          [0,1,3,5,7,8,10],
          [0,2,4,6,7,9,11],
          [0,2,4,5,7,9,10],
          [0,2,3,5,7,8,10],
          [0,1,3,5,6,8,10]
        ],
        parentScaleIntervals: [0,2,4,5,7,9,11]
      },
      {
        name: "Melodic Minor",
        tableId: "melodic-minor-modes",
        isDiatonic: true,
        headers: ["Mode / Scale Degree", "Melodic Minor (I)", "Dorian ♭2 (II)", "Lydian Augmented (III)", "Lydian Dominant (IV)", "Mixolydian ♭6 (V)", "Locrian ♮2 (VI)", "Altered (VII)"],
        formulas: [
          "1, 2, ♭3, 4, 5, 6, 7",
          "1, ♭2, ♭3, 4, 5, 6, ♭7",
          "1, 2, 3, ♯4, ♯5, 6, 7",
          "1, 2, 3, ♯4, 5, 6, ♭7",
          "1, 2, 3, 4, 5, ♭6, ♭7",
          "1, 2, ♭3, 4, ♭5, ♭6, ♭7",
          "1, ♭2, ♭3, ♭4, ♭5, ♭6, ♭7"
        ],
        commonNames: ["(Alt) Jazz Minor", "Dorian ♭2", "Lydian Augmented", "Lydian Dominant", "Mixolydian ♭6", "Locrian ♮2", "Altered"],
        modeIntervals: [
          [0,2,3,5,7,9,11],
          [0,1,3,5,7,9,10],
          [0,2,4,6,8,9,11],
          [0,2,4,6,7,9,10],
          [0,2,4,5,7,8,10],
          [0,2,3,5,6,8,10],
          [0,1,3,4,6,8,10]
        ],
        parentScaleIntervals: [0,2,3,5,7,9,11]
      },
      {
        name: "Harmonic Minor",
        tableId: "harmonic-minor-modes",
        isDiatonic: true,
        headers: ["Mode / Scale Degree", "Harmonic Minor (I)", "Locrian ♮6 (II)", "Ionian ♯5 (III)", "Dorian ♯4 (IV)", "Phrygian Dominant (V)", "Lydian ♯2 (VI)", "Super-Locrian (VII)"],
        formulas: [
          "1, 2, ♭3, 4, 5, ♭6, 7",
          "1, ♭2, ♭3, 4, ♭5, 6, ♭7",
          "1, 2, 3, 4, ♯5, 6, 7",
          "1, 2, ♭3, ♯4, 5, 6, ♭7",
          "1, ♭2, 3, 4, 5, ♭6, ♭7",
          "1, ♯2, 3, ♯4, 5, 6, 7",
          "1, ♭2, ♭3, ♭4, ♭5, ♭6, ♭7"
        ],
        commonNames: ["Harmonic Minor", "Locrian ♮6", "Ionian ♯5", "Ukrainian Dorian", "Phrygian Dominant", "Lydian ♯2", "Super-Locrian"],
        modeIntervals: [
          [0,2,3,5,7,8,11],
          [0,1,3,5,6,8,10],
          [0,2,4,5,8,9,11],
          [0,2,3,6,7,9,10],
          [0,1,4,5,7,8,10],
          [0,3,4,7,8,10,11],
          [0,1,3,4,6,7,9]
        ],
        parentScaleIntervals: [0,2,3,5,7,8,11]
      },
      {
        name: "Harmonic Major",
        tableId: "harmonic-major-modes",
        isDiatonic: true,
        headers: ["Mode / Scale Degree", "Harmonic Major (I)", "Dorian ♭5 (II)", "Phrygian ♭4 (III)", "Lydian ♭3 (IV)", "Mixolydian ♭2 (V)", "Lydian Aug ♯2 (VI)", "Locrian ♭7♭5 (VII)"],
        formulas: [
          "1, 2, 3, 4, 5, ♭6, 7",
          "1, 2, ♭3, 4, ♭5, 6, ♭7",
          "1, ♭2, ♭3, ♭4, 5, ♭6, ♭7",
          "1, 2, ♭3, ♯4, 5, 6, 7",
          "1, ♭2, 3, 4, 5, 6, ♭7",
          "1, ♯2, 3, ♯4, ♯5, 6, 7",
          "1, ♭2, ♭3, 4, ♏5, ♏7"
        ],
        commonNames: ["Harmonic Major", "Dorian ♭5", "Phrygian ♭4", "Lydian ♭3", "Mixolydian ♭2", "Lydian Aug ♯2", "Locrian ♭7♭5"],
        modeIntervals: [
          [0,2,4,5,7,8,11],
          [0,2,3,5,6,9,10],
          [0,1,3,4,7,8,10],
          [0,2,3,6,7,9,11],
          [0,1,4,5,7,9,10],
          [0,3,4,7,9,10,11],
          [0,1,3,5,6,8,9]
        ],
        parentScaleIntervals: [0,2,4,5,7,8,11]
      },
      {
        name: "Double Harmonic Major",
        tableId: "double-harmonic-major-modes",
        isDiatonic: true,
        headers: ["Mode / Scale Degree", "Double Harmonic (I)", "Lydian ♯2 ♯6 (II)", "Ultraphrygian (III)", "Hungarian Minor (IV)", "Oriental (V)", "Ionian Aug ♯2 (VI)", "Ultra-Locrian (VII)"],
        formulas: [
          "1, ♭2, 3, 4, 5, ♭6, 7",
          "1, ♯2, 3, ♯4, 5, ♯6, 7",
          "1, ♭2, ♭3, ♭4, 5, 6, ♭7",
          "1, 2, ♭3, ♯4, 5, ♭6, ♭7",
          "1, ♭2, 3, 4, ♭5, 6, ♭7",
          "1, ♯2, 3, 4, ♯5, 6, 7",
          "1, ♭2, ♭♭3, ♭4, ♭5, ♭6, ♭♭7"
        ],
        alternateNames: ["Byzantine", "Lydian ♯2 ♯6", "Ultraphrygian", "Hungarian Minor", "Oriental", "Ionian Aug ♯2", "Locrian ♭♭3 ♭♭7"],
        modeIntervals: [
          [0,1,4,5,7,8,11],
          [0,3,4,6,7,10,11],
          [0,1,3,4,7,9,10],
          [0,2,3,6,7,8,10],
          [0,1,4,5,6,9,10],
          [0,3,4,5,8,9,11],
          [0,1,2,4,5,7,8]
        ],
        parentScaleIntervals: [0,1,4,5,7,8,11],
        skipCommonNames: true
      },
      {
        name: "Major Pentatonic",
        tableId: "major-pentatonic-modes",
        isDiatonic: false,
        headers: ["Mode / Degree", "Mode I", "Mode II", "Mode III", "Mode IV", "Mode V"],
        formulas: ["1, 2, 3, 5, 6", "1, 2, 4, 5, ♭7", "1, ♭3, 4, ♭6, ♭7", "1, 2, 4, 5, 6", "1, ♭3, 4, 5, ♭7"],
        alternateNames: ["Major Pentatonic", "Suspended", "Jue", "Zhi", "Minor Pentatonic"],
        modeIntervals: [
          [0,2,4,7,9],
          [0,2,5,7,10],
          [0,3,5,8,10],
          [0,2,5,7,9],
          [0,3,5,7,10]
        ],
        parentScaleIntervals: [0,2,4,7,9],
        skipCommonNames: true
      },
      {
        name: "Blues Scale",
        tableId: "blues-scale-modes",
        isDiatonic: false,
        headers: ["Mode / Degree", "Mode I", "Mode II", "Mode III", "Mode IV", "Mode V", "Mode VI"],
        formulas: [
          "1, ♭3, 4, ♭5, 5, ♭7",
          "1, 2, ♭3, 3, 5, 6",
          "1, ♭2, 2, 4, 5, ♭7",
          "1, ♭2, 3, ♯4, 6, 7",
          "1, ♭3, 4, ♭6, ♭7, 7",
          "1, 2, ♭3, 5, ♭6, 6"
        ],
        commonNames: ["Blues Scale", "Blues Mode II", "Blues Mode III", "Blues Mode IV", "Blues Mode V", "Blues Mode VI"],
        modeIntervals: [
          [0, 3, 5, 6, 7, 10],
          [0, 2, 3, 4, 7, 9],
          [0, 1, 2, 5, 7, 10],
          [0, 1, 4, 6, 9, 11],
          [0, 3, 5, 8, 10, 11],
          [0, 2, 3, 7, 8, 9]
        ],
        parentScaleIntervals: [0,3,5,6,7,10],
        skipCommonNames: true
      }
    ];

    let allScales = [];

    function generateDiatonicScale(rootPitchClass, rootName, intervalPattern) {
        let scaleNotes = [rootName];
        let currentPitch = rootPitchClass;
        let rootLetter_idx = NOTE_LETTERS.indexOf(rootName.charAt(0));

        for (let i = 0; i < intervalPattern.length; i++) {
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

    function buildTable(data) {
        const table = document.getElementById(data.tableId);
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
        if (!data.skipCommonNames) {
            const commonNameRow = tbody.insertRow();
            commonNameRow.insertCell().textContent = "Common Name";
            data.commonNames.forEach(name => {
                commonNameRow.insertCell().textContent = name;
            });
        }
        if (data.alternateNames) {
            const altNameRow = tbody.insertRow();
            altNameRow.insertCell().textContent = "Alternate Names";
            data.alternateNames.forEach(name => {
                altNameRow.insertCell().textContent = name;
            });
        }
        const intervalRow = tbody.insertRow();
        intervalRow.insertCell().textContent = "Intervals";
        data.modeIntervals.forEach(intervals => {
            intervalRow.insertCell().textContent = intervals.join(", ");
        });

        PARENT_KEY_INDICES.forEach((parentKeyIndex, keyRowIndex) => {
            const rootName = PARENT_KEYS[parentKeyIndex];
            // For Blues Scale, treat G♭ as F♯ (omit G♭ row)
            let displayRootName = rootName;
            if (data.tableId === "blues-scale-modes" && rootName === "G♭") {
                displayRootName = "F♯";
            }
            const noteRow = tbody.insertRow();
            // Use displayRootName for first cell
            noteRow.insertCell().textContent = `${displayRootName} ${data.name}`;

            const diatonicParent = generateDiatonicScale(parentKeyIndex, rootName, [2, 2, 1, 2, 2, 2]);

            // Determine effective parent key for enharmonic logic
            let effectiveKeyName = rootName;
            if (data.tableId === "blues-scale-modes" && rootName === "G♭") {
                effectiveKeyName = "F♯";
            }

            data.parentScaleIntervals.forEach((modeStartInterval, modeIndex) => {
                const cell = noteRow.insertCell();
                cell.classList.add('note-cell');

                const modeRootPitch = (parentKeyIndex + modeStartInterval) % 12;

                let cellNoteText = '?';
                if (data.isDiatonic) {
                    cellNoteText = diatonicParent[modeIndex];
                } else {
                    // Non-diatonic scales: if the row’s root key is flat-based, use single-flat spellings first
                    const pitchEntry    = PITCH_CLASS_NAMES[modeRootPitch];
                    const parentKeyName = PARENT_KEYS[parentKeyIndex];
                    // Use effectiveKeyName for flat-checks
                    if (effectiveKeyName.includes('♭')
                        && pitchEntry.flat
                        && !pitchEntry.flat.includes('♭♭'))
                    {
                        cellNoteText = pitchEntry.flat;
                    }
                    else if (pitchEntry.normal
                             && !pitchEntry.normal.includes('♭♭')
                             && !pitchEntry.normal.includes('♯♯'))
                    {
                        cellNoteText = pitchEntry.normal;
                    }
                    else if (pitchEntry.sharp
                             && !pitchEntry.sharp.includes('♯♯'))
                    {
                        cellNoteText = pitchEntry.sharp;
                    }
                    else {
                        cellNoteText = pitchEntry.normal;
                    }
                }

                cell.textContent = cellNoteText;

                const modeTypeIntervals = data.modeIntervals[modeIndex];
                const pitchClasses = new Set(modeTypeIntervals.map(i => (modeRootPitch + i) % 12));
                const cellId = `${data.tableId}-${keyRowIndex}-${modeIndex}`;
                cell.id = cellId;

                allScales.push({ id: cellId, pitchClasses: pitchClasses, rootNote: modeRootPitch });
            });
        });

        // --- REVISED: More robust event handling ---
        table.addEventListener('mouseover', (event) => {
            if (event.target.classList.contains('note-cell')) {
                // Clear any previous highlights before applying new ones
                document.querySelectorAll('.row-highlight, .hover-highlight, .note-match-highlight').forEach(el => {
                    el.classList.remove('row-highlight', 'hover-highlight', 'note-match-highlight');
                });

                const currentCell = event.target;
                const noteToMatch = currentCell.textContent.trim();

                if (noteToMatch && noteToMatch !== '?') {
                    currentCell.parentElement.classList.add('row-highlight');
                    currentCell.classList.add('hover-highlight');

                    document.querySelectorAll('.note-cell').forEach(otherCell => {
                        if (otherCell.textContent.trim() === noteToMatch) {
                            otherCell.classList.add('note-match-highlight');
                        }
                    });
                }
            }
        });

        table.addEventListener('mouseleave', () => {
            // Clear all highlights when the mouse leaves the entire table area
            document.querySelectorAll('.row-highlight, .hover-highlight, .note-match-highlight').forEach(el => {
                el.classList.remove('row-highlight', 'hover-highlight', 'note-match-highlight');
            });
        });
    }

    allScaleData.forEach(buildTable);

    console.log("tables.js: Finished populating all tables.");
    return allScales;
};
