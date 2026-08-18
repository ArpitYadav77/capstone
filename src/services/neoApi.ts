/**
 * neoApi — REST client for the NEO backend (ESP32 commands + Gemini chat).
 * Base URL is configurable via VITE_NEO_API_URL (default http://localhost:8080).
 */
import type { NeoCommand } from './neoTypes'

const BASE = (import.meta.env.VITE_NEO_API_URL as string | undefined) ?? 'http://localhost:8080'

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
  toolsUsed: string[]
}

export const neoApi = {
  base: BASE,

  chat(message: string): Promise<ChatResponse> {
    return post<ChatResponse>('/api/neo/chat', { message })
  },

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
