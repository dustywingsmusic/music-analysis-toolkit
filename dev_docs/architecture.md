# Music Theory Toolkit - System Architecture

> **📋 Documentation Flow**: [Use Cases](./design_use_cases.md) → [Requirements](./design_requirements.md) → [Architecture](./architecture.md) → [Implementation](./implementation.md) → [Analysis Results Panel](./analysis_results_panel.md)
> 
> **📚 Navigation**: See [dev_docs README](./README.md) for complete documentation guide

## Overview

The Music Theory Toolkit is a **client-side single-page application (SPA)** built with React and TypeScript. It provides interactive tools for music theory analysis, scale discovery, and chord progression analysis. The application follows a modern frontend architecture with external API integrations and no traditional backend server.

> **🔗 Related Documents**: 
> - **User Requirements**: See [design requirements](./design_requirements.md) for the UI/UX specifications driving this architecture
> - **User Workflows**: See [use cases](./design_use_cases.md) for the 28 user questions this architecture supports
> - **Implementation Status**: See [implementation](./implementation.md) for current development progress (95% complete)

## Architecture Type: Client-Side SPA with External Services

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                             │
├─────────────────────────────────────────────────────────────────┤
│  React Application (TypeScript + Vite + Tailwind CSS)          │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   UI Layer      │  │  Service Layer  │  │   Data Layer    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Components    │  │ • geminiService │  │ • Constants     │ │
│  │ • Navigation    │  │ • chordLogic    │  │ • Types         │ │
│  │ • Styling       │  │ • keySuggester  │  │ • State         │ │
│  │ • Hooks         │  │ • preferences   │  │ • Local Storage │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Google Gemini  │  │   Web MIDI API  │  │  Static Hosting │ │
│  │      AI         │  │                 │  │                 │ │
│  │                 │  │ • MIDI Input    │  │ • CDN Assets    │ │
│  │ • Music Analysis│  │ • Device Access │  │ • Build Output  │ │
│  │ • AI Responses  │  │ • Real-time     │  │ • Static Files  │ │
│  │ • JSON API      │  │   Note Detection│  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Client-Side Architecture

### 1. Technology Stack

#### Core Framework
- **React 19.1.0** - UI framework with modern hooks and concurrent features
- **TypeScript 5.7.2** - Type safety and enhanced developer experience
- **Vite 6.2.0** - Fast build tool and development server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern component library built on Radix UI primitives
  - **Radix UI** - Accessible, unstyled UI primitives
  - **class-variance-authority** - Component variant management
  - **tailwind-merge** - Intelligent Tailwind class merging

#### External Integrations
- **@google/genai 1.7.0** - Google Generative AI for music analysis
- **Web MIDI API** - Browser-native MIDI device access
- **PostCSS + Autoprefixer** - CSS processing and vendor prefixes

### 2. Application Structure

