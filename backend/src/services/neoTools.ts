/**
 * neoTools — backend functions Gemini can call (tool/function-calling).
 * Each returns a plain JSON-serializable result. These are the ONLY way the
 * assistant reads live NEO data or triggers actions.
 */
import { getLatest, getSessionStats, startMonitoring, stopMonitoring } from '../state.js'
import { broadcast } from '../websocket.js'
import { sendCommand } from './esp32Service.js'

function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export const neoTools = {
  get_current_attention() {
    const m = getLatest()
    if (!m) return { available: false, message: 'No live metrics yet. Is the CV engine running?' }
    return {
      available: true,
      attentionScore: m.attentionScore,
      fatigueIndicator: m.fatigueIndicator,
      gaze: m.gaze.direction,
      blinkRate: m.blinkRate,
      faceDetected: m.faceDetected,
      status: m.status,
    }
  },

  get_session_stats() {
    const s = getSessionStats()
    return {
      monitoring: s.active,
      currentAttention: s.currentAttention,
      averageAttention: s.averageAttention,
      focusDuration: fmtDuration(s.focusDurationSec),
      distractionEvents: s.distractionEvents,
    }
  },

  start_monitoring() {
    startMonitoring()
    broadcast({ type: 'monitoring', payload: { active: true } })
    return { ok: true, message: 'Monitoring started.' }
  },

  stop_monitoring() {
    stopMonitoring()
    broadcast({ type: 'monitoring', payload: { active: false } })
    return { ok: true, message: 'Monitoring stopped.' }
  },

  async take_break() {
    const result = await sendCommand('BREAK')
    broadcast({ type: 'command', payload: { command: 'BREAK' } })
    return { ok: true, message: 'Suggested a short break.', device: result }
  },
} as const

export type NeoToolName = keyof typeof neoTools

export async function runTool(name: string, _args: Record<string, unknown>): Promise<unknown> {
  const fn = (neoTools as Record<string, ((a?: unknown) => unknown) | undefined>)[name]
  if (!fn) return { error: `Unknown tool: ${name}` }
  return await fn()
}
