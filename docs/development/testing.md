# Testing Strategy and Structure

## Overview

The music theory toolkit uses comprehensive testing to validate analysis accuracy and system reliability. Testing covers unit tests, component tests, and extensive musical theory validation.

## Test Organization

### Frontend Tests (`/frontend/tests/`)

```
tests/
├── setup.ts                    # Vitest configuration and globals
├── component/                  # React component tests
│   └── AnalysisHub.test.tsx   # Main analysis interface tests
├── unit/                      # Unit tests for services and utilities
│   ├── services/              # Service layer tests
│   ├── utils/                 # Utility function tests
│   └── constants/             # Constant validation tests
├── fixtures/                  # Test data and mock objects
├── utils/                     # Test utilities and matchers
└── generated/                 # Auto-generated test datasets
```

### Key Test Suites

#### 1. **Modal Analysis Validation** (`comprehensive-modal-individual-validation.test.ts`)
- Tests 728+ generated test cases across modal characteristics
- Categories: modal_characteristic, modal_seventh_variant, modal_vamp, modal_foil, functional_clear, ambiguous, edge_case
- Validates `EnhancedModalAnalyzer` accuracy and consistency
- Cross-validates with `FunctionalHarmonyAnalyzer` and `ComprehensiveAnalysisEngine`

#### 2. **Component Integration Tests** (`AnalysisHub.test.tsx`)
- Tests unified analysis interface with proper provider wrappers
- Validates MIDI integration, input methods, and result display
- Tests analysis flow from input to results

#### 3. **Service Layer Tests** (`services/*.test.ts`)
- `comprehensiveAnalysisService.test.ts` - End-to-end analysis coordination
- `functionalHarmonyAnalysis.test.ts` - Roman numeral analysis
- `enhancedModalAnalyzer.test.ts` - Modal characteristic detection
- `chordLogic.test.ts` - Chord parsing and MIDI detection

#### 4. **Dataset Validation** (`comprehensive-dataset-validation.test.ts`)
- Validates curated music theory dataset accuracy
- Tests against known progressions and theoretical expectations
- Ensures consistency across different analysis engines

## Test Data Generation

### Automated Test Case Generation
The system generates comprehensive test cases automatically:

```bash
# Generate modal analysis test cases
npm run test:modal

# Run specific test generator
node generate-comprehensive-test-cases.cjs
```

### Generated Datasets
- **`comprehensive-modal-test-cases.json`**: 728 modal analysis test cases
- **`comprehensive-music-theory-test-dataset.ts`**: Curated theoretical examples
- Categories cover clear modal cases, functional progressions, and ambiguous examples

## Testing Commands

### Frontend Testing
```bash
cd frontend/

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit           # Unit tests only
npm run test:component      # Component tests only
npm run test:modal          # Modal analysis validation

# Run in CI mode
npm run test:ci
```

### Backend Testing
```bash
cd backend/

# Run backend tests (if implemented)
pytest tests/
```

## Test Categories

### 1. **Modal Characteristic Tests**
Validate detection of clear modal patterns:
- **Mixolydian**: I-bVII-I, I-bVII-IV-I progressions
- **Dorian**: i-IV-i, natural 6th characteristics
- **Phrygian**: i-bII-i half-step cadences
- **Lydian**: I-#IV-V-I, raised 4th patterns
- **Expected**: High confidence (≥0.75) modal detection

### 2. **Functional Clear Tests**
Ensure functional progressions aren't misidentified as modal:
- **Classic patterns**: I-IV-V-I, ii-V-I, vi-IV-I-V
- **Expected**: Low modal confidence (<0.7), high functional confidence

### 3. **Ambiguous Cases**
Test boundary conditions and multi-interpretation scenarios:
- **Progressions**: Could be analyzed functionally or modally
- **Expected**: Mid-range confidence, comprehensive explanation

### 4. **Edge Cases**
Validate error handling and unusual inputs:
- **Single chords**: Minimal context
- **Chromatic progressions**: Non-diatonic harmony
- **Invalid input**: Malformed chord symbols
- **Expected**: Graceful handling, no crashes

## Testing Conventions

### Assertion Patterns
```typescript
// Modal analysis validation
expect(modalResult).not.toBeNull();
expect(modalResult.confidence).toBeGreaterThanOrEqual(0.7);
expect(modalResult.modeName).toBe('G Mixolydian');

// Functional analysis validation
expect(functionalResult.romanNumerals).toEqual(['I', 'bVII', 'IV', 'I']);
expect(functionalResult.keyCenter).toBe('G major');

// Cross-validation between analyzers
expect(comprehensiveResult.primaryApproach).toBe('modal');
```

### Test Data Structure
```typescript
interface ModalTestCase {
  id: string;
  chords: string[];
  parentKey?: string;
  expectedModal: boolean;
  expectedMode?: string;
  category: 'modal_characteristic' | 'functional_clear' | 'ambiguous';
  description: string;
  theoreticalBasis: string;
}
```

### Helper Functions
```typescript
// Reusable test utilities in tests/utils/
export const expectModalDetection = (result, expectedMode, minConfidence) => {
  expect(result).not.toBeNull();
  expect(result.modeName).toBe(expectedMode);
  expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
};
```

## Success Criteria

### Modal Analysis Accuracy
- **Modal Characteristic cases**: ≥90% detection rate with confidence ≥0.7
- **Functional Clear cases**: ≥95% should have modal confidence <0.7
- **System consistency**: All analyzers should agree on clear cases

### Component Tests
- **Provider integration**: All components render without context errors
- **Analysis flow**: Input → processing → results display works correctly
- **MIDI integration**: Real-time input handling functions properly

### Performance
- **Modal analysis**: Complete analysis in <100ms for typical progressions
- **Test suite**: Full test run completes in <30 seconds
- **Memory usage**: No memory leaks in component mounting/unmounting

## Quality Gates

### Pre-commit Hooks
- **ESLint**: Code quality and style consistency
- **TypeScript**: Type checking for test files
- **Test execution**: Critical tests must pass

### CI Pipeline
- **Unit tests**: All unit tests must pass
- **Component tests**: UI integration tests must pass
- **Modal validation**: Core modal analysis tests must achieve success criteria
- **Coverage**: Maintain >80% test coverage for critical services

## Extending Tests

### Adding New Modal Cases
1. Update test data generator (`generate-comprehensive-test-cases.cjs`)
2. Add new progression patterns and expected results
3. Regenerate test dataset with `npm run test:modal`
4. Validate new cases pass expected thresholds

### Adding Service Tests
1. Create test file in `tests/unit/services/`
2. Use consistent test structure and helpers
3. Cover happy path, edge cases, and error conditions
4. Add integration tests for service interactions

### Component Testing
1. Add test file in `tests/component/`
2. Include proper provider wrappers (`InputMethodProvider`, `AnalysisProvider`)
3. Test user interactions and state changes
4. Mock external dependencies appropriately

## Debugging Tests

### Modal Analysis Issues
```bash
# Generate detailed test results
npm run test:modal

# Check generated test report
cat modal-test-detailed-results.json | jq '.failures'

# Run specific failing test case
npx vitest run -t "test-case-123"
```

### Component Test Issues
```bash
# Run with debugging output
npm test -- --reporter=verbose tests/component/

# Check provider hierarchy
# Ensure: TooltipProvider > InputMethodProvider > AnalysisProvider > Component
```

This comprehensive testing strategy ensures the music theory toolkit maintains high accuracy and reliability while supporting rapid development and refactoring.
