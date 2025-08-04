# Modal Analysis Architecture: Parent Key Signature + Local Tonic Approach

## Core Principle

**This application consistently uses the Parent Key Signature + Local Tonic model for ALL modal analysis throughout the entire system.**

## Theoretical Foundation

### The Problem with "Key Center" Approach
- **Conflates concepts**: "G major" suggests G major key signature (1 sharp) when analyzing G Mixolydian
- **Creates confusion**: Mixes key signature (pitch collection) with tonic (perceived root)
- **Pedagogically harmful**: Reinforces "mode as alteration" misconception

### The Solution: Parent Key Signature + Local Tonic
- **Parent Key Signature**: The underlying scale and key signature (e.g., C major, no sharps/flats)
- **Local Tonic**: The note that functions as the tonal center (e.g., G)
- **Mode**: The combination (e.g., G Mixolydian = C major scale with G as tonic)

## Implementation Standard

### All Analysis Types Must Use This Model:

1. **Chord Progression Analysis**
2. **Melody Analysis**  
3. **Scale Analysis**
4. **Real-time MIDI Input**
5. **Mode Discovery**
6. **Reference Tables**

### User Input Format
```
Parent Key Signature: [Key] (e.g., "C major", "Bb major", "F# minor")
OR
Auto-detect parent key signature from musical content
```

### Analysis Output Format
```typescript
interface ModalAnalysisResult {
  parentKeySignature: string;      // "C Major (no sharps/flats)"
  parentKeyNotes: string[];        // ["C", "D", "E", "F", "G", "A", "B"]
  localTonic: string;              // "G"
  mode: string;                    // "G Mixolydian"
  modeNotes: string[];            // ["G", "A", "B", "C", "D", "E", "F"]
  modalCharacteristic: string;     // "Natural 7th (F) creates Mixolydian sound"
  enharmonicSpelling: "parent";    // Always use parent key signature spelling
}
```

## Consistency Requirements

### UI Display Standards
- **Never** show conflicting modal information between tabs
- **Always** display parent key signature and local tonic separately
- **Consistent** enharmonic spelling using parent key signature
- **Clear** explanations of parent scale relationships

### Analysis Algorithm Standards
- **Same** modal detection logic across all input types
- **Consistent** confidence scoring and ranking
- **Unified** chord-scale relationship analysis
- **Standardized** Roman numeral analysis based on local tonic within parent key

### Example: G F C G Progression

**Input**: 
- Chords: G F C G
- Parent Key Signature: C major (or auto-detected)

**Output**:
```
Parent Key Signature: C Major (no sharps or flats)
Local Tonic: G
Mode: G Mixolydian
Explanation: Uses C major scale notes (C D E F G A B) with G as the tonal center
Chord Analysis: I - ♭VII - IV - I (in G Mixolydian context)
Modal Characteristic: The ♭VII chord (F major) is characteristic of Mixolydian mode
```

## Files Requiring Updates

### Core Analysis Services
- `src/services/localChordProgressionAnalysis.ts`
- `src/services/realTimeModeDetection.ts`  
- `src/services/hybridAnalysisService.ts`
- `src/utils/music.ts`

### UI Components
- `src/components/EnhancedHarmonyTab.tsx`
- `src/components/QuestionDrivenMusicTool.tsx`
- `src/components/UnifiedResultsPanel.tsx`
- All reference table components

### Context and State Management
- `src/contexts/AnalysisContext.tsx`
- Update all interfaces to support parent key + tonic model

## Benefits of This Approach

### Theoretical Accuracy
- Correct modal relationships (modes as rotations, not alterations)
- Proper enharmonic spelling using parent key signatures
- Accurate chord-scale relationship analysis

### Pedagogical Value
- Teaches how modes actually work
- Prevents common modal misconceptions
- Consistent with standard music theory pedagogy

### User Experience
- Consistent results across all app features
- Clear, non-contradictory modal information
- Educational explanations of parent scale relationships

## Implementation Priority

1. **Document architectural decision** ✓
2. **Update core analysis algorithms**
3. **Modify input interfaces** 
4. **Refactor UI components**
5. **Update context management**
6. **Test consistency across all features**

## Quality Assurance

- **Cross-feature testing**: Same musical input produces consistent modal analysis
- **User journey validation**: Modal information stays consistent as users navigate
- **Theory validation**: All results align with standard music theory principles

---

**This architectural decision ensures the application provides consistent, theoretically sound, and pedagogically valuable modal analysis throughout the entire user experience.**