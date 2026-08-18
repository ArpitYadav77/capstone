"""camera.py — laptop webcam capture via OpenCV.

Provides BGR frames to the rest of the pipeline. No frames are ever written to
disk — raw camera footage is processed in memory only.
"""

from __future__ import annotations

import cv2


class Camera:
    def __init__(self, index: int = 0, width: int = 640, height: int = 480) -> None:
        self.index = index
        self.width = width
        self.height = height
        self.cap: cv2.VideoCapture | None = None

    def open(self) -> None:
        # CAP_DSHOW avoids slow start-up on Windows; harmless elsewhere.
        self.cap = cv2.VideoCapture(self.index, cv2.CAP_DSHOW)
        if not self.cap or not self.cap.isOpened():
            # Fall back to the default backend.
            self.cap = cv2.VideoCapture(self.index)
        if not self.cap or not self.cap.isOpened():
            raise RuntimeError(
                f"Could not open webcam at index {self.index}. "
                "Close other apps using the camera and try again."
            )
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)

    def read(self):
        """Return (ok, frame). Frame is mirrored so the preview feels natural."""
        if self.cap is None:
            raise RuntimeError("Camera not opened. Call open() first.")
        ok, frame = self.cap.read()
        if ok:
            frame = cv2.flip(frame, 1)  # mirror horizontally
        return ok, frame

    def release(self) -> None:
        if self.cap is not None:
            self.cap.release()
            self.cap = None

    def __enter__(self) -> "Camera":
        self.open()
        return self

    def __exit__(self, *exc) -> None:
        self.release()
