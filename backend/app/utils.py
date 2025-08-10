# /Users/samwachtel/PycharmProjects/music_modes_app/backend/app/utils.py
import base64
import logging
from io import BytesIO
from typing import Any, Dict, List, Tuple

import librosa
import librosa.display

# This MUST be done before importing pyplot
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from music21 import key, pitch, scale

# --- Constants and Configuration ---
PITCH_CLASSES: List[str] = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
]

# Krumhansl-Schmuckler key profiles for correlation
KS_PROFILES = {
    "major": [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
    "minor": [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
}


# --- Core Analysis Functions ---


def find_best_key(chroma_vector: np.ndarray) -> Dict[str, Any]:
    """
    Finds the best-fitting key for a chroma vector using Krumhansl-Schmuckler profiles.
    Returns a dictionary with key, mode, tonic, and confidence.
    """
    if np.linalg.norm(chroma_vector) < 1e-6:
        return {
            "key_signature": "N/A",
            "mode": "N/A",
            "tonic": "N/A",
            "confidence": 0.0,
        }

    correlations = {}
    for tonic_pc, tonic_name in enumerate(PITCH_CLASSES):
        for mode_name, profile_data in KS_PROFILES.items():
            profile = np.roll(profile_data, tonic_pc)
            # Calculate Pearson correlation coefficient
            corr = np.corrcoef(chroma_vector, profile)[0, 1]
            full_key_name = f"{tonic_name} {mode_name}"
            correlations[full_key_name] = corr

    best_key = max(correlations, key=correlations.get)
    confidence = correlations[best_key]

    # Normalize confidence to be 0-1 for easier interpretation
    confidence = (confidence + 1) / 2 if not np.isnan(confidence) else 0.0

    tonic_name, mode_name = best_key.split()
    mode_map = {"major": "Ionian", "minor": "Aeolian"}

    return {
        "key_signature": best_key,
        "mode": mode_map.get(mode_name, mode_name),
        "tonic": tonic_name,
        "confidence": round(confidence, 4),
    }


def detect_cadences(chroma: np.ndarray, key_obj: key.Key) -> Dict[str, Any]:
    """
    Simplified cadence detector looking for V-I or V-i harmonic prominence.
    A real implementation would use temporal chord progression analysis.
    """
    avg_chroma = chroma.mean(axis=1)
    if np.linalg.norm(avg_chroma) < 1e-6:
        return {"detected": False, "strength": 0.0}

    tonic_pc = key_obj.tonic.pitchClass
    dominant_pc = (tonic_pc + 7) % 12

    # Check if dominant and tonic are among the top 3 most prominent notes
    top_indices = np.argsort(avg_chroma)[-3:]
    is_cadence_like = tonic_pc in top_indices and dominant_pc in top_indices

    if is_cadence_like:
        # Strength is the combined normalized energy of tonic and dominant
        strength = (avg_chroma[tonic_pc] + avg_chroma[dominant_pc]) / np.sum(avg_chroma)
        # Heuristically scale strength to be more intuitive (0-1)
        strength = min(round(strength * 2.5, 2), 1.0)
        return {"detected": True, "strength": strength}

    return {"detected": False, "strength": 0.0}


def classify_region_type(
    global_key: key.Key,
    local_key: key.Key,
    local_key_confidence: float,
    local_cadence: Dict,
) -> Dict[str, Any]:
    """
    Classifies the local segment as a modulation, modal shift, or stable.
    """
    if global_key.name == local_key.name:
        return {"type": "stable", "confidence": 0.95, "borrowed": []}

    global_pcs = {p.pitchClass for p in global_key.getScale().getPitches()}
    local_pcs = {p.pitchClass for p in local_key.getScale().getPitches()}

    borrowed_pcs = local_pcs - global_pcs
    borrowed_notes = [PITCH_CLASSES[pc] for pc in borrowed_pcs]

    # Modulation criteria: new key is strongly established with a cadence.
    is_modulation = (
        local_key_confidence > 0.80
        and local_cadence["detected"]
        and local_cadence["strength"] > 0.60
    )

    if is_modulation:
        # Confidence is a weighted average of key and cadence confidence
        confidence = (local_key_confidence * 0.5) + (local_cadence["strength"] * 0.5)
        return {
            "type": "modulation",
            "confidence": round(confidence, 2),
            "borrowed": borrowed_notes,
        }

    # Otherwise, it's a modal shift (borrowed harmony without a full key change)
    # Confidence is higher if there are fewer borrowed notes
    confidence = max(0.5, 1.0 - (len(borrowed_notes) * 0.15))
    return {
        "type": "modal_shift",
        "confidence": round(confidence, 2),
        "borrowed": borrowed_notes,
    }


# --- Helpers and Visualization ---


def get_key_object(key_string: str) -> key.Key:
    """Helper to create a music21 key object from a string like 'C minor'."""
    try:
        tonic, mode = key_string.split()
        return key.Key(tonic, mode)
    except (ValueError, AttributeError):
        # Return a default key if parsing fails
        return key.Key("C", "major")


def fig_to_base64(fig) -> str:
    """Converts a matplotlib figure to a base64 encoded PNG string."""
    buf = BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def plot_chromagram(chroma: np.ndarray, sr: int, title: str) -> str:
    """Generates a chromagram plot and returns it as a base64 encoded PNG string."""
    fig, ax = plt.subplots(figsize=(8, 4))
    img = librosa.display.specshow(
        chroma, y_axis="chroma", x_axis="time", sr=sr, ax=ax, cmap="coolwarm"
    )
    fig.colorbar(img, ax=ax)
    ax.set_title(title)
    return fig_to_base64(fig)


def plot_histogram(avg_chroma: np.ndarray, title: str) -> str:
    """Generates a histogram of average pitch class activation."""
    fig, ax = plt.subplots(figsize=(6, 3))
    ax.bar(PITCH_CLASSES, avg_chroma, color="royalblue")
    ax.set_title(title)
    ax.set_ylabel("Intensity")
    ax.set_ylim(0, 1)  # Normalize y-axis for consistency
    return fig_to_base64(fig)
