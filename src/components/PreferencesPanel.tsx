import React, { useState, useEffect } from 'react';
import { UserPreferences, loadPreferences, updatePreference, resetPreferences } from '../services/preferences';

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences());

  useEffect(() => {
    if (isOpen) {
      setPreferences(loadPreferences());
    }
  }, [isOpen]);

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updated = updatePreference(key, value);
    setPreferences(updated);
  };

  const handleReset = () => {
    const defaults = resetPreferences();
    setPreferences(defaults);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop visible">
      <div className="preferences-panel">
        <div className="preferences-header">
          <h3 id="preferences-dialog">Preferences</h3>
          <button 
            className="suggestion-close" 
            onClick={onClose}
            aria-label="Close preferences"
          >
            &times;
          </button>
        </div>

        <div className="preferences-content">
          {/* Chord Detection Settings */}
          <div className="preference-section">
            <h4 className="preference-section-title">Chord Detection</h4>
            
            <div className="preference-item">
              <label htmlFor="chord-timeout" className="preference-label">
                Chord Detection Timeout
              </label>
              <div className="preference-control">
                <input
                  id="chord-timeout"
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={preferences.chordDetectionTimeout}
                  onChange={(e) => handlePreferenceChange('chordDetectionTimeout', parseInt(e.target.value))}
                  className="range-input"
                />
                <span className="preference-value">{preferences.chordDetectionTimeout}ms</span>
              </div>
              <p className="preference-description">
                Time window for grouping notes into chords. Lower values require faster playing.
              </p>
            </div>

            <div className="preference-item">
              <label htmlFor="detection-sensitivity" className="preference-label">
                Detection Sensitivity
              </label>
              <div className="preference-control">
                <select
                  id="detection-sensitivity"
                  value={preferences.detectionSensitivity}
                  onChange={(e) => handlePreferenceChange('detectionSensitivity', e.target.value as UserPreferences['detectionSensitivity'])}
                  className="select-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <p className="preference-description">
                Affects how sensitive the detection algorithms are to input variations.
              </p>
            </div>
          </div>

          {/* UI Behavior Settings */}
          <div className="preference-section">
            <h4 className="preference-section-title">UI Behavior</h4>
            
            <div className="preference-item">
              <label className="preference-checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.autoScrollToScale}
                  onChange={(e) => handlePreferenceChange('autoScrollToScale', e.target.checked)}
                  className="checkbox-input"
                />
                <span>Auto-scroll to highlighted scales</span>
              </label>
              <p className="preference-description">
                Automatically scroll to scales when they are highlighted from suggestions.
              </p>
            </div>

            <div className="preference-item">
              <label className="preference-checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.showScaleLinks}
                  onChange={(e) => handlePreferenceChange('showScaleLinks', e.target.checked)}
                  className="checkbox-input"
                />
                <span>Show clickable scale links in suggestions</span>
              </label>
              <p className="preference-description">
                Display clickable links in melody suggestions to jump to scale tables.
              </p>
            </div>

            <div className="preference-item">
              <label className="preference-checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.modalAnimations}
                  onChange={(e) => handlePreferenceChange('modalAnimations', e.target.checked)}
                  className="checkbox-input"
                />
                <span>Enable modal animations</span>
              </label>
              <p className="preference-description">
                Show smooth animations when opening and closing suggestion modals.
              </p>
            </div>
          </div>
        </div>

        <div className="preferences-footer">
          <button 
            onClick={handleReset}
            className="btn btn--secondary"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={onClose}
            className="btn btn--primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPanel;