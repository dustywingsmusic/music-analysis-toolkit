/**
 * QuestionDrivenMusicTool - A comprehensive music theory analysis application
 *
 * This component serves as the main container for a sophisticated music theory toolkit that allows users to:
 * - Identify musical modes from melodies, scales, or chord progressions using AI-powered analysis
 * - Discover and explore different musical modes and their relationships
 * - Analyze harmonies and chord progressions
 * - Reference a complete library of musical scales and modes
 *
 * The tool integrates with Gemini AI for advanced music theory analysis and maintains a history
 * of analysis results that can be revisited. It features a unified results display system that 
 * persists across different tool sections.
 */

import React, {useCallback, useEffect, useState} from 'react';
import NavigationTabs, {TabType} from './NavigationTabs';
import ModeIdentificationTab, {IdentificationMethod} from './ModeIdentificationTab';
import ModeDiscoveryTab from './ModeDiscoveryTab';
import HarmonyTab from './HarmonyTab';
import ReferenceTab from './ReferenceTab';
import ChordAnalyzer from './ChordAnalyzer';
import {analyzeHarmony, analyzeMusic, discoverModes, getSongExamples} from '../services/geminiService';
import {buildModesFromRoot, isValidRootNote, ModeFromRoot} from '../services/scaleDataService';
import {allScaleData, NOTES, PARENT_KEY_INDICES} from '../constants/scales';
import {generateHighlightId as generateHighlightIdFromMappings, getScaleFamilyFromMode} from '../constants/mappings';
import MappingDebugger from './MappingDebugger';
import {useUnifiedResults} from "@/hooks/useUnifiedResults.ts";
import UnifiedResultsPanel from "@/components/UnifiedResultsPanel.tsx";
import {logger} from '../utils/logger';

interface QuestionDrivenMusicToolProps {
  showDebugInfo: boolean;
}


