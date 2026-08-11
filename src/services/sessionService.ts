/**
 * sessionService — live-session lifecycle + persisted session history.
 *
 * Demo Perception Mode: measurements are simulated locally (no webcam / no CV).
 * `generateSample` produces a plausible, smoothly varying signal so the live UI
 * and saved history feel real. Swap `generateSample` for MediaPipe output later
 * without changing anything else.
 */

import { makeId, storageService } from './storageService'
import { settingsService } from './settingsService'
import { notificationService } from './notificationService'
import type { Measurement, SessionRecord } from './types'

interface CurrentSession {
  id: string
  startedAt: number
}

function listSessions(userId: string): SessionRecord[] {
  return storageService
    .getScoped<SessionRecord[]>(userId, 'sessions', [])
    .sort((a, b) => b.startedAt - a.startedAt)
}

function getCurrent(userId: string): CurrentSession | null {
  return storageService.getScoped<CurrentSession | null>(userId, 'currentSession', null)
}

function startSession(userId: string): CurrentSession {
  const current: CurrentSession = { id: makeId(), startedAt: Date.now() }
  storageService.setScoped(userId, 'currentSession', current)
  return current
}

function clearCurrent(userId: string): void {
  storageService.removeScoped(userId, 'currentSession')
}

/** Demo signal: smooth low-frequency drift + gentle noise, clamped to 0..100. */
function generateSample(elapsedSec: number): Measurement {
  const base = 55 + Math.sin(elapsedSec / 22) * 18 + Math.sin(elapsedSec / 7) * 6
  const load = Math.max(5, Math.min(98, Math.round(base + (Math.random() - 0.5) * 8)))
  const attention = Math.max(5, Math.min(99, Math.round(100 - load * 0.6 + (Math.random() - 0.5) * 10)))
  const confidence = Math.round((0.7 + Math.random() * 0.25) * 100) / 100
  return { t: Date.now(), cognitiveLoad: load, attentionStability: attention, confidence }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length)
}

/** Persist a finished session (duration + demo aggregates) and side effects. */
function endSession(userId: string, samples: Measurement[]): SessionRecord {
  const current = getCurrent(userId) ?? { id: makeId(), startedAt: Date.now() }
  const endedAt = Date.now()
  const durationSec = Math.max(1, Math.round((endedAt - current.startedAt) / 1000))
  const settings = settingsService.get(userId)

  const record: SessionRecord = {
    id: current.id,
    userId,
    startedAt: current.startedAt,
    endedAt,
    durationSec,
    avgLoad: avg(samples.map((s) => s.cognitiveLoad)),
    avgAttention: avg(samples.map((s) => s.attentionStability)),
    avgConfidence:
      samples.length > 0
        ? Math.round((samples.reduce((s, m) => s + m.confidence, 0) / samples.length) * 100) / 100
        : 0,
    samples: samples.length,
  }

  storageService.setScoped(userId, 'sessions', [record, ...listSessions(userId)])

  // Optionally retain raw demo measurements (privacy-gated).
  if (settings.privacy.storeMeasurements) {
    const prev = storageService.getScoped<Measurement[]>(userId, 'measurements', [])
    storageService.setScoped(userId, 'measurements', [...prev, ...samples].slice(-2000))
  }

  clearCurrent(userId)

  if (settings.notifications.sessionSummaries) {
    const mins = Math.round(durationSec / 60)
    notificationService.add(userId, {
      title: 'Session saved',
      body: `${mins} min · estimated load ${record.avgLoad} · attention ${record.avgAttention}%.`,
      type: 'info',
    })
  }
  if (settings.notifications.loadAlerts && record.avgLoad >= settings.session.autoAlertThreshold) {
    notificationService.add(userId, {
      title: 'Possible elevated cognitive load',
      body: 'Your last session showed sustained high load. A short recovery may help.',
      type: 'alert',
    })
  }

  return record
}

export const sessionService = {
  listSessions,
  getCurrent,
  startSession,
  clearCurrent,
  endSession,
  generateSample,
}
