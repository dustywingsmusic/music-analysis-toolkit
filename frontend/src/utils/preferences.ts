import { ConsolidatedAnalysisPreferences, defaultPreferences } from '../types/preferences';

const PREFERENCES_KEY = 'music-sidebar-preferences';

export function savePreferences(preferences: ConsolidatedAnalysisPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences:', error);
  }
}

export function loadPreferences(): ConsolidatedAnalysisPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load preferences:', error);
  }
  return defaultPreferences;
}
