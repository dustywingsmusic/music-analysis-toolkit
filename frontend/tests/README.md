# Music Modes App - Test Framework

This directory contains the comprehensive test suite for the Music Modes App, implementing automated testing for the Smart Detection System, Modal Logic Validation, and all related functionality.

## Test Framework Architecture

### Testing Stack
- **Playwright**: End-to-end testing for complex user workflows
- **Testing Library**: Component testing with user-centric approach
- **Vitest**: Unit testing with native Vite integration
- **JSDOM**: DOM simulation for component tests
- **Comprehensive Modal Analysis**: Systematic validation of modal logic across all systems

### Directory Structure

```
tests/
├── README.md                 # This file
├── config/                   # Test configuration files
│   ├── playwright.config.ts  # Playwright configuration
│   ├── vitest.config.mts      # Vitest configuration
│   └── setup.ts         # Global test setup
├── fixtures/                 # Test data and fixtures
│   ├── musical-data.ts       # Musical scales, chords, notes
│   ├── midi-data.ts          # MIDI test data
│   └── user-scenarios.ts     # Common user interaction scenarios
├── mocks/                    # Mock implementations
│   ├── midi-mock.ts          # WebMIDI API mock
│   ├── services-mock.ts      # Service layer mocks
│   └── components-mock.ts    # Component mocks
├── utils/                    # Test utilities and helpers
│   ├── test-helpers.ts       # Common test helper functions
│   ├── midi-simulator.ts     # MIDI input simulation
│   ├── assertions.ts         # Custom assertions
│   └── setup-helpers.ts      # Test setup utilities
├── unit/                     # Unit tests
│   ├── services/             # Service layer tests
│   ├── hooks/                # Custom hooks tests
│   ├── utils/                # Utility function tests
│   ├── algorithms/           # Algorithm tests
│   └── tools/                # Modal analysis validation tools
├── component/                # Component tests
│   ├── midi/                 # MIDI-related components
│   ├── detection/            # Detection system components
│   ├── ui/                   # UI components
│   └── integration/          # Component integration tests
├── e2e/                      # End-to-end tests
│   ├── smart-detection/      # Smart detection workflows
│   ├── chord-analysis/       # Chord analysis workflows
│   ├── user-workflows/       # Complete user scenarios
│   └── performance/          # Performance tests
└── reports/                  # Test reports and coverage
    ├── coverage/             # Coverage reports
    ├── playwright-report/    # Playwright test reports
    └── screenshots/          # Visual regression screenshots
```

## Test Categories

### 🎵 Modal Logic Validation (Primary Focus)
**Comprehensive systematic testing of all modal analysis systems**
- **712 generated test cases** covering all modal scenarios
- **7 test categories**: modal_characteristic, modal_seventh_variant, modal_vamp, modal_foil, functional_clear, ambiguous, edge_case
- **Cross-system validation**: Enhanced, Comprehensive, and Legacy analyzers
- **Theoretical correctness**: Music theory validation against expected results
- **System conflict detection**: Automatic identification of analyzer disagreements
- **Boundary testing**: Ambiguous cases and edge conditions
- **Performance validation**: Confidence score calibration and accuracy

### Phase 1: Unified Detection System
- Complete heptatonic scale detection (7+ notes)
- Pentatonic/hexatonic detection (5-6 notes)
- Chord and partial scale detection (3-4 notes)
- Minimal input detection (1-2 notes)

### Phase 2: UI Simplification
- Detection toggle functionality
- Analysis focus dropdown behavior
- State management consistency

### Phase 3: Enhanced User Experience
- Smart defaults functionality
- Learning behavior tests
- Enhanced contextual help
- Advanced progressive disclosure

### Chord Algorithm Tests
- Basic chord detection (major/minor triads)
- Advanced chord detection (7th, suspended)
- Chord inversions
- Complex chord progressions

### Integration Tests
- Component integration
- State management consistency
- Cross-component communication

### Performance & Edge Cases
- Rapid note input handling
- Memory leak detection
- Error boundary testing
- Accessibility compliance

## Running Tests

### 🎯 Modal Logic Validation (Recommended)
**Run comprehensive modal analysis validation with all 712 test cases:**
```bash
# Full modal logic validation (all systems, all test cases) - RECOMMENDED
npm run test:modal

# Generate new test data AND run tests (complete workflow)
npm run test:modal:full

# With detailed output and specific patterns
npm run test -- tests/unit/tools/comprehensive-modal-test-runner.test.ts --run -t "modal characteristic"
npm run test -- tests/unit/tools/comprehensive-modal-test-runner.test.ts --run -t "functional cases"

# Test specific cases (e.g., Am G Dm Am with C major parent)
npm run test -- tests/unit/tools/comprehensive-modal-test-runner.test.ts --run -t "Am G Dm Am"
```

### 📊 Generate New Test Cases
**Create comprehensive test dataset (run before testing):**
```bash
# Generate all modal test cases systematically
node generate-comprehensive-test-cases.cjs

# This creates comprehensive-modal-test-cases.json with 712 test cases
# Including all 12 roots × 7 modes × multiple variants and categories
```

### ⚡ Quick Modal Testing
**Run only modal logic validation:**
```bash
# Modal tests only (recommended for modal logic development)
npm run test:modal

# With specific test pattern
npm run test:modal -- -t "modal characteristic"
npm run test:modal -- -t "Am G Dm Am"
```

### Standard Test Commands
```bash
# All Tests
npm test

# Unit Tests Only
npm run test:unit

# Component Tests Only
npm run test:component

# E2E Tests Only
npm run test:e2e

# Coverage Report
npm run test:coverage

# Visual Regression Tests
npm run test:visual
```

## Test Data Management

### Musical Test Data
- Predefined scales and modes
- Chord progressions and inversions
- MIDI note sequences
- Expected detection results

### User Scenarios
- Common user workflows
- Edge case scenarios
- Performance test scenarios
- Accessibility test scenarios

## Continuous Integration

Tests are designed to run in CI/CD environments with:
- Parallel test execution
- Visual regression detection
- Performance monitoring
- Coverage reporting
- Accessibility auditing

## Contributing to Tests

When adding new features:
1. Add unit tests for new functions/services
2. Add component tests for new UI components
3. Add integration tests for cross-component features
4. Add E2E tests for new user workflows
5. Update test data fixtures as needed

## Test Maintenance

- Tests are organized by feature area for easy maintenance
- Mock data is centralized and reusable
- Test utilities provide consistent testing patterns
- Regular test review and cleanup scheduled

## Integration with Development Workflow

### When to Run Modal Tests
- **Before committing** modal analysis changes: `npm run test:modal`
- **During development** of modal features: `npm run test:modal -- --watch`
- **After modifying** any of the 20+ modal logic files (see MODE_LOGIC_FILES.md)
- **When investigating** modal detection issues or bugs

### CI/CD Integration
The comprehensive modal tests are integrated into the CI pipeline via `npm run test:ci`, ensuring all modal logic changes are validated before deployment.

### Test Data Management
- **Generated Test Cases**: `comprehensive-modal-test-cases.json` contains 712 algorithmic test cases
- **Test Categories**: 7 categories including modal variants, functional cases, and ambiguous boundaries
- **Regeneration**: Run `node generate-comprehensive-test-cases.cjs` when modal patterns change
- **Version Control**: Test data file is committed to track modal logic evolution

### Debugging Modal Issues
1. Run the specific test: `npm run test:modal -- -t "your progression"`
2. Check the console output for detailed analysis breakdown
3. Compare Enhanced, Comprehensive, and Legacy analyzer results
4. Review the generated test data to understand expected vs actual results