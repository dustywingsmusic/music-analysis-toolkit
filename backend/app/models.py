# /Users/samwachtel/PycharmProjects/music_modes_app/backend/app/models.py

from typing import Dict, List
from pydantic import BaseModel, Field

class VisualsResponse(BaseModel):
    """Defines the structure for the base64 encoded visual plots."""
    chromagram_base64: str = Field(
        ...,
        description="Base64 encoded PNG image of the chromagram plot."
    )
    histogram_base64: str = Field(
        ...,
        description="Base64 encoded PNG image of the average pitch class activation histogram."
    )

class ModeAnalysisResponse(BaseModel):
    """The complete response model for the audio mode analysis."""
    duration_seconds: float = Field(
        ...,
        description="Total duration of the uploaded audio file in seconds."
    )
    segment_seconds: float = Field(
        ...,
        description="Duration of the analyzed audio segment in seconds."
    )
    sample_rate: int = Field(
        ...,
        description="Sample rate of the audio in Hz."
    )
    average_chroma: List[float] = Field(
        ...,
        description="A 12-element array representing the average activation of each pitch class (C, C#, ..., B) across the analyzed segment."
    )
    chromagram_frames: List[List[float]] = Field(
        ...,
        description="A list of 12-element arrays, where each inner array represents the pitch class activation for a single frame of the chromagram."
    )
    frame_count_per_pitch_class: Dict[str, int] = Field(
        ...,
        description="A dictionary mapping each pitch class (e.g., 'C', 'C#') to the number of frames where it had a strong activation."
    )
    detected_notes: List[str] = Field(
        ...,
        description="A list of pitch class names that were detected as significantly present in the audio segment."
    )
    suggested_mode: str = Field(
        ...,
        description="The full modal key (e.g., 'E Phrygian') that best matches the analyzed audio segment."
    )
    local_tonic: str = Field(
        ...,
        description="The tonic (root note) of the suggested mode for the segment (e.g., 'E')."
    )
    local_key_signature: str = Field(
        ...,
        description="The parent major key that shares the same notes as the local mode (e.g., 'C Major' for 'E Phrygian'). Represents the key signature."
    )
    parent_key: str = Field(
        ...,
        description="The full modal key (e.g., 'B Minor') determined for the entire audio file."
    )
    parent_tonic: str = Field(
        ...,
        description="The determined tonic (root note) for the entire audio file's primary mode."
    )
    parent_key_signature: str = Field(
        ...,
        description="The parent major key for the entire audio file's primary mode. Represents the overall key signature of the track."
    )
    match_scores: Dict[str, float] = Field(
        ...,
        description="A dictionary of similarity scores for various musical modes, indicating how well each mode matches the audio segment."
    )
    visuals: VisualsResponse = Field(
        ...,
        description="Contains base64 encoded strings of generated visualizations."
    )