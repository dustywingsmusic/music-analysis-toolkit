# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a music theory toolkit application consisting of a React frontend and FastAPI backend for audio mode analysis and music theory exploration. The app provides AI-powered mode identification, scale discovery, chord analysis, and comprehensive music theory tools.

## Development Commands

### Frontend (React + TypeScript + Vite)
Navigate to `/frontend/` directory for all frontend commands:

```bash
# Development
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:unit        # Run unit tests only
npm run test:component   # Run component tests only
npm run test:e2e         # Run Playwright e2e tests
npm run test:coverage    # Generate coverage report
npm run test:ci          # Run all tests for CI
npm run test:clean       # Clean test reports

# Server
npm start                # Start production server
npm run dev:server       # Start development server with logging
```

### Backend (FastAPI + Python)
Navigate to `/backend/` directory for backend commands:

```bash
# Development
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Dependencies
pip install -r requirements.txt
```

### Docker Deployment
```bash
docker-compose up --build    # Build and run both services
./deploy.sh                  # Deploy to Google Cloud Run
```

## Architecture Overview

### Frontend Architecture
- **Main App**: `src/App.tsx` - Root component with analytics and MIDI cleanup
- **Core Component**: `src/components/QuestionDrivenMusicTool.tsx` - Main interface
- **Tab System**: Navigation between Mode Identification, Discovery, Harmony, and Reference
- **Unified Results**: `src/components/UnifiedResultsPanel.tsx` - Displays analysis results
- **MIDI Integration**: `src/hooks/useMidi.ts` - WebMIDI support for real-time input
- **AI Services**: `src/services/geminiService.ts` - Google Gemini integration

### Backend Architecture
- **Main API**: `backend/app/main.py` - FastAPI application with audio analysis endpoint
- **Models**: `backend/app/models.py` - Pydantic models for request/response data
- **Analysis Engine**: `backend/app/utils.py` - Music theory analysis utilities
- **Core Endpoint**: `POST /analyze-mode/` - Accepts audio files for mode analysis

### Key Technologies
- **Frontend**: React 19.1.0, TypeScript 5.7.2, Vite 6.2.0, shadcn/ui, Tailwind CSS
- **Backend**: FastAPI, librosa, music21, numpy for audio analysis
- **AI Integration**: Google Gemini 2.5 Flash for advanced music theory analysis
- **Testing**: Vitest for unit/component tests, Playwright for e2e testing
- **Deployment**: Docker + Google Cloud Run

## Component Structure

### UI Components (`src/components/ui/`)
Built on shadcn/ui with Radix UI primitives:
- Form controls: `button.tsx`, `input.tsx`, `select.tsx`, `checkbox.tsx`
- Layout: `card.tsx`, `tabs.tsx`, `dialog.tsx`, `sheet.tsx`
- Data display: `table.tsx`, `badge.tsx`, `tooltip.tsx`

### Music Components
- **MidiDetectionPanel**: Real-time MIDI input handling
- **ScaleTable**: Interactive scale/mode reference tables
- **ChordAnalyzer**: AI-powered chord progression analysis
- **ResultDisplay**: Formatted analysis results with song examples

### Service Layer
- **scaleDataService.ts**: Scale and mode data management
- **chordLogic.ts**: Chord analysis and Roman numeral conversion
- **keySuggester.ts**: Key signature suggestions from note input
- **realTimeModeDetection.ts**: Live mode detection from MIDI input

## Testing Strategy

### Test Organization
- **Unit Tests**: `tests/unit/` - Service and utility function tests
- **Component Tests**: `tests/component/` - React component tests with React Testing Library
- **E2E Tests**: `tests/e2e/` - Playwright integration tests
- **Fixtures**: `tests/fixtures/` - Shared test data (musical scales, chord progressions)
- **Mocks**: `tests/mocks/` - MIDI API mocks and test utilities

### Test Configuration
- **Vitest**: Component and unit testing with jsdom environment
- **Playwright**: E2E testing with browser automation
- **Coverage**: V8 coverage reports in `tests/reports/coverage/`

## Environment Setup

### Required Environment Variables
```bash
# Frontend (.env in /frontend/)
VITE_GEMINI_API_KEY="your_gemini_api_key"

# Backend
# No environment variables required for basic functionality
```

### Dependencies
- **Node.js**: >=20.0.0
- **npm**: >=10.0.0
- **Python**: 3.8+ (for backend)

## Key Implementation Notes

### MIDI Integration
- Uses WebMIDI API for real-time input
- Handles device connection/disconnection gracefully
- Cleanup listeners on component unmount and page unload

### AI Analysis Integration
- Google Gemini API provides contextual music theory explanations
- Fallback to local analysis if API unavailable
- Results include song examples and theoretical context

### Audio Analysis Backend
- Streaming analysis for memory efficiency with large audio files
- Krumhansl-Schmuckler algorithm for key detection
- Cadence detection and harmonic region classification
- Supports WAV, MP3, and other common audio formats

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Dark theme optimized for musicians
- Keyboard navigation support

