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

## Algorithm Description

The audio analysis system employs a sophisticated multi-stage pipeline that combines signal processing, music theory, and statistical analysis to determine musical keys, modes, and harmonic relationships. The algorithm is designed for both efficiency and accuracy, using memory-optimized streaming for large files while maintaining high precision in key detection.

### Core Algorithm Pipeline

#### 1. Audio Preprocessing
- **File Handling**: Audio files are temporarily stored and processed using the `soundfile` library for robust format support
- **Channel Reduction**: Multi-channel audio is converted to mono by averaging across channels
- **Sample Rate Preservation**: Original sample rates are maintained throughout analysis to preserve frequency accuracy

#### 2. Chromagram Extraction
The system uses **Constant-Q Transform (CQT)** chromagrams via librosa for pitch class analysis:
- **CQT Advantages**: Better frequency resolution in lower registers compared to FFT-based methods
- **12-Bin Chromagram**: Each bin represents one of the 12 pitch classes (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- **Temporal Averaging**: Chromagram features are averaged across time frames to create pitch class profiles

#### 3. Global Key Analysis (Memory-Efficient Streaming)
For analyzing the entire audio file:
```
Algorithm: Streaming Global Analysis
1. Initialize weighted_chroma_sum = zeros(12)
2. Set chunk_size = sample_rate × 5 seconds
3. For each audio chunk:
   a. Extract mono audio: y_chunk = mean(stereo_channels)
   b. Apply padding if chunk < minimum_samples
   c. Compute chromagram: chroma = chroma_cqt(y_chunk)
   d. Accumulate: weighted_chroma_sum += sum(chroma, axis=time)
   e. Track total_frames += chroma.shape[time_axis]
4. Calculate final average: global_chroma = weighted_chroma_sum / total_frames
5. Apply key detection algorithm to global_chroma
```

#### 4. Local Segment Analysis (Hybrid Approach)
For analyzing specific time segments:
- **Small Segments** (< threshold): Direct in-memory processing for speed
- **Large Segments** (≥ threshold): Streaming analysis to manage memory usage
- **Segment Extraction**: Precise sample-level timing using `librosa.time_to_samples()`

#### 5. Key Detection (Krumhansl-Schmuckler Algorithm)
The core key detection uses established music cognition research:

```
Algorithm: K-S Key Detection
Input: chroma_vector (12-dimensional pitch class profile)
1. For each possible tonic (0-11):
   For each mode (major, minor):
     a. Get K-S profile for this key
     b. Rotate profile to match tonic: profile = roll(base_profile, tonic)
     c. Calculate Pearson correlation: r = corrcoef(chroma_vector, profile)
     d. Store correlation score
2. Select key with maximum correlation
3. Normalize confidence: confidence = (correlation + 1) / 2
4. Map mode: major → Ionian, minor → Aeolian
```

**Krumhansl-Schmuckler Profiles** (empirically derived from music cognition studies):
- **Major**: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
- **Minor**: [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

#### 6. Cadence Detection
Identifies dominant-tonic relationships that suggest cadential motion:

```
Algorithm: Cadence Detection
Input: chromagram, key_object
1. Calculate average pitch class activation: avg_chroma = mean(chromagram, axis=time)
2. Determine tonic and dominant pitch classes:
   tonic_pc = key.tonic.pitch_class
   dominant_pc = (tonic_pc + 7) % 12
3. Find top 3 most prominent pitch classes
4. Check if both tonic AND dominant are in top 3
5. If cadence detected:
   strength = (avg_chroma[tonic] + avg_chroma[dominant]) / sum(avg_chroma)
   strength = min(strength × 2.5, 1.0)  # Heuristic scaling
```

#### 7. Harmonic Region Classification
Distinguishes between different types of harmonic relationships:

```
Algorithm: Region Classification
Input: global_key, local_key, local_confidence, cadence_info
1. If global_key == local_key:
   Return "stable" (confidence = 0.95)
2. Calculate borrowed pitch classes:
   global_pcs = set(global_key.scale.pitch_classes)
   local_pcs = set(local_key.scale.pitch_classes)
   borrowed_pcs = local_pcs - global_pcs
3. Determine modulation vs modal shift:
   If (local_confidence > 0.80 AND cadence_detected AND cadence_strength > 0.60):
     Return "modulation" with weighted confidence
   Else:
     Return "modal_shift" with confidence based on borrowed note count
```

### Mathematical Foundations

#### Pearson Correlation for Key Detection
The system uses Pearson correlation coefficient to measure similarity between observed pitch class distributions and theoretical key profiles:

```
r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]
```
Where:
- `xi` = observed pitch class activation
- `yi` = theoretical K-S profile value
- `x̄, ȳ` = respective means

#### Confidence Normalization
Correlation values (-1 to +1) are normalized to intuitive confidence scores (0 to 1):
```
confidence = (correlation + 1) / 2
```

#### Memory Optimization
For large files, the system uses streaming weighted averages instead of concatenating arrays:
```
final_average = Σ(chunk_sums) / Σ(frame_counts)
```
This approach maintains O(1) memory usage regardless of file size.

### Performance Characteristics
- **Memory Usage**: O(1) for global analysis regardless of file size
- **Time Complexity**: O(n) where n is audio duration
- **Minimum Segment Length**: ~0.1 seconds (determined by CQT requirements)
- **Chunk Size**: 5 seconds (optimized for memory/accuracy trade-off)
- **Streaming Threshold**: Configurable based on available memory

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
