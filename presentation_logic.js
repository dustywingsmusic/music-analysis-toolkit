// This script handles all presentation logic, such as scale matching,
// highlighting, and updating the UI displays.

document.addEventListener('DOMContentLoaded', function() {
    console.log("presentation_logic.js: DOM content loaded.");

    // --- State Variables ---
    let playedNoteNumbers = [];
    let playedPitchClasses = new Set();
    let matchWasFound = false;
    let currentMode = '7';

    const allScales = window.populateAllTables();
    const NOTES = ["C", "C♯/D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

    // --- Event Listener for notes from midi_handler.js ---
    document.addEventListener('noteplayed', function(event) {
        handleNoteInput(event.detail.note);
    });

    function resetSequence() {
        playedNoteNumbers = [];
        playedPitchClasses.clear();
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        document.getElementById('melody-suggestions-overlay').style.display = 'none';
        matchWasFound = false;
        updateNotesDisplay();
    }

    function handleNoteInput(note) {
        const selectedMode = document.querySelector('input[name="scale-type"]:checked').value;
        const noteNumber = note.number;
        const pitchClass = noteNumber % 12;

        let needsReset = false;
        if (selectedMode !== currentMode) { needsReset = true; }
        if (matchWasFound) { needsReset = true; }
        if (currentMode === '7' && playedPitchClasses.size >= 7 && !playedPitchClasses.has(pitchClass)) { needsReset = true; }
        if (currentMode === '5' && playedPitchClasses.size >= 6 && !playedPitchClasses.has(pitchClass)) { needsReset = true; }

        if (needsReset) {
            resetSequence();
        }

        currentMode = selectedMode;

        if (!playedPitchClasses.has(pitchClass)) {
            playedNoteNumbers.push(noteNumber);
            playedPitchClasses.add(pitchClass);
        }

        updateNotesDisplay();

        if (currentMode === 'melody') {
            findKeySuggestions();
        } else {
            const playedCount = playedPitchClasses.size;
            if (currentMode === '7' && playedCount === 7) {
                findScaleMatch();
            } else if (currentMode === '5' && (playedCount === 5 || playedCount === 6)) {
                findScaleMatch();
            }
        }
    }

    function updateNotesDisplay() {
        const notesDisplay = document.getElementById('notes-display');
        const floatingNotesContent = document.getElementById('floating-notes-content');

        const lowestNoteNumber = playedNoteNumbers.length > 0 ? Math.min(...playedNoteNumbers) : -1;
        const rootPitchClass = lowestNoteNumber !== -1 ? lowestNoteNumber % 12 : -1;

        const notesHtml = playedNoteNumbers.map(num => {
            const pc = num % 12;
            const noteName = NOTES[pc];
            if (pc === rootPitchClass && currentMode !== 'melody') {
                return `<span style="color: red; font-weight: bold;">${noteName}</span>`;
            }
            return `<span>${noteName}</span>`;
        }).join(', ');

        const floatingText = notesHtml ? `Notes: ${notesHtml}` : '';

        if(notesDisplay) notesDisplay.innerHTML = notesHtml;
        if(floatingNotesContent) floatingNotesContent.innerHTML = floatingText;
    }

    // --- LOGIC RESTORED ---
    function findScaleMatch() {
        const setsAreEqual = (setA, setB) => setA.size === setB.size && [...setA].every(value => setB.has(value));
        const playedRootPitchClass = playedNoteNumbers.length > 0 ? Math.min(...playedNoteNumbers) % 12 : -1;
        const scalesToSearch = allScales.filter(s => s.pitchClasses.size === playedPitchClasses.size);

        const bestMatch = scalesToSearch.find(scale =>
            scale.rootNote === playedRootPitchClass && setsAreEqual(scale.pitchClasses, playedPitchClasses)
        );

        if (bestMatch) {
            const cell = document.getElementById(bestMatch.id);
            if (cell) {
                cell.classList.add('highlight');
                cell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                matchWasFound = true;
            }
        }
    }

    // --- LOGIC RESTORED ---
    function findKeySuggestions() {
        if (playedPitchClasses.size === 0) {
            document.getElementById('melody-suggestions-overlay').style.display = 'none';
            return;
        }
        let matches = [];
        const parentMajorScales = allScales.filter(s => s.id.startsWith('major-scale-modes') && s.id.endsWith('-0'));

        parentMajorScales.forEach(scale => {
            let matchCount = 0;
            playedPitchClasses.forEach(playedNote => {
                if (scale.pitchClasses.has(playedNote)) {
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                const rootNoteName = NOTES[scale.rootNote];
                const relativeMinorRoot = (scale.rootNote + 9) % 12;
                const relativeMinorName = NOTES[relativeMinorRoot];

                matches.push({
                    name: `${rootNoteName} Major / ${relativeMinorName} Minor`,
                    matchCount: matchCount,
                    pitchClasses: scale.pitchClasses
                });
            }
        });

        matches.sort((a, b) => b.matchCount - a.matchCount);
        renderKeySuggestions(matches.slice(0, 5));
    }

    // --- LOGIC RESTORED ---
    function getScaleNameFromCellId(cellId) {
        const cell = document.getElementById(cellId);
        if (!cell) return "Unknown Scale";
        const row = cell.parentElement;
        const scaleName = row.cells[0].textContent;
        const modeName = cell.closest('table').querySelector('thead tr').cells[cell.cellIndex].textContent;
        return `${scaleName} (${modeName})`;
    }

    // --- LOGIC RESTORED ---
    function renderKeySuggestions(suggestions) {
        const overlay = document.getElementById('melody-suggestions-overlay');
        if (!suggestions || suggestions.length === 0) {
            overlay.style.display = 'none';
            return;
        }

        overlay.innerHTML = '<h3>Key Suggestions</h3>';
        suggestions.forEach(s => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'suggestion-item';

            const header = document.createElement('div');
            header.className = 'suggestion-header';
            header.textContent = `${s.name} (${s.matchCount}/${playedPitchClasses.size} match)`;

            const notesDiv = document.createElement('div');
            notesDiv.className = 'suggestion-notes';

            const sortedPitches = Array.from(s.pitchClasses).sort((a,b)=>a-b);
            sortedPitches.forEach((pitch, index) => {
                const noteSpan = document.createElement('span');
                noteSpan.textContent = NOTES[pitch] + (index < sortedPitches.length - 1 ? ', ' : '');
                noteSpan.className = playedPitchClasses.has(pitch) ? 'played' : 'not-played';
                notesDiv.appendChild(noteSpan);
            });

            itemDiv.appendChild(header);
            itemDiv.appendChild(notesDiv);
            overlay.appendChild(itemDiv);
        });

        overlay.style.display = 'block';
    }

    // --- UI Event Listeners ---
    document.getElementById('clear-notes-btn').addEventListener('click', resetSequence);
    document.getElementById('floating-clear-btn').addEventListener('click', resetSequence);
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            resetSequence();
        }
    });
    window.addEventListener('scroll', () => {
        const mainMidiStatus = document.getElementById('midi-status');
        const floatingNotesDisplay = document.getElementById('floating-notes-display');
        if (!mainMidiStatus || !floatingNotesDisplay) return;
        floatingNotesDisplay.classList.toggle('visible', window.scrollY > (mainMidiStatus.offsetTop + mainMidiStatus.offsetHeight));
    });
});