## Development Workflow

When making changes:
1. Run `npm run test` to ensure tests pass
2. Use `npm run dev` for hot reloading during development
3. Test MIDI functionality with physical MIDI devices when possible
4. Verify AI integration with valid Gemini API key
5. Check responsive design across different screen sizes

## Data Constants

Key data files in `src/constants/`:
- **scales.ts**: Comprehensive scale and mode definitions
- **keys.ts**: Key signature mappings and enharmonic equivalents
- **mappings.ts**: Scale-to-mode mappings and theoretical relationships

This architecture supports rapid development of music theory features while maintaining clean separation between analysis logic, UI components, and external services.

## Modal Analysis Architecture

**CRITICAL: This application uses the Parent Key Signature + Local Tonic approach for ALL modal analysis.**

### Core Principle
- **Parent Key Signature**: The underlying scale and key signature (e.g., C major, no sharps/flats)  
- **Local Tonic**: The note that functions as the tonal center (e.g., G)
- **Mode**: The combination (e.g., G Mixolydian = C major scale with G as tonic)

### Consistency Requirement
All analysis types (chord progressions, melodies, scales, MIDI input) MUST use this model to prevent contradictory results across different app features.

### Implementation Files
- Core logic: `src/services/localChordProgressionAnalysis.ts`, `src/services/realTimeModeDetection.ts`
- UI components: All tabs must display parent key signature and local tonic separately
- See `MODAL_ANALYSIS_ARCHITECTURE.md` for detailed implementation guidelines

This ensures theoretically sound, pedagogically valuable, and consistent modal analysis throughout the application.

## Comprehensive Music Theory Framework

**CRITICAL ARCHITECTURAL EVOLUTION: From Modal-Focused to Comprehensive Music Theory Analysis**

### Theoretical Hierarchy
The application uses a layered analytical approach based on music theory pedagogy:

1. **Functional Harmony (Foundation)**
   - Roman numeral analysis (I-IV-V progressions)
   - Chord function identification (tonic, predominant, dominant)
   - Key center detection and cadence analysis
   - **80%+ of Western music** - should be primary analysis

2. **Modal Analysis (Specialized Lens)**
   - Applied when functional analysis reveals modal characteristics
   - Maintains existing modal detection strengths
   - Presented as enhancement to functional analysis, not replacement

3. **Chromatic Harmony (Advanced)**
   - Secondary dominants (V/V)
   - Borrowed chords and modal interchange
   - Chromatic mediants and non-functional progressions

4. **Jazz/Extended Harmony (Expert)**
   - Extended chords (9ths, 11ths, 13ths)
   - Chord substitutions and voice leading
   - Complex harmonic progressions

### Analysis Decision Tree
```
Input: Chord Progression
├── Step 1: Functional Analysis (primary)
│   ├── Identify key center and Roman numerals
│   ├── Analyze chord functions and voice leading
│   └── Detect cadences and harmonic rhythm
├── Step 2: Modal Enhancement (if applicable)
│   ├── Check for modal characteristics (bVII-I, etc.)
│   └── Apply modal analysis as contextual lens
├── Step 3: Chromatic Analysis (for non-diatonic chords)
│   ├── Secondary dominants
│   ├── Borrowed chords
│   └── Chromatic mediants
└── Step 4: Present multiple valid interpretations with confidence rankings
```

### Implementation Philosophy
- **Keep Modal Excellence**: Preserve sophisticated modal analysis capabilities
- **Add Functional Foundation**: Implement comprehensive Roman numeral analysis
- **Hierarchical Presentation**: Show functional analysis first, modal as enhancement
- **Progressive Disclosure**: Guide users from simple to complex theoretical concepts
- **Multiple Perspectives**: Present alternative analyses (functional vs modal vs chromatic)

### Educational Value
- Most musicians learn functional harmony first
- Modal analysis becomes more meaningful within functional context
- Prevents forcing modal interpretations on functional progressions
- Teaches relationships between different analytical approaches

This transforms the application from a "modal analysis tool" to a "comprehensive music theory analysis engine" that excels at modal analysis while properly handling functional harmony, chromatic harmony, and other theoretical approaches with equal sophistication.

## UX Research Findings & Action Plan

### Critical User Experience Issues (January 2025)

Based on comprehensive UX analysis, the application suffers from expert-bias design that creates barriers for the broader musician community. While technically sophisticated, the interface assumes deep music theory knowledge and uses confusing terminology.

#### Top Priority Issues

1. **Misleading "Analyze with AI" Button**
   - Current button claims AI analysis but uses only local algorithms
   - Creates false expectations about app capabilities
   - **Action**: Change to "Analyze Music" to reflect actual functionality

2. **Confusing Navigation Structure**
   - Users don't understand difference between "Analysis Hub" vs "Analysis Widget"
   - Complex tab labels with badges create cognitive load
   - **Action**: Simplify to 2 main tabs: "Analyze Music" and "Explore Scales"

