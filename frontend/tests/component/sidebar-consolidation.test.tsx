import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntegratedMusicSidebar from '../../src/components/IntegratedMusicSidebar';

// Mock the keySuggester service
vi.mock('../../src/services/keySuggester', () => ({
  registerMelodySuggestionCallback: vi.fn(),
  registerChordSuggestionCallback: vi.fn(),
  updateMelodySuggestionsForSidebar: vi.fn(),
  updateChordSuggestionsForSidebar: vi.fn(),
  updateUnifiedDetection: vi.fn(() => ({
    suggestions: [
      {
        name: 'C Major Pentatonic',
        matchType: 'exact',
        closeness: 1.0,
        pitchClasses: new Set([0, 2, 4, 7, 9]),
        matchingScales: [{ id: 'c-major-pentatonic', name: 'C Major Pentatonic' }]
      },
      {
        name: 'A Minor Pentatonic',
        matchType: 'exact',
        closeness: 1.0,
        pitchClasses: new Set([0, 3, 5, 7, 10]),
        matchingScales: [{ id: 'a-minor-pentatonic', name: 'A Minor Pentatonic' }]
      }
    ],
    category: 'pentatonic',
    closeness: 1.0,
    isChordMode: false
  }))
}));

// Mock MidiDetectionPanel
vi.mock('../../src/components/MidiDetectionPanel', () => ({
  default: ({ midiData }: any) => (
    <div data-testid="midi-detection-panel">
      <div>Detection Enabled: {midiData?.detectionEnabled ? 'true' : 'false'}</div>
      <div>Analysis Focus: {midiData?.analysisFocus || 'automatic'}</div>
    </div>
  )
}));

