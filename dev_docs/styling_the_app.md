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