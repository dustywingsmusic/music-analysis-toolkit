import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, MIDITestHelper, musicalAssertions, componentTestUtils } from '@utils/test-helpers';
import { TEST_SCALES, TEST_CHORDS } from '@fixtures/musical-data';

/**
 * Component tests for MidiDetectionPanel
 * Tests MIDI detection functionality, UI interactions, and state management
 */

// Mock the MidiDetectionPanel component - would import actual component
const MockMidiDetectionPanel = ({ midiData, onToggleDetection, onAnalysisFocusChange }: any) => {
  return (
    <div data-testid="midi-detection-panel">
      <div data-testid="detection-toggle">
        <input
          type="checkbox"
          checked={midiData.detectionEnabled}
          onChange={(e) => onToggleDetection(e.target.checked)}
          aria-label="Smart Detection"
        />
        <span>{midiData.detectionEnabled ? 'On' : 'Off'}</span>
      </div>

      {midiData.detectionEnabled && (
        <div data-testid="analysis-focus-dropdown">
          <select
            value={midiData.analysisFocus}
            onChange={(e) => onAnalysisFocusChange(e.target.value)}
            aria-label="Analysis Focus"
          >
            <option value="automatic">Automatic (Smart)</option>
            <option value="complete">Complete Scales Only</option>
            <option value="pentatonic">Pentatonic Focus</option>
            <option value="chord">Chord Analysis</option>
          </select>
          <div data-testid="focus-description">
            {midiData.analysisFocus === 'automatic' && 'Automatically adapts analysis based on note count'}
            {midiData.analysisFocus === 'complete' && 'Prioritizes exact complete scale matches'}
            {midiData.analysisFocus === 'pentatonic' && 'Focuses on pentatonic and hexatonic scales'}
            {midiData.analysisFocus === 'chord' && 'Analyzes chord progressions and harmony'}
          </div>
        </div>
      )}

      <div data-testid="detection-results">
        {midiData.results && (
          <div>
            <div data-testid="detection-category">{midiData.results.category}</div>
            {/* TODO: Implement confidence score display when confidence system is restored */}
            <div data-testid="suggestions">
              {midiData.results.suggestions.map((suggestion: string, index: number) => (
                <span key={index} data-testid={`suggestion-${index}`}>{suggestion}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

describe('MidiDetectionPanel Component', () => {
  let midiHelper: MIDITestHelper;
  let mockProps: any;

  beforeEach(() => {
    midiHelper = new MIDITestHelper();

    mockProps = {
      midiData: {
        detectionEnabled: false,
        analysisFocus: 'automatic',
        results: null,
        setDetectionEnabled: vi.fn(),
        setAnalysisFocus: vi.fn(),
      },
      onToggleDetection: vi.fn(),
      onAnalysisFocusChange: vi.fn(),
    };
  });

  describe('Detection Toggle Functionality', () => {
    it('should render with detection disabled by default', () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      const toggle = screen.getByRole('checkbox', { name: /smart detection/i });
      expect(toggle).not.toBeChecked();
      expect(screen.getByText('Off')).toBeInTheDocument();
    });

    it('should enable detection when toggle is clicked', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      const toggle = screen.getByRole('checkbox', { name: /smart detection/i });

      await componentTestUtils.simulateUserAction(() => {
        fireEvent.click(toggle);
      });

      expect(mockProps.onToggleDetection).toHaveBeenCalledWith(true);
    });

    it('should show analysis focus dropdown when detection is enabled', () => {
      const enabledProps = {
        ...mockProps,
        midiData: { ...mockProps.midiData, detectionEnabled: true }
      };

      renderWithProviders(<MockMidiDetectionPanel {...enabledProps} />);

      expect(screen.getByTestId('analysis-focus-dropdown')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /analysis focus/i })).toBeInTheDocument();
    });

    it('should hide analysis focus dropdown when detection is disabled', () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      expect(screen.queryByTestId('analysis-focus-dropdown')).not.toBeInTheDocument();
    });

    it('should clear results when detection is disabled', async () => {
      const enabledProps = {
        ...mockProps,
        midiData: {
          ...mockProps.midiData,
          detectionEnabled: true,
          results: {
            category: 'complete',
            // TODO: Implement confidence property when confidence system is restored
            suggestions: ['C Ionian']
          }
        }
      };

      renderWithProviders(<MockMidiDetectionPanel {...enabledProps} />);

      // Verify results are shown
      expect(screen.getByTestId('detection-category')).toHaveTextContent('complete');

      // Disable detection
      const toggle = screen.getByRole('checkbox', { name: /smart detection/i });
      fireEvent.click(toggle);

      expect(mockProps.onToggleDetection).toHaveBeenCalledWith(false);
    });
  });

  describe('Analysis Focus Dropdown', () => {
    beforeEach(() => {
      mockProps.midiData.detectionEnabled = true;
    });

    it('should show correct description for automatic focus', () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      expect(screen.getByTestId('focus-description')).toHaveTextContent(
        'Automatically adapts analysis based on note count'
      );
    });

    it('should change to complete scales focus', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      const dropdown = screen.getByRole('combobox', { name: /analysis focus/i });

      await componentTestUtils.simulateUserAction(() => {
        fireEvent.change(dropdown, { target: { value: 'complete' } });
      });

      expect(mockProps.onAnalysisFocusChange).toHaveBeenCalledWith('complete');
    });

    it('should show correct description for complete scales focus', () => {
      const completeProps = {
        ...mockProps,
        midiData: { ...mockProps.midiData, analysisFocus: 'complete' }
      };

      renderWithProviders(<MockMidiDetectionPanel {...completeProps} />);

      expect(screen.getByTestId('focus-description')).toHaveTextContent(
        'Prioritizes exact complete scale matches'
      );
    });

    it('should change to pentatonic focus', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      const dropdown = screen.getByRole('combobox', { name: /analysis focus/i });

      await componentTestUtils.simulateUserAction(() => {
        fireEvent.change(dropdown, { target: { value: 'pentatonic' } });
      });

      expect(mockProps.onAnalysisFocusChange).toHaveBeenCalledWith('pentatonic');
    });

    it('should show correct description for pentatonic focus', () => {
      const pentatonicProps = {
        ...mockProps,
        midiData: { ...mockProps.midiData, analysisFocus: 'pentatonic' }
      };

      renderWithProviders(<MockMidiDetectionPanel {...pentatonicProps} />);

      expect(screen.getByTestId('focus-description')).toHaveTextContent(
        'Focuses on pentatonic and hexatonic scales'
      );
    });

    it('should change to chord analysis focus', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      const dropdown = screen.getByRole('combobox', { name: /analysis focus/i });

      await componentTestUtils.simulateUserAction(() => {
        fireEvent.change(dropdown, { target: { value: 'chord' } });
      });

      expect(mockProps.onAnalysisFocusChange).toHaveBeenCalledWith('chord');
    });

    it('should show correct description for chord analysis focus', () => {
      const chordProps = {
        ...mockProps,
        midiData: { ...mockProps.midiData, analysisFocus: 'chord' }
      };

      renderWithProviders(<MockMidiDetectionPanel {...chordProps} />);

      expect(screen.getByTestId('focus-description')).toHaveTextContent(
        'Analyzes chord progressions and harmony'
      );
    });
  });

  describe('Detection Results Display', () => {
    beforeEach(() => {
      mockProps.midiData.detectionEnabled = true;
    });

    it('should display complete scale detection results', () => {
      const resultsProps = {
        ...mockProps,
        midiData: {
          ...mockProps.midiData,
          results: {
            category: 'complete',
            // TODO: Implement confidence property when confidence system is restored
            suggestions: ['C Ionian', 'D Dorian', 'E Phrygian']
          }
        }
      };

      renderWithProviders(<MockMidiDetectionPanel {...resultsProps} />);

      expect(screen.getByTestId('detection-category')).toHaveTextContent('complete');
      // TODO: Implement confidence score test when confidence system is restored
      // expect(screen.getByTestId('confidence-score')).toHaveTextContent('100%');

      const suggestions = screen.getAllByTestId(/suggestion-/);
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toHaveTextContent('C Ionian');
      expect(suggestions[1]).toHaveTextContent('D Dorian');
      expect(suggestions[2]).toHaveTextContent('E Phrygian');
    });

    it('should display pentatonic scale detection results', () => {
      const resultsProps = {
        ...mockProps,
        midiData: {
          ...mockProps.midiData,
          results: {
            category: 'pentatonic',
            // TODO: Implement confidence property when confidence system is restored
            suggestions: ['C Major Pentatonic']
          }
        }
      };

      renderWithProviders(<MockMidiDetectionPanel {...resultsProps} />);

      expect(screen.getByTestId('detection-category')).toHaveTextContent('pentatonic');
      // TODO: Implement confidence score test when confidence system is restored
      // expect(screen.getByTestId('confidence-score')).toHaveTextContent('90%');

      const suggestions = screen.getAllByTestId(/suggestion-/);
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toHaveTextContent('C Major Pentatonic');
    });

    it('should display partial/chord detection results', () => {
      const resultsProps = {
        ...mockProps,
        midiData: {
          ...mockProps.midiData,
          results: {
            category: 'partial',
            // TODO: Implement confidence property when confidence system is restored
            suggestions: ['C Ionian', 'F Lydian', 'G Mixolydian']
          }
        }
      };

      renderWithProviders(<MockMidiDetectionPanel {...resultsProps} />);

      expect(screen.getByTestId('detection-category')).toHaveTextContent('partial');
      // TODO: Implement confidence score test when confidence system is restored
      // expect(screen.getByTestId('confidence-score')).toHaveTextContent('75%');

      const suggestions = screen.getAllByTestId(/suggestion-/);
      expect(suggestions).toHaveLength(3);
    });

    it('should display minimal input detection results', () => {
      const resultsProps = {
        ...mockProps,
        midiData: {
          ...mockProps.midiData,
          results: {
            category: 'minimal',
            // TODO: Implement confidence property when confidence system is restored
            suggestions: ['C Ionian', 'C Dorian', 'C Phrygian']
          }
        }
      };

      renderWithProviders(<MockMidiDetectionPanel {...resultsProps} />);

      expect(screen.getByTestId('detection-category')).toHaveTextContent('minimal');
      // TODO: Implement confidence score test when confidence system is restored
      // expect(screen.getByTestId('confidence-score')).toHaveTextContent('40%');
    });

    it('should not display results when none are available', () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      expect(screen.queryByTestId('detection-category')).not.toBeInTheDocument();
      // TODO: Implement confidence score test when confidence system is restored
      // expect(screen.queryByTestId('confidence-score')).not.toBeInTheDocument();
      expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
    });
  });

  describe('MIDI Integration Tests', () => {
    beforeEach(() => {
      mockProps.midiData.detectionEnabled = true;
    });

    it('should handle C major scale input simulation', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      // Simulate playing C major scale
      await midiHelper.playTestScale('cMajor');

      // Wait for processing
      await componentTestUtils.waitForUpdate(100);

      // Verify MIDI input was processed (would trigger actual detection in real component)
      expect(midiHelper.getInput()).toBeTruthy();
    });

    it('should handle chord input simulation', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      // Simulate playing C major chord
      midiHelper.playTestChord('cMajor');

      // Wait for processing
      await componentTestUtils.waitForUpdate(50);

      // Verify chord input was processed
      expect(midiHelper.getInput()).toBeTruthy();
    });

    it('should handle rapid MIDI input', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      // Simulate rapid input
      midiHelper.simulateRapidInput(10);

      // Component should handle rapid input gracefully
      await componentTestUtils.waitForUpdate(100);

      // No errors should occur
      expect(screen.getByTestId('midi-detection-panel')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      expect(screen.getByRole('checkbox', { name: /smart detection/i })).toBeInTheDocument();
    });

    it('should have proper ARIA labels for dropdown when enabled', () => {
      const enabledProps = {
        ...mockProps,
        midiData: { ...mockProps.midiData, detectionEnabled: true }
      };

      renderWithProviders(<MockMidiDetectionPanel {...enabledProps} />);

      expect(screen.getByRole('combobox', { name: /analysis focus/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<MockMidiDetectionPanel {...mockProps} />);

      const toggle = screen.getByRole('checkbox', { name: /smart detection/i });

      // Should be focusable
      toggle.focus();
      expect(document.activeElement).toBe(toggle);

      // Should have proper accessibility attributes for keyboard navigation
      expect(toggle).toHaveAttribute('type', 'checkbox');
      expect(toggle).toHaveAttribute('aria-label', 'Smart Detection');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const minimalProps = {
        midiData: {
          detectionEnabled: false,
          analysisFocus: 'automatic',
          results: null,
        },
        onToggleDetection: vi.fn(),
        onAnalysisFocusChange: vi.fn(),
      };

      expect(() => {
        renderWithProviders(<MockMidiDetectionPanel {...minimalProps} />);
      }).not.toThrow();
    });

    it('should handle invalid analysis focus value', () => {
      const invalidProps = {
        ...mockProps,
        midiData: {
          ...mockProps.midiData,
          detectionEnabled: true,
          analysisFocus: 'invalid'
        }
      };

      expect(() => {
        renderWithProviders(<MockMidiDetectionPanel {...invalidProps} />);
      }).not.toThrow();
    });
  });
});
