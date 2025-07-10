# Music Theory Toolkit - Use Cases

> **📋 Documentation Flow**: [Use Cases](./design_use_cases.md) → [Requirements](./design_requirements.md) → [Architecture](./architecture.md) → [Implementation](./implementation.md) → [Analysis Results Panel](./analysis_results_panel.md)
> 
> **📚 Navigation**: See [dev_docs README](./README.md) for complete documentation guide

This document defines the core user questions and workflows that drive the Music Theory Toolkit design. Each use case maps to specific features in the application.

## Enhanced Interaction Patterns

The application implements sophisticated cross-tab interaction patterns that leverage the comprehensive reference components architecture:

### Seamless Analysis-to-Reference Flow
- Analysis results include "View in Tables" buttons for instant reference navigation
- Context preservation maintains analysis state when switching to reference tab
- Reference tab automatically highlights relevant scales/modes
- Breadcrumb navigation provides clear path back to original analysis

### Live Reference Updates During Analysis
- Real-time reference panel updates as user types input
- Side panel shows relevant scales during melody/chord input
- Hover previews provide instant scale information
- Smooth transitions between contextual suggestions

### Bidirectional Reference-to-Analysis Flow
- Reference tables include "Analyze This Mode" buttons
- Clicking pre-fills analysis forms with scale data
- Automatic tab switching with preserved context
- Results automatically link back to original reference

### Multi-Modal Comparison Workflows
- Select multiple analysis results for unified comparison
- "Compare Selected" creates side-by-side analysis view
- Difference highlighting shows unique characteristics
- Export comparison results as reference material

### Contextual Mode Discovery
- Reference browsing suggests related discovery workflows
- "Explore Similar" suggestions in reference tables
- One-click discovery workflows from reference context
- Seamless exploration loops with automatic comparison

---

## 🎼 Mode Identification
**Implementation Status**: ✅ Partially Complete ([see implementation](./implementation.md#phase-1-core-navigation--mode-identification-complete))
**UI Location**: 🎼 Mode Identification Tab

> _“I have musical material—what mode is it?”_  
Supports identifying the mode from a melody, note group, or chord progression.

1. **What mode is this melody in?** → 🎼 Mode Identification → **Melody Analysis** ✅ Working
2. **What mode fits this scale or note collection?** → 🎼 Mode Identification → **Scale Analysis** ✅ Working  
3. **What modes are possible given these notes and tonic/root?** → 🎼 Mode Identification → **Scale Analysis** ✅ Working
4. **What mode fits this chord progression?** → 🎼 Mode Identification → **Chord Progression** ✅ Working
5. **Is this material modal or tonal?** → 🎼 Mode Identification → **Any Analysis Method** ✅ Working

---

## 🔍 Mode Discovery  
**Implementation Status**: ✅ UI complete, backend integration pending ([see implementation](./implementation.md#phase-2-mode-discovery--enhanced-scale-tables-complete))
**UI Location**: 🔍 Mode Discovery Tab + 📚 Reference Tab

> _“I want to explore or compare modes.”_  
Interactive tools to explore modes by root, notes, relationships, and tables.

6. **What modes can I build from this root note?** → 🔍 Mode Discovery → **Build from Root** ✅ Working
7. **What modes contain these specific notes?** → 🔍 Mode Discovery → **Find by Notes** 🔄 Coming Soon
8. **What are the modes of the major, melodic minor, or harmonic minor scale?** → 📚 Reference → **Scale Tables** ✅ Working
9. **What's the difference between Dorian and Aeolian (or any two modes)?** → 🔍 Mode Discovery → **Compare Modes** 🔄 Coming Soon
10. **What is the parent scale of this mode?** → 🔍 Mode Discovery → **Explore Relationships** 🔄 Coming Soon

---

## 🎵 Harmony & Chord Usage  
**Implementation Status**: ✅ Partially Complete - Modal Chord Analysis working ([see implementation](./implementation.md#phase-3-chords--harmony-complete))
**UI Location**: 🎵 Harmony Tab + 🎼 Mode Identification Tab

> _“I want to use modes in writing or analyzing chords.”_  
Tools for analyzing chords, substitutions, and building modal harmony.

11. **What chords can I use in this mode?** → 🎵 Harmony → **Mode to Chords** 🔄 Coming Soon
12. **What chords can I substitute for [chord X] in this key or mode?** → 🎵 Harmony → **Chord Analysis** 🔄 Coming Soon
13. **Which mode works over a specific chord or progression?** → 🎼 Mode Identification → **Chord Progression** ✅ Working
14. **Can I use modal interchange here? From which modes?** → 🎵 Harmony → **Modal Interchange** 🔄 Coming Soon
15. **What chords in this progression are modal and what are their modes?** → 🎵 Harmony → **Modal Chord Analysis** ✅ Working

---

## 🧠 Theory Clarification  
**Implementation Status**: ✅ Partially Complete (Reference materials available)
**UI Location**: 📚 Reference Tab

> _“I want to understand how modes work.”_  
Conceptual questions about modes and their function.

16. **What is a mode, and how is it different from a scale or key?** → 📚 Reference → **Quick Reference Cards** ✅ Working
17. **What are the characteristics or 'color' of each mode?** → 📚 Reference → **Quick Reference Cards** ✅ Working
18. **How do modes relate to the major, melodic minor, or other scales?** → 📚 Reference → **Scale Tables** ✅ Working
19. **How do I know when a song is in a mode instead of a key?** → 📚 Reference → **Quick Reference Cards** ✅ Working
20. **Can two modes use the same notes but have different tonics?** → 📚 Reference → **Scale Tables** ✅ Working

---

## 🎹 Improvisation & Composition  
**Implementation Status**: ✅ Partially Complete (Analysis tools + Reference materials available)
**UI Location**: 📚 Reference Tab + 🎼 Mode Identification Tab + 🎵 Harmony Tab

> _“I want to use modes creatively.”_  
Applied use of modes in writing, soloing, and style-based improvisation.

21. **Which mode should I use to write a darker or brighter melody?** → 📚 Reference → **Quick Reference Cards** ✅ Working
22. **What mode should I use to solo over this chord progression?** → 🎼 Mode Identification → **Chord Progression** ✅ Working
23. **How do I use modes in jazz, rock, metal, etc.?** → 📚 Reference → **Quick Reference Cards** ✅ Working
24. **How do modes change the feel of a melody or harmony?** → 📚 Reference → **MIDI Playback** ✅ Working

---

## 🧩 Edge Cases & Advanced Topics  
**Implementation Status**: ✅ Partially Complete (Can be analyzed using existing tools)
**UI Location**: 🎼 Mode Identification Tab + 📚 Reference Tab

> _“I’m analyzing unusual modal material.”_  
For advanced users dealing with hybrid modes, modulation, and theoretical nuance.

25. **What mode is this if it contains both a ♭6 and a natural 7?** → 🎼 Mode Identification → **Scale Analysis** ✅ Working
26. **How do enharmonic spellings affect modal interpretation?** → 🎼 Mode Identification → **Any Analysis Method** ✅ Working
27. **How do I recognize modal modulation in a piece of music?** → 🎼 Mode Identification → **Melody Analysis** ✅ Working
28. **Is this mode derived from major, melodic minor, harmonic minor, or another system?** → 📚 Reference → **Scale Tables** ✅ Working
