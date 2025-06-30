import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from '../types';
import { allScaleData } from '../constants/scales';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema = {
  type: "OBJECT",
  properties: {
    analysis: {
      type: "OBJECT",
      description: "Detailed analysis of the chord/scale and its corresponding mode. Omit if input is invalid.",
      properties: {
        key: { type: "STRING", description: "The musical key provided by the user." },
        chord: { type: "STRING", description: "The chord provided by the user, if applicable." },
        romanNumeral: { type: "STRING", description: "The Roman numeral of the chord in the given key, if applicable." },
        selectedNotes: {
          type: "ARRAY",
          description: "The notes selected by the user for scale analysis, if applicable.",
          items: { type: "STRING" }
        },
        mode: { type: "STRING", description: "The musical mode associated with the chord/scale." },
        tableId: { type: "STRING", description: "The 'tableId' from the reference data for the scale containing the mode." },
        modeIndex: { type: "NUMBER", description: "The 0-based index of the mode within its parent scale's 'modeIntervals' array." },
        parentScaleRootNote: { type: "STRING", description: "The root note name (e.g., 'C', 'Bb', 'F#') of the parent scale of the identified mode. This is used to find the correct row in the UI tables." },
        explanation: { type: "STRING", description: "A brief explanation of the mode." },
        formula: { type: "STRING", description: "The interval formula of the mode (e.g., 1, 2, b3, 4, 5, 6, b7)." },
        intervals: {
          type: "ARRAY",
          description: "The semitone intervals from the root of the mode.",
          items: { type: "NUMBER" }
        },
        notes: {
          type: "ARRAY",
          description: "The actual notes of the mode's scale in the given key.",
          items: { type: "STRING" }
        },
        ambiguityExplanation: { type: "STRING", description: "Describes the nature of the ambiguity or nuance regarding the identified mode or chord function, if any. This should be concise and explain *why* there might be alternative interpretations. Should be populated only if a musically plausible ambiguity exists." },
        alternateExplanation: { type: "STRING", description: "Optional: Provides a concise alternate musically plausible interpretation or mode if the primary identified mode has significant ambiguity. Leave empty if no significant alternative exists." }
      },
      required: ["key", "mode", "tableId", "modeIndex", "parentScaleRootNote", "explanation", "formula", "intervals", "notes"]
    },
    songExamples: {
      type: "ARRAY",
      description: "A list of popular songs that feature the identified mode. Omit if input is invalid.",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "The title of the song." },
          artist: { type: "STRING", description: "The artist of the song." },
          usage: { type: "STRING", description: "A description of how the mode is used in the song." }
        },
        required: ["title", "artist", "usage"]
      }
    },
    error: {
        type: "STRING",
        description: "An error message to be populated ONLY if the user-provided chord or scale is musically invalid."
    }
  }
};

const systemInstruction = {
  parts: [
    { text: `You are an expert music theory bot. Your purpose is to analyze a musical context within a specific key. The context can be either a single chord or a set of notes forming a scale.

Your tasks are:
1.  **Analyze Input**: You will receive a musical key and EITHER a 'chord' OR a set of 'selectedNotes'.
2.  **Validate Input**: First, check if the provided chord or set of notes is musically sensible. A valid set of notes must contain at least 3 unique notes. If it is not valid (e.g., chord "R", or a small/invalid set of notes), your only task is to return an error.

**If a CHORD is provided:**
- **Determine Roman Numeral**: Find the Roman numeral for the chord in that key.
- **Identify Most Likely Mode**:
    * First, determine if the chord is diatonic to the Ionian mode (for major keys) or Aeolian mode (for minor keys) of the given key. If it is, this is the primary mode.
    * If not, identify the most likely mode from common practice (e.g., secondary dominant, modal interchange) and explain why.
- **Provide Mode Details**: For the identified mode, provide its explanation, scale formula, interval pattern, notes, and crucially, the \`tableId\`, \`modeIndex\`, and \`parentScaleRootNote\` from the reference data.
- **Populate 'chord' and 'romanNumeral' fields in the output.** Omit 'selectedNotes'.

**If a set of NOTES is provided:**
- **Identify Scale/Mode**: Analyze the provided set of notes within the context of the given musical key to determine the most likely scale or mode they represent.
- **Provide Mode Details**: For the identified mode, provide its explanation, scale formula, interval pattern, notes, and crucially, the \`tableId\`, \`modeIndex\`, and \`parentScaleRootNote\` from the reference data.
- **Populate 'selectedNotes' field in the output with the user's provided notes.** The 'chord' and 'romanNumeral' fields MUST be omitted.

**Output Rules & Error Handling:**
* **Success Case**: If you can successfully analyze the input, you MUST return a JSON object with the 'analysis' and 'songExamples' fields populated according to the schema.
* **Failure Case**: If the input is musically invalid (e.g., chord "R", fewer than 3 unique notes), or if you cannot confidently determine a single primary mode from the reference data, you MUST return a JSON object containing ONLY an 'error' field with a concise, descriptive message. In this case, the 'analysis' and 'songExamples' fields MUST be omitted.
* **Source of Truth**: You MUST use the provided 'Reference Scale Data' for all mode information (formula, intervals, \`tableId\`, etc.). Do not invent scales or modes not present in the data.
* **Format Adherence**: Your entire response MUST be a single, valid JSON object that strictly adheres to the provided JSON schema. Do not return any other text, explanations, or formatting outside the JSON object.`
    },
    { text: `**Reference Scale Data:**\n${JSON.stringify(allScaleData, null, 2)}` },
  ]
};

export const analyzeMusic = async (musicalKey: string, analysisTarget: { chord?: string; notes?: readonly string[] }): Promise<AnalysisResult> => {
  try {
    const userPrompt = `Analyze this context: Key: ${musicalKey}. ${
      analysisTarget.chord
        ? `Chord: ${analysisTarget.chord}`
        : `Selected Notes: ${analysisTarget.notes?.join(", ")}`
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    const jsonStr = response.text;

    if (!jsonStr) {
      throw new Error("API returned an empty response.");
    }

    const parsedData = JSON.parse(jsonStr) as AnalysisResult;

    if (parsedData.error) {
      return parsedData;
    }

    if (!parsedData.analysis || !parsedData.songExamples) {
      console.error("Incomplete data from API:", parsedData);
      throw new Error("Invalid JSON structure received from API.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error during analysis:", error);

    let finalErrorMessage = "An unknown error occurred during analysis.";

    if (error instanceof SyntaxError) {
      finalErrorMessage = "The analysis service returned a malformed response. This might be a temporary issue, please try again.";
    } else if (error instanceof Error) {
        if (error.message.includes('500') || error.message.includes('unavailable')) {
             finalErrorMessage = "The analysis service is currently busy or unavailable. Please try again in a moment.";
        } else if (error.message.includes("API_KEY")) {
             finalErrorMessage = "The API key is invalid or misconfigured. Please contact support.";
        } else if (error.message.includes("Invalid JSON structure") || error.message.includes("empty response")) {
            finalErrorMessage = "The analysis service returned an incomplete response. Please try again."
        }
        else {
             finalErrorMessage = `Failed to analyze: ${error.message}`;
        }
    }

    throw new Error(finalErrorMessage);
  }
};
