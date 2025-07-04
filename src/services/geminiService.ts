
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from '../types';
import { allScaleData } from '../constants/scales';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//
// 1) Expanded schema to include the basicMajorScale and inferred parent key
//
const responseSchema = {
  type: "OBJECT",
  properties: {
    analysis: {
      type: "OBJECT",
      description: "Detailed analysis of the chord/scale and its corresponding mode. Omit if input is invalid.",
      properties: {
        key:               { type: "STRING", description: "The parent musical key (e.g., 'C Major' or 'A Minor') inferred by the AI based on the tonic and the musical input." },
        basicMajorScale:   { type: "ARRAY",  description: "The notes of the major scale starting on the tonic.", items: { type: "STRING" } },
        chord:             { type: "STRING", description: "The chord provided by the user, if applicable." },
        romanNumeral:      { type: "STRING", description: "The Roman numeral of the chord in the given key, if applicable." },
        selectedNotes:     { type: "ARRAY",  description: "The notes selected by the user for scale analysis, if applicable.", items: { type: "STRING" } },
        mode:              { type: "STRING", description: "The primary musical mode associated with the chord/scale." },
        tableId:           { type: "STRING", description: "The 'tableId' from the reference data for the scale containing the mode." },
        modeIndex:         { type: "NUMBER", description: "The 0-based index of the mode within its parent scale's 'modeIntervals' array." },
        parentScaleRootNote: { type: "STRING", description: "The root note name of the parent scale of the identified mode." },
        explanation:       { type: "STRING", description: "A brief explanation of the primary mode." },
        formula:           { type: "STRING", description: "The interval formula of the mode (e.g., 1, 2, b3, 4, 5, 6, b7)." },
        intervals:         { type: "ARRAY",  description: "The semitone intervals from the root of the mode.", items: { type: "NUMBER" } },
        notes:             { type: "ARRAY",  description: "The actual notes of the mode's scale in the given key.", items: { type: "STRING" } },
        ambiguityExplanation: { type: "STRING", description: "Why other modes might also fit (e.g. enharmonic choices, multiple possible alterations)." },
        alternateExplanation: { type: "STRING", description: "A concise description of an alternate plausible mode, if one exists." }
      },
      required: [
        "key","basicMajorScale","mode","tableId","modeIndex","parentScaleRootNote",
        "explanation","formula","intervals","notes"
      ]
    },
    songExamples: {
      type: "ARRAY",
      description: "A list of popular songs that feature the identified mode. Omit if input is invalid.",
      items: {
        type: "OBJECT",
        properties: {
          title:  { type: "STRING", description: "The title of the song." },
          artist: { type: "STRING", description: "The artist of the song." },
          usage:  { type: "STRING", description: "How the mode is used in the song." }
        },
        required: ["title","artist","usage"]
      }
    },
    error: {
      type: "STRING",
      description: "An error message to be populated ONLY if the user-provided chord or scale is musically invalid."
    }
  }
};

//
// 2) Enhanced system instructions to ask the AI to infer the parent key.
//
const systemInstruction = {
  parts: [
    {
      text: `
You are an expert music theory bot. Your purpose is to analyze a musical context starting from a given tonic (root note).

Your tasks are:
1. **Infer Parent Key**: From the tonic and the input (chord or notes), determine the most likely parent key, including its quality (e.g., 'C Major', 'A Minor'). Use this inferred key for all subsequent analysis. The 'key' field in your response must contain this inferred key.
2. **Basic Major Scale**: Always compute and return the notes of the major (Ionian) scale built on the given tonic.
3. **Primary Mode**: Determine the single best-guess mode that fits the input (chord or set of notes). The root of this mode must match the provided tonic.
4. **Alternate Modes**: If more than one mode plausibly matches (e.g. enharmonic ambiguities, multiple viable alterations), populate both:
   - \`ambiguityExplanation\` describing *why* there's more than one fit
   - \`alternateExplanation\` giving the next-best plausible mode
5. **Enharmonic Context**: When inputs include enharmonic notes (e.g. Gb vs. F# in a C tonic context), reason based on your inferred key:
   - Identify if the alteration is a lowered 5th (C-Gb → C Locrian) **or** a raised 4th (C–F# → C Lydian).
   - Surface both interpretations as alternate modes if both are musically valid.
6. **Strict Tonic Context**: All analysis must be based on the provided tonic. Do NOT switch parent scales to a different tonic.

---

**If a CHORD is provided:**
- Validate it’s a known chord. If invalid, return only \`{ error: "…"}\`.
- Based on the provided tonic and chord, infer the parent key.
- Compute the chord's Roman numeral within that inferred key.
- Identify the primary mode, then list any alternates as above.
- Populate \`key\` (with inferred key), \`basicMajorScale\`, \`chord\`, \`romanNumeral\`, all \`mode*\` fields, and \`ambiguityExplanation\`/\`alternateExplanation\` if needed.

**If NOTES are provided:**
- Validate ≥3 unique notes; else error.
- Based on the provided tonic and notes, infer the parent key.
- Compute \`basicMajorScale\` for the tonic.
- Match the note set to the single most likely mode whose root is the provided tonic.
- If more than one mode fits, explain why and give the alternate.
- On success, populate \`key\` (with inferred key), \`basicMajorScale\`, \`selectedNotes\`, all \`mode*\` fields, and any ambiguity/alternate.
- On failure to find a unique best fit, return only \`{ error: "…"}\`.

**Output must be a single JSON object** strictly following the above schema. No extra text.
`
    },
    {
      text: `**Reference Scale Data:**\n${JSON.stringify(allScaleData, null, 2)}`
    }
  ]
};

export const analyzeMusic = async (
  tonic: string,
  analysisTarget: { chord?: string; notes?: readonly string[] }
): Promise<AnalysisResult> => {

  try {
    const userPrompt = `Analyze this context: Tonic: ${tonic}. ${
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

    let jsonStr = response.text;

    if (!jsonStr) {
      throw new Error("API returned an empty response.");
    }

    jsonStr = jsonStr.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }

    if (!jsonStr) {
        throw new Error("API returned an empty response after stripping markdown.");
    }

    const parsedData = JSON.parse(jsonStr) as AnalysisResult;

    if (!parsedData) {
      throw new Error("API returned a null or undefined JSON response.");
    }

    // The primary valid response is one with an 'error' field.
    if (parsedData.error) {
      return { error: parsedData.error };
    }

    // The other valid response has both 'analysis' and 'songExamples'.
    if (parsedData.analysis && parsedData.songExamples) {
      return {
        analysis: parsedData.analysis,
        songExamples: parsedData.songExamples,
      };
    }

    // If we reach here, the response is not in a recognized format.
    console.error("Invalid or unexpected JSON structure from API:", parsedData);
    throw new Error("The API returned an unexpected structure. The response did not contain the expected 'analysis' and 'songExamples' fields, nor an 'error' field.");


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
        } else if (error.message.includes("unexpected structure")) {
            finalErrorMessage = "The analysis service returned an incomplete or unexpected response. Please try again."
        }
        else {
             finalErrorMessage = `Failed to analyze: ${error.message}`;
        }
    }

    throw new Error(finalErrorMessage);
  }
};