describe('Sidebar Consolidation Integration Tests', () => {
  const mockMidiData = {
    playedNotes: [
      { noteNumber: 60, noteName: 'C4', pitchClass: 0 },
      { noteNumber: 62, noteName: 'D4', pitchClass: 2 },
      { noteNumber: 64, noteName: 'E4', pitchClass: 4 },
      { noteNumber: 67, noteName: 'G4', pitchClass: 7 },
      { noteNumber: 69, noteName: 'A4', pitchClass: 9 }
    ],
    playedPitchClasses: new Set([0, 2, 4, 7, 9]),
    detectionEnabled: true,
    setDetectionEnabled: vi.fn(),
    analysisFocus: 'automatic' as const,
    setAnalysisFocus: vi.fn(),
    clearPlayedNotes: vi.fn()
  };

  const mockUnifiedResults = {
    isVisible: true,
    currentResults: {
      method: 'gemini',
      loading: false,
      error: null,
      geminiAnalysis: {
        result: {
          analysis: {
            mode: 'C Major',
            confidence: 0.95,
            scale: 'C D E F G A B',
            explanation: 'This is a C Major scale pattern.'
          }
        }
      },
      localAnalysis: null,
      placeholder: false,
      message: null
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Live Suggestions Section Removal', () => {
    it('should not render separate Live Suggestions section', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Should not find "Live Suggestions" text
      expect(screen.queryByText('🎵 Live Suggestions')).not.toBeInTheDocument();
      expect(screen.queryByText('Live Suggestions')).not.toBeInTheDocument();
    });

    it('should render consolidated Musical Analysis section', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Should find "Musical Analysis" section
      expect(screen.getByText('🎯 Musical Analysis')).toBeInTheDocument();
    });

    it('should show active status when analysis results are available', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Find the status indicator (should be active)
      const statusIndicator = document.querySelector('.sidebar-status-indicator.active');
      expect(statusIndicator).toBeInTheDocument();
    });
  });

  describe('Quick/Detailed View Toggling', () => {
    it('should start in quick view mode by default', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Should find quick view toggle button
      const toggleButton = screen.getByLabelText(/Switch to detailed view/i);
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('📊 Show Details');
    });

    it('should toggle between quick and detailed views', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const toggleButton = screen.getByLabelText(/Switch to detailed view/i);
      
      // Click to switch to detailed view
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const detailedToggleButton = screen.getByLabelText(/Switch to quick view/i);
        expect(detailedToggleButton).toBeInTheDocument();
        expect(detailedToggleButton).toHaveTextContent('⚡ Quick View');
      });
    });

    it('should show advanced options button in detailed view', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Switch to detailed view
      const toggleButton = screen.getByLabelText(/Switch to detailed view/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const optionsButton = screen.getByLabelText(/Show advanced options/i);
        expect(optionsButton).toBeInTheDocument();
        expect(optionsButton).toHaveTextContent('⚙️ Options');
      });
    });

    it('should toggle advanced options panel', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Switch to detailed view first
      const viewToggleButton = screen.getByLabelText(/Switch to detailed view/i);
      fireEvent.click(viewToggleButton);

      await waitFor(() => {
        const optionsButton = screen.getByLabelText(/Show advanced options/i);
        fireEvent.click(optionsButton);
      });

      await waitFor(() => {
        const hideOptionsButton = screen.getByLabelText(/Hide advanced options/i);
        expect(hideOptionsButton).toBeInTheDocument();
        expect(hideOptionsButton).toHaveTextContent('⚙️ Hide Options');
      });
    });
  });

  describe('Progressive Disclosure Controls', () => {
    it('should render progressive disclosure controls', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Should find progressive disclosure controls container
      const controls = document.querySelector('.progressive-disclosure-controls');
      expect(controls).toBeInTheDocument();
    });

    it('should show max suggestions slider in advanced options', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Switch to detailed view and show advanced options
      const viewToggleButton = screen.getByLabelText(/Switch to detailed view/i);
      fireEvent.click(viewToggleButton);

      await waitFor(() => {
        const optionsButton = screen.getByLabelText(/Show advanced options/i);
        fireEvent.click(optionsButton);
      });

      await waitFor(() => {
        const slider = screen.getByLabelText(/Maximum number of suggestions/i);
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('type', 'range');
      });
    });

    it('should update max suggestions when slider changes', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Navigate to advanced options
      const viewToggleButton = screen.getByLabelText(/Switch to detailed view/i);
      fireEvent.click(viewToggleButton);

      await waitFor(() => {
        const optionsButton = screen.getByLabelText(/Show advanced options/i);
        fireEvent.click(optionsButton);
      });

      await waitFor(() => {
        const slider = screen.getByLabelText(/Maximum number of suggestions/i);
        fireEvent.change(slider, { target: { value: '5' } });
        expect(slider).toHaveValue('5');
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Check for ARIA labels on buttons
      const toggleButton = screen.getByLabelText(/Switch to detailed view/i);
      expect(toggleButton).toHaveAttribute('aria-label');

      const sidebarToggle = screen.getByLabelText(/music analysis sidebar/i);
      expect(sidebarToggle).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const toggleButton = screen.getByLabelText(/Switch to detailed view/i);
      
      // Should be focusable
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);

      // Should respond to Enter key
      fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      // Note: The actual toggle behavior would need to be tested with more complex setup
    });

    it('should have proper focus management', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const toggleButton = screen.getByLabelText(/Switch to detailed view/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        // After toggling, the button should still be focusable
        const newToggleButton = screen.getByLabelText(/Switch to quick view/i);
        expect(newToggleButton).toBeInTheDocument();
      });
    });
  });

  describe('MIDI Data Structure Integration', () => {
    it('should handle new MIDI data structure correctly', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Should render MIDI detection panel with new structure
      expect(screen.getByTestId('midi-detection-panel')).toBeInTheDocument();
      expect(screen.getByText('Detection Enabled: true')).toBeInTheDocument();
      expect(screen.getByText('Analysis Focus: automatic')).toBeInTheDocument();
    });

    it('should handle disabled detection state', () => {
      const disabledMidiData = {
        ...mockMidiData,
        detectionEnabled: false
      };

      render(
        <IntegratedMusicSidebar
          midiData={disabledMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      expect(screen.getByText('Detection Enabled: false')).toBeInTheDocument();
    });

    it('should handle different analysis focus modes', () => {
      const chordFocusMidiData = {
        ...mockMidiData,
        analysisFocus: 'chord' as const
      };

      render(
        <IntegratedMusicSidebar
          midiData={chordFocusMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      expect(screen.getByText('Analysis Focus: chord')).toBeInTheDocument();
    });
  });

  describe('Sidebar Auto-Opening Functionality', () => {
    it('should render sidebar toggle button', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const toggleButton = screen.getByLabelText(/music analysis sidebar/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('should toggle sidebar visibility', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const toggleButton = screen.getByLabelText(/Hide music analysis sidebar/i);
      expect(toggleButton).toHaveTextContent('→');

      // Click to hide sidebar
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const showButton = screen.getByLabelText(/Show music analysis sidebar/i);
        expect(showButton).toHaveTextContent('🎵');
      });
    });

    it('should show sidebar content when visible', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Should show main sidebar sections
      expect(screen.getByText('🎹 MIDI Detection')).toBeInTheDocument();
      expect(screen.getByText('🎯 Musical Analysis')).toBeInTheDocument();
    });
  });

  describe('Unified Detection Results Display', () => {
    it('should display unified detection results', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      // Should show analysis results from unified results
      expect(screen.getByText('C Major')).toBeInTheDocument();
      expect(screen.getByText(/95% confidence/)).toBeInTheDocument();
    });

    it('should show View in Tables buttons for scale suggestions', () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const viewButton = screen.getByText('View in Tables');
      expect(viewButton).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      const loadingResults = {
        ...mockUnifiedResults,
        currentResults: {
          ...mockUnifiedResults.currentResults,
          loading: true,
          method: 'gemini'
        }
      };

      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={loadingResults}
        />
      );

      expect(screen.getByText(/Analyzing your gemini/)).toBeInTheDocument();
    });

    it('should handle error state', () => {
      const errorResults = {
        ...mockUnifiedResults,
        currentResults: {
          ...mockUnifiedResults.currentResults,
          loading: false,
          error: 'Analysis failed'
        }
      };

      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={errorResults}
        />
      );

      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid state changes gracefully', async () => {
      render(
        <IntegratedMusicSidebar
          midiData={mockMidiData}
          unifiedResults={mockUnifiedResults}
        />
      );

      const toggleButton = screen.getByLabelText(/Switch to detailed view/i);

      // Rapidly toggle view mode multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          // Just ensure the component doesn't crash
          expect(screen.getByText('🎯 Musical Analysis')).toBeInTheDocument();
        });
      }
    });
  });
});