
import React, { useState } from 'react';
import ChordAnalyzer from './components/ChordAnalyzer';
import ScaleFinder from './components/ScaleFinder';
import MusicIcon from './components/MusicIcon';
import ToggleSwitch from './components/ToggleSwitch';

type View = 'analyzer' | 'finder';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('analyzer');
  const [highlightIdForFinder, setHighlightIdForFinder] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

  const navButtonClasses = (view: View) => 
    'nav-button ' + (activeView === view ? 'nav-button--active' : '');

  const handleSwitchToFinderWithHighlight = (id: string) => {
    setHighlightIdForFinder(id);
    setActiveView('finder');
  };
  
  const handleViewChange = (view: View) => {
    if (view === 'analyzer') {
        // When switching back to analyzer, we don't clear the highlight
        // so if the user switches back and forth, the context is kept.
    }
    setActiveView(view);
  };


  return (
    <div className="app-container">
      <div className="main-content">
        <header className="app-header">
          <div className="app-header__title-wrapper">
            <MusicIcon className="app-header__icon" />
            <h1 className="app-header__title">
              Music Theory Toolkit
            </h1>
          </div>
          <p className="app-header__subtitle">
            Interactive tools for chord analysis and scale discovery.
          </p>
        </header>

        <div className="view-controls">
          <nav className="view-switcher">
            <button 
              onClick={() => handleViewChange('analyzer')}
              className={navButtonClasses('analyzer')}
            >
              Analyzer
            </button>
            <button onClick={() => handleViewChange('finder')} className={navButtonClasses('finder')}>
              Scale Finder
            </button>
          </nav>
          <ToggleSwitch
            labelLeft="Info"
            labelRight="Debug"
            value={showDebugInfo}
            onChange={setShowDebugInfo}
          />
        </div>


        <main>
          <div className={activeView === 'analyzer' ? '' : 'hidden'}>
            <ChordAnalyzer onSwitchToFinder={handleSwitchToFinderWithHighlight} showDebugInfo={showDebugInfo} />
          </div>
          <div className={activeView === 'finder' ? '' : 'hidden'}>
            <ScaleFinder initialHighlightId={highlightIdForFinder} />
          </div>
        </main>
        
        <footer className="app-footer">
            <p>Powered by Dusty Wings</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
