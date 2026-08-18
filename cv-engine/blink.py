"""blink.py — Eye Aspect Ratio (EAR) blink detection.

Pure geometry on MediaPipe eye landmarks — no ML. Outputs eyesOpen, per-frame
blink events, blink rate (per minute), current eye-closure duration, and a
PERCLOS-style closed fraction used later as a fatigue-related indicator.
"""

from __future__ import annotations

import time
from collections import deque

import numpy as np

# MediaPipe Face Mesh indices for the 6 EAR points, per eye.
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

EAR_THRESHOLD = 0.21  # below this the eye is considered closed
CLOSED_FRAMES_FOR_BLINK = 1  # min consecutive closed frames to accept a blink


def _ear(pts: np.ndarray, idx: list[int]) -> float:
    p1, p2, p3, p4, p5, p6 = (pts[i] for i in idx)
    vertical = np.linalg.norm(p2 - p6) + np.linalg.norm(p3 - p5)
    horizontal = 2.0 * np.linalg.norm(p1 - p4)
    if horizontal == 0:
        return 0.0
    return float(vertical / horizontal)


class BlinkDetector:
    def __init__(self, window_sec: float = 60.0, perclos_sec: float = 20.0) -> None:
        self.window_sec = window_sec
        self.perclos_sec = perclos_sec
        self._blink_times: deque[float] = deque()
        self._closed_frames = 0
        self._closed_since: float | None = None
        self._perclos: deque[tuple[float, bool]] = deque()

    def update(self, landmarks: np.ndarray) -> dict:
        now = time.time()
        ear = (_ear(landmarks, LEFT_EYE) + _ear(landmarks, RIGHT_EYE)) / 2.0
        closed = ear < EAR_THRESHOLD
        eyes_open = not closed

        blink = False
        if closed:
            self._closed_frames += 1
            if self._closed_since is None:
                self._closed_since = now
        else:
            # Rising edge: eyes just reopened after being closed → count a blink.
            if self._closed_frames >= CLOSED_FRAMES_FOR_BLINK:
                self._blink_times.append(now)
                blink = True
            self._closed_frames = 0
            self._closed_since = None

        # Trim blink history to the rolling window and compute rate/min.
        while self._blink_times and now - self._blink_times[0] > self.window_sec:
            self._blink_times.popleft()
        elapsed = min(self.window_sec, max(1.0, now - (self._blink_times[0] if self._blink_times else now)))
        blink_rate = len(self._blink_times) * (60.0 / self.window_sec)

        # PERCLOS: fraction of recent time with eyes closed.
        self._perclos.append((now, closed))
        while self._perclos and now - self._perclos[0][0] > self.perclos_sec:
            self._perclos.popleft()
        closed_frac = (
            sum(1 for _, c in self._perclos if c) / len(self._perclos)
            if self._perclos
            else 0.0
        )

        closure_duration = (now - self._closed_since) if self._closed_since else 0.0

        return {
            "ear": round(ear, 3),
            "eyesOpen": eyes_open,
            "blink": blink,
            "blinkRate": round(blink_rate, 1),
            "closureDurationSec": round(closure_duration, 2),
            "perclos": round(closed_frac, 3),
        }
