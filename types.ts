// Types for Chord Analyzer
export interface SongExample {
  title: string;
  artist: string;
  usage: string;
}

export interface AnalysisResult {
  analysis?: {
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
    ambiguityExplanation?: string;
    alternateExplanation?: string;
  };
  songExamples?: SongExample[];
  error?: string;
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