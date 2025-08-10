/**
 * Integration test for AnalysisHub component
 * Tests the consolidated analysis functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalysisHub from '@/components/AnalysisHub';
import { AnalysisProvider } from '@/contexts/AnalysisContext';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the comprehensive analysis service
vi.mock('@/services/comprehensiveAnalysisService', () => ({
  ComprehensiveAnalysisEngine: vi.fn().mockImplementation(() => ({
    analyzeComprehensively: vi.fn().mockResolvedValue({
      functional: {
        keyCenter: 'C major',
        keySignature: 'no sharps or flats',
        chords: [
          { chordSymbol: 'Am', romanNumeral: 'vi', function: 'tonic' },
          { chordSymbol: 'F', romanNumeral: 'IV', function: 'predominant' },
          { chordSymbol: 'C', romanNumeral: 'I', function: 'tonic' },
          { chordSymbol: 'G', romanNumeral: 'V', function: 'dominant' }
        ],
        confidence: 0.9,
        explanation: 'Classic vi-IV-I-V progression in C major',
        cadences: [],
        chromaticElements: []
      },
      modal: {
        applicableAnalysis: {
          confidence: 0.7,
          chords: []
        },
        enhancedAnalysis: {
          modeName: 'C Ionian',
          detectedTonicCenter: 'C',
          confidence: 0.8,
          romanNumerals: ['vi', 'IV', 'I', 'V'],
          evidence: [],
          characteristics: ['Strong tonal center on C']
        },
        modalCharacteristics: ['Strong tonal resolution'],
        comparisonToFunctional: 'Both analyses agree on harmonic function',
        whenToUseModal: 'Modal analysis less applicable for this functional progression'
      },
      primaryApproach: 'functional' as const,
      confidence: 0.9,
      explanation: 'Primary analysis: Classic vi-IV-I-V progression in C major',
      pedagogicalValue: 'This progression is best understood through functional harmony',
      userInput: {
        chordProgression: 'Am F C G',
        parentKey: 'C major',
        analysisType: 'chord_progression'
      }
    })
  }))
}));

// Mock tracking and logging
vi.mock('@/utils/tracking', () => ({
  trackInteraction: vi.fn()
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    webClick: vi.fn()
  }
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TooltipProvider>
    <AnalysisProvider>
      {children}
    </AnalysisProvider>
  </TooltipProvider>
);

describe('AnalysisHub Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the analysis hub with all analysis types', () => {
    render(
      <TestWrapper>
        <AnalysisHub />
      </TestWrapper>
    );

    expect(screen.getByText('Analysis Hub')).toBeInTheDocument();
    expect(screen.getByText('Melody Analysis')).toBeInTheDocument();
    expect(screen.getByText('Scale Analysis')).toBeInTheDocument();
    expect(screen.getByText('Chord Analysis')).toBeInTheDocument();
    expect(screen.getByText('Chord Progression')).toBeInTheDocument();
  });

  it('switches between analysis types correctly', () => {
    render(
      <TestWrapper>
        <AnalysisHub />
      </TestWrapper>
    );

    // Click on chord progression analysis
    fireEvent.click(screen.getByText('Chord Progression'));
    expect(screen.getByText('Chord Progression Input')).toBeInTheDocument();

    // Click on melody analysis
    fireEvent.click(screen.getByText('Melody Analysis'));
    expect(screen.getByText('Melody Analysis Input')).toBeInTheDocument();
  });

  it('displays unified music input component', () => {
    render(
      <TestWrapper>
        <AnalysisHub />
      </TestWrapper>
    );

    // Should show input method selector (keyboard, mouse, midi)
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Click')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  it('performs analysis when analyze button is clicked', async () => {
    render(
      <TestWrapper>
        <AnalysisHub />
      </TestWrapper>
    );

    // Select chord progression analysis
    fireEvent.click(screen.getByText('Chord Progression'));

    // Enter a chord progression
    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.change(input, { target: { value: 'Am F C G' } });

    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: /Analyze Music/i });
    fireEvent.click(analyzeButton);

    // Should show loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();

    // Wait for analysis to complete and results to show
    await waitFor(() => {
      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should show functional analysis results
    expect(screen.getByText('Functional Lens')).toBeInTheDocument();
    expect(screen.getByText('C major')).toBeInTheDocument();
  });

  it('shows example buttons and loads examples correctly', () => {
    render(
      <TestWrapper>
        <AnalysisHub />
      </TestWrapper>
    );

    // Click example button
    const exampleButton = screen.getByRole('button', { name: /Example/i });
    fireEvent.click(exampleButton);

    // Should populate the input with example data
    const input = screen.getByDisplayValue('Am F C G');
    expect(input).toBeInTheDocument();
  });

  it('integrates with MIDI data when provided', () => {
    const mockMidiData = {
      playedNotes: [
        { name: 'C', number: 60, accidental: null, octave: 4 }
      ],
      playedPitchClasses: new Set([0]),
      isActive: true,
      status: 'Connected - Listening',
      clearPlayedNotes: vi.fn(),
      analysisFocus: 'automatic' as const,
      setAnalysisFocus: vi.fn()
    };

    render(
      <TestWrapper>
        <AnalysisHub midiData={mockMidiData} />
      </TestWrapper>
    );

    // Should show MIDI status indicator
    expect(screen.getByText('MIDI')).toBeInTheDocument();
    expect(screen.getByText('Connected - Listening')).toBeInTheDocument();
  });

  it('handles analysis errors gracefully', async () => {
    // Mock analysis to throw error
    const mockEngine = {
      analyzeComprehensively: vi.fn().mockRejectedValue(new Error('Analysis failed'))
    };

    vi.doMock('@/services/comprehensiveAnalysisService', () => ({
      ComprehensiveAnalysisEngine: vi.fn().mockImplementation(() => mockEngine)
    }));

    render(
      <TestWrapper>
        <AnalysisHub />
      </TestWrapper>
    );

    // Enter invalid input
    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.change(input, { target: { value: 'Invalid Input' } });

    // Click analyze
    const analyzeButton = screen.getByRole('button', { name: /Analyze Music/i });
    fireEvent.click(analyzeButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('clears all inputs when clear button is clicked', () => {
    render(
      <TestWrapper>
        <AnalysisHub />
      </TestWrapper>
    );

    // Enter some data
    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.change(input, { target: { value: 'Am F C G' } });

    // Click clear all
    const clearButton = screen.getByRole('button', { name: /Clear All/i });
    fireEvent.click(clearButton);

    // Input should be empty
    expect(input).toHaveValue('');
  });
});
