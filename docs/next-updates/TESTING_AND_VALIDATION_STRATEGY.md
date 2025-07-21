# Testing and Validation Strategy

## Overview

This document outlines the comprehensive testing and validation strategy for the music sidebar consolidation project, ensuring quality, accessibility, and performance standards are met across all implementation phases.

## 🎯 Testing Objectives

### Primary Goals
- Validate all 20 acceptance criteria are met
- Ensure no regression in existing functionality
- Verify improved user experience and workflow efficiency
- Confirm accessibility compliance (WCAG 2.1 AA)
- Validate performance improvements or maintenance

### Success Criteria
- All automated tests pass (>95% success rate)
- Manual testing scenarios complete successfully
- Accessibility audit score >95%
- Performance benchmarks meet or exceed current metrics
- User acceptance testing shows positive feedback

## 📋 Testing Phases

### Phase 1: Unit Testing (Week 1)

#### 1.1 Musical Analysis Logic Tests
**File**: `tests/unit/keySuggester.test.ts`

```typescript
describe('5-6 Note Analysis Prioritization', () => {
  test('should prioritize pentatonic matches over complete scale matches for 5 notes', () => {
    // C pentatonic: C, D, E, G, A
    const pentatonicNotes = new Set([0, 2, 4, 7, 9]);
    
    const result = updateUnifiedDetection(pentatonicNotes, 'automatic');
    
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0].matchType).toBe('pentatonic');
    expect(result.suggestions[0].closeness).toBeGreaterThan(0.8);
    
    // Find complete scale matches (should be lower in results)
    const completeScaleMatch = result.suggestions.find(s => s.matchType === 'complete');
    if (completeScaleMatch) {
      expect(completeScaleMatch.closeness).toBeLessThan(result.suggestions[0].closeness);
    }
  });

  test('should prioritize hexatonic matches over complete scale matches for 6 notes', () => {
    // Whole tone scale: C, D, E, F#, G#, A#
    const hexatonicNotes = new Set([0, 2, 4, 6, 8, 10]);
    
    const result = updateUnifiedDetection(hexatonicNotes, 'automatic');
    
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0].matchType).toBe('hexatonic');
    expect(result.suggestions[0].closeness).toBe(1.0); // 100% complete
  });

  test('should calculate completeness correctly', () => {
    const testCases = [
      { played: 5, expected: 5, result: 1.0 }, // Perfect pentatonic
      { played: 5, expected: 7, result: 0.714 }, // 5 notes of 7-note scale
      { played: 6, expected: 6, result: 1.0 }, // Perfect hexatonic
      { played: 6, expected: 7, result: 0.857 }, // 6 notes of 7-note scale
    ];

    testCases.forEach(({ played, expected, result }) => {
      expect(calculateCompleteness(played, expected)).toBeCloseTo(result, 3);
    });
  });

  test('should sort suggestions by priority then completeness', () => {
    const suggestions = [
      { matchType: 'complete', priority: 2, closeness: 0.8 },
      { matchType: 'pentatonic', priority: 1, closeness: 0.9 },
      { matchType: 'complete', priority: 2, closeness: 0.9 },
      { matchType: 'pentatonic', priority: 1, closeness: 0.8 }
    ];

    const sorted = sortSuggestionsByPriority(suggestions);
    
    // First two should be pentatonic (priority 1)
    expect(sorted[0].matchType).toBe('pentatonic');
    expect(sorted[1].matchType).toBe('pentatonic');
    
    // Within same priority, higher closeness first
    expect(sorted[0].closeness).toBeGreaterThan(sorted[1].closeness);
    
    // Last two should be complete (priority 2)
    expect(sorted[2].matchType).toBe('complete');
    expect(sorted[3].matchType).toBe('complete');
  });
});
```

#### 1.2 Component State Management Tests
**File**: `tests/unit/IntegratedMusicSidebar.test.tsx`

