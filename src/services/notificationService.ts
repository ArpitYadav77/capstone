/**
 * notificationService — user-scoped notifications, persisted via storageService.
 */

import { makeId, storageService } from './storageService'
import type { AppNotification, NotificationType } from './types'

function list(userId: string): AppNotification[] {
  return storageService
    .getScoped<AppNotification[]>(userId, 'notifications', [])
    .sort((a, b) => b.createdAt - a.createdAt)
}

function add(
  userId: string,
  input: { title: string; body: string; type?: NotificationType },
): AppNotification {
  const notification: AppNotification = {
    id: makeId(),
    title: input.title,
    body: input.body,
    type: input.type ?? 'info',
    createdAt: Date.now(),
    read: false,
  }
  const next = [notification, ...list(userId)].slice(0, 50)
  storageService.setScoped(userId, 'notifications', next)
  return notification
}

function markRead(userId: string, id: string): void {
  const next = list(userId).map((n) => (n.id === id ? { ...n, read: true } : n))
  storageService.setScoped(userId, 'notifications', next)
}

function markAllRead(userId: string): void {
  const next = list(userId).map((n) => ({ ...n, read: true }))
  storageService.setScoped(userId, 'notifications', next)
}

function unreadCount(userId: string): number {
  return list(userId).filter((n) => !n.read).length
}

export const notificationService = { list, add, markRead, markAllRead, unreadCount }
