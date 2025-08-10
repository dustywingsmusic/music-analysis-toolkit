# Mode Logic Files in Music Theory Application

## 🎼 Core Mode Logic Files

### **Primary Analysis Services**

1. **`src/services/enhancedModalAnalyzer.ts`** ⭐ **MAIN MODAL ENGINE**
   - `EnhancedModalAnalyzer` class
   - `ModalAnalysisResult` interface
   - `ModalEvidence` interface
   - Pattern-based modal detection
   - Confidence scoring with evidence types
   - Roman numeral generation for modal contexts

2. **`src/services/comprehensiveAnalysisService.ts`** ⭐ **ORCHESTRATION LAYER**
   - `ComprehensiveAnalysisEngine` class
   - `ModalEnhancementResult` interface
   - Coordinates functional + modal + chromatic analysis
   - Modal vs functional comparison logic
   - Decision tree for when to use modal analysis

3. **`src/services/localChordProgressionAnalysis.ts`** ⭐ **LEGACY MODAL LOGIC**
   - `ModalCharacteristic` interface
   - `analyzeModalCharacteristics()` function
   - Modal movement detection (`I-bVII`, `bII-I`, etc.)
   - Parent key + local tonic approach implementation

### **Supporting Mode Services**

4. **`src/services/modalDetectionFix.ts`**
   - `ModalDetectionResult` interface
   - Enhanced modal detection algorithms
   - Evidence collection and scoring

5. **`src/services/modalAnalyzer.ts`**
   - `ModalAnalyzer` class (older version)
   - `ModalAnalysisResult` interface
   - Pattern detection and rule-based analysis

6. **`src/services/musicTheoryEngine.ts`**
   - `analyzeWithModalPriority()` method
   - Modal vs functional priority decisions
   - Integrated analysis coordination

7. **`src/services/realTimeModeDetection.ts`**
   - MIDI-based real-time modal detection
   - Live mode inference from note sequences
   - Session-based mode tracking

### **Scale and Theory Data**

8. **`src/utils/scaleInformation.ts`** ⭐ **NEW SCALE LOGIC**
   - Mode interval definitions
   - Scale formula calculations
   - Parent key derivation for modes
   - Sharp vs flat notation selection

9. **`src/constants/scales.ts`**
   - Mode definitions and intervals
   - Scale degree mappings
   - Traditional modal data

10. **`src/constants/mappings.ts`**
    - Scale-to-mode mappings
    - Theoretical relationships

### **Supporting Utilities**

11. **`src/services/scaleDataService.ts`**
    - Scale data access and manipulation
    - Mode relationship calculations

12. **`src/services/keySuggester.ts`**
    - Modal interchange detection
    - Key signature suggestions with modal context

13. **`src/utils/music.ts`**
    - Basic music theory utilities
    - Note and interval calculations

---

## 🧪 Test Files with Mode Logic

### **Core Modal Tests**

1. **`tests/unit/services/enhancedModalAnalyzer.test.ts`**
   - Tests for EnhancedModalAnalyzer class
   - Pattern recognition validation
   - Evidence collection testing

2. **`tests/unit/services/modalAnalysisDataDriven.test.ts`**
   - Data-driven modal analysis tests
   - Comprehensive test case coverage

3. **`tests/unit/services/modalAnalysisEdgeCases.test.ts`**
   - Edge case handling
   - Error condition testing

4. **`tests/unit/services/modalAnalysisIntegration.test.ts`**
   - Integration testing between modal services
   - End-to-end modal analysis workflows

5. **`tests/unit/utils/scaleInformation.test.ts`**
   - Scale information utility tests
   - Mode derivation validation

### **Integration Tests**

6. **`tests/unit/services/comprehensiveAnalysisService.test.ts`**
   - Comprehensive analysis engine tests
   - Modal enhancement integration

7. **`tests/unit/services/comprehensiveAnalysisEngine.test.ts`**
   - Engine coordination tests
   - Multi-approach analysis validation

8. **`tests/unit/services/localChordProgressionAnalysis.test.ts`**
   - Legacy modal analysis tests
   - Parent key + local tonic validation

### **Test Data and Fixtures**

9. **`src/test-data/comprehensive-music-theory-test-dataset.ts`**
   - Modal test cases and expected results
   - Comprehensive modal progression examples

10. **`tests/fixtures/musical-data.ts`**
    - Modal chord progressions
    - Test data for modal scenarios

---

## 🔧 UI and Integration Files

### **User Interface Components**

1. **`src/components/DualLensAnalysisPanel.tsx`**
   - Modal lens display logic
   - Scale information integration
   - Modal vs functional comparison UI

2. **`src/hooks/useUnifiedResults.ts`**
   - Modal result state management
   - Analysis result coordination

### **Service Integration**

3. **`src/services/hybridAnalysisService.ts`**
   - Hybrid functional + modal analysis
   - Analysis coordination logic

4. **`src/services/musicTheoryIntegration.ts`**
   - Modal interchange explanations
   - Theory integration utilities

---

## 📊 Analysis Summary

### **Primary Mode Logic Concentrations:**

1. **Enhanced Modal Analyzer** (`enhancedModalAnalyzer.ts`) - **Most Important**
   - 500+ lines of sophisticated modal detection
   - Pattern recognition, evidence scoring, Roman numeral generation
   - Core of the modern modal analysis system

2. **Comprehensive Analysis Service** (`comprehensiveAnalysisService.ts`) - **Orchestration**
   - 500+ lines coordinating functional + modal analysis
   - Decision logic for when to apply modal analysis
   - Comparison and explanation generation

3. **Local Chord Progression Analysis** (`localChordProgressionAnalysis.ts`) - **Legacy System**
   - 900+ lines including modal logic (lines 800-900)
   - Original modal detection implementation
   - Parent key + local tonic approach

4. **Scale Information Utility** (`scaleInformation.ts`) - **New Addition**
   - 200+ lines of mode formula and scale generation
   - Parent key calculation for modes
   - UI display formatting

### **Recommended Extraction Strategy:**

**Core Modal Logic to Extract:**
1. Mode interval definitions and formulas
2. Pattern recognition algorithms
3. Evidence collection and scoring
4. Roman numeral generation for modal contexts
5. Parent key derivation logic
6. Sharp vs flat notation selection

**Testing Architecture to Improve:**
1. Centralized mode definition constants
2. Isolated pattern recognition functions
3. Evidence scoring algorithms
4. Modal vs functional decision logic
5. Scale generation and formatting utilities

This analysis shows that mode logic is distributed across **20+ files** with the core concentration in 4 primary files. The logic would benefit from extraction into a more modular, testable architecture.
