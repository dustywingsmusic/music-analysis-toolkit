import React, { useState } from 'react';
import type { MidiDevice } from '../types';
import { trackInteraction } from '../utils/tracking';

interface MidiSettingsPanelProps {
  status?: string;
  devices?: MidiDevice[];
  selectedDevice?: string | null;
  setSelectedDevice?: (deviceId: string) => void;
  error?: string | null;
  className?: string;
  enabled?: boolean;
  enableMidi?: () => void;
  disableMidi?: () => void;
}

const MidiSettingsPanel: React.FC<MidiSettingsPanelProps> = ({
  status = 'Initializing...',
  devices = [],
  selectedDevice = null,
  setSelectedDevice = () => {},
  error = null,
  className = '',
  enabled = true,
  enableMidi = () => {},
  disableMidi = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePanel = () => {
    const newState = !isExpanded;
    // Track panel toggle
    trackInteraction(`MIDI Settings Panel - ${newState ? 'Open' : 'Close'}`, 'Navigation');
    setIsExpanded(newState);
  };

  const handleMidiToggle = () => {
    if (enabled) {
      disableMidi();
    } else {
      enableMidi();
    }
  };

  return (
    <div className={`midi-settings-panel ${className}`}>
      {/* MIDI Status Indicator & Toggle Button */}
      <button
        onClick={togglePanel}
        className="midi-status-button"
        title={`MIDI Status: ${status}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎹</span>
          <span className="text-sm font-medium">MIDI</span>
          <div className={`status-indicator ${error ? 'status-error' : status.includes('Listening') ? 'status-active' : 'status-inactive'}`}></div>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      {/* Expandable Panel */}
      {isExpanded && (
        <div className="midi-panel-content">
          <div className="midi-panel-card">
            {/* MIDI Status */}
            <div className="mb-4">
              <p className="text-sm font-semibold">
                Status: <span className={`${error ? 'text-red-400' : 'text-cyan-400'}`}>{status}</span>
              </p>
              {error && <p className="text-red-400 text-xs mt-1">Error: {error}</p>}
            </div>

            {/* MIDI On/Off Switch */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label htmlFor="midi-enabled" className="text-xs font-medium">
                  MIDI Input
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="midi-enabled"
                    type="checkbox"
                    checked={enabled}
                    onChange={handleMidiToggle}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-cyan-600' : 'bg-slate-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Device Selection */}
            {enabled && devices.length > 0 && (
              <div className="mb-4">
                <label htmlFor="midi-device-universal" className="block text-xs font-medium mb-1">
                  MIDI Input Device
                </label>
                <select
                  id="midi-device-universal"
                  value={selectedDevice || ''}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-cyan-400"
                >
                  <option value="" disabled>Select a device</option>
                  {devices.map(device => (
                    <option key={device.id} value={device.id}>{device.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MidiSettingsPanel;
