// Use window.onload to ensure all page resources, including the MIDI
// library and system services, are fully ready before running the script.
window.onload = function() {
    console.log("midi.js: window.onload fired. Starting application script.");

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

    // Get references to UI elements once
    const clearButton = document.getElementById('clear-notes-btn');
    const floatingClearButton = document.getElementById('floating-clear-btn');
    const notesDisplay = document.getElementById('notes-display');
    const floatingNotesContent = document.getElementById('floating-notes-content');
    const melodyOverlay = document.getElementById('melody-suggestions-overlay');


    function resetSequence() {
        playedNoteNumbers = [];
        playedPitchClasses.clear();
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        if(melodyOverlay) melodyOverlay.style.display = 'none';
        matchWasFound = false;
        updateNotesDisplay();
    }

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

    function findScaleMatch() {
        console.log("--- findScaleMatch triggered ---");
        const setsAreEqual = (setA, setB) => setA.size === setB.size && [...setA].every(value => setB.has(value));

        const playedRootPitchClass = playedNoteNumbers.length > 0 ? Math.min(...playedNoteNumbers) % 12 : -1;
        const scalesToSearch = allScales.filter(s => s.pitchClasses.size === playedPitchClasses.size);

        console.log(`Played Notes (MIDI Numbers): [${playedNoteNumbers.join(', ')}]`);
        console.log(`Played Pitch Classes (Set): {${[...playedPitchClasses].join(', ')}}`);
        console.log(`Determined Root Pitch Class: ${playedRootPitchClass} (${NOTES[playedRootPitchClass]})`);
        console.log(`Searching through ${scalesToSearch.length} scales of the correct size.`);

        const bestMatch = scalesToSearch.find(scale =>
            scale.rootNote === playedRootPitchClass && setsAreEqual(scale.pitchClasses, playedPitchClasses)
        );

        if (bestMatch) {
            console.log("SUCCESS: Found a match!", bestMatch);
            const cell = document.getElementById(bestMatch.id);
            if (cell) {
                console.log("Highlighting cell:", bestMatch.id);
                cell.classList.add('highlight');
                cell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                matchWasFound = true;
            } else {
                console.error("Found a match, but could not find cell with ID:", bestMatch.id);
            }
        } else {
            console.log("No match found for the played notes with the determined root.");
        }
    }

    // --- REVISED: Now correctly finds and renders KEY suggestions ---
    function findKeySuggestions() {
        if (playedPitchClasses.size === 0) {
            if(melodyOverlay) melodyOverlay.style.display = 'none';
            return;
        }
        let matches = [];
        // Only consider the 12 Major Scales (Ionian modes) as parent keys
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
        renderKeySuggestions(matches.slice(0, 5)); // Show top 5 key suggestions
    }

    function renderKeySuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            if(melodyOverlay) melodyOverlay.style.display = 'none';
            return;
        }
        melodyOverlay.innerHTML = '<h3>Key Suggestions</h3>'; // Correct Title
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
            melodyOverlay.appendChild(itemDiv);
        });
        melodyOverlay.style.display = 'block';
    }

    function setInputDevice(inputId) {
        if (currentInput) currentInput.removeListener("noteon");
        currentInput = WebMidi.getInputById(inputId);
        if (currentInput) {
            currentInput.addListener("noteon", handleMidiMessage, { channels: "all" });
            document.getElementById('status-text').textContent = `Listening on: ${currentInput.name}`;
        }
    }

    function setupMidi() {
        console.log("midi.js: Running setupMidi()...");
        const statusText = document.getElementById('status-text');

        WebMidi.enable({ sysex: false })
            .then(() => {
                console.log("midi.js: WebMidi.enable() SUCCESS.");
                const inputs = WebMidi.inputs;
                const selectorContainer = document.getElementById('midi-input-selector');
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
            })
            .catch(err => {
                console.error("midi.js: WebMidi.enable() FAILED.", err);
                statusText.innerHTML = `<strong>MIDI Error:</strong> ${err.message}`;
            });
    }

    function cleanupMIDI() {
        console.log("midi.js: Tab unloading. Disabling WebMidi to release port.");
        if (WebMidi.enabled) WebMidi.disable();
    }

    // --- Application Initialization and Event Listeners ---
    setupMidi();

    clearButton.addEventListener('click', resetSequence);
    floatingClearButton.addEventListener('click', resetSequence);
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            resetSequence();
        }
    });
    window.addEventListener('beforeunload', cleanupMIDI);
    window.addEventListener('scroll', () => {
        const mainMidiStatus = document.getElementById('midi-status');
        const floatingNotesDisplay = document.getElementById('floating-notes-display');
        if (!mainMidiStatus || !floatingNotesDisplay) return;
        floatingNotesDisplay.classList.toggle('visible', window.scrollY > (mainMidiStatus.offsetTop + mainMidiStatus.offsetHeight));
    });
};
