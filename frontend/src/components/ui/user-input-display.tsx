/**
 * User Input Display Component
 *
 * Shows the user's original input within analysis results to provide context
 * without requiring scrolling back to the input form.
 */

import React from 'react';
import { Badge } from "./badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { FileTextIcon, KeyIcon, TargetIcon } from "lucide-react";

export interface UserInputData {
  chordProgression: string;
  parentKey?: string;
  analysisType?: string;
}

interface UserInputDisplayProps {
  userInput: UserInputData;
  compact?: boolean;
  showAnalysisType?: boolean;
}

export const UserInputDisplay: React.FC<UserInputDisplayProps> = ({
  userInput,
  compact = false,
  showAnalysisType = true
}) => {
  const formatChordProgression = (progression: string): string[] => {
    // Split by common separators and clean up
    return progression
      .split(/[\s,\-|]+/)
      .filter(chord => chord.trim().length > 0)
      .map(chord => chord.trim());
  };

  const chords = formatChordProgression(userInput.chordProgression);

  if (compact) {
    return (
      <div className="user-input-compact bg-gray-50 dark:bg-gray-800/20 p-3 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <FileTextIcon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
          <div className="flex gap-1 flex-wrap">
            {chords.map((chord, index) => (
              <Badge key={index} variant="outline" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono">
                {chord}
              </Badge>
            ))}
          </div>
          {userInput.parentKey && (
            <>
              <span className="text-gray-400 mx-1">in</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <KeyIcon className="h-3 w-3 mr-1" />
                {userInput.parentKey}
              </Badge>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="user-input-display border-2 border-gray-200 bg-gray-50/50 dark:bg-gray-800/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileTextIcon className="h-4 w-4 text-gray-600" />
          Your Input
        </CardTitle>
        <CardDescription>
          Analysis of the chord progression you provided
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Chord Progression */}
          <div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Chord Progression:
            </div>
            <div className="flex gap-2 flex-wrap">
              {chords.map((chord, index) => (
                <div key={index} className="flex items-center">
                  <Badge
                    variant="outline"
                    className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 font-mono text-base px-3 py-1"
                  >
                    {chord}
                  </Badge>
                  {index < chords.length - 1 && (
                    <span className="mx-2 text-gray-400 text-sm">→</span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {chords.length} chord{chords.length !== 1 ? 's' : ''} analyzed
            </div>
          </div>

          {/* Parent Key */}
          {userInput.parentKey && (
            <div className="flex items-center gap-2">
              <KeyIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Parent Key:
              </span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {userInput.parentKey}
              </Badge>
            </div>
          )}

          {/* Analysis Type */}
          {showAnalysisType && userInput.analysisType && (
            <div className="flex items-center gap-2">
              <TargetIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Analysis Type:
              </span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {userInput.analysisType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const InlineUserInputDisplay: React.FC<{
  userInput: UserInputData;
  className?: string;
}> = ({ userInput, className = "" }) => {
  const chords = userInput.chordProgression
    .split(/[\s,\-|]+/)
    .filter(chord => chord.trim().length > 0)
    .map(chord => chord.trim());

  return (
    <div className={`inline-user-input flex items-center gap-2 text-sm ${className}`}>
      <span className="text-gray-600 dark:text-gray-400">Analyzing:</span>
      <div className="flex gap-1">
        {chords.map((chord, index) => (
          <React.Fragment key={index}>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 font-mono text-xs">
              {chord}
            </Badge>
            {index < chords.length - 1 && (
              <span className="text-gray-400 text-xs self-center">-</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {userInput.parentKey && (
        <>
          <span className="text-gray-400">in</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            {userInput.parentKey}
          </Badge>
        </>
      )}
    </div>
  );
};

export default UserInputDisplay;
