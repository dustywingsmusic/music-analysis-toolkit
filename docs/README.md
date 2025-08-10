# Music Theory Toolkit Documentation

## Overview
Interactive web application for music theory analysis and exploration, powered by comprehensive local analysis algorithms with AI enhancement. Provides mode identification, scale discovery, and chord analysis tools for musicians at all skill levels.

## Documentation Structure

### Architecture
- **[integration-roadmap.md](architecture/integration-roadmap.md)** - Phase 1 implementation status and architectural principles
- **[integration-roadmap-comprehensive.md](architecture/integration-roadmap-comprehensive.md)** - Complete strategic integration planning
- **[modal-analysis.md](architecture/modal-analysis.md)** - Comprehensive modal analysis framework and implementation
- **[technical-overview.md](architecture/technical-overview.md)** - System architecture and technology stack

### Development
- **[testing.md](development/testing.md)** - Testing strategy and modal logic validation
- **[deployment.md](development/deployment.md)** - Docker deployment and Google Cloud Run
- **[guide.md](development/guide.md)** - Development environment, styling system, and best practices

### Design
- **[requirements.md](design/requirements.md)** - User needs, use cases, and design requirements
- **[delightful-components.md](design/delightful-components.md)** - "Duolingo meets music theory" UI components
- **[contextual-help-system.md](design/contextual-help-system.md)** - Progressive disclosure help system
- **[comprehensive-analysis-ui.md](design/comprehensive-analysis-ui.md)** - Advanced analysis display specifications
- **[ui-consolidation-framework.md](design/ui-consolidation-framework.md)** - UI/UX restructuring plan

### Implementation
- **[analysis-hub.md](implementation/analysis-hub.md)** - Unified analysis interface implementation
- **[unified-input-system.md](implementation/unified-input-system.md)** - Comprehensive input system across all analysis types
- **[help-system-integration.md](implementation/help-system-integration.md)** - Contextual help system integration examples

## Quick Start

### Prerequisites
- Node.js >=20.0.0
- npm >=10.0.0
- Python 3.8+ (for backend)

### Development Commands
```bash
# Frontend (navigate to /frontend/)
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run test             # Run tests

# Backend (navigate to /backend/)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Docker Deployment
docker-compose up --build
```

## Key Features

### Analysis Capabilities
- **Local-First Analysis**: Core functionality works without external dependencies
- **AI Enhancement**: Contextual information and song examples when available
- **Multiple Perspectives**: Functional, modal, and chromatic analysis approaches
- **Real-time Input**: MIDI, mouse, and keyboard input methods

### User Experience
- **Progressive Disclosure**: Complexity revealed based on user needs
- **Delightful Interactions**: Musical animations and celebrations
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile-First**: Touch-optimized responsive design

### Architecture Principles
- **Parent Key + Local Tonic**: Consistent modal analysis framework
- **Comprehensive Theory**: Multi-layered analytical approach
- **Unified Input**: Consistent input experience across all features
- **Context-Aware Help**: Just-in-time learning support

## Critical Information

### UX Issues (High Priority)
1. **Misleading "Analyze with AI" button** - Change to "Analyze Music"
2. **Navigation confusion** - Simplify tab structure and labels
3. **Beginner barriers** - Add tooltips and progressive disclosure
4. **Chord input complexity** - Simplify modal system
5. **Mobile usability** - Fix positioning and touch interactions

For detailed information on any topic, see the specific documentation files listed above.
