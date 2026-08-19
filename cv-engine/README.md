# NEO — CV Engine

Local computer-vision engine for NEO. Reads the laptop webcam, detects
face/eye landmarks with **pretrained MediaPipe** (Face Mesh), and derives
**attention and fatigue-related behavioral indicators** using simple geometry
and rule-based scoring. **No ML training, no datasets, no emotion/stress
diagnosis.** Raw camera footage is processed in memory and never stored.

```
webcam → MediaPipe landmarks → blink (EAR) → gaze → attention/fatigue
       → NeoMetrics JSON → WebSocket → NEO backend → React dashboard
```

## Files
| File | Purpose |
|------|---------|
| `camera.py` | OpenCV webcam capture (mirrored frames) |
| `face_tracker.py` | MediaPipe face landmarks (+ iris) |
| `blink.py` | Eye Aspect Ratio → eyesOpen, blink, blinkRate, PERCLOS |
| `gaze.py` | Rule-based gaze: CENTER / LEFT / RIGHT / AWAY |
| `attention.py` | Smoothed attention score, fatigue indicator, status |
| `main.py` | Orchestrates the pipeline and streams metrics over WebSocket |
| `expression.py` | On-demand facial-expression classification via Roboflow (optional) |

## Setup
```bash
cd cv-engine
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```
> Requires Python 3.9–3.11 (MediaPipe wheels). Give the terminal camera
> permission on macOS/Windows the first time.

## Run
Start the **NEO backend** first (see `../backend`), then:
```bash
python main.py --preview          # annotated preview window
python main.py                     # headless (streams to backend only)
python main.py --ws ws://localhost:8080/cv --camera 0
```
Press `q` (in the preview window) or `Ctrl+C` to stop.

## Output — `NeoMetrics`
```json
{
  "timestamp": 1699999999999,
  "faceDetected": true,
  "gaze": { "direction": "CENTER" },
  "eyes": { "open": true, "blink": false },
  "blinkRate": 14.0,
  "attentionScore": 82,
  "fatigueIndicator": 12,
  "status": "FOCUSED"
}
```

## How the indicators work (rule-based, not medical)
- **Blink / EAR** — eye openness from the ratio of vertical to horizontal eye
  landmark distances; a blink is a brief closed→open transition. `blinkRate`
  is counted over a rolling 60 s window; PERCLOS is the closed-eye fraction.
- **Gaze** — horizontal iris position between the eye corners, plus a nose-yaw
  check for "looking away". Coarse on purpose.
- **Attention / fatigue** — a weighted rule score from face presence, gaze
  direction and how long it has been away, blink rate, eye-closure duration and
  PERCLOS, smoothed with an exponential moving average.

These are **behavioral indicators only** — NEO does not diagnose stress,
emotion, or any medical condition.

## Optional: facial-expression classification (Roboflow)

`expression.py` runs the hosted Roboflow model `facial-expression-gtvqk/1` on a
**single** image via Roboflow's Serverless Cloud API. It is **on-demand only** —
one image per call, never the continuous webcam loop — so no continuous video is
sent to the cloud. The result is a facial-expression *behavioral signal*
(label + confidence), not a medical or emotional diagnosis.

```bash
pip install inference-sdk
export ROBOFLOW_API_KEY=...          # https://app.roboflow.com/settings/api
#  (or add ROBOFLOW_API_KEY=... to cv-engine/.env)

python expression.py path/to/face.jpg      # local file
python expression.py https://.../face.jpg  # image URL
python expression.py --capture             # classify one webcam frame
python expression.py face.jpg --raw        # full Roboflow JSON
```

Example output (`summarize`):
```json
{
  "topExpression": "happy",
  "confidence": 0.55,
  "expressions": [
    { "label": "happy", "confidence": 0.55 },
    { "label": "neutral", "confidence": 0.21 }
  ]
}
```

Import it elsewhere to wire predictions into the project:
```python
from expression import classify, summarize
summary = summarize(classify("face.jpg"))
```
