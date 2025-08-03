/**
 * useHelpAnalytics - Custom hook for tracking contextual help usage
 * 
 * Provides analytics tracking for help system interactions to understand
 * user learning patterns and optimize educational content.
 */

import { useCallback } from 'react';
import { trackInteraction } from '../utils/tracking';

interface HelpInteractionData {
  termId: string;
  interactionType: 'hover' | 'click' | 'touch' | 'modal_open' | 'modal_close' | 'related_term_click';
  context?: string;
  sessionDuration?: number;
  depth?: 'tooltip' | 'modal' | 'related_navigation';
}

interface LearningProgressData {
  termId: string;
  isFirstView: boolean;
  timeSpent: number;
  interactionPath: string[];
  completedRelatedTerms: string[];
}

export const useHelpAnalytics = () => {
  /**
   * Track help system interactions
   */
  const trackHelpInteraction = useCallback((
    termId: string,
    interactionType: HelpInteractionData['interactionType'],
    context?: string,
    additionalData?: Partial<HelpInteractionData>
  ) => {
    const eventData: HelpInteractionData = {
      termId,
      interactionType,
      context,
      ...additionalData
    };

    // Use existing tracking infrastructure
    trackInteraction(
      `Help System - ${interactionType} - ${termId}`,
      'Education',
      {
        term_id: termId,
        interaction_type: interactionType,
        context_type: context,
        ...additionalData
      }
    );

    // Store in session for learning pattern analysis
    storeHelpInteraction(eventData);
  }, []);

  /**
   * Track learning progress and patterns
   */
  const trackLearningProgress = useCallback((
    progressData: LearningProgressData
  ) => {
    trackInteraction(
      `Learning Progress - ${progressData.termId}`,
      'Education',
      {
        term_id: progressData.termId,
        is_first_view: progressData.isFirstView,
        time_spent: progressData.timeSpent,
        interaction_depth: progressData.interactionPath.length,
        related_terms_explored: progressData.completedRelatedTerms.length
      }
    );

    // Store learning progress in session
    storeLearningProgress(progressData);
  }, []);

  /**
   * Track help effectiveness metrics
   */
  const trackHelpEffectiveness = useCallback((
    termId: string,
    wasHelpful: boolean,
    feedbackText?: string
  ) => {
    trackInteraction(
      `Help Effectiveness - ${termId}`,
      'Education',
      {
        term_id: termId,
        was_helpful: wasHelpful,
        has_feedback: !!feedbackText,
        feedback_length: feedbackText?.length || 0
      }
    );
  }, []);

  /**
   * Track contextual relevance accuracy
   */
  const trackContextRelevance = useCallback((
    termId: string,
    detectedContext: string,
    userConfirmedRelevant: boolean
  ) => {
    trackInteraction(
      `Context Relevance - ${termId}`,
      'Education',
      {
        term_id: termId,
        detected_context: detectedContext,
        user_confirmed: userConfirmedRelevant,
        context_accuracy: userConfirmedRelevant ? 1 : 0
      }
    );
  }, []);

  return {
    trackHelpInteraction,
    trackLearningProgress,
    trackHelpEffectiveness,
    trackContextRelevance
  };
};

/**
 * Session storage helpers for learning pattern analysis
 */
const storeHelpInteraction = (data: HelpInteractionData) => {
  try {
    const sessionKey = 'help_interactions';
    const existing = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
    const updated = [...existing, { ...data, timestamp: Date.now() }];
    
    // Keep only last 100 interactions to prevent storage bloat
    if (updated.length > 100) {
      updated.splice(0, updated.length - 100);
    }
    
    sessionStorage.setItem(sessionKey, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to store help interaction:', error);
  }
};

const storeLearningProgress = (data: LearningProgressData) => {
  try {
    const sessionKey = 'learning_progress';
    const existing = JSON.parse(sessionStorage.getItem(sessionKey) || '{}');
    existing[data.termId] = { ...data, timestamp: Date.now() };
    sessionStorage.setItem(sessionKey, JSON.stringify(existing));
  } catch (error) {
    console.warn('Failed to store learning progress:', error);
  }
};

/**
 * Analytics utilities for help system optimization
 */
export const getHelpAnalytics = () => {
  /**
   * Get most frequently accessed terms
   */
  const getMostAccessedTerms = (): Array<{ termId: string; count: number }> => {
    try {
      const interactions = JSON.parse(sessionStorage.getItem('help_interactions') || '[]');
      const termCounts = interactions.reduce((acc: Record<string, number>, interaction: HelpInteractionData) => {
        acc[interaction.termId] = (acc[interaction.termId] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(termCounts)
        .map(([termId, count]) => ({ termId, count: count as number }))
        .sort((a, b) => b.count - a.count);
    } catch {
      return [];
    }
  };

  /**
   * Get learning completion rates by difficulty
   */
  const getLearningCompletionByDifficulty = (): Record<string, number> => {
    try {
      const progress = JSON.parse(sessionStorage.getItem('learning_progress') || '{}');
      // Implementation would analyze completion patterns
      return {};
    } catch {
      return {};
    }
  };

  /**
   * Get average time spent on different term categories
   */
  const getAverageTimeByCategory = (): Record<string, number> => {
    try {
      const interactions = JSON.parse(sessionStorage.getItem('help_interactions') || '[]');
      // Implementation would calculate averages by category
      return {};
    } catch {
      return {};
    }
  };

  return {
    getMostAccessedTerms,
    getLearningCompletionByDifficulty,
    getAverageTimeByCategory
  };
};