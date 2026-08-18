/**
 * NEO live-metrics contract — MUST match cv-engine output and backend/src/types.ts.
 */
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

export type PerceptionMode = 'DEMO' | 'LIVE'

export type NeoCommand = 'FOCUS_LOW' | 'BREAK' | 'GREETING' | 'CUSTOM_MESSAGE'

/** Events pushed from the backend over the dashboard WebSocket. */
export type NeoEvent =
  | { type: 'metrics'; payload: NeoMetrics }
  | { type: 'command'; payload: { command: NeoCommand; message?: string } }
  | { type: 'monitoring'; payload: { active: boolean } }
