/**
 * Enhanced Navigation Tabs
 * Integrates with the unified analysis context for seamless tab management
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { trackNavClick } from '../utils/tracking';
import { useAnalysis, useAnalysisActions } from '../contexts/AnalysisContext';

export type TabType = 'analysis' | 'reference' | 'widget';

interface EnhancedNavigationTabsProps {
  onTabChange?: (tab: TabType) => void;
}

const EnhancedNavigationTabs: React.FC<EnhancedNavigationTabsProps> = ({ onTabChange }) => {
  const { state, dispatch } = useAnalysis();
  const { navigateToReference } = useAnalysisActions();

  const tabs = [
    {
      id: 'analysis' as TabType,
      label: 'Analyze Music',
      title: 'Analyze Music',
      description: 'Analyze chord progressions, melodies, and scales with comprehensive music theory insights'
    },
    {
      id: 'reference' as TabType,
      label: 'Explore Scales',
      title: 'Explore Scales',
      description: 'Browse scale tables, explore modes, and discover musical relationships'
    },
    {
      id: 'widget' as TabType,
      label: 'MIDI Tools',
      title: 'MIDI Tools',
      description: 'Real-time MIDI input analysis and device settings'
    },
  ];

  const handleTabChange = (tab: TabType) => {
    // Track navigation click
    const selectedTab = tabs.find(t => t.id === tab);
    if (selectedTab) {
      trackNavClick(`Enhanced Navigation - ${selectedTab.title}`);
    }

    // Update analysis context - THIS IS THE KEY FIX
    dispatch({ type: 'NAVIGATE_TO_TAB', tab });

    // Special handling for reference navigation
    if (tab === 'reference') {
      navigateToReference('', '', 'direct_navigation');
    }

    // Call external handler if provided
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const getTabStatus = (tabId: TabType) => {
    if (tabId === 'analysis' && state.currentAnalysis?.type === 'chord_progression') {
      return 'active';
    }
    if (tabId === state.lastAnalysisTab) {
      return 'has-results';
    }
    return 'default';
  };

  return (
    <>
      {/* Analysis Status - Simplified */}
      {state.currentAnalysis && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Analysis ready
          </div>
        </div>
      )}

      {/* Main Navigation Tabs - Clean Design */}
      <Tabs value={state.activeTab} onValueChange={(value) => handleTabChange(value as TabType)}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative px-4 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              title={tab.description}
            >
              <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <span className="whitespace-nowrap">{tab.label}</span>

                {/* Subtle status indicator */}
                {getTabStatus(tab.id) === 'active' && (
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                )}
                {getTabStatus(tab.id) === 'has-results' && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Status Messages - Professional Styling */}
      {state.pendingNavigation && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-amber-800 font-medium text-sm">
              Navigating to {state.pendingNavigation.targetTab.replace('_', ' ')}
              {state.pendingNavigation.targetMode && ` (${state.pendingNavigation.targetMode})`}
            </span>
          </div>
        </div>
      )}

      {state.lastError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div>
              <p className="text-red-800 font-medium text-sm">Analysis Error</p>
              <p className="text-red-700 text-xs mt-1">{state.lastError}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedNavigationTabs;
