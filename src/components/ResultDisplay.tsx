import React from 'react';
import type { AnalysisResult, AlternateAnalysis, PrimaryAnalysis, SongExampleGroup } from '../types';
import MusicIcon from './MusicIcon';
import { PARENT_KEY_INDICES } from '../constants/scales';
import { noteToPc } from '../utils/music';
import BachExampleDisplay from './BachExampleDisplay';
import NearestGuessIcon from './NearestGuessIcon';

interface ResultDisplayProps {
  result: AnalysisResult;
  onSwitchToFinder: (id: string) => void;
  userInputTonic: string;
}

const InfoPair: React.FC<{ label: string; value: string | React.ReactNode; isMono?: boolean }> = ({ label, value, isMono }) => (
  <div className="info-pair">
    <p className="info-pair__label">{label}</p>
    <p className={`info-pair__value ${isMono ? 'info-pair__value--mono' : ''}`}>{value}</p>
  </div>
);

const AnalysisSection: React.FC<{ 
    analysis: PrimaryAnalysis | AlternateAnalysis; 
    onSwitchToFinder: (id: string) => void;
    isPrimary?: boolean;
}> = ({ analysis, onSwitchToFinder, isPrimary }) => {
    
    const handleShowInFinder = () => {
        if (!analysis?.parentScaleRootNote || !analysis.tableId || analysis.modeIndex === undefined) return;
        const pitchClass = noteToPc[analysis.parentScaleRootNote];
        if (pitchClass === undefined) return;
        const keyRowIndex = PARENT_KEY_INDICES.indexOf(pitchClass);
        if (keyRowIndex === -1) return;
        const cellId = `${analysis.tableId}-${keyRowIndex}-${analysis.modeIndex}`;
        onSwitchToFinder(cellId);
    };

    const isNearestGuess = isPrimary && 'isNearestGuess' in analysis && analysis.isNearestGuess;

    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                <InfoPair label="Mode" value={
                    <div className="flex items-center justify-start gap-2 mt-1">
                        <p className="text-lg text-white">{analysis.mode}</p>
                        {isNearestGuess && <NearestGuessIcon />}
                        <button
                            onClick={handleShowInFinder}
                            className="link-button"
                            aria-label={`Show ${analysis.mode} in Scale Finder`}
                        >
                            (View on Chart)
                        </button>
                    </div>
                } />
                {'key' in analysis && <InfoPair label="Inferred Parent Key" value={analysis.key} />}
                {isPrimary && 'romanNumeral' in analysis && analysis.romanNumeral && <InfoPair label="Roman Numeral" value={analysis.romanNumeral} />}
            </div>

            {isPrimary && 'bachExample' in analysis && analysis.bachExample && (
                <BachExampleDisplay {...analysis.bachExample} />
            )}
            
            <div className="info-pair">
                <p className="info-pair__label">Notes in Scale</p>
                <p className="mt-1 text-lg text-white font-mono tracking-wider">{analysis.notes.join(' - ')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoPair label="Formula" value={analysis.formula} isMono />
                <InfoPair label="Intervals" value={analysis.intervals.join(', ')} isMono />
            </div>
            <div className="info-pair">
                <p className="info-pair__label">Explanation</p>
                <p className="mt-1 text-slate-200">{analysis.explanation}</p>
            </div>
        </div>
    );
};

const SongExamplesSection: React.FC<{ songGroups: SongExampleGroup[] }> = ({ songGroups }) => (
    <div className="card card--blur">
        <h2 className="section-title section-title--teal">Song Examples</h2>
        <div className="space-y-6">
            {songGroups.map((group) => (
                <div key={group.mode}>
                    <h3 className="subsection-title">{group.mode}</h3>
                    <ul className="space-y-4">
                        {group.examples.map((song, index) => (
                             <li key={index} className="song-example-item">
                                <MusicIcon className="song-example-item__icon" />
                                <div>
                                    <p className="font-semibold text-white">{song.title}</p>
                                    <p className="text-sm text-slate-400">{song.artist}</p>
                                    <p className="song-example-item__usage">
                                    "{song.usage}"
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onSwitchToFinder, userInputTonic }) => {
  const { analysis, alternates, modeDiscussion, songExamples } = result;
  if (!analysis) return null;

  return (
    <div className="result-display">
      {/* User Input Section */}
      <div className="card card--blur">
        <h2 className="section-title section-title--cyan">Your Input</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoPair label="Tonic (Root)" value={userInputTonic} />
            {analysis.chord ? (
                <InfoPair label="Chord" value={analysis.chord} />
            ) : analysis.selectedNotes ? (
                <div className="info-pair">
                    <p className="info-pair__label">Selected Notes</p>
                    <p className="info-pair__value info-pair__value--mono">{analysis.selectedNotes.join(', ')}</p>
                </div>
            ) : null}
        </div>
      </div>
      
      {/* Primary Analysis Section */}
      <div className="card card--blur">
        <h2 className="section-title section-title--cyan">Primary Analysis</h2>
        <AnalysisSection analysis={analysis} onSwitchToFinder={onSwitchToFinder} isPrimary />
      </div>

      {/* Alternate Interpretations */}
      {alternates && alternates.length > 0 && alternates.map((alt, index) => (
         <div key={index} className="card card--blur">
            <h2 className="section-title section-title--amber">Alternate Interpretation #{index + 1}</h2>
            <AnalysisSection analysis={alt} onSwitchToFinder={onSwitchToFinder} />
        </div>
      ))}

      {/* Mode Discussion Section */}
      {modeDiscussion && (
          <div className="card card--blur">
            <h2 className="section-title section-title--violet">Mode Discussion</h2>
            <div className="prose-styles">
                <p>{modeDiscussion}</p>
            </div>
          </div>
      )}

      {/* Song Examples Section */}
      {songExamples && songExamples.length > 0 && <SongExamplesSection songGroups={songExamples} />}
    </div>
  );
};

export default ResultDisplay;