3. **Overwhelming Complexity for Beginners**
   - Technical terms like "Parent Key Signature + Local Tonic" unexplained
   - No progressive disclosure or onboarding
   - All features visible simultaneously causing choice paralysis
   - **Action**: Add tooltips, examples, and beginner mode

4. **Chord Progression Input Usability Issues**
   - Complex modal system with positioning problems (especially mobile)
   - Multiple inconsistent input methods
   - **Action**: Simplify to inline text input with optional visual builder

#### Quick Wins (High Impact, Low Effort)

- [ ] Fix misleading "Analyze with AI" button label → "Analyze Music"
- [ ] Add tooltips explaining music theory terms
- [ ] Pre-populate inputs with examples (e.g., "Am F C G")
- [ ] Simplify tab navigation and remove confusing badges
- [ ] Add user-friendly error messages instead of technical errors

#### Medium Priority (High Impact, Medium Effort)

- [ ] Create guided workflows replacing technical method selection
- [ ] Redesign chord progression input system
- [ ] Add comprehensive onboarding flow with welcome tour
- [ ] Implement progressive disclosure (beginner vs expert modes)
- [ ] Standardize UI patterns and button styles

#### Long-term Goals (High Impact, High Effort)

- [ ] Comprehensive accessibility audit and fixes
- [ ] Mobile-first responsive redesign
- [ ] User research and testing program
- [ ] Terminology simplification across entire app
- [ ] Advanced help system with music theory education

### Key Files Requiring UX Improvements

1. **`/src/components/AnalysisHub.tsx`** - Main interface, misleading AI button
2. **`/src/components/ui/chord-progression-input.tsx`** - Complex modal system
3. **`/src/components/EnhancedNavigationTabs.tsx`** - Navigation clarity issues
4. **`/src/components/ui/delightful-button.tsx`** - Button standardization needed

### UX Design Principles Moving Forward

1. **Progressive Disclosure**: Show complexity only when needed
2. **User-Friendly Language**: Replace expert terminology with accessible terms
3. **Consistent Patterns**: Standardize interaction methods across features
4. **Guided Learning**: Help users understand music theory concepts
5. **Mobile-First**: Ensure touch-friendly interactions
6. **Accessibility**: Support screen readers and keyboard navigation

### Success Metrics for UX Improvements

- Reduced bounce rate on first analysis attempt
- Increased completion rate of analysis workflows  
- Improved user retention (return visits)
- Reduced support requests about basic functionality
- Higher satisfaction scores from user feedback

This UX action plan addresses the core finding: **the app has excellent technical capabilities but needs significant interface simplification to serve its intended audience of musicians at all skill levels**.

## Documentation Structure

For detailed information, refer to the organized documentation in `/docs/`:

### Architecture & Implementation
- @import docs/architecture/integration-roadmap.md
- @import docs/implementation/analysis-hub.md  
- @import docs/implementation/unified-input-system.md

### Design & User Experience
- @import docs/design/delightful-components.md
- @import docs/design/contextual-help-system.md

### Development Resources
- @import docs/README.md

**Note**: The `/docs/` directory contains comprehensive technical documentation, implementation guides, and design specifications. This CLAUDE.md file provides project overview and critical development information, while detailed technical documentation lives in the organized `/docs/` hierarchy.

## Critical Development Information

### Immediate Action Required (High Priority)
1. **Fix Misleading "Analyze with AI" Button** (`src/components/AnalysisHub.tsx:490`)
   - Button text claims AI analysis but only uses local algorithms
   - Change to "Analyze Music" to reflect actual functionality
   - Impact: Reduces user confusion and false expectations

2. **Navigation UX Issues** (`src/components/EnhancedNavigationTabs.tsx`)
   - Users confused by "Analysis Hub" vs "Analysis Widget" difference
   - Simplify to 2 main tabs: "Analyze Music" and "Explore Scales"
   - Remove confusing badges and technical labels

3. **Chord Input Complexity** (`src/components/ui/chord-progression-input.tsx`)
   - Complex modal system with positioning problems on mobile
   - Consider inline text input as default with optional visual builder
   - Recent fix: Modal positioning increment reduced from 80px to 60px

### Technical Architecture (Must Maintain)
- **Parent Key + Local Tonic Approach**: All modal analysis MUST use this consistent framework
- **Local-First Analysis**: Core functionality works without external dependencies
- **Comprehensive Analysis Engine**: Routes through functional → modal → chromatic analysis hierarchy
- **Unified Input System**: Consistent experience across MIDI, mouse, keyboard inputs

### Development Workflow
- Always run `npm run test` before commits
- Use `npm run dev` for hot reloading development
- MIDI functionality requires physical devices for full testing
- Check responsive design on mobile devices
- Verify analysis results across different input methods

### Files Requiring Immediate Attention
1. `src/components/AnalysisHub.tsx` - Misleading AI button (line ~490)
2. `src/components/ui/chord-progression-input.tsx` - UX complexity issues
3. `src/components/EnhancedNavigationTabs.tsx` - Navigation clarity
4. `src/components/ui/delightful-button.tsx` - Button standardization needed