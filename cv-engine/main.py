"""main.py — NEO CV engine entry point.

Pipeline (all local, no raw footage stored):
    webcam → MediaPipe landmarks → blink (EAR) → gaze → attention/fatigue
    → NeoMetrics JSON → WebSocket → NEO backend → React dashboard

Run:
    python main.py                 # connect to ws://localhost:8080/cv
    python main.py --preview       # also show an annotated preview window
    python main.py --ws ws://HOST:8080/cv --camera 0

The metrics object matches the shared `NeoMetrics` TypeScript contract.
"""

from __future__ import annotations

import argparse
import json
import os
import time

import cv2

from camera import Camera
from face_tracker import FaceTracker
from blink import BlinkDetector
from gaze import GazeEstimator
from attention import AttentionEngine

try:
    import websocket  # websocket-client
except ImportError:  # pragma: no cover
    websocket = None

SEND_HZ = 12.0  # metrics messages per second


class WSClient:
    """Thin, self-healing WebSocket producer. Never fatal if backend is down."""

    def __init__(self, url: str) -> None:
        self.url = url
        self.conn = None
        self._next_retry = 0.0

    @property
    def connected(self) -> bool:
        return self.conn is not None

    def ensure(self) -> None:
        if self.conn is not None or websocket is None:
            return
        now = time.time()
        if now < self._next_retry:
            return
        try:
            self.conn = websocket.create_connection(self.url, timeout=2)
            print(f"[NEO] connected to backend at {self.url}")
        except Exception:
            self.conn = None
            self._next_retry = now + 2.0  # back off

    def send(self, payload: dict) -> None:
        self.ensure()
        if self.conn is None:
            return
        try:
            self.conn.send(json.dumps(payload))
        except Exception:
            print("[NEO] backend connection lost, will retry…")
            try:
                self.conn.close()
            except Exception:
                pass
            self.conn = None
            self._next_retry = time.time() + 2.0

    def close(self) -> None:
        if self.conn is not None:
            try:
                self.conn.close()
            except Exception:
                pass
            self.conn = None


def build_metrics(face, gaze_dir, blink_info, attn) -> dict:
    return {
        "timestamp": int(time.time() * 1000),
        "faceDetected": bool(face.detected),
        "gaze": {"direction": gaze_dir},
        "eyes": {
            "open": bool(blink_info.get("eyesOpen", False)),
            "blink": bool(blink_info.get("blink", False)),
        },
        "blinkRate": float(blink_info.get("blinkRate", 0.0)),
        "attentionScore": int(attn["attentionScore"]),
        "fatigueIndicator": int(attn["fatigueIndicator"]),
        "status": attn["status"],
    }


def draw_overlay(frame, metrics) -> None:
    color = {
        "FOCUSED": (105, 240, 105),
        "DISTRACTED": (100, 180, 255),
        "FATIGUED": (80, 120, 240),
    }.get(metrics["status"], (200, 200, 200))
    lines = [
        f"Status: {metrics['status']}",
        f"Attention: {metrics['attentionScore']}  Fatigue: {metrics['fatigueIndicator']}",
        f"Gaze: {metrics['gaze']['direction']}  BlinkRate: {metrics['blinkRate']:.0f}/min",
        f"Face: {'yes' if metrics['faceDetected'] else 'no'}",
    ]
    for i, text in enumerate(lines):
        cv2.putText(frame, text, (12, 28 + i * 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)


def main() -> None:
    parser = argparse.ArgumentParser(description="NEO CV engine")
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--preview", action="store_true", help="show annotated window")
    parser.add_argument(
        "--ws",
        default=os.environ.get("NEO_WS_URL", "ws://localhost:8080/cv"),
        help="backend WebSocket URL",
    )
    args = parser.parse_args()

    if websocket is None:
        print("[NEO] 'websocket-client' not installed. Run: pip install -r requirements.txt")

    tracker = FaceTracker()
    blink = BlinkDetector()
    gaze = GazeEstimator()
    attn = AttentionEngine()
    ws = WSClient(args.ws)

    send_interval = 1.0 / SEND_HZ
    last_send = 0.0

    print("[NEO] starting camera… press Ctrl+C (or 'q' in preview) to stop.")
    try:
        with Camera(args.camera) as cam:
            while True:
                ok, frame = cam.read()
                if not ok:
                    continue

                face = tracker.process(frame)
                if face.detected and face.landmarks is not None:
                    blink_info = blink.update(face.landmarks)
                    gaze_dir = gaze.estimate(face.landmarks)
                else:
                    blink_info = {"eyesOpen": False, "blink": False, "blinkRate": 0.0,
                                  "closureDurationSec": 0.0, "perclos": 0.0}
                    gaze_dir = "AWAY"

                attn_out = attn.update(face.detected, gaze_dir, blink_info)
                metrics = build_metrics(face, gaze_dir, blink_info, attn_out)

                now = time.time()
                if now - last_send >= send_interval:
                    ws.send(metrics)
                    last_send = now

                if args.preview:
                    draw_overlay(frame, metrics)
                    cv2.imshow("NEO — CV preview (press q to quit)", frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
    except KeyboardInterrupt:
        pass
    finally:
        ws.close()
        tracker.close()
        cv2.destroyAllWindows()
        print("\n[NEO] stopped.")


if __name__ == "__main__":
    main()