```
src/
├── components/           # React UI Components
│   ├── ui/              # shadcn/ui Component Library
│   │   ├── button.tsx      # shadcn/ui Button component
│   │   ├── input.tsx       # shadcn/ui Input component
│   │   ├── label.tsx       # shadcn/ui Label component
│   │   ├── card.tsx        # shadcn/ui Card component
│   │   ├── tabs.tsx        # shadcn/ui Tabs component
│   │   ├── select.tsx      # shadcn/ui Select component
│   │   ├── textarea.tsx    # shadcn/ui Textarea component
│   │   ├── sheet.tsx       # shadcn/ui Sheet component
│   │   ├── dialog.tsx      # shadcn/ui Dialog component
│   │   └── [other ui components]
│   ├── reference/       # NEW: Enhanced Reference Components
│   │   ├── ScaleGrid.tsx           # Unified grid display for scales/modes
│   │   ├── InteractiveScaleTable.tsx # Enhanced scale table with MIDI
│   │   ├── ModeRelationshipVisualizer.tsx # Visual mode relationships
│   │   ├── ScaleComparator.tsx     # Side-by-side mode comparison
│   │   ├── LiveScaleBuilder.tsx    # Real-time scale construction
│   │   ├── AnalysisResultsLinker.tsx # Analysis-to-reference integration
│   │   └── SmartReferencePanel.tsx # Context-aware reference panel
│   ├── NavigationTabs.tsx  # Uses shadcn/ui Tabs
│   ├── QuestionDrivenMusicTool.tsx
│   ├── ModeIdentificationTab.tsx  # Uses shadcn/ui Button
│   ├── ModeDiscoveryTab.tsx       # Uses shadcn/ui Button
│   ├── HarmonyTab.tsx             # Uses shadcn/ui Button, Input, Label
│   ├── ReferenceTab.tsx
│   ├── ScaleFinder.tsx
│   ├── ChordAnalyzer.tsx
│   └── [utility components]
├── lib/                 # shadcn/ui Utilities
│   └── utils.ts            # Utility functions for component styling
├── services/            # Business Logic & External APIs
│   ├── geminiService.ts    # AI analysis integration
│   ├── scaleDataService.ts # NEW: Direct scale data computation service
│   ├── chordLogic.ts       # Chord analysis algorithms
│   ├── keySuggester.ts     # Key/mode suggestion engine
│   ├── preferences.ts      # User settings management
│   └── peachnoteService.ts # Additional music services
├── hooks/               # React Custom Hooks
│   └── useMidi.ts          # MIDI device integration
├── constants/           # Static Data
│   ├── scales.ts           # Scale definitions and data
│   └── keys.ts             # Key signatures and mappings
├── types.ts            # TypeScript type definitions
├── main.css            # Global styles and Tailwind config
└── App.tsx             # Root application component
```

### 3. Component Architecture

#### Question-Driven Design Pattern
The application follows a **question-driven navigation pattern** where users start with what they want to know:

```typescript
// Main Navigation Structure
type TabType = 'identify' | 'discover' | 'harmony' | 'reference';

// Each tab addresses specific user questions:
// - "What mode is this?" → Mode Identification
// - "What modes can I build?" → Mode Discovery  
// - "What chords work together?" → Chords & Harmony
// - "Show me scale references" → Reference Tables
```

#### Component Hierarchy
```
App
└── QuestionDrivenMusicTool
    ├── NavigationTabs (shadcn/ui Tabs)
    ├── ModeIdentificationTab
    │   ├── Method Selector (melody/scale/progression/audio)
    │   ├── Input Panels (context-sensitive)
    │   └── Analysis Actions (shadcn/ui Button)
    ├── ModeDiscoveryTab
    │   ├── Discovery Methods (root/notes/compare/explore)
    │   ├── Note Selectors
    │   └── Comparison Tools (shadcn/ui Button)
    ├── HarmonyTab
    │   ├── Harmony Methods (analyze/generate/substitute/progression)
    │   ├── Chord Input Systems (shadcn/ui Input, Label)
    │   └── Progression Builder (shadcn/ui Button)
    ├── ReferenceTab
    │   ├── Search & Filter Controls
    │   ├── Quick Reference Cards
    │   └── Embedded ScaleFinder
    └── Results Panel (unified display system)
        ├── Results Display Component
        ├── Results History Manager
        ├── Display Position Controller
        └── Cross-Tab State Manager
```

#### UI Design System Integration

**shadcn/ui Component Library**:
The application uses shadcn/ui as its primary component library, providing:

- **Consistent Design Language**: All UI components follow the same design principles
- **Accessibility**: Built-in ARIA attributes and keyboard navigation support
- **Dark Theme Support**: Integrated with the existing dark theme (slate-900 background, cyan accents)
- **TypeScript Integration**: Full type safety for component props and variants
- **Customizable**: Components can be extended with custom variants for music-specific use cases

