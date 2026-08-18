"""gaze.py — simple rule-based gaze direction.

Estimates horizontal gaze from iris position between the eye corners, plus a
head-yaw check from the nose offset. Classifies only CENTER / LEFT / RIGHT /
AWAY. Perfect accuracy is not required — this is a coarse behavioral signal.
"""

from __future__ import annotations

import numpy as np

# Eye corners + iris centers (MediaPipe Face Mesh with refine_landmarks).
EYE_A_OUTER, EYE_A_INNER, IRIS_A = 33, 133, 468
EYE_B_INNER, EYE_B_OUTER, IRIS_B = 362, 263, 473
NOSE_TIP = 1

LEFT_RATIO = 0.42
RIGHT_RATIO = 0.58
YAW_AWAY = 0.16


def _eye_ratio(pts: np.ndarray, outer: int, inner: int, iris: int) -> float:
    x_iris = pts[iris][0]
    x0, x1 = pts[outer][0], pts[inner][0]
    lo, hi = min(x0, x1), max(x0, x1)
    if hi - lo < 1e-3:
        return 0.5
    return float((x_iris - lo) / (hi - lo))


class GazeEstimator:
    def estimate(self, pts: np.ndarray) -> str:
        # Head turned away (yaw) from nose offset relative to eye span.
        eye_mid_x = (pts[EYE_A_OUTER][0] + pts[EYE_B_OUTER][0]) / 2.0
        face_width = abs(pts[EYE_B_OUTER][0] - pts[EYE_A_OUTER][0])
        if face_width > 1e-3:
            yaw = (pts[NOSE_TIP][0] - eye_mid_x) / face_width
            if abs(yaw) > YAW_AWAY:
                return "AWAY"

        ratio = (
            _eye_ratio(pts, EYE_A_OUTER, EYE_A_INNER, IRIS_A)
            + _eye_ratio(pts, EYE_B_INNER, EYE_B_OUTER, IRIS_B)
        ) / 2.0

        if ratio < LEFT_RATIO:
            return "LEFT"
        if ratio > RIGHT_RATIO:
            return "RIGHT"
        return "CENTER"
