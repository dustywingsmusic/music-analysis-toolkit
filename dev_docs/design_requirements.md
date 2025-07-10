# Design Requirements for Music Theory Toolkit Redesign

> **📋 Documentation Flow**: [Use Cases](./design_use_cases.md) → [Requirements](./design_requirements.md) → [Architecture](./architecture.md) → [Implementation](./implementation.md) → [Analysis Results Panel](./analysis_results_panel.md)
> 
> **📚 Navigation**: See [dev_docs README](./README.md) for complete documentation guide

Based on the analysis of the current app structure and the use cases defined in [design_use_cases.md](./design_use_cases.md), here are the design requirements for improving the layout and user experience.

> **🔗 Related Documents**: 
> - **User Needs**: See [use cases](./design_use_cases.md) for the 28 specific user questions driving these requirements
> - **Technical Implementation**: See [architecture](./architecture.md) for how these requirements are technically realized
> - **Development Status**: See [implementation](./implementation.md) for current completion status (95% complete)

### Current State Analysis (Obsolete as we've already begun development of new design.)

The current app has two main components:
- **ChordAnalyzer**: AI-powered analysis of chords and scales
- **ScaleFinder**: MIDI input capabilities and comprehensive scale tables

However, the current layout doesn't clearly guide users through the specific workflows outlined in the use cases.

### Design Requirements

#### 1. **Question-Driven Navigation Structure**

**Requirement**: Reorganize the main interface around the three primary use case categories:

```
┌─────────────────────────────────────────────────────────────┐
│                    Music Theory Toolkit                     │
├─────────────────────────────────────────────────────────────┤
│ 🎼 Mode Identification  │  🔍 Mode Discovery  │  🎵 Chords  │
│                         │                     │             │
│  • What mode is this?   │  • Build from root  │  • Chord    │
│  • Analyze melody       │  • Find by notes    │    analysis │
│  • Check progression    │  • Compare modes    │  • Modal    │
│  • Modal vs tonal       │  • Diatonic modes   │    harmony  │
└─────────────────────────────────────────────────────────────┘
```

#### 2. **Workflow-Based Layout**

**Primary Layout Structure**:
- **Header**: App title and global controls
- **Navigation Tabs**: Three main categories (Mode Identification, Mode Discovery, Chords & Harmony)
- **Input Panel**: Context-sensitive input methods based on selected category
- **Results Panel**: Analysis results and scale tables
- **Tools Panel**: MIDI controls, preferences, and utilities

#### 3. **Category-Specific Input Methods**

**Mode Identification Tab**:
- **Melody Input**: Note sequence input (MIDI or manual)
- **Scale Input**: Note collection input
- **Chord Progression Input**: Sequence of chords
- **Audio Analysis**: Future feature for audio input

**Mode Discovery Tab**:
- **Build from Root**: Two-stage interaction flow
  - **Stage 1**: Immediate results display below note selector on same screen
  - **Stage 2**: "Deeper Analysis" links next to each mode for unified results panel with sample songs
- **Root Note Selector**: Choose starting note with instant feedback
- **Note Collection Builder**: Select specific notes
- **Scale Comparison Tool**: Side-by-side mode comparison
- **Parent Scale Explorer**: Navigate scale relationships

**Chords & Harmony Tab**:
- **Chord Analyzer**: Current chord analysis functionality
- **Mode-to-Chord Generator**: Show chords available in selected mode
- **Chord Substitution Tool**: Suggest alternatives
- **Progression Builder**: Create and analyze progressions

#### 4. **Unified Results Display**

**Requirements**:
- **Contextual Results**: Show relevant information based on the user's question
- **Cross-References**: Easy navigation between related concepts. All modes link directly to the mode in the reference table. If the user clicks on a link to a mode, the analysis screen stays in view.
- **Visual Hierarchy**: Clear distinction between primary answers and additional information
- **Interactive Elements**: Clickable scales, chords, and modes for deeper exploration
- **Cross-Feature Integration**: Modal chords identified in feature 16 (Modal Chord Analyzer) should be clickable to automatically populate feature 15 (Modal Interchange Analysis) with the selected chord for further analysis
- **Results Display State**: The analysis results remain in the browser's state until a new analysis is run 
- **Results History**: The user can review previous queries in the analysis results. A history button allows the user to choose a previous analysis by summary and date/time and re-populate the analysis dialog.
- **Display Access**: The panel opens automatically when a new query is run and can be opened manually by an icon that is always present on the app.
- **Display Location**: The results display must be adjustable on the screen so it can stay in view across all of the tabs and allow the user to easily work across the results and the main screen.

> **🎛️ Enhanced Implementation**: See [analysis_results_panel.md](./analysis_results_panel.md) for detailed requirements and implementation specifications for the enhanced dismissible companion panel that implements these requirements with modern UI patterns.