**Theme Configuration**:
```css
/* CSS Variables for Dark Theme */
:root {
  --background: 222.2 84% 4.9%;     /* slate-900 equivalent */
  --foreground: 210 40% 98%;        /* slate-50 equivalent */
  --primary: 188 100% 42%;          /* cyan-600 equivalent */
  --secondary: 215 27.9% 16.9%;     /* slate-700 equivalent */
  --border: 215 27.9% 16.9%;
  --input: 215 27.9% 16.9%;
  --ring: 188 100% 42%;
  --radius: 0.75rem;
}
```

**Migration Strategy**:
- **Phase 1** (Complete): Core components (Button, Input, Label, Tabs)
- **Phase 2** (Planned): Remaining form components, custom music variants
- **Phase 3** (Planned): Advanced components (Sheet, Dialog for results panel)

### 4. Service Layer Architecture

#### Core Services

**geminiService.ts** - AI Analysis Engine
```typescript
// Handles communication with Google Generative AI
export const analyzeMusic = async (
  tonic: string,
  analysisTarget: { chord?: string; notes?: readonly string[] }
): Promise<AnalysisResponsePayload>
```

**chordLogic.ts** - Chord Analysis
```typescript
// Local chord analysis and matching algorithms
export const findChordMatches = (noteNumbers: number[]): ChordMatch[]
```

**keySuggester.ts** - Key/Mode Suggestions
```typescript
// Intelligent key and mode suggestion system
export function updateMelodySuggestions(pitchClasses: Set<number>): void
export function updateChordSuggestions(chords: ChordMatch[], baseKey: string, keyMode: 'major' | 'minor'): void
```

**scaleDataService.ts** - Direct Scale Data Computation (NEW)
```typescript
// Direct computation using existing scale data instead of AI
export interface ModeFromRoot {
  id: string;
  name: string;
  commonName?: string;
  formula: string;
  intervals: number[];
  notes: string[];
  tableId: string;
  modeIndex: number;
  parentScaleName: string;
  parentScaleRootNote: string;
  character?: string;
}

export const buildModesFromRoot = (rootNote: string): ModeFromRoot[]
export const getCharacterDescription = (scaleName: string, modeIndex: number): string
```

### 5. Enhanced Reference Components Architecture

#### Reference Components System

The application implements a sophisticated reference system with reusable components that integrate seamlessly across all tabs, transforming the reference system from a static lookup tool into a dynamic, intelligent companion.

**Core Reference Components**:

**ScaleGrid Component** (`src/components/reference/ScaleGrid.tsx`):
```typescript
interface ScaleGridProps {
  modes: ModeFromRoot[];
  onModeSelect?: (mode: ModeFromRoot) => void;
  highlightedModeId?: string;
  compact?: boolean;
  showCharacteristics?: boolean;
  enableFiltering?: boolean;
  interactionMode?: 'select' | 'preview' | 'compare';
}
```
- Unified grid display for scales and modes with interactive capabilities
- Real-time filtering and search functionality
- Hover previews with audio playback
- Comparison mode for side-by-side analysis
- Responsive grid layout with card-based design

**InteractiveScaleTable Component** (`src/components/reference/InteractiveScaleTable.tsx`):
```typescript
interface InteractiveScaleTableProps {
  mode: ModeFromRoot;
  onNotePlay?: (note: string) => void;
  showMidiControls?: boolean;
  highlightNotes?: string[];
  comparisonMode?: boolean;
  parentMode?: ModeFromRoot;
}
```
- Enhanced scale table with real-time interaction capabilities
- Live MIDI integration with note highlighting
- Comparison overlays and formula visualization
- Parent scale relationship display

**ModeRelationshipVisualizer Component**:
- Interactive circle of fifths display
- Mode family trees and interval relationship mapping
- Animated transitions between modes
- Visual representation of mode relationships

**ScaleComparator Component**:
- Side-by-side comparison of multiple scales/modes
- Difference highlighting and common note identification
- Chord progression compatibility analysis

