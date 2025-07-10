import React, {useState} from 'react';
import QuestionDrivenMusicTool from './components/QuestionDrivenMusicTool';

const App: React.FC = () => {
  const [showDebugInfo] = useState<boolean>(false);

  return (
    <div id="app-container" className="app-container">
      <QuestionDrivenMusicTool showDebugInfo={showDebugInfo} />
    </div>
  );
};

export default App;