#### 5. **Improved Information Architecture**

**Complete UI Location Mapping**:

The application features a 4-tab navigation structure with specific methods/tools in each tab:

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
| **Build from Root** | Mode Discovery → Build from Root → Two-Stage Flow | 🔄 Updating to Two-Stage Flow | UC6: What modes can I build from this root? |
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

### Use Cases Not Yet Implemented in UI
**Theory Clarification (UC16-20)**: Partially addressed through Reference tab
**Improvisation & Composition (UC21-24)**: Partially addressed through Reference tab and working analysis tools
**Edge Cases & Advanced Topics (UC25-28)**: Can be analyzed using existing Mode Identification tools

**Question-to-Feature Mapping**:

| Use Case Question | Primary Tool | Secondary Tools |
|-------------------|--------------|-----------------|
| "What mode is this melody?" | Mode Identification → Melody Analysis | Reference → Scale Tables |
| "What modes can I build from C?" | Mode Discovery → Build from Root | Reference → Scale Tables |
| "What chords work in Dorian?" | Harmony → Mode to Chords (Coming Soon) | Reference → Quick Reference |
| "What mode fits this progression?" | Mode Identification → Chord Progression | Reference → Scale Tables |
| "What chords in this progression are modal and what are their modes?" | Harmony → Modal Chord Analysis | Mode Identification → Chord Progression |
| "Can I use modal interchange here? From which modes?" | Harmony → Modal Interchange (Coming Soon) | Harmony → Modal Chord Analysis |

#### 6. **Enhanced User Experience**

**Navigation Requirements**:
- **Breadcrumb Navigation**: Show current location in workflow
- **Quick Actions**: Common tasks accessible from any screen
- **Search Functionality**: Find specific modes, chords, or concepts quickly
- **Recent History**: Quick access to recently analyzed items

**Visual Design Requirements**:
- **Clear Visual Hierarchy**: Use typography and spacing to guide attention
- **Consistent Iconography**: Use music-related icons for different functions
- **Color Coding**: Different colors for modes, chords, and scales
- **Responsive Design**: Work well on desktop and mobile devices

#### 7. **Reference Components Architecture**

**Core Reference Components**:

The application implements a comprehensive reference system with reusable components that integrate seamlessly across all tabs:

**ScaleGrid Component** (`src/components/reference/ScaleGrid.tsx`):
- Unified grid display for scales and modes with interactive capabilities
- Real-time filtering and search functionality
- Hover previews with audio playback
- Comparison mode for side-by-side analysis
- Integration with MIDI input for live note highlighting

**InteractiveScaleTable Component** (`src/components/reference/InteractiveScaleTable.tsx`):
- Enhanced scale table with real-time interaction capabilities
- Live MIDI integration with note highlighting
- Comparison overlays and formula visualization
- Parent scale relationship display

**ModeRelationshipVisualizer Component** (`src/components/reference/ModeRelationshipVisualizer.tsx`):
- Visual representation of mode relationships and transformations
- Interactive circle of fifths display
- Mode family trees and interval relationship mapping
- Animated transitions between modes

**ScaleComparator Component** (`src/components/reference/ScaleComparator.tsx`):
- Side-by-side comparison of multiple scales/modes
- Difference highlighting and common note identification
- Chord progression compatibility analysis

**LiveScaleBuilder Component** (`src/components/reference/LiveScaleBuilder.tsx`):
- Real-time scale construction and exploration
- Interactive note selection with MIDI input integration
- Real-time mode matching and visual feedback

**AnalysisResultsLinker Component** (`src/components/reference/AnalysisResultsLinker.tsx`):
- Seamless integration between analysis results and reference materials
- Automatic reference highlighting from analysis results
- One-click navigation to relevant reference sections
- Context-aware suggestions and cross-tab state synchronization

**SmartReferencePanel Component** (`src/components/reference/SmartReferencePanel.tsx`):
- Context-aware reference panel that adapts to current analysis
- Auto-updating based on current analysis context
- Related concept suggestions and adaptive positioning

#### 8. **Enhanced Interaction Patterns**

**Seamless Analysis-to-Reference Flow**:
- Click-through navigation with context preservation
- Analysis results show "View in Tables" buttons
- Reference tab highlights relevant scales/modes with preserved context
- Breadcrumb navigation shows path back to analysis

**Live Reference Updates During Analysis**:
- Real-time reference panel updates as user types
- Side panel shows relevant scales during input
- Hover previews and instant analysis triggers
- Smooth transitions between suggestions

**Bidirectional Reference-to-Analysis Flow**:
- "Analyze This Mode" buttons in reference tables
- Clicking pre-fills analysis forms with scale data
- Automatic tab switching with context preservation
- Results link back to original reference

