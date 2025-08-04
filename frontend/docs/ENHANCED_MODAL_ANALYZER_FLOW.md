# Enhanced Modal Analyzer Flow Diagram

## Overview
The Enhanced Modal Analyzer uses a multi-stage analysis approach with confidence-based scoring to identify modal characteristics in chord progressions.

## Main Flow: `analyzeModalCharacteristics(chordSymbols, parentKey?)`

```mermaid
graph TD
    A[Input: chordSymbols, parentKey?] --> B{Edge Cases Check}
    B -->|Empty/Single chord| C[Return null]
    B -->|Valid input| D[Parse Chord Symbols]
    
    D --> E[detectTonicCandidates]
    E --> F[Generate Tonic Candidates Array]
    F --> G[For each candidate: analyzeWithTonic]
    
    G --> H[Multiple ModalAnalysisResults]
    H --> I[Check for Foil Patterns Across ALL Results]
    I -->|Foil detected| J[Force low confidence 0.3]
    I -->|No foil| K[Select highest confidence result]
    
    J --> L[Apply confidence threshold ≥0.4]
    K --> L
    L -->|Pass threshold| M[Return ModalAnalysisResult]
    L -->|Fail threshold| N[Return null]
```

## Stage 1: Tonic Candidate Detection

```mermaid
graph TD
    A[detectTonicCandidates] --> B[Initialize candidate weights]
    B --> C[Heavy weight: first chord +3.0]
    C --> D[Heavy weight: last chord +3.0]
    D --> E{First == Last?}
    E -->|Yes| F[Massive bonus +5.0]
    E -->|No| G[Weight other chords +1.0]
    F --> G
    G --> H[Sort by weight]
    H --> I[Top candidate + parentKey]
    I --> J{parentKey provided?}
    J -->|Yes| K[Add parentKey root as alternative]
    J -->|No| L[Infer parentKey = tonic + ' major']
    K --> M[Return top 2 candidates]
    L --> M
```

## Stage 2: Individual Tonic Analysis (`analyzeWithTonic`)

```mermaid
graph TD
    A[analyzeWithTonic: tonic, parentKey, wasParentKeyProvided] --> B[Generate Roman Numerals]
    B --> C[Detect Modal Patterns]
    C --> D[Collect Evidence]
    D --> E[Calculate Base Confidence]
    
    E --> F[Determine Mode Name]
    F --> G[Apply Foil Detection]
    G -->|Foil detected| H[Reduce to confidence 0.3]
    G -->|No foil| I[Check for confidence boosts]
    
    I -->|I-IV-I pattern| J[Boost to 0.75]
    I -->|Other| K[Keep base confidence]
    
    H --> L[Check ambiguous context]
    J --> L
    K --> L
    
    L -->|No parent key provided| M[Cap at 0.65]
    L -->|Parent key provided| N[Keep confidence]
    
    M --> O[Return ModalAnalysisResult]
    N --> O
```

## Stage 3: Roman Numeral Generation

```mermaid
graph TD
    A[generateModalRomanNumeral] --> B[Calculate interval from tonic]
    B --> C{Chord Quality}
    C -->|major/major7/dom7| D[Use major Roman numeral]
    C -->|minor/minor7| E[Use minor Roman numeral]
    C -->|diminished| F[Use diminished Roman numeral]
    C -->|augmented| G[Add + suffix]
    C -->|suspended| H[Add sus suffix]
    
    D --> I[Return Roman numeral]
    E --> I
    F --> I
    G --> I
    H --> I
    
    subgraph "Roman Numeral Map"
        J[0: I/i/i°<br/>1: bII/bii/bii°<br/>2: II/ii/ii°<br/>3: bIII/biii/biii°<br/>4: III/iii/iii°<br/>5: IV/iv/iv°<br/>6: #IV/#iv/#iv°<br/>7: V/v/v°<br/>8: bVI/bvi/bvi°<br/>9: VI/vi/vi°<br/>10: bVII/bvii/bvii°<br/>11: VII/vii/vii°]
    end
```

## Stage 4: Modal Pattern Detection

```mermaid
graph TD
    A[detectModalPatterns] --> B[Check against pattern library]
    B --> C{Pattern matches?}
    C -->|Yes| D[Add to results with strength]
    C -->|No| E[Check partial matches]
    E --> F[Sort by strength × matches]
    F --> G[Return sorted pattern results]
    
    subgraph "Pattern Library Examples"
        H[Ionian: I-IV-I<br/>Dorian: i-IV-i<br/>Phrygian: i-bII-i<br/>Lydian: I-II-I<br/>Mixolydian: I-bVII-I<br/>Aeolian: i-bVI-bVII-i<br/>Locrian: i°-bII-i°]
    end
```

