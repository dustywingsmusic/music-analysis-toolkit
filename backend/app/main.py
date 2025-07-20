import logging

# Configure logging right at the start, before any other imports.
# This ensures it's set up before any other module (like utils or fastapi) can use it.
# The format now includes the logger's name for better context.
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     [%(name)s] %(message)s'
)

import librosa
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import ModeAnalysisResponse, VisualsResponse
from .utils import (PITCH_CLASSES, analyze_audio_tonality, get_parent_major_key,
                    guess_mode, plot_chromagram, plot_histogram)

app = FastAPI(title="Audio Mode Analysis API", version="1.1.0")

# CORS (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"]   # Allows all headers
)

@app.post("/analyze-mode/", response_model=ModeAnalysisResponse, summary="Analyze musical mode and key signature of an audio segment")
async def analyze_mode(
    audio: UploadFile = File(..., description="The audio file to analyze (e.g., WAV, MP3)"),
    start: float = Form(0.0, description="Start time in seconds for the segment to analyze. Defaults to 0.0."),
    end: float = Form(None, description="End time in seconds for the segment to analyze. If not provided, analysis goes to the end of the audio.")
) -> ModeAnalysisResponse:
    """
    Analyzes an uploaded audio file to determine its musical mode and key signature.

    It provides a `parent_key` for the entire file and a more detailed `local_key`
    and `suggested_mode` for a user-specified time segment.

    - **audio**: Upload an audio file (e.g., .wav, .mp3).
    - **start**: The starting time in seconds for the detailed analysis segment.
    - **end**: The ending time in seconds for the segment. If omitted, analysis continues to the end.

    Returns a comprehensive analysis including the parent key, local key, suggested mode,
    chromagram data, and visualizations for the specified segment.
    """
    # --- Input Validation ---
    if end is not None and end < start:
        raise HTTPException(
            status_code=400,
            detail="The 'end' time cannot be earlier than the 'start' time."
        )

    # --- Audio Loading ---
    # Load audio directly from the in-memory file object for efficiency.
    # This avoids writing to disk.
    try:
        y, sr_float = librosa.load(audio.file, sr=None)
        # librosa.load returns sr as a float (e.g., 44100.0).
        # We cast it to an int for semantic clarity and use within our app.
        sr = int(sr_float)
    except Exception as e:
        # Catch potential loading errors (e.g., corrupted or unsupported file)
        raise HTTPException(
            status_code=400,
            detail=f"Could not load or process the audio file. Error: {e}"
        )

    # 1. Analyze the ENTIRE file for the parent key
    parent_key, parent_tonic = analyze_audio_tonality(y, sr)
    parent_key_signature = get_parent_major_key(parent_key)
    duration = librosa.get_duration(y=y, sr=sr)

    # 2. Define and analyze the SEGMENT for local details
    start_sample = int(start * sr)
    end_sample = int(end * sr) if end is not None else len(y)

    # Ensure the segment is within valid bounds
    start_sample = max(0, start_sample)
    end_sample = min(len(y), end_sample)

    y_segment = y[start_sample:end_sample]
    segment_seconds = len(y_segment) / sr

    # --- Chromagram extraction for the segment ---
    chroma = librosa.feature.chroma_cqt(y=y_segment, sr=sr)
    avg_chroma = chroma.mean(axis=1)
    chromagram_frames = chroma.T.tolist()

    # --- Frame counts per pitch class for the segment ---
    # Identify strong activations (above 70% of the max in each frame)
    # Using keepdims=True ensures correct broadcasting for the comparison.
    strong_activations = chroma > (0.7 * chroma.max(axis=0, keepdims=True))
    counts = strong_activations.sum(axis=1)
    frame_count_per_pitch_class = {pc: int(counts[i]) for i, pc in enumerate(PITCH_CLASSES)}

    # --- Detected notes for the segment ---
    detected_notes = [pc for i, pc in enumerate(PITCH_CLASSES) if counts[i] > 0]

    # --- Mode matching for the segment ---
    local_key, local_tonic, match_scores = guess_mode(avg_chroma)
    local_key_signature = get_parent_major_key(local_key)

    # --- Visualizations for the segment ---
    chromagram_base64 = plot_chromagram(chroma, sr)
    histogram_base64 = plot_histogram(avg_chroma)

    # 3. Construct the final response
    return ModeAnalysisResponse(
        duration_seconds=duration,
        segment_seconds=segment_seconds,
        sample_rate=sr,
        average_chroma=avg_chroma.tolist(),
        chromagram_frames=chromagram_frames,
        frame_count_per_pitch_class=frame_count_per_pitch_class,
        detected_notes=detected_notes,
        suggested_mode=local_key,
        local_tonic=local_tonic,
        local_key_signature=local_key_signature,
        parent_key=parent_key,
        parent_tonic=parent_tonic,
        parent_key_signature=parent_key_signature,
        match_scores=match_scores,
        visuals=VisualsResponse(
            chromagram_base64=chromagram_base64,
            histogram_base64=histogram_base64
        )
    )