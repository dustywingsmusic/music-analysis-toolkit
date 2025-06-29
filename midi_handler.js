// This script handles all low-level MIDI communication.
// Its only job is to listen for MIDI notes and dispatch an event.

document.addEventListener('DOMContentLoaded', function() {
    console.log("midi_handler.js: DOM content loaded.");

    if (typeof WebMidi === 'undefined') {
        document.getElementById('status-text').innerHTML = `<strong>Error:</strong> WebMidi library not found.`;
        return;
    }

    let currentInput = null;

    function handleMidiMessage(e) {
        // Create and dispatch a custom event with the note data.
        // The presentation_logic.js file will listen for this event.
        const noteEvent = new CustomEvent('noteplayed', {
            detail: { note: e.note }
        });
        document.dispatchEvent(noteEvent);
    }

    function setInputDevice(inputId) {
        if (currentInput) currentInput.removeListener("noteon");
        currentInput = WebMidi.getInputById(inputId);
        if (currentInput) {
            currentInput.addListener("noteon", handleMidiMessage, { channels: "all" });
            document.getElementById('status-text').textContent = `Listening on: ${currentInput.name}`;
            console.log(`MIDI Handler: Successfully listening on: ${currentInput.name}`);
        } else {
            document.getElementById('status-text').textContent = "Selected device not found.";
        }
    }

    function setupMidi() {
        const statusText = document.getElementById('status-text');
        WebMidi.enable({ sysex: false }).then(() => {
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
        }).catch(err => {
            statusText.innerHTML = `<strong>MIDI Error:</strong> ${err.message}`;
        });
    }

    function cleanupMIDI() {
        console.log("MIDI Handler: Disabling WebMidi to release port.");
        if (WebMidi.enabled) WebMidi.disable();
    }

    setupMidi();
    window.addEventListener('beforeunload', cleanupMIDI);
});
