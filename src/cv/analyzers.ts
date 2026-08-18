/**
 * In-browser CV analyzers — a TypeScript port of the Python cv-engine logic.
 * Pure geometry + rule-based scoring on MediaPipe face landmarks. No ML training,
 * no emotion/stress diagnosis — attention & fatigue-related behavioral indicators only.
 *
 * Landmarks are pixel coords [x, y]. Indices match MediaPipe Face Landmarker
 * (478 points incl. iris), identical to the Python engine.
 */

export type Point = [number, number]

// --- Eye Aspect Ratio (blink) ---
const LEFT_EYE = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE = [362, 385, 387, 263, 373, 380]
const EAR_THRESHOLD = 0.21

function dist(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

function earFor(pts: Point[], idx: number[]): number {
  const [p1, p2, p3, p4, p5, p6] = idx.map((i) => pts[i])
  const vertical = dist(p2, p6) + dist(p3, p5)
  const horizontal = 2 * dist(p1, p4)
  return horizontal === 0 ? 0 : vertical / horizontal
}

export interface BlinkResult {
  eyesOpen: boolean
  blink: boolean
  blinkRate: number
  closureDurationSec: number
  perclos: number
}

export class BlinkDetector {
  private blinkTimes: number[] = []
  private closedFrames = 0
  private closedSince: number | null = null
  private perclosSamples: Array<[number, boolean]> = []

  constructor(private windowSec = 60, private perclosSec = 20) {}

  update(pts: Point[], nowSec = performance.now() / 1000): BlinkResult {
    const ear = (earFor(pts, LEFT_EYE) + earFor(pts, RIGHT_EYE)) / 2
    const closed = ear < EAR_THRESHOLD

    let blink = false
    if (closed) {
      this.closedFrames += 1
      if (this.closedSince === null) this.closedSince = nowSec
    } else {
      if (this.closedFrames >= 1) {
        this.blinkTimes.push(nowSec)
        blink = true
      }
      this.closedFrames = 0
      this.closedSince = null
    }

    while (this.blinkTimes.length && nowSec - this.blinkTimes[0] > this.windowSec) {
      this.blinkTimes.shift()
    }
    const blinkRate = this.blinkTimes.length * (60 / this.windowSec)

    this.perclosSamples.push([nowSec, closed])
    while (this.perclosSamples.length && nowSec - this.perclosSamples[0][0] > this.perclosSec) {
      this.perclosSamples.shift()
    }
    const closedCount = this.perclosSamples.filter(([, c]) => c).length
    const perclos = this.perclosSamples.length ? closedCount / this.perclosSamples.length : 0

    return {
      eyesOpen: !closed,
      blink,
      blinkRate: Math.round(blinkRate * 10) / 10,
      closureDurationSec: this.closedSince ? nowSec - this.closedSince : 0,
      perclos,
    }
  }
}

// --- Gaze ---
const EYE_A_OUTER = 33
const EYE_A_INNER = 133
const IRIS_A = 468
const EYE_B_INNER = 362
const EYE_B_OUTER = 263
const IRIS_B = 473
const NOSE_TIP = 1
const LEFT_RATIO = 0.42
const RIGHT_RATIO = 0.58
const YAW_AWAY = 0.16

export type GazeDirection = 'CENTER' | 'LEFT' | 'RIGHT' | 'AWAY'

function eyeRatio(pts: Point[], outer: number, inner: number, iris: number): number {
  const xi = pts[iris][0]
  const x0 = pts[outer][0]
  const x1 = pts[inner][0]
  const lo = Math.min(x0, x1)
  const hi = Math.max(x0, x1)
  if (hi - lo < 1e-3) return 0.5
  return (xi - lo) / (hi - lo)
}

export class GazeEstimator {
  estimate(pts: Point[]): GazeDirection {
    const eyeMidX = (pts[EYE_A_OUTER][0] + pts[EYE_B_OUTER][0]) / 2
    const faceWidth = Math.abs(pts[EYE_B_OUTER][0] - pts[EYE_A_OUTER][0])
    if (faceWidth > 1e-3) {
      const yaw = (pts[NOSE_TIP][0] - eyeMidX) / faceWidth
      if (Math.abs(yaw) > YAW_AWAY) return 'AWAY'
    }
    const ratio =
      (eyeRatio(pts, EYE_A_OUTER, EYE_A_INNER, IRIS_A) +
        eyeRatio(pts, EYE_B_INNER, EYE_B_OUTER, IRIS_B)) /
      2
    if (ratio < LEFT_RATIO) return 'LEFT'
    if (ratio > RIGHT_RATIO) return 'RIGHT'
    return 'CENTER'
  }
}

// --- Attention & fatigue (smoothed rule-based) ---
const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))

export interface AttentionResult {
  attentionScore: number
  fatigueIndicator: number
  distraction: boolean
  status: 'FOCUSED' | 'DISTRACTED' | 'FATIGUED'
}

export class AttentionEngine {
  private att = 100
  private fatigue = 0
  private awaySince: number | null = null

  update(
    faceDetected: boolean,
    gaze: GazeDirection,
    blink: BlinkResult,
    nowSec = performance.now() / 1000,
  ): AttentionResult {
    if (!faceDetected || gaze !== 'CENTER') {
      if (this.awaySince === null) this.awaySince = nowSec
    } else {
      this.awaySince = null
    }
    const awayDur = this.awaySince ? nowSec - this.awaySince : 0

    let fatigueRaw = 0
    fatigueRaw += blink.perclos * 120
    fatigueRaw += Math.min(40, blink.closureDurationSec * 25)
    if (blink.blinkRate > 26) fatigueRaw += (blink.blinkRate - 26) * 2
    fatigueRaw = clamp(fatigueRaw)

    let attRaw: number
    if (!faceDetected) {
      attRaw = 12
    } else {
      attRaw = 100
      if (gaze !== 'CENTER') attRaw -= 20
      if (gaze === 'AWAY') attRaw -= 25
      attRaw -= Math.min(30, awayDur * 6)
      attRaw -= fatigueRaw * 0.2
    }
    attRaw = clamp(attRaw)

    this.att += 0.15 * (attRaw - this.att)
    this.fatigue += 0.1 * (fatigueRaw - this.fatigue)

    const attentionScore = Math.round(this.att)
    const fatigueIndicator = Math.round(this.fatigue)
    const distraction = attentionScore < 55 || (gaze === 'AWAY' && awayDur > 2)

    let status: AttentionResult['status']
    if (fatigueIndicator >= 60) status = 'FATIGUED'
    else if (distraction || attentionScore < 50) status = 'DISTRACTED'
    else status = 'FOCUSED'

    return { attentionScore, fatigueIndicator, distraction, status }
  }
}
