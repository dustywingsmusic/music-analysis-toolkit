/**
 * Enhanced Navigation Tabs
 * Integrates with the unified analysis context for seamless tab management
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { trackNavClick } from '../utils/tracking';
import { useAnalysis, useAnalysisActions } from '../contexts/AnalysisContext';

export type TabType = 'identify' | 'discover' | 'harmony' | 'reference' | 'analysis';

interface EnhancedNavigationTabsProps {
  onTabChange?: (tab: TabType) => void;
}

const EnhancedNavigationTabs: React.FC<EnhancedNavigationTabsProps> = ({ onTabChange }) => {
  const { state, dispatch } = useAnalysis();
  const { navigateToReference } = useAnalysisActions();

  const tabs = [
    { 
      id: 'analysis' as TabType, 
      label: '🧠 Analysis', 
      title: 'Analysis Hub',
      icon: '🧠',
      color: 'text-primary',
      description: 'Unified music analysis with AI',
      enhanced: true,
      featured: true
    },
    { 
      id: 'identify' as TabType, 
      label: '🎼 Identify', 
      title: 'Mode Identification',
      icon: '🎼',
      color: 'text-primary',
      description: 'What mode is this?'
    },
    { 
      id: 'discover' as TabType, 
      label: '🔍 Discover', 
      title: 'Mode Discovery',
      icon: '🔍',
      color: 'text-secondary',
      description: 'What modes can I explore?'
    },
    { 
      id: 'harmony' as TabType, 
      label: '🎵 Harmony', 
      title: 'Enhanced Chords & Harmony',
      icon: '🎵',
      color: 'text-primary',
      description: 'How do modes work with chords?',
      enhanced: true
    },
    { 
      id: 'reference' as TabType, 
      label: '📚 Reference', 
      title: 'Scale Tables & Reference',
      icon: '📚',
      color: 'text-accent',
      description: 'Show me mode information'
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
    if (tabId === 'harmony' && state.currentAnalysis?.type === 'chord_progression') {
      return 'active';
    }
    if (tabId === state.lastAnalysisTab) {
      return 'has-results';
    }
    return 'default';
  };

  return (
    <>
      {/* Analysis Status Indicators */}
      {state.currentAnalysis && (
        <div className="analysis-status mb-2 flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Analysis Ready: {state.currentAnalysis.type.replace('_', ' ')}
          </Badge>
          {state.preferences.useLocalAnalysisFirst && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Local Analysis First ✨
            </Badge>
          )}
        </div>
      )}

      {/* Main Navigation Tabs */}
      <Tabs value={state.activeTab} onValueChange={(value) => handleTabChange(value as TabType)}>
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id}
              className={`relative ${tab.color}`}
              title={`${tab.title} - ${tab.description}`}
            >
              <div className="flex items-center gap-2">
                <span>{tab.icon}</span>
                <span>{tab.label.replace(/🎼|🔍|🎵|📚\s/, '')}</span>
                {tab.enhanced && (
                  <Badge variant="secondary" className="text-xs">
                    Enhanced
                  </Badge>
                )}
                {tab.featured && (
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                    New
                  </Badge>
                )}
              </div>
              
              {/* Status indicators */}
              {getTabStatus(tab.id) === 'active' && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
              {getTabStatus(tab.id) === 'has-results' && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Alert Messages */}
      {state.pendingNavigation && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <span className="text-yellow-600">⏳</span>
          <span className="text-yellow-800 ml-2">
            Navigating to {state.pendingNavigation.targetTab}
            {state.pendingNavigation.targetMode && ` (${state.pendingNavigation.targetMode})`}
          </span>
        </div>
      )}

      {state.lastError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <span className="text-red-600">❌</span>
          <span className="text-red-800 ml-2">
            Analysis Error: {state.lastError}
          </span>
        </div>
      )}
    </>
  );
};

export default EnhancedNavigationTabs;