/** Shared NEO data contract — identical to the frontend `NeoMetrics` type. */
export interface NeoMetrics {
  timestamp: number
  faceDetected: boolean
  gaze: { direction: 'CENTER' | 'LEFT' | 'RIGHT' | 'AWAY' }
  eyes: { open: boolean; blink: boolean }
  blinkRate: number
  attentionScore: number
  fatigueIndicator: number
  status: 'FOCUSED' | 'DISTRACTED' | 'FATIGUED'
}

/** Commands the backend can dispatch to the ESP32 speaker device. */
export type NeoCommand = 'FOCUS_LOW' | 'BREAK' | 'GREETING' | 'CUSTOM_MESSAGE'

export interface SessionStats {
  active: boolean
  startedAt: number | null
  focusDurationSec: number
  currentAttention: number
  averageAttention: number
  distractionEvents: number
  samples: number
}