**LiveScaleBuilder Component**:
- Real-time scale construction and exploration
- Interactive note selection with MIDI input integration
- Real-time mode matching and visual feedback

**AnalysisResultsLinker Component**:
- Seamless integration between analysis results and reference materials
- Automatic reference highlighting from analysis results
- One-click navigation to relevant reference sections
- Context-aware suggestions and cross-tab state synchronization

**SmartReferencePanel Component**:
- Context-aware reference panel that adapts to current analysis
- Auto-updating based on current analysis context
- Related concept suggestions and adaptive positioning

#### Enhanced Interaction Patterns

**Cross-Tab State Synchronization**:
```typescript
interface ReferenceIntegrationState {
  activeHighlights: Set<string>;
  comparisonQueue: ModeFromRoot[];
  contextHistory: ReferenceContext[];
  liveUpdatesEnabled: boolean;
  crossTabSync: boolean;
}

const useReferenceIntegration = () => {
  const [state, setState] = useState<ReferenceIntegrationState>();

  const addToComparison = (mode: ModeFromRoot) => {
    setState(prev => ({
      ...prev,
      comparisonQueue: [...prev.comparisonQueue, mode]
    }));
  };

  const syncAcrossTabs = (context: ReferenceContext) => {
    broadcastReferenceUpdate(context);
  };

  return { state, addToComparison, syncAcrossTabs };
};
```

**Smart Context Awareness**:
```typescript
const generateSmartSuggestions = (
  currentTab: TabType,
  userInput: any,
  analysisHistory: AnalysisHistoryItem[]
) => {
  const suggestions: ReferenceSuggestion[] = [];

  switch (currentTab) {
    case 'identify':
      suggestions.push(...getMatchingScaleSuggestions(userInput));
      break;
    case 'discover':
      suggestions.push(...getRelatedModeSuggestions(userInput));
      break;
    case 'harmony':
      suggestions.push(...getHarmonicScaleSuggestions(userInput));
      break;
  }

  return suggestions;
};
```

#### Component Reusability Matrix

| Component | Identify Tab | Discovery Tab | Harmony Tab | Reference Tab |
|-----------|--------------|---------------|-------------|---------------|
| ScaleGrid | ✅ Results display | ✅ Primary interface | ✅ Scale suggestions | ✅ Main grid |
| InteractiveScaleTable | ✅ Detailed view | ✅ Mode exploration | ✅ Chord analysis | ✅ Full tables |
| ModeRelationshipVisualizer | ✅ Alternate modes | ✅ Mode families | ✅ Harmonic relationships | ✅ Navigation aid |
| ScaleComparator | ✅ Analysis alternatives | ✅ Mode comparison | ✅ Scale compatibility | ✅ Reference tool |
| LiveScaleBuilder | ❌ | ✅ Note selection | ✅ Chord building | ✅ Interactive tool |
| AnalysisResultsLinker | ✅ Core integration | ✅ Discovery links | ✅ Harmony links | ✅ Bidirectional |
| SmartReferencePanel | ✅ Live suggestions | ✅ Context help | ✅ Scale recommendations | ✅ Enhanced navigation |

**useMidi.ts** - MIDI Integration Hook
```typescript
// React hook for MIDI device management
export const useMidi = (
  onChordDetected: (noteNumbers: number[]) => void,
  onMelodyUpdate: (pitchClasses: Set<number>) => void
)
```

### 5. Data Flow Architecture

#### State Management Pattern
- **Local Component State** - React useState for UI state
- **Context-Free Services** - Stateless service functions
- **Local Storage** - User preferences and settings
- **External API State** - Async data from Gemini AI

#### Data Flow Diagram
```
User Input → Component State → Service Layer → External APIs
    ↓              ↓              ↓              ↓
UI Updates ← State Updates ← Processing ← API Responses
```

