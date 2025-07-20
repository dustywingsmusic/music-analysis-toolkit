import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     [%(name)s] %(message)s'
)

import base64
from io import BytesIO
from typing import Dict, List, Tuple

import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
# Add music21 imports for music theory calculations
from music21 import interval, pitch, scale

# Define the standard 12 pitch classes
PITCH_CLASSES: List[str] = ['C', 'C#', 'D', 'D#', 'E', 'F',
                            'F#', 'G', 'G#', 'A', 'A#', 'B']

# Maps a mode to the interval its tonic is *above* the parent major tonic.
# e.g., Dorian is a Major Second (M2) above the parent major's tonic.
MODE_TO_PARENT_INTERVAL = {
    'Ionian': 'P1', 'Major': 'P1',
    'Dorian': 'M2',
    'Phrygian': 'M3',
    'Lydian': 'P4',
    'Mixolydian': 'P5',
    'Aeolian': 'M6', 'Minor': 'M6',
    'Locrian': 'M7'
}


# In order to differentiate between major and minor keys...
# The tonic (1st degree) is most important, followed by the dominant (5th) and mediant (3rd).
SCALE_WEIGHTS = {
    0: 1.0,  # Tonic (Root)
    7: 0.6,  # Dominant (5th)
    4: 0.4,  # Major Mediant (Major 3rd)
    3: 0.4,  # Minor Mediant (Minor 3rd)
}
DEFAULT_WEIGHT = 0.3 # Weight for other notes in the scale

def get_parent_major_key(full_mode_name: str) -> str:
    """
    Calculates the parent major key (key signature) for a given modal key.
    For example, for "E Phrygian", it returns "C Major".

    Args:
        full_mode_name (str): The full name of the key, e.g., "E Phrygian".

    Returns:
        str: The name of the relative major key, e.g., "C Major".
    """
    logging.info(f"Calculating parent major key for mode: {full_mode_name}")
    if full_mode_name == "N/A":
        return "N/A"

    parts = full_mode_name.split()
    if len(parts) < 2:
        return full_mode_name  # Not a standard mode, return as is

    tonic_name, mode_name = parts[0], parts[1]

    if mode_name not in MODE_TO_PARENT_INTERVAL:
        logging.warning(f"Mode '{mode_name}' not found in MODE_TO_PARENT_INTERVAL dictionary.")
        return "N/A"  # Unknown mode

    try:
        tonic_pitch = pitch.Pitch(tonic_name)
        transposition_interval_str = MODE_TO_PARENT_INTERVAL[mode_name]
        transposition_interval = interval.Interval(transposition_interval_str)

        # Calculate the parent major key by transposing the tonic down
        reversed_interval = transposition_interval.reverse()
        parent_major_tonic = tonic_pitch.transpose(reversed_interval)

        readable_tonic_name = parent_major_tonic.name.replace('-', '♭')

        return f"{readable_tonic_name} Major"
    except Exception as e:
        logging.error(f"Failed to calculate parent major key for '{full_mode_name}'. Error: {e}", exc_info=True)
        return "N/A"

def analyze_audio_tonality(y: np.ndarray, sr: int) -> Tuple[str, str]:
    """
    Performs a tonal analysis on an audio signal to find the best-fitting mode and its tonic.

    Args:
        y (np.ndarray): The audio time series.
        sr (int): The sample rate of the audio.

    Returns:
        A tuple containing:
        - The detected full mode name (e.g., "C Major", "E Phrygian").
        - The detected tonic (e.g., "C", "E").
    """
    # Extract a chromagram from the audio signal
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    # Calculate the average pitch class activation across the signal
    avg_chroma = chroma.mean(axis=1)
    # Use the guess_mode function to find the best-matching mode and tonic
    full_mode, tonic, _ = guess_mode(avg_chroma)
    return full_mode, tonic


