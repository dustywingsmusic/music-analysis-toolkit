# Contextual Help System Integration Examples

This document shows how to integrate the contextual help system with existing components in the music theory application.

## Integration Points

### 1. UnifiedResultsPanel Integration

```typescript
// In UnifiedResultsPanel.tsx
import MusicTermHighlighter from '../help/MusicTermHighlighter';

// Wrap analysis content with contextual help
<MusicTermHighlighter
  context={{ type: 'functional', subtype: 'cadence_analysis' }}
>
  <p><strong>Analysis:</strong> Features strong V-I authentic cadences</p>
</MusicTermHighlighter>

// For modal analysis results
<MusicTermHighlighter
  context={{ type: 'modal', subtype: 'mode_identification' }}
>
  <p><strong>Mode:</strong> {analysis.mode}</p>
  <p><strong>Parent Key:</strong> {analysis.key}</p>
</MusicTermHighlighter>

// For chromatic harmony
<MusicTermHighlighter
  context={{ type: 'chromatic', subtype: 'secondary_dominants' }}
>
  <div className="modal-chord-item">
    <strong>{modalChord.chord || modalChord}</strong>
    {modalChord.mode && <span> - contains secondary dominants</span>}
  </div>
</MusicTermHighlighter>
```

### 2. EnhancedHarmonyTab Integration

```typescript
// In EnhancedHarmonyTab.tsx - Input labels and descriptions
<MusicTermHighlighter context={{ type: 'general', subtype: 'input_help' }}>
  <Label htmlFor="chord-progression">
    Enter chord progression using Roman numerals or chord symbols:
  </Label>
</MusicTermHighlighter>

<MusicTermHighlighter context={{ type: 'functional', subtype: 'roman_numerals' }}>
  <p className="input-panel__help text-muted-foreground">
    Enter chords separated by spaces. Use | to separate measures.
    Comprehensive analysis with functional, modal, and chromatic perspectives!
  </p>
</MusicTermHighlighter>

// In results display
<MusicTermHighlighter
  context={{ type: 'functional', subtype: 'chord_analysis' }}
  onViewInTables={handleViewInTables}
>
  <div className="comprehensive-results-panel space-y-6">
    {/* Analysis results with automatic term highlighting */}
    <p>Roman numeral: {analysis.romanNumeral}</p>
    <p>Function: {formatChordFunction(analysis.function)}</p>
    <p>Contains plagal cadence and authentic cadence patterns</p>
  </div>
</MusicTermHighlighter>
```

### 3. DualLensAnalysisPanel Integration

```typescript
// In DualLensAnalysisPanel.tsx
import MusicTermHighlighter from '../help/MusicTermHighlighter';

const DualLensAnalysisPanel = ({ result, onViewInTables }) => {
  return (
    <div className="dual-lens-analysis">
      {/* Functional Analysis Section */}
      <MusicTermHighlighter
        context={{ type: 'functional', subtype: 'roman_numeral_analysis' }}
      >
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle>Functional Harmony Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Key Center:</strong> {result.functional.keyCenter}</p>
            <p><strong>Progression Type:</strong> {result.functional.progressionType}</p>
            <div className="chord-analysis-grid">
              {result.functional.chords.map((chord, index) => (
                <div key={index} className="chord-analysis-item">
                  <p><strong>Roman Numeral:</strong> {chord.romanNumeral}</p>
                  <p><strong>Function:</strong> {chord.function}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </MusicTermHighlighter>

      {/* Modal Enhancement Section */}
      {result.modal && (
        <MusicTermHighlighter
          context={{ type: 'modal', subtype: 'modal_enhancement' }}
        >
          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle>Modal Enhancement</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This progression contains modal characteristics that suggest
                 Mixolydian mode due to the bVII-I cadence pattern.</p>
              <p><strong>Modal Chords:</strong> {result.modal.modalChords.join(', ')}</p>
            </CardContent>
          </Card>
        </MusicTermHighlighter>
      )}
    </div>
  );
};
```

## Specific Term Highlighting Examples

### Example 1: Functional Harmony Context