#### Example: Mode Identification Flow
```
1. User enters melody notes in ModeIdentificationTab
2. Component validates and formats input
3. handleAnalysisRequest() called with method and data
4. Service layer processes request (geminiService or local analysis)
5. Results returned and displayed in Unified Results Panel
6. Results automatically saved to history with timestamp
7. Cross-references available to navigate to Reference tab
8. Results panel remains accessible across all tabs
```

### 6. Unified Results Display Architecture

#### Results Display System
The unified results display implements a sophisticated state management system that provides persistent, cross-tab access to analysis results with comprehensive history tracking.

> **🎛️ Enhanced Implementation**: See [analysis_results_panel.md](./analysis_results_panel.md) for detailed requirements and implementation guide for the enhanced dismissible companion panel that builds upon this architecture.

**Core Components**:

```typescript
// Results Display State Management
interface ResultsDisplayState {
  currentResults: AnalysisResult | null;
  resultsHistory: HistoryEntry[];
  displayPosition: DisplayPosition;
  isVisible: boolean;
  isPinned: boolean;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  summary: string;
  analysisType: 'melody' | 'scale' | 'progression' | 'chord';
  results: AnalysisResult;
  inputData: any;
}

interface DisplayPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  isDocked: boolean;
  dockPosition: 'left' | 'right' | 'bottom' | 'floating';
}
```

#### State Management Architecture

**Results Persistence**:
- **Browser State**: Results remain in component state until new analysis
- **Local Storage**: History entries persisted across browser sessions
- **Cross-Tab Sync**: Results accessible from any navigation tab
- **State Restoration**: Previous analysis can be restored from history

**History Management**:
```typescript
// History Service Architecture
class ResultsHistoryManager {
  private history: HistoryEntry[] = [];

  addEntry(results: AnalysisResult, inputData: any): void;
  getHistory(): HistoryEntry[];
  restoreFromHistory(entryId: string): AnalysisResult;
  clearHistory(): void;
  exportHistory(): string;
}
```

#### Display Position System

**Adjustable Display**:
- **Floating Mode**: Draggable window that can be positioned anywhere
- **Docked Mode**: Attached to screen edges (left, right, bottom)
- **Responsive Behavior**: Adapts to screen size and orientation
- **Persistence**: Display preferences saved to local storage

**Cross-Tab Visibility**:
```typescript
// Display Controller Architecture
class DisplayPositionController {
  private position: DisplayPosition;

  setPosition(x: number, y: number): void;
  dock(position: 'left' | 'right' | 'bottom'): void;
  undock(): void;
  toggleVisibility(): void;
  ensureVisible(): void; // Called when new results arrive
}
```

#### Access Control System

**Display Access Methods**:
- **Automatic Opening**: Panel opens automatically when new analysis completes
- **Manual Access**: Always-visible icon/button for manual opening
- **Keyboard Shortcuts**: Quick access via keyboard (e.g., Ctrl+R)
- **Cross-Tab Navigation**: Results remain accessible when switching tabs

**Integration Points**:
```typescript
// Results Panel Integration
interface ResultsPanelProps {
  results: AnalysisResult | null;
  history: HistoryEntry[];
  onHistorySelect: (entryId: string) => void;
  onPositionChange: (position: DisplayPosition) => void;
  onClose: () => void;
  isVisible: boolean;
}
```

## External Services & APIs

### 1. Google Generative AI (Gemini)

**Purpose**: Advanced music theory analysis and natural language responses

**Integration**:
```typescript
// Configuration
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Usage Pattern
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-preview-04-17",
  contents: userPrompt,
  config: {
    systemInstruction: coreAnalysisSystemInstruction,
    responseMimeType: "application/json",
    temperature: 0.1,
  },
});
```

**Data Flow**:
- Input: Musical context (chords, notes, progressions)
- Processing: AI analysis with structured prompts
- Output: JSON responses with mode analysis, alternatives, and explanations

