/**
 * In-memory NEO state: latest metrics + a lightweight session accumulator used
 * by the Gemini tools (get_current_attention / get_session_stats). No database —
 * the React app already persists sessions locally.
 */
import type { NeoMetrics, SessionStats } from './types.js'

let latest: NeoMetrics | null = null
let lastMetricAt = 0

const session = {
  active: false,
  startedAt: null as number | null,
  attentionSum: 0,
  samples: 0,
  distractionEvents: 0,
  lastStatus: 'FOCUSED' as NeoMetrics['status'],
}

export function ingestMetrics(m: NeoMetrics): void {
  latest = m
  lastMetricAt = Date.now()
  if (session.active) {
    session.attentionSum += m.attentionScore
    session.samples += 1
    // Count each transition INTO a distracted state as one event.
    if (m.status === 'DISTRACTED' && session.lastStatus !== 'DISTRACTED') {
      session.distractionEvents += 1
    }
    session.lastStatus = m.status
  }
}

export function getLatest(): NeoMetrics | null {
  return latest
}

/** True if the CV engine has sent metrics within the last ~3 seconds. */
export function isDeviceConnected(): boolean {
  return latest !== null && Date.now() - lastMetricAt < 3000
}

export function startMonitoring(): void {
  session.active = true
  session.startedAt = Date.now()
  session.attentionSum = 0
  session.samples = 0
  session.distractionEvents = 0
  session.lastStatus = 'FOCUSED'
}

export function stopMonitoring(): void {
  session.active = false
}

export function getSessionStats(): SessionStats {
  const focusDurationSec = session.startedAt
    ? Math.round((Date.now() - session.startedAt) / 1000)
    : 0
  return {
    active: session.active,
    startedAt: session.startedAt,
    focusDurationSec,
    currentAttention: latest?.attentionScore ?? 0,
    averageAttention: session.samples
      ? Math.round(session.attentionSum / session.samples)
      : latest?.attentionScore ?? 0,
    distractionEvents: session.distractionEvents,
    samples: session.samples,
  }
}
