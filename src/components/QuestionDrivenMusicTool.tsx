import React, {useCallback, useState, useEffect} from 'react';
import NavigationTabs, {TabType} from './NavigationTabs';
import ModeIdentificationTab, { IdentificationMethod } from './ModeIdentificationTab';
import ModeDiscoveryTab from './ModeDiscoveryTab';
import HarmonyTab from './HarmonyTab';
import ReferenceTab from './ReferenceTab';
import ChordAnalyzer from './ChordAnalyzer';
import {analyzeMusic} from '../services/geminiService';
import {allScaleData, NOTES, PARENT_KEY_INDICES} from '../constants/scales';
import {
  getScaleFamilyFromMode,
  generateHighlightId as generateHighlightIdFromMappings,
  noteToPitchClass,
  validateMappings,
  getMappingStats
} from '../constants/mappings';
import MappingDebugger from './MappingDebugger';
import CookieStorage from '../utils/cookieStorage';

interface QuestionDrivenMusicToolProps {
  showDebugInfo: boolean;
}

interface ResultsHistoryEntry {
  id: string;
  timestamp: number;
  tab: TabType;
  method: string;
  summary: string;
  data: any;
  results: any;
  userInputs: {
    method: string;
    inputData: any;
    rawInputs?: {
      [key: string]: any;
    };
  };
}

interface DisplayPosition {
  mode: 'sidebar' | 'floating' | 'docked';
  position?: { x: number; y: number };
  dockSide?: 'left' | 'right' | 'bottom';
  width?: number;
  height?: number;
}

interface UnifiedResultsState {
  isVisible: boolean;
  currentResults: any;
  history: ResultsHistoryEntry[];
  displayPosition: DisplayPosition;
  selectedHistoryId: string | null;
  showHistory: boolean;
  isAnalysisDismissed: boolean;
  autoShowResults: boolean;
}