## Stage 5: Confidence Calculation

```mermaid
graph TD
    A[calculateConfidence] --> B[Base: average evidence strength]
    B --> C[Pattern bonus: 30% weight]
    C --> D[Structural bonus: +0.1]
    D --> E[Consistency bonus: +0.1]
    E --> F{Strong patterns?}
    F -->|Yes| G[Boost to ≥0.75]
    F -->|No| H{Multiple evidence types?}
    H -->|Yes| I[Boost to ≥0.72]
    H -->|No| J{Functional patterns?}
    J -->|High functional| K[Cap at 0.5]
    J -->|Low functional| L[Keep calculated confidence]
    
    G --> M[Return final confidence]
    I --> M
    K --> M
    L --> M
```

## Stage 6: Foil Pattern Detection

```mermaid
graph TD
    A[detectFoilPatterns] --> B[Join Roman numerals]
    B --> C[Normalize: remove 7ths, extensions]
    C --> D{Check foil patterns}
    D -->|Match found| E[Return true]
    D -->|No match| F[Return false]
    
    subgraph "Foil Patterns"
        G[I-V-I: Pure functional<br/>I-IV-V-I: Functional progression<br/>ii-V-I: Jazz cadence<br/>i-iv-i: Dorian foil → Aeolian<br/>i-II-i: Phrygian foil<br/>i-V-i: Minor functional<br/>i°-V-i°: Locrian foil]
    end
```

## Stage 7: Mode Name Determination

```mermaid
graph TD
    A[determineModeName] --> B{Pattern-based detection available?}
    B -->|Yes| C[Use best pattern match]
    B -->|No| D[Evidence-based detection]
    
    C --> E{Ambiguous pattern like I-IV?}
    E -->|Yes| F[Check parent key context]
    E -->|No| G[Return pattern mode]
    
    F -->|Tonic = parent root| H[Return Ionian]
    F -->|Tonic = 5th of parent| I[Return Mixolydian]
    F -->|Other relationship| J[Calculate mode from interval]
    
    D --> K[Check chord qualities]
    K --> L{Has bVII, bII, II, etc.?}
    L -->|Yes| M[Determine by characteristics]
    L -->|No| N[Use parent key calculation]
    
    G --> O[Return mode name]
    H --> O
    I --> O
    J --> O
    M --> O
    N --> O
```

## Key Design Principles

### 1. Multi-Candidate Analysis
- Generates multiple tonic candidates based on structural importance
- Analyzes each candidate independently
- Selects best result based on confidence

### 2. Evidence-Based Scoring
- Structural evidence (chord positions, repetition)
- Pattern evidence (known modal progressions)
- Contextual evidence (parent key relationships)
- Intervallic evidence (characteristic modal intervals)

### 3. Foil Detection Override
- Cross-candidate foil detection prevents wrong tonic selection
- Functional patterns (I-V-I, ii-V-I) flagged as non-modal
- Dorian foils (i-iv-i) and Phrygian foils (i-II-i) detected

### 4. Confidence Thresholds
- Minimum 0.4 confidence for detection
- Lower 0.25 threshold for vamp patterns (2 chords)
- Ambiguous patterns (no parent key) capped at 0.65
- Foil patterns forced to 0.3

### 5. Parent Key Context
- Explicit parent keys provide harmonic context
- Missing parent keys indicate ambiguous analysis
- Inferred parent keys (`tonic + ' major'`) treated as ambiguous

## Critical Fix: Foil Pattern Override

The major breakthrough was adding cross-candidate foil detection:

```typescript
// Check for foil patterns across ALL candidates before selection
const foilResults = validResults.filter(result => {
  if (!result.romanNumerals) return false;
  return this.detectFoilPatterns(result.romanNumerals);
});

// If ANY candidate is detected as foil, override with low confidence
if (foilResults.length > 0) {
  const foilResult = foilResults[0];
  foilResult.confidence = 0.3;
  return foilResult.confidence >= 0.4 ? foilResult : null;
}
```

This ensures that foil patterns are consistently detected regardless of which tonic candidate analysis generates them, preventing high-confidence wrong results from being selected.