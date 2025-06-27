document.addEventListener('DOMContentLoaded', function() {
    console.log("midi.js: DOM content loaded. Reverting to WebMidi.js library approach.");

    if (typeof WebMidi === 'undefined') {
        const statusText = document.getElementById('status-text');
        statusText.innerHTML = `<strong>Error:</strong> WebMidi library not found. Please make sure <code>webmidi.iife.js</code> is in the same folder as <code>index.html</code>.`;
        return;
    }

    // --- State Variables ---
    let playedNoteNumbers = [];
    let playedPitchClasses = new Set();
    let currentInput = null;
    let matchWasFound = false;
    let currentMode = '7';

    const allScales = window.populateAllTables();
    const NOTES = ["C", "C♯/D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
    const MINOR_KEYS = ["A", "B♭", "B", "C", "C♯/D♭", "D", "E♭", "E", "F", "F♯", "G", "G♯/A♭"];

    function handleMidiMessage(e) {
        const selectedMode = document.querySelector('input[name="scale-type"]:checked').value;
        const noteNumber = e.note.number;
        const pitchClass = noteNumber % 12;

        let needsReset = false;
        if (selectedMode !== currentMode) { needsReset = true; }
        if (matchWasFound) { needsReset = true; }
        if (currentMode === '7' && playedPitchClasses.size >= 7 && !playedPitchClasses.has(pitchClass)) { needsReset = true; }
        if (currentMode === '5' && playedPitchClasses.size >= 6 && !playedPitchClasses.has(pitchClass)) { needsReset = true; }

        if (needsReset) {
            playedNoteNumbers = [];
            playedPitchClasses.clear();
            document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
            document.getElementById('melody-suggestions-overlay').style.display = 'none';
            matchWasFound = false;
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
        const floatingNotesDisplay = document.getElementById('floating-notes-display');

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
        if(floatingNotesDisplay) floatingNotesDisplay.innerHTML = floatingText;
    }

    function findScaleMatch() {
        function setsAreEqual(setA, setB) {
            if (setA.size !== setB.size) return false;
            for (const item of setA) if (!setB.has(item)) return false;
            return true;
        }

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

    // --- REWRITTEN: Function for Key Suggestion Analysis ---
    function findKeySuggestions() {
        const overlay = document.getElementById('melody-suggestions-overlay');
        if (playedPitchClasses.size === 0) {
            overlay.style.display = 'none';
            return;
        }

        let matches = [];
        // Filter for only the 12 Major Scales (Ionian modes) to act as our parent keys.
        const parentMajorScales = allScales.filter(s => s.id.startsWith('major-scale-modes') && s.pitchClasses.size === 7 && s.id.endsWith('-0'));

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
        renderKeySuggestions(matches.slice(0, 5)); // Show top 5 key suggestions
    }

    // --- REWRITTEN: Function to render Key Suggestions ---
    function renderKeySuggestions(suggestions) {
        const overlay = document.getElementById('melody-suggestions-overlay');
        if (!suggestions || suggestions.length === 0) {
            overlay.style.display = 'none';
            return;
        }

        overlay.innerHTML = '<h3>Key Suggestions</h3>'; // New Title
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
                if (playedPitchClasses.has(pitch)) {
                    noteSpan.className = 'played'; // Highlight played notes
                } else {
                    noteSpan.className = 'not-played'; // Dim unplayed notes
                }
                notesDiv.appendChild(noteSpan);
            });

            itemDiv.appendChild(header);
            itemDiv.appendChild(notesDiv);
            overlay.appendChild(itemDiv);
        });

        overlay.style.display = 'block';
    }


    function setInputDevice(inputId) {
        const statusText = document.getElementById('status-text');
        if (currentInput) currentInput.removeListener("noteon");
        currentInput = WebMidi.getInputById(inputId);
        if (currentInput) {
            currentInput.addListener("noteon", handleMidiMessage, { channels: "all" });
            statusText.textContent = `Listening on: ${currentInput.name}`;
        } else {
            statusText.textContent = "Selected device not found.";
        }
    }

    function setupMidi() {
        const statusText = document.getElementById('status-text');
        const selectorContainer = document.getElementById('midi-input-selector');
        WebMidi.enable({ sysex: false }).then(() => {
            const inputs = WebMidi.inputs;
            if (inputs.length < 1) {
                statusText.textContent = "No MIDI input devices detected.";
                return;
            }
            const select = document.createElement('select');
            select.id = 'midi-devices';
            selectorContainer.innerHTML = '<strong>Select MIDI Input:</strong> ';
            selectorContainer.appendChild(select);
            inputs.forEach(input => {
                const option = document.createElement('option');
                option.value = input.id;
                option.textContent = input.name;
                select.appendChild(option);
            });
            setInputDevice(inputs[0].id);
            select.addEventListener('change', e => setInputDevice(e.target.value));
        }).catch(err => {
            statusText.innerHTML = `<strong>MIDI Error:</strong> ${err.message}`;
        });
    }

    function cleanupMIDI() {
        if (currentInput) currentInput.removeListener();
        if (WebMidi.enabled) WebMidi.disable();
    }

    setupMidi();
    window.addEventListener('beforeunload', cleanupMIDI);
    window.addEventListener('scroll', () => {
        const mainMidiStatus = document.getElementById('midi-status');
        const floatingNotesDisplay = document.getElementById('floating-notes-display');
        if (!mainMidiStatus || !floatingNotesDisplay) return;
        floatingNotesDisplay.classList.toggle('visible', window.scrollY > (mainMidiStatus.offsetTop + mainMidiStatus.offsetHeight));
    });
});
