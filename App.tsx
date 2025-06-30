import React, { useState } from 'react';
import ChordAnalyzer from './components/ChordAnalyzer';
import ScaleFinder from './components/ScaleFinder';
import MusicIcon from './components/MusicIcon';

type View = 'analyzer' | 'finder';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('analyzer');
  const [highlightIdForFinder, setHighlightIdForFinder] = useState<string | null>(null);

  const navButtonClasses = (view: View) => 
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 ` +
    (activeView === view
      ? 'bg-cyan-600 text-white'
      : 'bg-slate-700 text-slate-300 hover:bg-slate-600');

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
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <MusicIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Music Theory Toolkit
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Interactive tools for chord analysis and scale discovery.
          </p>
        </header>

        <nav className="flex justify-center mb-8 bg-slate-800 p-2 rounded-lg gap-2">
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

        <main>
          <div className={activeView === 'analyzer' ? '' : 'hidden'}>
            <ChordAnalyzer onSwitchToFinder={handleSwitchToFinderWithHighlight} />
          </div>
          <div className={activeView === 'finder' ? '' : 'hidden'}>
            <ScaleFinder initialHighlightId={highlightIdForFinder} />
          </div>
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Dusty Wings</p>
        </footer>
      </div>
    </div>
  );
};

export default App;