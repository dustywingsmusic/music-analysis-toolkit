Audio Mode Analysis API
This project provides a FastAPI application for analyzing audio segments to infer musical modes and provide visual representations of the analysis.

Project Structure
app/: Contains the core application logic.

main.py: The main FastAPI application, defining the API endpoints.

models.py: Defines Pydantic models for request and response data.

utils.py: Contains helper functions for audio processing, mode detection, and visualization.

docs/: Contains API documentation, including the OpenAPI specification.

openapi.json: The OpenAPI 3.0 specification for the API.

.env.example: Example environment variables (currently not used but good practice).

README.md: This documentation.

requirements.txt: Lists all Python dependencies required to run the project.

Features
Audio Analysis: Upload audio files (WAV format recommended) and specify a segment for analysis.

Chromagram Generation: Generates a chromagram (CQT-based) of the audio segment.

Pitch Class Activation: Calculates average pitch class activation and frame counts.

Mode Detection: Suggests a musical mode and local key based on the audio's pitch content using cosine similarity against various scales.

Visualizations: Provides base64 encoded images of the chromagram and average pitch class histogram.

Setup Instructions
1. Clone the Repository
git clone <repository-url>
cd audio-mode-analysis

2. Create a Virtual Environment (Recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install Dependencies
pip install -r requirements.txt

4. Install music21 Dependencies (Optional, for advanced features)
music21 might require some external dependencies for full functionality (e.g., MuseScore for notation). For basic mode analysis, the Python package itself is sufficient.

Running the API
The API is built with FastAPI and can be run using Uvicorn.

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

app.main:app: Refers to the app object inside main.py within the app directory.

--host 0.0.0.0: Makes the server accessible from other devices on your network.

--port 8000: Runs the server on port 8000.

--reload: Automatically reloads the server when code changes are detected (useful for development).

Once the server is running, you can access the API documentation (Swagger UI) at:
http://localhost:8000/docs

API Usage
Endpoint
POST /analyze-mode/

Request Body (multipart/form-data)
audio: (File) The audio file to analyze (e.g., .wav, .mp3).

start: (float, optional) Start time in seconds for the segment to analyze. Defaults to 0.0.

end: (float, optional) End time in seconds for the segment to analyze. If not provided, analysis goes to the end of the audio.

Example Request (using curl)
curl -X POST "http://localhost:8000/analyze-mode/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@/path/to/your/audio.wav;type=audio/wav" \
  -F "start=10.0" \
  -F "end=20.0"

Replace /path/to/your/audio.wav with the actual path to your audio file.

Example Response (JSON)
{
  "duration_seconds": 60.0,
  "segment_seconds": 10.0,
  "sample_rate": 22050,
  "average_chroma": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.0, 0.0],
  "chromagram_frames": [
    [...],
    [...]
  ],
  "frame_count_per_pitch_class": {
    "C": 100,
    "C#": 50,
    // ...
  },
  "detected_notes": ["C", "E", "G"],
  "suggested_mode": "C Major",
  "local_key": "C",
  "match_scores": {
    "C Major": 0.98,
    "A Minor": 0.85
    // ...
  },
  "visuals": {
    "chromagram_base64": "data:image/png;base64,...",
    "histogram_base64": "data:image/png;base64,..."
  }
}

The visuals field contains base64 encoded PNG images of the chromagram and the average pitch class histogram, which can be directly embedded in HTML or image tags.

Dependencies
See requirements.txt for a complete list. Key dependencies include:

FastAPI: Web framework for building the API.

Uvicorn: ASGI server to run the FastAPI application.

librosa: For audio analysis and feature extraction.

numpy: For numerical operations.

matplotlib: For generating plots.

music21: For musical scale and mode definitions.

pydantic: For data validation and serialization.

Contributing
Feel free to open issues or pull requests for any improvements or bug fixes.