```typescript
describe('IntegratedMusicSidebar State Management', () => {
  test('should initialize with quick view mode', () => {
    const { getByTestId } = render(<IntegratedMusicSidebar />);
    expect(getByTestId('view-mode')).toHaveAttribute('data-mode', 'quick');
  });

  test('should toggle between quick and detailed view modes', () => {
    const { getByText, getByTestId } = render(<IntegratedMusicSidebar />);
    
    // Start in quick mode
    expect(getByTestId('view-mode')).toHaveAttribute('data-mode', 'quick');
    
    // Click to expand
    fireEvent.click(getByText('Show Details'));
    expect(getByTestId('view-mode')).toHaveAttribute('data-mode', 'detailed');
    
    // Click to collapse
    fireEvent.click(getByText('Hide Details'));
    expect(getByTestId('view-mode')).toHaveAttribute('data-mode', 'quick');
  });

  test('should auto-expand to detailed view for 7+ notes', () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 1, 2, 3, 4, 5, 6, 7]), // 8 notes
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    const { getByTestId } = render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    expect(getByTestId('view-mode')).toHaveAttribute('data-mode', 'detailed');
  });

  test('should preserve user preference when manually toggled', () => {
    const { getByText, getByTestId } = render(<IntegratedMusicSidebar />);
    
    // Manually expand
    fireEvent.click(getByText('Show Details'));
    expect(getByTestId('view-mode')).toHaveAttribute('data-mode', 'detailed');
    
    // Add new MIDI data (should not auto-collapse)
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4]), // 3 notes
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };
    
    rerender(<IntegratedMusicSidebar midiData={mockMidiData} />);
    expect(getByTestId('view-mode')).toHaveAttribute('data-mode', 'detailed');
  });
});
```

### Phase 2: Integration Testing (Week 2)

#### 2.1 Sidebar Consolidation Tests
**File**: `tests/integration/sidebar-consolidation.test.tsx`

```typescript
describe('Sidebar Consolidation Integration', () => {
  test('should not render Live Suggestions section', () => {
    const mockMidiData = {
      playedNotes: [],
      playedPitchClasses: new Set([0, 2, 4]),
      detectionEnabled: true,
      analysisFocus: 'automatic',
      setDetectionEnabled: jest.fn(),
      setAnalysisFocus: jest.fn(),
      clearPlayedNotes: jest.fn()
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    expect(screen.queryByText('Live Suggestions')).not.toBeInTheDocument();
    expect(screen.getByText('Musical Analysis')).toBeInTheDocument();
  });

  test('should preserve all Live Suggestions functionality in consolidated view', () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]), // C pentatonic
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    // Should show quick suggestions
    expect(screen.getByText('C Pentatonic')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument(); // Completeness
    expect(screen.getByText('View in Tables')).toBeInTheDocument();
  });

  test('should handle callback registrations correctly', () => {
    const melodyCallback = jest.fn();
    const chordCallback = jest.fn();
    
    registerMelodySuggestionCallback(melodyCallback);
    registerChordSuggestionCallback(chordCallback);
    
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    // Callbacks should still be called
    expect(melodyCallback).toHaveBeenCalled();
  });
});
```

#### 2.2 Progressive Disclosure Tests
**File**: `tests/integration/progressive-disclosure.test.tsx`

```typescript
describe('Progressive Disclosure Integration', () => {
  test('should show/hide advanced options correctly', () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    // Expand to detailed view
    fireEvent.click(screen.getByText('Show Details'));
    
    // Advanced options should be hidden initially
    expect(screen.queryByText('Max suggestions:')).not.toBeInTheDocument();
    
    // Click options button
    fireEvent.click(screen.getByText('Options'));
    
    // Advanced options should now be visible
    expect(screen.getByText('Max suggestions:')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  test('should show more/fewer suggestions correctly', () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    // Expand to detailed view
    fireEvent.click(screen.getByText('Show Details'));
    
    // Should show limited suggestions initially
    const initialSuggestions = screen.getAllByTestId(/^suggestion-/);
    expect(initialSuggestions.length).toBeLessThanOrEqual(3);
    
    // Click show more
    if (screen.queryByText(/Show \d+ more suggestions/)) {
      fireEvent.click(screen.getByText(/Show \d+ more suggestions/));
      
      // Should show more suggestions
      const expandedSuggestions = screen.getAllByTestId(/^suggestion-/);
      expect(expandedSuggestions.length).toBeGreaterThan(initialSuggestions.length);
    }
  });
});
```

