/**
 * Comprehensive Analysis Examples
 * Demonstrates the new Functional-First → Modal Enhancement → Chromatic Analysis hierarchy
 * 
 * Examples showcase different types of progressions and when each analytical approach is most valuable
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const COMPREHENSIVE_ANALYSIS_EXAMPLES = [
  {
    id: 'functional_dominant',
    title: 'Classic Functional Progression',
    progression: 'Am F C G',
    description: 'Perfect example of functional harmony - predominant → subdominant → tonic → dominant',
    expectedAnalysis: {
      primary: 'functional',
      reason: 'Clear functional relationships with strong cadential motion',
      functionalAnalysis: {
        keyCenter: 'C Major',
        romanNumerals: ['vi', 'IV', 'I', 'V'],
        functions: ['tonic', 'subdominant', 'tonic', 'dominant'],
        cadences: ['IV-I authentic cadence', 'half cadence on V'],
        progressionType: 'circle_of_fifths'
      },
      modalEnhancement: null,
      chromaticElements: []
    }
  },
  
  {
    id: 'modal_mixolydian',
    title: 'Mixolydian Modal Progression',
    progression: 'G F C G',
    description: 'Strong modal characteristics - bVII-I movement is distinctly Mixolydian',
    expectedAnalysis: {
      primary: 'modal',
      reason: 'bVII-I cadence creates modal sound that functional analysis misses',
      functionalAnalysis: {
        keyCenter: 'C Major',
        romanNumerals: ['V', 'IV', 'I', 'V'],
        functions: ['dominant', 'subdominant', 'tonic', 'dominant'],
        cadences: [],
        progressionType: 'other'
      },
      modalEnhancement: {
        parentKey: 'C Major',
        mode: 'G Mixolydian',
        characteristics: ['bVII-I cadence (F-G)', 'Natural 7th creates modal sound'],
        whenToUse: 'Modal analysis reveals the characteristic sound that functional analysis treats as unusual chord progressions'
      },
      chromaticElements: []
    }
  },
  
  {
    id: 'chromatic_secondary',
    title: 'Secondary Dominant Progression',
    progression: 'C A7 Dm G7 C',
    description: 'Chromatic harmony with secondary dominants - requires understanding of tonicization',
    expectedAnalysis: {
      primary: 'chromatic',
      reason: 'Secondary dominants create sophisticated harmonic relationships',
      functionalAnalysis: {
        keyCenter: 'C Major',
        romanNumerals: ['I', 'V/ii', 'ii', 'V', 'I'],
        functions: ['tonic', 'chromatic', 'predominant', 'dominant', 'tonic'],
        cadences: ['authentic cadence V-I'],
        progressionType: 'jazz_standard'
      },
      modalEnhancement: null,
      chromaticElements: [
        {
          chord: 'A7',
          type: 'secondary_dominant',
          target: 'Dm (ii)',
          explanation: 'A7 is the dominant of D minor, creating temporary tonicization'
        }
      ]
    }
  },
  
  {
    id: 'borrowed_chords',
    title: 'Modal Interchange (Borrowed Chords)',
    progression: 'C Am F Ab C',
    description: 'Borrowed chord from parallel minor creates rich harmonic color',
    expectedAnalysis: {
      primary: 'functional',
      reason: 'Primarily functional with modal enhancement through borrowed chord',
      functionalAnalysis: {
        keyCenter: 'C Major',
        romanNumerals: ['I', 'vi', 'IV', 'bVI', 'I'],
        functions: ['tonic', 'tonic', 'subdominant', 'chromatic', 'tonic'],
        cadences: ['plagal motion IV-I'],
        progressionType: 'other'
      },
      modalEnhancement: {
        parentKey: 'C Major',
        mode: 'C Major with modal interchange',
        characteristics: ['bVI borrowed from C minor', 'Creates darker harmonic color'],
        whenToUse: 'Modal analysis explains the borrowed chord relationship and its emotional effect'
      },
      chromaticElements: [
        {
          chord: 'Ab',
          type: 'borrowed_chord',
          borrowedFrom: 'parallel minor',
          explanation: 'Ab major is borrowed from C minor, adding modal color'
        }
      ]
    }
  },
  
  {
    id: 'jazz_ii_v_i',
    title: 'Jazz ii-V-I with Extensions',
    progression: 'Dm7 G7 CMaj7',
    description: 'Classic jazz progression with chord extensions - functional foundation with jazz harmony',
    expectedAnalysis: {
      primary: 'functional',
      reason: 'Textbook functional progression with jazz extensions',
      functionalAnalysis: {
        keyCenter: 'C Major',
        romanNumerals: ['ii7', 'V7', 'IMaj7'],
        functions: ['predominant', 'dominant', 'tonic'],
        cadences: ['strong authentic cadence V7-IMaj7'],
        progressionType: 'jazz_standard'
      },
      modalEnhancement: null,
      chromaticElements: []
    }
  },
  
  {
    id: 'complex_modal',
    title: 'Complex Modal Progression',
    progression: 'Dm Eb F Gm',
    description: 'Dorian mode with characteristic natural 6th - modal analysis is primary',
    expectedAnalysis: {
      primary: 'modal',
      reason: 'Natural 6th (Bb to B natural) and modal cadences define the harmonic language',
      functionalAnalysis: {
        keyCenter: 'F Major',
        romanNumerals: ['vi', 'bVII', 'I', 'ii'],
        functions: ['tonic', 'chromatic', 'tonic', 'predominant'],
        cadences: [],
        progressionType: 'modal_progression'
      },
      modalEnhancement: {
        parentKey: 'F Major',
        mode: 'D Dorian',
        characteristics: ['Natural 6th (B natural)', 'Modal cadences without leading tone'],
        whenToUse: 'Modal analysis captures the essential character that functional analysis misses'
      },
      chromaticElements: []
    }
  }
];

/**
 * Component to display analysis examples with educational annotations
 */
