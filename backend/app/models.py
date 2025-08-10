from typing import List, Literal

from pydantic import BaseModel, ConfigDict, Field


# Visualization models
class VisualizationItem(BaseModel):
    """Contextualized single visualization."""

    name: str = Field(
        ...,
        description="Name of the visualization, e.g., 'global_chromagram' or 'local_histogram'.",
    )
    scope: Literal["global", "local"] = Field(
        ...,
        description="Whether this visualization pertains to the entire audio ('global') or the selected segment ('local').",
    )
    image_base64: str = Field(
        ..., description="Base64 encoded PNG image of the visualization."
    )


# New models for global, local, and analysis details
class GlobalAnalysis(BaseModel):
    """Overall analysis for the entire audio file."""

    tonic: str = Field(..., description="Root of the parent key.")
    key_signature: str = Field(
        ..., description="Parent key signature, e.g., 'G minor'."
    )
    mode: str = Field(..., description="Parent mode, e.g., 'Aeolian'.")
    confidence: float = Field(
        ..., description="Confidence score (0–1) for global analysis."
    )


class LocalAnalysis(BaseModel):
    """Analysis for the specific audio segment."""

    segment_start: float = Field(
        ..., description="Start time in seconds of the segment."
    )
    segment_end: float = Field(..., description="End time in seconds of the segment.")
    tonic: str = Field(..., description="Root of the local key.")
    key_signature: str = Field(..., description="Local key signature, e.g., 'C minor'.")
    mode: str = Field(..., description="Local mode, e.g., 'Aeolian'.")
    match_score: float = Field(
        ..., description="Similarity score (0–1) for the mode match."
    )
    region_type: Literal["modulation", "modal_shift", "stable"] = Field(
        ..., description="Type of region: 'modulation', 'modal_shift', or 'stable'."
    )
    region_confidence: float = Field(
        ..., description="Confidence score (0–1) for region_type classification."
    )


class AnalysisDetails(BaseModel):
    """Detailed harmonic analysis metrics."""

    chromagram_summary: List[float] = Field(
        ..., description="12-bin average chromagram for the segment."
    )
    cadence_detected: bool = Field(
        ..., description="Whether a cadential pattern was detected in the segment."
    )
    borrowed_tones: List[str] = Field(
        ..., description="List of non-diatonic notes detected."
    )
    cadential_strength: float = Field(
        ..., description="Measure (0–1) of cadence prominence."
    )


class ModeAnalysisResponse(BaseModel):
    """The complete response model for the audio mode analysis."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)
    global_: GlobalAnalysis = Field(
        ..., alias="global", description="Global analysis for the entire audio file."
    )
    local: LocalAnalysis = Field(
        ..., description="Local analysis for the selected segment."
    )
    analysis: AnalysisDetails = Field(
        ..., description="Detailed harmonic analysis metrics."
    )
    visuals: List[VisualizationItem] = Field(
        ..., description="List of generated visualizations with contextual metadata."
    )
