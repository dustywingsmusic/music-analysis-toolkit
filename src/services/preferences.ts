// User preferences service with localStorage support

export interface UserPreferences {
  chordDetectionTimeout: number; // milliseconds
  detectionSensitivity: 'low' | 'medium' | 'high';
  autoScrollToScale: boolean;
  showScaleLinks: boolean;
  modalAnimations: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  chordDetectionTimeout: 200,
  detectionSensitivity: 'medium',
  autoScrollToScale: true,
  showScaleLinks: true,
  modalAnimations: true,
};

const STORAGE_KEY = 'music-modes-app-preferences';

/**
 * Loads user preferences from localStorage.
 * @returns The user preferences object.
 */
export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error);
  }
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Saves user preferences to localStorage.
 * @param preferences The preferences to save.
 */
export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences to localStorage:', error);
  }
}

/**
 * Updates a specific preference and saves to localStorage.
 * @param key The preference key to update.
 * @param value The new value.
 * @returns The updated preferences object.
 */
export function updatePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): UserPreferences {
  const current = loadPreferences();
  const updated = { ...current, [key]: value };
  savePreferences(updated);
  return updated;
}

/**
 * Resets preferences to defaults.
 * @returns The default preferences object.
 */
export function resetPreferences(): UserPreferences {
  const defaults = { ...DEFAULT_PREFERENCES };
  savePreferences(defaults);
  return defaults;
}

/**
 * Gets the detection sensitivity as a numeric value.
 * @param sensitivity The sensitivity setting.
 * @returns A numeric multiplier for detection sensitivity.
 */
export function getSensitivityMultiplier(sensitivity: UserPreferences['detectionSensitivity']): number {
  switch (sensitivity) {
    case 'low': return 0.7;
    case 'medium': return 1.0;
    case 'high': return 1.3;
    default: return 1.0;
  }
}