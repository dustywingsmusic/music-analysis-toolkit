import numpy as np
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / 'app'))
from utils import suppress_harmonics


def test_fifth_attenuated():
    vec = np.zeros(12)
    vec[0] = 0.8  # C
    vec[7] = 0.6  # G (perfect fifth)
    result = suppress_harmonics(vec, threshold=0.3)
    assert result[7] < vec[7]
    assert np.isclose(result[7], vec[7] * 0.5)
    # fundamental stays the same
    assert np.isclose(result[0], vec[0])


def test_below_threshold_no_change():
    vec = np.zeros(12)
    vec[0] = 0.2  # below threshold
    vec[7] = 0.6
    result = suppress_harmonics(vec, threshold=0.3)
    assert np.allclose(result, vec)


def test_multiple_notes():
    vec = np.zeros(12)
    vec[2] = 0.8  # D
    vec[9] = 0.7  # A (fifth of D)
    vec[7] = 0.75  # G
    result = suppress_harmonics(vec, threshold=0.3)
    # A should be attenuated by D
    assert np.isclose(result[9], vec[9] * 0.5)
    # D suppressed by G
    assert np.isclose(result[2], vec[2] * 0.5)
