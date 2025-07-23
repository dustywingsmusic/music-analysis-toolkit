import React, {useState, useEffect} from 'react';
import QuestionDrivenMusicTool from './components/QuestionDrivenMusicTool';

declare const WebMidi: any;

const App: React.FC = () => {
  const [showDebugInfo] = useState<boolean>(false);

  // Application-level MIDI cleanup for additional safety
  useEffect(() => {
    const handleAppCleanup = () => {
      // Global MIDI cleanup
      if (typeof WebMidi !== 'undefined' && WebMidi.enabled) {
        WebMidi.inputs.forEach((input: any) => {
          input.removeListener();
        });
      }
    };

    window.addEventListener('beforeunload', handleAppCleanup);
    window.addEventListener('pagehide', handleAppCleanup);

    return () => {
      window.removeEventListener('beforeunload', handleAppCleanup);
      window.removeEventListener('pagehide', handleAppCleanup);
      handleAppCleanup();
    };
  }, []);

  return (
    <div id="app-container" className="app-container">
      <QuestionDrivenMusicTool showDebugInfo={showDebugInfo} />
    </div>
  );
};

export default App;
