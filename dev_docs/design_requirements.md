# Design Requirements for Music Theory Toolkit Redesign

> **📋 Documentation Flow**: [Use Cases](./design_use_cases.md) → [Requirements](./design_requirements.md) → [Architecture](./architecture.md) → [Implementation](./implementation.md)
> 
> **📚 Navigation**: See [dev_docs README](./README.md) for complete documentation guide

Based on the analysis of the current app structure and the use cases defined in [design_use_cases.md](./design_use_cases.md), here are the design requirements for improving the layout and user experience.

> **🔗 Related Documents**: 
> - **User Needs**: See [use cases](./design_use_cases.md) for the 29 specific user questions driving these requirements
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
- **Root Note Selector**: Choose starting note
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

#### 5. **Improved Information Architecture**

**Question-to-Feature Mapping**:

| Use Case Question | Primary Tool | Secondary Tools |
|-------------------|--------------|-----------------|
| "What mode is this melody?" | Melody Analyzer | Scale Tables, Mode Comparison |
| "What modes can I build from C?" | Root-Based Generator | Scale Tables, Chord Generator |
| "What chords work in Dorian?" | Mode-to-Chord Tool | Chord Analyzer, Progression Builder |
| "What mode fits this progression?" | Progression Analyzer | Mode Identification, Scale Tables |
| "What chords in this progression are modal and what are their modes?" | Modal Chord Analyzer | Progression Analyzer, Mode Identification |
| "Can I use modal interchange here? From which modes?" | Modal Interchange Analyzer | Modal Chord Analyzer (clickable integration), Mode Discovery |

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

#### 7. **Specific Layout Components**

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

**Results Panel Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Primary Answer                                              │
├─────────────────────────────────────────────────────────────┤
│ Detailed Analysis          │ Related Information            │
│                           │                                │
│ • Scale degrees           │ • Similar modes                │
│ • Interval formula        │ • Common progressions          │
│ • Characteristic notes    │ • Song examples                │
└─────────────────────────────────────────────────────────────┘
```

#### 8. **Integration Requirements**

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

This design approach transforms the current tool-centric layout into a question-driven, user-centric interface that directly addresses the use cases while maintaining all existing functionality.
