# Music Theory Toolkit

> **📋 Consolidated Documentation**: This project's documentation has been reorganized into four main documents that logically reflect design, feature requirements, technical implementation, deployment procedures, and development practices.

An interactive web application for music theory analysis and exploration, powered by AI. This toolkit provides comprehensive mode identification, scale discovery, and chord analysis tools for musicians, music students, and theory enthusiasts.

## 📚 Documentation Structure

The project documentation is organized into five comprehensive documents:

### 1. 🎯 [DESIGN_AND_REQUIREMENTS.md](./DESIGN_AND_REQUIREMENTS.md)
**User needs, use cases, and design specifications**
- 28 specific use cases organized by category
- Question-driven navigation structure  
- UI wireframes and interaction patterns
- Feature implementation status and roadmap

### 2. 🏗️ [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)
**System architecture and implementation status**
- Client-side SPA architecture with external services
- Technology stack and component hierarchy
- Implementation status (90% complete)
- Development roadmap and testing strategy

### 3. 🚀 [DEPLOYMENT_AND_OPERATIONS.md](./DEPLOYMENT_AND_OPERATIONS.md)
**Deployment procedures, logging, and operational guidelines**
- Google Cloud Run deployment architecture
- Server-side logging implementation
- Monitoring, observability, and troubleshooting

### 4. 🛠️ [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
**Styling guidelines, development practices, and specialized implementation guides**
- shadcn/ui component system usage
- Theme customization and styling patterns
- Specialized implementation guides
- Best practices and AI development tips

### 5. 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md)
**Comprehensive testing strategy and modal logic validation**
- Modal Logic Validation System (232+ test cases)
- Cross-system validation and conflict detection
- Development workflow integration
- Debugging and troubleshooting guides

## 🚀 Quick Start

### Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd music-theory-toolkit
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project and add your Google Gemini API key:
    ```
    VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

### Production Deployment

```bash
# Deploy to Google Cloud Run
./deploy.sh
```

For detailed deployment instructions, see [DEPLOYMENT_AND_OPERATIONS.md](./DEPLOYMENT_AND_OPERATIONS.md).

## 🎵 Key Features

### Mode Identification & Analysis
- **Melody Analysis**: Identify modes from note sequences with AI-powered analysis
- **Scale Analysis**: Determine modes from note collections and scale patterns
- **Chord Progression Analysis**: Analyze chord progressions to identify modal contexts
- **Comprehensive Results**: Detailed theoretical explanations with song examples

### Mode Discovery & Exploration
- **Build from Root**: Explore all modes available from a specific root note
- **Two-Stage Flow**: Immediate results with optional deeper AI analysis
- **Interactive Scale Tables**: Browse comprehensive mode databases with MIDI playback
- **Cross-Reference Integration**: Seamless navigation between analysis and reference

### Harmony & Chord Tools
- **Modal Chord Analysis**: Identify modal characteristics in chord progressions
- **Roman Numeral Analysis**: Automatic theoretical analysis within musical contexts
- **Chord-to-Mode Mapping**: Discover which modes work over specific chords

### AI-Powered Intelligence
- **Google Gemini Integration**: Advanced AI for sophisticated music theory analysis
- **Song Examples**: AI-generated examples of modes in popular music
- **Contextual Analysis**: Intelligent interpretation of musical material

### Modern Technology Stack
- **React + TypeScript**: Modern, type-safe frontend development
- **shadcn/ui Components**: Accessible, customizable UI component library
- **MIDI Support**: Real-time input from MIDI devices
- **Cloud Deployment**: Production-ready Google Cloud Run hosting
- **Comprehensive Logging**: Full observability and monitoring

> **📖 For detailed feature specifications and use cases, see [DESIGN_AND_REQUIREMENTS.md](./DESIGN_AND_REQUIREMENTS.md)**

## 🛠️ Development

This project uses modern React development practices with TypeScript and shadcn/ui components.

### Technology Stack
- **React 19.1.0** + **TypeScript 5.7.2** + **Vite 6.2.0**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS 3.4.17** for utility-first styling
- **Google Gemini AI** for music analysis
- **Express.js** server for static serving and logging
- **Google Cloud Run** for production deployment

### Development Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Server-side development
npm run dev:server

# Type checking
npm run type-check
```

> **📖 For comprehensive development guidelines, styling patterns, and component usage, see [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**


## 📋 Project Status

- **Current State**: 90% complete with full Mode Identification and Enhanced Analysis Results Panel implementation
- **Architecture**: Modern React SPA with external API integrations
- **Deployment**: Production-ready with Google Cloud Run hosting
- **Documentation**: Fully consolidated and comprehensive

## 🔗 Quick Navigation

- **Need to understand user requirements?** → [DESIGN_AND_REQUIREMENTS.md](./DESIGN_AND_REQUIREMENTS.md)
- **Want to see technical architecture?** → [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)
- **Ready to deploy or troubleshoot?** → [DEPLOYMENT_AND_OPERATIONS.md](./DEPLOYMENT_AND_OPERATIONS.md)
- **Developing new features or styling?** → [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **Need testing and validation guidance?** → [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## 🎵 Application Overview

The Music Theory Toolkit uses a question-driven interface that directly addresses common music theory workflows:

### Question-Driven Navigation
- **"What mode is this?"** → Mode Identification Tab
- **"What modes can I explore?"** → Mode Discovery Tab  
- **"How do modes work with chords?"** → Harmony Tab
- **"Show me mode information"** → Reference Tab

### Core Technologies
- **React 19.1.0** + **TypeScript 5.7.2** + **Vite 6.2.0**
- **Google Gemini AI** for music analysis
- **shadcn/ui** + **Tailwind CSS** for modern UI
- **Express.js** + **Google Cloud Run** for deployment

## Current Project Status

This is an actively developed music theory toolkit in its **beta iteration** with the following current capabilities:

### Core Features Implemented
- **Chord Analysis Engine**: AI-powered chord analysis with Roman numeral identification
- **Scale Discovery System**: Note set analysis and scale matching
- **MIDI Integration**: Real-time MIDI input support for interactive note entry
- **Music Notation**: ABCjs integration for displaying musical notation
- **Responsive UI**: Dark-themed interface optimized for musicians

### Recent Updates
- Migrated to CDN-based Tailwind CSS for faster development
- Enhanced MIDI support with WebMIDI API integration
- Improved AI analysis with Google Gemini 2.5 Flash
- Streamlined build process with Vite 6.2.0
- Added comprehensive component styling system

### Development Focus
The current iteration emphasizes:
- **Performance**: Fast loading and responsive interactions
- **Accessibility**: MIDI device compatibility and keyboard navigation
- **User Experience**: Intuitive interface for music theory exploration
- **Extensibility**: Modular architecture for future feature additions


---

*This documentation structure consolidates the previous dev_docs directory and scattered root-level files into a logical, comprehensive, and maintainable format.*
