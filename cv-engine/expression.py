"""expression.py — on-demand facial-expression classification via Roboflow.

Runs the hosted Roboflow model `facial-expression-gtvqk/1` on a SINGLE image
(local path, URL, or one captured webcam frame) through Roboflow's Serverless
Cloud API using the `inference-sdk`.

This is deliberately ON-DEMAND (one image per call), NOT part of NEO's continuous
local webcam loop — no continuous video is ever sent to the cloud. The output is
treated as a facial-expression *behavioral signal* (label + confidence), not a
medical or emotional diagnosis.

Setup:
    pip install inference-sdk
    export ROBOFLOW_API_KEY=...        # from https://app.roboflow.com/settings/api
    #  (or put ROBOFLOW_API_KEY=... in cv-engine/.env — never committed)

Usage:
    python expression.py path/to/image.jpg
    python expression.py https://example.com/face.jpg
    python expression.py --capture           # grab one webcam frame, then classify
    python expression.py image.jpg --raw      # print the full Roboflow JSON
"""

from __future__ import annotations

import argparse
import json
import os
import sys

MODEL_ID = "facial-expression-gtvqk/1"
API_URL = "https://serverless.roboflow.com"


def _api_key() -> str | None:
    """Read the Roboflow key from the env, falling back to a local .env file."""
    key = os.environ.get("ROBOFLOW_API_KEY")
    if key:
        return key.strip()
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("ROBOFLOW_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def get_client():
    """Create the Roboflow inference client (key loaded from the environment)."""
    from inference_sdk import InferenceHTTPClient  # lazy import — heavy dependency

    api_key = _api_key()
    if not api_key:
        raise RuntimeError(
            "ROBOFLOW_API_KEY is not set. Get a key at "
            "https://app.roboflow.com/settings/api and run "
            "`export ROBOFLOW_API_KEY=...` (or add it to cv-engine/.env)."
        )
    return InferenceHTTPClient(api_url=API_URL, api_key=api_key)


def classify(image) -> dict:
    """Run the model on an image path, URL, or numpy array. Returns raw JSON."""
    client = get_client()
    return client.infer(image, model_id=MODEL_ID)


def summarize(result: dict) -> dict:
    """Normalize the response to a top expression + ranked label/confidence list."""
    preds = result.get("predictions")
    normalized: list[dict] = []
    if isinstance(preds, list):
        for p in preds:
            if isinstance(p, dict) and "class" in p:
                normalized.append(
                    {"label": p.get("class"), "confidence": round(float(p.get("confidence", 0)), 4)}
                )
    elif isinstance(preds, dict):
        for label, info in preds.items():
            conf = info.get("confidence") if isinstance(info, dict) else info
            try:
                normalized.append({"label": label, "confidence": round(float(conf), 4)})
            except (TypeError, ValueError):
                continue

    normalized.sort(key=lambda x: x["confidence"], reverse=True)

    top_label = result.get("top")
    top_conf = result.get("confidence")
    if top_label is None and normalized:
        top_label = normalized[0]["label"]
        top_conf = normalized[0]["confidence"]

    return {
        "topExpression": top_label,
        "confidence": top_conf,
        "expressions": normalized,
    }


def _capture_frame():
    """Grab one warmed-up webcam frame (RGB) using the existing Camera helper."""
    import cv2
    from camera import Camera

    with Camera() as cam:
        frame = None
        for _ in range(6):  # let auto-exposure settle
            ok, frame = cam.read()
        if frame is None:
            raise RuntimeError("Could not read a frame from the webcam.")
    # Roboflow expects RGB; OpenCV frames are BGR. Frame is not stored to disk.
    return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)


def main() -> None:
    parser = argparse.ArgumentParser(description="Facial-expression classification via Roboflow")
    parser.add_argument("image", nargs="?", help="local image path or image URL")
    parser.add_argument("--capture", action="store_true", help="classify one webcam frame")
    parser.add_argument("--raw", action="store_true", help="print the full Roboflow JSON")
    args = parser.parse_args()

    if not args.capture and not args.image:
        parser.error("provide an image path/URL, or pass --capture to use the webcam.")

    try:
        image = _capture_frame() if args.capture else args.image
        result = classify(image)
    except Exception as err:  # surface a clean message, not a stack trace
        print(f"[NEO] expression inference failed: {err}", file=sys.stderr)
        sys.exit(1)

    output = result if args.raw else summarize(result)
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
