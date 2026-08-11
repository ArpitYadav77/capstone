/**
 * analyticsService — derives 7/30-day summaries and trends from stored sessions.
 * Falls back to demo summaries when the user has no sessions yet.
 */

import { sessionService } from './sessionService'
import { demoSummaries, localDate } from './demoData'
import type { DailySummary } from './types'

export interface RangeAnalytics {
  days: number
  summaries: DailySummary[]
  avgLoad: number
  avgAttention: number
  totalSessions: number
  focusMinutes: number
  /** % change in avg load, first half vs second half of the range. */
  loadTrend: number
  isDemo: boolean
}

function emptyDay(date: string): DailySummary {
  return { date, avgLoad: 0, avgAttention: 0, sessions: 0, focusMinutes: 0 }
}

function lastNDates(days: number): string[] {
  const out: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(localDate(d.getTime()))
  }
  return out
}

function getRange(userId: string, days: number): RangeAnalytics {
  const sessions = sessionService.listSessions(userId)

  if (sessions.length === 0) {
    const summaries = demoSummaries(days)
    return finalize(days, summaries, true)
  }

  // Bucket real sessions by local day.
  const buckets = new Map<string, { load: number[]; att: number[]; count: number; minutes: number }>()
  for (const s of sessions) {
    const key = localDate(s.startedAt)
    const b = buckets.get(key) ?? { load: [], att: [], count: 0, minutes: 0 }
    b.load.push(s.avgLoad)
    b.att.push(s.avgAttention)
    b.count += 1
    b.minutes += s.durationSec / 60
    buckets.set(key, b)
  }

  const summaries = lastNDates(days).map((date) => {
    const b = buckets.get(date)
    if (!b) return emptyDay(date)
    const mean = (arr: number[]) => Math.round(arr.reduce((x, y) => x + y, 0) / arr.length)
    return {
      date,
      avgLoad: mean(b.load),
      avgAttention: mean(b.att),
      sessions: b.count,
      focusMinutes: Math.round(b.minutes),
    }
  })

  return finalize(days, summaries, false)
}

function finalize(days: number, summaries: DailySummary[], isDemo: boolean): RangeAnalytics {
  const active = summaries.filter((s) => s.sessions > 0)
  const mean = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) : 0

  const half = Math.floor(summaries.length / 2)
  const firstHalf = summaries.slice(0, half).filter((s) => s.sessions > 0)
  const secondHalf = summaries.slice(half).filter((s) => s.sessions > 0)
  const a = mean(firstHalf.map((s) => s.avgLoad))
  const b = mean(secondHalf.map((s) => s.avgLoad))
  const loadTrend = a ? Math.round(((b - a) / a) * 100) : 0

  return {
    days,
    summaries,
    avgLoad: mean(active.map((s) => s.avgLoad)),
    avgAttention: mean(active.map((s) => s.avgAttention)),
    totalSessions: active.reduce((n, s) => n + s.sessions, 0),
    focusMinutes: active.reduce((n, s) => n + s.focusMinutes, 0),
    loadTrend,
    isDemo,
  }
}

export const analyticsService = {
  getRange,
  get7Day: (userId: string) => getRange(userId, 7),
  get30Day: (userId: string) => getRange(userId, 30),
}
