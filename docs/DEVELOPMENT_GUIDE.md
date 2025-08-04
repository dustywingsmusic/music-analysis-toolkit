# Music Theory Toolkit - Development Guide

> **📋 Consolidated Documentation**: This document consolidates styling guidelines, development practices, and specialized implementation guides into a single comprehensive reference.

## Table of Contents

1. [Overview](#overview)
2. [Development Environment](#development-environment)
3. [Styling System](#styling-system)
4. [Component Development](#component-development)
5. [Specialized Implementation Guides](#specialized-implementation-guides)
6. [Best Practices](#best-practices)
7. [AI Development Tips](#ai-development-tips)

## Overview

This guide provides comprehensive instructions for developing and styling the Music Theory Toolkit application. It covers the shadcn/ui component system, theme customization, and specialized implementation patterns.

### Technology Stack
- **React 19.1.0** with TypeScript 5.7.2
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS 3.4.17** for utility-first styling
- **class-variance-authority (cva)** for component variants
- **tailwind-merge** for intelligent class merging

### 🚨 Critical Development Priority
**Music Theory Integration Implementation**: Based on comprehensive music theory validation, the current architecture requires significant updates to improve theoretical accuracy and reduce AI over-reliance. Developers should prioritize the [Music Theory Integration Roadmap](MUSIC_THEORY_INTEGRATION_ROADMAP.md) phases over other feature development.

## Development Environment

### Project Structure
```
src/
├── components/ui/          # shadcn/ui components
├── lib/utils.ts           # Utility functions (cn helper)
├── main.css              # Global styles & CSS variables
└── components/           # App-specific components
```

### Development Commands
```bash
# Frontend development server (Vite)
npm run dev

# Backend development server (Express.js)
npm run dev:server

# Build for production
npm run build

# Preview production build
npm run preview

# Production server (after build)
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Setup

#### Environment Variables

The application uses environment variables for configuration. Create the appropriate `.env` file for your environment:

**For Local Development (`.env.local`):**
```bash
# Required for Gemini AI integration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Enable Cloud Logging in development
# GOOGLE_CLOUD_PROJECT=your-project-id
```

**For Production (`.env.prod`):**
```bash
# Required for Gemini AI integration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Required for Cloud Logging in production
PROJECT_ID=your-project-id
```

#### Development Workflow

1. **Frontend Development:**
   ```bash
   # Start the Vite development server (port 5173)
   npm run dev
   ```

2. **Full-Stack Development:**
   ```bash
   # Terminal 1: Start the backend server (port 8080)
   npm run dev:server

   # Terminal 2: Start the frontend development server (port 5173)
   npm run dev
   ```

3. **API Proxy Configuration:**
   The Vite development server is configured to proxy API requests to the backend server:
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8080',
         changeOrigin: true,
         secure: false
       }
     }
   }
   ```

#### Logging System

The application implements a sophisticated logging system with conditional Cloud Logging integration:

**Development Environment:**
- Logs are output to console for debugging
- Cloud Logging is disabled by default (no credentials required)
- Can be enabled by setting `GOOGLE_CLOUD_PROJECT` environment variable

**Production Environment:**
- Automatic Cloud Logging integration with service account authentication
- Enhanced metadata collection (client IP, user agent, session tracking)
- Structured logging with proper resource labeling

**Usage Example:**
```typescript
import { logger } from '@/utils/logger';

// Log user interactions
logger.webClick('Scale analysis button clicked', {
  scale: 'C Major',
  mode: 'Ionian'
});

// Log API requests
logger.geminiRequest('Mode analysis request', {
  notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  requestId: 'req_123'
});

// Log errors
logger.error('Analysis failed', {
  error: error.message,
  context: 'mode_identification'
});
```

## Styling System

### shadcn/ui Component System

The project uses **shadcn/ui** as its primary component library, providing:
- **Radix UI** primitives for accessibility
- **Tailwind CSS** for utility-first styling
- **class-variance-authority (cva)** for component variants
- **tailwind-merge** for intelligent class merging

#### Available Components

**Form Components:**
- `Button` - Primary interaction element
- `Input` - Text input fields
- `Label` - Form labels with accessibility
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Switch` - Toggle switches
- `Checkbox` - Checkbox inputs

**Layout Components:**
- `Card` - Content containers
- `Tabs` - Navigation tabs
- `Sheet` - Slide-out panels
- `Dialog` - Modal dialogs
- `Separator` - Visual dividers

**Display Components:**
- `Table` - Data tables
- `Badge` - Status indicators
- `Tooltip` - Contextual help
- `Popover` - Floating content

**Navigation Components:**
- `Command` - Command palette
- `Dropdown Menu` - Context menus
- `Scroll Area` - Custom scrollbars

### Theme Customization

#### CSS Variables System

The app uses CSS variables for consistent theming. Located in `src/main.css`:

```css
@layer base {
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
}
```

#### Music Theory Color Palette

```css
/* Music-specific color variables */
:root {
  --note-c: 0 100% 50%;      /* Red for C */
  --note-d: 30 100% 50%;     /* Orange for D */
  --note-e: 60 100% 50%;     /* Yellow for E */
  --note-f: 120 100% 50%;    /* Green for F */
  --note-g: 180 100% 50%;    /* Cyan for G */
  --note-a: 240 100% 50%;    /* Blue for A */
  --note-b: 300 100% 50%;    /* Magenta for B */

  --mode-major: 120 50% 60%;     /* Bright green for major modes */
  --mode-minor: 240 50% 60%;     /* Blue for minor modes */
  --mode-diminished: 0 50% 60%;  /* Red for diminished */
  --mode-exotic: 300 50% 60%;    /* Purple for exotic modes */
}
```

### Component Styling Patterns

#### Basic Usage Pattern

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function MyComponent() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="melody">Melody Notes</Label>
        <Input 
          id="melody"
          placeholder="C D E F G A B C"
          className="bg-slate-700 border-slate-600"
        />
      </div>
      <Button variant="default" size="lg">
        Analyze Mode
      </Button>
    </div>
  )
}
```

#### Creating Custom Variants

Using `class-variance-authority` for component variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const noteButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      note: {
        c: "bg-red-500 hover:bg-red-600 text-white",
        d: "bg-orange-500 hover:bg-orange-600 text-white",
        e: "bg-yellow-500 hover:bg-yellow-600 text-black",
        f: "bg-green-500 hover:bg-green-600 text-white",
        g: "bg-cyan-500 hover:bg-cyan-600 text-white",
        a: "bg-blue-500 hover:bg-blue-600 text-white",
        b: "bg-purple-500 hover:bg-purple-600 text-white",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      note: "c",
      size: "md",
    },
  }
)

interface NoteButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof noteButtonVariants> {
  note: 'c' | 'd' | 'e' | 'f' | 'g' | 'a' | 'b'
}

const NoteButton = React.forwardRef<HTMLButtonElement, NoteButtonProps>(
  ({ className, note, size, ...props }, ref) => {
    return (
      <button
        className={cn(noteButtonVariants({ note, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### Music-Specific Components

#### Scale Grid Component

```tsx
interface ScaleGridProps {
  scales: Scale[]
  onScaleSelect?: (scale: Scale) => void
  compact?: boolean
  showDeeperAnalysis?: boolean
}

const ScaleGrid: React.FC<ScaleGridProps> = ({
  scales,
  onScaleSelect,
  compact = false,
  showDeeperAnalysis = false
}) => {
  return (
    <div className={cn(
      "grid gap-4",
      compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}>
      {scales.map((scale) => (
        <Card key={scale.id} className="p-4 hover:bg-slate-800 transition-colors">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{scale.name}</h3>
            <p className="text-sm text-slate-400">{scale.formula}</p>
            <div className="flex flex-wrap gap-1">
              {scale.notes.map((note, index) => (
                <Badge key={index} variant="secondary">
                  {note}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500">{scale.character}</p>
            {showDeeperAnalysis && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onScaleSelect?.(scale)}
              >
                Deeper Analysis
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
```

### Responsive Design

#### Breakpoint System

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

#### Responsive Patterns

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">

// Responsive visibility
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

## Component Development

### Component Structure Template

```tsx
import React from 'react'
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Define variants
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes",
      },
      size: {
        sm: "small-classes",
        md: "medium-classes",
        lg: "large-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Define props interface
interface ComponentProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

// Component implementation
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Component.displayName = "Component"

export { Component, componentVariants }
```

## Specialized Implementation Guides

### Analysis Results Panel Enhancement

#### Current Architecture
The application implements a sophisticated unified results display system with:
- **Unified Results State Management**: Complete state management with localStorage persistence, display positioning, and cross-tab persistence
- **Multiple Display Modes**: Sidebar, floating, and docked positioning options
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Cross-Tab Integration**: Results remain accessible across all navigation tabs

#### Enhanced Requirements

**Dismissible Companion Panel Architecture:**
```typescript
interface AnalysisState {
  analysisData: AnalysisResult | null;
  isAnalysisVisible: boolean;
  isAnalysisDismissed: boolean;
  autoShowResults: boolean;
}

const useAnalysis = () => ({
  setAnalysisData: (data: AnalysisResult) => void;
  clearAnalysis: () => void;
  showAnalysis: () => void;
  hideAnalysis: () => void;
  dismissAnalysis: () => void;
  toggleAnalysis: () => void;
});
```

**Enhanced Layout Integration:**
```tsx
// Enhanced layout with smooth transitions
<div className="question-driven-music-tool">
  <NavigationTabs />
  <div className="tool-content">
    <div className="main-panel">
      <div className={cn(
        "tab-content-wrapper transition-all duration-300",
        unifiedResults.isVisible ? 'tab-with-results' : ''
      )}>
        {renderTabContent()}
        <AnimatePresence>
          {unifiedResults.isVisible && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "unified-results-container",
                `unified-results-container--${unifiedResults.displayPosition.mode}`
              )}
            >
              {renderUnifiedResults()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
</div>
```

### Two-Stage Flow Implementation

#### Implementation Pattern
The "Build from Root" functionality uses a two-stage interaction flow:

**Stage 1: Immediate Results**
```tsx
const handleNoteClick = async (note: string) => {
  setSelectedNote(note);
  setInlineResults(null);
  setInlineResultsError(null);

  try {
    const modes = await scaleDataService.getModesFromRoot(note);
    setInlineResults(modes);
  } catch (error) {
    setInlineResultsError('Failed to load modes');
  }
};
```

**Stage 2: Deeper Analysis**
```tsx
const handleDeeperAnalysis = async (mode: ModeFromRoot) => {
  setLoadingModeId(mode.id);

  try {
    const analysisResults = await geminiService.analyzeMode(mode);
    showUnifiedResults(analysisResults);
  } catch (error) {
    console.error('Analysis failed:', error);
  } finally {
    setLoadingModeId(null);
  }
};
```

## Best Practices

### Code Organization

1. **Component Structure**
   - Keep components focused and single-purpose
   - Use TypeScript interfaces for props
   - Implement proper error boundaries
   - Follow React best practices for hooks

2. **Styling Guidelines**
   - Use Tailwind utility classes for styling
   - Create custom variants with `cva` for reusable patterns
   - Maintain consistent spacing and typography
   - Use CSS variables for theme customization

3. **State Management**
   - Use React hooks for local state
   - Implement proper error handling
   - Use TypeScript for type safety
   - Follow immutable update patterns

### Performance Optimization

1. **Bundle Optimization**
   - Use dynamic imports for code splitting
   - Optimize images and assets
   - Minimize bundle size with tree shaking
   - Use React.memo for expensive components

2. **Rendering Optimization**
   - Avoid unnecessary re-renders
   - Use useMemo and useCallback appropriately
   - Implement proper key props for lists
   - Optimize component update cycles

### Accessibility

1. **ARIA Support**
   - Use semantic HTML elements
   - Implement proper ARIA labels
   - Ensure keyboard navigation
   - Test with screen readers

2. **Visual Design**
   - Maintain sufficient color contrast
   - Provide focus indicators
   - Use consistent visual hierarchy
   - Support reduced motion preferences

## Music Theory Integration Implementation Guide

### Phase 1 Development Priorities (CRITICAL)

#### 1. Chord Progression Analysis Redesign
**Location**: `src/services/chordLogic.ts` and `src/components/HarmonyTab.tsx`

**Key Implementation Steps**:
```typescript
// Use existing chord templates instead of AI
import { chordTemplates } from '@/services/chordLogic';
import { detectModeFromChords } from '@/services/realTimeModeDetection';

// Replace AI analysis with local analysis
const analyzeProgressionLocally = (chords: string[]) => {
  const chordMatches = chords.map(chord => identifyChord(chord));
  const modalContext = detectModeFromNotes(getAllNotesFromChords(chordMatches));
  return { chords: chordMatches, modalContext, confidence: calculateConfidence(modalContext) };
};
```

#### 2. Shared Analysis Context Implementation
**Location**: New `src/contexts/AnalysisContext.tsx`

**Create unified state management**:
```typescript
interface UnifiedAnalysisContext {
  inputNotes: number[];
  inputType: 'melody' | 'chord_progression' | 'scale' | 'midi_realtime';
  localAnalysis: LocalAnalysisResult;
  referenceConnections: ReferenceConnection[];
}
```

#### 3. Cross-Feature Navigation Enhancement
**Location**: Extend existing "View in Tables" pattern in `IntegratedMusicSidebar.tsx`

**Apply to all analysis results**:
- Mode identification results → Reference tab with mode highlighted
- Chord analysis → Scale tables showing related modes
- MIDI input → Real-time reference updates

### Music Theory Accuracy Requirements

#### Theoretical Validation Checklist
- [ ] **Modal vs. Tonal Context**: Distinguish between borrowed chords and true modal progressions
- [ ] **Parent Scale Relationships**: Use existing scale database for accurate mode-to-family mappings
- [ ] **Chord Function Analysis**: Implement Roman numeral analysis without AI dependency
- [ ] **Characteristic Movement Detection**: Identify modal-specific progressions (♭VII-I in Dorian, etc.)
- [ ] **Enharmonic Consistency**: Proper spelling based on modal context

#### Local Analysis First Approach
```typescript
// Development pattern for all new features
class MusicAnalyzer {
  // 1. Primary analysis using existing local algorithms
  analyzeLocally(input: MusicalInput): LocalResult;
  
  // 2. AI enhancement for context and examples  
  enhanceWithAI(localResult: LocalResult): Promise<AIEnhancement>;
  
  // 3. Cross-validation between results
  validateResults(local: LocalResult, ai: AIEnhancement): ValidatedResult;
}
```

## AI Development Tips

### Updated Prompting for Music Theory Features

1. **Music Theory Component Creation**
   ```
   Create a React component for [music theory purpose] that uses the existing Reference section analysis capabilities.
   Integrate with local chord templates and scale data rather than relying on AI analysis.
   Include cross-references to the Reference tab for educational continuity.
   ```

2. **Analysis Feature Updates**
   ```
   Update [analysis feature] to use local music theory algorithms first, with AI as enhancement.
   Ensure theoretical accuracy by validating against the existing scale database.
   Implement cross-feature navigation to connect analysis results with reference materials.
   ```

3. **Educational Feature Implementation**
   ```
   Implement [educational feature] that leverages the existing Reference section's sophisticated analysis.
   Create progressive learning paths that build understanding incrementally.
   Connect analysis results to broader modal system understanding.
   ```

### Music Theory Code Review Checklist

- [ ] **Theoretical Accuracy**: All analysis results validated against established music theory
- [ ] **Local Analysis Priority**: Primary logic uses existing chord templates and scale data
- [ ] **AI Enhancement Only**: AI used for context, examples, and explanations, not core analysis
- [ ] **Cross-Feature Integration**: Results connect to Reference section for deeper exploration
- [ ] **Educational Value**: Features build understanding rather than just providing answers
- [ ] **Progressive Disclosure**: Complexity adapts to user's theoretical knowledge level
- [ ] **Performance**: Local analysis completes quickly without unnecessary AI calls

### Online References

- **shadcn/ui Documentation**: https://ui.shadcn.com/
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

*This document consolidates information from styling_the_app.md, analysis_results_panel.md, two_stage_flow_summary.md, and development best practices to provide a comprehensive development guide.*
