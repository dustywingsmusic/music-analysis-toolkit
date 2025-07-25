import numpy as np
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))
from utils import suppress_harmonics


def test_suppress_harmonics_attenuates_fifth_bin():
    vec = np.zeros(12)
    vec[0] = 1.0
    vec[7] = 0.5
    out = suppress_harmonics(vec, threshold=0.5)
    assert out[7] < vec[7]
    assert np.isclose(out[0], vec[0])


def test_suppress_harmonics_disabled_no_change():
    vec = np.random.rand(12)
    out = suppress_harmonics(vec, threshold=0.0)
    assert np.allclose(out, vec)

