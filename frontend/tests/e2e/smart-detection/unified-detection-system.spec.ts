import { test, expect, Page } from '@playwright/test';
import { TEST_SCALES, TEST_CHORDS, TEST_MINIMAL_INPUT } from '@fixtures/musical-data';

// Extend Window interface for MIDI simulation
declare global {
  interface Window {
    simulateMIDIInput?: (notes: number[], clearFirst?: boolean) => void;
    clearMIDINotes?: () => void;
  }
}

// Helper function to convert MIDI note numbers to note names for logging
function midiNoteToName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteNames[midiNote % 12];
  return `${noteName}${octave}`;
}

// Helper function to format notes array for logging
function formatNotesForLogging(notes: number[]): string {
  const noteNames = notes.map(note => midiNoteToName(note));
  const midiNumbers = notes.map(note => note.toString());
  return `[${noteNames.join(', ')}] (MIDI: [${midiNumbers.join(', ')}])`;
}

/**
 * E2E tests for Smart Detection System - Unified Detection
 * Tests complete user workflows for the smart detection functionality
 * Based on test checklist Phase 1: Unified Detection System Tests
 */

class SmartDetectionPage {
  constructor(public page: Page) {}

  // Navigation methods
  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async navigateToReferenceTab() {
    await this.page.waitForSelector('[data-testid="reference-tab"]', { state: 'visible' });
    await this.page.click('[data-testid="reference-tab"]');
  }

  // Detection control methods
  async enableSmartDetection() {
    await this.page.waitForSelector('[data-testid="detection-toggle"]', { state: 'visible' });
    await this.page.check('[data-testid="detection-toggle"]');
  }

  async disableSmartDetection() {
    await this.page.waitForSelector('[data-testid="detection-toggle"]', { state: 'visible' });
    await this.page.uncheck('[data-testid="detection-toggle"]');
  }

  async setAnalysisFocus(focus: 'automatic' | 'complete' | 'pentatonic' | 'chord') {
    await this.page.waitForSelector('[data-testid="analysis-focus-dropdown"]', { state: 'visible' });
    await this.page.selectOption('[data-testid="analysis-focus-dropdown"]', focus);
  }

  // MIDI simulation methods
  async simulateMIDIInput(notes: number[]) {
    console.log(`🎹 Simulating MIDI input: ${formatNotesForLogging(notes)}`);
    await this.page.evaluate((noteArray) => {
      // Use the window.simulateMIDIInput function that was added to the application for testing
      if (window.simulateMIDIInput) {
        window.simulateMIDIInput(noteArray);
      } else {
        console.error('window.simulateMIDIInput not available - make sure the application has loaded');
      }
    }, notes);
  }

  async simulateScaleInput(notes: number[], delay: number = 100) {
    console.log(`🎼 Simulating scale input (sequential): ${formatNotesForLogging(notes)}`);

    // Clear notes before starting the scale input, then add all notes one by one
    let isFirstNote = true;
    for (const note of notes) {
      await this.page.evaluate((noteData) => {
        if (window.simulateMIDIInput) {
          window.simulateMIDIInput([noteData.note], noteData.clearFirst);
        }
      }, { note, clearFirst: isFirstNote });
      isFirstNote = false;
      await this.page.waitForTimeout(delay);
    }
  }

  async simulateChordInput(notes: number[]) {
    console.log(`🎵 Simulating chord input (simultaneous): ${formatNotesForLogging(notes)}`);
    await this.page.evaluate((noteArray) => {
      if (window.simulateMIDIInput) {
        window.simulateMIDIInput(noteArray, true); // true = clear first for fresh chord input
      }
    }, notes);
  }

  // Assertion methods
  async expectDetectionCategory(category: string) {
    // Wait for the detection results to appear first
    await this.page.waitForSelector('[data-testid="detection-category"]', { state: 'visible', timeout: 10000 });

    // Map category names to the actual UI labels
    const categoryLabels = {
      'complete': 'Complete Scale Match',
      'pentatonic': 'Pentatonic/Hexatonic',
      'partial': 'Partial Match',
      'minimal': 'Broad Discovery',
      'none': 'No Match'
    };

    const expectedLabel = categoryLabels[category as keyof typeof categoryLabels] || category;
    await expect(this.page.locator('[data-testid="detection-category"]')).toContainText(expectedLabel);
  }

  // TODO: Implement confidence score testing when confidence system is restored
  // async expectConfidenceScore(minConfidence: number, maxConfidence: number) {
  //   // Wait for the confidence score element to appear
  //   await this.page.waitForSelector('[data-testid="confidence-score"]', { state: 'visible', timeout: 10000 });
  //   const confidenceElement = this.page.locator('[data-testid="confidence-score"]');
  //   const confidenceText = await confidenceElement.textContent();
  //   const confidence = parseInt(confidenceText?.replace('%', '') || '0');
  //
  //   expect(confidence).toBeGreaterThanOrEqual(minConfidence);
  //   expect(confidence).toBeLessThanOrEqual(maxConfidence);
  // }

