import numpy as np
import sys
from pathlib import Path
import librosa

sys.path.append(str(Path(__file__).resolve().parents[1] / 'app'))


def compute_weighted_avg(y, sr=22050):
    hop = 512
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    weighted = chroma * onset_env[np.newaxis, :]
    return weighted.sum(axis=1) / np.sum(onset_env)


def test_sustain_vs_onset_weighting():
    sr = 22050
    t_long = np.linspace(0, 2.0, int(sr * 2.0), False)
    y_long = 0.5 * np.sin(2 * np.pi * 440 * t_long)

    t_short = np.linspace(0, 0.1, int(sr * 0.1), False)
    y_short = np.concatenate([0.5 * np.sin(2 * np.pi * 440 * t_short), np.zeros(int(sr * 1.9))])

    a_pc = 9  # pitch class index for A
    unweighted_ratio = (
        librosa.feature.chroma_cqt(y=y_long, sr=sr)[a_pc].mean()
        / librosa.feature.chroma_cqt(y=y_short, sr=sr)[a_pc].mean()
    )
    weighted_ratio = compute_weighted_avg(y_long, sr)[a_pc] / compute_weighted_avg(y_short, sr)[a_pc]

    assert weighted_ratio < unweighted_ratio

