# Music Theory Toolkit

An interactive web application for music theory analysis and exploration, powered by AI. This toolkit provides comprehensive chord analysis and scale discovery tools for musicians, music students, and theory enthusiasts.

## Setup and Installation

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
    API_KEY="YOUR_API_KEY_HERE"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

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