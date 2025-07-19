import base64
from io import BytesIO
from typing import Dict, List, Tuple

import librosa.display
import matplotlib.pyplot as plt
import numpy as np
from music21 import scale

# Define the standard 12 pitch classes
PITCH_CLASSES: List[str] = ['C', 'C#', 'D', 'D#', 'E', 'F',
                            'F#', 'G', 'G#', 'A', 'A#', 'B']

def guess_mode(chroma_vector: np.ndarray) -> Tuple[str, str, Dict[str, float]]:
    """
    Matches a given chroma vector to known musical scales/modes using cosine similarity.

    Args:
        chroma_vector (np.ndarray): A 12-element numpy array representing the
                                    average pitch class activation.

    Returns:
        Tuple[str, str, Dict[str, float]]: A tuple containing:
            - best_mode_name (str): The name of the best-matching mode (e.g., "C Major").
            - local_key (str): The tonic of the best-matching mode (e.g., "C").
            - match_scores (Dict[str, float]): A dictionary of all tested modes
                                                and their similarity scores.
    """
    match_scores: Dict[str, float] = {}
    best_score: float = -1.0
    best_mode: str | None = None

    # Normalize the input chroma vector to unit length
    # This is crucial for cosine similarity
    norm_chroma_vector = chroma_vector / np.linalg.norm(chroma_vector)

    # Iterate through all possible tonics (C, C#, D, etc.)
    for tonic in PITCH_CLASSES:
        # Iterate through a selection of common musical scales/modes
        for scale_class in [
            scale.MajorScale, scale.MinorScale, scale.DorianScale,
            scale.PhrygianScale, scale.LydianScale, scale.MixolydianScale,
            scale.LocrianScale
        ]:
            try:
                # Create a scale object for the current tonic and scale type
                sc = scale_class(tonic)
                # Get the pitch classes present in this scale over one octave
                # 'tonic+'1'' and 'tonic+'2'' define the range for pitches
                pcs_in_scale = [p.pitchClass for p in sc.getPitches(f'{tonic}1', f'{tonic}2')]

                # Create a 12-element vector representing the current scale
                # 1s indicate notes present in the scale, 0s indicate notes not present
                scale_vector = np.zeros(12)
                for pc in pcs_in_scale:
                    scale_vector[pc] = 1
                # Normalize the scale vector
                scale_vector /= np.linalg.norm(scale_vector)

                # Calculate cosine similarity between the input chroma vector and the scale vector
                sim = float(np.dot(norm_chroma_vector, scale_vector))
                # Construct a readable name for the current mode
                name = f"{tonic} {scale_class.__name__.replace('Scale','')}"
                # Store the similarity score, rounded for readability
                match_scores[name] = round(sim, 4)

                # Update best_mode if the current score is higher
                if sim > best_score:
                    best_score = sim
                    best_mode = name
            except Exception:
                # Catch any potential errors during scale creation or processing
                # and continue to the next scale
                continue

    # Extract the local key (tonic) from the best-matching mode name
    local_key = best_mode.split()[0] if best_mode else ""
    return best_mode, local_key, match_scores

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
