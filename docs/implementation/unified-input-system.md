# Unified Music Input System

## Overview
Comprehensive input system providing consistent experience across all music theory analysis features. Supports three input methods (MIDI, mouse, keyboard) and handles various musical input types with intelligent validation and chord recognition.

## Core Components

### UnifiedMusicInput Component
**Location**: `/src/components/ui/unified-music-input.tsx`

**Features**:
- **Universal Input Methods**: Keyboard typing, visual mouse selection, MIDI input
- **Type-Aware Validation**: Context-based validation (melody vs chord vs progression)
- **Chord Recognition**: Automatic detection from note selections and MIDI input
- **MIDI Integration**: Works with existing `useMidi` hook with advanced chord detection
- **Visual Feedback**: Real-time validation, suggestions, status indicators
- **Input History**: Recent inputs for quick reuse

## Input Type Behaviors

### `melody`
- Preserves note order and sequence
- Allows duplicate pitch classes in different octaves
- MIDI input accumulates notes in real-time
- Visual picker shows chromatic notes

### `scale`
- Removes duplicate pitch classes
- Enables chord recognition for harmonic analysis
- MIDI input filters duplicates by pitch class
- Visual picker shows chromatic notes

### `chord`
- Expects single chord input
- Automatic chord detection from MIDI simultaneous notes
- Visual picker shows common chords with inversions
- Real-time chord recognition and validation

### `progression`
- Supports both chord symbols and Roman numerals
- Visual picker includes quick progression templates
- Validation ensures format consistency
- Pattern recognition for common progressions

## Advanced MIDI Features

### Analysis Focus Modes
- **`automatic`**: Smart detection based on input type
- **`chord`**: Hold notes for chord detection
- **`complete`**: Full scale analysis
- **`pentatonic`**: Pentatonic scale focus

### Chord Recognition
- Automatic chord detection when 3+ notes played simultaneously
- Real-time feedback with live display of played notes
- Integration with existing chord detection logic

## Integration Example
```typescript
import UnifiedMusicInput from './ui/unified-music-input';
import { useMidi } from '../hooks/useMidi';

function MyAnalysisComponent() {
  const [input, setInput] = useState('');
  const midiData = useMidi(/* callbacks */);

  return (
    <UnifiedMusicInput
      value={input}
      onChange={setInput}
      label="Enter musical input"
      inputType="melody" // or 'scale', 'chord', 'progression'
      midiData={midiData}
      onValidation={(isValid, suggestions) => {
        // Handle validation feedback
      }}
      onChordDetected={(chords) => {
        // Handle detected chords
      }}
      enableChordRecognition
      showSuggestions
    />
  );
}
```

## Performance Optimizations
- **Debounced Validation**: Prevents excessive validation calls
- **Memoized Computations**: Caches expensive chord calculations
- **MIDI Cleanup**: Automatic cleanup of MIDI listeners
- **Event Debouncing**: Prevents memory leaks from rapid events

## Accessibility Features
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast Mode**: Visual indicators work in high contrast
- **Motor Accessibility**: Large touch targets, debounced inputs

## Files
- `/src/components/ui/unified-music-input.tsx` - Main component
- `/src/utils/musicInputParser.ts` - Parsing utilities
- Enhanced existing MIDI and delightful UI components
