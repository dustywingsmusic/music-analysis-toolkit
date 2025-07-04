
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, AnalysisResponsePayload, PrimaryAnalysis, BachExample, SongExampleGroup, Analysis } from '../types';
import { allScaleData } from '../constants/scales';
import { searchPeachnote } from './peachnoteService';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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


// --- PROMPT 2: BACH EXAMPLE ---

const bachExampleSystemInstruction = {
    text: `You are a musicology expert specializing in the Baroque and Classical periods. Your task is to find a single, real musical work that is a good example of a given musical mode and return its details as a single, valid JSON object.

The user will provide a mode and its key context.

Your process:
1. Find a suitable piece (preferably by J.S. Bach, but other well-known composers like Beethoven or Mozart are acceptable) that clearly demonstrates the provided mode.
2. Provide the full, searchable title, including catalogue numbers (e.g., BWV for Bach, Op. for Beethoven).
3. Write a detailed, educational \`explanation\` that analyzes how the composer uses the characteristic note to achieve a specific emotional or dramatic effect. Structure the explanation with the provided markdown (🎵, 🔍, 🎼, 🧠).

**CRITICAL**:
- If a good example cannot be found, return an empty JSON object: \`{}\`.
- The output JSON object MUST be perfectly structured and valid.
- DO NOT include \`snippet\` or \`abcNotation\`.
- The example you provide in your response should be DIFFERENT from the one in this prompt.

**EXAMPLE INPUT**:
Mode: F Lydian. Key context: F Major.

**EXAMPLE OUTPUT (Your response must be in this format and structure, but with a different piece):**
{
  "title": "String Quartet No. 15 in A minor, Op. 132, III. Molto adagio",
  "composer": "L.v. Beethoven",
  "key": "F Lydian",
  "explanation": "This movement, titled \\"Holy song of thanksgiving of a convalescent to the Deity, in the Lydian mode,\\" is one of the most famous uses of a church mode in the classical repertoire.\\n\\n⸻\\n\\n🎵 Why is B natural used in F Lydian?\\n\\nBeethoven uses the B natural (the ♯4 degree) to create a sense of sublime, ethereal openness and purity, deliberately avoiding the tension of the standard B-flat to C V-I resolution in F Major.\\n\\n🔍 Let’s break that down:\\n\\t1.\\tThe Lydian ♯4 avoids the tritone with the root, giving the scale a uniquely bright and stable quality, which Beethoven uses to represent divine grace and recovery from illness.\\n\\t2.\\tHe alternates the ancient, placid F Lydian sections with sections in D Major (Neue Kraft fühlend - \\"feeling new strength\\"), creating a powerful narrative of sickness and healing.\\n\\t3.\\tThe lack of a leading tone pull from B-flat to C makes the harmony feel suspended and contemplative, perfectly fitting the mood of a prayerful hymn.\\n\\n⸻\\n\\n🎼 In practice:\\n\\nThe B natural in the main chorale theme gives the melody its floating, otherworldly character. It sounds ancient and fresh at the same time, a deliberate choice by Beethoven to evoke a sense of sacred mystery and profound gratitude.\\n\\n⸻\\n\\n🧠 Summary:\\n\\t•\\tKey of the piece: F Lydian\\n\\t•\\tB natural: Not an error—it is the defining note of the Lydian mode.\\n\\t•\\tEffect: Creates a serene, open, and divine atmosphere, contrasting with the more earthly D Major sections."
}`
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: userPrompt,
      config: {
        systemInstruction: coreAnalysisSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawResponse = response.text;
    debugInfo.rawResponse = rawResponse;

    if (!rawResponse) {
      return { result: { error: "Core analysis returned an empty response." }, debug: debugInfo };
    }

    const parsedData = safelyParseJson<AnalysisResult>(rawResponse);

    if (!parsedData) {
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
    return { result: { error: `Core analysis failed: ${message}` }, debug: debugInfo };
  }
};

const getBachExample = async (analysis: PrimaryAnalysis): Promise<BachExample | null> => {
    if (!analysis) return null;

    const { mode, key } = analysis;
    const prompt = `Mode: ${analysis.parentScaleRootNote} ${mode}. Key context: ${key}.`;

    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: prompt,
          config: {
            systemInstruction: { text: bachExampleSystemInstruction.text },
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });

        const rawResponse = response.text;
        if (!rawResponse) return null;

        const llmSuggestion = safelyParseJson<BachExample>(rawResponse);
        if (!llmSuggestion || !llmSuggestion.title || !llmSuggestion.composer) {
            return llmSuggestion;
        }

        const peachnoteData = await searchPeachnote(llmSuggestion.title, llmSuggestion.composer);

        return {
            ...llmSuggestion,
            ...peachnoteData,
        };
    } catch (error) {
        console.warn("Bach example generation failed:", error);
        return null;
    }
};

const getSongExamples = async (allModes: Analysis[]): Promise<SongExampleGroup[] | null> => {
    if (!allModes || allModes.length === 0) return null;

    const modeNames = allModes.map(m => m.mode);
    const prompt = JSON.stringify(modeNames);

    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: prompt,
          config: {
            systemInstruction: { text: songExamplesSystemInstruction.text },
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawResponse = response.text;
        if (!rawResponse) return null;

        return safelyParseJson<SongExampleGroup[]>(rawResponse);
    } catch (error) {
        console.warn("Song example generation failed:", error);
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

  // Step 2: Concurrently fetch supplementary data
  const { analysis, alternates, modeDiscussion } = coreResult;
  const allFoundModes = [analysis, ...(alternates || [])];

  const [bachExample, songExamples] = await Promise.all([
    getBachExample(analysis),
    getSongExamples(allFoundModes)
  ]);

  // Step 3: Assemble the final result
  const finalResult: AnalysisResult = {
    analysis: {
      ...analysis,
      ...(bachExample && Object.keys(bachExample).length > 0 && { bachExample }),
    },
    alternates,
    modeDiscussion,
    ...(songExamples && { songExamples }),
  };

  // For simplicity, debug info will only contain the core analysis prompt details.
  // A more advanced implementation could aggregate debug info from all calls.
  return { result: finalResult, debug: coreDebug };
};
