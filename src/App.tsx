
import React, { useState } from 'react';
import QuestionDrivenMusicTool from './components/QuestionDrivenMusicTool';
import MusicIcon from './components/MusicIcon';
import ToggleSwitch from './components/ToggleSwitch';

const App: React.FC = () => {
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

  return (
    <div id="app-container" className="app-container">
      <QuestionDrivenMusicTool showDebugInfo={showDebugInfo} />
    </div>
  );
};

export default App;
