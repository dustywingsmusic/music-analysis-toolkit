# Shared Scale Tables Service API Documentation

This document describes the `SharedScaleTablesService` API, designed to provide unified scale table functionality across different contexts: main app, Analysis Widget, and future Chrome plugin.

## Table of Contents
- [Overview](#overview)
- [Core Service](#core-service)
- [Cross-Navigation](#cross-navigation)
- [MIDI Integration](#midi-integration)
- [Plugin Architecture](#plugin-architecture)
- [Usage Examples](#usage-examples)

## Overview

The `SharedScaleTablesService` is the central service for all scale table operations. It provides:

- **Scale Data Management**: Unified access to processed scale data
- **Filtering & Search**: Advanced filtering capabilities for scale discovery
- **Cross-Navigation**: Navigate from analysis results to scale tables
- **MIDI Integration**: Real-time scale highlighting from MIDI input
- **Plugin Support**: Lightweight configuration for Chrome plugin use

## Core Service

### Creating a Service Instance

```typescript
import { SharedScaleTablesService } from '../services/SharedScaleTablesService';

// Main app configuration
const service = new SharedScaleTablesService({
  enableMidi: true,
  enableSearch: true,
  enableFiltering: true,
  enableCrossNavigation: true,
  maxVisibleScales: 1000,
  pluginMode: false
});

// Use default shared instance
import { sharedScaleTablesService } from '../services/SharedScaleTablesService';
```

### Configuration Options

```typescript
interface SharedScaleTableConfig {
  enableMidi?: boolean;          // Enable MIDI highlighting
  enableSearch?: boolean;        // Enable search functionality
  enableFiltering?: boolean;     // Enable scale filtering
  enableCrossNavigation?: boolean; // Enable cross-tab navigation
  maxVisibleScales?: number;     // Performance limit
  defaultFilter?: ScaleTableFilter; // Default filter settings
  pluginMode?: boolean;          // Optimize for Chrome plugin
}
```

### Core Methods

#### Getting Scales

```typescript
// Get all scales with optional filtering
const scales = service.getFilteredScales({
  searchQuery: 'dorian',
  rootNote: 'C',
  scaleFamily: 'Major Scale',
  playedPitchClasses: new Set([0, 2, 4, 5, 7, 9, 11])
});

// Find specific scales
const scale = service.findScaleById('major-scale-modes-0-1');
const dorianScales = service.findScalesByMode('Dorian');
const cScales = service.findScalesByRoot('C');
```

#### Available Data

```typescript
// Get available options for filters
const families = service.getAvailableScaleFamilies();
// Returns: ['Major Scale', 'Melodic Minor', 'Harmonic Minor', ...]

const roots = service.getAvailableRootNotes();
// Returns: ['C', 'C♯', 'D', 'D♯', ...]
```

## Cross-Navigation

### Navigation from Analysis Results

```typescript
import { scaleTableNavigation } from '../services/SharedScaleTablesService';

// Navigate to scale tables from modal analysis
const highlight = scaleTableNavigation.viewModalInTables(
  'G Mixolydian',
  (mode, tonic) => {
    // Callback when navigation completes
    console.log(`Navigating to ${tonic} ${mode}`);
  }
);

// Direct navigation with mode and tonic
const highlight2 = scaleTableNavigation.viewInTables(
  'Mixolydian',
  'G',
  (highlightId) => {
    // Callback with highlight ID
    console.log(`Highlighted: ${highlightId}`);
  }
);
```

### Cross-Navigation Context

```typescript
interface CrossNavigationContext {
  sourceTab: 'harmony' | 'modal' | 'discovery' | 'external';
  targetMode?: string;
  targetTonic?: string;
  highlightId?: string;
  analysisData?: any;
}

// Use context for advanced navigation
const context: CrossNavigationContext = {
  sourceTab: 'harmony',
  targetMode: 'Mixolydian',
  targetTonic: 'G'
};

const highlight = service.navigateFromAnalysis(context);
```

## Highlighting System

### Scale Highlights

```typescript
interface ScaleHighlight {
  cellId: string;                    // Scale table cell ID
  reason: 'navigation' | 'midi' | 'analysis' | 'search';
  temporary?: boolean;               // Auto-clear after duration
  duration?: number;                 // Duration in milliseconds
}

// Set a highlight
service.setHighlight({
  cellId: 'major-scale-modes-0-4',
  reason: 'analysis',
  temporary: true,
  duration: 5000
});

// Clear highlights
service.clearHighlight('major-scale-modes-0-4');  // Clear specific
service.clearAllHighlights();                     // Clear all
```

### Navigation Interface

```typescript
interface ScaleTableNavigation {
  highlightScale: (highlight: ScaleHighlight) => void;
  clearHighlights: () => void;
  scrollToScale: (scaleId: string) => void;
  setFilter: (filter: ScaleTableFilter) => void;
  getVisibleScales: () => ProcessedScale[];
}

// Create navigation interface for UI components
const navigation = service.createNavigation();
```

## MIDI Integration

### MIDI Scale Suggestions

```typescript
// Get scale suggestions from MIDI input
const playedNotes = new Set([0, 2, 4, 5, 7, 9, 11]); // C major scale
const suggestions = service.getMidiScaleSuggestions(playedNotes);

// Results include matching scales ordered by relevance
suggestions.forEach(scale => {
  console.log(`${scale.rootNoteName} ${scale.name}`);
  // "C Ionian", "D Dorian", "E Phrygian", etc.
});
```

### MIDI Integration Example

```typescript
// In a React component with MIDI
useEffect(() => {
  if (midiData?.playedPitchClasses?.size > 0) {
    const suggestions = sharedScaleTablesService.getMidiScaleSuggestions(
      midiData.playedPitchClasses
    );

    if (suggestions.length > 0) {
      const bestMatch = suggestions[0];
      sharedScaleTablesService.setHighlight({
        cellId: bestMatch.id,
        reason: 'midi',
        temporary: true,
        duration: 5000
      });
    }
  }
}, [midiData?.playedPitchClasses]);
```

## Filtering System

### Filter Options

```typescript
interface ScaleTableFilter {
  searchQuery?: string;           // Text search in scale names/formulas
  rootNote?: string;              // Filter by root note
  scaleFamily?: string;           // Filter by scale family
  modeIndex?: number;             // Filter by mode index
  showOnlyMatches?: boolean;      // Show only MIDI matches
  playedPitchClasses?: Set<number>; // MIDI pitch classes for matching
}

// Apply complex filters
const filteredScales = service.getFilteredScales({
  scaleFamily: 'Major Scale',
  rootNote: 'C',
  showOnlyMatches: true,
  playedPitchClasses: new Set([0, 2, 4, 5, 7, 9, 11])
});
```

## Plugin Architecture

### Plugin-Optimized Instance

```typescript
// Create lightweight instance for Chrome plugin
const pluginService = SharedScaleTablesService.createPluginInstance({
  scales: exportedScales,
  families: exportedFamilies,
  rootNotes: exportedRoots,
  config: {
    pluginMode: true,
    maxVisibleScale: 100,
    enableMidi: false
  }
});
```

### Export for Plugin

```typescript
// Export data for plugin packaging
const exportData = service.exportForPlugin();
// Returns: { scales, families, rootNotes, config }

// This data can be bundled with the Chrome plugin
// for offline scale table functionality
```

### Plugin Configuration

```typescript
// Optimized configuration for Chrome plugin
const pluginConfig: SharedScaleTableConfig = {
  pluginMode: true,
  maxVisibleScales: 100,     // Limit for performance
  enableMidi: false,         // No MIDI in plugin context
  enableSearch: true,        // Keep search functionality
  enableFiltering: true,     // Keep filtering
  enableCrossNavigation: false // No cross-tab navigation in plugin
};
```

## Usage Examples

### React Component Integration

```typescript
import React, { useState, useEffect } from 'react';
import { sharedScaleTablesService, scaleTableNavigation } from '../services/SharedScaleTablesService';

const ScaleTableComponent: React.FC = () => {
  const [scales, setScales] = useState([]);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    const filteredScales = sharedScaleTablesService.getFilteredScales(filter);
    setScales(filteredScales);
  }, [filter]);

  const handleViewInTables = (mode: string, tonic: string) => {
    scaleTableNavigation.viewInTables(mode, tonic, (highlightId) => {
      // Handle navigation complete
      console.log(`Highlighted: ${highlightId}`);
    });
  };

  return (
    <div>
      {/* Scale table UI */}
    </div>
  );
};
```

### Analysis Result Integration

```typescript
// In DualLensAnalysisPanel
const handleViewInTables = () => {
  scaleTableNavigation.viewModalInTables(
    enhanced.modeName,  // "G Mixolydian"
    onViewInTables      // Callback from props
  );
};

// Button text generation
const linkText = scaleTableNavigation.generateViewInTablesText(
  enhanced.modeName
);
// Returns: "View G Mixolydian in Scale Tables →"
```

### Search and Filter Example

```typescript
const searchScales = (query: string) => {
  const results = sharedScaleTablesService.getFilteredScales({
    searchQuery: query,
    maxResults: 20
  });

  return results.map(scale => ({
    id: scale.id,
    display: `${scale.rootNoteName} ${scale.name}`,
    formula: scale.formula,
    family: scale.scaleFamily
  }));
};

// Usage
const dorianResults = searchScales('dorian');
const cResults = searchScales('C');
const majorResults = searchScales('major');
```

## Benefits for Week 2 Analysis Widget

The shared service architecture provides several advantages for the upcoming Analysis Widget development:

1. **Reusable Logic**: Scale table functionality is already extracted and tested
2. **Cross-Navigation Ready**: Built-in support for navigating between widget and main app
3. **Performance Optimized**: Plugin mode reduces memory footprint
4. **Consistent API**: Same interface across main app and widget
5. **MIDI Integration**: Ready for widget MIDI features

## Migration Notes

Components using scale table functionality should be updated to use the shared service:

1. **ReferenceTab**: ✅ Updated to use `sharedScaleTablesService`
2. **ScaleFinder**: ✅ Updated to use shared service for scale processing
3. **DualLensAnalysisPanel**: ✅ Updated to use `scaleTableNavigation` utilities

This completes the Week 1 foundation and provides a solid base for Week 2 Analysis Widget development.
