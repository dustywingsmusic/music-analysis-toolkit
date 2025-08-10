# Development Tools

This directory contains services and utilities used for development, testing, and analysis validation. These are not part of the production runtime but support development workflows.

## Files

### `testChordProgressionAnalysis.ts`
**Status**: Development Tool  
**Purpose**: Browser console testing for chord progression analysis  
**Usage**: Manual testing and development validation  

**Description**: Provides a test function that can be run in the browser console to verify chord progression analysis functionality. Contains predefined test progressions and outputs detailed analysis results for debugging and validation.

**How to Use**:
```javascript
// In browser console
testChordProgressionAnalysis();
```

### `exhaustiveModalAnalysis.ts`
**Status**: Development Tool  
**Purpose**: Comprehensive modal analysis dataset generation  
**Usage**: Test case generation and validation  

**Description**: Generates exhaustive test cases for modal analysis validation. Creates comprehensive datasets covering:
- All chromatic roots with all 7 modes
- Common functional progressions in all keys
- Modal interchange patterns
- Edge cases and ambiguous progressions
- Cross-validation between analysis engines

**Key Features**:
- Generates 1000+ test cases automatically
- Validates consistency across different analyzers
- Exports JSON datasets for external analysis
- Provides statistical summaries of analysis accuracy

## Usage in Development

These tools are designed for:

1. **Manual Testing**: Quick validation of analysis changes
2. **Dataset Generation**: Creating comprehensive test suites  
3. **Performance Analysis**: Measuring analysis engine performance
4. **Cross-Validation**: Ensuring consistency between analysis systems
5. **Research**: Exploring music theory edge cases

## Integration with Test Suite

Some development tools generate data used by the automated test suite:
- `exhaustiveModalAnalysis.ts` → generates test data for validation tests
- Test datasets are used by `comprehensive-modal-individual-validation.test.ts`

## Running Tools

### Console Testing
```bash
# Run in browser console after loading app
npm run dev
# Then in browser console:
testChordProgressionAnalysis()
```

### Dataset Generation  
```bash
# Generate comprehensive test datasets
npm run test:modal  # Uses generated data
```

## Notes

- Tools may have external dependencies (fs, path) that only work in Node.js context
- Some tools are designed for browser console, others for Node.js scripts
- Generated datasets should be committed to repository for consistent testing
- Performance tools may take significant time to complete