### 2. Web MIDI API

**Purpose**: Real-time MIDI device input for interactive music analysis

**Integration**:
```typescript
// Browser-native API access
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

// Real-time note detection
const handleMIDIMessage = (message: MIDIMessageEvent) => {
  // Process MIDI note on/off events
  // Update played notes state
  // Trigger analysis callbacks
};
```

**Capabilities**:
- MIDI device detection and selection
- Real-time note input and chord detection
- Integration with scale tables and analysis tools

### 3. Static Asset Delivery

**CDN Resources** (loaded via index.html):
```html
<!-- External Libraries -->
<script src="https://cdn.jsdelivr.net/npm/webmidi@next/dist/iife/webmidi.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6.2.3/dist/abcjs-basic-min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
```

## Deployment Architecture

### Build Process
```bash
# Development
npm run dev          # Vite dev server with HMR

# Production Build
npm run build        # TypeScript compilation + Vite bundling
npm run preview      # Preview production build locally
```

### Build Output
```
dist/
├── index.html       # Entry point with CDN links
├── assets/
│   ├── index-[hash].js    # Bundled application code
│   ├── index-[hash].css   # Compiled styles
│   └── [other assets]
└── [static files]
```

### Hosting Requirements

**Static Hosting Compatible**:
- ✅ Netlify, Vercel, GitHub Pages
- ✅ AWS S3 + CloudFront
- ✅ Any static file server

**Environment Variables**:
```bash
GEMINI_API_KEY=your_google_ai_api_key
```

**Browser Requirements**:
- Modern browsers with ES2020+ support
- Web MIDI API support (Chrome, Edge, Opera)
- Local Storage support

## Security Considerations

### Client-Side Security
- **API Key Management**: Environment variables for Gemini API
- **CORS Handling**: Configured for external API access
- **Input Validation**: Client-side validation for all user inputs
- **XSS Prevention**: React's built-in XSS protection

### Data Privacy
- **No Server Storage**: All data processing happens client-side
- **Local Storage Only**: User preferences stored locally
- **External API Calls**: Only to Google AI for analysis (user-initiated)

## Performance Characteristics

### Bundle Size Optimization
- **Code Splitting**: Vite automatic chunking
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: CSS/JS minification

### Runtime Performance
- **React 19**: Concurrent features and optimizations
- **Local Processing**: Most analysis happens client-side
- **Lazy Loading**: Components loaded on demand
- **MIDI Real-time**: Low-latency note processing

### Scalability Considerations
- **Stateless Design**: No server-side state to scale
- **CDN Distribution**: Static assets globally distributed
- **Client Processing**: Scales with user devices
- **API Rate Limits**: Managed through client-side throttling

## Development & Maintenance

### Development Workflow
```bash
# Local development
npm run dev

# Type checking
npx tsc --noEmit

# Build verification
npm run build

# Component testing
node test_new_components.js
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Component Testing**: Verification scripts

### Monitoring & Debugging
- **Browser DevTools**: React DevTools integration
- **Console Logging**: Structured logging for services
- **Error Boundaries**: React error handling
- **Performance Profiling**: React Profiler integration

---

## Summary

The Music Theory Toolkit employs a **modern client-side architecture** that maximizes performance, maintainability, and user experience while minimizing infrastructure complexity. The application leverages external APIs for advanced functionality while maintaining fast, responsive local processing for core music theory operations.

**Key Architectural Strengths**:
- ✅ **Zero Server Maintenance** - Pure client-side deployment
- ✅ **Real-time Interaction** - MIDI integration and instant feedback
- ✅ **AI-Enhanced Analysis** - Google Gemini integration for advanced insights
- ✅ **Responsive Design** - Works across desktop and mobile devices
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Modern Tooling** - Vite, React 19, Tailwind CSS

This architecture supports the application's goal of providing an intuitive, question-driven interface for music theory exploration while maintaining excellent performance and developer experience.