const QuestionDrivenMusicTool: React.FC<QuestionDrivenMusicToolProps> = ({ showDebugInfo }) => {
  const [activeTab, setActiveTab] = useState<TabType>('identify');
  const [highlightIdForReference, setHighlightIdForReference] = useState<string | null>(null);

  // Use the unified results hook
  const {
    unifiedResults,
    setUnifiedResults,
    showUnifiedResults,
    dismissAnalysisPanel,
    updateDisplayPosition
  } = useUnifiedResults(activeTab);

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

  // Loading state for async operations
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // App initialization logging
  useEffect(() => {
    logger.appInit('Music Theory Toolkit initialized', {
      component: 'QuestionDrivenMusicTool',
      initialTab: activeTab,
      showDebugInfo,
      timestamp: Date.now()
    });
  }, []); // Empty dependency array means this runs once on mount

  // Wrapper functions to handle legacy compatibility and tab changes
  const showUnifiedResultsWithLegacy = (results: any) => {
    showUnifiedResults(results);
    // Update legacy state for backward compatibility
    setAnalysisResults(results);
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
    // Log tab navigation
    logger.webClick('User navigated to tab', {
      component: 'QuestionDrivenMusicTool',
      action: 'tab_change',
      previousTab: activeTab,
      newTab: tab,
      hasVisibleResults: unifiedResults.isVisible
    });

    setActiveTab(tab);
    // With unified results system, results persist across tabs
    // Only clear results if explicitly requested or going to reference with no results
    if (tab === 'reference' && !unifiedResults.isVisible) {
      // Don't change results visibility when going to reference
    }
    // Results remain visible and accessible across all tabs
  }, [activeTab, unifiedResults.isVisible]);

  const handleAnalysisRequest = useCallback(async (method: string, data: any) => {
    console.log('Analysis request:', method, data);

    // Log analysis request
    logger.webClick('User initiated analysis request', {
      component: 'QuestionDrivenMusicTool',
      action: 'analysis_request',
      method,
      dataKeys: Object.keys(data),
      currentTab: activeTab
    });

    // Show loading state in unified results
    const loadingResult = { method, data, loading: true, timestamp: Date.now() };
    showUnifiedResultsWithLegacy(loadingResult);

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

      // Show results
      showUnifiedResultsWithLegacy(analysisResult);

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

      // Show error results
      showUnifiedResultsWithLegacy(errorResult);
    }
  }, [showUnifiedResultsWithLegacy]);

  const handleDiscoveryRequest = useCallback(async (method: string, data: any) => {
    console.log('Discovery request:', method, data);

    // Log discovery request
    logger.webClick('User initiated discovery request', {
      component: 'QuestionDrivenMusicTool',
      action: 'discovery_request',
      method,
      dataKeys: Object.keys(data),
      currentTab: activeTab
    });

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

    // Show loading state
    setIsLoading(true);

    try {
      let result, debug;

      if (method === 'root') {
        // Use direct scale data computation instead of AI
        try {
          if (!isValidRootNote(data.rootNote)) {
            throw new Error(`Invalid root note: ${data.rootNote}`);
          }

          const modes = buildModesFromRoot(data.rootNote);

          result = {
            modes,
            rootNote: data.rootNote,
            totalModes: modes.length,
            scaleDataSource: 'direct', // Indicate this came from scale data, not AI
            message: `Found ${modes.length} modes that can be built from ${data.rootNote}`
          };

          debug = {
            method: 'root',
            rootNote: data.rootNote,
            scaleDataService: true,
            modesFound: modes.length,
            timestamp: Date.now(),
            message: 'Used direct scale data computation instead of AI'
          };

        } catch (scaleError) {
          result = { 
            error: scaleError instanceof Error ? scaleError.message : 'Unknown error in scale data service' 
          };
          debug = {
            method: 'root',
            rootNote: data.rootNote,
            scaleDataService: true,
            error: scaleError instanceof Error ? scaleError.message : 'Unknown error',
            timestamp: Date.now()
          };
        }
      } else {
        // For other methods, fall back to AI service
        const aiResult = await discoverModes(method, data);
        result = aiResult.result;
        debug = aiResult.debug;
      }

      const discoveryResult = {
        method,
        data,
        timestamp: Date.now(),
        discoveryAnalysis: result,
        debug,
        success: !result.error
      };

      // Show results
      showUnifiedResultsWithLegacy(discoveryResult);

    } catch (error) {
      console.error('Discovery request failed:', error);

      const errorResult = {
        method,
        data,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };

      // Show error results
      showUnifiedResultsWithLegacy(errorResult);
    } finally {
      setIsLoading(false);
    }
  }, [showUnifiedResultsWithLegacy]);

  const handleHarmonyRequest = useCallback(async (method: string, data: any) => {
    console.log('Harmony request:', method, data);

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

    // Show loading state
    setIsLoading(true);

    try {
      // Call the backend service
      const { result, debug } = await analyzeHarmony(method, data);

      const harmonyResult = {
        method,
        data,
        timestamp: Date.now(),
        harmonyAnalysis: result,
        debug,
        success: !result.error
      };

      // Show results
      showUnifiedResultsWithLegacy(harmonyResult);

    } catch (error) {
      console.error('Harmony request failed:', error);

      const errorResult = {
        method,
        data,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };

      // Show error results
      showUnifiedResultsWithLegacy(errorResult);
    } finally {
      setIsLoading(false);
    }
  }, [showUnifiedResultsWithLegacy]);

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

  const handleDeeperAnalysis = useCallback(async (mode: ModeFromRoot) => {
    // Create discovery request data for deeper analysis
    const data = { rootNote: mode.notes[0] }; // Use the first note as root
    const method = 'root';

    // Create user inputs object for deeper analysis
    const userInputs = {
      method,
      inputData: data,
      rawInputs: {
        originalInput: `${mode.name} mode analysis`,
        discoveryType: 'deeper-analysis',
        selectedMode: mode,
        timestamp: Date.now()
      }
    };

    // Show loading state
    setIsLoading(true);

    try {
      // Use AI service for deeper analysis with song examples
      const aiResult = await discoverModes(method, data);

      // Generate song examples specifically for the selected mode
      let songExamples = null;
      try {
        // Create an Analysis object for the selected mode to get song examples
        const modeAnalysis = [{
          mode: mode.name,
          notes: mode.notes,
          formula: mode.formula,
          characteristics: mode.character || 'Unique modal character',
          tonic: mode.notes[0],
          key: `${mode.notes[0]} ${mode.name}`,
          confidence: 1.0
        }];

        // Call getSongExamples with the mode analysis
        songExamples = await getSongExamples(modeAnalysis);
      } catch (songError) {
        console.warn('Failed to get song examples:', songError);
        // Continue without song examples rather than failing the whole request
      }

      const discoveryResult = {
        method,
        data,
        timestamp: Date.now(),
        discoveryAnalysis: {
          ...aiResult.result,
          selectedMode: mode, // Include the specific mode that was selected
          deeperAnalysis: true, // Flag to indicate this is deeper analysis
          ...(songExamples && { songExamples }) // Include song examples if available
        },
        debug: aiResult.debug,
        success: !aiResult.result.error
      };

      // Show results
      showUnifiedResultsWithLegacy(discoveryResult);

    } catch (error) {
      console.error('Deeper analysis request failed:', error);

      const errorResult = {
        method,
        data,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };

      // Show error results
      showUnifiedResultsWithLegacy(errorResult);
    } finally {
      setIsLoading(false);
    }
  }, [showUnifiedResultsWithLegacy]);

  const handleModeAnalysisRequest = useCallback(async (mode: ModeFromRoot) => {
    console.log('Mode analysis request:', mode);

    // Create analysis data for the specific mode
    const data = {
      notes: mode.notes.join(' '),
      mode: mode.name,
      rootNote: mode.notes[0]
    };

    // Create user inputs object for mode analysis
    const userInputs = {
      method: 'mode-analysis',
      inputData: data,
      rawInputs: {
        originalInput: `${mode.name} in ${mode.notes[0]}`,
        analysisType: 'mode-specific',
        selectedMode: mode,
        timestamp: Date.now()
      }
    };

    // Show loading state in unified results
    const loadingResult = { 
      method: 'mode-analysis', 
      data, 
      loading: true, 
      timestamp: Date.now(),
      selectedMode: mode
    };
    showUnifiedResultsWithLegacy(loadingResult);

    try {
      // Use AI service for detailed mode analysis
      const tonic = mode.notes[0];
      const geminiResult = await analyzeMusic(tonic, { notes: mode.notes });

      const analysisResult = {
        method: 'mode-analysis',
        data,
        geminiAnalysis: geminiResult,
        localAnalysis: {
          selectedMode: mode,
          pitchClasses: mode.intervals,
          suggestedTonic: tonic,
          inputNotes: mode.notes,
          originalInput: `${mode.name} in ${tonic}`,
          modeSpecific: true
        },
        timestamp: Date.now()
      };

      // Show results
      showUnifiedResultsWithLegacy(analysisResult);

    } catch (error) {
      console.error('Mode analysis request failed:', error);

      const errorResult = {
        method: 'mode-analysis',
        data,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        selectedMode: mode
      };

      // Show error results
      showUnifiedResultsWithLegacy(errorResult);
    }
  }, [showUnifiedResultsWithLegacy, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identify':
        return (
          <ModeIdentificationTab 
            onAnalysisRequest={handleAnalysisRequest}
            hasResults={unifiedResults.isVisible}
            isLoading={isLoading}
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
            isLoading={isLoading}
            onDeeperAnalysis={handleDeeperAnalysis}
          />
        );

      case 'harmony':
        return (
          <HarmonyTab 
            onHarmonyRequest={handleHarmonyRequest}
            hasResults={unifiedResults.isVisible}
            isLoading={isLoading}
          />
        );

      case 'reference':
        return (
          <ReferenceTab 
            highlightId={highlightIdForReference}
            showDebugInfo={showDebugInfo}
            onShowUnifiedResults={showUnifiedResults}
          />
        );

      default:
        return null;
    }
  };



  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <header className="bg-background border-b border-border p-4 shadow-lg z-10">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">🎶</span>
            <h1 className="text-2xl font-bold text-foreground">Music Theory Toolkit</h1>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center">
            <NavigationTabs 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            {showDebugInfo && (
              <button 
                onClick={() => setShowMappingDebugger(true)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                title="Open Mapping System Debugger"
              >
                🔧 Debug
              </button>
            )}
          </div>
        </div>
      </header>


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
            <UnifiedResultsPanel
              unifiedResults={unifiedResults}
              setUnifiedResults={setUnifiedResults}
              onSwitchToReference={handleSwitchToReference}
              onSwitchToReferenceWithHighlight={handleSwitchToReferenceWithHighlight}
              onReturnToInput={handleReturnToInput}
              onDismissAnalysisPanel={dismissAnalysisPanel}
              onUpdateDisplayPosition={updateDisplayPosition}
              onModeAnalysisRequest={handleModeAnalysisRequest}
            />
          </aside>
        )}
      </div>

      {/* Analysis Results Toggle Button (FAB) - Always visible when results exist but panel is hidden */}
      {!unifiedResults.isVisible && unifiedResults.currentResults && (
        <div className="analysis-toggle-fab">
          <button 
            onClick={() => showUnifiedResults(unifiedResults.currentResults)}
            className="analysis-toggle-fab__btn"
            title="Show Analysis Results"
            aria-label="Show analysis results panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </button>
        </div>
      )}

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
