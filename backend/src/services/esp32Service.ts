/**
 * esp32Service — dispatch NEO commands to the ESP32 speaker device over Wi-Fi.
 *
 * The ESP32 runs a tiny HTTP server (see ../../esp32/neo_device.ino). We POST
 * the command as JSON. If ESP32_URL is not configured the call is a safe no-op
 * so the rest of the demo keeps working without hardware.
 */
import type { NeoCommand } from '../types.js'

export interface CommandResult {
  command: NeoCommand
  delivered: boolean
  detail: string
}

export async function sendCommand(command: NeoCommand, message?: string): Promise<CommandResult> {
  const base = process.env.ESP32_URL?.trim()
  if (!base) {
    console.log(`[NEO] ESP32 not configured — would send: ${command}${message ? ` "${message}"` : ''}`)
    return { command, delivered: false, detail: 'ESP32_URL not set (simulated).' }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(`${base.replace(/\/$/, '')}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, message: message ?? '' }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return {
      command,
      delivered: res.ok,
      detail: res.ok ? 'Delivered to ESP32.' : `ESP32 responded ${res.status}.`,
    }
  } catch (err) {
    return {
      command,
      delivered: false,
      detail: `ESP32 unreachable: ${(err as Error).message}`,
    }
  }
}
