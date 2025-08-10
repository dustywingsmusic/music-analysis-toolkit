# /Users/samwachtel/PycharmProjects/music_modes_app/backend/app/main.py
import logging
import os
from contextlib import asynccontextmanager
from tempfile import NamedTemporaryFile
from typing import Any, Dict, Optional, Tuple

import librosa
import numpy as np
import soundfile as sf
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from music21 import key

from . import utils
from .models import (
    AnalysisDetails,
    GlobalAnalysis,
    LocalAnalysis,
    ModeAnalysisResponse,
    VisualizationItem,
)

# --- Constants ---
# Set the minimum samples based on librosa's n_fft default for chroma_cqt.
MIN_SAMPLES_FOR_CQT = 4096
# Segments longer than this (in seconds) will be streamed to conserve memory.
LOCAL_ANALYSIS_STREAMING_THRESHOLD_S = 60

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(levelname)s:     [%(name)s] %(message)s"
)
logger = logging.getLogger(__name__)


# --- Application Lifespan for Graceful Shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages application startup and shutdown events. This is the recommended
    way to handle graceful shutdown in FastAPI, triggered by signals like SIGTERM.
    """
    # Code to run on startup
    logger.info("Application startup complete. Waiting for requests...")
    yield
    # Code to run on shutdown
    logger.info("Application shutdown initiated. Server is closing gracefully.")
    # Note: Request-specific cleanup (like temp files) is still best handled
    # in the endpoint's `finally` block to ensure it runs immediately after
    # the request is done. This shutdown event is for global resources.


# Initialize FastAPI app
app = FastAPI(
    title="Advanced Audio Mode Analysis API",
    version="2.2.0",
    description="Analyzes audio to determine global and local musical context, distinguishing between modulations and modal shifts.",
    lifespan=lifespan,  # Register the lifespan context manager
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _run_global_analysis(filepath: str, sr: int) -> Tuple[Dict[str, Any], key.Key]:
    """Performs streaming analysis to find the global key using a memory-efficient weighted average."""
    logger.info("Performing global analysis via memory-efficient streaming...")

    # --- Memory Optimization: Calculate a weighted average on the fly ---
    # This avoids building a large list of arrays and a costly concatenation.
    weighted_chroma_sum = np.zeros(12, dtype=np.float32)
    total_frames = 0

    chunk_size = sr * 5  # 5-second chunks
    with sf.SoundFile(filepath, "r") as f:
        for block in f.blocks(blocksize=chunk_size, dtype="float32", always_2d=True):
            y_chunk = np.mean(block.T, axis=0)
            chunk_len = len(y_chunk)

            if chunk_len > 0:
                if chunk_len < MIN_SAMPLES_FOR_CQT:
                    logger.warning(
                        f"Padding final global chunk of length {chunk_len} to {MIN_SAMPLES_FOR_CQT} to meet analysis requirements."
                    )
                    pad_width = MIN_SAMPLES_FOR_CQT - chunk_len
                    y_chunk = np.pad(y_chunk, (0, pad_width), "constant")

                chunk_chroma = librosa.feature.chroma_cqt(y=y_chunk, sr=sr)

                # Add the sum of this chunk's chroma features to the total
                weighted_chroma_sum += np.sum(chunk_chroma, axis=1)
                total_frames += chunk_chroma.shape[1]

    if total_frames == 0:
        raise ValueError(
            f"Audio file is too short for analysis. Minimum duration is ~{MIN_SAMPLES_FOR_CQT / sr:.2f} seconds."
        )

    # Calculate the final average chroma vector
    global_avg_chroma = weighted_chroma_sum / total_frames
    # --- End of Optimization ---

    global_key_info = utils.find_best_key(global_avg_chroma)
    global_key_obj = utils.get_key_object(global_key_info["key_signature"])
    logger.info(
        f"Global key detected: {global_key_info['key_signature']} with confidence {global_key_info['confidence']:.2f}"
    )
    return global_key_info, global_key_obj


def _run_local_analysis(
    filepath: str,
    sr: int,
    duration: float,
    start_time: float,
    end_time: Optional[float],
) -> Tuple[Dict[str, Any], key.Key, np.ndarray, float, float]:
    """
    Reads and analyzes a specific time segment of the audio.
    Uses a hybrid approach: direct read for short segments, streaming for long ones.
    """
    segment_start_sec = start_time
    segment_end_sec = (
        end_time if end_time is not None and end_time <= duration else duration
    )
    segment_duration_sec = segment_end_sec - segment_start_sec

    start_sample = librosa.time_to_samples(segment_start_sec, sr=sr)
    end_sample = librosa.time_to_samples(segment_end_sec, sr=sr)
    num_samples_to_read = end_sample - start_sample

    logger.info(
        f"Analyzing local segment from {segment_start_sec:.2f}s to {segment_end_sec:.2f}s ({segment_duration_sec:.2f}s total)."
    )
    if num_samples_to_read <= 0:
        raise ValueError("The specified segment is empty or out of bounds.")

    local_chroma: Optional[np.ndarray] = None

    # --- Hybrid Analysis: Stream if segment is large, otherwise read directly ---
    if segment_duration_sec > LOCAL_ANALYSIS_STREAMING_THRESHOLD_S:
        logger.info(f"Local segment is large. Using memory-efficient streaming.")
        local_chroma_list = []
        chunk_size = sr * 5

        with sf.SoundFile(filepath, "r") as f:
            f.seek(start_sample)
            samples_processed = 0
            while samples_processed < num_samples_to_read:
                samples_this_chunk = min(
                    chunk_size, num_samples_to_read - samples_processed
                )
                block = f.read(samples_this_chunk, dtype="float32", always_2d=True)

                if not block.size:
                    break

                y_chunk = np.mean(block.T, axis=0)
                samples_processed += len(block)
                chunk_len = len(y_chunk)

                if chunk_len > 0:
                    # --- FIX: Pad the chunk if it's too short ---
                    if chunk_len < MIN_SAMPLES_FOR_CQT:
                        logger.warning(
                            f"Padding final local chunk of length {chunk_len} to {MIN_SAMPLES_FOR_CQT} to meet analysis requirements."
                        )
                        pad_width = MIN_SAMPLES_FOR_CQT - chunk_len
                        y_chunk = np.pad(y_chunk, (0, pad_width), "constant")

                    chunk_chroma = librosa.feature.chroma_cqt(y=y_chunk, sr=sr)
                    local_chroma_list.append(chunk_chroma)

        if not local_chroma_list:
            raise ValueError("Could not process the large local segment.")

        local_chroma = np.concatenate(local_chroma_list, axis=1)
    else:
        logger.info(
            f"Local segment is small. Using direct in-memory analysis for speed."
        )
        with sf.SoundFile(filepath, "r") as f:
            f.seek(start_sample)
            y_segment_frames = f.read(
                num_samples_to_read, dtype="float32", always_2d=True
            )
            y_segment = np.mean(y_segment_frames.T, axis=0)
            segment_len = len(y_segment)

            if segment_len < MIN_SAMPLES_FOR_CQT:
                raise ValueError(
                    f"The selected audio segment is too short for analysis. Please select a segment longer than {MIN_SAMPLES_FOR_CQT / sr:.2f} seconds."
                )

            local_chroma = librosa.feature.chroma_cqt(y=y_segment, sr=sr)

    # --- Continue with the rest of the analysis ---
    local_key_info = utils.find_best_key(local_chroma.mean(axis=1))
    local_key_obj = utils.get_key_object(local_key_info["key_signature"])
    logger.info(
        f"Local key detected: {local_key_info['key_signature']} with match score {local_key_info['confidence']:.2f}"
    )
    return (
        local_key_info,
        local_key_obj,
        local_chroma,
        segment_start_sec,
        segment_end_sec,
    )


def _perform_analysis(
    filepath: str, start_time: float, end_time: Optional[float]
) -> ModeAnalysisResponse:
    """Core analysis pipeline, orchestrating global, local, and classification steps."""
    with sf.SoundFile(filepath, "r") as f:
        sr = f.samplerate
        duration = len(f) / sr
    logger.info(
        f"Successfully opened audio. Duration: {duration:.2f}s, Sample Rate: {sr}Hz"
    )

    # --- Step 1: Global Analysis ---
    global_key_info, global_key_obj = _run_global_analysis(filepath, sr)

    # --- Step 2: Local Analysis ---
    local_key_info, local_key_obj, local_chroma, seg_start, seg_end = (
        _run_local_analysis(filepath, sr, duration, start_time, end_time)
    )

    # --- Step 3: Classification ---
    logger.info("Classifying region type (modulation vs. shift)...")
    local_cadence_info = utils.detect_cadences(local_chroma, local_key_obj)
    region_info = utils.classify_region_type(
        global_key=global_key_obj,
        local_key=local_key_obj,
        local_key_confidence=local_key_info["confidence"],
        local_cadence=local_cadence_info,
    )
    logger.info(
        f"Region classified as: {region_info['type']} with confidence {region_info['confidence']:.2f}"
    )

    # --- Step 4 & 5: Assemble Output ---
    logger.info("Assembling final response.")
    local_chromagram_plot = utils.plot_chromagram(
        local_chroma, sr, f"Local Chromagram ({seg_start:.1f}s - {seg_end:.1f}s)"
    )
    local_histogram_plot = utils.plot_histogram(
        local_chroma.mean(axis=1), "Local Pitch Distribution"
    )

    return ModeAnalysisResponse(
        global_=GlobalAnalysis(**global_key_info),
        local=LocalAnalysis(
            segment_start=seg_start,
            segment_end=seg_end,
            tonic=local_key_info["tonic"],
            key_signature=local_key_info["key_signature"],
            mode=local_key_info["mode"],
            match_score=local_key_info["confidence"],
            region_type=region_info["type"],
            region_confidence=region_info["confidence"],
        ),
        analysis=AnalysisDetails(
            chromagram_summary=local_chroma.mean(axis=1).tolist(),
            cadence_detected=local_cadence_info["detected"],
            borrowed_tones=region_info["borrowed"],
            cadential_strength=local_cadence_info["strength"],
        ),
        visuals=[
            VisualizationItem(
                name="local_chromagram",
                scope="local",
                image_base64=f"data:image/png;base64,{local_chromagram_plot}",
            ),
            VisualizationItem(
                name="local_histogram",
                scope="local",
                image_base64=f"data:image/png;base64,{local_histogram_plot}",
            ),
        ],
    )


@app.post(
    "/analyze-mode/",
    response_model=ModeAnalysisResponse,
    summary="Analyze global and local musical context of an audio file",
)
async def analyze_mode_endpoint(
    audio: UploadFile = File(
        ..., description="The audio file to analyze (e.g., WAV, MP3)"
    ),
    start: float = Form(
        0.0, description="Start time in seconds for the local segment analysis."
    ),
    end: Optional[float] = Form(
        None,
        description="End time in seconds for the local segment analysis. If not provided, analysis uses the full audio.",
    ),
) -> ModeAnalysisResponse:
    """Endpoint to handle audio upload and trigger the analysis pipeline."""
    logger.info(f"Received analysis request for file: {audio.filename}")

    if end is not None and end < start:
        raise HTTPException(
            status_code=400,
            detail="The 'end' time cannot be earlier than the 'start' time.",
        )

    temp_audio_filepath = None
    try:
        # Use a temporary file to handle the upload, as soundfile needs a seekable source.
        with NamedTemporaryFile(
            delete=False, suffix=os.path.splitext(audio.filename)[1]
        ) as temp_audio_file:
            content = await audio.read()
            temp_audio_file.write(content)
            temp_audio_filepath = temp_audio_file.name
        logger.info(f"Audio content saved to temporary file: {temp_audio_filepath}")

        # Delegate all the heavy lifting to the analysis function
        return _perform_analysis(
            filepath=temp_audio_filepath, start_time=start, end_time=end
        )

    except ValueError as e:
        # Catch specific, known errors from our logic and return a 400 Bad Request
        logger.warning(f"Analysis validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Catch unexpected errors and return a 500 Internal Server Error
        logger.error(
            f"An unexpected error occurred during analysis: {e}", exc_info=True
        )
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")
    finally:
        # Ensure the temporary file is always cleaned up
        if temp_audio_filepath and os.path.exists(temp_audio_filepath):
            os.remove(temp_audio_filepath)
            logger.info(f"Cleaned up temporary file: {temp_audio_filepath}")
