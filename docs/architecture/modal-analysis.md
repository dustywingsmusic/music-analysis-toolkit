# Modal Analysis Architecture

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

1. **Chord Progression Analysis** (via `ComprehensiveAnalysisEngine`)
2. **Melody Analysis** (via `UnifiedMusicInput`)
3. **Scale Analysis** (via `ScaleFinder`)
4. **Real-time MIDI Input** (via `MidiDetectionPanel`)
5. **Mode Discovery** (via `AnalysisHub`)
6. **Reference Tables** (via `ScaleTable`)

### User Input Format
- **Parent Key**: "C major", "A minor", "F# major"
- **Display**: "G Mixolydian (parent: C major)"
- **Analysis Results**: Always show both parent key and local tonic separately

## Enhanced Modal Analyzer Implementation

The `EnhancedModalAnalyzer` service implements sophisticated modal detection using a multi-stage approach:

### Analysis Flow
```
1. Input Validation & Edge Case Handling
   ↓
2. Chord Symbol Parsing & Validation
   ↓
3. Tonic Candidate Detection
   ↓
4. Multi-Candidate Analysis (parallel)
   ↓
5. Foil Pattern Detection (anti-pattern filtering)
   ↓
6. Confidence Scoring & Best Result Selection
   ↓
7. Result Validation & Return
```

### Key Features

#### 1. **Multi-Tonic Analysis**
- Tests multiple potential tonic centers
- Comparative confidence scoring
- Selects most coherent modal interpretation

#### 2. **Foil Pattern Detection**
- Identifies anti-modal patterns (strong functional progressions)
- Prevents false-positive modal detection
- Maintains theoretical accuracy

#### 3. **Evidence-Based Confidence**
- **High confidence (≥0.7)**: Clear modal characteristics (bVII-I, etc.)
- **Medium confidence (0.4-0.7)**: Some modal elements present
- **Low confidence (<0.4)**: Weak or ambiguous modal characteristics

#### 4. **Parent Key Integration**
- Uses user-provided parent key when available
- Intelligently infers parent key from chord collection
- Validates parent-local relationships

## Modal Characteristics Detected

### Mixolydian Mode
- **Primary**: bVII-I cadential motion
- **Patterns**: I-bVII-I, I-bVII-IV-I, bVII-IV-I
- **Examples**: G-F-G (G Mixolydian), D-C-G-D (D Mixolydian)

### Dorian Mode
- **Primary**: Natural 6th with minor tonic
- **Patterns**: i-IV-i, i-bVI-bVII-i
- **Examples**: Am-D-Am (A Dorian), Em-C-D-Em

### Phrygian Mode
- **Primary**: bII-i half-step cadence
- **Patterns**: i-bII-i, bII-bIII-i
- **Examples**: Em-F-Em (E Phrygian)

### Lydian Mode
- **Primary**: #IV characteristic tone
- **Patterns**: I-II-I, I-#IV-V-I
- **Examples**: C-D-C (C Lydian), F-B-C-F

### Aeolian Mode
- **Primary**: Natural minor with bVI-bVII
- **Patterns**: i-bVI-bVII-i, i-iv-bVII-i
- **Examples**: Am-F-G-Am (A Aeolian)

### Locrian Mode
- **Primary**: Diminished tonic with bII
- **Patterns**: i°-bII-i°
- **Examples**: B°-C-B° (B Locrian)

## Integration with Comprehensive Analysis

The modal analyzer works within the broader `ComprehensiveAnalysisEngine`:

### Analysis Hierarchy
1. **Functional Analysis**: Primary Roman numeral analysis
2. **Modal Enhancement**: Applied when modal characteristics detected
3. **Chromatic Analysis**: Advanced harmonic techniques

### Decision Logic
- **Modal confidence ≥ 0.7**: Present modal analysis prominently
- **Modal confidence 0.4-0.7**: Show as secondary perspective
- **Modal confidence < 0.4**: Functional analysis preferred

## Testing & Validation

The modal analysis system includes comprehensive testing:

### Test Categories
- **Modal Characteristic**: Clear modal progressions (expected high confidence)
- **Modal Seventh Variant**: Extended chords in modal context
- **Modal Vamp**: Repetitive modal patterns
- **Modal Foil**: Functional progressions that should NOT be modal
- **Functional Clear**: Pure functional harmony
- **Ambiguous**: Could be interpreted multiple ways
- **Edge Case**: Boundary conditions and error handling

### Success Criteria
- **Modal Characteristic cases**: ≥75% detection rate with confidence ≥0.7
- **Functional Clear cases**: Modal confidence should be <0.7
- **System consistency**: All analyzers should agree on clear cases

## UI/UX Integration

### Analysis Display
- **Primary Approach**: Determined by confidence comparison
- **Modal Enhancement**: Shown when applicable with clear explanation
- **Educational Context**: "When to use modal analysis" guidance

### Input Support
- **Parent Key Selection**: Optional but improves accuracy
- **Example Progressions**: Pre-loaded modal examples by mode
- **Real-time Validation**: Immediate feedback on modal characteristics

## Maintenance Guidelines

### Code Organization
- **Primary Service**: `enhancedModalAnalyzer.ts`
- **Legacy Code**: `modalAnalyzer.ts` (archived in services/legacy/)
- **Integration**: Via `comprehensiveAnalysisService.ts`

### Consistency Requirements
- All modal analysis MUST use Parent Key + Local Tonic model
- UI components MUST display both parent key and local tonic
- Analysis results MUST be consistent across all input methods

### Future Enhancements
- **Audio Analysis**: Extend to melodic/audio input
- **Advanced Modes**: Support for exotic scales and world music modes
- **Interactive Learning**: Visual mode relationships and transformations

This architecture ensures theoretically sound, pedagogically valuable, and consistent modal analysis throughout the entire application.