### Phase 3: Accessibility Testing (Week 3)

#### 3.1 Automated Accessibility Tests
**File**: `tests/accessibility/sidebar-a11y.test.tsx`

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Sidebar Accessibility', () => {
  test('should have no accessibility violations', async () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    const { container } = render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('should have proper ARIA labels', () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    // Check for proper ARIA labels
    expect(screen.getByRole('region', { name: /Analysis category/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/View .* in scale tables/)).toBeInTheDocument();
  });

  test('should support keyboard navigation', () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    const scaleButton = screen.getByLabelText(/View .* in scale tables/);
    
    // Should be focusable
    scaleButton.focus();
    expect(scaleButton).toHaveFocus();
    
    // Should respond to Enter key
    const mockHandler = jest.fn();
    scaleButton.onclick = mockHandler;
    
    fireEvent.keyDown(scaleButton, { key: 'Enter' });
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

#### 3.2 Screen Reader Testing
**Manual Testing Checklist**:

- [ ] NVDA (Windows) compatibility
- [ ] JAWS (Windows) compatibility  
- [ ] VoiceOver (macOS) compatibility
- [ ] TalkBack (Android) compatibility
- [ ] All interactive elements announced correctly
- [ ] Navigation structure is logical
- [ ] Status changes are announced
- [ ] Error states are communicated clearly

### Phase 4: Performance Testing (Week 4)

#### 4.1 Performance Benchmarks
**File**: `tests/performance/sidebar-performance.test.ts`

```typescript
describe('Sidebar Performance', () => {
  test('should analyze MIDI input within 50ms', async () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    const startTime = performance.now();
    
    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText(/Pentatonic/)).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const analysisTime = endTime - startTime;
    
    expect(analysisTime).toBeLessThan(50);
  });

  test('should switch view modes within 100ms', async () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    const startTime = performance.now();
    
    fireEvent.click(screen.getByText('Show Details'));
    
    await waitFor(() => {
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const switchTime = endTime - startTime;
    
    expect(switchTime).toBeLessThan(100);
  });

  test('should not increase memory usage significantly', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic'
    };

    const { rerender } = render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    
    // Simulate multiple re-renders
    for (let i = 0; i < 100; i++) {
      rerender(<IntegratedMusicSidebar midiData={{
        ...mockMidiData,
        playedPitchClasses: new Set([i % 12, (i + 2) % 12, (i + 4) % 12])
      }} />);
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Should not increase by more than 10%
    expect(memoryIncrease).toBeLessThan(initialMemory * 0.1);
  });
});
```

## 🧪 Manual Testing Scenarios

### Scenario 1: Basic Consolidation Validation
**Objective**: Verify Live Suggestions section is removed and functionality preserved

**Steps**:
1. Open application with MIDI input enabled
2. Play 5 notes (C, D, E, G, A)
3. Verify only "Musical Analysis" section is visible
4. Verify pentatonic suggestions appear first
5. Click "View in Tables" - should navigate correctly
6. Verify completeness percentages are accurate

**Expected Results**:
- No "Live Suggestions" section visible
- Pentatonic matches show 100% completeness
- Complete scale matches show lower completeness
- All navigation functions work correctly

### Scenario 2: Progressive Disclosure Testing
**Objective**: Validate quick/detailed view switching

**Steps**:
1. Play 3-4 notes
2. Verify starts in quick view
3. Click "Show Details"
4. Verify detailed view appears with all features
5. Click "Options" 
6. Verify advanced options appear
7. Adjust max suggestions slider
8. Verify suggestion count updates

**Expected Results**:
- Smooth transitions between views
- All progressive disclosure controls functional
- Settings persist during session
- No visual glitches or layout issues

### Scenario 3: Mobile Responsiveness
**Objective**: Validate mobile experience

**Steps**:
1. Open on mobile device (or simulate)
2. Verify sidebar appears as bottom panel
3. Test touch interactions
4. Verify quick view is default
5. Test landscape orientation
6. Verify all buttons are touch-friendly

**Expected Results**:
- Bottom panel layout on mobile
- Touch targets ≥44px
- Readable text at mobile sizes
- Smooth touch interactions
- Proper landscape adaptation

### Scenario 4: Accessibility Validation
**Objective**: Verify accessibility compliance

**Steps**:
1. Navigate using only keyboard
2. Verify all interactive elements focusable
3. Test with screen reader
4. Verify high contrast mode
5. Test with reduced motion preference
6. Verify color contrast ratios

**Expected Results**:
- Full keyboard navigation support
- Proper screen reader announcements
- High contrast mode functional
- Animations respect motion preferences
- WCAG 2.1 AA compliance

## 📊 Test Data and Fixtures

### Musical Test Data
**File**: `tests/fixtures/musical-data.ts`

```typescript
export const testScales = {
  cMajorPentatonic: new Set([0, 2, 4, 7, 9]),
  cMajor: new Set([0, 2, 4, 5, 7, 9, 11]),
  wholeTone: new Set([0, 2, 4, 6, 8, 10]),
  cMinorPentatonic: new Set([0, 3, 5, 7, 10]),
  cDiminished: new Set([0, 2, 3, 5, 6, 8, 9, 11])
};

export const expectedResults = {
  cMajorPentatonic: {
    category: 'pentatonic',
    topMatch: 'C Major Pentatonic',
    completeness: 1.0
  },
  cMajor: {
    category: 'complete',
    topMatch: 'C Major (Ionian)',
    completeness: 1.0
  },
  partialCMajor: {
    notes: new Set([0, 2, 4, 7, 9]), // 5 of 7 notes
    category: 'pentatonic', // Should prioritize pentatonic
    completeness: 1.0 // For pentatonic match
  }
};
```

## 🔍 Quality Gates

### Automated Test Gates
- Unit test coverage ≥80%
- Integration test coverage ≥70%
- All accessibility tests pass
- Performance benchmarks met
- No critical or high severity bugs

### Manual Test Gates
- All manual scenarios pass
- Cross-browser compatibility verified
- Mobile responsiveness confirmed
- Accessibility audit score ≥95%
- User acceptance criteria met

### Code Quality Gates
- TypeScript strict mode compliance
- ESLint rules pass
- No console errors or warnings
- Code review approved
- Documentation updated

## 📈 Success Metrics

### Quantitative Metrics
- **Task Completion Rate**: ≥95% (maintain current)
- **Time to Find Scale**: Reduce by 20%
- **Analysis Response Time**: <50ms
- **UI Update Time**: <100ms
- **Memory Usage**: <10% increase
- **Accessibility Score**: ≥95%

### Qualitative Metrics
- User satisfaction survey scores
- Cognitive load assessment
- Workflow efficiency feedback
- Feature adoption rates
- Error reduction feedback

## 🚀 Test Execution Plan

### Week 1: Foundation Testing
- Unit tests for musical analysis logic
- Component state management tests
- Basic integration tests
- Performance baseline establishment

### Week 2: Integration Testing
- Sidebar consolidation validation
- Progressive disclosure testing
- Callback system verification
- Cross-component integration

### Week 3: Accessibility & UX Testing
- Automated accessibility tests
- Manual accessibility validation
- Screen reader testing
- Mobile responsiveness testing

### Week 4: Performance & Validation
- Performance benchmark testing
- Load testing and stress testing
- User acceptance testing
- Final validation and sign-off

## 📋 Test Environment Setup

### Development Environment
- Node.js 18+
- Jest testing framework
- React Testing Library
- Axe accessibility testing
- Performance monitoring tools

### Test Data Management
- Consistent musical test fixtures
- Mock MIDI data generators
- Performance baseline data
- Accessibility test scenarios

### Continuous Integration
- Automated test execution on PR
- Performance regression detection
- Accessibility compliance checking
- Cross-browser test automation

This comprehensive testing strategy ensures the music sidebar consolidation meets all quality, performance, and accessibility standards while maintaining existing functionality and improving user experience.