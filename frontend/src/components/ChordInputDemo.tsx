/**
 * Chord Input Demo Component
 *
 * A demonstration component showcasing the new compact chord input system.
 * This can be used for testing and as a reference for the design patterns.
 */

import React, { useState } from 'react';
import { ChordProgressionInput } from './ui/chord-progression-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Music, Sparkles, RefreshCw } from 'lucide-react';

export const ChordInputDemo: React.FC = () => {
  const [progression1, setProgression1] = useState('');
  const [progression2, setProgression2] = useState('Am F C G');
  const [progression3, setProgression3] = useState('');

  const exampleProgressions = [
    { name: 'I-V-vi-IV', chords: 'C G Am F', description: 'Pop progression' },
    { name: 'ii-V-I', chords: 'Dm7 G7 Cmaj7', description: 'Jazz standard' },
    { name: 'Modal', chords: 'G F C G', description: 'Mixolydian flavor' },
    { name: 'Blues', chords: 'C7 F7 C7 G7', description: '12-bar blues' },
  ];

  const handleLoadExample = (chords: string, target: number) => {
    if (target === 1) setProgression1(chords);
    else if (target === 2) setProgression2(chords);
    else setProgression3(chords);
  };

  return (
    <div className="chord-input-demo p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Music className="h-8 w-8 text-blue-600" />
          Elegant Chord Input System
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A non-obtrusive, modal-based chord progression input that transforms simple placeholders
          into powerful chord building tools. Click [+] buttons to experience the compact modal interface.
        </p>
      </div>

      {/* Design Principles */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Design Philosophy
          </CardTitle>
          <CardDescription>
            "The interface should be invisible until needed, then provide focused functionality without overwhelming the user."
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium">Focused</h3>
              <p className="text-xs text-muted-foreground">Small modal appears only when needed</p>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-medium">Fast</h3>
              <p className="text-xs text-muted-foreground">Quick chord building with presets</p>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-medium">Elegant</h3>
              <p className="text-xs text-muted-foreground">Clean interface, smooth animations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Instances */}
      <div className="space-y-6">

        {/* Empty Progression - Shows Initial State */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Empty Progression</CardTitle>
            <CardDescription>
              Shows the clean initial state with clickable [+] placeholders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChordProgressionInput
              value={progression1}
              onChange={setProgression1}
              label="Click [+] to add chords"
              helpText="This demonstrates the initial empty state. Each [+] opens the chord builder modal."
              maxChords={12}
            />
            <div className="mt-4 flex gap-2 flex-wrap">
              {exampleProgressions.map((example, index) => (
                <Button
                  key={index}
                  onClick={() => handleLoadExample(example.chords, 1)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Load {example.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pre-filled Progression - Shows Edit State */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pre-filled Progression</CardTitle>
            <CardDescription>
              Shows existing chords that can be clicked to edit. Try clicking any chord to modify it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChordProgressionInput
              value={progression2}
              onChange={setProgression2}
              label="Click chords to edit them"
              helpText="Existing chords show as buttons that open the modal for editing. Try clicking 'Am' or 'F'."
              maxChords={16}
            />
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <strong>Current progression:</strong>
                <Badge variant="outline" className="ml-2 font-mono">
                  {progression2 || 'Empty'}
                </Badge>
              </div>
              <Button
                onClick={() => setProgression2('')}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Features</CardTitle>
            <CardDescription>
              Keyboard mode toggle, measure management, and extended chord support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChordProgressionInput
              value={progression3}
              onChange={setProgression3}
              label="Full feature set"
              helpText="Toggle keyboard mode, add measures, use extended chords (maj7, 9th, etc.)"
              maxChords={20}
              allowKeyboardInput={true}
              showBarLines={true}
            />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Feature Highlights:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Circular root note selector for quick navigation</li>
                <li>• Chord quality buttons (major, minor, 7th, extended)</li>
                <li>• Common chord presets for instant selection</li>
                <li>• Keyboard mode toggle for direct typing</li>
                <li>• Bar line support for measure organization</li>
                <li>• Position-aware modal that adjusts to viewport edges</li>
                <li>• Escape key and click-outside to close modal</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Notes */}
      <Card className="border-2 border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-green-600">✅</span>
            Implementation Complete
          </CardTitle>
          <CardDescription>
            Ready for integration into the harmony analysis workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <strong>Components Created:</strong>
              <ul className="text-sm mt-1 space-y-1">
                <li>• <code>ChordBuilderModal</code> - Compact chord building interface</li>
                <li>• <code>ChordProgressionInput</code> - Main progression input component</li>
                <li>• Integration with <code>EnhancedHarmonyTab</code></li>
              </ul>
            </div>
            <div>
              <strong>Files Modified:</strong>
              <ul className="text-sm mt-1 space-y-1">
                <li>• <code>/frontend/src/components/ui/chord-builder-modal.tsx</code></li>
                <li>• <code>/frontend/src/components/ui/chord-progression-input.tsx</code></li>
                <li>• <code>/frontend/src/components/EnhancedHarmonyTab.tsx</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
