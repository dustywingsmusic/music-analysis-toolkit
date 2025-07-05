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

export interface BachExample {
  title: string;
  bwv?: string;
  composer?: string;
  key?: string;
  exampleKey?: string;
  explanation?: string;
  midiUrl?: string;
  scoreUrl?: string;
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

// Interface for diatonic chord
export interface DiatonicChord {
  roman: string;
  symbol: string;
  quality: string;
}

export interface ProcessedScale {
    id: string;
    pitchClasses: Set<number>;
    rootNote: number;
    name?: string;
    diatonicChords?: DiatonicChord[];
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
