# Legacy Services

This directory contains services that have been superseded by newer implementations but are kept for historical reference and backward compatibility.

## Files

### `modalAnalyzer.ts`
**Status**: Legacy - Superseded
**Replacement**: `../enhancedModalAnalyzer.ts`
**Last Updated**: Phase 0 code organization
**Deprecation Warning**: @deprecated - Use enhancedModalAnalyzer.ts instead

**Description**: Original modal analysis implementation using rule-based approach. This was the first attempt at systematic modal detection with evidence scoring. Superseded by `enhancedModalAnalyzer.ts` which has:
- Stronger confidence scoring
- Better edge case handling
- Improved pattern recognition
- More accurate parent key detection

**Why Kept**:
- Historical reference for analysis evolution
- Contains some experimental patterns that may be valuable
- Used by deprecated `musicTheoryEngine.ts` in experimental directory
- May be useful for comparative testing

## Migration Guide

If code is still importing `modalAnalyzer.ts`:

**Replace:**
```typescript
import { ModalAnalyzer } from '@/services/modalAnalyzer';
```

**With:**
```typescript
import { EnhancedModalAnalyzer } from '@/services/enhancedModalAnalyzer';
```

**Key Differences:**
- Enhanced version has better confidence thresholds
- Improved handling of ambiguous progressions
- More comprehensive evidence collection
- Better integration with comprehensive analysis framework

## Usage Notes

- **DO NOT** use in new code
- Existing imports should be migrated to enhanced version
- May be referenced by experimental or test code
- Safe to remove once all references are migrated

## Deprecation Timeline

1. **Phase 0**: Moved to legacy directory with deprecation warnings
2. **Phase 1**: All production imports migrated to enhanced version
3. **Future**: Remove once no experimental code depends on it
