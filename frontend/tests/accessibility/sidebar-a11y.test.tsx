import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import IntegratedMusicSidebar from '@/components/IntegratedMusicSidebar';

expect.extend(toHaveNoViolations);

describe('Sidebar Accessibility', () => {
  test('should have no accessibility violations', async () => {
    const mockMidiData = {
      playedPitchClasses: new Set([0, 2, 4, 7, 9]),
      detectionEnabled: true,
      analysisFocus: 'automatic',
      setMode: () => {},
      clearPlayedNotes: () => {}
    };

    const { container } = render(<IntegratedMusicSidebar midiData={mockMidiData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
