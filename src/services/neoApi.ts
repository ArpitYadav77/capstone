/**
 * neoApi — REST client for the NEO backend.
 * Base URL is configurable via VITE_NEO_API_URL (default http://localhost:5000).
 *
 * The Gemini API key and MongoDB credentials live ONLY on the backend — this
 * client just POSTs a message and receives the model's reply.
 */
import type { NeoCommand } from './neoTypes'

const BASE = (import.meta.env.VITE_NEO_API_URL as string | undefined) ?? 'http://localhost:5000'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
  return data as T
}

export interface ChatResponse {
  reply: string
  sessionId: string
  timestamp: string
}

export interface ChatOptions {
  sessionId?: string
  userId?: string
}

export const neoApi = {
  base: BASE,

  /** Ask NEO — reaches Express → MongoDB context → Gemini → saved conversation. */
  chat(message: string, opts: ChatOptions = {}): Promise<ChatResponse> {
    return post<ChatResponse>('/api/chat', {
      message,
      sessionId: opts.sessionId,
      userId: opts.userId,
    })
  },

  // --- Device/monitoring helpers (ESP32 not implemented yet; degrade gracefully) ---
  command(command: NeoCommand, message?: string) {
    return post('/api/neo/command', { command, message })
  },
  startMonitoring() {
    return post('/api/neo/monitoring/start', {})
  },
  stopMonitoring() {
    return post('/api/neo/monitoring/stop', {})
  },
}
