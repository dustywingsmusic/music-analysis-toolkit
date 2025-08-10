# Experimental Services

This directory contains experimental services that are not currently used in the production application but are kept for research and development purposes.

## Files

### `musicTheoryEngine.ts`
**Status**: Experimental
**Purpose**: Rule-based music theory analysis engine with modular architecture
**Warning**: Not integrated into main application runtime
**Used by**: Development testing only

**Description**: Implements a comprehensive rule-based system for music theory analysis with evidence scoring and multiple interpretation handling. Contains experimental approaches to modal detection that may be integrated into the main application in the future.

### `musicTheoryIntegration.ts`
**Status**: Experimental/Legacy
**Purpose**: Integration layer for bridging old and new analysis systems
**Warning**: Not imported by runtime code
**Used by**: Documentation references only

**Description**: Provides backward compatibility interfaces and migration paths for integrating rule-based analysis with existing systems. Contains experimental integration patterns that may inform future architecture decisions.

## Usage Notes

- These files are **NOT** imported by production code
- They may be referenced in documentation and development tools
- Tests for these services may exist but are not part of the main test suite
- Use caution when modifying - these may be referenced by development scripts

## Integration Status

These services are experimental and should not be integrated into production without thorough testing and architectural review. The main application uses:
- `enhancedModalAnalyzer.ts` for modal analysis
- `comprehensiveAnalysisService.ts` for comprehensive analysis
- `hybridAnalysisService.ts` for coordinated analysis

## Future Plans

These experimental services may be:
1. Integrated into production after validation
2. Used as reference for new feature development
3. Deprecated if better approaches are developed
4. Moved to archive if no longer needed
