/**
 * Navigation Debugger
 * Simple component to debug navigation issues
 */

import React from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAnalysis, useAnalysisActions } from '../contexts/AnalysisContext';

const NavigationDebugger: React.FC = () => {
  const { state, dispatch } = useAnalysis();
  const { navigateToTab } = useAnalysisActions();

  const tabs = ['identify', 'discover', 'harmony', 'reference'];

  const handleDirectNavigation = (tab: string) => {
    console.log(`🔧 Debug: Navigating to ${tab}`);
    dispatch({ type: 'NAVIGATE_TO_TAB', tab });
  };

  const handleActionNavigation = (tab: string) => {
    console.log(`🔧 Debug: Using action to navigate to ${tab}`);
    navigateToTab(tab);
  };

  return (
    <Card className="navigation-debugger">
      <CardHeader>
        <CardTitle>🔧 Navigation Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Current State:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Active Tab: <Badge>{state.activeTab}</Badge></div>
            <div>Last Analysis Tab: <Badge variant="outline">{state.lastAnalysisTab || 'none'}</Badge></div>
            <div>Is Analyzing: <Badge variant={state.isAnalyzing ? "default" : "secondary"}>{state.isAnalyzing ? 'Yes' : 'No'}</Badge></div>
            <div>Has Analysis: <Badge variant={state.currentAnalysis ? "default" : "secondary"}>{state.currentAnalysis ? 'Yes' : 'No'}</Badge></div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Direct Navigation (dispatch):</h4>
          <div className="flex gap-2 flex-wrap">
            {tabs.map(tab => (
              <Button 
                key={`direct-${tab}`}
                onClick={() => handleDirectNavigation(tab)}
                variant={state.activeTab === tab ? "default" : "outline"}
                size="sm"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Action Navigation (useAnalysisActions):</h4>
          <div className="flex gap-2 flex-wrap">
            {tabs.map(tab => (
              <Button 
                key={`action-${tab}`}
                onClick={() => handleActionNavigation(tab)}
                variant={state.activeTab === tab ? "default" : "outline"}
                size="sm"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">State Raw Data:</h4>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify({ 
              activeTab: state.activeTab,
              lastAnalysisTab: state.lastAnalysisTab,
              isAnalyzing: state.isAnalyzing,
              currentAnalysis: !!state.currentAnalysis,
              pendingNavigation: state.pendingNavigation,
              lastError: state.lastError
            }, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationDebugger;