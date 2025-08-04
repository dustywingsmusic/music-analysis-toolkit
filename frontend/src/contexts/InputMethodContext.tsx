/**
 * InputMethodContext - Global Input Method State Management
 *
 * Provides global state management for input method preferences across the entire app.
 * Handles persistence, MIDI state integration, and provides a clean API for components.
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

export type InputMethod = 'keyboard' | 'mouse' | 'midi';

interface InputMethodContextState {
  // Current active input method
  activeInputMethod: InputMethod;
  
  // Input method preference history for smart defaults
  methodPreferences: {
    [key: string]: InputMethod; // Component-specific preferences
  };
  
  // MIDI availability state
  midiAvailable: boolean;
  midiConnected: boolean;
  
  // Persistence flag
  hasPersistedPreference: boolean;
}

interface InputMethodContextActions {
  // Primary method for changing input method globally
  setInputMethod: (method: InputMethod, componentId?: string) => void;
  
  // Get preferred input method for a specific component
  getPreferredMethodFor: (componentId: string) => InputMethod;
  
  // Update MIDI availability (called by MIDI hook)
  updateMidiAvailability: (available: boolean, connected: boolean) => void;
  
  // Reset to defaults
  resetToDefaults: () => void;
  
  // Force keyboard fallback (when MIDI disconnects)
  fallbackToKeyboard: () => void;
}

interface InputMethodContextValue extends InputMethodContextState, InputMethodContextActions {}

// Default state
const defaultState: InputMethodContextState = {
  activeInputMethod: 'keyboard',
  methodPreferences: {},
  midiAvailable: false,
  midiConnected: false,
  hasPersistedPreference: false
};

// Context creation
const InputMethodContext = createContext<InputMethodContextValue | null>(null);

// Local storage keys
const STORAGE_KEYS = {
  ACTIVE_METHOD: 'music-app-input-method',
  METHOD_PREFERENCES: 'music-app-method-preferences',
  MIDI_PREFERRED: 'music-app-midi-preferred'
};

// Provider component
export const InputMethodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<InputMethodContextState>(defaultState);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedMethod = localStorage.getItem(STORAGE_KEYS.ACTIVE_METHOD) as InputMethod;
      const savedPreferences = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.METHOD_PREFERENCES) || '{}'
      );
      
      if (savedMethod && ['keyboard', 'mouse', 'midi'].includes(savedMethod)) {
        setState(prev => ({
          ...prev,
          activeInputMethod: savedMethod,
          methodPreferences: savedPreferences,
          hasPersistedPreference: true
        }));
        
        logger.appInit('Input method restored from storage', {
          component: 'InputMethodContext',
          method: savedMethod,
          hasPreferences: Object.keys(savedPreferences).length > 0
        });
      }
    } catch (error) {
      console.warn('Failed to restore input method preferences:', error);
    }
  }, []);

  // Persist changes to localStorage
  const persistState = useCallback((newMethod: InputMethod, newPreferences: Record<string, InputMethod>) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_METHOD, newMethod);
      localStorage.setItem(STORAGE_KEYS.METHOD_PREFERENCES, JSON.stringify(newPreferences));
    } catch (error) {
      console.warn('Failed to persist input method preferences:', error);
    }
  }, []);

  // Main method setter
  const setInputMethod = useCallback((method: InputMethod, componentId?: string) => {
    setState(prev => {
      // If trying to set MIDI but it's not available, fallback to keyboard
      const finalMethod = method === 'midi' && !prev.midiAvailable ? 'keyboard' : method;
      
      // Update component-specific preference if provided
      const newPreferences = componentId 
        ? { ...prev.methodPreferences, [componentId]: finalMethod }
        : prev.methodPreferences;
      
      const newState = {
        ...prev,
        activeInputMethod: finalMethod,
        methodPreferences: newPreferences,
        hasPersistedPreference: true
      };
      
      // Persist to localStorage
      persistState(finalMethod, newPreferences);
      
      // Log the change
      logger.webClick('Global input method changed', {
        component: 'InputMethodContext',
        action: 'method_change',
        previousMethod: prev.activeInputMethod,
        newMethod: finalMethod,
        requestedMethod: method,
        componentId: componentId || 'global',
        midiAvailable: prev.midiAvailable
      });
      
      return newState;
    });
  }, [persistState]);

  // Get preferred method for specific component
  const getPreferredMethodFor = useCallback((componentId: string): InputMethod => {
    const componentPreference = state.methodPreferences[componentId];
    
    // Return component preference if it exists and is available
    if (componentPreference) {
      if (componentPreference === 'midi' && !state.midiAvailable) {
        return 'keyboard'; // Fallback if MIDI not available
      }
      return componentPreference;
    }
    
    // Fallback to global active method
    if (state.activeInputMethod === 'midi' && !state.midiAvailable) {
      return 'keyboard';
    }
    
    return state.activeInputMethod;
  }, [state.methodPreferences, state.activeInputMethod, state.midiAvailable]);

  // Update MIDI availability
  const updateMidiAvailability = useCallback((available: boolean, connected: boolean) => {
    setState(prev => {
      const newState = {
        ...prev,
        midiAvailable: available,
        midiConnected: connected
      };
      
      // Auto-fallback to keyboard if MIDI was active but becomes unavailable
      if (!available && prev.activeInputMethod === 'midi') {
        newState.activeInputMethod = 'keyboard';
        persistState('keyboard', prev.methodPreferences);
        
        logger.webClick('Auto-fallback from MIDI to keyboard', {
          component: 'InputMethodContext',
          action: 'auto_fallback',
          reason: 'midi_unavailable'
        });
      }
      
      // Auto-switch to MIDI if user previously preferred it and it becomes available
      else if (available && connected && !prev.midiConnected) {
        const userPrefersMiddi = localStorage.getItem(STORAGE_KEYS.MIDI_PREFERRED) === 'true';
        if (userPrefersMiddi && prev.activeInputMethod !== 'midi') {
          newState.activeInputMethod = 'midi';
          persistState('midi', prev.methodPreferences);
          
          logger.webClick('Auto-switch to MIDI on connection', {
            component: 'InputMethodContext',
            action: 'auto_switch',
            reason: 'midi_connected_and_preferred'
          });
        }
      }
      
      return newState;
    });
  }, [persistState]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setState(defaultState);
    
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_METHOD);
      localStorage.removeItem(STORAGE_KEYS.METHOD_PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.MIDI_PREFERRED);
    } catch (error) {
      console.warn('Failed to clear input method preferences:', error);
    }
    
    logger.webClick('Input method preferences reset', {
      component: 'InputMethodContext',
      action: 'reset_preferences'
    });
  }, []);

  // Fallback to keyboard (e.g., when MIDI disconnects)
  const fallbackToKeyboard = useCallback(() => {
    if (state.activeInputMethod !== 'keyboard') {
      setInputMethod('keyboard');
    }
  }, [state.activeInputMethod, setInputMethod]);

  // Save MIDI preference when user chooses MIDI
  useEffect(() => {
    if (state.activeInputMethod === 'midi' && state.midiAvailable) {
      try {
        localStorage.setItem(STORAGE_KEYS.MIDI_PREFERRED, 'true');
      } catch (error) {
        // Ignore storage errors
      }
    }
  }, [state.activeInputMethod, state.midiAvailable]);

  const contextValue: InputMethodContextValue = {
    // State
    ...state,
    
    // Actions
    setInputMethod,
    getPreferredMethodFor,
    updateMidiAvailability,
    resetToDefaults,
    fallbackToKeyboard
  };

  return (
    <InputMethodContext.Provider value={contextValue}>
      {children}
    </InputMethodContext.Provider>
  );
};

// Hook for using input method context
export const useInputMethod = () => {
  const context = useContext(InputMethodContext);
  if (!context) {
    throw new Error('useInputMethod must be used within an InputMethodProvider');
  }
  return context;
};

// Hook for components that need input method with automatic component-specific preferences
export const useInputMethodFor = (componentId: string) => {
  const context = useInputMethod();
  
  const preferredMethod = context.getPreferredMethodFor(componentId);
  
  const setMethodForComponent = useCallback((method: InputMethod) => {
    context.setInputMethod(method, componentId);
  }, [context, componentId]);
  
  return {
    activeInputMethod: preferredMethod,
    setInputMethod: setMethodForComponent,
    midiAvailable: context.midiAvailable,
    midiConnected: context.midiConnected,
    hasPersistedPreference: context.hasPersistedPreference
  };
};

export default InputMethodContext;