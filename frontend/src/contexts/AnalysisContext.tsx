/**
 * Unified Analysis Context
 * Provides shared state management across all analysis features
 * Enables seamless cross-feature navigation and educational continuity
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChordProgressionAnalysis } from '../services/localChordProgressionAnalysis';
import { ModeSuggestion } from '../services/realTimeModeDetection';

// Analysis input types
export type AnalysisInputType = 'melody' | 'chord_progression' | 'scale' | 'midi_realtime' | 'notes_collection';

// Unified analysis interfaces
export interface LocalAnalysisResult {
  type: AnalysisInputType;
  inputData: string | number[];
  results: {
    primaryMode?: ModeSuggestion;
    alternativeModes?: ModeSuggestion[];
    chordProgression?: ChordProgressionAnalysis;
    confidence: number;
    timestamp: number;
  };
  metadata: {
    analysisMethod: 'local' | 'ai' | 'hybrid';
    processingTime: number;
    errorState?: string;
  };
}

export interface ReferenceConnection {
  type: 'mode_highlight' | 'scale_family' | 'chord_relationship' | 'parent_scale';
  targetMode: string;
  targetTonic: string;
  context: string;
  navigationAction: () => void;
}

export interface AIEnhancementResult {
  songExamples: string[];
  theoreticalExplanation: string;
  contextualInsights: string[];
  genres: string[];
  confidence: number;
}

export interface CrossValidationResult {
  agreement: number;
  discrepancies: string[];
  recommendedInterpretation: 'local' | 'ai' | 'hybrid';
  theoreticalAccuracy: number;
}

// Main analysis context state
export interface UnifiedAnalysisState {
  // Current analysis session
  currentAnalysis: LocalAnalysisResult | null;
  aiEnhancement: AIEnhancementResult | null;
  crossValidation: CrossValidationResult | null;

  // Analysis history for tab switching
  analysisHistory: LocalAnalysisResult[];

  // Reference connections
  referenceConnections: ReferenceConnection[];

  // Active tab and navigation state
  activeTab: 'analysis' | 'identify' | 'discover' | 'harmony' | 'reference';
  lastAnalysisTab: 'analysis' | 'identify' | 'discover' | 'harmony' | null;

  // Cross-feature navigation
  pendingNavigation: {
    targetTab: string;
    targetMode?: string;
    targetTonic?: string;
    context?: string;
  } | null;

  // Loading and error states
  isAnalyzing: boolean;
  isEnhancing: boolean;
  lastError: string | null;

  // Settings
  preferences: {
    useLocalAnalysisFirst: boolean;
    enableAIEnhancement: boolean;
    enableCrossValidation: boolean;
    showConfidenceScores: boolean;
  };
}

// Action types for state updates
type AnalysisAction =
  | { type: 'START_ANALYSIS'; inputType: AnalysisInputType; inputData: string | number[] }
  | { type: 'COMPLETE_LOCAL_ANALYSIS'; result: LocalAnalysisResult }
  | { type: 'COMPLETE_AI_ENHANCEMENT'; result: AIEnhancementResult }
  | { type: 'COMPLETE_CROSS_VALIDATION'; result: CrossValidationResult }
  | { type: 'SET_REFERENCE_CONNECTIONS'; connections: ReferenceConnection[] }
  | { type: 'NAVIGATE_TO_TAB'; tab: string; context?: any }
  | { type: 'SET_PENDING_NAVIGATION'; navigation: any }
  | { type: 'CLEAR_PENDING_NAVIGATION' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PREFERENCES'; preferences: Partial<UnifiedAnalysisState['preferences']> };

// Initial state
const initialState: UnifiedAnalysisState = {
  currentAnalysis: null,
  aiEnhancement: null,
  crossValidation: null,
  analysisHistory: [],
  referenceConnections: [],
  activeTab: 'analysis',
  lastAnalysisTab: null,
  pendingNavigation: null,
  isAnalyzing: false,
  isEnhancing: false,
  lastError: null,
  preferences: {
    useLocalAnalysisFirst: true,
    enableAIEnhancement: true,
    enableCrossValidation: true,
    showConfidenceScores: true
  }
};

// Reducer function
function analysisReducer(state: UnifiedAnalysisState, action: AnalysisAction): UnifiedAnalysisState {
  switch (action.type) {
    case 'START_ANALYSIS':
      return {
        ...state,
        isAnalyzing: true,
        lastError: null,
        currentAnalysis: null,
        aiEnhancement: null,
        crossValidation: null
      };

    case 'COMPLETE_LOCAL_ANALYSIS':
      return {
        ...state,
        isAnalyzing: false,
        currentAnalysis: action.result,
        analysisHistory: [action.result, ...state.analysisHistory.slice(0, 9)] // Keep last 10
      };

    case 'COMPLETE_AI_ENHANCEMENT':
      return {
        ...state,
        isEnhancing: false,
        aiEnhancement: action.result
      };

    case 'COMPLETE_CROSS_VALIDATION':
      return {
        ...state,
        crossValidation: action.result
      };

    case 'SET_REFERENCE_CONNECTIONS':
      return {
        ...state,
        referenceConnections: action.connections
      };

    case 'NAVIGATE_TO_TAB':
      return {
        ...state,
        activeTab: action.tab as any,
        lastAnalysisTab: ['identify', 'discover', 'harmony'].includes(action.tab)
          ? action.tab as any
          : state.lastAnalysisTab
      };

    case 'SET_PENDING_NAVIGATION':
      return {
        ...state,
        pendingNavigation: action.navigation
      };

    case 'CLEAR_PENDING_NAVIGATION':
      return {
        ...state,
        pendingNavigation: null
      };

    case 'SET_ERROR':
      return {
        ...state,
        isAnalyzing: false,
        isEnhancing: false,
        lastError: action.error
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        lastError: null
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.preferences
        }
      };

    default:
      return state;
  }
}

// Context creation
const AnalysisContext = createContext<{
  state: UnifiedAnalysisState;
  dispatch: React.Dispatch<AnalysisAction>;
} | undefined>(undefined);

// Provider component
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
}

// Hook for using the analysis context
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}

// Helper functions for common operations
export function useAnalysisActions() {
  const { dispatch } = useAnalysis();

  return {
    startAnalysis: (inputType: AnalysisInputType, inputData: string | number[]) => {
      dispatch({ type: 'START_ANALYSIS', inputType, inputData });
    },

    completeLocalAnalysis: (result: LocalAnalysisResult) => {
      dispatch({ type: 'COMPLETE_LOCAL_ANALYSIS', result });
    },

    completeAIEnhancement: (result: AIEnhancementResult) => {
      dispatch({ type: 'COMPLETE_AI_ENHANCEMENT', result });
    },

    navigateToTab: (tab: string) => {
      dispatch({ type: 'NAVIGATE_TO_TAB', tab });
    },

    navigateToReference: (mode: string, tonic: string, context: string) => {
      const connections: ReferenceConnection[] = [{
        type: 'mode_highlight',
        targetMode: mode,
        targetTonic: tonic,
        context,
        navigationAction: () => {
          dispatch({
            type: 'SET_PENDING_NAVIGATION',
            navigation: { targetTab: 'reference', targetMode: mode, targetTonic: tonic, context }
          });
          dispatch({ type: 'NAVIGATE_TO_TAB', tab: 'reference' });
        }
      }];

      dispatch({ type: 'SET_REFERENCE_CONNECTIONS', connections });
      dispatch({ type: 'NAVIGATE_TO_TAB', tab: 'reference' });
    },

    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', error });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },

    updatePreferences: (preferences: Partial<UnifiedAnalysisState['preferences']>) => {
      dispatch({ type: 'UPDATE_PREFERENCES', preferences });
    }
  };
}
