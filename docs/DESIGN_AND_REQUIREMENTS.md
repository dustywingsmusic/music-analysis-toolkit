# Music Theory Toolkit - Design & Requirements

> **📋 Consolidated Documentation**: This document consolidates user needs, use cases, and design requirements into a single comprehensive reference.

## Table of Contents

1. [Overview](#overview)
2. [User Use Cases](#user-use-cases)
3. [Design Requirements](#design-requirements)
4. [UI Structure & Navigation](#ui-structure--navigation)
5. [Feature Status](#feature-status)

## Overview

The Music Theory Toolkit is designed around a question-driven approach where users start with what they want to know. This document defines the core user workflows and translates them into specific design requirements.

### Design Philosophy
The application follows a user-centric, question-driven interface that directly addresses common music theory use cases:
- "What mode is this?" → Mode Identification
- "What modes can I build?" → Mode Discovery  
- "What chords work together?" → Chords & Harmony
- "Show me scale references" → Reference Tables

### 🎯 Enhanced Design Evolution
**Critical Update**: Based on music theory validation analysis, the application is evolving to integrate the sophisticated Reference section capabilities with all analysis features. This will create **interconnected learning workflows** that bridge analysis results with comprehensive reference materials, providing both theoretical accuracy and educational continuity. See [Music Theory Integration Roadmap](MUSIC_THEORY_INTEGRATION_ROADMAP.md) for implementation details.

## User Use Cases

The application supports 28 specific use cases organized into 6 main categories:

### 🎼 Mode Identification
**Purpose**: "I have musical material—what mode is it?"
**Implementation Status**: ✅ Partially Complete
**UI Location**: 🎼 Mode Identification Tab

1. **What mode is this melody in?** → 🎼 Mode Identification → **Melody Analysis** ✅ Working
2. **What mode fits this scale or note collection?** → 🎼 Mode Identification → **Scale Analysis** ✅ Working  
3. **What modes are possible given these notes and tonic/root?** → 🎼 Mode Identification → **Scale Analysis** ✅ Working
4. **What mode fits this chord progression?** → 🎼 Mode Identification → **Chord Progression** ✅ Working
5. **Is this material modal or tonal?** → 🎼 Mode Identification → **Any Analysis Method** ✅ Working

### 🔍 Mode Discovery  
**Purpose**: "I want to explore or compare modes."
**Implementation Status**: ✅ UI complete, backend integration pending
**UI Location**: 🔍 Mode Discovery Tab + 📚 Reference Tab

6. **What modes can I build from this root note?** → 🔍 Mode Discovery → **Build from Root** ✅ Working
7. **What modes contain these specific notes?** → 🔍 Mode Discovery → **Find by Notes** 🔄 Coming Soon
8. **What are the modes of the major, melodic minor, or harmonic minor scale?** → 📚 Reference → **Scale Tables** ✅ Working
9. **What's the difference between Dorian and Aeolian (or any two modes)?** → 🔍 Mode Discovery → **Compare Modes** 🔄 Coming Soon
10. **What is the parent scale of this mode?** → 🔍 Mode Discovery → **Explore Relationships** 🔄 Coming Soon

### 🎵 Harmony & Chord Usage  
**Purpose**: "I want to use modes in writing or analyzing chords."
**Implementation Status**: 🚨 **CRITICAL REDESIGN REQUIRED** - Current chord progression analysis has theoretical accuracy issues
**UI Location**: 🎵 Harmony Tab + 🎼 Mode Identification Tab

11. **What chords can I use in this mode?** → 🎵 Harmony → **Mode to Chords** 🔄 Coming Soon
12. **What chords can I substitute for [chord X] in this key or mode?** → 🎵 Harmony → **Chord Analysis** 🔄 Coming Soon
13. **Which mode works over a specific chord or progression?** → 🎼 Mode Identification → **Chord Progression** 🚨 **NEEDS REDESIGN** - Over-reliance on AI, missing modal vs. tonal distinction
14. **Can I use modal interchange here? From which modes?** → 🎵 Harmony → **Modal Interchange** 🔄 Coming Soon
15. **What chords in this progression are modal and what are their modes?** → 🎵 Harmony → **Modal Chord Analysis** 🚨 **NEEDS REDESIGN** - Lacks proper Roman numeral analysis and borrowed chord detection

### 🧠 Theory Clarification  
**Purpose**: "I want to understand how modes work."
**Implementation Status**: ✅ Partially Complete (Reference materials available)
**UI Location**: 📚 Reference Tab

16. **What is a mode, and how is it different from a scale or key?** → 📚 Reference → **Quick Reference Cards** ✅ Working
17. **What are the characteristics or 'color' of each mode?** → 📚 Reference → **Quick Reference Cards** ✅ Working
18. **How do modes relate to the major, melodic minor, or other scales?** → 📚 Reference → **Scale Tables** ✅ Working
19. **How do I know when a song is in a mode instead of a key?** → 📚 Reference → **Quick Reference Cards** ✅ Working
20. **Can two modes use the same notes but have different tonics?** → 📚 Reference → **Scale Tables** ✅ Working

### 🎹 Improvisation & Composition  
**Purpose**: "I want to use modes creatively."
**Implementation Status**: ✅ Partially Complete (Analysis tools + Reference materials available)
**UI Location**: 📚 Reference Tab + 🎼 Mode Identification Tab + 🎵 Harmony Tab

21. **Which mode should I use to write a darker or brighter melody?** → 📚 Reference → **Quick Reference Cards** ✅ Working
22. **What mode should I use to solo over this chord progression?** → 🎼 Mode Identification → **Chord Progression** ✅ Working
23. **How do I use modes in jazz, rock, metal, etc.?** → 📚 Reference → **Quick Reference Cards** ✅ Working
24. **How do modes change the feel of a melody or harmony?** → 📚 Reference → **MIDI Playback** ✅ Working

### 🧩 Edge Cases & Advanced Topics  
**Purpose**: "I'm analyzing unusual modal material."
**Implementation Status**: ✅ Partially Complete (Can be analyzed using existing tools)
**UI Location**: 🎼 Mode Identification Tab + 📚 Reference Tab

25. **What mode is this if it contains both a ♭6 and a natural 7?** → 🎼 Mode Identification → **Scale Analysis** ✅ Working
26. **How do enharmonic spellings affect modal interpretation?** → 🎼 Mode Identification → **Any Analysis Method** ✅ Working
27. **How do I recognize modal modulation in a piece of music?** → 🎼 Mode Identification → **Melody Analysis** ✅ Working
28. **Is this mode derived from major, melodic minor, harmonic minor, or another system?** → 📚 Reference → **Scale Tables** ✅ Working

## Design Requirements

### Question-Driven Navigation Structure

The application implements a 4-tab navigation structure that maps directly to user questions:

#### Tab Structure
1. **🎼 Mode Identification** - "What mode is this?"
2. **🔍 Mode Discovery** - "What modes can I explore?"
3. **🎵 Harmony** - "How do modes work with chords?"
4. **📚 Reference** - "Show me mode information"

### Enhanced Interaction Patterns

#### Seamless Analysis-to-Reference Flow
- Analysis results include "View in Tables" buttons for instant reference navigation
- Context preservation maintains analysis state when switching to reference tab
- Reference tab automatically highlights relevant scales/modes
- Breadcrumb navigation provides clear path back to original analysis

#### Live Reference Updates During Analysis
- Real-time reference panel updates as user types input
- Side panel shows relevant scales during melody/chord input
- Hover previews provide instant scale information
- Smooth transitions between contextual suggestions

#### Bidirectional Reference-to-Analysis Flow
- Reference tables include "Analyze This Mode" buttons
- Clicking pre-fills analysis forms with scale data
- Automatic tab switching with preserved context
- Results automatically link back to original reference

#### Integrated Music Analysis Sidebar
**Status**: ✅ Complete - Modal Overlay System Successfully Replaced

**Current Problem**: The existing modal overlay system for MIDI detection, melody suggestions, and unified results creates several UX issues:
- Modal overlays with backdrop block interaction with reference screen content
- Disconnected components operate independently without visual or functional cohesion
- Context switching breaks workflow when suggestions appear as modals
- Users lose context when exploring scales while getting MIDI feedback

**New Integrated Sidebar Design**: A unified right sidebar that consolidates all music analysis tools into a cohesive, non-blocking interface:

```
┌─────────────────────┬─────────────────────┐
│                     │  🎹 MIDI DETECTION  │
│                     │  ┌─────────────────┐ │
│   REFERENCE SCREEN  │  │ Mode: [Melody]  │ │
│                     │  │ Notes: C D E F  │ │
│   Scale Tables      │  └─────────────────┘ │
│   & Quick Ref       │                     │
│                     │  🎵 LIVE SUGGESTIONS│
│                     │  ┌─────────────────┐ │
│                     │  │ • C Major       │ │
│                     │  │ • G Mixolydian  │ │
│                     │  │ • F Lydian      │ │
│                     │  └─────────────────┘ │
│                     │                     │
│                     │  📊 ANALYSIS RESULTS│
│                     │  ┌─────────────────┐ │
│                     │  │ Detailed info   │ │
│                     │  │ when available  │ │
│                     │  └─────────────────┘ │
└─────────────────────┴─────────────────────┘
```

**Key Features**:
- **Real-time Scale Highlighting**: MIDI notes highlight matching scales in reference tables without modal interruption
- **Click-to-Explore**: Suggestion items can be clicked to highlight corresponding scales and scroll table view
- **Progressive Disclosure**: Sidebar sections expand/collapse based on activity and user engagement
- **Contextual Integration**: All music analysis tools in one predictable location with continuous context
- **Responsive Design**: Sidebar collapses to bottom panel on mobile devices

**Implementation Phases**:
1. **Phase 1**: ✅ Create `IntegratedMusicSidebar` component replacing modal overlay system
2. **Phase 2**: ✅ Implement real-time integration with scale highlighting and smooth scrolling
3. **Phase 3**: ✅ Merge unified results panel functionality into sidebar with tabbed interface

**User Experience Benefits**:
- **Continuous Context**: Users can see suggestions while interacting with scale tables
- **Spatial Consistency**: All music analysis tools in one predictable location
- **Reduced Cognitive Load**: No modal switching or context loss during exploration
- **Enhanced Workflow**: Interface grows more informative as users engage with it

## UI Structure & Navigation

### 🎼 Mode Identification Tab
**Purpose**: "I have musical material—what mode is it?"

| Method | UI Location | Status | Use Cases Addressed |
|--------|-------------|--------|-------------------|
| **Melody Analysis** | Mode Identification → Melody Analysis | ✅ Working | UC1: What mode is this melody? |
| **Scale Analysis** | Mode Identification → Scale Analysis | ✅ Working | UC2: What mode fits this scale/note collection? |
| **Chord Progression** | Mode Identification → Chord Progression | ✅ Working | UC4: What mode fits this progression? |
| **Audio Analysis** | Mode Identification → Audio Analysis | 🔄 Coming Soon | UC1: Audio-based mode identification |

### 🔍 Mode Discovery Tab  
**Purpose**: "I want to explore or compare modes."

| Method | UI Location | Status | Use Cases Addressed |
|--------|-------------|--------|-------------------|
| **Build from Root** | Mode Discovery → Build from Root → Two-Stage Flow | ✅ Working Two-Stage Flow | UC6: What modes can I build from this root? |
| **Find by Notes** | Mode Discovery → Find by Notes | 🔄 Coming Soon | UC7: What modes contain these specific notes? |
| **Compare Modes** | Mode Discovery → Compare Modes | 🔄 Coming Soon | UC9: What's the difference between two modes? |
| **Explore Relationships** | Mode Discovery → Explore Relationships | 🔄 Coming Soon | UC8, UC10: Parent scales and mode relationships |

#### Build from Root Two-Stage Flow Design

**Stage 1: Immediate Results Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ Mode Discovery Tab                                          │
├─────────────────────────────────────────────────────────────┤
│ Build from Root Method                                      │
│                                                             │
│ Root Note Selector:                                         │
│ [C] [C#] [D] [D#] [E] [F] [F#] [G] [G#] [A] [A#] [B]      │
│                                                             │
│ ↓ Immediate Results (appears below when note clicked)       │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ C Ionian    │ │ C Dorian    │ │ C Phrygian  │           │
│ │ 1 2 3 4 5 6 7│ │ 1 2 ♭3 4 5 6│ │ 1 ♭2 ♭3 4 5│           │
│ │ C D E F G A B│ │ C D E♭ F G A│ │ C D♭ E♭ F G│           │
│ │ Bright, happy│ │ Minor w/ 6th│ │ Dark, exotic│           │
│ │[Deeper Analysis]│[Deeper Analysis]│[Deeper Analysis]│     │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ [Show More Modes...] [Filter by Scale Family ▼]            │
└─────────────────────────────────────────────────────────────┘
```

**Stage 2: Deeper Analysis Trigger**
- User clicks "Deeper Analysis" button on any mode card
- Unified Results Panel opens with comprehensive analysis
- AI-powered song examples and detailed mode information
- Rich analysis capabilities preserved from current implementation

### 🎵 Harmony Tab
**Purpose**: "I want to use modes in writing or analyzing chords."

| Method | UI Location | Status | Use Cases Addressed |
|--------|-------------|--------|-------------------|
| **Chord Analysis** | Harmony → Chord Analysis | 🔄 Coming Soon | UC11: Individual chord analysis |
| **Mode to Chords** | Harmony → Mode to Chords | 🔄 Coming Soon | UC11: What chords can I use in this mode? |
| **Modal Interchange** | Harmony → Modal Interchange | 🔄 Coming Soon | UC14: Can I use modal interchange here? |
| **Modal Chord Analysis** | Harmony → Modal Chord Analysis | ✅ Working | UC15: What chords are modal in this progression? |

### 📚 Reference Tab
**Purpose**: "I want to understand modes and access reference materials."

| Feature | UI Location | Status | Use Cases Addressed |
|---------|-------------|--------|-------------------|
| **Quick Reference Cards** | Reference → Quick Reference | ✅ Working | UC16-20: Mode characteristics and theory |
| **Interactive Scale Tables** | Reference → Scale Tables | ✅ Working | UC8, UC10, UC16-20: Mode relationships and theory |
| **Search & Filter** | Reference → Search/Filter | ✅ Working | UC16-20: Finding specific modes and scales |
| **MIDI Playback** | Reference → Scale Tables | ✅ Working | UC21-24: Hearing mode characteristics |

## Feature Status

### ✅ Completed Features (Theoretically Sound)
- **Reference Materials**: Quick Reference Cards, Interactive Scale Tables, MIDI Playback
- **Local Analysis Engine**: Chord templates (`chordLogic.ts`), real-time mode detection, scale database
- **Enhanced UI**: Question-driven navigation with 4-tab structure
- **MIDI Integration**: Real-time input processing with theoretical accuracy

### 🚨 Features Requiring Critical Redesign
- **Chord Progression Analysis**: Over-reliance on AI without theoretical validation
- **Modal Context Detection**: Missing distinction between borrowed chords and true modal progressions
- **Roman Numeral Analysis**: Incomplete implementation, lacks functional harmony understanding
- **Mode Identification**: Some AI-dependent features need local algorithm integration

### 🔄 Prioritized Redesign Timeline (Based on Integration Roadmap)

#### Phase 1: Foundation Integration (Immediate - 2-4 weeks)
- **Chord Progression Analysis Redesign**: Use existing chord templates instead of AI
- **Shared Analysis Context**: Unified state management across all tabs
- **Cross-Feature Navigation**: Extend "View in Tables" pattern to all features

#### Phase 2: Enhanced Theoretical Foundation (4-8 weeks)
- **Modal Context Analysis System**: Local detection of characteristic modal movements
- **Roman Numeral Analysis Engine**: Proper functional harmony without AI dependency
- **Enhanced Chord Templates**: Extended harmony and modal-specific chord support

#### Phase 3: Educational Integration (8-16 weeks)
- **Progressive Learning Paths**: Adaptive complexity based on Reference section patterns
- **Cross-Modal Educational Connections**: Leverage existing scale relationship data
- **AI-Enhanced Explanations**: Use AI for context while local analysis provides foundation

### 🔮 Future Enhancements (After Integration Complete)
- **Advanced Composition Tools**: Mode-based composition assistance with theoretical accuracy
- **Extended Scale Families**: Additional exotic modes validated against music theory
- **Performance Integration**: Real-time analysis for live performance applications
- **Educational Tutorials**: In-app theory guides with validated examples

---

*This document consolidates information from the original design_use_cases.md and design_requirements.md files to provide a comprehensive view of user needs and design specifications.*
