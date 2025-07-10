/**
 * useUnifiedResults - Custom hook for managing unified results state and logic
 *
 * This hook encapsulates all the state management and helper functions for the
 * unified results system, making it reusable and keeping the component clean.
 */

import { useCallback, useEffect, useState } from 'react';
import { TabType } from '../components/NavigationTabs';
import { ResultsHistoryEntry, DisplayPosition, UnifiedResultsState } from '../components/UnifiedResultsPanel';
import CookieStorage from '../utils/cookieStorage';
import { logger } from '../utils/logger';

export const useUnifiedResults = (activeTab: TabType) => {
  // Unified Results Display System State
  const [unifiedResults, setUnifiedResults] = useState<UnifiedResultsState>({
    isVisible: false,
    currentResults: null,
    history: [],
    displayPosition: {
      mode: 'sidebar',
      dockSide: 'right',
      width: 400,
      height: 600
    },
    selectedHistoryId: null,
    showHistory: false,
    isAnalysisDismissed: false,
    autoShowResults: true
  });

  // Local Storage Keys
  const STORAGE_KEYS = {
    RESULTS_HISTORY: 'music-tool-results-history',
    DISPLAY_POSITION: 'music-tool-display-position',
    USER_PREFERENCES: 'music-tool-user-preferences'
  };

  // Load data from cookie storage on component mount
  useEffect(() => {
    try {
      // Check if cookies are available, fallback to localStorage if not
      if (!CookieStorage.isAvailable()) {
        console.warn('Cookies not available, falling back to localStorage');
        // Fallback to localStorage
        const savedHistory = localStorage.getItem(STORAGE_KEYS.RESULTS_HISTORY);
        const savedPosition = localStorage.getItem(STORAGE_KEYS.DISPLAY_POSITION);
        const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);

        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          setUnifiedResults(prev => ({ ...prev, history }));
        }

        if (savedPosition) {
          const displayPosition = JSON.parse(savedPosition);
          setUnifiedResults(prev => ({ ...prev, displayPosition }));
        }

        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          setUnifiedResults(prev => ({ 
            ...prev, 
            autoShowResults: preferences.autoShowResults ?? true,
            isAnalysisDismissed: preferences.isAnalysisDismissed ?? false
          }));
        }
        return;
      }

      // Use cookie storage
      const savedHistory = CookieStorage.getItem(STORAGE_KEYS.RESULTS_HISTORY);
      const savedPosition = CookieStorage.getItem(STORAGE_KEYS.DISPLAY_POSITION);
      const savedPreferences = CookieStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);

      if (savedHistory) {
        setUnifiedResults(prev => ({ ...prev, history: savedHistory }));
      }

      if (savedPosition) {
        setUnifiedResults(prev => ({ ...prev, displayPosition: savedPosition }));
      }

      if (savedPreferences) {
        setUnifiedResults(prev => ({ 
          ...prev, 
          autoShowResults: savedPreferences.autoShowResults ?? true,
          isAnalysisDismissed: savedPreferences.isAnalysisDismissed ?? false
        }));
      }
    } catch (error) {
      console.warn('Failed to load results data from cookie storage:', error);
    }
  }, []);

  // Save history to cookie storage whenever it changes
  useEffect(() => {
    try {
      if (CookieStorage.isAvailable()) {
        CookieStorage.setItem(STORAGE_KEYS.RESULTS_HISTORY, unifiedResults.history);
      } else {
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEYS.RESULTS_HISTORY, JSON.stringify(unifiedResults.history));
      }
    } catch (error) {
      console.warn('Failed to save results history to cookie storage:', error);
    }
  }, [unifiedResults.history]);

  // Save display position to cookie storage whenever it changes
  useEffect(() => {
    try {
      if (CookieStorage.isAvailable()) {
        CookieStorage.setItem(STORAGE_KEYS.DISPLAY_POSITION, unifiedResults.displayPosition);
      } else {
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEYS.DISPLAY_POSITION, JSON.stringify(unifiedResults.displayPosition));
      }
    } catch (error) {
      console.warn('Failed to save display position to cookie storage:', error);
    }
  }, [unifiedResults.displayPosition]);

  // Save user preferences to cookie storage whenever they change
  useEffect(() => {
    try {
      const preferences = {
        autoShowResults: unifiedResults.autoShowResults,
        isAnalysisDismissed: unifiedResults.isAnalysisDismissed
      };

      if (CookieStorage.isAvailable()) {
        CookieStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
      } else {
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      }
    } catch (error) {
      console.warn('Failed to save user preferences to cookie storage:', error);
    }
  }, [unifiedResults.autoShowResults, unifiedResults.isAnalysisDismissed]);

  // Helper function to determine if analysis panel should be visible
  const shouldShowAnalysisPanel = (state: UnifiedResultsState): boolean => {
    return !!(
      state.currentResults && 
      !state.isAnalysisDismissed && 
      state.autoShowResults
    );
  };

  // Helper function to update panel visibility based on auto-hide logic
  const updateAnalysisPanelVisibility = useCallback(() => {
    const shouldShow = shouldShowAnalysisPanel(unifiedResults);
    if (shouldShow !== unifiedResults.isVisible) {
      setUnifiedResults(prev => ({
        ...prev,
        isVisible: shouldShow
      }));
    }
  }, [unifiedResults]);

  // Auto-hide effect - runs when currentResults, isAnalysisDismissed, or autoShowResults change
  useEffect(() => {
    updateAnalysisPanelVisibility();
  }, [unifiedResults.currentResults, unifiedResults.isAnalysisDismissed, unifiedResults.autoShowResults, updateAnalysisPanelVisibility]);

  // Helper function to generate a summary from analysis results
  const generateResultSummary = (method: string, data: any, results: any): string => {
    switch (method) {
      case 'melody':
        if (results?.geminiAnalysis?.result?.analysis?.mode) {
          return `Melody → ${results.geminiAnalysis.result.analysis.mode}`;
        }
        return `Melody analysis: ${data.notes?.substring(0, 20) || 'Unknown'}...`;

      case 'scale':
        if (results?.geminiAnalysis?.result?.analysis?.mode) {
          return `Scale → ${results.geminiAnalysis.result.analysis.mode}`;
        }
        return `Scale analysis: ${data.notes?.substring(0, 20) || 'Unknown'}...`;

      case 'progression':
        if (results?.geminiAnalysis?.result?.analysis?.mode) {
          return `Progression → ${results.geminiAnalysis.result.analysis.mode}`;
        }
        return `Chord progression: ${data.chords?.substring(0, 20) || 'Unknown'}...`;

      default:
        return `${method} analysis`;
    }
  };

  // Helper function to add results to history
  const addToHistory = (method: string, data: any, results: any, tab: TabType = activeTab, userInputs?: any) => {
    const historyEntry: ResultsHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      tab,
      method,
      summary: generateResultSummary(method, data, results),
      data,
      results,
      userInputs: userInputs || {
        method,
        inputData: data,
        rawInputs: {}
      }
    };

    setUnifiedResults(prev => ({
      ...prev,
      history: [historyEntry, ...prev.history.slice(0, 49)] // Keep last 50 entries
    }));

    return historyEntry.id;
  };

  // Helper function to show results in unified display
  const showUnifiedResults = (results: any, historyId?: string) => {
    // Log unified results popup opening
    logger.webClick('User opened unified results popup', {
      component: 'UnifiedResultsPanel',
      action: 'popup_open',
      trigger: historyId ? 'history_restore' : 'new_results',
      historyId: historyId || null,
      hasResults: !!results,
      currentTab: activeTab
    });

    setUnifiedResults(prev => ({
      ...prev,
      isVisible: true,
      currentResults: results,
      selectedHistoryId: historyId || null,
      isAnalysisDismissed: false // Reset dismissal when showing new results
    }));
  };

  // Helper function to dismiss analysis panel (user explicitly closes it)
  const dismissAnalysisPanel = () => {
    // Log unified results popup closing
    logger.webClick('User closed unified results popup', {
      component: 'UnifiedResultsPanel',
      action: 'popup_close',
      trigger: 'user_dismiss',
      hadResults: !!unifiedResults.currentResults,
      historyCount: unifiedResults.history.length,
      currentTab: activeTab
    });

    setUnifiedResults(prev => ({
      ...prev,
      isVisible: false,
      isAnalysisDismissed: true,
      selectedHistoryId: null
    }));
  };

  // Helper function to restore results from history
  const restoreFromHistory = (historyId: string, onTabChange?: (tab: TabType) => void) => {
    const historyEntry = unifiedResults.history.find(entry => entry.id === historyId);
    if (historyEntry) {
      showUnifiedResults(historyEntry.results, historyId);
      // Optionally switch to the tab where the analysis was performed
      if (historyEntry.tab !== activeTab && onTabChange) {
        onTabChange(historyEntry.tab);
      }
    }
  };

  // Helper function to update display position
  const updateDisplayPosition = (newPosition: Partial<DisplayPosition>) => {
    setUnifiedResults(prev => ({
      ...prev,
      displayPosition: { ...prev.displayPosition, ...newPosition }
    }));
  };

  return {
    unifiedResults,
    setUnifiedResults,
    addToHistory,
    showUnifiedResults,
    dismissAnalysisPanel,
    restoreFromHistory,
    updateDisplayPosition,
    generateResultSummary
  };
};
