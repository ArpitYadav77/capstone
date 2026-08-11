/**
 * Shared domain types for DeskRobo's persistence layer.
 * These are storage-agnostic — they describe the data, not where it lives.
 */

export interface User {
  id: string
  name: string
  email: string
  createdAt: number
}

/** A single demo behavioral sample (Demo Perception Mode — no real CV yet). */
export interface Measurement {
  t: number
  cognitiveLoad: number // 0..100 (estimated)
  attentionStability: number // 0..100
  confidence: number // 0..1
}

export interface SessionRecord {
  id: string
  userId: string
  startedAt: number
  endedAt: number
  durationSec: number
  avgLoad: number
  avgAttention: number
  avgConfidence: number
  samples: number
}

export interface DailySummary {
  date: string // YYYY-MM-DD (local)
  avgLoad: number
  avgAttention: number
  sessions: number
  focusMinutes: number
}

export interface Recommendation {
  id: string
  title: string
  description: string
  durationMin: number
  category: string
}

export interface CompletedActivity {
  id: string
  recommendationId: string
  title: string
  completedAt: number
}

export type NotificationType = 'info' | 'alert' | 'recovery'

export interface AppNotification {
  id: string
  title: string
  body: string
  type: NotificationType
  createdAt: number
  read: boolean
}

export interface Settings {
  notifications: {
    sessionSummaries: boolean
    loadAlerts: boolean
    recoveryNudges: boolean
    weeklyReport: boolean
  }
  quietHours: {
    enabled: boolean
    start: string // HH:MM
    end: string // HH:MM
  }
  session: {
    demoPerception: boolean
    sampleIntervalSec: number
    autoAlertThreshold: number // 0..100 cognitive load
  }
  privacy: {
    storeMeasurements: boolean
    localProcessingOnly: boolean
  }
}
