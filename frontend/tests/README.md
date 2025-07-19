# Music Modes App - Test Framework

This directory contains the comprehensive test suite for the Music Modes App, implementing automated testing for the Smart Detection System and all related functionality.

## Test Framework Architecture

### Testing Stack
- **Playwright**: End-to-end testing for complex user workflows
- **Testing Library**: Component testing with user-centric approach
- **Vitest**: Unit testing with native Vite integration
- **JSDOM**: DOM simulation for component tests

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
│   └── algorithms/           # Algorithm tests
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

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Component Tests Only
```bash
npm run test:component
```

### E2E Tests Only
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

### Visual Regression Tests
```bash
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