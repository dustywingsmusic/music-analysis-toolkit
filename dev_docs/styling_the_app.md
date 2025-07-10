# Styling the Music Theory Toolkit App

This guide provides comprehensive instructions for updating UI styles and leveraging shadcn/ui to its fullest potential in the Music Theory Toolkit. This documentation is designed with AI assistance in mind, providing clear patterns and examples for efficient development.

## Table of Contents

1. [Overview](#overview)
2. [shadcn/ui Component System](#shadcnui-component-system)
3. [Theme Customization](#theme-customization)
4. [Component Styling Patterns](#component-styling-patterns)
5. [Creating Custom Variants](#creating-custom-variants)
6. [Music-Specific Components](#music-specific-components)
7. [Responsive Design](#responsive-design)
8. [AI Development Tips](#ai-development-tips)
9. [Online References](#online-references)

## Overview

The Music Theory Toolkit uses **shadcn/ui** as its primary component library, built on top of:
- **Radix UI** primitives for accessibility
- **Tailwind CSS** for utility-first styling
- **class-variance-authority (cva)** for component variants
- **tailwind-merge** for intelligent class merging

### Current Architecture
```
src/
├── components/ui/          # shadcn/ui components
├── lib/utils.ts           # Utility functions (cn helper)
├── main.css              # Global styles & CSS variables
└── components/           # App-specific components
```

## shadcn/ui Component System

### Available Components

The project includes these shadcn/ui components:

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

### Basic Usage Pattern

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

## Theme Customization

### CSS Variables System

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

### Customizing Colors

To add new theme colors:

1. **Add CSS variables:**
```css
:root {
  --musical: 280 100% 70%;           /* Purple for musical elements */
  --musical-foreground: 0 0% 98%;
  --scale: 160 100% 50%;             /* Teal for scales */
  --scale-foreground: 0 0% 98%;
}
```

2. **Update Tailwind config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        musical: {
          DEFAULT: "hsl(var(--musical))",
          foreground: "hsl(var(--musical-foreground))",
        },
        scale: {
          DEFAULT: "hsl(var(--scale))",
          foreground: "hsl(var(--scale-foreground))",
        },
      },
    },
  },
}
```

3. **Use in components:**
```tsx
<Button className="bg-musical text-musical-foreground hover:bg-musical/90">
  Musical Action
</Button>
```

### Dark Theme Support

The app uses a dark theme by default. To ensure components work properly:

```tsx
// Always use semantic color variables
<div className="bg-background text-foreground border border-border">
  Content
</div>

// Avoid hardcoded colors
<div className="bg-slate-900 text-white"> {/* ❌ Don't do this */}
```

## Component Styling Patterns

### The `cn` Utility Function

Use the `cn` utility for intelligent class merging:

```tsx
import { cn } from "@/lib/utils"

function MyButton({ className, ...props }) {
  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90",
        className // User classes override defaults
      )}
      {...props}
    />
  )
}
```

### Spacing and Layout

Use consistent spacing patterns:

```tsx
// Vertical spacing
<div className="space-y-2">  {/* Small gaps */}
<div className="space-y-4">  {/* Medium gaps */}
<div className="space-y-6">  {/* Large gaps */}

// Horizontal spacing  
<div className="space-x-2">  {/* Small gaps */}
<div className="space-x-4">  {/* Medium gaps */}

// Padding patterns
<div className="p-4">        {/* Standard padding */}
<div className="p-6">        {/* Card padding */}
<div className="px-4 py-2">  {/* Button padding */}
```

### Form Styling

Standard form pattern used throughout the app:

```tsx
function FormExample() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="input-id">Field Label</Label>
        <Input 
          id="input-id"
          placeholder="Placeholder text"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="select-id">Select Label</Label>
        <Select>
          <SelectTrigger id="select-id">
            <SelectValue placeholder="Choose option..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
```

## Creating Custom Variants

### Extending Button Variants

Add music-specific button variants:

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // Add custom music variants
        musical: "bg-purple-600 text-white hover:bg-purple-500 shadow-lg",
        scale: "bg-teal-600 text-white hover:bg-teal-500 shadow-lg",
        chord: "bg-violet-600 text-white hover:bg-violet-500 shadow-lg",
        mode: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        // Add music-specific sizes
        note: "h-8 w-8 rounded-full text-xs", // For note buttons
        key: "h-12 w-16 text-sm", // For piano key buttons
      },
    },
  }
)

// Usage
<Button variant="musical" size="note">C</Button>
<Button variant="scale" size="key">Major</Button>
```

### Creating Custom Components

Build music-specific components using shadcn/ui primitives:

```tsx
// components/music/NoteSelector.tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NoteSelectorProps {
  notes: string[]
  selectedNotes: string[]
  onNoteToggle: (note: string) => void
  className?: string
}

export function NoteSelector({ 
  notes, 
  selectedNotes, 
  onNoteToggle, 
  className 
}: NoteSelectorProps) {
  return (
    <div className={cn("grid grid-cols-6 gap-2", className)}>
      {notes.map((note) => (
        <Button
          key={note}
          variant={selectedNotes.includes(note) ? "musical" : "outline"}
          size="note"
          onClick={() => onNoteToggle(note)}
          className={cn(
            "transition-all duration-200",
            selectedNotes.includes(note) && "ring-2 ring-purple-400"
          )}
        >
          {note}
        </Button>
      ))}
    </div>
  )
}
```

## Music-Specific Components

### Scale Card Component

```tsx
// components/music/ScaleCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ScaleCardProps {
  scaleName: string
  notes: string[]
  mode: string
  character: string
  onPlay?: () => void
}

export function ScaleCard({ 
  scaleName, 
  notes, 
  mode, 
  character, 
  onPlay 
}: ScaleCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{scaleName}</CardTitle>
          <Badge variant="secondary">{mode}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {notes.map((note, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {note}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{character}</p>
        {onPlay && (
          <Button 
            variant="musical" 
            size="sm" 
            onClick={onPlay}
            className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ▶ Play Scale
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

### Chord Progression Builder

```tsx
// components/music/ChordProgressionBuilder.tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ChordProgressionBuilderProps {
  chords: string[]
  onAddChord: (chord: string) => void
  onRemoveChord: (index: number) => void
  onClear: () => void
}

export function ChordProgressionBuilder({
  chords,
  onAddChord,
  onRemoveChord,
  onClear
}: ChordProgressionBuilderProps) {
  const commonChords = ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 min-h-[3rem] items-center">
          {chords.length === 0 ? (
            <span className="text-muted-foreground">
              Add chords to build your progression...
            </span>
          ) : (
            chords.map((chord, index) => (
              <Badge 
                key={index} 
                variant="musical" 
                className="text-sm px-3 py-1 cursor-pointer hover:bg-purple-500"
                onClick={() => onRemoveChord(index)}
              >
                {chord}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))
          )}
        </div>
        {chords.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClear}
            className="mt-2"
          >
            Clear All
          </Button>
        )}
      </Card>

      <div className="grid grid-cols-7 gap-2">
        {commonChords.map((chord) => (
          <Button
            key={chord}
            variant="chord"
            size="sm"
            onClick={() => onAddChord(chord)}
          >
            {chord}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

### Enhanced Reference Components

The application includes sophisticated reference components that require specific styling patterns for optimal user experience and seamless integration across all tabs.

#### ScaleGrid Component

```tsx
// components/reference/ScaleGrid.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ScaleGridProps {
  modes: ModeFromRoot[];
  onModeSelect?: (mode: ModeFromRoot) => void;
  highlightedModeId?: string;
  compact?: boolean;
  showCharacteristics?: boolean;
  enableFiltering?: boolean;
  interactionMode?: 'select' | 'preview' | 'compare';
}

export function ScaleGrid({ 
  modes, 
  onModeSelect, 
  highlightedModeId,
  compact = false,
  showCharacteristics = true,
  enableFiltering = true,
  interactionMode = 'select'
}: ScaleGridProps) {
  return (
    <div className="scale-grid space-y-4">
      {enableFiltering && (
        <div className="scale-grid__filters">
          <Input 
            placeholder="Search scales and modes..."
            className="bg-slate-700 border-slate-600"
          />
        </div>
      )}

      <div className={`
        grid gap-4
        ${compact ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
      `}>
        {modes.map((mode) => (
          <Card 
            key={mode.id}
            className={`
              scale-card cursor-pointer transition-all duration-200
              hover:bg-accent/50 hover:scale-105
              ${highlightedModeId === mode.id ? 'ring-2 ring-primary bg-primary/10' : ''}
              ${interactionMode === 'compare' ? 'hover:ring-2 hover:ring-secondary' : ''}
            `}
            onClick={() => onModeSelect?.(mode)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{mode.name}</CardTitle>
                {mode.commonName && (
                  <Badge variant="secondary" className="text-xs">
                    {mode.commonName}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="scale-card__formula">
                <Badge variant="outline" className="text-xs font-mono">
                  {mode.formula}
                </Badge>
              </div>

              <div className="scale-card__notes flex flex-wrap gap-1">
                {mode.notes.map((note, index) => (
                  <Badge 
                    key={index} 
                    variant="musical" 
                    className="text-xs px-2 py-1"
                  >
                    {note}
                  </Badge>
                ))}
              </div>

              {showCharacteristics && mode.character && (
                <p className="scale-card__character text-sm text-muted-foreground">
                  {mode.character}
                </p>
              )}

              <div className="scale-card__parent text-xs text-muted-foreground">
                From {mode.parentScaleName} in {mode.parentScaleRootNote}
              </div>

              {interactionMode === 'preview' && (
                <div className="scale-card__actions opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="musical" size="sm" className="w-full">
                    ▶ Preview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### InteractiveScaleTable Component

```tsx
// components/reference/InteractiveScaleTable.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface InteractiveScaleTableProps {
  mode: ModeFromRoot;
  onNotePlay?: (note: string) => void;
  showMidiControls?: boolean;
  highlightNotes?: string[];
  comparisonMode?: boolean;
  parentMode?: ModeFromRoot;
}

export function InteractiveScaleTable({
  mode,
  onNotePlay,
  showMidiControls = true,
  highlightNotes = [],
  comparisonMode = false,
  parentMode
}: InteractiveScaleTableProps) {
  return (
    <Card className="interactive-scale-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{mode.name}</CardTitle>
          {showMidiControls && (
            <div className="midi-controls flex gap-2">
              <Button variant="musical" size="sm">
                ▶ Play Scale
              </Button>
              <Button variant="outline" size="sm">
                🎹 MIDI
              </Button>
            </div>
          )}
        </div>

        <div className="scale-info space-y-2">
          <Badge variant="outline" className="font-mono">
            {mode.formula}
          </Badge>
          {mode.character && (
            <p className="text-sm text-muted-foreground">{mode.character}</p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="scale-table-container">
          <div className="scale-notes grid grid-cols-7 gap-2 mb-4">
            {mode.notes.map((note, index) => (
              <Button
                key={index}
                variant={highlightNotes.includes(note) ? "default" : "outline"}
                size="sm"
                className={`
                  note-button transition-all duration-200
                  ${highlightNotes.includes(note) ? 'bg-primary text-primary-foreground' : ''}
                  hover:scale-110 hover:bg-primary/80
                `}
                onClick={() => onNotePlay?.(note)}
              >
                {note}
              </Button>
            ))}
          </div>

          {comparisonMode && parentMode && (
            <div className="comparison-overlay border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Compared to {parentMode.name}:</h4>
              <div className="comparison-notes grid grid-cols-7 gap-2">
                {mode.notes.map((note, index) => {
                  const isChanged = !parentMode.notes.includes(note);
                  return (
                    <Badge
                      key={index}
                      variant={isChanged ? "destructive" : "secondary"}
                      className="text-xs text-center"
                    >
                      {note}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="parent-scale-info mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm">
            <span className="font-medium">Parent Scale:</span> {mode.parentScaleName} in {mode.parentScaleRootNote}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### ScaleComparator Component

```tsx
// components/reference/ScaleComparator.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ScaleComparatorProps {
  modes: ModeFromRoot[];
  comparisonType: 'intervals' | 'notes' | 'characteristics' | 'chords';
  onAddMode?: () => void;
  onRemoveMode?: (modeId: string) => void;
  maxComparisons?: number;
}

export function ScaleComparator({
  modes,
  comparisonType,
  onAddMode,
  onRemoveMode,
  maxComparisons = 4
}: ScaleComparatorProps) {
  return (
    <div className="scale-comparator space-y-4">
      <div className="comparator-header flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scale Comparison</h3>
        {modes.length < maxComparisons && (
          <Button variant="outline" size="sm" onClick={onAddMode}>
            + Add Scale
          </Button>
        )}
      </div>

      <div className="comparison-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode) => (
          <Card key={mode.id} className="comparison-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{mode.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveMode?.(mode.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {comparisonType === 'notes' && (
                <div className="notes-comparison">
                  <div className="flex flex-wrap gap-1">
                    {mode.notes.map((note, index) => (
                      <Badge key={index} variant="musical" className="text-xs">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {comparisonType === 'intervals' && (
                <div className="intervals-comparison">
                  <Badge variant="outline" className="font-mono text-xs">
                    {mode.formula}
                  </Badge>
                </div>
              )}

              {comparisonType === 'characteristics' && mode.character && (
                <div className="characteristics-comparison">
                  <p className="text-sm text-muted-foreground">{mode.character}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {modes.length > 1 && (
        <Card className="comparison-summary">
          <CardHeader>
            <CardTitle className="text-base">Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="summary-content space-y-2">
              <div className="common-notes">
                <span className="font-medium">Common Notes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {/* Logic to find common notes would go here */}
                  <Badge variant="secondary" className="text-xs">C</Badge>
                  <Badge variant="secondary" className="text-xs">G</Badge>
                </div>
              </div>

              <div className="differences">
                <span className="font-medium">Key Differences:</span>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Different interval patterns</li>
                  <li>• Unique characteristic notes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

#### SmartReferencePanel Component

```tsx
// components/reference/SmartReferencePanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface SmartReferencePanelProps {
  currentContext: AnalysisContext;
  position: 'sidebar' | 'overlay' | 'inline';
  autoUpdate?: boolean;
  showRelatedConcepts?: boolean;
}

export function SmartReferencePanel({
  currentContext,
  position,
  autoUpdate = true,
  showRelatedConcepts = true
}: SmartReferencePanelProps) {
  const panelContent = (
    <div className="smart-reference-panel space-y-4">
      <div className="context-header">
        <h3 className="text-lg font-semibold">Related Scales</h3>
        {autoUpdate && (
          <Badge variant="secondary" className="text-xs">
            Live Updates
          </Badge>
        )}
      </div>

      <div className="context-suggestions space-y-2">
        {currentContext.suggestions?.map((suggestion, index) => (
          <Card key={index} className="suggestion-card cursor-pointer hover:bg-accent/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{suggestion.name}</span>
                <Button variant="ghost" size="sm">
                  Explore →
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {suggestion.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {showRelatedConcepts && (
        <div className="related-concepts">
          <h4 className="font-medium mb-2">Related Concepts</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">
              Circle of Fifths
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">
              Mode Relationships
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">
              Chord Progressions
            </Badge>
          </div>
        </div>
      )}
    </div>
  );

  if (position === 'overlay') {
    return (
      <Sheet>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Reference Panel</SheetTitle>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className={`
      smart-reference-panel-container
      ${position === 'sidebar' ? 'w-80 h-fit sticky top-4' : 'w-full'}
    `}>
      <CardHeader>
        <CardTitle className="text-base">Smart Reference</CardTitle>
      </CardHeader>
      <CardContent>
        {panelContent}
      </CardContent>
    </Card>
  );
}
```

#### Reference Components CSS Variables

Add these CSS variables to `src/main.css` for reference component theming:

```css
@layer base {
  :root {
    /* Reference Component Colors */
    --scale-card-bg: 215 27.9% 16.9%;
    --scale-card-hover: 215 27.9% 20%;
    --scale-card-highlight: 188 100% 42%;
    --comparison-diff: 0 84.2% 60.2%;
    --comparison-same: 142.1 76.2% 36.3%;
    --reference-panel-bg: 222.2 84% 4.9%;
    --live-update-indicator: 47.9 95.8% 53.1%;
  }
}

/* Reference Component Specific Styles */
.scale-grid {
  @apply transition-all duration-300;
}

.scale-card {
  @apply relative overflow-hidden;
}

.scale-card::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-200;
}

.scale-card:hover::before {
  @apply opacity-100;
}

.note-button {
  @apply relative;
}

.note-button::after {
  content: '';
  @apply absolute inset-0 rounded-md bg-primary/20 opacity-0 transition-opacity duration-150;
}

.note-button:hover::after {
  @apply opacity-100;
}

.comparison-card {
  @apply border-l-4 border-l-primary/50;
}

.smart-reference-panel {
  @apply backdrop-blur-sm bg-background/95;
}

.suggestion-card {
  @apply border-l-2 border-l-accent;
}

.live-update-indicator {
  @apply animate-pulse;
}
```

## Responsive Design

### Mobile-First Approach

Use Tailwind's responsive prefixes:

```tsx
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  p-4 
  md:p-6
">
  {/* Content adapts to screen size */}
</div>
```

### Component Responsiveness

```tsx
// Responsive button sizing
<Button className="
  w-full 
  sm:w-auto 
  text-sm 
  sm:text-base
">
  Responsive Button
</Button>

// Responsive spacing
<div className="
  space-y-2 
  sm:space-y-4 
  p-4 
  sm:p-6 
  lg:p-8
">
  Content
</div>
```

## AI Development Tips

### Prompt Patterns for Styling

When working with AI assistants, use these patterns:

**Component Creation:**
```
Create a shadcn/ui component for [purpose] that:
- Uses the existing theme variables
- Follows the app's spacing patterns (space-y-2, space-y-4)
- Includes proper TypeScript types
- Has accessibility attributes
- Supports the musical/scale/chord variants
```

**Styling Updates:**
```
Update this component to use shadcn/ui:
- Replace custom classes with shadcn/ui components
- Maintain the existing functionality
- Use the cn utility for class merging
- Follow the form pattern with Label and proper spacing
```

**Theme Customization:**
```
Add a new color theme for [purpose]:
- Add CSS variables to src/main.css
- Update tailwind.config.js
- Create component variants
- Ensure dark theme compatibility
```

### Common Patterns to Reference

**Form Field Pattern:**
```tsx
<div className="space-y-2">
  <Label htmlFor="field-id">Field Label</Label>
  <Input id="field-id" placeholder="Placeholder" />
</div>
```

**Card Layout Pattern:**
```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    Content
  </CardContent>
</Card>
```

**Button Group Pattern:**
```tsx
<div className="flex gap-2">
  <Button variant="default">Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

## Online References

### Official Documentation
- **shadcn/ui Documentation**: https://ui.shadcn.com/
- **shadcn/ui Components**: https://ui.shadcn.com/docs/components
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **Tailwind CSS**: https://tailwindcss.com/docs
- **class-variance-authority**: https://cva.style/docs

### Component Examples
- **shadcn/ui Examples**: https://ui.shadcn.com/examples
- **Component Variants**: https://ui.shadcn.com/docs/components/button#variants
- **Theming Guide**: https://ui.shadcn.com/docs/theming
- **Dark Mode**: https://ui.shadcn.com/docs/dark-mode

### Tailwind Resources
- **Tailwind Components**: https://tailwindui.com/components
- **Color Palette**: https://tailwindcss.com/docs/customizing-colors
- **Responsive Design**: https://tailwindcss.com/docs/responsive-design
- **Utility Classes**: https://tailwindcss.com/docs/utility-first

### Accessibility
- **Radix UI Accessibility**: https://www.radix-ui.com/primitives/docs/overview/accessibility
- **ARIA Patterns**: https://www.w3.org/WAI/ARIA/apg/patterns/
- **WebAIM Guidelines**: https://webaim.org/

### Development Tools
- **Tailwind CSS IntelliSense**: VS Code extension for class completion
- **Headless UI**: https://headlessui.com/ (alternative component library)
- **CVA Documentation**: https://cva.style/docs/getting-started

---

## Quick Reference Commands

### Adding New shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```

### Updating All Components
```bash
npx shadcn@latest add -a -y -o
```

### Development Server
```bash
npm run dev
```

This guide provides the foundation for maintaining and extending the Music Theory Toolkit's styling system. The combination of shadcn/ui components, Tailwind CSS utilities, and custom music-specific variants creates a powerful and flexible design system optimized for music theory applications.