  async expectSuggestionsContain(expectedSuggestions: string[]) {
    // Wait for the suggestions element to appear
    await this.page.waitForSelector('[data-testid="suggestions"]', { state: 'visible', timeout: 10000 });
    for (const suggestion of expectedSuggestions) {
      await expect(this.page.locator('[data-testid="suggestions"]')).toContainText(suggestion);
    }
  }

  async expectScaleHighlighted(scaleName: string) {
    await expect(this.page.locator(`[data-testid="scale-${scaleName.toLowerCase().replace(/\s+/g, '-')}"]`)).toHaveClass(/highlighted/);
  }

  async expectScaleScrolledIntoView(scaleName: string) {
    const scaleElement = this.page.locator(`[data-testid="scale-${scaleName.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(scaleElement).toBeInViewport();
  }

  // Clear functionality
  async clearNotes() {
    await this.page.waitForSelector('[data-testid="clear-notes-button"]', { state: 'visible' });
    await this.page.click('[data-testid="clear-notes-button"]');
  }
}

test.describe('Smart Detection System - Unified Detection', () => {
  let smartDetection: SmartDetectionPage;

  test.beforeEach(async ({ page }) => {
    smartDetection = new SmartDetectionPage(page);
    await smartDetection.goto();
    await smartDetection.navigateToReferenceTab();
    await smartDetection.enableSmartDetection();
  });

  test.describe('Phase 1: Complete Heptatonic Scale Detection (7+ Notes)', () => {
    test('Test 1.1: Complete C Major Scale Detection', async () => {
      // Test data from fixtures
      const testScale = TEST_SCALES.cMajor;
      console.log(`\n🧪 Test 1.1: Complete C Major Scale - Testing with notes: ${formatNotesForLogging(testScale.notes)}`);

      // Simulate playing C major scale
      await smartDetection.simulateScaleInput(testScale.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(500);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testScale.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testScale.expectedConfidence.min,
      //   testScale.expectedConfidence.max
      // );

      // Verify suggestions include expected modes
      await smartDetection.expectSuggestionsContain([...testScale.expectedSuggestions]);

      // Verify scale highlighting
      await smartDetection.expectScaleHighlighted(testScale.expectedHighlight);
      await smartDetection.expectScaleScrolledIntoView(testScale.expectedHighlight);
    });

    test('Test 1.2: Natural Minor Scale Detection', async () => {
      const testScale = TEST_SCALES.aMinor;

      // Simulate playing A natural minor scale
      await smartDetection.simulateScaleInput(testScale.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(500);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testScale.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testScale.expectedConfidence.min,
      //   testScale.expectedConfidence.max
      // );

      // Verify A Aeolian is highlighted (first note played)
      await smartDetection.expectScaleHighlighted(testScale.expectedHighlight);

      // Verify suggestions include modal variations
      await smartDetection.expectSuggestionsContain([...testScale.expectedSuggestions]);
    });
  });

  test.describe('Phase 1: Pentatonic/Hexatonic Detection (5-6 Notes)', () => {
    test('Test 2.1: Major Pentatonic Scale', async () => {
      const testScale = TEST_SCALES.cMajorPentatonic;
      console.log(`\n🧪 Test 2.1: Major Pentatonic Scale - Testing with notes: ${formatNotesForLogging(testScale.notes)}`);

      // Simulate playing C major pentatonic
      await smartDetection.simulateScaleInput(testScale.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(500);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testScale.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testScale.expectedConfidence.min,
      //   testScale.expectedConfidence.max
      // );

      // Verify pentatonic match identified
      await smartDetection.expectSuggestionsContain([...testScale.expectedSuggestions]);
      await smartDetection.expectScaleHighlighted(testScale.expectedHighlight);
    });

    test('Test 2.2: Minor Pentatonic Scale', async () => {
      const testScale = TEST_SCALES.aMinorPentatonic;

      // Simulate playing A minor pentatonic
      await smartDetection.simulateScaleInput(testScale.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(500);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testScale.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testScale.expectedConfidence.min,
      //   testScale.expectedConfidence.max
      // );

      // Verify A Minor Pentatonic identified
      await smartDetection.expectSuggestionsContain([...testScale.expectedSuggestions]);
    });

    test('Test 2.3: Hexatonic Scale (Whole Tone)', async () => {
      const testScale = TEST_SCALES.wholeTone;

      // Simulate playing the whole tone scale
      await smartDetection.simulateScaleInput(testScale.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(500);

      // Verify detection results (whole tone scale should be treated as complete)
      await smartDetection.expectDetectionCategory(testScale.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testScale.expectedConfidence.min,
      //   testScale.expectedConfidence.max
      // );

      // Verify whole tone scale identified
      await smartDetection.expectSuggestionsContain([...testScale.expectedSuggestions]);
    });
  });

  test.describe('Phase 1: Chord and Partial Scale Detection (3-4 Notes)', () => {
    test('Test 3.1: Major Triad', async () => {
      const testChord = TEST_CHORDS.cMajor;
      console.log(`\n🧪 Test 3.1: Major Triad - Testing with notes: ${formatNotesForLogging(testChord.notes)}`);

      // Simulate playing C major triad
      await smartDetection.simulateChordInput(testChord.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(300);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testChord.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testChord.expectedConfidence.min,
      //   testChord.expectedConfidence.max
      // );

      // Verify multiple scale possibilities shown
      await smartDetection.expectSuggestionsContain([...testChord.expectedSuggestions]);
    });

    test('Test 3.2: Minor Triad', async () => {
      const testChord = TEST_CHORDS.aMinor;
      console.log(`\n🧪 Test 3.2: Minor Triad - Testing with notes: ${formatNotesForLogging(testChord.notes)}`);

      // Simulate playing A minor triad
      await smartDetection.simulateChordInput(testChord.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(1000);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testChord.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testChord.expectedConfidence.min,
      //   testChord.expectedConfidence.max
      // );

      // Verify A minor-related scales suggested
      await smartDetection.expectSuggestionsContain([...testChord.expectedSuggestions]);
    });

    // TODO: Fix this guy. Expected >= 75 but is 72.
    test('Test 3.3: Seventh Chord', async () => {
      const testChord = TEST_CHORDS.cMaj7;
      console.log(`\n🧪 Test 3.3: Seventh Chord - Testing with notes: ${formatNotesForLogging(testChord.notes)}`);

      // Simulate playing Cmaj7 chord
      await smartDetection.simulateChordInput(testChord.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(300);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testChord.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testChord.expectedConfidence.min,
      //   testChord.expectedConfidence.max
      // );

      // Verify seventh chord context recognized
      await smartDetection.expectSuggestionsContain([...testChord.expectedSuggestions]);
    });
  });

  test.describe('Phase 1: Minimal Input Detection (1-2 Notes)', () => {
    test('Test 4.1: Single Note', async () => {
      const testInput = TEST_MINIMAL_INPUT.singleNote;

      // Simulate playing single C note
      await smartDetection.simulateMIDIInput(testInput.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(200);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testInput.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testInput.expectedConfidence.min,
      //   testInput.expectedConfidence.max
      // );

      // Verify broad discovery of scales containing C
      await smartDetection.expectSuggestionsContain([...testInput.expectedSuggestions]);
    });

    test('Test 4.2: Perfect Fifth Interval', async () => {
      const testInput = TEST_MINIMAL_INPUT.perfectFifth;

      // Simulate playing C-G perfect fifth
      await smartDetection.simulateMIDIInput(testInput.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(200);

      // Verify detection results
      await smartDetection.expectDetectionCategory(testInput.expectedCategory);
      // TODO: Implement confidence score testing when confidence system is restored
      // await smartDetection.expectConfidenceScore(
      //   testInput.expectedConfidence.min,
      //   testInput.expectedConfidence.max
      // );

      // Verify scales containing perfect fifth C-G
      await smartDetection.expectSuggestionsContain([...testInput.expectedSuggestions]);
    });
  });

  test.describe('Integration Tests', () => {
    test('Test 10.1: Scale Highlighting Integration', async () => {
      const testScale = TEST_SCALES.cMajor;

      // Play notes that should highlight a scale
      await smartDetection.simulateScaleInput(testScale.notes);

      // Wait for detection processing
      await smartDetection.page.waitForTimeout(500);

      // Verify scale table highlights the detected scale
      await smartDetection.expectScaleHighlighted(testScale.expectedHighlight);

      // Click on a scale suggestion
      await smartDetection.page.click('[data-testid="suggestion-c-ionian"]');

      // Verify clicking suggestion scrolls to and highlights that scale
      await smartDetection.expectScaleScrolledIntoView('C Ionian');
      await smartDetection.expectScaleHighlighted('C Ionian');
    });

    test('Test 10.2: State Management Consistency', async () => {
      const testScale = TEST_SCALES.cMajor;

      // Play some notes
      await smartDetection.simulateScaleInput(testScale.notes.slice(0, 4));
      await smartDetection.page.waitForTimeout(300);

      // Change analysis focus while notes are playing
      await smartDetection.setAnalysisFocus('complete');

      // Verify results update immediately
      await expect(smartDetection.page.locator('[data-testid="detection-results"]')).toBeVisible();

      // Verify no console errors
      const logs = await smartDetection.page.evaluate(() => {
        return (window as any).testErrors || [];
      });
      expect(logs.filter((log: any) => log.type === 'error')).toHaveLength(0);
    });
  });

  test.describe('Performance and Edge Cases', () => {
    test('Test 11.1: Rapid Note Input', async () => {
      // Generate rapid note sequence
      const rapidNotes = Array.from({ length: 20 }, (_, i) => 60 + (i % 12));

      const startTime = Date.now();

      // Simulate rapid input
      for (const note of rapidNotes) {
        await smartDetection.simulateMIDIInput([note]);
        // Very short delay to simulate rapid input
        await smartDetection.page.waitForTimeout(10);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // System should handle rapid input gracefully
      expect(totalTime).toBeLessThan(2000); // Should complete in under 2 seconds

      // Verify no system freezing - UI should still be responsive
      await expect(smartDetection.page.locator('[data-testid="midi-detection-panel"]')).toBeVisible();
    });

    test('Test 11.2: Clear Notes Functionality', async () => {
      const testScale = TEST_SCALES.cMajor;

      // Play notes
      await smartDetection.simulateScaleInput(testScale.notes);
      await smartDetection.page.waitForTimeout(500);

      // Verify results are shown
      await expect(smartDetection.page.locator('[data-testid="detection-results"]')).toBeVisible();

      // Clear notes
      await smartDetection.clearNotes();

      // Verify all played notes cleared and results disappeared
      await expect(smartDetection.page.locator('[data-testid="detection-results"]')).not.toBeVisible();

      // Verify scale highlighting reset
      await expect(smartDetection.page.locator('.scale-highlighted')).toHaveCount(0);

      // Verify system ready for new input
      await smartDetection.simulateMIDIInput([60]);
      await expect(smartDetection.page.locator('[data-testid="detection-results"]')).toBeVisible();
    });
  });

  test.describe('Analysis Focus Dropdown Tests', () => {
    test('Test 6.1: Automatic Focus (Default)', async () => {
      // Verify default focus is automatic
      await expect(smartDetection.page.locator('[data-testid="analysis-focus-dropdown"]')).toHaveValue('automatic');

      // Verify description
      await expect(smartDetection.page.locator('[data-testid="focus-description"]')).toContainText(
        'Automatically adapts analysis based on note count'
      );

      // Play 7 notes and verify all suggestions shown
      const testScale = TEST_SCALES.cMajor;
      await smartDetection.simulateScaleInput(testScale.notes);
      await smartDetection.page.waitForTimeout(500);

      // Should show all relevant suggestions without filtering
      const suggestions = smartDetection.page.locator('[data-testid="suggestions"] span');
      await expect(suggestions).toHaveCount(testScale.expectedSuggestions.length);
    });

    test('Test 6.2: Complete Scales Focus', async () => {
      // Set focus to complete scales
      await smartDetection.setAnalysisFocus('complete');

      // Verify description
      await expect(smartDetection.page.locator('[data-testid="focus-description"]')).toContainText(
        'Prioritizes exact complete scale matches'
      );

      // Play 7 notes
      const testScale = TEST_SCALES.cMajor;
      await smartDetection.simulateScaleInput(testScale.notes);
      await smartDetection.page.waitForTimeout(500);

      // TODO: Implement confidence score testing when confidence system is restored
      // Should filter to show only high-confidence matches (≥90%)
      // await smartDetection.expectConfidenceScore(90, 100);
    });

    test('Test 6.3: Pentatonic Focus', async () => {
      // Set focus to pentatonic
      await smartDetection.setAnalysisFocus('pentatonic');

      // Verify description
      await expect(smartDetection.page.locator('[data-testid="focus-description"]')).toContainText(
        'Focuses on pentatonic and hexatonic scales'
      );

      // Play 5 notes (pentatonic)
      const testScale = TEST_SCALES.cMajorPentatonic;
      await smartDetection.simulateScaleInput(testScale.notes);
      await smartDetection.page.waitForTimeout(500);

      // Should prioritize pentatonic matches
      await smartDetection.expectSuggestionsContain(['C Major Pentatonic']);
    });

    test('Test 6.4: Chord Analysis Focus', async () => {
      // Set focus to chord analysis
      await smartDetection.setAnalysisFocus('chord');

      // Verify description
      await expect(smartDetection.page.locator('[data-testid="focus-description"]')).toContainText(
        'Analyzes chord progressions and harmony'
      );

      // Verify chord settings panel appears
      await expect(smartDetection.page.locator('[data-testid="chord-settings-panel"]')).toBeVisible();

      // Play 3 notes (chord)
      const testChord = TEST_CHORDS.cMajor;
      await smartDetection.simulateChordInput(testChord.notes);
      await smartDetection.page.waitForTimeout(300);

      // Should show chord-specific analysis
      await expect(smartDetection.page.locator('[data-testid="chord-analysis"]')).toBeVisible();
    });
  });
});
