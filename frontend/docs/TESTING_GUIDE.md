# Testing Guide - Music Theory Toolkit

## Overview

This guide covers the comprehensive testing strategy for the Music Theory Toolkit, with special focus on the **Modal Logic Validation System** - the most critical testing component for ensuring theoretical accuracy.

## Quick Start

### Essential Testing Commands
```bash
# Modal logic validation (most important)
npm run test:modal

# All tests
npm test

# Generate new test cases
node generate-comprehensive-test-cases.cjs
```

## Modal Logic Validation System

### What It Does
The Modal Logic Validation System is the cornerstone of our testing strategy, designed to systematically validate modal analysis across **all possible musical scenarios**:

- **232+ Generated Test Cases**: Algorithmic generation covering all 12 roots × 7 modes × multiple chord progression patterns
- **Cross-System Validation**: Tests Enhanced, Comprehensive, and Legacy modal analyzers simultaneously
- **Theoretical Correctness**: Validates results against music theory expectations
- **Conflict Detection**: Automatically identifies when different analyzers disagree
- **Boundary Testing**: Handles ambiguous cases and edge conditions

### Why It's Critical
Modal analysis is the most complex part of music theory analysis. The system prevents:
- Functional progressions being incorrectly identified as modal
- Modal progressions being missed (like the "G F C G" case that sparked this system)
- System conflicts between different analyzers
- Regression bugs when modifying modal logic

### Test Architecture

#### 1. Test Data Generation
```bash
# Generates comprehensive-modal-test-cases.json
node generate-comprehensive-test-cases.cjs
```

Creates systematic test cases:
- **Modal Characteristic Cases**: Clear modal progressions (I-bVII-IV-I for Mixolydian)
- **Functional Clear Cases**: Unambiguous functional harmony
- **Ambiguous Cases**: Could be interpreted either way
- **Edge Cases**: Boundary conditions and unusual progressions

#### 2. Test Execution
```bash
# Run all modal tests
npm run test:modal

# Specific categories
npm run test:modal -- -t "modal characteristic"
npm run test:modal -- -t "functional cases"

# Specific progressions
npm run test:modal -- -t "Am G Dm Am"
```

#### 3. Cross-System Validation
Each test case runs through:
- **Enhanced Modal Analyzer**: Primary modal detection system
- **Comprehensive Analysis Engine**: Unified analysis approach
- **Legacy Local Analysis**: Original chord progression analysis

Results are compared for consistency and theoretical accuracy.

## Standard Testing Categories

### Unit Tests
```bash
npm run test:unit
```
- Service layer functionality
- Utility functions
- Algorithm correctness
- Music theory calculations

### Component Tests
```bash
npm run test:component
```
- React component behavior
- User interaction simulation
- State management
- UI component integration

### End-to-End Tests
```bash
npm run test:e2e
```
- Complete user workflows
- MIDI device interaction
- Cross-tab functionality
- Performance testing

## Development Workflow Integration

### Before Committing Modal Changes
```bash
# Always run modal validation before committing
npm run test:modal
```

### During Modal Development
```bash
# Watch mode for immediate feedback
npm run test:modal -- --watch
```

### After Modifying Modal Logic Files
Any changes to the [20+ modal logic files](MODE_LOGIC_FILES.md) should trigger modal validation:
```bash
npm run test:modal
```

## Debugging Modal Issues

### Step-by-Step Investigation

1. **Run Specific Test**:
   ```bash
   npm run test:modal -- -t "your problematic progression"
   ```

2. **Analyze Console Output**:
   The test runner provides detailed breakdowns:
   - Expected vs actual results
   - Confidence scores
   - System agreement/conflicts
   - Theoretical validation issues

3. **Check Generated Test Data**:
   ```bash
   # Find similar test cases in the dataset
   grep -A 5 -B 5 "Am G Dm Am" comprehensive-modal-test-cases.json
   ```

4. **Compare Analyzer Results**:
   Each test shows results from all three analyzers:
   - Enhanced: Modal detection with confidence scores
   - Comprehensive: Primary approach identification
   - Legacy: Original algorithm results

### Common Issues and Solutions

#### False Positives (Functional → Modal)
- Check confidence thresholds (≥0.7 for modal detection)
- Review modal characteristic detection patterns
- Validate parent key calculation

#### False Negatives (Modal → Functional)
- Verify modal patterns are correctly implemented
- Check tonic center detection logic
- Review confidence scoring algorithms

#### System Conflicts
- Enhanced vs Comprehensive disagreement indicates core logic issues
- Enhanced vs Legacy conflicts may indicate improvements or regressions
- All three conflicting suggests fundamental theoretical problems

## Test Maintenance

### When to Regenerate Test Cases
```bash
node generate-comprehensive-test-cases.cjs
```

Regenerate when:
- Adding new modal patterns
- Modifying chord progression structures
- Expanding to new modes or scales
- Finding gaps in test coverage

### Keeping Tests Current
- Test data is version controlled to track evolution
- Clean up redundant tests regularly
- Update test descriptions as understanding evolves
- Maintain clear separation between test categories

## CI/CD Integration

### Automated Testing
```bash
# Full CI test suite
npm run test:ci
```

Includes:
- All unit and component tests
- End-to-end test suite
- Modal logic validation (via test:ci)
- Coverage reporting

### Quality Gates
- Modal tests must pass before deployment
- Coverage thresholds maintained
- Performance benchmarks validated

## Performance Considerations

### Test Execution Speed
- Modal validation tests ~232 cases systematically
- Parallel execution where possible
- Focused test runs during development
- Full suite for CI/CD validation

### Memory Usage
- Large test datasets managed efficiently
- JSON test data loaded once per test suite
- Cleanup between test categories

## Contributing New Tests

### Adding Modal Test Cases
1. Identify the musical scenario to test
2. Determine expected results (modal/functional, specific mode)
3. Add to test generation algorithm or create manual test case
4. Validate against all three analyzer systems
5. Document theoretical basis

### Test Categories
- **Modal Characteristic**: Clear modal progressions
- **Functional Clear**: Unambiguous functional harmony
- **Ambiguous**: Multiple valid interpretations
- **Edge Case**: Boundary conditions

## Advanced Testing Scenarios

### Stress Testing
```bash
# Large progression testing
npm run test -- -t "stress"
```

### Regression Testing
```bash
# Compare against baseline results
npm run test:modal -- --reporter=json > current-results.json
```

### Performance Profiling
```bash
# Performance analysis
npm run test:modal -- --reporter=verbose
```

## Troubleshooting

### Common Test Failures

#### "comprehensive-modal-test-cases.json not found"
```bash
node generate-comprehensive-test-cases.cjs
```

#### System Conflicts in Results
- Review recent changes to modal logic files
- Check for conflicting theoretical assumptions
- Validate test case expectations

#### Performance Issues
- Reduce test scope for development
- Use focused test patterns
- Check for memory leaks in analyzers

### Getting Help
- Check console output for detailed error analysis
- Review generated test case descriptions
- Compare working vs failing test patterns
- Consult music theory validation in test results

---

This testing system ensures the Music Theory Toolkit maintains theoretical accuracy while enabling confident development of complex modal analysis features.