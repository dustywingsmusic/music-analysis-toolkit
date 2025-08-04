
# MOUSE_CHORD_INPUT_DESIGN

## 🎨 Concept Overview

This design provides an **interactive, visually intuitive interface** for selecting and sequencing chords using a mouse. It is based on a **concentric-ring layout** that combines music theory relationships with flexible chord construction tools. The goal is to allow a user to:

1. **Create any chord** (root + quality + extensions/modifiers).
2. **Visually understand harmonic proximity** between chords (e.g., circle-of-fifths adjacency, relative/parallel relationships).
3. **Quickly select and preview chords** with minimal clicks, while still supporting detailed customization.

---

## 1. 🧭 User Interface Description

### 1.1 Layout
- **Inner Ring (Root Notes):**  
  - 12 segments arranged in **circle-of-fifths order** (C → G → D … → F).  
  - Each segment subdivided into sharp/flat enharmonic options (e.g., C♯ vs D♭).  
  - Clicking selects root pitch class and spelling.

- **Middle Ring (Chord Qualities):**  
  - Displays common qualities after a root is chosen: Major, minor, augmented, diminished (°), half-diminished (ø), sus2, sus4, 6, 9, 11, 13, etc.  
  - Supports toggles for diminished types (full vs half).  
  - Hover tooltips show resulting chord name dynamically.

- **Outer Ring (Extensions & Accidentals):**  
  - Adds modifications: 7, maj7, min7, add9, ♭5, ♯5, ♭9, ♯9, add11, add13.  
  - Accidental toggle for root transposition (e.g., switch G♯ ↔ A♭).  
  - Optional inversion and voicing selection.

### 1.2 Interactive Feedback
- Selecting a chord highlights:
  - **Relative major/minor** (I ↔ vi) positions.
  - **Dominant and subdominant neighbors**.
  - **Tritone substitutions** (opposite positions on ring).
  - **Diminished symmetries** (minor-third spacing).
- Hover previews chord name and intervals before selection.
- Dragging cursor across inner ring creates a **progression path**, visually mapping distance between chords.

### 1.3 Playback & Preview
- Clicking chord plays block chord sound.
- Holding click or using drag-arpeggiation plays sequential tones.
- Space or Enter triggers chord audition without selection change.

### 1.4 Visual Design
- **Color coding:**  
  - Major = warm colors, minor = cool, diminished = neutral or grey, augmented = bright.  
  - Extensions highlight with softer accent.
- **Scalable for desktop & mobile**, finger-friendly hit targets.
- **Accessible labels:** ARIA text for screen readers, high-contrast mode toggle.

---

## 2. 📦 Data Model

Chord selections are represented as:

```json
{
  "root": { "pc": 8, "spell": "G♭" },
  "quality": "min",
  "extensions": ["7", "♭5"],
  "inversion": null
}
```

- **pc:** integer 0–11 representing pitch class.  
- **spell:** string for enharmonic spelling (C#, Db, etc.).  
- **quality:** chord type.  
- **extensions:** list of modifiers.  
- **inversion:** (optional) inversion number.

---

## 3. 🔁 Harmonic Proximity Logic

- **Circle of Fifths:** distance computed as ±1 for adjacent fifth neighbors.  
- **Relative major/minor:** root ±3 semitones.  
- **Parallel relationship:** same root, different quality.  
- **Tritone substitution:** ±6 semitones.  
- **Diminished family:** ±3 intervals highlight alternative symmetrical roots.  
- **Spiral array model** (optional) can be used for more advanced proximity mapping.

---

## 4. 🧩 Event Flow and API

| Action                  | Event Handler                       | Effect                               |
|-------------------------|--------------------------------------|---------------------------------------|
| Click root              | `onRootSelect(pc, spell)`           | Activates quality ring                |
| Click quality           | `onQualitySelect(quality)`          | Activates extensions ring             |
| Click extension         | `onExtensionToggle(ext)`            | Updates chord preview                 |
| Toggle accidental       | `onRootAccidentalToggle()`          | Changes spelling, updates label       |
| Hover                   | `onHoverHighlight(type, id)`        | Shows preview, highlights related     |
| Drag chord              | `onChordDragTo(targetPc)`           | Draws progression arc                 |
| Play chord              | `onPlayPreview()`                   | Plays audio preview                   |

---

## 5. ⚙️ Technical Requirements

### 5.1 Frontend
- **Rendering:** SVG or HTML Canvas for concentric ring drawing.
- **Framework:** React or vanilla JavaScript (optional: WebGL for animation).
- **Responsive scaling:** dynamic ring radius based on screen size.
- **Accessible navigation:** keyboard arrows, tab order, screen reader support.

### 5.2 Chord Engine
- Library or internal module to:
  - Parse `{root, quality, extensions}` into semitone set.
  - Handle enharmonic names.
  - Generate chord spelling for display and export.

### 5.3 Playback
- **Web Audio API** or **MIDI output**.
- Low-latency chord playback.
- Optional arpeggio mode or inversion preview.

### 5.4 Performance
- Hover computations cached.
- Animation at 60fps for smooth transitions.
- Lazy loading chord tables (50+ chord types × 12 roots).

### 5.5 Export/Integration
- Export chord progressions in:
  - JSON
  - MIDI
  - MusicXML
- Embeddable widget API:
  ```json
  {
    "chordChain": [
      {"root":0,"quality":"maj7","extensions":[]},
      {"root":2,"quality":"m7","extensions":["b5"]}
    ]
  }
  ```

---

## 6. 🎯 Key Use Cases

- Build **any chord** in under three clicks.  
- Visualize **harmonic proximity** of next chord choices.  
- Support **jazz and classical progressions** with extended chords.  
- Offer **educational tooltips** for beginners.  
- Provide **fast input for advanced users** composing with a mouse.  
