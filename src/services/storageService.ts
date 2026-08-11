/**
 * storageService — the ONLY module that talks to window.localStorage.
 *
 * Every domain service (auth, session, analytics, …) goes through here, and no
 * React component touches localStorage directly. Because this is the single
 * boundary, the backing store can later be swapped for an HTTP client backed by
 * Node/Express + MongoDB without changing any service signature or UI code.
 *
 * Keys use the `deskrbo:` namespace. Per-user data is additionally scoped by
 * userId so different accounts never see each other's data on the same device.
 */

export const NS = 'deskrbo'

/** Global (not user-scoped) keys. */
export const GlobalKeys = {
  users: `${NS}:users`, // account registry
  session: `${NS}:session`, // current auth session/token
  user: `${NS}:user`, // current authenticated user
} as const

/** Per-user data buckets. Actual key = `deskrbo:<name>:<userId>`. */
export type ScopedName =
  | 'sessions'
  | 'measurements'
  | 'summaries'
  | 'recommendations'
  | 'activities'
  | 'notifications'
  | 'settings'
  | 'currentSession'

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const storageService = {
  get<T>(key: string, fallback: T): T {
    if (!hasStorage()) return fallback
    return safeParse<T>(window.localStorage.getItem(key), fallback)
  },

  set(key: string, value: unknown): void {
    if (!hasStorage()) return
    window.localStorage.setItem(key, JSON.stringify(value))
  },

  remove(key: string): void {
    if (!hasStorage()) return
    window.localStorage.removeItem(key)
  },

  scopedKey(userId: string, name: ScopedName): string {
    return `${NS}:${name}:${userId}`
  },

  getScoped<T>(userId: string, name: ScopedName, fallback: T): T {
    return this.get<T>(this.scopedKey(userId, name), fallback)
  },

  setScoped(userId: string, name: ScopedName, value: unknown): void {
    this.set(this.scopedKey(userId, name), value)
  },

  removeScoped(userId: string, name: ScopedName): void {
    this.remove(this.scopedKey(userId, name))
  },
}

/** Small id helper used across services (crypto UUID with a safe fallback). */
export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}
