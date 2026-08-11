/**
 * settingsService — user-scoped settings, merged over defaults so new fields
 * always have a value even for older stored blobs.
 */

import { storageService } from './storageService'
import { DEFAULT_SETTINGS } from './demoData'
import type { Settings } from './types'

function merge(stored: Partial<Settings> | null): Settings {
  const d = DEFAULT_SETTINGS
  const s = stored ?? {}
  return {
    notifications: { ...d.notifications, ...s.notifications },
    quietHours: { ...d.quietHours, ...s.quietHours },
    session: { ...d.session, ...s.session },
    privacy: { ...d.privacy, ...s.privacy },
  }
}

function get(userId: string): Settings {
  return merge(storageService.getScoped<Partial<Settings> | null>(userId, 'settings', null))
}

function save(userId: string, settings: Settings): Settings {
  const merged = merge(settings)
  storageService.setScoped(userId, 'settings', merged)
  return merged
}

export const settingsService = { get, save, defaults: DEFAULT_SETTINGS }
