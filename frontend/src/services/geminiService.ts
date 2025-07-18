import {GoogleGenAI} from "@google/genai";
import type {Analysis, AnalysisResponsePayload, AnalysisResult, SongExampleGroup} from '../types';
import {allScaleData} from '../constants/scales';
import {logger} from '../utils/logger';

// Get API key from runtime configuration or environment variable
const getApiKey = (): string => {
  // For production (Docker/Cloud Run), use runtime config
  if (typeof window !== 'undefined' && (window as any).RUNTIME_CONFIG?.GEMINI_API_KEY) {
    return (window as any).RUNTIME_CONFIG.GEMINI_API_KEY;
  }

  // For development, use environment variable
  if ((import.meta as any).env.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }

  throw new Error("API key not found. Please set VITE_GEMINI_API_KEY in development or ensure runtime config is available in production.");
};

// Get model ID from runtime configuration or environment variable
const getModelId = (): string => {
  // For production (Docker/Cloud Run), use runtime config
  if (typeof window !== 'undefined' && (window as any).RUNTIME_CONFIG?.GEMINI_MODEL_ID) {
    return (window as any).RUNTIME_CONFIG.GEMINI_MODEL_ID;
  }

  // For development, use environment variable
  if ((import.meta as any).env.VITE_GEMINI_MODEL_ID) {
    return (import.meta as any).env.VITE_GEMINI_MODEL_ID;
  }

  // Fallback to default model ID
  return "gemini-2.5-flash";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// --- PROMPT 1: CORE ANALYSIS ---

const coreAnalysisExampleOutput = {
  "analysis": {
    "key": "A♭ Major",
    "mode": "Phrygian",
    "tableId": "major-scale-modes",
    "modeIndex": 2,
    "parentScaleRootNote": "A♭",
    "explanation": "The C Phrygian mode is the third mode of the A♭ Major scale. It is characterized by its flattened second (D♭), which creates its distinctive dark, Spanish/Middle Eastern sound.",
    "formula": "1, ♭2, ♭3, 4, 5, ♭6, ♭7",
    "intervals": [0, 1, 3, 5, 7, 8, 10],
    "notes": ["C", "D♭", "E♭", "F", "G", "A♭", "B♭"]
  },
  "alternates": [{
    "key": "B♭ Melodic Minor",
    "mode": "Dorian ♭2",
    "tableId": "melodic-minor-modes",
    "modeIndex": 1,
    "parentScaleRootNote": "B♭",
    "explanation": "The Dorian ♭2 mode also contains the characteristic 1, ♭2, ♭3, 4 intervals. It differs from Phrygian with its natural 6th degree, giving it a slightly brighter, jazzy quality.",
    "formula": "1, ♭2, ♭3, 4, 5, 6, ♭7",
    "intervals": [0, 1, 3, 5, 7, 9, 10],
    "notes": ["C", "D♭", "E♭", "F", "G", "A", "B♭"]
  }],
  "modeDiscussion": "The provided notes strongly suggest the C Phrygian mode due to the characteristic [0, 1, 3, 5] interval structure. An alternative is C Dorian ♭2, which shares the same lower tetrachord."
};

const coreAnalysisSystemInstruction = {
  parts: [{
    text: `You are an expert music theory bot. Your function is to return a single, valid JSON object that provides a foundational music theory analysis of a given context. DO NOT include any extra text or markdown like \\\`\\\`\\\`json.

The user will provide a tonic and either a chord or a set of notes.

Your process MUST be:
1.  **IDENTIFY MODES**: Based on the user's input and the provided Reference Scale Data, identify all plausible musical modes whose root matches the user's tonic.
    - For each identified mode, calculate the **Parent Key**:  
      The Parent Key is the **major scale** (or scale family root) from which the mode is derived.  
      To compute this, use the mode degree (e.g., Phrygian = 3rd mode). Shift the tonic **down (mode degree − 1)** diatonically.  
      Example: C Phrygian → A♭ Major, because C is the 3rd degree of A♭.
2.  **STRUCTURED ANALYSIS**: Create a main \`analysis\` object for the single most likely mode. Populate the \`alternates\` array with objects for all other plausible modes. If only one mode is found, \`alternates\` MUST be an empty array.
3.  **MODE DISCUSSION**: Write a concise \`modeDiscussion\` string that explains the reasoning based *only* on the modes you have identified.
4.  **NEAREST GUESS**: If no mode is a perfect match, find the single closest one. Set \`isNearestGuess: true\` in its \`analysis\` object and explain the approximation in its \`explanation\` field. The \`alternates\` array must be empty.
5.  **VALIDATION**: If the input is invalid (e.g., fewer than 3 notes), return only an \`error\` field with a descriptive message.

**CRITICAL**: The output JSON object MUST be perfectly structured and valid. Escape all double-quotes within string values. DO NOT include \`bachExample\` or \`songExamples\` in this step.

**EXAMPLE INPUT:**
Analyze this context: Tonic: C. Selected Notes: C♯, D♯, F

**EXAMPLE OUTPUT JSON (Your response must be in this format):**
${JSON.stringify(coreAnalysisExampleOutput, null, 2)}
`
  }, {
    text: `**Reference Scale Data:**\n${JSON.stringify(allScaleData, null, 2)}`
  }]
};


// --- PROMPT 3: SONG EXAMPLES ---

const songExamplesSystemInstruction = {
    text: `You are a pop culture and music expert. Your task is to provide modern song examples for a given list of musical modes. Return a single, valid JSON array.

The user will provide a list of modes. For each mode, find one or two well-known songs from genres like rock, pop, jazz, or film scores that prominently feature that mode.

**CRITICAL**:
- The output MUST be a JSON array of objects, where each object has a 'mode' and 'examples' key.
- Provide a concise 'usage' description for each song.
- If you cannot find a good example for a particular mode, omit it from the array.

**EXAMPLE INPUT**:
["Phrygian", "Lydian Dominant"]

**EXAMPLE OUTPUT (Your response must be in this format):**
[
  {
    "mode": "Phrygian",
    "examples": [
      {
        "title": "Pyramid Song",
        "artist": "Radiohead",
        "usage": "The main harmonic and melodic material is often analyzed as being in C Phrygian."
      },
      {
        "title": "Wherever I May Roam",
        "artist": "Metallica",
        "usage": "The main riff is a classic example of the E Phrygian sound."
      }
    ]
  },
  {
    "mode": "Lydian Dominant",
    "examples": [
      {
        "title": "The Simpsons Theme",
        "artist": "Danny Elfman",
        "usage": "The iconic opening melody is a textbook example of the Lydian Dominant scale."
      }
    ]
  }
]
`
};

// --- MODE DISCOVERY SYSTEM INSTRUCTIONS ---

const modeDiscoverySystemInstruction = {
  parts: [{
    text: `You are an expert music theory bot specializing in mode discovery and exploration. Your function is to return a single, valid JSON object that provides comprehensive information about modes that can be built from a given root note.

The user will provide a root note, and you must identify all possible modes that can be built from that root.

Your process MUST be:
1. **IDENTIFY ALL MODES**: Based on the provided Reference Scale Data, find all modes that can be built from the given root note.
2. **CATEGORIZE BY SCALE FAMILY**: Group modes by their parent scale families (Major, Harmonic Minor, Melodic Minor, etc.).
3. **PROVIDE DETAILED INFORMATION**: For each mode, include the mode name, scale notes, intervals, characteristic features, and musical applications.
4. **INCLUDE RELATIONSHIPS**: Explain how modes relate to each other and their parent scales.

**CRITICAL**: The output JSON object MUST be perfectly structured and valid. Escape all double-quotes within string values.

**EXAMPLE INPUT:**
Build modes from root: C

**EXAMPLE OUTPUT JSON (Your response must be in this format):**
{
  "rootNote": "C",
  "modesByFamily": {
    "Major Scale Modes": [
      {
        "mode": "C Ionian (Major)",
        "notes": ["C", "D", "E", "F", "G", "A", "B"],
        "intervals": [0, 2, 4, 5, 7, 9, 11],
        "formula": "1, 2, 3, 4, 5, 6, 7",
        "characteristics": "Bright, happy, stable",
        "applications": "Pop, rock, classical music",
        "parentScale": "C Major",
        "degreeInParent": 1
      }
    ],
    "Harmonic Minor Modes": [
      {
        "mode": "C Harmonic Minor",
        "notes": ["C", "D", "E♭", "F", "G", "A♭", "B"],
        "intervals": [0, 2, 3, 5, 7, 8, 11],
        "formula": "1, 2, ♭3, 4, 5, ♭6, 7",
        "characteristics": "Exotic, Middle Eastern flavor",
        "applications": "Classical, metal, film scores",
        "parentScale": "C Harmonic Minor",
        "degreeInParent": 1
      }
    ]
  },
  "totalModes": 21,
  "summary": "From the root note C, you can build 21 different modes across various scale families, each with unique characteristics and applications."
}
`
  }, {
    text: `**Reference Scale Data:**\n${JSON.stringify(allScaleData, null, 2)}`
  }]
};

const safelyParseJson = <T>(jsonString: string): T | null => {
  try {
    let text = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = text.match(fenceRegex);
    if (match && match[2]) {
      text = match[2].trim();
    }
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", e, "Raw string:", jsonString);
    return null;
  }
};

const getCoreAnalysis = async (
  tonic: string,
  analysisTarget: { chord?: string; notes?: readonly string[] }
): Promise<{ result: AnalysisResult; debug: AnalysisResponsePayload['debug'] }> => {
  const userPrompt = `Analyze this context: Tonic: ${tonic}. ${
    analysisTarget.chord
      ? `Chord: ${analysisTarget.chord}`
      : `Selected Notes: ${analysisTarget.notes?.join(", ")}`
  }`;

  const debugInfo = {
    prompt: coreAnalysisSystemInstruction,
    userPrompt,
    rawResponse: ''
  };

  try {
    // Log the request
    logger.geminiRequest('Core analysis request to Gemini API', {
      function: 'getCoreAnalysis',
      model: getModelId(),
      tonic,
      analysisTarget,
      userPrompt,
      temperature: 0.1
    });

    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: userPrompt,
      config: {
        systemInstruction: coreAnalysisSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawResponse = response.text;
    debugInfo.rawResponse = rawResponse || '';

    // Log the response
    logger.geminiResponse('Core analysis response from Gemini API', {
      function: 'getCoreAnalysis',
      responseLength: rawResponse?.length || 0,
      hasResponse: !!rawResponse,
      tonic,
      analysisTarget
    });

    if (!rawResponse) {
      logger.error('Core analysis returned empty response', {
        function: 'getCoreAnalysis',
        tonic,
        analysisTarget
      });
      return { result: { error: "Core analysis returned an empty response." }, debug: debugInfo };
    }

    const parsedData = safelyParseJson<AnalysisResult>(rawResponse);

    if (!parsedData) {
      logger.error('Core analysis returned malformed response', {
        function: 'getCoreAnalysis',
        tonic,
        analysisTarget,
        rawResponseLength: rawResponse.length
      });
      return { result: { error: "Core analysis returned a malformed response." }, debug: debugInfo };
    }

    // Add chord/notes to the analysis object for context
    if (parsedData.analysis) {
        if (analysisTarget.chord) parsedData.analysis.chord = analysisTarget.chord;
        if (analysisTarget.notes) parsedData.analysis.selectedNotes = [...analysisTarget.notes];
    }

    return { result: parsedData, debug: debugInfo };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in core analysis";
    debugInfo.rawResponse = error instanceof Error ? error.stack ?? message : String(error);

    logger.error('Core analysis API call failed', {
      function: 'getCoreAnalysis',
      error: message,
      tonic,
      analysisTarget,
      stack: error instanceof Error ? error.stack : undefined
    });

    return { result: { error: `Core analysis failed: ${message}` }, debug: debugInfo };
  }
};

export const getSongExamples = async (allModes: Analysis[]): Promise<SongExampleGroup[] | null> => {
    if (!allModes || allModes.length === 0) return null;

    const modeNames = allModes.map(m => m.mode);
    const prompt = JSON.stringify(modeNames);

    try {
        // Log the request
        logger.geminiRequest('Song examples request to Gemini API', {
          function: 'getSongExamples',
          model: getModelId(),
          modeNames,
          modesCount: modeNames.length,
          temperature: 0.3
        });

        const response = await ai.models.generateContent({
          model: getModelId(),
          contents: prompt,
          config: {
            systemInstruction: { text: songExamplesSystemInstruction.text },
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawResponse = response.text;

        // Log the response
        logger.geminiResponse('Song examples response from Gemini API', {
          function: 'getSongExamples',
          responseLength: rawResponse?.length || 0,
          hasResponse: !!rawResponse,
          modeNames,
          modesCount: modeNames.length
        });

        if (!rawResponse) {
          logger.warn('Song examples returned empty response', {
            function: 'getSongExamples',
            modeNames
          });
          return null;
        }

        const result = safelyParseJson<SongExampleGroup[]>(rawResponse);

        if (!result) {
          logger.warn('Song examples returned malformed response', {
            function: 'getSongExamples',
            modeNames,
            rawResponseLength: rawResponse.length
          });
        }

        return result;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error in song examples";
        logger.error('Song examples API call failed', {
          function: 'getSongExamples',
          error: message,
          modeNames,
          stack: error instanceof Error ? error.stack : undefined
        });
        return null;
    }
};

export const analyzeMusic = async (
  tonic: string,
  analysisTarget: { chord?: string; notes?: readonly string[] }
): Promise<AnalysisResponsePayload> => {

  // Step 1: Get the core analysis
  const { result: coreResult, debug: coreDebug } = await getCoreAnalysis(tonic, analysisTarget);

  if (coreResult.error || !coreResult.analysis) {
    return { result: { error: coreResult.error || "Analysis failed to produce a result." }, debug: coreDebug };
  }

  // Step 2: Fetch supplementary data
  const { analysis, alternates, modeDiscussion } = coreResult;
  const allFoundModes = [analysis, ...(alternates || [])];

  const songExamples = await getSongExamples(allFoundModes);

  // Step 3: Assemble the final result
  const finalResult: AnalysisResult = {
    analysis,
    alternates,
    modeDiscussion,
    ...(songExamples && { songExamples }),
  };

  // For simplicity, debug info will only contain the core analysis prompt details.
  return { result: finalResult, debug: coreDebug };
};

// --- HARMONY ANALYSIS SYSTEM INSTRUCTIONS ---

const harmonyAnalysisSystemInstruction = {
  parts: [{
    text: `You are an expert music theory bot specializing in chord and harmony analysis. Your function is to return a single, valid JSON object that provides comprehensive harmonic analysis based on the requested method.

The user will provide a method type and corresponding data. You must analyze the harmonic content and provide detailed information.

**SUPPORTED METHODS:**
1. **analyze** - Analyze individual chords and their properties
2. **generate** - Generate chords that work in a given mode
3. **substitute** - Find chord substitutions and modal interchange options
4. **progression** - Analyze chord progressions to identify which chords are modal and determine their modes

Your process MUST be:
1. **IDENTIFY HARMONIC CONTENT**: Analyze the provided musical material
2. **PROVIDE DETAILED ANALYSIS**: Include chord functions, extensions, modal characteristics
3. **SUGGEST APPLICATIONS**: Provide practical usage suggestions and examples
4. **INCLUDE RELATIONSHIPS**: Explain harmonic relationships and voice leading

**CRITICAL**: The output JSON object MUST be perfectly structured and valid. Escape all double-quotes within string values.

**EXAMPLE INPUT (analyze method):**
Analyze chord: Cmaj7

**EXAMPLE OUTPUT JSON (Your response must be in this format):**
{
  "method": "analyze",
  "chord": "Cmaj7",
  "analysis": {
    "rootNote": "C",
    "chordType": "Major 7th",
    "notes": ["C", "E", "G", "B"],
    "intervals": ["1", "3", "5", "7"],
    "function": "Tonic",
    "characteristics": "Stable, bright, jazzy",
    "commonModes": ["C Ionian", "C Lydian"],
    "voicingOptions": ["Root position", "First inversion", "Second inversion", "Third inversion"],
    "extensions": ["add9", "add11", "add13"],
    "substitutions": ["C6", "Am7", "Em7"]
  },
  "applications": {
    "genres": ["Jazz", "Pop", "R&B"],
    "progressions": ["I-vi-ii-V", "I-V-vi-IV"],
    "tips": "Works well as a tonic chord in major keys, creates smooth voice leading to Am7"
  }
}

**EXAMPLE INPUT (progression method):**
Analyze chord progression: Am F C G

**EXAMPLE OUTPUT JSON (progression method):**
{
  "method": "progression",
  "progression": "Am F C G",
  "analysis": {
    "keyCenter": "C Major",
    "overallMode": "C Ionian (Major)",
    "chordAnalysis": [
      {
        "chord": "Am",
        "position": 1,
        "function": "vi",
        "isModal": false,
        "mode": "C Ionian",
        "notes": ["A", "C", "E"],
        "relationship": "Diatonic to C Major"
      },
      {
        "chord": "F",
        "position": 2,
        "function": "IV",
        "isModal": false,
        "mode": "C Ionian",
        "notes": ["F", "A", "C"],
        "relationship": "Diatonic to C Major"
      },
      {
        "chord": "C",
        "position": 3,
        "function": "I",
        "isModal": false,
        "mode": "C Ionian",
        "notes": ["C", "E", "G"],
        "relationship": "Diatonic to C Major"
      },
      {
        "chord": "G",
        "position": 4,
        "function": "V",
        "isModal": false,
        "mode": "C Ionian",
        "notes": ["G", "B", "D"],
        "relationship": "Diatonic to C Major"
      }
    ],
    "modalChords": [],
    "modalInterchange": "None detected - all chords are diatonic to C Major"
  },
  "applications": {
    "genres": ["Pop", "Rock", "Folk"],
    "progressions": ["vi-IV-I-V"],
    "tips": "Classic pop progression, all chords diatonic to C Major, no modal content"
  }
}
`
  }, {
    text: `**Reference Scale Data:**\n${JSON.stringify(allScaleData, null, 2)}`
  }]
};

// --- MODE DISCOVERY FUNCTIONS ---

export const discoverModes = async (
  method: string,
  data: any
): Promise<{ result: any; debug: any }> => {

  if (method === 'root') {
    return await discoverModesFromRoot(data.rootNote);
  }

  // For now, return placeholder for other methods
  return {
    result: {
      error: `Mode discovery method '${method}' is not yet implemented. Available: 'root'`
    },
    debug: {
      method,
      data,
      message: 'Method not implemented'
    }
  };
};

const discoverModesFromRoot = async (
  rootNote: string
): Promise<{ result: any; debug: any }> => {

  const userPrompt = `Build modes from root: ${rootNote}`;

  const debugInfo = {
    prompt: modeDiscoverySystemInstruction,
    userPrompt,
    rawResponse: ''
  };

  try {
    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: userPrompt,
      config: {
        systemInstruction: modeDiscoverySystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawResponse = response.text;
    debugInfo.rawResponse = rawResponse || '';

    if (!rawResponse) {
      return { 
        result: { error: "Mode discovery returned an empty response." }, 
        debug: debugInfo 
      };
    }

    const parsedData = safelyParseJson<any>(rawResponse);

    if (!parsedData) {
      return { 
        result: { error: "Mode discovery returned a malformed response." }, 
        debug: debugInfo 
      };
    }

    return { result: parsedData, debug: debugInfo };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in mode discovery";
    debugInfo.rawResponse = error instanceof Error ? error.stack ?? message : String(error);
    return { 
      result: { error: `Mode discovery failed: ${message}` }, 
      debug: debugInfo 
    };
  }
};

// --- HARMONY ANALYSIS FUNCTIONS ---

export const analyzeHarmony = async (
  method: string,
  data: any
): Promise<{ result: any; debug: any }> => {

  switch (method) {
    case 'analyze':
      return await analyzeChord(data.chord);
    case 'generate':
      return await generateChordsFromMode(data.mode);
    case 'substitute':
      return await findChordSubstitutions(data.chord);
    case 'progression':
      return await analyzeChordProgression(data.progression);
    default:
      return {
        result: {
          error: `Harmony analysis method '${method}' is not yet implemented. Available: 'analyze', 'generate', 'substitute', 'progression'`
        },
        debug: {
          method,
          data,
          message: 'Method not implemented'
        }
      };
  }
};

const analyzeChord = async (
  chord: string
): Promise<{ result: any; debug: any }> => {

  const userPrompt = `Analyze chord: ${chord}`;

  const debugInfo = {
    prompt: harmonyAnalysisSystemInstruction,
    userPrompt,
    rawResponse: ''
  };

  try {
    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: userPrompt,
      config: {
        systemInstruction: harmonyAnalysisSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawResponse = response.text;
    debugInfo.rawResponse = rawResponse || '';

    if (!rawResponse) {
      return { 
        result: { error: "Chord analysis returned an empty response." }, 
        debug: debugInfo 
      };
    }

    const parsedData = safelyParseJson<any>(rawResponse);

    if (!parsedData) {
      return { 
        result: { error: "Chord analysis returned a malformed response." }, 
        debug: debugInfo 
      };
    }

    return { result: parsedData, debug: debugInfo };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in chord analysis";
    debugInfo.rawResponse = error instanceof Error ? error.stack ?? message : String(error);
    return { 
      result: { error: `Chord analysis failed: ${message}` }, 
      debug: debugInfo 
    };
  }
};

const generateChordsFromMode = async (
  mode: string
): Promise<{ result: any; debug: any }> => {

  const userPrompt = `Generate chords from mode: ${mode}`;

  const debugInfo = {
    prompt: harmonyAnalysisSystemInstruction,
    userPrompt,
    rawResponse: ''
  };

  try {
    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: userPrompt,
      config: {
        systemInstruction: harmonyAnalysisSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawResponse = response.text;
    debugInfo.rawResponse = rawResponse || '';

    if (!rawResponse) {
      return { 
        result: { error: "Mode chord generation returned an empty response." }, 
        debug: debugInfo 
      };
    }

    const parsedData = safelyParseJson<any>(rawResponse);

    if (!parsedData) {
      return { 
        result: { error: "Mode chord generation returned a malformed response." }, 
        debug: debugInfo 
      };
    }

    return { result: parsedData, debug: debugInfo };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in mode chord generation";
    debugInfo.rawResponse = error instanceof Error ? error.stack ?? message : String(error);
    return { 
      result: { error: `Mode chord generation failed: ${message}` }, 
      debug: debugInfo 
    };
  }
};

const findChordSubstitutions = async (
  chord: string
): Promise<{ result: any; debug: any }> => {

  const userPrompt = `Find substitutions for chord: ${chord}`;

  const debugInfo = {
    prompt: harmonyAnalysisSystemInstruction,
    userPrompt,
    rawResponse: ''
  };

  try {
    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: userPrompt,
      config: {
        systemInstruction: harmonyAnalysisSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawResponse = response.text;
    debugInfo.rawResponse = rawResponse || '';

    if (!rawResponse) {
      return { 
        result: { error: "Chord substitution analysis returned an empty response." }, 
        debug: debugInfo 
      };
    }

    const parsedData = safelyParseJson<any>(rawResponse);

    if (!parsedData) {
      return { 
        result: { error: "Chord substitution analysis returned a malformed response." }, 
        debug: debugInfo 
      };
    }

    return { result: parsedData, debug: debugInfo };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in chord substitution analysis";
    debugInfo.rawResponse = error instanceof Error ? error.stack ?? message : String(error);
    return { 
      result: { error: `Chord substitution analysis failed: ${message}` }, 
      debug: debugInfo 
    };
  }
};

const analyzeChordProgression = async (
  progression: string
): Promise<{ result: any; debug: any }> => {

  const userPrompt = `Analyze chord progression: ${progression}`;

  const debugInfo = {
    prompt: harmonyAnalysisSystemInstruction,
    userPrompt,
    rawResponse: ''
  };

  try {
    const response = await ai.models.generateContent({
      model: getModelId(),
      contents: userPrompt,
      config: {
        systemInstruction: harmonyAnalysisSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawResponse = response.text;
    debugInfo.rawResponse = rawResponse || '';

    if (!rawResponse) {
      return { 
        result: { error: "Chord progression analysis returned an empty response." }, 
        debug: debugInfo 
      };
    }

    const parsedData = safelyParseJson<any>(rawResponse);

    if (!parsedData) {
      return { 
        result: { error: "Chord progression analysis returned a malformed response." }, 
        debug: debugInfo 
      };
    }

    return { result: parsedData, debug: debugInfo };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in chord progression analysis";
    debugInfo.rawResponse = error instanceof Error ? error.stack ?? message : String(error);
    return { 
      result: { error: `Chord progression analysis failed: ${message}` }, 
      debug: debugInfo 
    };
  }
};