**Multi-Modal Comparison Workflows**:
- Select multiple analysis results for comparison
- "Compare Selected" creates unified comparison view
- Side-by-side analysis with difference highlighting
- Export comparison as reference material

**Contextual Mode Discovery**:
- Reference browsing suggests related discovery workflows
- "Explore Similar" suggestions in reference tables
- One-click discovery workflows from reference context
- Seamless exploration loops with automatic comparison

#### 9. **Specific Layout Components**

**Header Component**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🎵 Music Theory Toolkit    [Search] [MIDI] [Settings] [?]  │
└─────────────────────────────────────────────────────────────┘
```

**Main Navigation**:
```
┌─────────────────────────────────────────────────────────────┐
│ [🎼 Identify] [🔍 Discover] [🎵 Harmony] [📚 Reference]    │
└─────────────────────────────────────────────────────────────┘
```

**Adaptive Input Panel**:
- Changes based on selected tab and specific question
- Maintains context when switching between related tools
- Provides clear instructions for each input method
- Integrates with SmartReferencePanel for live suggestions

**Enhanced Results Panel Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Primary Answer                    │ Live Reference Panel    │
├─────────────────────────────────────────────────────────────┤
│ Detailed Analysis          │ Related Information            │
│                           │                                │
│ • Scale degrees           │ • Similar modes                │
│ • Interval formula        │ • Common progressions          │
│ • Characteristic notes    │ • Interactive comparisons      │
│ • [View in Tables] button │ • Context-aware suggestions    │
└─────────────────────────────────────────────────────────────┘
```

**Reference Integration Panel**:
```
┌─────────────────────────────────────────────────────────────┐
│ ScaleGrid Component                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ Mode Card   │ │ Mode Card   │ │ Mode Card   │           │
│ │ [Analyze]   │ │ [Compare]   │ │ [Explore]   │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│ InteractiveScaleTable + ModeRelationshipVisualizer         │
└─────────────────────────────────────────────────────────────┘
```

#### 10. **Integration Requirements**

**Maintain Current Functionality**:
- Preserve all existing MIDI input capabilities
- Keep AI-powered analysis features
- Maintain scale table functionality
- Preserve preferences and settings system

**Enhanced Integration**:
- Seamless flow between different analysis tools
- Context preservation when switching between tabs
- Unified history and bookmarking system
- Cross-referencing between related concepts

#### 9. **Accessibility and Usability**

**Requirements**:
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Clear Instructions**: Contextual help for each tool
- **Error Handling**: Clear feedback for invalid inputs
- **Progressive Disclosure**: Show advanced features only when needed

#### 10. **Implementation Priority**

**Phase 1**: Core navigation structure and Mode Identification tab
**Phase 2**: Mode Discovery tab and enhanced scale tables
**Phase 3**: Chords & Harmony tab and cross-referencing
**Phase 4**: Advanced features and mobile optimization

### Success Metrics

The redesigned layout should enable users to:
1. **Quickly identify** which tool answers their specific question
2. **Easily navigate** between related concepts and tools
3. **Understand results** without deep music theory knowledge
4. **Discover new concepts** through intuitive exploration
5. **Complete common workflows** in fewer steps

### TODOs - Future Enhancements

#### Musical Notation Display
- **TODO**: Implement actual musical notation display for scales and melodies
  - Show scales as musical staff notation instead of just note names
  - Display melodies with proper rhythm and pitch notation
  - Add visual representation of intervals and scale degrees
  - Consider integration with music notation libraries (e.g., VexFlow, ABC notation)
  - Priority: MEDIUM - Would significantly enhance user understanding and visual appeal

#### Input Validation and Error Prevention
- **✅ IMPLEMENTED**: Enhanced Input Validation for Analysis Methods
  - ✅ If a melody is expected and chords are entered, the UI catches that before clicking analyze
  - ✅ Real-time input validation detects when user enters wrong input type for selected analysis method
  - ✅ Clear feedback and suggestions provided when input doesn't match expected format
  - ✅ Input format detection implemented (melody notes vs chord symbols vs scale notes)
  - ✅ Helpful error messages guide users to correct input format
  - ✅ Auto-switching to appropriate analysis method with user-friendly button
  - ✅ Implementation Date: Current session
  - ✅ Test Status: All validation tests passed (9/9 test cases)
  - **Files Modified**: 
    - `src/components/ModeIdentificationTab.tsx` - Added validation logic and UI feedback
    - `src/main.css` - Added validation feedback styling
  - **Features**: Real-time validation, format detection, method switching, visual feedback
  - Priority: HIGH - ✅ COMPLETE - Prevents user frustration and improves analysis accuracy

This design approach transforms the current tool-centric layout into a question-driven, user-centric interface that directly addresses the use cases while maintaining all existing functionality.
