"""face_tracker.py — MediaPipe face landmark detection.

Uses MediaPipe's pretrained face-landmark model (Face Mesh, the same model that
backs the Face Landmarker task) with iris refinement enabled. No training, no
custom models. Returns landmark pixel coordinates for the current frame.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
import mediapipe as mp


@dataclass
class FaceResult:
    detected: bool
    # (N, 2) array of (x, y) pixel coordinates, or None when no face is found.
    landmarks: np.ndarray | None
    width: int
    height: int


class FaceTracker:
    def __init__(self) -> None:
        self._mesh = mp.solutions.face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,  # adds iris landmarks (indices 468–477)
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def process(self, frame_bgr) -> FaceResult:
        h, w = frame_bgr.shape[:2]
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        rgb.flags.writeable = False
        result = self._mesh.process(rgb)

        if not result.multi_face_landmarks:
            return FaceResult(detected=False, landmarks=None, width=w, height=h)

        lm = result.multi_face_landmarks[0].landmark
        pts = np.array([(p.x * w, p.y * h) for p in lm], dtype=np.float32)
        return FaceResult(detected=True, landmarks=pts, width=w, height=h)

    def close(self) -> None:
        self._mesh.close()
