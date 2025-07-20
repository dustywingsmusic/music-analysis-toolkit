# /Users/samwachtel/PycharmProjects/music_modes_app/backend/app/main.py
import logging
import os
from tempfile import NamedTemporaryFile
from typing import Optional

import librosa
import numpy as np
import soundfile as sf
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import utils
from .models import (
    ModeAnalysisResponse,
    GlobalAnalysis,
    LocalAnalysis,
    AnalysisDetails,
    VisualizationItem,
    VisualsResponse
)

# --- Constants ---
# This is the minimum number of audio samples required for a stable CQT analysis.
# Librosa's functions need a minimum amount of data to work without warnings.
# 2048 is a safe value that is larger than the typical n_fft size (e.g., 1024).
MIN_SAMPLES_FOR_ANALYSIS = 2048

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     [%(name)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Advanced Audio Mode Analysis API",
    version="2.0.0",
    description="Analyzes audio to determine global and local musical context, distinguishing between modulations and modal shifts."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _perform_analysis(
        filepath: str,
        start_time: float,
        end_time: Optional[float]
) -> ModeAnalysisResponse:
    """
    Core analysis logic, decoupled from the web server.
    This function contains the main processing pipeline.
    """
    # --- Audio Info Gathering ---
    with sf.SoundFile(filepath, 'r') as f:
        sr = f.samplerate
        duration = len(f) / sr
    logger.info(f"Successfully opened audio. Duration: {duration:.2f}s, Sample Rate: {sr}Hz")

    # --- Step 1: Global Analysis (Streaming) ---
    logger.info("Performing global analysis via streaming...")
    global_chroma_list = []
    chunk_size = sr * 5  # 5-second chunks for a good balance of speed and memory
    with sf.SoundFile(filepath, 'r') as f:
        for block in f.blocks(blocksize=chunk_size, dtype='float32', always_2d=True):
            y_chunk = np.mean(block.T, axis=0)

            # --- FIX: This check prevents the warning on short chunks ---
            if len(y_chunk) < MIN_SAMPLES_FOR_ANALYSIS:
                continue

            chunk_chroma = librosa.feature.chroma_cqt(y=y_chunk, sr=sr)
            global_chroma_list.append(chunk_chroma)

    if not global_chroma_list:
        raise ValueError(
            f"Audio file is too short for analysis. Minimum duration is ~{MIN_SAMPLES_FOR_ANALYSIS / sr:.2f} seconds.")

    global_chroma = np.concatenate(global_chroma_list, axis=1)
    global_avg_chroma = global_chroma.mean(axis=1)
    global_key_info = utils.find_best_key(global_avg_chroma)
    global_key_obj = utils.get_key_object(global_key_info["key_signature"])
    logger.info(
        f"Global key detected: {global_key_info['key_signature']} with confidence {global_key_info['confidence']:.2f}")

    # --- Step 2: Local Context Analysis (Targeted Read) ---
    segment_start_sec = start_time
    segment_end_sec = end_time if end_time is not None and end_time <= duration else duration
    start_sample = librosa.time_to_samples(segment_start_sec, sr=sr)
    end_sample = librosa.time_to_samples(segment_end_sec, sr=sr)
    num_samples_to_read = end_sample - start_sample

    logger.info(f"Analyzing local segment from {segment_start_sec:.2f}s to {segment_end_sec:.2f}s.")
    if num_samples_to_read <= 0:
        raise ValueError("The specified segment is empty or out of bounds.")

    with sf.SoundFile(filepath, 'r') as f:
        f.seek(start_sample)
        y_segment_frames = f.read(num_samples_to_read, dtype='float32', always_2d=True)
        y_segment = np.mean(y_segment_frames.T, axis=0)

    # --- FIX: This check prevents the warning on short user-selected segments ---
    if len(y_segment) < MIN_SAMPLES_FOR_ANALYSIS:
        raise ValueError(
            f"The selected audio segment is too short for analysis. Please select a segment longer than {MIN_SAMPLES_FOR_ANALYSIS / sr:.2f} seconds.")

    local_chroma = librosa.feature.chroma_cqt(y=y_segment, sr=sr)
    local_avg_chroma = local_chroma.mean(axis=1)
    local_key_info = utils.find_best_key(local_avg_chroma)
    local_key_obj = utils.get_key_object(local_key_info["key_signature"])
    logger.info(
        f"Local key detected: {local_key_info['key_signature']} with match score {local_key_info['confidence']:.2f}")

    # --- Step 3: Classification ---
    logger.info("Classifying region type (modulation vs. shift)...")
    local_cadence_info = utils.detect_cadences(local_chroma, local_key_obj)
    region_info = utils.classify_region_type(
        global_key=global_key_obj,
        local_key=local_key_obj,
        local_key_confidence=local_key_info["confidence"],
        local_cadence=local_cadence_info
    )
    logger.info(f"Region classified as: {region_info['type']} with confidence {region_info['confidence']:.2f}")

    # --- Step 4 & 5: Assemble Output ---
    logger.info("Assembling final response.")
    local_chromagram_plot = utils.plot_chromagram(local_chroma, sr,
                                                  f"Local Chromagram ({segment_start_sec:.1f}s - {segment_end_sec:.1f}s)")
    local_histogram_plot = utils.plot_histogram(local_avg_chroma, "Local Pitch Distribution")

    return ModeAnalysisResponse(
        global_=GlobalAnalysis(**global_key_info),
        local=LocalAnalysis(
            segment_start=segment_start_sec,
            segment_end=segment_end_sec,
            tonic=local_key_info["tonic"],
            key_signature=local_key_info["key_signature"],
            mode=local_key_info["mode"],
            match_score=local_key_info["confidence"],
            region_type=region_info["type"],
            region_confidence=region_info["confidence"]
        ),
        analysis=AnalysisDetails(
            chromagram_summary=local_avg_chroma.tolist(),
            cadence_detected=local_cadence_info["detected"],
            borrowed_tones=region_info["borrowed"],
            cadential_strength=local_cadence_info["strength"]
        ),
        visuals=VisualsResponse(
            visuals=[
                VisualizationItem(name="local_chromagram", scope="local",
                                  image_base64=f"data:image/png;base64,{local_chromagram_plot}"),
                VisualizationItem(name="local_histogram", scope="local",
                                  image_base64=f"data:image/png;base64,{local_histogram_plot}")
            ]
        )
    )


@app.post(
    "/analyze-mode/",
    response_model=ModeAnalysisResponse,
    summary="Analyze global and local musical context of an audio file"
)
async def analyze_mode_endpoint(
        audio: UploadFile = File(..., description="The audio file to analyze (e.g., WAV, MP3)"),
        start: float = Form(0.0, description="Start time in seconds for the local segment analysis."),
        end: Optional[float] = Form(None,
                                    description="End time in seconds for the local segment analysis. If not provided, analysis uses the full audio.")
) -> ModeAnalysisResponse:
    """
    Performs a comprehensive musical analysis on an audio file.

    - **Global Analysis**: Determines the overall parent key and mode for the entire file.
    - **Local Analysis**: Focuses on a specific time segment to find its key and mode.
    - **Contextual Classification**: Classifies the local segment as a stable region, a temporary 'modal_shift', or a full 'modulation'.
    - **Detailed Metrics**: Provides supporting data like cadence detection, borrowed tones, and chromagram summaries.
    """
    logger.info(f"Received analysis request for file: {audio.filename}")

    if end is not None and end < start:
        raise HTTPException(status_code=400, detail="The 'end' time cannot be earlier than the 'start' time.")

    temp_audio_filepath = None
    try:
        # Use a temporary file to handle the upload, as soundfile needs a seekable source.
        with NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[1]) as temp_audio_file:
            content = await audio.read()
            temp_audio_file.write(content)
            temp_audio_filepath = temp_audio_file.name
        logger.info(f"Audio content saved to temporary file: {temp_audio_filepath}")

        # Delegate all the heavy lifting to the analysis function
        return _perform_analysis(
            filepath=temp_audio_filepath,
            start_time=start,
            end_time=end
        )

    except ValueError as e:
        # Catch specific, known errors from our logic and return a 400 Bad Request
        logger.warning(f"Analysis validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Catch unexpected errors and return a 500 Internal Server Error
        logger.error(f"An unexpected error occurred during analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")
    finally:
        # Ensure the temporary file is always cleaned up
        if temp_audio_filepath and os.path.exists(temp_audio_filepath):
            os.remove(temp_audio_filepath)
            logger.info(f"Cleaned up temporary file: {temp_audio_filepath}")