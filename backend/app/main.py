import os
import tempfile
from typing import Dict, List

import librosa
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .models import ModeAnalysisResponse
from .utils import (PITCH_CLASSES, fig_to_base64, guess_mode,
                    plot_chromagram, plot_histogram)

app = FastAPI(title="Audio Mode Analysis API", version="1.0.0")

# CORS (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"]   # Allows all headers
)

@app.post("/analyze-mode/", response_model=ModeAnalysisResponse, summary="Analyze musical mode of an audio segment")
async def analyze_mode(
    audio: UploadFile = File(..., description="The audio file to analyze (e.g., WAV, MP3)"),
    start: float = Form(0.0, description="Start time in seconds for the segment to analyze. Defaults to 0.0."),
    end: float = Form(None, description="End time in seconds for the segment to analyze. If not provided, analysis goes to the end of the audio.")
) -> ModeAnalysisResponse:
    """
    Analyzes an uploaded audio file to determine its musical mode within a specified segment.

    - **audio**: Upload an audio file (e.g., .wav, .mp3).
    - **start**: The starting time in seconds for the analysis segment.
    - **end**: The ending time in seconds for the analysis segment. If omitted, analysis continues to the end of the audio.

    Returns a comprehensive analysis including duration, sample rate, chromagram data,
    detected notes, suggested musical mode, local key, match scores for various modes,
    and base64-encoded visualizations (chromagram and pitch class histogram).
    """
    # Save uploaded file to a temporary WAV file
    # Using tempfile ensures proper cleanup
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        # Read the uploaded audio file content
        file_content = await audio.read()
        # Write the content to the temporary file
        tmp.write(file_content)
        # Get the path of the temporary file
        tmp_path = tmp.name

    try:
        # Load the audio file using librosa
        # sr=None preserves the original sample rate
        y, sr = librosa.load(tmp_path, sr=None)
        # Get the total duration of the audio in seconds
        duration = librosa.get_duration(y=y, sr=sr)

        # Calculate start and end samples based on provided times
        start_sample = int(start * sr)
        # If 'end' is not provided, set end_sample to the length of the audio
        end_sample = int(end * sr) if end is not None else len(y)

        # Ensure the segment is within valid bounds
        start_sample = max(0, start_sample)
        end_sample = min(len(y), end_sample)

        # Extract the audio segment
        y_segment = y[start_sample:end_sample]
        # Calculate the duration of the analyzed segment
        segment_seconds = len(y_segment) / sr

        # --- Chromagram extraction (Constant-Q Transform based) ---
        # Chroma_cqt is robust to changes in timbre
        chroma = librosa.feature.chroma_cqt(y=y_segment, sr=sr)
        # Calculate the average chroma vector across all frames
        avg_chroma = chroma.mean(axis=1)
        # Convert the chromagram (transposed) to a list of lists for JSON serialization
        chromagram_frames = chroma.T.tolist()

        # --- Frame counts per pitch class ---
        # Identify strong activations (above 70% of the max activation in each frame)
        strong_activations = chroma > (0.7 * chroma.max(axis=0))
        # Sum the strong activations for each pitch class across all frames
        counts = strong_activations.sum(axis=1)
        # Create a dictionary mapping pitch class names to their frame counts
        frame_count_per_pitch_class = {pc: int(counts[i]) for i, pc in enumerate(PITCH_CLASSES)}

        # --- Detected notes ---
        # Identify pitch classes that have at least one strong activation
        detected_notes = [pc for i, pc in enumerate(PITCH_CLASSES) if counts[i] > 0]

        # --- Mode matching ---
        # Call the helper function to guess the musical mode
        suggested_mode, local_key, match_scores = guess_mode(avg_chroma)

        # --- Visualizations ---
        # Generate chromagram plot and convert to base64 string
        chromagram_base64 = plot_chromagram(chroma, sr)
        # Generate histogram plot and convert to base64 string
        histogram_base64 = plot_histogram(avg_chroma)

        # Return the analysis results as a ModeAnalysisResponse object
        return ModeAnalysisResponse(
            duration_seconds=duration,
            segment_seconds=segment_seconds,
            sample_rate=sr,
            average_chroma=avg_chroma.tolist(),
            chromagram_frames=chromagram_frames,
            frame_count_per_pitch_class=frame_count_per_pitch_class,
            detected_notes=detected_notes,
            suggested_mode=suggested_mode,
            local_key=local_key,
            match_scores=match_scores,
            visuals={
                "chromagram_base64": chromagram_base64,
                "histogram_base64": histogram_base64
            }
        )

    finally:
        # Ensure the temporary file is deleted after processing
        os.remove(tmp_path)

