/**
 * Enhanced Mouse Input Test Component
 *
 * A test component to verify the new enhanced mouse input capabilities work correctly.
 * This component can be temporarily added to test the CompactChordBuilder and CompactNoteSelector.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import CompactChordBuilder from './compact-chord-builder';
import CompactNoteSelector from './compact-note-selector';

const EnhancedMouseInputTest: React.FC = () => {
  const [chordProgression, setChordProgression] = useState('');
  const [melody, setMelody] = useState('');
  const [scale, setScale] = useState('');

  return (
    <div className="enhanced-mouse-input-test p-6 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎹 Enhanced Mouse Input Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chords" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chords">Chord Progression</TabsTrigger>
              <TabsTrigger value="melody">Melody</TabsTrigger>
              <TabsTrigger value="scale">Scale</TabsTrigger>
            </TabsList>

            <TabsContent value="chords" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Compact Chord Builder</h3>
                <CompactChordBuilder
                  value={chordProgression}
                  onChange={setChordProgression}
                  maxChords={8}
                  showPlayback={false}
                />

                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Current Value:</div>
                  <div className="font-mono text-sm">
                    {chordProgression || '(empty)'}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="melody" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Compact Note Selector - Melody Mode</h3>
                <CompactNoteSelector
                  value={melody}
                  onChange={setMelody}
                  mode="melody"
                  layout="horizontal"
                  maxNotes={20}
                  showOctaves={false}
                />

                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Current Value:</div>
                  <div className="font-mono text-sm">
                    {melody || '(empty)'}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scale" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Compact Note Selector - Scale Mode</h3>
                <CompactNoteSelector
                  value={scale}
                  onChange={setScale}
                  mode="scale"
                  layout="horizontal"
                  maxNotes={12}
                  showOctaves={false}
                />

                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Current Value:</div>
                  <div className="font-mono text-sm">
                    {scale || '(empty)'}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMouseInputTest;
