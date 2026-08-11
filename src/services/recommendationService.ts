/**
 * recommendationService — recovery recommendations + completion tracking.
 */

import { makeId, storageService } from './storageService'
import { notificationService } from './notificationService'
import { settingsService } from './settingsService'
import { RECOMMENDATION_CATALOG, localDate } from './demoData'
import type { CompletedActivity, Recommendation } from './types'

function list(): Recommendation[] {
  return RECOMMENDATION_CATALOG
}

function getCompleted(userId: string): CompletedActivity[] {
  return storageService
    .getScoped<CompletedActivity[]>(userId, 'activities', [])
    .sort((a, b) => b.completedAt - a.completedAt)
}

function complete(userId: string, rec: Recommendation): CompletedActivity {
  const activity: CompletedActivity = {
    id: makeId(),
    recommendationId: rec.id,
    title: rec.title,
    completedAt: Date.now(),
  }
  storageService.setScoped(userId, 'activities', [activity, ...getCompleted(userId)])

  if (settingsService.get(userId).notifications.recoveryNudges) {
    notificationService.add(userId, {
      title: 'Recovery logged',
      body: `Nice — you completed “${rec.title}”.`,
      type: 'recovery',
    })
  }
  return activity
}

export interface RecoveryStats {
  total: number
  thisWeek: number
  minutes: number
  streakDays: number
}

function stats(userId: string): RecoveryStats {
  const completed = getCompleted(userId)
  const catalog = list()
  const now = Date.now()
  const weekAgo = now - 1000 * 60 * 60 * 24 * 7

  const minutes = completed.reduce((sum, a) => {
    const rec = catalog.find((r) => r.id === a.recommendationId)
    return sum + (rec?.durationMin ?? 0)
  }, 0)

  // Streak: consecutive days (ending today) with at least one completion.
  const days = new Set(completed.map((a) => localDate(a.completedAt)))
  let streakDays = 0
  const cursor = new Date()
  // Allow the streak to start today or yesterday.
  if (!days.has(localDate(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(localDate(cursor.getTime()))) {
    streakDays += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    total: completed.length,
    thisWeek: completed.filter((a) => a.completedAt >= weekAgo).length,
    minutes,
    streakDays,
  }
}

export const recommendationService = { list, getCompleted, complete, stats }
