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
