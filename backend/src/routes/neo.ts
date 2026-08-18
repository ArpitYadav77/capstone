/** REST API for the React app: metrics snapshot, ESP32 commands, Gemini chat. */
import { Router } from 'express'
import {
  getLatest,
  getSessionStats,
  isDeviceConnected,
  startMonitoring,
  stopMonitoring,
} from '../state.js'
import { broadcast } from '../websocket.js'
import { sendCommand } from '../services/esp32Service.js'
import { chat } from '../services/geminiService.js'
import type { NeoCommand } from '../types.js'

const VALID_COMMANDS: NeoCommand[] = ['FOCUS_LOW', 'BREAK', 'GREETING', 'CUSTOM_MESSAGE']

export const neoRouter = Router()

neoRouter.get('/health', (_req, res) => {
  res.json({ ok: true, deviceConnected: isDeviceConnected() })
})

neoRouter.get('/metrics', (_req, res) => {
  res.json({
    connected: isDeviceConnected(),
    metrics: getLatest(),
    session: getSessionStats(),
  })
})

neoRouter.post('/command', async (req, res) => {
  const command = req.body?.command as NeoCommand
  const message = typeof req.body?.message === 'string' ? req.body.message : undefined
  if (!VALID_COMMANDS.includes(command)) {
    return res.status(400).json({ error: `Invalid command. Use one of: ${VALID_COMMANDS.join(', ')}` })
  }
  const result = await sendCommand(command, message)
  broadcast({ type: 'command', payload: { command, message } })
  res.json(result)
})

neoRouter.post('/monitoring/start', (_req, res) => {
  startMonitoring()
  broadcast({ type: 'monitoring', payload: { active: true } })
  res.json(getSessionStats())
})

neoRouter.post('/monitoring/stop', (_req, res) => {
  stopMonitoring()
  broadcast({ type: 'monitoring', payload: { active: false } })
  res.json(getSessionStats())
})

neoRouter.post('/chat', async (req, res) => {
  const message = req.body?.message
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Body must include a non-empty "message" string.' })
  }
  try {
    const result = await chat(message.trim())
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})
