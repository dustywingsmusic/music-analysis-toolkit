import React, { useState, useCallback } from 'react';
import { MUSICAL_KEYS } from '../constants/keys';
import { analyzeMusic } from '../services/geminiService';
import type { AnalysisResult } from '@/src/types.ts';
import ResultDisplay from './ResultDisplay';
import LoadingSpinner from './LoadingSpinner';
import ToggleSwitch from './ToggleSwitch';

interface ChordAnalyzerProps {
  onSwitchToFinder: (id: string) => void;
}

const CHROMATIC_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const ChordAnalyzer: React.FC<ChordAnalyzerProps> = ({ onSwitchToFinder }) => {
  const [musicalKey, setMusicalKey] = useState<string>(MUSICAL_KEYS[0]);
  const [chord, setChord] = useState<string>('Dm7');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScaleMode, setIsScaleMode] = useState<boolean>(false);
  const [selectedNotes, setSelectedNotes] = useState<Record<string, boolean>>({});

  const handleNoteSelect = (note: string) => {
    setSelectedNotes(prev => ({ ...prev, [note]: !prev[note] }));
  };

  const getSelectedNoteArray = useCallback(() => {
    return Object.keys(selectedNotes).filter(note => selectedNotes[note]);
  }, [selectedNotes]);

  const handleAnalyze = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      let result: AnalysisResult;
      if (isScaleMode) {
        const notesToAnalyze = getSelectedNoteArray();
        if (notesToAnalyze.length < 3) {
            setError("Please select at least 3 notes to analyze a scale.");
            setIsLoading(false);
            return;
        }
        result = await analyzeMusic(musicalKey, { notes: notesToAnalyze });
      } else {
        if (!chord) {
          setError("Please enter a chord to analyze.");
          setIsLoading(false);
          return;
        }
        result = await analyzeMusic(musicalKey, { chord });
      }

      if (result.error) {
        setError(result.error);
        setAnalysisResult(null);
      } else {
        setAnalysisResult(result);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [musicalKey, chord, isScaleMode, getSelectedNoteArray]);

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    if (isScaleMode) {
        setSelectedNotes({});
    }
  }, [isScaleMode]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input Form */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-sm">

        <div className="flex justify-center mb-6">
            <ToggleSwitch
                labelLeft="Chord"
                labelRight="Scale"
                value={isScaleMode}
                onChange={setIsScaleMode}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="musical-key" className="block text-sm font-medium text-cyan-300 mb-1">
              Musical Key
            </label>
            <select
              id="musical-key"
              value={musicalKey}
              onChange={(e) => setMusicalKey(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            >
              {MUSICAL_KEYS.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          {!isScaleMode && (
            <div>
              <label htmlFor="chord" className="block text-sm font-medium text-cyan-300 mb-1">
                Chord
              </label>
              <input
                id="chord"
                type="text"
                value={chord}
                onChange={(e) => setChord(e.target.value)}
                placeholder="e.g., Am7, G, Fmaj7"
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
            </div>
          )}
        </div>

        {isScaleMode && (
            <div className="mt-4">
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Select Notes
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {CHROMATIC_NOTES.map(note => (
                        <label key={note} className={`flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors border-2 ${selectedNotes[note] ? 'bg-cyan-600 border-cyan-400' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}>
                            <input
                                type="checkbox"
                                checked={!!selectedNotes[note]}
                                onChange={() => handleNoteSelect(note)}
                                className="sr-only"
                            />
                            <span className="font-mono text-white select-none">{note}</span>
                        </label>
                    ))}
                </div>
            </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="flex-grow flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400"
          >
            {isLoading ? 'Analyzing...' : (isScaleMode ? 'Analyze Scale' : 'Analyze Chord')}
          </button>
          {(analysisResult || error) && (
            <button
              onClick={handleReset}
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
              title="Clear results and error"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <div className="text-center p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
        {analysisResult && analysisResult.analysis && analysisResult.songExamples && (
          <ResultDisplay 
            result={{
              analysis: analysisResult.analysis as any, // Cast to avoid TS complaining about optional props
              songExamples: analysisResult.songExamples
            }}
            onSwitchToFinder={onSwitchToFinder}
          />
        )}
      </div>
    </div>
  );
};

export default ChordAnalyzer;
