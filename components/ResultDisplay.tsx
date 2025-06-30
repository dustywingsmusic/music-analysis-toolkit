import React from 'react';
import type { AnalysisResult } from '../types';
import MusicIcon from './MusicIcon';
import { PARENT_KEY_INDICES } from '../constants/scales';

interface ResultDisplayProps {
  result: {
    analysis: NonNullable<AnalysisResult['analysis']>;
    songExamples: NonNullable<AnalysisResult['songExamples']>;
  };
  onSwitchToFinder: (id: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onSwitchToFinder }) => {
  const { analysis, songExamples } = result;

  const handleShowInFinder = () => {
    if (!analysis?.parentScaleRootNote || !analysis.tableId || analysis.modeIndex === undefined) return;

    const noteToPc: { [key: string]: number } = {
        'C': 0, 'B#': 0,
        'C#': 1, 'Db': 1,
        'D': 2,
        'D#': 3, 'Eb': 3,
        'E': 4, 'Fb': 4,
        'F': 5, 'E#': 5,
        'F#': 6, 'Gb': 6,
        'G': 7,
        'G#': 8, 'Ab': 8,
        'A': 9,
        'A#': 10, 'Bb': 10,
        'B': 11, 'Cb': 11,
    };

    const pitchClass = noteToPc[analysis.parentScaleRootNote];
    if (pitchClass === undefined) return;

    const keyRowIndex = PARENT_KEY_INDICES.indexOf(pitchClass);
    if (keyRowIndex === -1) return;

    const cellId = `${analysis.tableId}-${keyRowIndex}-${analysis.modeIndex}`;
    onSwitchToFinder(cellId);
  };

  return (
    <div className="mt-8 w-full animate-fade-in space-y-8">
      {/* Analysis Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">Analysis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-cyan-400">Key</p>
            <p className="text-lg text-white">{analysis.key}</p>
          </div>
          
          {analysis.chord && analysis.romanNumeral ? (
            <>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-cyan-400">Chord</p>
                <p className="text-lg text-white">{analysis.chord}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-cyan-400">Roman Numeral</p>
                <p className="text-lg text-white">{analysis.romanNumeral}</p>
              </div>
            </>
          ) : analysis.selectedNotes ? (
             <div className="bg-slate-700/50 p-4 rounded-lg sm:col-span-2">
                <p className="text-sm font-semibold text-cyan-400">Selected Notes</p>
                <p className="text-lg text-white font-mono">{analysis.selectedNotes.join(', ')}</p>
             </div>
          ) : null}

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-cyan-400">Mode</p>
            <div className="flex items-baseline justify-start gap-2 mt-1">
                <p className="text-lg text-white">{analysis.mode}</p>
                <button
                    onClick={handleShowInFinder}
                    className="text-cyan-400 hover:text-cyan-200 hover:underline text-sm font-medium transition-colors"
                    aria-label={`Show ${analysis.mode} in Scale Finder`}
                >
                    (View on Chart)
                </button>
            </div>
          </div>
           <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-cyan-400">Formula</p>
            <p className="text-lg text-white font-mono">{analysis.formula}</p>
          </div>
           <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-cyan-400">Intervals</p>
            <p className="text-lg text-white font-mono">{analysis.intervals.join(', ')}</p>
          </div>
        </div>
        <div className="mt-4 bg-slate-700/50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-cyan-400">Notes in Scale</p>
          <p className="mt-1 text-lg text-white font-mono tracking-wider">{analysis.notes.join(' - ')}</p>
        </div>
        <div className="mt-4 bg-slate-700/50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-cyan-400">Explanation</p>
          <p className="mt-1 text-slate-200">{analysis.explanation}</p>
        </div>
      </div>

      {/* Song Examples Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-teal-300 mb-4">Song Examples</h2>
        <ul className="space-y-4">
          {songExamples.map((song, index) => (
            <li key={index} className="flex items-start bg-slate-700/50 p-4 rounded-lg transition-all hover:bg-slate-700">
              <MusicIcon className="h-5 w-5 mt-1 mr-4 text-teal-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">{song.title}</p>
                <p className="text-sm text-slate-400">{song.artist}</p>
                <p className="text-sm text-slate-300 mt-2 italic bg-slate-600/50 p-2 rounded">
                  "{song.usage}"
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultDisplay;
