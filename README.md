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
    VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
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

## UI Styling & Component Development

### shadcn/ui Component System

This project uses **shadcn/ui** as its primary component library, providing:

- **Consistent Design Language**: All UI components follow unified design principles
- **Accessibility**: Built-in ARIA attributes and keyboard navigation support
- **Dark Theme Integration**: Seamlessly integrated with the existing dark theme
- **TypeScript Support**: Full type safety for component props and variants
- **Customizable**: Components can be extended with music-specific variants

### Quick Start for Developers

**Adding New Components:**
```bash
# Add individual components
npx shadcn@latest add button input label card

# Add all available components
npx shadcn@latest add -a -y -o
```

**Basic Usage Pattern:**
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function MyComponent() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="melody">Melody Notes</Label>
        <Input id="melody" placeholder="C D E F G A B C" />
      </div>
      <Button>Analyze Mode</Button>
    </div>
  )
}
```

### Styling Guidelines

- **Use semantic color variables**: `bg-background`, `text-foreground`, `border-border`
- **Follow spacing patterns**: `space-y-2`, `space-y-4`, `space-y-6`
- **Leverage the `cn` utility**: For intelligent class merging from `@/lib/utils`
- **Maintain accessibility**: Always use proper `htmlFor`/`id` relationships

### Resources

- **📖 Comprehensive Styling Guide**: [dev_docs/styling_the_app.md](dev_docs/styling_the_app.md)
- **🎨 shadcn/ui Documentation**: https://ui.shadcn.com/
- **🧩 Component**: https://ui.shadcn.com/docs/components
- **🎯 Tailwind CSS**: https://tailwindcss.com/docs
- **♿ Accessibility Guidelines**: https://www.radix-ui.com/primitives/docs/overview/accessibility

For detailed instructions on creating custom variants, music-specific components, and AI development patterns, see the [complete styling guide](dev_docs/styling_the_app.md).

## Technology Stack

- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini 2.5 Flash
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with utility-first approach
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

## Deployment

### Google Cloud Run Deployment

This application is configured for deployment to Google Cloud Run using Docker containers.

#### Prerequisites
- Google Cloud SDK installed and configured
- Docker installed
- A Google Cloud Project with billing enabled
- Container Registry API and Cloud Run API enabled

#### Quick Deployment

1. **Set up environment variables:**
   Create a `.env.prod` file with your production configuration:
   ```bash
   PROJECT_ID=your-gcp-project-id
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

2. **Deploy using the provided script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

The deployment script will:
- Build a Docker image optimized for Cloud Run
- Push the image to Google Container Registry
- Store your API key securely in Google Secret Manager
- Deploy the application to Cloud Run with proper configuration
- Run non-interactively to prevent hanging on prompts

#### Manual Deployment Steps

If you prefer to deploy manually:

1. **Build and push the Docker image:**
   ```bash
   docker build --platform linux/amd64 -t gcr.io/YOUR_PROJECT_ID/music-theory-toolkit .
   docker push gcr.io/YOUR_PROJECT_ID/music-theory-toolkit
   ```

2. **Create secret for API key:**
   ```bash
   echo "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --replication-policy="automatic" --data-file=-
   ```

3. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy music-theory-toolkit \
     --image gcr.io/YOUR_PROJECT_ID/music-theory-toolkit \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --set-secrets GEMINI_API_KEY=gemini-api-key:latest
   ```

For detailed deployment documentation, see [dev_docs/deployment.md](dev_docs/deployment.md).
