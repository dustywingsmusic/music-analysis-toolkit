import React, { useState } from 'react';

type IdentificationMethod = 'melody' | 'scale' | 'progression' | 'audio';

interface ModeIdentificationTabProps {
  onAnalysisRequest: (method: IdentificationMethod, data: any) => void;
}

const ModeIdentificationTab: React.FC<ModeIdentificationTabProps> = ({ onAnalysisRequest }) => {
  const [activeMethod, setActiveMethod] = useState<IdentificationMethod>('melody');
  const [melodyNotes, setMelodyNotes] = useState<string>('');
  const [scaleNotes, setScaleNotes] = useState<string>('');
  const [progression, setProgression] = useState<string>('');

  const methods = [
    { id: 'melody' as IdentificationMethod, label: 'Melody Analysis', description: 'What mode is this melody?' },
    { id: 'scale' as IdentificationMethod, label: 'Scale Analysis', description: 'What mode uses these notes?' },
    { id: 'progression' as IdentificationMethod, label: 'Chord Progression', description: 'What mode fits this progression?' },
    { id: 'audio' as IdentificationMethod, label: 'Audio Analysis', description: 'Analyze audio input (coming soon)' },
  ];

  const handleAnalyze = () => {
    let data;
    switch (activeMethod) {
      case 'melody':
        data = { notes: melodyNotes };
        break;
      case 'scale':
        data = { notes: scaleNotes };
        break;
      case 'progression':
        data = { chords: progression };
        break;
      case 'audio':
        data = { audioFile: null }; // Future implementation
        break;
      default:
        return;
    }
    onAnalysisRequest(activeMethod, data);
  };

  const renderInputPanel = () => {
    switch (activeMethod) {
      case 'melody':
        return (
          <div className="input-panel">
            <label className="input-panel__label">
              Enter melody notes (e.g., C D E F G A B):
            </label>
            <textarea
              className="input-panel__textarea"
              value={melodyNotes}
              onChange={(e) => setMelodyNotes(e.target.value)}
              placeholder="C D E F G A B C"
              rows={3}
            />
            <p className="input-panel__help">
              Enter notes in sequence as they appear in your melody. Use sharps (#) or flats (b) as needed.
            </p>
          </div>
        );

      case 'scale':
        return (
          <div className="input-panel">
            <label className="input-panel__label">
              Enter scale notes (e.g., C D E F G A B):
            </label>
            <input
              type="text"
              className="input-panel__input"
              value={scaleNotes}
              onChange={(e) => setScaleNotes(e.target.value)}
              placeholder="C D E F G A B"
            />
            <p className="input-panel__help">
              Enter all the notes that appear in your scale, in any order.
            </p>
          </div>
        );

      case 'progression':
        return (
          <div className="input-panel">
            <label className="input-panel__label">
              Enter chord progression (e.g., Am F C G):
            </label>
            <input
              type="text"
              className="input-panel__input"
              value={progression}
              onChange={(e) => setProgression(e.target.value)}
              placeholder="Am F C G"
            />
            <p className="input-panel__help">
              Enter chords separated by spaces. Use standard chord notation (Am, F, C7, etc.).
            </p>
          </div>
        );

      case 'audio':
        return (
          <div className="input-panel">
            <div className="input-panel__placeholder">
              <p>🎵 Audio analysis coming soon!</p>
              <p className="input-panel__help">
                This feature will allow you to upload audio files or record directly for mode identification.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mode-identification-tab">
      <div className="tab-header">
        <h2 className="tab-header__title">Mode Identification</h2>
        <p className="tab-header__subtitle">
          Identify modes from melodies, scales, or chord progressions
        </p>
      </div>

      <div className="method-selector">
        <div className="method-selector__grid">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveMethod(method.id)}
              className={`method-selector__card ${
                activeMethod === method.id ? 'method-selector__card--active' : ''
              }`}
              disabled={method.id === 'audio'} // Disable audio for now
            >
              <h3 className="method-selector__card-title">{method.label}</h3>
              <p className="method-selector__card-description">{method.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="input-section">
        {renderInputPanel()}
        
        <div className="input-section__actions">
          <button
            onClick={handleAnalyze}
            className="btn btn--primary"
            disabled={
              (activeMethod === 'melody' && !melodyNotes.trim()) ||
              (activeMethod === 'scale' && !scaleNotes.trim()) ||
              (activeMethod === 'progression' && !progression.trim()) ||
              activeMethod === 'audio'
            }
          >
            Analyze Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeIdentificationTab;