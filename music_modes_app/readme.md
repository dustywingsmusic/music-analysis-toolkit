# Music Scale Finder: Help & Guide

This tool is designed to help you identify musical scales in real-time and explore the relationships between different modes and keys.

## Core Features

### 1. MIDI Input & Device Selection

*   **Connection:** The app automatically detects any MIDI controllers connected to your computer when the page loads.
*   **Device Selector:** If you have multiple MIDI devices, you can choose which one you want the app to listen to using the dropdown menu.

### 2. Detection Modes

The app has three distinct modes for analyzing the notes you play:

*   **7-note Scale (Default):** This mode is for identifying standard seven-note scales (and their modes). To get a match, you must play exactly 7 unique notes. The app will determine the root based on the lowest note played and highlight the corresponding scale in the tables.
*   **5-note / Blues:** This mode is for identifying pentatonic (5-note) and blues (6-note) scales. A match will be attempted when you have played exactly 5 unique notes, and again if you play a 6th. The root is also determined by the lowest note played.
*   **Melody Mode:** This is the most flexible mode, designed for musical analysis. As you play notes, this mode will show a "Key Suggestions" overlay on the right side of the screen. It analyzes the notes in your melody and suggests the most likely parent keys that your melody fits into, sorted by the number of matching notes. This is incredibly useful for:
    *   Figuring out the key of a song you are learning by ear.
    *   Finding which scales you can use to improvise over a chord progression.

## Interactive UI

*   **Live Note Display:** The notes you play are shown in the status box and in a floating overlay that appears when you scroll down.
*   **Root Note Highlighting:** In the "7-note" and "5-note" modes, the identified root note of your sequence is highlighted in red.
*   **Interactive Tables:**
    *   **Hover over a note cell:** The cell's row will be highlighted, the cell itself will get a darker highlight, and every other cell in all tables containing the same note will get a bold blue border. This makes it easy to see where a specific note appears across different scales and modes.
    *   **Automatic Scrolling:** When a scale is successfully identified, the app will automatically scroll to the highlighted cell in the table.

## Advanced Musical Concepts

This tool is particularly powerful for understanding and applying advanced harmonic concepts.

### Modal Interchange / Modal Substitution

This is the practice of "borrowing" chords from a parallel mode. For example, if you are in the key of C Major, you can create more interesting and emotional chord progressions by borrowing chords from C Minor (Aeolian), C Dorian, or C Phrygian.

*   **How to use the tool:**
    1.  Play the C Major scale to see its notes and modes.
    2.  Look at the row for "C Aeolian Scale" in the Major Scale table. You will see it contains the notes C, D, E♭, F, G, A♭, B♭.
    3.  This means chords built from these notes, like **Fm** (F-A♭-C) or an **A♭ Major** chord (A♭-C-E♭), can be "borrowed" to use in your C Major progression for a richer sound.

### "Cush Chords" (Concept from Open Studio)

This is a specific and very tasteful application of modal interchange, often used in jazz, R&B, and neo-soul. The idea is to substitute a standard diatonic chord with a "softer" or more colorful chord from a parallel mode, creating a harmonic "cushion."

#### Parallel Mode Substitution:
Borrowing chords from the parallel minor (or other parallel modes) that share the same tonic.

*   **How to use the tool:**
    1.  You are in the key of C Major. The standard ii-V-I progression is Dm7 - G7 - Cmaj7.
    2.  Look at the "C Melodic Minor Scale" row in its table. The second mode is D Dorian ♭2, which contains the notes D, E♭, F, G, A, B, C♯. Building a chord on D gives you a **Dm(maj7)** chord (D-F-A-C♯).
    3.  You can substitute this Dm(maj7) for the standard Dm7 in your progression. It creates a much more sophisticated and "cushy" sound that still functions as a ii chord.
    4.  The tables make it easy to see all the available notes in any parallel mode, allowing you to instantly find these beautiful "cush chord" substitutions.

### Parent Key Substitution

Instead of simply borrowing parallel chords from the parallel minor (C minor/Aeolian), this approach uses the **parent key** of the desired mode. This is a very powerful way to access new sounds.

#### Your Example: C Aeolian

1.  **Start with the I, IV, V progression in C Major:**
    *   I = C Major
    *   IV = F Major
    *   V = G Major
2.  **Identify the target mode and its parent key:**
    *   **Target Mode:** C Aeolian
    *   **Parent Key:** C Aeolian is the 6th mode of the E-flat Major scale. So, the parent key is **E-flat Major**.
    *   The notes of C Aeolian are C, D, Eb, F, G, Ab, Bb.
    *   The notes of Eb Major are Eb, F, G, Ab, Bb, C, D.
    *   As you can see, they are the same set of notes, just starting on a different root.
3.  **Apply the substitution rule:**
    *   Keep the tonic chord (I) from the original key: **C Major**.
    *   Substitute the other chords (IV and V) with the chords built on the same scale degrees from the **parent key** (Eb Major).
4.  **Find the IV and V chords in the parent key (Eb Major):**
    *   Eb Major scale: Eb (I), F (ii), G (iii), Ab (IV), Bb (V), C (vi), D (vii°).
    *   The IV chord in Eb Major is **Ab Major**.
    *   The V chord in Eb Major is **Bb Major**.
5.  **Construct the new "cush" progression:**
    *   Original: I (Cmaj) - IV (Fmaj) - V (Gmaj)
    *   "Cush" version: **I (Cmaj) - IV (Abmaj) - V (Bbmaj)**

#### Why is this a different approach from parallel mode borrowing?

The parallel mode approach would simply borrow the iv and v chords from C minor (C Aeolian). Those would be:

*   iv in C Aeolian (C minor) = F minor
*   v in C Aeolian (C Aeolian) = G minor

So, a parallel mode substitution would give you: C Major - F minor - G minor.

Your parent key substitution gives you: C Major - Ab Major - Bb Major.

As you can hear, these are very different sounds.

*   **C Major - F minor - G minor** sounds very classic, like a minor key progression inserted into a major key. The F minor and G minor chords are common modal interchange chords (iv and v from the parallel minor).
*   **C Major - Ab Major - Bb Major** sounds more cinematic, epic, and expansive. The Ab Major is the bVI and the Bb Major is the bVII from C minor. These are also common borrowed chords, but the way Open Studio frames it through the "parent key" makes the substitutions very systematic and easy to explore.

#### The Power of this Method

This "parent key" method is brilliant for a few reasons:

*   **It's a mental shortcut:** Instead of memorizing all the borrowed chords for every parallel mode (Aeolian, Dorian, Phrygian, etc.), you just need to know the parent key of the mode.
*   **It promotes consistency:** By always using the same degree from the parent key, you create a clear harmonic logic. You're not just grabbing random chords from another scale.
*   **It creates interesting root movement:** In your example, the root movement goes C -> Ab -> Bb, which is a very powerful and modern-sounding progression.
