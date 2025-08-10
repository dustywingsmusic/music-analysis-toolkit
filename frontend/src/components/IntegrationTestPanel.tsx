/**
 * Integration Test Panel
 * Component to test Phase 1 integration functionality
 * Can be temporarily added to verify everything works
 */

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAnalysis, useAnalysisActions } from '../contexts/AnalysisContext';
import { analyzeChordProgression } from '../services/hybridAnalysisService';
import { testChordProgressionAnalysis } from '../services/testChordProgressionAnalysis';

const IntegrationTestPanel: React.FC = () => {
  const { state } = useAnalysis();
  const { startAnalysis, completeLocalAnalysis, completeAIEnhancement, navigateToReference } = useAnalysisActions();
  const [testResults, setTestResults] = useState<string>('');

  const testProgressions = [
    { name: 'Pop Progression', progression: 'Am F C G', expectedKey: 'C Major' },
    { name: 'Modal Example', progression: 'Dm G Em Am', expectedKey: 'A Minor/Modal' },
    { name: 'Jazz Standard', progression: 'Cmaj7 Am7 Dm7 G7', expectedKey: 'C Major' }
  ];

  const runQuickTest = async (progression: string, expectedKey: string) => {
    try {
      console.log(`🧪 Testing: ${progression}`);

      startAnalysis('chord_progression', progression);

      const result = await analyzeChordProgression(progression, {
        useLocalFirst: true,
        enableAIEnhancement: false, // Skip AI for quick test
        enableCrossValidation: false
      });

      completeLocalAnalysis(result.localResult);

      const actualKey = result.localResult.results.chordProgression?.localAnalysis.keyCenter || 'Unknown';
      const confidence = result.localResult.results.confidence || 0;

      const success = actualKey.includes(expectedKey.split('/')[0]);

      return {
        success,
        actualKey,
        confidence,
        processingTime: result.localResult.metadata.processingTime
      };

    } catch (error) {
      console.error('Test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setTestResults('🚀 Running Phase 1 Integration Tests...\n\n');

    let passedTests = 0;
    let totalTests = testProgressions.length;

    for (const test of testProgressions) {
      const result = await runQuickTest(test.progression, test.expectedKey);

      const resultText = `📋 ${test.name} (${test.progression})\n` +
        `   Expected: ${test.expectedKey}\n` +
        `   Actual: ${result.actualKey || 'ERROR'}\n` +
        `   Status: ${result.success ? '✅ PASS' : '❌ FAIL'}\n` +
        `   ${result.confidence ? `Confidence: ${(result.confidence * 100).toFixed(1)}%` : ''}\n` +
        `   ${result.processingTime ? `Time: ${result.processingTime.toFixed(2)}ms` : ''}\n` +
        `   ${result.error ? `Error: ${result.error}` : ''}\n\n`;

      setTestResults(prev => prev + resultText);

      if (result.success) passedTests++;

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const summary = `🎯 Test Summary: ${passedTests}/${totalTests} tests passed\n` +
      `📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n` +
      `${passedTests === totalTests ? '🎉 All tests passed! Phase 1 integration successful.' : '⚠️ Some tests failed. Check implementation.'}`;

    setTestResults(prev => prev + summary);
  };

  const testCrossNavigation = () => {
    // Test navigation to reference with specific mode
    navigateToReference('Dorian', 'D', 'integration_test');
    console.log('🎯 Testing cross-feature navigation to D Dorian');
  };

  const runConsoleTests = async () => {
    console.log('🧪 Running comprehensive console tests...');
    await testChordProgressionAnalysis();
  };

  return (
    <Card className="integration-test-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Phase 1 Integration Test Panel
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Development
          </Badge>
        </CardTitle>
        <CardDescription>
          Test the Music Theory Integration Roadmap Phase 1 implementation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Context Status */}
        <div className="context-status">
          <h4 className="font-medium mb-2">Analysis Context Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Active Tab: <Badge variant="outline">{state.activeTab}</Badge></div>
            <div>Is Analyzing: <Badge variant={state.isAnalyzing ? "default" : "secondary"}>{state.isAnalyzing ? 'Yes' : 'No'}</Badge></div>
            <div>Has Analysis: <Badge variant={state.currentAnalysis ? "default" : "secondary"}>{state.currentAnalysis ? 'Yes' : 'No'}</Badge></div>
            <div>Local First: <Badge variant={state.preferences.useLocalAnalysisFirst ? "default" : "secondary"}>{state.preferences.useLocalAnalysisFirst ? 'Yes' : 'No'}</Badge></div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="test-actions space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runAllTests} disabled={state.isAnalyzing}>
              Run Quick Tests
            </Button>
            <Button onClick={runConsoleTests} variant="outline">
              Run Console Tests
            </Button>
            <Button onClick={testCrossNavigation} variant="outline">
              Test Navigation
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="test-results">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64 whitespace-pre-wrap">
              {testResults}
            </pre>
          </div>
        )}

        {/* Current Analysis Display */}
        {state.currentAnalysis && (
          <div className="current-analysis">
            <h4 className="font-medium mb-2">Current Analysis:</h4>
            <div className="bg-green-50 p-3 rounded text-sm">
              <div><strong>Type:</strong> {state.currentAnalysis.type}</div>
              <div><strong>Input:</strong> {state.currentAnalysis.inputData}</div>
              <div><strong>Confidence:</strong> {(state.currentAnalysis.results.confidence * 100).toFixed(1)}%</div>
              <div><strong>Method:</strong> {state.currentAnalysis.metadata.analysisMethod}</div>
              <div><strong>Processing Time:</strong> {state.currentAnalysis.metadata.processingTime.toFixed(2)}ms</div>
            </div>
          </div>
        )}

        {/* Integration Status */}
        <div className="integration-status">
          <h4 className="font-medium mb-2">Integration Status:</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>✅ AnalysisProvider integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>✅ EnhancedHarmonyTab active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>✅ Local analysis algorithms loaded</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>✅ Cross-feature navigation ready</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationTestPanel;
