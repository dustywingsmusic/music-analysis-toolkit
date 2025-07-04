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
- **Styling**: Tailwind CSS (CDN-based, no build required)
- **Music Libraries**: WebMIDI API for MIDI input, ABCjs for music notation
- **Additional**: PostCSS with Autoprefixer for enhanced CSS processing

## Tailwind CSS Setup

This project uses a **no-build approach** for Tailwind CSS, which means you can start developing immediately without waiting for CSS compilation. Here's how it works:

### CDN-Based Implementation
- Tailwind CSS is loaded directly from CDN via `<script src="https://cdn.tailwindcss.com"></script>`
- No separate build step required for CSS processing
- Instant development with real-time style updates

### Configuration
The Tailwind configuration is embedded directly in `index.html`:
```javascript
tailwind.config = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
}
```

### Custom Styles
Custom component styles are defined using Tailwind's `@apply` directive within a `<style type="text/tailwindcss">` block in `index.html`. This approach provides:
- **Component-based styling**: Reusable CSS classes like `.btn`, `.card`, `.section-title`
- **Consistent design system**: Unified color palette and spacing
- **Dark theme optimization**: Slate color scheme optimized for extended use
- **Responsive design**: Mobile-first approach with responsive utilities

### Benefits of This Approach
- ⚡ **Instant startup**: No CSS build time during development
- 🔄 **Hot reloading**: Immediate style updates without compilation
- 📦 **Zero configuration**: Works out of the box
- 🎨 **Full Tailwind features**: Access to all utilities and responsive design
- 🛠️ **Easy customization**: Direct configuration in HTML

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
