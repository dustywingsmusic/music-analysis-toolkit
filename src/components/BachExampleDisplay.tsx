import React, { useEffect, useRef } from 'react';
import type { BachExample } from '../types';

declare const ABCJS: any;

const BachExampleDisplay: React.FC<BachExample> = ({ 
  title, bwv, composer, key, exampleKey, abcNotation, tempo, snippet, explanation
}) => {
  const notationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof ABCJS === 'undefined') return;

    let fullAbcString = abcNotation;

    if (!fullAbcString && snippet) {
      const headers = [];
      headers.push('X:1');
      if (title) headers.push(`T:${title}`);
      if (composer) headers.push(`C:${composer}`);

      if (tempo) {
        if (tempo.toLowerCase().includes('alla breve') || tempo.includes('2/2')) {
          headers.push('M:C|'); // Cut time
        } else if (tempo.includes('3/4')) {
          headers.push('M:3/4');
        } else {
          headers.push('M:4/4');
        }
      } else {
        headers.push('M:4/4');
      }

      headers.push('L:1/8');

      const keySignature = key || exampleKey;
      if (keySignature) {
        const parsedKey = keySignature.split('(')[0].trim();
        headers.push(`K:${parsedKey}`);
      } else {
        headers.push('K:C');
      }
      
      fullAbcString = `${headers.join('\n')}\n${snippet}`;
    }

    if (fullAbcString && notationRef.current && audioRef.current) {
      notationRef.current.innerHTML = '';
      audioRef.current.innerHTML = '';
      
      const visualObj = ABCJS.renderAbc(notationRef.current, fullAbcString, {
        responsive: "resize",
        staffwidth: 500,
      });

      if (ABCJS.synth.supportsAudio()) {
        const synthControl = new ABCJS.synth.SynthController();
        synthControl.load(audioRef.current, null, {
          displayLoop: true,
          displayRestart: true,
          displayPlay: true,
          displayProgress: true,
          displayWarp: true,
        });
        
        const createSynth = new ABCJS.synth.CreateSynth();
        createSynth.init({ visualObj: visualObj[0] }).then(() => {
          synthControl.setTune(visualObj[0], false).catch((error: Error) => {
            console.warn("Audio problem during setTune:", error);
          });
        }).catch((error: Error) => {
          console.warn("Audio problem during synth init:", error);
        });
      } else {
        if (audioRef.current) {
            audioRef.current.innerHTML = "<p class='text-xs text-slate-400'>Audio player not supported in this browser.</p>";
        }
      }
    }
  }, [abcNotation, snippet, title, composer, key, exampleKey, tempo]);

  const displayKey = key || exampleKey;
  
  let displayTitle = title;
  let displayBwv = bwv;
  if (title) {
    const bwvMatch = title.match(/BWV\s*\d+[a-z]?/);
    if (bwvMatch && !displayBwv) {
      displayBwv = bwvMatch[0];
      displayTitle = title.replace(bwvMatch[0], '').replace(/,?\s*$/, '').replace(/,$/, '').trim();
    }
  }


  return (
    <div className="bach-example">
      <p className="bach-example__label">Example from {composer || 'J.S. Bach'}</p>
      <p className="bach-example__title">
        {displayTitle} {displayBwv && <span className="bach-example__bwv">({displayBwv})</span>} {displayKey && <> &bull; <span className="bach-example__key">Key: {displayKey}</span></>}
      </p>
      <div ref={audioRef} className="bach-example__audio-control"></div>
      <div className="bach-example__notation-wrapper">
        <div ref={notationRef}></div>
      </div>
      {explanation && (
        <div className="bach-example__explanation-container">
          <p className="bach-example__explanation-text">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default BachExampleDisplay;