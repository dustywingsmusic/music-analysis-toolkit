function startApp() {
    console.log("midi.js: WebMidi is ready, starting application.");

    // --- State Variables ---
    let playedNoteNumbers = [];
    let playedPitchClasses = new Set();
    let currentInput = null;
    let currentOutput = null;
    let audioContext = null;
    let matchWasFound = false;
    let currentMode = '7';

    const allScales = window.populateAllTables();
    const NOTES = ["C", "C♯/D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

    // Convert MIDI note number to WebMidi note name format (e.g., 60 -> "C4")
    function convertMidiNumberToNoteName(midiNumber) {
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const octave = Math.floor(midiNumber / 12) - 1;
        const noteIndex = midiNumber % 12;
        return noteNames[noteIndex] + octave;
    }

    // Convert MIDI note number to frequency in Hz
    function midiToFrequency(midiNumber) {
        return 440 * Math.pow(2, (midiNumber - 69) / 12);
    }

    // Play a tone using Web Audio API
    function playTone(midiNumber, duration = 500) {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const frequency = midiToFrequency(midiNumber);
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        // Set up envelope (attack and release)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }

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

        // Play the note back to the user for audio feedback
        if (currentOutput && currentOutput.channels) {
            try {
                const noteName = convertMidiNumberToNoteName(noteNumber);
                currentOutput.channels[1].playNote(noteName, {duration: 500});
            } catch (error) {
                console.log("Could not play MIDI note:", error);
            }
        }

        // Always play audible tone via Web Audio API
        try {
            playTone(noteNumber, 500);
        } catch (error) {
            console.log("Could not play audio tone:", error);
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

    function findScaleMatch() { /* ... function body unchanged ... */ }
    function findKeySuggestions() { /* ... function body unchanged ... */ }
    function renderKeySuggestions(suggestions) { /* ... function body unchanged ... */ }

    function setInputDevice(inputId) {
        if (currentInput) currentInput.removeListener("noteon");
        currentInput = WebMidi.getInputById(inputId);
        if (currentInput) {
            currentInput.addListener("noteon", handleMidiMessage, { channels: "all" });
            document.getElementById('status-text').textContent = `Listening on: ${currentInput.name}`;
        }
    }

    function setupMidi() {
        const statusText = document.getElementById('status-text');

        WebMidi.enable({ sysex: false })
            .then(() => {
                const inputs = WebMidi.inputs;
                const outputs = WebMidi.outputs;
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

                if (outputs.length > 0) {
                    currentOutput = outputs[0];
                    console.log("midi.js: Using MIDI output:", currentOutput.name);
                } else {
                    console.log("midi.js: No MIDI output devices detected. Using Web Audio API for feedback.");
                }
            })
            .catch(err => {
                statusText.innerHTML = `<strong>MIDI Error:</strong> ${err.message}`;
            });
    }

    function cleanupMIDI() {
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
}

// --- NEW: Robust initialization check ---
function checkAndStart() {
    if (window.WebMidi) {
        startApp();
    } else {
        // If the library isn't ready, check again shortly.
        setTimeout(checkAndStart, 50);
    }
}

// Wait for the basic DOM to be ready before starting the check.
document.addEventListener('DOMContentLoaded', checkAndStart);
