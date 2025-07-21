# Audio Mode Analysis API
A FastAPI application for analyzing audio files to infer musical modes, key signatures, and harmonic context.

## Project Structure
- app/: Contains the core application logic.
- main.py: The main FastAPI application, defining the API endpoints.
- models.py: Defines Pydantic models for request and response data.
- utils.py: Contains helper functions for audio processing, mode detection, and music theory analysis.
- docs/: Contains API documentation, including the OpenAPI specification.
- openapi.json: The OpenAPI 3.0 specification for the API.
- .env.example: Example environment variables (currently not used but good practice).
- README.md: This documentation.
- requirements.txt: Lists all Python dependencies required to run the project.

## Features
- **Global & Local Analysis**: Computes the overall parent key for an entire audio file and a distinct local key for a specified segment.
- **Modulation vs. Modal Shift Detection**: Intelligently classifies the harmonic context of a segment as either a full "modulation" (key change) or a temporary "modal_shift" (borrowed chords/notes).
- **Cadence Detection**: Identifies cadential patterns (like V-I) within the audio to strengthen key analysis and classification.
- **Confidence Scoring**: Provides confidence scores for both the global key analysis and the local region classification, allowing for more reliable downstream use.
- **Detailed Harmonic Analysis**: Reports on non-diatonic "borrowed tones" and the measured strength of any detected cadences.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd audio-mode-analysis
   ```
2. Create a virtual environment (Recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. (Optional) Install music21 dependencies for advanced features:
   music21 might require some external dependencies for full functionality (e.g., MuseScore for notation). For basic mode analysis, the Python package itself is sufficient.

## Running the API
The API is built with FastAPI and can be run using Uvicorn.

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Once the server is running, you can access the API documentation (Swagger UI) at:  
http://localhost:8000/docs

## API Usage

**Endpoint**

`POST /analyze-mode/`

**Request Body (multipart/form-data)**

- **audio**: (File) The audio file to analyze (e.g., .wav, .mp3).  
- **start**: (float, optional) Start time in seconds for the segment to analyze. Defaults to 0.0.  
- **end**: (float, optional) End time in seconds for the segment to analyze. If not provided, analysis goes to the end of the audio.

**Example Request (using curl)**

```bash
curl -X POST "http://localhost:8000/analyze-mode/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@/path/to/your/audio.wav;type=audio/wav" \
  -F "start=30.0" \
  -F "end=45.0"
```

**Example Response (JSON)**

```json
{
  "global": {
    "tonic": "G",
    "key_signature": "G minor",
    "mode": "Aeolian",
    "confidence": 0.92
  },
  "local": {
    "segment_start": 30,
    "segment_end": 45,
    "tonic": "C",
    "key_signature": "C minor",
    "mode": "Aeolian",
    "match_score": 0.95,
    "region_type": "modal_shift",
    "region_confidence": 0.88
  },
  "analysis": {
    "chromagram_summary": [
      0.8, 0.1, 0.7, 0.9, 0.2, 0.6, 0.1, 0.9, 0.3, 0.5, 0.2, 0.4
    ],
    "cadence_detected": true,
    "borrowed_tones": [
      "Ab"
    ],
    "cadential_strength": 0.7
  }
}
```

## Dependencies
See requirements.txt for a complete list. Key dependencies include:

- FastAPI: Web framework for building the API.
- Uvicorn: ASGI server to run the FastAPI application.
- librosa: For audio analysis and feature extraction.
- numpy: For numerical operations.
- music21: For musical scale, key, and chord definitions.
- pydantic: For data validation and serialization.

## Contributing
Feel free to open issues or pull requests for any improvements or bug fixes.