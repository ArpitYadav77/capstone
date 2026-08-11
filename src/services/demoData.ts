/**
 * Demo / fallback data. Used only when a user has no stored data yet, so the
 * Dashboard and Analytics never render empty. Real user data always takes
 * precedence once it exists.
 */

import type { DailySummary, Recommendation, Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  notifications: {
    sessionSummaries: true,
    loadAlerts: true,
    recoveryNudges: true,
    weeklyReport: false,
  },
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  session: { demoPerception: true, sampleIntervalSec: 2, autoAlertThreshold: 75 },
  privacy: { storeMeasurements: true, localProcessingOnly: true },
}

export const RECOMMENDATION_CATALOG: Recommendation[] = [
  {
    id: 'rec-breath',
    title: 'Box Breathing',
    description: 'Four slow cycles of 4-4-4-4 breathing to settle elevated cognitive load.',
    durationMin: 3,
    category: 'Calm',
  },
  {
    id: 'rec-gaze',
    title: '20-20-20 Gaze Reset',
    description: 'Look 20 feet away for 20 seconds to relax gaze and attention systems.',
    durationMin: 1,
    category: 'Attention',
  },
  {
    id: 'rec-stretch',
    title: 'Desk Mobility',
    description: 'Neck, shoulder and wrist mobility to release physical tension.',
    durationMin: 4,
    category: 'Body',
  },
  {
    id: 'rec-walk',
    title: 'Micro Walk',
    description: 'A short walk away from the screen to reset focus before your next block.',
    durationMin: 5,
    category: 'Movement',
  },
  {
    id: 'rec-journal',
    title: 'One-Line Reset',
    description: 'Note the single thing pulling your attention, then set it aside.',
    durationMin: 2,
    category: 'Focus',
  },
]

// Deterministic pseudo-random so demo charts look stable across reloads.
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function localDateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Stable demo daily summaries for the last `days` days (most recent last). */
export function demoSummaries(days: number): DailySummary[] {
  const out: DailySummary[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const r = seeded(i + 1)
    const r2 = seeded(i + 100)
    const sessions = Math.round(1 + r * 3)
    out.push({
      date: localDateKey(d),
      avgLoad: Math.round(45 + r * 35),
      avgAttention: Math.round(60 + r2 * 30),
      sessions,
      focusMinutes: Math.round(20 + r2 * 70),
    })
  }
  return out
}

export function localDate(ts: number): string {
  return localDateKey(new Date(ts))
}
