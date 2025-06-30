# Music Theory Toolkit

An interactive web application for music theory analysis and exploration, powered by AI. This toolkit provides comprehensive chord analysis and scale discovery tools for musicians, music students, and theory enthusiasts.

## Features

### 🎵 Chord Analyzer
- **Intelligent Chord Analysis**: Input a musical key and chord to get detailed theoretical analysis
- **Roman Numeral Analysis**: Automatic Roman numeral identification within the given key
- **Mode Identification**: Determines the most appropriate musical mode for the chord context
- **Comprehensive Details**: Provides interval formulas, scale degrees, and theoretical explanations
- **Song Examples**: Suggests popular songs that feature the identified mode
- **Ambiguity Handling**: Explains alternative interpretations when multiple analyses are possible

### 🎼 Scale Finder
- **Note Set Analysis**: Input a set of notes to identify matching scales and modes
- **Interactive Scale Tables**: Browse comprehensive scale databases with visual highlighting
- **Cross-Reference Integration**: Seamlessly switch between analyzer and finder with context preservation
- **Multiple Scale Systems**: Supports diatonic scales, modes, and various other scale types

### 🤖 AI-Powered Analysis
- **Google Gemini Integration**: Uses advanced AI for sophisticated music theory analysis
- **Structured Responses**: Consistent, reliable analysis with comprehensive error handling
- **Musical Validation**: Intelligent input validation to ensure musically sensible queries

### 🎹 Additional Features
- **MIDI Support**: Compatible with MIDI input devices for real-time note entry
- **Modern UI**: Clean, responsive interface with dark theme optimized for extended use
- **Cross-Platform**: Works on desktop and mobile browsers

## Technology Stack

- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS (component-based styling)
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## Prerequisites

- **Node.js** (version 16 or higher recommended)
- **Google Gemini API Key** (required for AI-powered analysis)

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd music_modes_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Set your `GEMINI_API_KEY` in the `.env.local` file:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Usage Guide

### Chord Analysis
1. Select the "Analyzer" tab
2. Choose a musical key from the dropdown
3. Enter a chord symbol (e.g., "Dm7", "G", "Am")
4. Click "Analyze" to get comprehensive theoretical analysis
5. Review the mode information, intervals, and song examples
6. Use "Find in Scale Finder" to explore related scales

### Scale Discovery
1. Select the "Scale Finder" tab
2. Choose a musical key
3. Select notes using the interactive note selector or MIDI input
4. Browse the scale tables to find matching patterns
5. Click on scale entries to see detailed information

### Integration Features
- Switch seamlessly between tools while maintaining context
- Highlighted entries show relationships between chords and scales
- Cross-reference functionality helps understand theoretical connections

## Project Structure

```
music_modes_app/
├── src/                 # Source code
│   ├── App.tsx             # Main application component
│   └── types.ts            # TypeScript type definitions
├── components/          # React components
│   ├── ChordAnalyzer.tsx    # Main chord analysis interface
│   ├── ScaleFinder.tsx      # Scale discovery interface
│   ├── ResultDisplay.tsx    # Analysis results display
│   ├── ScaleTable.tsx       # Interactive scale tables
│   └── ...                  # UI components
├── services/            # External service integrations
│   └── geminiService.ts     # Google Gemini AI integration
├── constants/           # Static data and configurations
│   ├── scales.ts           # Comprehensive scale database
│   └── keys.ts             # Musical key definitions
└── ...                 # Configuration files
```

## API Integration

The application integrates with Google's Gemini AI service for intelligent music theory analysis. The AI service:

- Validates musical input for theoretical accuracy
- Provides detailed harmonic analysis with proper terminology
- Suggests contextually appropriate song examples
- Handles edge cases and musical ambiguities
- Returns structured, consistent responses

## Contributing

This project is in active development. The current version focuses on core chord analysis and scale discovery functionality with AI-powered insights.

## License

This project is powered by Dusty Wings.

---

*Music Theory Toolkit - Making music theory accessible through intelligent analysis and interactive exploration.*