**User Input:** "Am F C G" in C major

**Auto-highlighted terms in results:**
- "vi-IV-I-V progression" → Shows tooltip explaining circle of fifths motion
- "authentic cadence" → Context-aware definition for functional analysis
- "predominant function" → Explains role of IV chord in functional harmony

### Example 2: Modal Analysis Context

**User Input:** "G F C G" in C major

**Auto-highlighted terms in results:**
- "bVII-I cadence" → Modal-specific definition focusing on Mixolydian character
- "Mixolydian mode" → Full mode explanation with characteristic intervals
- "parallel modes" → Explains relationship to C major parent scale

### Example 3: Chromatic Harmony Context

**User Input:** "C A7 Dm G7 C"

**Auto-highlighted terms in results:**
- "secondary dominant" → Advanced explanation of V/ii function
- "tonicization" → How A7 temporarily makes Dm sound like tonic
- "voice leading" → Chromatic motion in chord progressions

## CSS Integration

Add these styles to your global CSS or component styles:

```css
/* Base music term styling */
.music-term {
  border-bottom: 1px dotted #0066cc;
  cursor: help;
  transition: all 0.2s ease;
  position: relative;
}

.music-term:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-bottom: 2px solid #0066cc;
  border-radius: 3px;
  padding: 0 2px;
  margin: 0 -2px;
}

.music-term:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
  border-radius: 3px;
}

/* Context-specific highlighting */
.music-term-highlighter[data-context-type="functional"] .music-term {
  border-color: #2563eb;
}

.music-term-highlighter[data-context-type="modal"] .music-term {
  border-color: #7c3aed;
}

.music-term-highlighter[data-context-type="chromatic"] .music-term {
  border-color: #ea580c;
}

/* Mobile touch feedback */
@media (hover: none) {
  .music-term:active {
    background: #dbeafe;
    transform: scale(1.02);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .music-term {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .music-term {
    border-bottom-width: 2px;
  }

  .music-term:hover {
    background: #000;
    color: #fff;
  }
}
```

## Progressive Enhancement Strategy

### Phase 1: Core Implementation
1. Add `MusicTermHighlighter` to `UnifiedResultsPanel`
2. Implement basic tooltip functionality
3. Add 20 most common terms to glossary
4. Test with functional harmony analysis

### Phase 2: Modal Integration
1. Extend to `EnhancedHarmonyTab` and modal analysis components
2. Add modal-specific terms and contextual definitions
3. Implement "View in Scale Tables" integration
4. Add audio examples for mode characteristics

### Phase 3: Advanced Features
1. Full chromatic harmony term coverage
2. Detailed modal with cross-reference navigation
3. Audio playback for musical examples
4. Analytics tracking for learning optimization

### Phase 4: Polish & Accessibility
1. Full WCAG 2.1 AA compliance testing
2. Mobile touch interaction optimization
3. Performance optimization for large documents
4. A/B testing for optimal UX patterns

## Analytics Integration

Track help system effectiveness:

```typescript
// Track most requested terms by analysis type
trackHelpInteraction('plagal_cadence', 'hover', 'functional');

// Monitor learning progression patterns
trackLearningProgress({
  termId: 'secondary_dominant',
  isFirstView: true,
  timeSpent: 45000, // 45 seconds
  interactionPath: ['dominant', 'secondary_dominant', 'tonicization'],
  completedRelatedTerms: ['dominant', 'voice_leading']
});

// Measure help system ROI
trackHelpEffectiveness('mediant', true, 'Clear explanation helped me understand the chord function');
```

## Testing Strategy

### Unit Tests
- Term detection accuracy
- Context-aware content selection
- Accessibility compliance
- Performance with large content

### Integration Tests
- Help system within analysis flows
- Cross-component term consistency
- Mobile touch interactions
- Keyboard navigation

### User Testing
- Learning effectiveness measurement
- Interface intuitiveness
- Term discovery patterns
- Mobile usability validation

This contextual help system transforms the music theory application from a powerful analysis tool into a comprehensive learning platform, providing just-in-time education that enhances user understanding without overwhelming the interface.
