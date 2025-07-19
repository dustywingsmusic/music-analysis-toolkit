from typing import Dict, List
from pydantic import BaseModel

class ModeAnalysisResponse(BaseModel):
    """
    Pydantic model for the response structure of the audio mode analysis.
    """
    duration_seconds: float
    segment_seconds: float
    sample_rate: int
    average_chroma: List[float]
    chromagram_frames: List[List[float]]
    frame_count_per_pitch_class: Dict[str, int]
    detected_notes: List[str]
    suggested_mode: str
    local_key: str
    match_scores: Dict[str, float]
    visuals: Dict[str, str] # Stores base64 encoded image strings
