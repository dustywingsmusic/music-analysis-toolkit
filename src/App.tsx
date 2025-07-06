
import React, { useState } from 'react';
import QuestionDrivenMusicTool from './components/QuestionDrivenMusicTool';
import MusicIcon from './components/MusicIcon';
import ToggleSwitch from './components/ToggleSwitch';

const App: React.FC = () => {
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);


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
          <ToggleSwitch
            labelLeft="Info"
            labelRight="Debug"
            value={showDebugInfo}
            onChange={setShowDebugInfo}
          />
        </div>

        <main>
          <QuestionDrivenMusicTool showDebugInfo={showDebugInfo} />
        </main>

        <footer className="app-footer">
            <p>Powered by Dusty Wings</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
