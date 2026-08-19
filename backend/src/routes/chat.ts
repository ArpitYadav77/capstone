/**
 * POST /api/chat — the NEO assistant endpoint.
 *
 * 1. Validate the message.
 * 2. Fetch the latest/session metrics from MongoDB.
 * 3. Build a concise NEO context.
 * 4. Send context + message to Gemini.
 * 5. Save the exchange in `conversations`.
 * 6. Return { reply, sessionId, timestamp }.
 */
import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { collections } from '../db.js'
import { generateReply, geminiModel } from '../services/geminiService.js'

export const chatRouter = Router()

async function buildContext(userId?: string, sessionId?: string): Promise<string> {
  const { metrics, sessions } = collections()

  const filter: Record<string, unknown> = {}
  if (sessionId) filter.sessionId = sessionId
  else if (userId) filter.userId = userId

  const latest = await metrics.find(filter).sort({ timestamp: -1 }).limit(1).next()

  const session =
    sessionId && ObjectId.isValid(sessionId)
      ? await sessions.findOne({ _id: new ObjectId(sessionId) })
      : null

  const lines: string[] = []
  if (latest) {
    lines.push(
      `Current attention ${latest.attentionScore}% (${latest.status}); gaze ${latest.gaze}; ` +
        `blink rate ${latest.blinkRate}/min; fatigue indicator ${latest.fatigueIndicator}; ` +
        `face ${latest.faceDetected ? 'detected' : 'not detected'}.`,
    )
  }
  if (session) {
    const parts: string[] = []
    if (session.averageAttention != null) parts.push(`average attention ${session.averageAttention}%`)
    if (session.focusDuration != null) parts.push(`focus duration ${Math.round(session.focusDuration / 60)} min`)
    if (session.distractionEvents != null) parts.push(`${session.distractionEvents} distraction events`)
    if (session.averageBlinkRate != null) parts.push(`average blink rate ${session.averageBlinkRate}/min`)
    if (parts.length) lines.push(`Session: ${parts.join(', ')}.`)
  }

  if (lines.length === 0) return 'NEO context: no recent metrics or session data available yet.'
  return `NEO context — ${lines.join(' ')}`
}

chatRouter.post('/', async (req, res) => {
  const body = req.body ?? {}
  const message = body.message
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A non-empty "message" string is required.' })
  }

  const userId = typeof body.userId === 'string' ? body.userId : undefined
  const providedSessionId = typeof body.sessionId === 'string' && body.sessionId ? body.sessionId : undefined
  // Group this conversation under an existing session id, or a fresh one.
  const sessionId = providedSessionId ?? new ObjectId().toHexString()

  const context = await buildContext(userId, providedSessionId)

  let reply: string
  try {
    reply = await generateReply(message.trim(), context)
  } catch (err) {
    return res.status(502).json({ error: (err as Error).message })
  }

  const timestamp = new Date()
  await collections().conversations.insertOne({
    sessionId,
    userId,
    userMessage: message.trim(),
    reply,
    model: geminiModel(),
    timestamp,
  })

  res.json({ reply, sessionId, timestamp: timestamp.toISOString() })
})
