import React, {useState, useEffect} from 'react';
import QuestionDrivenMusicToolWithInputContext from './components/QuestionDrivenMusicToolWithInputContext';
import { CookieConsent } from './components/CookieConsent';
import { AnalyticsManager } from './utils/analyticsManager';
import { AnalysisProvider } from './contexts/AnalysisContext';

declare const WebMidi: any;

const App: React.FC = () => {
  const [showDebugInfo] = useState<boolean>(false);

  // Application-level MIDI cleanup and Analytics initialization
  useEffect(() => {
    // Initialize Analytics Manager
    AnalyticsManager.initialize();

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
    <AnalysisProvider>
      <div id="app-container" className="app-container">
        <QuestionDrivenMusicToolWithInputContext showDebugInfo={showDebugInfo} />
        <CookieConsent
          onAccept={() => AnalyticsManager.grantConsent()}
          onDecline={() => AnalyticsManager.revokeConsent()}
        />
      </div>
    </AnalysisProvider>
  );
};

export default App;
