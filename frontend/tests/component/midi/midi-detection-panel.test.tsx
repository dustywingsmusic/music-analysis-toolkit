import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MidiDetectionPanel from '../../../src/components/MidiDetectionPanel';

/** Simplified tests for MidiDetectionPanel */

describe('MidiDetectionPanel', () => {
  it('renders without detection controls', () => {
    const { queryByRole } = render(
      <MidiDetectionPanel midiData={{ playedNotes: [], playedPitchClasses: new Set(), clearPlayedNotes: () => {} }} />
    );
    expect(queryByRole('checkbox')).toBeNull();
    expect(queryByRole('combobox')).toBeNull();
  });
});
