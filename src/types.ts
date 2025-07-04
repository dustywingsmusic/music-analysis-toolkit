// Types for Chord Analyzer
export interface SongExample {
  title: string;
  artist: string;
  usage: string;
}

export interface SongExampleGroup {
  mode: string;
  examples: SongExample[];
}

export interface BachExample {
  title: string;
  composer?: string;
  key?: string;
  tempo?: string;
  snippet?: string;
  explanation?: string;
  // For backwards compatibility with older response formats
  bwv?: string;
  exampleKey?: string;
  abcNotation?: string;
  midiUrl?: string;
  scoreUrl?: string;
}

export interface PrimaryAnalysis {
  key: string;
  chord?: string;
  romanNumeral?: string;
  selectedNotes?: string[];
  mode: string;
  tableId: string;
  modeIndex: number;
  parentScaleRootNote: string;
  explanation: string;
  formula: string;
  intervals: number[];
  notes: string[];
  bachExample?: BachExample;
  isNearestGuess?: boolean;
}

export interface AlternateAnalysis {
  key: string;
  mode: string;
  explanation: string;
  formula: string;
  intervals: number[];
  notes: string[];
  tableId: string;
  modeIndex: number;
  parentScaleRootNote: string;
}

export type Analysis = PrimaryAnalysis | AlternateAnalysis;

export interface AnalysisResult {
  analysis?: PrimaryAnalysis;
  alternates?: AlternateAnalysis[];
  modeDiscussion?: string;
  songExamples?: SongExampleGroup[];
  error?: string;
}

export interface AnalysisResponsePayload {
  result: AnalysisResult;
  debug: {
    prompt: object;
    userPrompt: string;
    rawResponse: string;
  };
}


// Types for Scale Finder
export interface ScaleData {
  name: string;
  tableId: string;
  isDiatonic: boolean;
  headers: string[];
  formulas: string[];
  commonNames?: string[];
  alternateNames?: string[];
  skipCommonNames?: boolean;
  modeIntervals: number[][];
  parentScaleIntervals: number[];
  parentScaleIntervalPattern?: number[];
}

export interface ProcessedScale {
    id: string;
    pitchClasses: Set<number>;
    rootNote: number;
}

export interface MidiDevice {
  id: string;
  name: string;
}

export interface NotePlayed {
    number: number;
    name: string;
    accidental?: string;
    octave: number;
}