export const ComprehensiveAnalysisShowcase: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Comprehensive Analysis Examples</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          See how different progressions benefit from functional, modal, or chromatic analytical approaches.
          Each example shows when and why to use different theoretical perspectives.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {COMPREHENSIVE_ANALYSIS_EXAMPLES.map((example) => (
          <Card key={example.id} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{example.title}</span>
                <Badge variant="outline" className={`${
                  example.expectedAnalysis.primary === 'functional' ? 'bg-blue-100 text-blue-800' :
                  example.expectedAnalysis.primary === 'modal' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {example.expectedAnalysis.primary} primary
                </Badge>
              </CardTitle>
              <CardDescription>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {example.progression}
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-700">{example.description}</p>
              
              {/* Why This Approach */}
              <div className="p-3 rounded-lg border bg-gray-50">
                <strong className="text-sm font-semibold text-gray-700">Why {example.expectedAnalysis.primary} analysis?</strong>
                <p className="text-sm text-gray-600 mt-1">{example.expectedAnalysis.reason}</p>
              </div>
              
              {/* Primary Analysis Preview */}
              <div className="space-y-2">
                <strong className="text-sm font-semibold">Key Analysis Points:</strong>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Roman Numerals:</strong> {example.expectedAnalysis.functionalAnalysis.romanNumerals.join(' - ')}
                  </div>
                  <div>
                    <strong>Key Center:</strong> {example.expectedAnalysis.functionalAnalysis.keyCenter}
                  </div>
                  {example.expectedAnalysis.modalEnhancement && (
                    <div>
                      <strong>Modal Aspect:</strong> {example.expectedAnalysis.modalEnhancement.mode}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Try Button */}
              <Button variant="outline" size="sm" className="w-full">
                Try This Progression →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Educational Summary */}
      <Card className="border-2 border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="text-lg">Key Learning Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <strong className="text-sm font-semibold text-blue-700">Functional Analysis</strong>
              <p className="text-xs text-blue-600 mt-1">
                Best for progressions with clear tonic-predominant-dominant relationships and cadences
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <strong className="text-sm font-semibold text-purple-700">Modal Analysis</strong>
              <p className="text-xs text-purple-600 mt-1">
                Essential when characteristic modal movements (bVII-I, bII-I) define the progression
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <strong className="text-sm font-semibold text-orange-700">Chromatic Analysis</strong>
              <p className="text-xs text-orange-600 mt-1">
                Required for secondary dominants, borrowed chords, and advanced harmonic techniques
              </p>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 mt-4">
            <strong>Progressive Learning:</strong> Start with functional analysis, then add modal and chromatic perspectives as needed
          </div>
        </CardContent>
      </Card>
    </div>
  );
};