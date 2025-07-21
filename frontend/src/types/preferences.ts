export interface ConsolidatedAnalysisPreferences {
  defaultViewMode: 'quick' | 'detailed' | 'adaptive';
  autoExpandOnComplexInput: boolean;
  maxQuickSuggestions: number;
  preferredDetailLevel: 'minimal' | 'standard' | 'comprehensive';
}

export const defaultPreferences: ConsolidatedAnalysisPreferences = {
  defaultViewMode: 'adaptive',
  autoExpandOnComplexInput: true,
  maxQuickSuggestions: 3,
  preferredDetailLevel: 'standard'
};
