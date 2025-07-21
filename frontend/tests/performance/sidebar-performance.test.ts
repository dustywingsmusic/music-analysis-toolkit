import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import IntegratedMusicSidebar from '@/components/IntegratedMusicSidebar';
import React from 'react';

describe('Sidebar Performance', () => {
  test('should analyze MIDI input within 50ms', async () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic',
      setMode: () => {},
      clearPlayedNotes: () => {}
    };

    const startTime = performance.now();
    render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    await waitFor(() => {
      expect(screen.getByText('📊 Show Details')).toBeInTheDocument();
    });
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(50);
  });
});
