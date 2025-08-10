/**
 * useUnifiedResults - Custom hook for managing unified results state and logic
 *
 * This hook encapsulates all the state management and helper functions for the
 * unified results system, making it reusable and keeping the component clean.
 */

import { useCallback, useEffect, useState } from 'react';
import { TabType } from '../components/NavigationTabs';
import { DisplayPosition, UnifiedResultsState } from '../components/UnifiedResultsPanel';
import { logger } from '../utils/logger';

export const useUnifiedResults = (activeTab: TabType) => {
  // Unified Results Display System State
  const [unifiedResults, setUnifiedResults] = useState<UnifiedResultsState>({
    isVisible: false,
    currentResults: null,
    displayPosition: {
      mode: 'sidebar',
      dockSide: 'right',
      width: 400,
      height: 600
    },
    isAnalysisDismissed: false,
    autoShowResults: true
  });

  // Local Storage Keys
  const STORAGE_KEYS = {
    DISPLAY_POSITION: 'music-tool-display-position',
    USER_PREFERENCES: 'music-tool-user-preferences'
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem(STORAGE_KEYS.DISPLAY_POSITION);
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);

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
    } catch (error) {
      console.warn('Failed to load results data from localStorage:', error);
    }
  }, []);


  // Save display position to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISPLAY_POSITION, JSON.stringify(unifiedResults.displayPosition));
    } catch (error) {
      console.warn('Failed to save display position to localStorage:', error);
    }
  }, [unifiedResults.displayPosition]);

  // Save user preferences to localStorage whenever they change
  useEffect(() => {
    try {
      const preferences = {
        autoShowResults: unifiedResults.autoShowResults,
        isAnalysisDismissed: unifiedResults.isAnalysisDismissed
      };

      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences to localStorage:', error);
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


  // Helper function to show results in unified display
  const showUnifiedResults = (results: any) => {
    // Log unified results popup opening
    logger.webClick('User opened unified results popup', {
      component: 'UnifiedResultsPanel',
      action: 'popup_open',
      trigger: 'new_results',
      hasResults: !!results,
      currentTab: activeTab
    });

    setUnifiedResults(prev => ({
      ...prev,
      isVisible: true,
      currentResults: results,
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
      currentTab: activeTab
    });

    setUnifiedResults(prev => ({
      ...prev,
      isVisible: false,
      isAnalysisDismissed: true
    }));
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
    showUnifiedResults,
    dismissAnalysisPanel,
    updateDisplayPosition
  };
};