const QuestionDrivenMusicTool: React.FC<QuestionDrivenMusicToolProps> = ({ showDebugInfo }) => {
  const [activeTab, setActiveTab] = useState<TabType>('identify');
  const [highlightIdForReference, setHighlightIdForReference] = useState<string | null>(null);

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

  // Legacy compatibility - keep for backward compatibility during transition
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // State for input repopulation (Return to Input functionality)
  const [inputRepopulationData, setInputRepopulationData] = useState<{
    method?: IdentificationMethod;
    melodyNotes?: string;
    scaleNotes?: string;
    progression?: string;
  } | null>(null);

  // State for mapping debugger
  const [showMappingDebugger, setShowMappingDebugger] = useState<boolean>(false);

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
    setUnifiedResults(prev => ({
      ...prev,
      isVisible: true,
      currentResults: results,
      selectedHistoryId: historyId || null,
      isAnalysisDismissed: false // Reset dismissal when showing new results
    }));

    // Update legacy state for backward compatibility
    setAnalysisResults(results);
  };

  // Helper function to dismiss analysis panel (user explicitly closes it)
  const dismissAnalysisPanel = () => {
    setUnifiedResults(prev => ({
      ...prev,
      isVisible: false,
      isAnalysisDismissed: true,
      selectedHistoryId: null
    }));
  };

  // Helper function to restore results from history
  const restoreFromHistory = (historyId: string) => {
    const historyEntry = unifiedResults.history.find(entry => entry.id === historyId);
    if (historyEntry) {
      showUnifiedResults(historyEntry.results, historyId);
      // Optionally switch to the tab where the analysis was performed
      if (historyEntry.tab !== activeTab) {
        setActiveTab(historyEntry.tab);
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

  // Helper function to check if a string is a valid note name
  const isValidNoteName = (str: string): boolean => {
    // Valid note names: A, B, C, D, E, F, G with optional sharps (#) or flats (b/♭)
    const notePattern = /^[A-G][#b♭]?$/;
    return notePattern.test(str);
  };

  // Helper function to parse note names into pitch classes
  const parseNotesToPitchClasses = (noteString: string): Set<number> => {
    const noteNames = noteString.trim().split(/\s+/).filter(note => note.length > 0);
    const pitchClasses = new Set<number>();

    noteNames.forEach(noteName => {
      const cleanNote = noteName.trim();
      // Convert regular b/# to Unicode ♭/♯ for matching, but preserve case for note names
      const normalizedNote = cleanNote.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();

      const noteIndex = NOTES.findIndex(note => {
        const normalizedNoteEntry = note.toUpperCase();
        // Split compound note names and check for exact matches
        const noteParts = normalizedNoteEntry.split('/');
        return noteParts.some(part => part === normalizedNote);
      });

      if (noteIndex !== -1) {
        pitchClasses.add(noteIndex);
      }
    });

    return pitchClasses;
  };

  // Helper function to parse and preserve original melody notes (for melody analysis)
  const parseOriginalMelodyNotes = (noteString: string): string[] => {
    return noteString.trim().split(/\s+/).filter(note => note.length > 0);
  };

  // Helper function to clean up scale notes (for scale analysis)
  const parseAndCleanScaleNotes = (noteString: string): string[] => {
    const pitchClasses = parseNotesToPitchClasses(noteString);
    return Array.from(pitchClasses).map(pc => NOTES[pc]);
  };

  // Helper function to extract chord symbols from progression
  const parseChordProgression = (progressionString: string): string[] => {
    return progressionString.trim().split(/\s+/).filter(chord => chord.length > 0);
  };

  // Helper function to detect scales/modes using local scales.ts data
  const detectLocalScales = (pitchClasses: Set<number>) => {
    const pitchClassArray = Array.from(pitchClasses).sort();
    const matches = [];

    // Check each scale in allScaleData
    for (const scaleData of allScaleData) {
      // Check each mode of the scale
      for (let modeIndex = 0; modeIndex < scaleData.modeIntervals.length; modeIndex++) {
        const modeIntervals = scaleData.modeIntervals[modeIndex];

        // Try each possible root note
        for (let root = 0; root < 12; root++) {
          const modePitchClasses = modeIntervals.map(interval => (root + interval) % 12).sort();

          // Check if this mode matches our input pitch classes
          if (JSON.stringify(modePitchClasses) === JSON.stringify(pitchClassArray)) {
            const rootNote = NOTES[root];
            const modeName = scaleData.commonNames ? scaleData.commonNames[modeIndex] : `Mode ${modeIndex + 1}`;
            const scaleName = scaleData.name;

            matches.push({
              root: rootNote,
              mode: modeName,
              scale: scaleName,
              fullName: `${rootNote} ${modeName}`,
              pitchClasses: modePitchClasses,
              confidence: 1.0 // Perfect match
            });
          }
        }
      }
    }

    return matches;
  };

  // Helper function to suggest a tonic from notes
  const suggestTonic = (pitchClasses: Set<number>): string => {
    if (pitchClasses.size === 0) return 'C';

    // Try to detect scales first and use the root of the best match
    const scaleMatches = detectLocalScales(pitchClasses);
    if (scaleMatches.length > 0) {
      // Return the root of the first match (they're all perfect matches)
      return scaleMatches[0].root;
    }

    // Fallback to the first note as a default tonic
    const firstNote = Array.from(pitchClasses)[0];
    return NOTES[firstNote];
  };

  // Helper function to generate highlight ID for scale tables (using centralized mappings)
  const generateHighlightId = generateHighlightIdFromMappings;

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // With unified results system, results persist across tabs
    // Only clear results if explicitly requested or going to reference with no results
    if (tab === 'reference' && !unifiedResults.isVisible) {
      // Don't change results visibility when going to reference
    }
    // Results remain visible and accessible across all tabs
  }, [unifiedResults.isVisible]);

  const handleAnalysisRequest = useCallback(async (method: string, data: any) => {
    console.log('Analysis request:', method, data);

    // Show loading state in unified results
    const loadingResult = { method, data, loading: true, timestamp: Date.now() };
    showUnifiedResults(loadingResult);

    try {
      let analysisResult;

      switch (method) {
        case 'melody': {
          // For melody analysis, preserve original note sequence and spellings
          const originalNotes = parseOriginalMelodyNotes(data.notes || '');
          if (originalNotes.length === 0) {
            throw new Error('No valid notes found in input');
          }

          // Still need pitch classes for tonic suggestion
          const pitchClasses = parseNotesToPitchClasses(data.notes || '');
          const tonic = suggestTonic(pitchClasses);

          // Detect scales/modes using local scales.ts data (same as scale analysis)
          const detectedScales = detectLocalScales(pitchClasses);

          // Use Gemini AI for detailed analysis with original notes
          const geminiResult = await analyzeMusic(tonic, { notes: originalNotes });

          analysisResult = {
            method,
            data,
            geminiAnalysis: geminiResult,
            localAnalysis: {
              pitchClasses: Array.from(pitchClasses),
              suggestedTonic: tonic,
              inputNotes: originalNotes, // Preserve original sequence
              originalInput: data.notes, // Keep the raw input for reference
              detectedScales: detectedScales // Add local scale detection results
            },
            timestamp: Date.now()
          };
          break;
        }

        case 'scale': {
          // For scale analysis, clean up notes (remove duplicates, standardize spellings)
          const cleanedNotes = parseAndCleanScaleNotes(data.notes || '');
          if (cleanedNotes.length === 0) {
            throw new Error('No valid notes found in input');
          }

          const pitchClasses = parseNotesToPitchClasses(data.notes || '');
          const tonic = suggestTonic(pitchClasses);

          // Detect scales/modes using local scales.ts data
          const detectedScales = detectLocalScales(pitchClasses);

          // Use Gemini AI for detailed analysis with cleaned notes
          const geminiResult = await analyzeMusic(tonic, { notes: cleanedNotes });

          analysisResult = {
            method,
            data,
            geminiAnalysis: geminiResult,
            localAnalysis: {
              pitchClasses: Array.from(pitchClasses),
              suggestedTonic: tonic,
              inputNotes: cleanedNotes, // Use cleaned notes
              originalInput: data.notes, // Keep the raw input for reference
              detectedScales: detectedScales // Add local scale detection results
            },
            timestamp: Date.now()
          };
          break;
        }

        case 'progression': {
          const chords = parseChordProgression(data.chords || '');
          if (chords.length === 0) {
            throw new Error('No valid chords found in progression');
          }

          // For chord progressions, we'll analyze the first chord for tonic suggestion
          const firstChord = chords[0];
          const tonic = firstChord.replace(/[^A-G#b]/g, ''); // Extract root note

          // Use Gemini AI for detailed analysis
          const geminiResult = await analyzeMusic(tonic, { chord: chords.join(' ') });

          analysisResult = {
            method,
            data,
            geminiAnalysis: geminiResult,
            localAnalysis: {
              chords,
              suggestedTonic: tonic,
              progressionLength: chords.length
            },
            timestamp: Date.now()
          };
          break;
        }

        case 'audio':
          throw new Error('Audio analysis is not yet implemented');

        default:
          throw new Error(`Unknown analysis method: ${method}`);
      }

      // Create user inputs object for history
      const userInputs = {
        method,
        inputData: data,
        rawInputs: {
          originalInput: method === 'melody' ? data.notes : 
                        method === 'scale' ? data.notes :
                        method === 'progression' ? data.chords : 
                        JSON.stringify(data),
          analysisType: method,
          timestamp: Date.now()
        }
      };

      // Add to history and show results
      const historyId = addToHistory(method, data, analysisResult, activeTab, userInputs);
      showUnifiedResults(analysisResult, historyId);

    } catch (error) {
      console.error('Analysis failed:', error);
      const errorResult = {
        method,
        data,
        error: error instanceof Error ? error.message : 'Analysis failed',
        timestamp: Date.now()
      };

      // Create user inputs object for error case
      const userInputs = {
        method,
        inputData: data,
        rawInputs: {
          originalInput: method === 'melody' ? data.notes : 
                        method === 'scale' ? data.notes :
                        method === 'progression' ? data.chords : 
                        JSON.stringify(data),
          analysisType: method,
          timestamp: Date.now(),
          error: true
        }
      };

      // Add error to history and show results
      const historyId = addToHistory(method, data, errorResult, activeTab, userInputs);
      showUnifiedResults(errorResult, historyId);
    }
  }, [addToHistory, showUnifiedResults]);

  const handleDiscoveryRequest = useCallback((method: string, data: any) => {
    console.log('Discovery request:', method, data);
    const discoveryResult = { 
      method, 
      data, 
      timestamp: Date.now(),
      placeholder: true, // Mark as placeholder until backend integration
      message: 'Mode Discovery backend integration coming soon'
    };

    // Create user inputs object for discovery
    const userInputs = {
      method,
      inputData: data,
      rawInputs: {
        originalInput: method === 'root' ? data.rootNote :
                      method === 'notes' ? data.notes?.join(' ') :
                      method === 'compare' ? `${data.mode1} vs ${data.mode2}` :
                      method === 'explore' ? data.rootNote :
                      JSON.stringify(data),
        discoveryType: method,
        timestamp: Date.now()
      }
    };

    // Add to history and show results
    const historyId = addToHistory(method, data, discoveryResult, 'discover', userInputs);
    showUnifiedResults(discoveryResult, historyId);
  }, [addToHistory, showUnifiedResults]);

  const handleHarmonyRequest = useCallback((method: string, data: any) => {
    console.log('Harmony request:', method, data);
    const harmonyResult = { 
      method, 
      data, 
      timestamp: Date.now(),
      placeholder: true, // Mark as placeholder until backend integration
      message: 'Harmony analysis backend integration coming soon'
    };

    // Create user inputs object for harmony
    const userInputs = {
      method,
      inputData: data,
      rawInputs: {
        originalInput: method === 'analyze' ? data.chord :
                      method === 'generate' ? data.mode :
                      method === 'substitute' ? data.chord :
                      method === 'progression' ? data.progression :
                      JSON.stringify(data),
        harmonyType: method,
        timestamp: Date.now()
      }
    };

    // Add to history and show results
    const historyId = addToHistory(method, data, harmonyResult, 'harmony', userInputs);
    showUnifiedResults(harmonyResult, historyId);
  }, [addToHistory, showUnifiedResults]);

  const handleSwitchToReference = useCallback((highlightId?: string) => {
    let finalHighlightId = highlightId;

    // If no highlightId provided, try to generate one from AI analysis results first
    if (!finalHighlightId && analysisResults && analysisResults.geminiAnalysis && analysisResults.geminiAnalysis.result && analysisResults.geminiAnalysis.result.analysis) {
      const analysis = analysisResults.geminiAnalysis.result.analysis;

      // Use AI-provided fields like the working version did
      if (analysis.parentScaleRootNote && analysis.tableId !== undefined && analysis.modeIndex !== undefined) {
        const rootPitchClass = NOTES.findIndex(note => {
          const normalizedNote = analysis.parentScaleRootNote.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
          const normalizedNoteEntry = note.toUpperCase();
          const noteParts = normalizedNoteEntry.split('/');
          return noteParts.some(part => part === normalizedNote);
        });

        if (rootPitchClass !== -1) {
          const keyRowIndex = PARENT_KEY_INDICES.indexOf(rootPitchClass);
          if (keyRowIndex !== -1) {
            finalHighlightId = `${analysis.tableId}-${keyRowIndex}-${analysis.modeIndex}`;
          }
        }
      }
    }

    // Fallback to local scale detection if AI fields are not available
    if (!finalHighlightId && analysisResults && analysisResults.localAnalysis && analysisResults.localAnalysis.detectedScales) {
      const detectedScales = analysisResults.localAnalysis.detectedScales;
      if (detectedScales.length > 0) {
        // Try to find the scale that starts with the first note in the input
        let preferredScale = detectedScales[0]; // fallback to first scale

        if (analysisResults.localAnalysis.originalInput) {
          // Parse the first note from the original input
          const firstInputNote = analysisResults.localAnalysis.originalInput.trim().split(/\s+/)[0];
          if (firstInputNote) {
            // Normalize the first note for comparison
            const normalizedFirstNote = firstInputNote.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();

            // Find a detected scale that starts with this note
            const matchingScale = detectedScales.find((scale: any) => {
              const normalizedScaleRoot = scale.root.replace(/b/g, '♭').replace(/#/g, '♯').toUpperCase();
              // Handle compound note names (e.g., "C♯/D♭")
              const rootParts = normalizedScaleRoot.split('/');
              return rootParts.some((part: string) => part === normalizedFirstNote);
            });

            if (matchingScale) {
              preferredScale = matchingScale;
            }
          }
        }

        finalHighlightId = generateHighlightId(preferredScale.scale, preferredScale.mode, preferredScale.root) || undefined;
      }
    }

    if (finalHighlightId) {
      setHighlightIdForReference(finalHighlightId);
    }
    setActiveTab('reference');
  }, [analysisResults]);

  const handleReturnToInput = useCallback((userInputs: any) => {
    if (userInputs && userInputs.rawInputs) {
      const { analysisType, originalInput } = userInputs.rawInputs;

      // Determine the method and set appropriate input values
      let method: IdentificationMethod = 'melody';
      let melodyNotes = '';
      let scaleNotes = '';
      let progression = '';

      if (analysisType === 'melody') {
        method = 'melody';
        melodyNotes = originalInput;
      } else if (analysisType === 'scale') {
        method = 'scale';
        scaleNotes = originalInput;
      } else if (analysisType === 'progression') {
        method = 'progression';
        progression = originalInput;
      }

      // Set the repopulation data
      setInputRepopulationData({
        method,
        melodyNotes,
        scaleNotes,
        progression
      });

      // Switch to identify tab
      setActiveTab('identify');
    }
  }, []);

  const handleSwitchToReferenceWithHighlight = useCallback((mode: string, tonic: string) => {
    // Use centralized mapping system to determine scale family from mode name
    const scaleName = getScaleFamilyFromMode(mode);

    // Generate the proper highlight ID using the centralized function
    const highlightId = generateHighlightId(scaleName, mode, tonic);

    if (highlightId) {
      setHighlightIdForReference(highlightId);
    }
    setActiveTab('reference');
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identify':
        return (
          <ModeIdentificationTab 
            onAnalysisRequest={handleAnalysisRequest}
            hasResults={unifiedResults.isVisible}
            initialMethod={inputRepopulationData?.method}
            initialMelodyNotes={inputRepopulationData?.melodyNotes}
            initialScaleNotes={inputRepopulationData?.scaleNotes}
            initialProgression={inputRepopulationData?.progression}
          />
        );

      case 'discover':
        return (
          <ModeDiscoveryTab 
            onDiscoveryRequest={handleDiscoveryRequest}
            hasResults={unifiedResults.isVisible}
          />
        );

      case 'harmony':
        return (
          <HarmonyTab 
            onHarmonyRequest={handleHarmonyRequest}
            hasResults={unifiedResults.isVisible}
          />
        );

      case 'reference':
        return (
          <ReferenceTab 
            highlightId={highlightIdForReference}
            showDebugInfo={showDebugInfo}
          />
        );

      default:
        return null;
    }
  };

  // Enhanced Unified Results Display System
  const renderUnifiedResults = () => {
    if (!unifiedResults.isVisible) {
      return null;
    }

    const currentResults = unifiedResults.currentResults;
    if (!currentResults) {
      return null;
    }

    const { method, loading, error, geminiAnalysis, localAnalysis, placeholder, message } = currentResults;

    return (
      <div className={`unified-results-panel unified-results-panel--${unifiedResults.displayPosition.mode}`}>
        {/* Enhanced Header with Controls */}
        <div className="unified-results-panel__header">
          <div className="unified-results-panel__title-section">
            <h3 className="unified-results-panel__title">
              {placeholder ? `${method.charAt(0).toUpperCase() + method.slice(1)} Results` : 'Analysis Results'}
            </h3>
            <div className="unified-results-panel__meta">
              {unifiedResults.history.length > 0 && (
                <span className="unified-results-panel__history-count">
                  {unifiedResults.history.length} result{unifiedResults.history.length !== 1 ? 's' : ''} in history
                </span>
              )}
            </div>
          </div>

          <div className="unified-results-panel__controls">
            {/* History Browser Toggle */}
            <button 
              onClick={() => setUnifiedResults(prev => ({ ...prev, showHistory: !prev.showHistory }))}
              className="unified-results-panel__control-btn"
              title="View results history"
              disabled={unifiedResults.history.length === 0}
            >
              📋
            </button>

            {/* Display Position Controls */}
            <div className="unified-results-panel__position-controls">
              <button 
                onClick={() => updateDisplayPosition({ mode: 'sidebar', dockSide: 'right' })}
                className={`unified-results-panel__control-btn ${unifiedResults.displayPosition.mode === 'sidebar' ? 'active' : ''}`}
                title="Dock to sidebar"
              >
                ⫸
              </button>
              <button 
                onClick={() => updateDisplayPosition({ mode: 'floating' })}
                className={`unified-results-panel__control-btn ${unifiedResults.displayPosition.mode === 'floating' ? 'active' : ''}`}
                title="Floating window"
              >
                ⧉
              </button>
            </div>

            {/* Close Button */}
            <button 
              onClick={dismissAnalysisPanel}
              className="unified-results-panel__close"
              title="Close results"
            >
              ×
            </button>
          </div>
        </div>

        {/* History Browser */}
        {unifiedResults.showHistory && unifiedResults.history.length > 0 && (
          <div className="unified-results-panel__history">
            <h4>Results History</h4>
            <div className="unified-results-panel__history-list">
              {unifiedResults.history.slice(0, 10).map((entry) => (
                <div 
                  key={entry.id} 
                  className={`unified-results-panel__history-item ${entry.id === unifiedResults.selectedHistoryId ? 'active' : ''}`}
                  onClick={() => restoreFromHistory(entry.id)}
                >
                  <div className="unified-results-panel__history-summary">{entry.summary}</div>
                  {entry.userInputs && entry.userInputs.rawInputs && (
                    <div className="unified-results-panel__history-input">
                      <span className="history-input-label">
                        {entry.userInputs.rawInputs.analysisType === 'melody' ? 'Melody:' :
                         entry.userInputs.rawInputs.analysisType === 'scale' ? 'Scale:' :
                         entry.userInputs.rawInputs.analysisType === 'progression' ? 'Progression:' :
                         entry.userInputs.rawInputs.discoveryType ? `${entry.userInputs.rawInputs.discoveryType}:` :
                         entry.userInputs.rawInputs.harmonyType ? `${entry.userInputs.rawInputs.harmonyType}:` :
                         'Input:'}
                      </span>
                      <span className="history-input-value">
                        {entry.userInputs.rawInputs.originalInput.length > 30 
                          ? `${entry.userInputs.rawInputs.originalInput.substring(0, 30)}...`
                          : entry.userInputs.rawInputs.originalInput}
                      </span>
                    </div>
                  )}
                  <div className="unified-results-panel__history-meta">
                    <span className="unified-results-panel__history-tab">{entry.tab}</span>
                    <span className="unified-results-panel__history-time">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="unified-results-panel__content">
          {/* User Inputs Section */}
          {(() => {
            // Get user inputs from current history entry
            const currentHistoryEntry = unifiedResults.selectedHistoryId 
              ? unifiedResults.history.find(entry => entry.id === unifiedResults.selectedHistoryId)
              : unifiedResults.history[0]; // fallback to most recent

            const userInputs = currentHistoryEntry?.userInputs;

            if (userInputs && userInputs.rawInputs && !loading) {
              return (
                <div className="user-inputs-section">
                  <h4>Original Input</h4>
                  <div className="user-inputs-content">
                    <div className="input-display">
                      <span className="input-label">
                        {userInputs.rawInputs.analysisType === 'melody' ? 'Melody Notes:' :
                         userInputs.rawInputs.analysisType === 'scale' ? 'Scale Notes:' :
                         userInputs.rawInputs.analysisType === 'progression' ? 'Chord Progression:' :
                         userInputs.rawInputs.discoveryType ? `${userInputs.rawInputs.discoveryType} Input:` :
                         userInputs.rawInputs.harmonyType ? `${userInputs.rawInputs.harmonyType} Input:` :
                         'Input:'}
                      </span>
                      <span className="input-value">{userInputs.rawInputs.originalInput}</span>
                    </div>
                    <div className="input-meta">
                      <span className="input-method">Method: {userInputs.method}</span>
                      {userInputs.rawInputs.error && (
                        <span className="input-error">⚠️ Analysis failed</span>
                      )}
                    </div>
                    <div className="input-actions">
                      <button 
                        onClick={() => handleReturnToInput(userInputs)}
                        className="btn btn--secondary btn--sm"
                        title="Return to input area with these values"
                      >
                        ↩️ Return to Input
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {loading && (
            <div className="loading-state">
              <p>🎵 Analyzing your {method}...</p>
            </div>
          )}

          {placeholder && message && (
            <div className="placeholder-state">
              <h4>Coming Soon</h4>
              <p>{message}</p>
              <p className="placeholder-note">This feature is planned for the next development phase.</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <h4>Analysis Error</h4>
              <p>{error}</p>
            </div>
          )}

          {geminiAnalysis && !loading && !error && !placeholder && (
            <>
              <div className="primary-result">
                <h4>Primary Analysis</h4>
                {geminiAnalysis.result?.analysis && (
                  <div className="mode-analysis">
                    {/* Extract tonic and mode from the full mode name */}
                    {(() => {
                      const fullMode = geminiAnalysis.result.analysis.mode;
                      const parts = fullMode.split(' ');

                      // Check if we have both tonic and mode, or just mode
                      let tonic, mode;
                      if (parts.length > 1 && isValidNoteName(parts[0])) {
                        // Format: "F Ionian" - first part is a valid note name (tonic), rest is mode
                        tonic = parts[0];
                        mode = parts.slice(1).join(' ');
                      } else {
                        // Format: "Ionian" or "Blues Mode II" - no valid note name at start, need to get tonic from elsewhere
                        mode = fullMode;
                        // Try to get tonic from scale notes first (first note is the mode root), then fallback to other sources
                        let extractedTonic = null;
                        if (geminiAnalysis.result.analysis.notes && geminiAnalysis.result.analysis.notes.length > 0) {
                          extractedTonic = geminiAnalysis.result.analysis.notes[0];
                        } else if (geminiAnalysis.result.analysis.scale) {
                          // Parse scale string to get first note
                          const scaleNotes = geminiAnalysis.result.analysis.scale.trim().split(/\s+/);
                          if (scaleNotes.length > 0) {
                            extractedTonic = scaleNotes[0];
                          }
                        }

                        tonic = extractedTonic || 
                               geminiAnalysis.result.analysis.parentScaleRootNote || 
                               (localAnalysis && localAnalysis.suggestedTonic) || 'F';
                      }

                      return (
                        <>
                          <p>
                            <strong>Mode:</strong> {mode}
                            <button 
                              onClick={() => handleSwitchToReferenceWithHighlight(mode, tonic)}
                              className="link-button ml-2"
                              title="View this mode in scale tables"
                            >
                              📊 View in Tables
                            </button>
                          </p>
                          <p><strong>Tonic (Root):</strong> {tonic}</p>
                        </>
                      );
                    })()}
                    <p><strong>Scale:</strong> {geminiAnalysis.result.analysis.notes ? geminiAnalysis.result.analysis.notes.join(' ') : geminiAnalysis.result.analysis.scale}</p>
                    <p><strong>Parent Key:</strong> {geminiAnalysis.result.analysis.key}</p>

                    {geminiAnalysis.result.analysis.explanation && (
                      <div className="explanation-section">
                        <h5>Explanation</h5>
                        <p>{geminiAnalysis.result.analysis.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {geminiAnalysis.result?.error && (
                  <div className="ai-error">
                    <p>AI Analysis: {geminiAnalysis.result.error}</p>
                  </div>
                )}
              </div>

              {geminiAnalysis.result?.alternates && geminiAnalysis.result.alternates.length > 0 && (
                <div className="alternate-results">
                  <h5>Alternative Analyses</h5>
                  {geminiAnalysis.result.alternates.map((alt: any, index: number) => (
                    <div key={index} className="alternate-mode">
                      {(() => {
                        const fullMode = alt.mode;
                        const parts = fullMode.split(' ');

                        // Check if we have both tonic and mode, or just mode
                        let tonic, mode;
                        if (parts.length > 1 && isValidNoteName(parts[0])) {
                          // Format: "F Ionian" - first part is a valid note name (tonic), rest is mode
                          tonic = parts[0];
                          mode = parts.slice(1).join(' ');
                        } else {
                          // Format: "Ionian" or "Blues Mode II" - no valid note name at start, need to get tonic from elsewhere
                          mode = fullMode;
                          // Try to get tonic from scale notes first (first note is the mode root), then fallback to other sources
                          let extractedTonic = null;
                          if (alt.notes && alt.notes.length > 0) {
                            extractedTonic = alt.notes[0];
                          } else if (alt.scale) {
                            // Parse scale string to get first note
                            const scaleNotes = alt.scale.trim().split(/\s+/);
                            if (scaleNotes.length > 0) {
                              extractedTonic = scaleNotes[0];
                            }
                          }

                          tonic = extractedTonic || 
                                 alt.parentScaleRootNote || 
                                 (localAnalysis && localAnalysis.suggestedTonic) || 'F';
                        }

                        return (
                          <>
                            <h6>Alternative {index + 1}</h6>
                            <p>
                              <strong>Mode:</strong> {mode}
                              <button 
                                onClick={() => handleSwitchToReferenceWithHighlight(mode, tonic)}
                                className="link-button ml-2"
                                title="View this mode in scale tables"
                              >
                                📊 View in Tables
                              </button>
                            </p>
                            <p><strong>Tonic (Root):</strong> {tonic}</p>
                          </>
                        );
                      })()}
                      <p><strong>Scale:</strong> {alt.notes ? alt.notes.join(' ') : 'Scale notes not available'}</p>
                      <p><strong>Parent Key:</strong> {alt.key}</p>
                      {alt.explanation && (
                        <div className="explanation-section">
                          <h6>Explanation</h6>
                          <p>{alt.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {geminiAnalysis.result?.songExamples && Array.isArray(geminiAnalysis.result.songExamples) && (
                <div className="song-examples">
                  <h5>Song Examples</h5>
                  {geminiAnalysis.result.songExamples.map((group: any, index: number) => (
                    <div key={index} className="song-group">
                      <h6>{group.mode}</h6>
                      <ul>
                        {group.songs && Array.isArray(group.songs) && group.songs.map((song: any, songIndex: number) => (
                          <li key={songIndex}>
                            <strong>{song.title}</strong> by {song.artist}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !placeholder && (
            <div className="secondary-results">
              <div className="related-info">
                <button 
                  onClick={() => handleSwitchToReference()}
                  className="btn btn--secondary"
                >
                  View in Scale Tables
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <header className="bg-gray-800 p-4 shadow-lg z-10">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left: Title */}
          <h1 className="text-2xl font-bold text-blue-400">🎶 Music Theory Toolkit</h1>

          {/* Right: Nav, Search, Help */}
          <div className="flex items-center space-x-6">
            <NavigationTabs 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-8 pr-3 py-1 rounded-md bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Search Icon */}
              <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button 
              onClick={() => {
                if (unifiedResults.isVisible) {
                  // Close results panel
                  dismissAnalysisPanel();
                } else {
                  // Open results panel
                  if (unifiedResults.currentResults) {
                    setUnifiedResults(prev => ({
                      ...prev,
                      isVisible: true,
                      isAnalysisDismissed: false
                    }));
                  } else if (unifiedResults.history.length > 0) {
                    const lastResult = unifiedResults.history[0];
                    if (lastResult) {
                      restoreFromHistory(lastResult.id);
                    }
                  } else {
                    setUnifiedResults(prev => ({
                      ...prev,
                      isVisible: true,
                      currentResults: {
                        method: 'none',
                        message: 'No analysis results yet. Use the tabs below to analyze melodies, scales, or chord progressions.',
                        placeholder: true,
                        timestamp: Date.now()
                      },
                      isAnalysisDismissed: false
                    }));
                  }
                }
              }}
              className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-1"
              title={unifiedResults.isVisible ? "Close results panel" : "Open results panel"}
            >
              📊 Results
              {unifiedResults.history.length > 0 && !unifiedResults.isVisible && (
                <span className="bg-cyan-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                  {unifiedResults.history.length}
                </span>
              )}
            </button>
            <button className="text-gray-300 hover:text-white transition-colors duration-200">Help</button>
            {showDebugInfo && (
              <button 
                onClick={() => setShowMappingDebugger(true)}
                className="text-gray-300 hover:text-white transition-colors duration-200"
                title="Open Mapping System Debugger"
              >
                🔧 Debug
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Always-visible Results Access Button */}
      {!unifiedResults.isVisible && (
        <div className="unified-results-access">
          <button 
            onClick={() => {
              if (unifiedResults.currentResults) {
                // Show current results and reset dismissal
                setUnifiedResults(prev => ({
                  ...prev,
                  isVisible: true,
                  isAnalysisDismissed: false
                }));
              } else if (unifiedResults.history.length > 0) {
                // Restore from history
                const lastResult = unifiedResults.history[0];
                if (lastResult) {
                  restoreFromHistory(lastResult.id);
                }
              } else {
                // No results yet - show empty results panel with instructions
                setUnifiedResults(prev => ({
                  ...prev,
                  isVisible: true,
                  currentResults: {
                    method: 'none',
                    message: 'No analysis results yet. Use the tabs above to analyze melodies, scales, or chord progressions.',
                    placeholder: true,
                    timestamp: Date.now()
                  },
                  isAnalysisDismissed: false
                }));
              }
            }}
            className="unified-results-access__btn"
            title={
              unifiedResults.currentResults 
                ? "Show current analysis results" 
                : unifiedResults.history.length > 0
                ? `View latest result: ${unifiedResults.history[0]?.summary || 'Recent analysis'}`
                : "Open results panel"
            }
          >
            📊 {
              unifiedResults.currentResults 
                ? 'Show Results' 
                : unifiedResults.history.length > 0 
                ? `Results (${unifiedResults.history.length})`
                : 'Results'
            }
            {!unifiedResults.autoShowResults && (
              <span className="ml-1 text-xs opacity-75">📌</span>
            )}
          </button>
        </div>
      )}

      {/* Main Content Area & Analysis Results Sidebar */}
      <div className={`flex flex-1 p-6 md:p-8 overflow-y-auto ${unifiedResults.isVisible ? 'with-sidebar' : ''}`}>
        {/* Main Content */}
        <main className="flex-1">
          <div className="tab-content-wrapper">
            {renderTabContent()}
          </div>
        </main>

        {/* Fixed Analysis Results Sidebar */}
        {unifiedResults.isVisible && (
          <aside className="analysis-sidebar">
            {renderUnifiedResults()}
          </aside>
        )}
      </div>

      {/* Legacy chord analyzer for backward compatibility - hidden by default */}
      {showDebugInfo && (
        <div className="debug-panel">
          <h3>Debug: Legacy Chord Analyzer</h3>
          <ChordAnalyzer 
            onSwitchToFinder={handleSwitchToReference}
            showDebugInfo={showDebugInfo}
            compact={true}
            onAnalysisStateChange={() => {}}
          />
        </div>
      )}

      {/* Mapping System Debugger */}
      <MappingDebugger 
        isVisible={showMappingDebugger}
        onClose={() => setShowMappingDebugger(false)}
      />
    </div>
  );
};

export default QuestionDrivenMusicTool;
