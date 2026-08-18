"""attention.py — rule-based attention & fatigue-related behavioral indicators.

No ML, no medical claims. Combines face presence, gaze direction (and how long
it has been away), blink rate, eye-closure duration and PERCLOS into a smoothed
attention score, a fatigue indicator, and a coarse status. Scores are smoothed
with an exponential moving average so they don't jump around frame to frame.
"""

from __future__ import annotations

import time


def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


class AttentionEngine:
    def __init__(self) -> None:
        self._att = 100.0  # smoothed attention score
        self._fatigue = 0.0  # smoothed fatigue indicator
        self._away_since: float | None = None

    def update(self, face_detected: bool, gaze: str, blink: dict) -> dict:
        now = time.time()

        # --- Gaze-away duration bookkeeping ---
        if not face_detected or gaze != "CENTER":
            if self._away_since is None:
                self._away_since = now
        else:
            self._away_since = None
        away_dur = (now - self._away_since) if self._away_since else 0.0

        # --- Fatigue (0..100) from eye-behavior geometry ---
        fatigue_raw = 0.0
        fatigue_raw += blink.get("perclos", 0.0) * 120.0  # closed-eye fraction
        fatigue_raw += min(40.0, blink.get("closureDurationSec", 0.0) * 25.0)  # long closure
        br = blink.get("blinkRate", 0.0)
        if br > 26:
            fatigue_raw += (br - 26) * 2.0
        fatigue_raw = _clamp(fatigue_raw)

        # --- Attention (0..100) rule-based ---
        if not face_detected:
            att_raw = 12.0
        else:
            att_raw = 100.0
            if gaze != "CENTER":
                att_raw -= 20.0
            if gaze == "AWAY":
                att_raw -= 25.0
            att_raw -= min(30.0, away_dur * 6.0)  # sustained away escalates
            att_raw -= fatigue_raw * 0.2  # tired → less attentive
        att_raw = _clamp(att_raw)

        # --- Exponential smoothing ---
        self._att += 0.15 * (att_raw - self._att)
        self._fatigue += 0.10 * (fatigue_raw - self._fatigue)

        attention_score = round(self._att)
        fatigue_indicator = round(self._fatigue)
        distraction = attention_score < 55 or (gaze == "AWAY" and away_dur > 2.0)

        if fatigue_indicator >= 60:
            status = "FATIGUED"
        elif distraction or attention_score < 50:
            status = "DISTRACTED"
        else:
            status = "FOCUSED"

        return {
            "attentionScore": attention_score,
            "fatigueIndicator": fatigue_indicator,
            "distraction": distraction,
            "status": status,
        }
