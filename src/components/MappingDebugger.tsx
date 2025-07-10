import React, {useEffect, useState} from 'react';
import {
  generateHighlightId,
  getAllModes,
  getMappingStats,
  getScaleFamilyFromMode,
  MODE_TO_SCALE_FAMILY,
  SCALE_TO_TABLE_ID,
  validateMappings
} from '../constants/mappings';

interface MappingDebuggerProps {
  isVisible: boolean;
  onClose: () => void;
}

const MappingDebugger: React.FC<MappingDebuggerProps> = ({ isVisible, onClose }) => {
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [mappingStats, setMappingStats] = useState<any>(null);
  const [allModes, setAllModes] = useState<{ [scaleFamily: string]: string[] } | null>(null);
  const [testMode, setTestMode] = useState<string>('');
  const [testTonic, setTestTonic] = useState<string>('C');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    if (isVisible) {
      // Run validation and get stats when component becomes visible
      setValidationResult(validateMappings());
      setMappingStats(getMappingStats());
      setAllModes(getAllModes());
    }
  }, [isVisible]);

  const handleTestMapping = () => {
    if (!testMode.trim()) {
      setTestResult('Please enter a mode name to test');
      return;
    }

    const scaleFamily = getScaleFamilyFromMode(testMode);
    const highlightId = generateHighlightId(scaleFamily, testMode, testTonic);
    
    setTestResult(`
Mode: ${testMode}
Tonic: ${testTonic}
Scale Family: ${scaleFamily}
Highlight ID: ${highlightId || 'null (failed to generate)'}
    `.trim());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-300">Mapping System Debugger</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Validation Results */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Validation Results</h3>
          {validationResult && (
            <div className={`p-3 rounded ${validationResult.isValid ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
              <p className={`font-medium ${validationResult.isValid ? 'text-green-300' : 'text-red-300'}`}>
                {validationResult.isValid ? '✓ All mappings are valid' : '✗ Mapping validation failed'}
              </p>
              {validationResult.errors.length > 0 && (
                <ul className="mt-2 text-sm text-red-200">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Mapping Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Mapping Statistics</h3>
          {mappingStats && (
            <div className="bg-slate-700/50 p-3 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Scale Families:</span>
                  <span className="text-white ml-2">{mappingStats.scaleFamilies}</span>
                </div>
                <div>
                  <span className="text-gray-300">Total Modes:</span>
                  <span className="text-white ml-2">{mappingStats.totalModes}</span>
                </div>
                <div>
                  <span className="text-gray-300">Note Variants:</span>
                  <span className="text-white ml-2">{mappingStats.totalNoteVariants}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-gray-300">Scale Families:</span>
                <div className="text-white text-xs mt-1">
                  {mappingStats.scaleFamilyNames.join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Mapping Function */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Test Mapping</h3>
          <div className="bg-slate-700/50 p-3 rounded">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mode Name:</label>
                <input
                  type="text"
                  value={testMode}
                  onChange={(e) => setTestMode(e.target.value)}
                  placeholder="e.g., Locrian ♮6, Dorian, Blues Mode II"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Tonic:</label>
                <input
                  type="text"
                  value={testTonic}
                  onChange={(e) => setTestTonic(e.target.value)}
                  placeholder="e.g., C, F♯, B♭"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleTestMapping}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Test Mapping
            </button>
            {testResult && (
              <pre className="mt-3 p-3 bg-slate-800 rounded text-sm text-green-300 whitespace-pre-wrap">
                {testResult}
              </pre>
            )}
          </div>
        </div>

        {/* All Available Modes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">All Available Modes</h3>
          {allModes && (
            <div className="bg-slate-700/50 p-3 rounded max-h-60 overflow-y-auto">
              {Object.entries(allModes).map(([scaleFamily, modes]) => (
                <div key={scaleFamily} className="mb-3">
                  <h4 className="font-medium text-cyan-300 mb-1">{scaleFamily}</h4>
                  <div className="text-sm text-gray-300 ml-4">
                    {modes.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapping Tables Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Mapping Tables</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-cyan-300 mb-1">Scale to Table ID</h4>
              <div className="bg-slate-700/50 p-3 rounded text-sm">
                {Object.entries(SCALE_TO_TABLE_ID).map(([scale, tableId]) => (
                  <div key={scale} className="flex justify-between">
                    <span className="text-gray-300">{scale}:</span>
                    <span className="text-white">{tableId}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-cyan-300 mb-1">Mode to Scale Family (Sample)</h4>
              <div className="bg-slate-700/50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                {Object.entries(MODE_TO_SCALE_FAMILY).slice(0, 20).map(([mode, family]) => (
                  <div key={mode} className="flex justify-between">
                    <span className="text-gray-300">{mode}:</span>
                    <span className="text-white">{family}</span>
                  </div>
                ))}
                {Object.keys(MODE_TO_SCALE_FAMILY).length > 20 && (
                  <div className="text-gray-400 text-xs mt-2">
                    ... and {Object.keys(MODE_TO_SCALE_FAMILY).length - 20} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingDebugger;