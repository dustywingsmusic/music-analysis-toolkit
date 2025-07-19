import React from 'react';

interface DebugInfoDisplayProps {
  prompt: object;
  userPrompt: string;
  rawResponse: string;
}

const DebugInfoDisplay: React.FC<DebugInfoDisplayProps> = ({ prompt, userPrompt, rawResponse }) => {
  return (
    <div className="debug-info">
      <h2 className="debug-info__title">Developer Info</h2>
      
      <div className="debug-info__section">
        <h3 className="debug-info__subtitle">LLM System Prompt</h3>
        <pre className="debug-info__pre">
          <code>{JSON.stringify(prompt, null, 2)}</code>
        </pre>
      </div>

      <div className="debug-info__section">
        <h3 className="debug-info__subtitle">LLM User Prompt</h3>
        <pre className="debug-info__pre">
          <code>{userPrompt}</code>
        </pre>
      </div>

      <div className="debug-info__section">
        <h3 className="debug-info__subtitle">Raw LLM Response</h3>
        <pre className="debug-info__pre">
          <code>{rawResponse}</code>
        </pre>
      </div>
    </div>
  );
};

export default DebugInfoDisplay;