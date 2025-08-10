/**
 * Hybrid Analysis Service
 * Coordinates local analysis with AI enhancement and cross-validation
 * Implements the "Local Analysis First" approach from the Integration Roadmap
 */

import { analyzeChordProgressionLocally } from './localChordProgressionAnalysis';
import { ComprehensiveAnalysisEngine, ComprehensiveAnalysisResult } from './comprehensiveAnalysisService';
import * as geminiService from './geminiService';
import {
  LocalAnalysisResult,
  AIEnhancementResult,
  CrossValidationResult,
  AnalysisInputType
} from '../contexts/AnalysisContext';

export interface HybridAnalysisOptions {
  useLocalFirst: boolean;
  enableAIEnhancement: boolean;
  enableCrossValidation: boolean;
  timeoutMs?: number;
  knownKey?: string;
}

/**
 * Main hybrid analysis function for chord progressions
 */
export async function analyzeChordProgression(
  progressionInput: string,
  options: HybridAnalysisOptions = {
    useLocalFirst: true,
    enableAIEnhancement: true,
    enableCrossValidation: true,
    timeoutMs: 10000
  }
): Promise<{
  localResult: LocalAnalysisResult;
  comprehensiveResult?: ComprehensiveAnalysisResult;
  aiEnhancement?: AIEnhancementResult;
  crossValidation?: CrossValidationResult;
}> {

  const startTime = performance.now();

  try {
    // Step 1: Always perform local analysis first (for compatibility)
    console.log('🎼 Starting local chord progression analysis...');
    const localAnalysis = await analyzeChordProgressionLocally(progressionInput, options.knownKey);

    const localResult: LocalAnalysisResult = {
      type: 'chord_progression',
      inputData: progressionInput,
      results: {
        chordProgression: localAnalysis,
        confidence: localAnalysis.localAnalysis.confidence,
        timestamp: Date.now()
      },
      metadata: {
        analysisMethod: 'local',
        processingTime: performance.now() - startTime,
      }
    };

    console.log('✅ Local analysis completed:', localResult);

    // Step 1.5: Perform comprehensive analysis (functional + modal + chromatic)
    console.log('🎯 Starting comprehensive analysis...');
    const comprehensiveEngine = new ComprehensiveAnalysisEngine();
    const comprehensiveResult = await comprehensiveEngine.analyzeComprehensively(
      progressionInput,
      options.knownKey
    );
    console.log('✅ Comprehensive analysis completed:', comprehensiveResult);

    // Step 2: AI Enhancement (if enabled)
    let aiEnhancement: AIEnhancementResult | undefined;
    if (options.enableAIEnhancement) {
      try {
        console.log('🤖 Starting AI enhancement...');
        aiEnhancement = await performAIEnhancement(localAnalysis, options.timeoutMs || 10000);
        console.log('✅ AI enhancement completed');
      } catch (aiError) {
        console.warn('⚠️ AI enhancement failed, continuing with local results:', aiError);
        // Don't fail the entire analysis if AI fails
      }
    }

    // Step 3: Cross-validation (if both local and AI results exist)
    let crossValidation: CrossValidationResult | undefined;
    if (options.enableCrossValidation && aiEnhancement) {
      console.log('🔍 Performing cross-validation...');
      crossValidation = performCrossValidation(localAnalysis, aiEnhancement);
      console.log('✅ Cross-validation completed');
    }

    return {
      localResult,
      comprehensiveResult,
      aiEnhancement,
      crossValidation
    };

  } catch (error) {
    console.error('❌ Hybrid analysis failed:', error);

    // Return minimal local result with error state
    return {
      localResult: {
        type: 'chord_progression',
        inputData: progressionInput,
        results: {
          confidence: 0,
          timestamp: Date.now()
        },
        metadata: {
          analysisMethod: 'local',
          processingTime: performance.now() - startTime,
          errorState: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      comprehensiveResult: undefined
    };
  }
}

/**
 * Perform AI enhancement of local analysis results
 */
async function performAIEnhancement(
  localAnalysis: any,
  timeoutMs: number
): Promise<AIEnhancementResult> {

  // Create AI prompt based on local analysis results
  const enhancementPrompt = createAIEnhancementPrompt(localAnalysis);

  try {
    // Use existing Gemini service with timeout
    const aiResponse = await Promise.race([
      geminiService.analyzeHarmony('progression', { progression: localAnalysis.progression }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI enhancement timeout')), timeoutMs)
      )
    ]);

    // Extract enhancement data from AI response
    return extractAIEnhancement(aiResponse);

  } catch (error) {
    console.warn('AI enhancement failed:', error);

    // Return minimal enhancement
    return {
      songExamples: [],
      theoreticalExplanation: 'AI enhancement unavailable',
      contextualInsights: [],
      genres: [],
      confidence: 0
    };
  }
}

/**
 * Create AI enhancement prompt based on local analysis
 */
function createAIEnhancementPrompt(localAnalysis: any): string {
  const { localAnalysis: analysis } = localAnalysis;

  return `
    Based on this local music theory analysis, provide contextual enhancement:

    Progression: ${localAnalysis.progression}
    Key Center: ${analysis.keyCenter}
    Mode: ${analysis.overallMode}
    Modal Chords: ${analysis.modalChords.length > 0 ? analysis.modalChords.map(c => c.chordSymbol).join(', ') : 'None'}
    Confidence: ${analysis.confidence}

    Please provide:
    1. Song examples that use similar progressions
    2. Genre contexts where this progression is common
    3. Theoretical insights about the progression's character
    4. Additional context about any modal elements

    Focus on educational value and real-world musical examples.
  `;
}

/**
 * Extract enhancement data from AI response
 */
function extractAIEnhancement(aiResponse: any): AIEnhancementResult {
  // Parse AI response to extract structured enhancement data
  // This would need to be adapted based on the actual AI response format

  return {
    songExamples: aiResponse.result?.songExamples || [],
    theoreticalExplanation: aiResponse.result?.explanation || '',
    contextualInsights: aiResponse.result?.insights || [],
    genres: aiResponse.result?.genres || [],
    confidence: aiResponse.confidence || 0.5
  };
}

/**
 * Perform cross-validation between local and AI results
 */
function performCrossValidation(
  localAnalysis: any,
  aiEnhancement: AIEnhancementResult
): CrossValidationResult {

  const local = localAnalysis.localAnalysis;

  // Compare key findings
  let agreements = 0;
  let totalComparisons = 0;
  const discrepancies: string[] = [];

  // Check key center agreement (simplified comparison)
  totalComparisons++;
  if (aiEnhancement.theoreticalExplanation.includes(local.keyCenter)) {
    agreements++;
  } else {
    discrepancies.push(`Key center: Local detected ${local.keyCenter}, AI suggests different key`);
  }

  // Check modal analysis agreement
  totalComparisons++;
  const hasModalContent = local.modalChords.length > 0;
  const aiMentionsModal = aiEnhancement.theoreticalExplanation.toLowerCase().includes('modal');

  if (hasModalContent === aiMentionsModal) {
    agreements++;
  } else {
    discrepancies.push(`Modal content: Local found ${hasModalContent ? 'modal elements' : 'no modal elements'}, AI suggests otherwise`);
  }

  const agreement = agreements / totalComparisons;

  // Determine recommended interpretation
  let recommendedInterpretation: 'local' | 'ai' | 'hybrid';
  if (agreement > 0.8) {
    recommendedInterpretation = 'hybrid';
  } else if (local.confidence > 0.7) {
    recommendedInterpretation = 'local';
  } else {
    recommendedInterpretation = 'ai';
  }

  return {
    agreement,
    discrepancies,
    recommendedInterpretation,
    theoreticalAccuracy: local.confidence // Local analysis is considered theoretically accurate
  };
}

/**
 * Analyze any musical input using appropriate local methods
 */
export async function analyzeMusicalInput(
  inputType: AnalysisInputType,
  inputData: string | number[],
  options: HybridAnalysisOptions = {
    useLocalFirst: true,
    enableAIEnhancement: true,
    enableCrossValidation: false
  }
): Promise<{
  localResult: LocalAnalysisResult;
  aiEnhancement?: AIEnhancementResult;
  crossValidation?: CrossValidationResult;
}> {

  switch (inputType) {
    case 'chord_progression':
      return analyzeChordProgression(inputData as string, options);

    case 'melody':
    case 'scale':
    case 'notes_collection':
      // These would use the existing realTimeModeDetection.ts logic
      return analyzeNotesCollection(inputData as number[], options);

    case 'midi_realtime':
      // Real-time analysis using existing MIDI integration
      return analyzeRealtimeMIDI(inputData as number[], options);

    default:
      throw new Error(`Unsupported input type: ${inputType}`);
  }
}

/**
 * Analyze notes collection (for melody, scale, notes inputs)
 */
async function analyzeNotesCollection(
  notes: number[],
  options: HybridAnalysisOptions
): Promise<{
  localResult: LocalAnalysisResult;
  aiEnhancement?: AIEnhancementResult;
}> {

  // This would integrate with existing realTimeModeDetection.ts
  // For now, return placeholder structure

  const localResult: LocalAnalysisResult = {
    type: 'notes_collection',
    inputData: notes,
    results: {
      confidence: 0.8,
      timestamp: Date.now()
    },
    metadata: {
      analysisMethod: 'local',
      processingTime: 50,
    }
  };

  return { localResult };
}

/**
 * Analyze real-time MIDI input
 */
async function analyzeRealtimeMIDI(
  notes: number[],
  options: HybridAnalysisOptions
): Promise<{
  localResult: LocalAnalysisResult;
}> {

  // This would integrate with existing MIDI detection logic
  // For now, return placeholder structure

  const localResult: LocalAnalysisResult = {
    type: 'midi_realtime',
    inputData: notes,
    results: {
      confidence: 0.9,
      timestamp: Date.now()
    },
    metadata: {
      analysisMethod: 'local',
      processingTime: 10,
    }
  };

  return { localResult };
}
