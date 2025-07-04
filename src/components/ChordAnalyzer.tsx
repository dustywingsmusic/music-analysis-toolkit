import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { TONIC_ROOT_NAMES } from '../constants/keys';
import { analyzeMusic } from '../services/geminiService';
import type { AnalysisResult, AnalysisResponsePayload } from '../types';
import ResultDisplay from './ResultDisplay';
import LoadingSpinner from './LoadingSpinner';
import ToggleSwitch from './ToggleSwitch';
import { getChromaticScaleWithEnharmonics } from '../utils/music';
import DebugInfoDisplay from './DebugInfoDisplay';

interface ChordAnalyzerProps {
  onSwitchToFinder: (id: string) => void;
  showDebugInfo: boolean;
}

const ChordAnalyzer: React.FC<ChordAnalyzerProps> = ({ onSwitchToFinder, showDebugInfo }) => {
  const [tonic, setTonic] = useState<string>(TONIC_ROOT_NAMES[0]);
  const [chord, setChord] = useState<string>('Dm7');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScaleMode, setIsScaleMode] = useState<boolean>(false);
  const [selectedNotes, setSelectedNotes] = useState<Record<string, boolean>>({});
  const [debugInfo, setDebugInfo] = useState<AnalysisResponsePayload['debug'] | null>(null);

  const selectableNotes = useMemo(() => getChromaticScaleWithEnharmonics(tonic), [tonic]);

  useEffect(() => {
    setSelectedNotes({});
  }, [tonic, isScaleMode]);

  const handleNoteSelect = (note: string) => {
    setSelectedNotes(prev => ({ ...prev, [note]: !prev[note] }));
  };

  const getSelectedNoteArray = useCallback(() => {
    return Object.keys(selectedNotes).filter(note => selectedNotes[note]);
  }, [selectedNotes]);

  const handleAnalyze = useCallback(async () => {
    setError(null);
    setAnalysisResult(null);
    setDebugInfo(null);
    setIsLoading(true);

    try {
      let payload: AnalysisResponsePayload;
      if (isScaleMode) {
        const notesToAnalyze = getSelectedNoteArray();
        if (notesToAnalyze.length < 3) {
            setError("Please select at least 3 notes to analyze a scale.");
            setIsLoading(false);
            return;
        }
        payload = await analyzeMusic(tonic, { notes: notesToAnalyze });
      } else {
        if (!chord) {
          setError("Please enter a chord to analyze.");
          setIsLoading(false);
          return;
        }
        payload = await analyzeMusic(tonic, { chord });
      }
      
      setDebugInfo(payload.debug);

      if (payload.result.error) {
        setError(payload.result.error);
        setAnalysisResult(null);
      } else {
        setAnalysisResult(payload.result);
        setError(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [tonic, chord, isScaleMode, getSelectedNoteArray]);

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setDebugInfo(null);
    if (isScaleMode) {
        setSelectedNotes({});
    }
  }, [isScaleMode]);

  return (
    <div className="chord-analyzer">
      {/* Input Form */}
      <div className="card card--blur">

        <div className="chord-analyzer__toggle-container">
            <ToggleSwitch
                labelLeft="Chord"
                labelRight="Scale"
                value={isScaleMode}
                onChange={setIsScaleMode}
            />
        </div>

        <div className="chord-analyzer__input-grid">
          <div>
            <label htmlFor="tonic-root" className="label">
              Tonic (root)
            </label>
            <select
              id="tonic-root"
              value={tonic}
              onChange={(e) => setTonic(e.target.value)}
              className="select-input"
            >
              {TONIC_ROOT_NAMES.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          {!isScaleMode && (
            <div>
              <label htmlFor="chord" className="label">
                Chord
              </label>
              <input
                id="chord"
                type="text"
                value={chord}
                onChange={(e) => setChord(e.target.value)}
                placeholder="e.g., Am7, G, Fmaj7"
                className="text-input"
              />
            </div>
          )}
        </div>

        {isScaleMode && (
            <div className="note-selector">
                <label className="label">
                    Select Notes
                </label>
                <div className="note-selector__grid">
                    {selectableNotes.map(note => (
                        <label key={note} className={`note-selector__note ${selectedNotes[note] ? 'note-selector__note--selected' : ''}`}>
                            <input
                                type="checkbox"
                                checked={!!selectedNotes[note]}
                                onChange={() => handleNoteSelect(note)}
                                className="sr-only"
                            />
                            <span className="note-selector__note-text">{note}</span>
                        </label>
                    ))}
                </div>
            </div>
        )}

        <div className="chord-analyzer__actions">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="btn btn--primary btn--grow"
          >
            {isLoading ? 'Analyzing...' : (isScaleMode ? 'Analyze Scale' : 'Analyze Chord')}
          </button>
          {(analysisResult || error) && (
            <button
              onClick={handleReset}
              className="btn btn--secondary"
              title="Clear results and error"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="chord-analyzer__output">
        {showDebugInfo && debugInfo && (
            <DebugInfoDisplay
                prompt={debugInfo.prompt}
                userPrompt={debugInfo.userPrompt}
                rawResponse={debugInfo.rawResponse}
            />
        )}
        {isLoading && <LoadingSpinner />}
        {error && <div className="error-box">{error}</div>}
        {analysisResult && analysisResult.analysis && (
          <ResultDisplay 
            result={analysisResult}
            onSwitchToFinder={onSwitchToFinder}
            userInputTonic={tonic}
          />
        )}
      </div>
    </div>
  );
};

export default ChordAnalyzer;