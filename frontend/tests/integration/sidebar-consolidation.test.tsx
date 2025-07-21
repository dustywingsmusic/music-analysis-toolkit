import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import IntegratedMusicSidebar from '@/components/IntegratedMusicSidebar';

describe('Sidebar Consolidation Integration', () => {
  test('should not render Live Suggestions section', () => {
    const mockMidiData = {
      playedNotes: [],
      playedPitchClasses: new Set([0, 2, 4]),
      detectionEnabled: true,
      analysisFocus: 'automatic',
      setMode: () => {},
      clearPlayedNotes: () => {}
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    expect(screen.queryByText('Live Suggestions')).not.toBeInTheDocument();
    expect(screen.getByText('Musical Analysis')).toBeInTheDocument();
  });

  test('should toggle between quick and detailed view', () => {
    const mockMidiData = {
      playedNotes: [],
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic',
      setMode: () => {},
      clearPlayedNotes: () => {}
    };

    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    fireEvent.click(screen.getByText('📊 Show Details'));
    expect(screen.getByText('📊 Hide Details')).toBeInTheDocument();
  });
});
