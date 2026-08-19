/** Shared backend document/shape types for the deskrobo database. */

export type GazeDirection = 'CENTER' | 'LEFT' | 'RIGHT' | 'AWAY'
export type SessionStatus = 'FOCUSED' | 'DISTRACTED' | 'FATIGUED'

/** A single derived metric sample (never raw video). Stored in `metrics`. */
export interface MetricDoc {
  sessionId: string
  userId?: string
  attentionScore: number
  fatigueIndicator: number
  blinkRate: number
  gaze: GazeDirection
  faceDetected: boolean
  status: SessionStatus
  timestamp: number
  createdAt: Date
}

/** A monitoring session. Stored in `sessions`. */
export interface SessionDoc {
  userId?: string
  startTime: Date
  endTime?: Date
  averageAttention?: number
  focusDuration?: number // seconds
  distractionEvents?: number
  averageBlinkRate?: number
  fatigueIndicator?: number
}

/** A saved chat exchange. Stored in `conversations`. */
export interface ConversationDoc {
  sessionId: string
  userId?: string
  userMessage: string
  reply: string
  model: string
  timestamp: Date
}
