import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import IntegratedMusicSidebar from '@/components/IntegratedMusicSidebar';

/** Snapshot tests for minimal sidebar rendering */

describe('IntegratedMusicSidebar snapshots', () => {
  it('renders collapsed sidebar', () => {
    const { container } = render(<IntegratedMusicSidebar />);
    expect(container).toMatchSnapshot();
  });

  it('renders expanded empty sidebar', () => {
    const { container, getByLabelText } = render(<IntegratedMusicSidebar />);
    fireEvent.click(getByLabelText('Show music analysis sidebar'));
    expect(container).toMatchSnapshot();
  });
});