def guess_mode(chroma_vector: np.ndarray) -> Tuple[str, str, Dict[str, float]]:
    """
    Matches a given chroma vector to known musical scales/modes using cosine similarity
    with musically-weighted templates for improved accuracy between relative keys.

    Args:
        chroma_vector (np.ndarray): A 12-element numpy array representing the
                                    average pitch class activation.

    Returns:
        Tuple[str, str, Dict[str, float]]: A tuple containing:
            - best_mode_name (str): The name of the best-matching mode (e.g., "B Minor").
            - tonic (str): The tonic of the best-matching mode (e.g., "B").
            - match_scores (Dict[str, float]): A dictionary of all tested modes
                                                and their similarity scores.
    """
    match_scores: Dict[str, float] = {}
    best_score: float = -1.0
    best_mode: str | None = None

    norm_val = np.linalg.norm(chroma_vector)
    if norm_val < 1e-6:
        return "N/A", "N/A", {}
    norm_chroma_vector = chroma_vector / norm_val

    for tonic_pc, tonic_name in enumerate(PITCH_CLASSES):
        for scale_class in [
            scale.MajorScale, scale.MinorScale, scale.DorianScale,
            scale.PhrygianScale, scale.LydianScale, scale.MixolydianScale,
            scale.LocrianScale
        ]:
            try:
                sc = scale_class(tonic_name)

                # --- Build the new WEIGHTED scale vector ---
                scale_vector = np.zeros(12)
                # Get the pitch classes of the scale's notes
                pcs_in_scale = {p.pitchClass for p in sc.getPitches(f'{tonic_name}1', f'{tonic_name}2')}

                for pc in pcs_in_scale:
                    # Calculate the interval from the tonic to the current note
                    interval_from_tonic = (pc - tonic_pc + 12) % 12
                    # Assign weight based on the interval's importance
                    scale_vector[pc] = SCALE_WEIGHTS.get(interval_from_tonic, DEFAULT_WEIGHT)

                # Normalize the weighted template vector
                norm_scale_vector = scale_vector / np.linalg.norm(scale_vector)

                # Calculate cosine similarity
                sim = float(np.dot(norm_chroma_vector, norm_scale_vector))
                name = f"{tonic_name} {scale_class.__name__.replace('Scale', '')}"
                match_scores[name] = round(sim, 4)

                if sim > best_score:
                    best_score = sim
                    best_mode = name
            except Exception:
                continue

    tonic = best_mode.split()[0] if best_mode else "N/A"
    best_mode_name = best_mode if best_mode else "N/A"
    return best_mode_name, tonic, match_scores

def plot_chromagram(chroma: np.ndarray, sr: int) -> str:
    """
    Generates a chromagram plot and returns it as a base64 encoded PNG string.

    Args:
        chroma (np.ndarray): The chromagram data (e.g., from librosa.feature.chroma_cqt).
        sr (int): The sample rate of the audio.

    Returns:
        str: Base64 encoded string of the chromagram plot image.
    """
    # Create a new figure and axes for the plot
    fig, ax = plt.subplots(figsize=(8, 4))
    # Display the chromagram using librosa's display function
    img = librosa.display.specshow(chroma, y_axis='chroma', x_axis='time', sr=sr, ax=ax, cmap='coolwarm')
    # Add a color bar to the plot
    fig.colorbar(img, ax=ax)
    # Set the title of the plot
    ax.set_title("Chromagram (CQT)")
    # Convert the matplotlib figure to a base64 string
    return fig_to_base64(fig)

def plot_histogram(avg_chroma: np.ndarray) -> str:
    """
    Generates a histogram plot of average pitch class activation and returns it
    as a base64 encoded PNG string.

    Args:
        avg_chroma (np.ndarray): A 12-element numpy array of average pitch class activations.

    Returns:
        str: Base64 encoded string of the histogram plot image.
    """
    # Create a new figure and axes for the plot
    fig, ax = plt.subplots(figsize=(6, 2))
    # Create a bar chart of average chroma values against pitch class names
    ax.bar(PITCH_CLASSES, avg_chroma, color='royalblue')
    # Set the title and Y-axis label
    ax.set_title("Average Pitch Class Activation")
    ax.set_ylabel("Intensity")
    # Convert the matplotlib figure to a base64 string
    return fig_to_base64(fig)

def fig_to_base64(fig) -> str:
    """
    Converts a matplotlib figure to a base64 encoded PNG string.

    Args:
        fig: The matplotlib figure object.

    Returns:
        str: Base64 encoded string of the PNG image.
    """
    # Create a BytesIO buffer to save the figure
    buf = BytesIO()
    # Adjust layout to prevent labels from overlapping
    fig.tight_layout()
    # Save the figure to the buffer in PNG format
    fig.savefig(buf, format='png')
    # Close the figure to free up memory
    plt.close(fig)
    # Seek to the beginning of the buffer
    buf.seek(0)
    # Read the buffer content, base64 encode it, and decode to a UTF-8 string
    return base64.b64encode(buf.read()).decode('utf-8')
