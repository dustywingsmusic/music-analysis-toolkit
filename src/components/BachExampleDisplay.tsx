import React from 'react';
import type { BachExample } from '../types';

const BachExampleDisplay: React.FC<BachExample> = ({
  title, bwv, composer, key: musicKey, exampleKey, explanation, midiUrl, scoreUrl
}) => {
  const displayKey = musicKey || exampleKey;

  let displayTitle = title;
  let displayBwv = bwv;
  if (title) {
    const bwvMatch = title.match(/BWV\s*\d+[a-z]?/i);
    if (bwvMatch && !displayBwv) {
      displayBwv = bwvMatch[0].toUpperCase();
      displayTitle = title.replace(new RegExp(bwvMatch[0], 'i'), '').replace(/,?\s*$/, '').replace(/,$/, '').trim();
    }
  }


  return (
    <div className="bach-example">
      <p className="bach-example__label">Example from {composer || 'J.S. Bach'}</p>
      <p className="bach-example__title">
        {displayTitle} {displayBwv && <span className="bach-example__bwv">({displayBwv})</span>} {displayKey && <> &bull; <span className="bach-example__key">Key: {displayKey}</span></>}
      </p>

      {midiUrl && (
        <div className="mt-2">
          <audio controls src={midiUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {scoreUrl && (
        <div className="mt-4">
          <a href={scoreUrl} target="_blank" rel="noopener noreferrer" className="link-button text-base">
            View Full Score (PDF)
          </a>
        </div>
      )}

      {!midiUrl && !scoreUrl && !explanation && (
        <div className="mt-2">
            <p className="text-xs text-slate-400">Could not find a playable example for this analysis.</p>
        </div>
      )}

      {explanation && (
        <div className="bach-example__explanation-container">
          <p className="bach-example__explanation-text">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default BachExampleDisplay;
