/**
 * Session + metrics endpoints.
 *   POST /api/sessions              create a session
 *   GET  /api/sessions/:id          fetch a session
 *   POST /api/sessions/:id/end      end + aggregate a session
 *   POST /api/sessions/:id/metrics  append a derived metric sample
 */
import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { collections } from '../db.js'
import type { GazeDirection, MetricDoc, SessionStatus } from '../types.js'

export const sessionsRouter = Router()

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null
}

const round = (n: number) => Math.round(n)

// Create a session
sessionsRouter.post('/', async (req, res) => {
  const userId = typeof req.body?.userId === 'string' ? req.body.userId : undefined
  const { sessions } = collections()
  const result = await sessions.insertOne({ userId, startTime: new Date() })
  res.status(201).json({ sessionId: result.insertedId.toHexString(), startTime: new Date().toISOString() })
})

// Fetch a session
sessionsRouter.get('/:id', async (req, res) => {
  const _id = toObjectId(req.params.id)
  if (!_id) return res.status(400).json({ error: 'Invalid session id.' })
  const { sessions } = collections()
  const session = await sessions.findOne({ _id })
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  res.json({ sessionId: req.params.id, ...session })
})

// Append a metric sample to a session
sessionsRouter.post('/:id/metrics', async (req, res) => {
  const _id = toObjectId(req.params.id)
  if (!_id) return res.status(400).json({ error: 'Invalid session id.' })

  const b = req.body ?? {}
  if (typeof b.attentionScore !== 'number') {
    return res.status(400).json({ error: 'attentionScore (number) is required.' })
  }

  const metric: MetricDoc = {
    sessionId: req.params.id,
    userId: typeof b.userId === 'string' ? b.userId : undefined,
    attentionScore: b.attentionScore,
    fatigueIndicator: Number(b.fatigueIndicator ?? 0),
    blinkRate: Number(b.blinkRate ?? 0),
    gaze: (b.gaze as GazeDirection) ?? 'CENTER',
    faceDetected: Boolean(b.faceDetected),
    status: (b.status as SessionStatus) ?? 'FOCUSED',
    timestamp: Number(b.timestamp ?? Date.now()),
    createdAt: new Date(),
  }
  await collections().metrics.insertOne(metric)
  res.status(201).json({ ok: true })
})

// End a session and compute aggregates from its metrics
sessionsRouter.post('/:id/end', async (req, res) => {
  const _id = toObjectId(req.params.id)
  if (!_id) return res.status(400).json({ error: 'Invalid session id.' })

  const { sessions, metrics } = collections()
  const session = await sessions.findOne({ _id })
  if (!session) return res.status(404).json({ error: 'Session not found.' })

  const samples = await metrics.find({ sessionId: req.params.id }).toArray()
  const endTime = new Date()
  const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

  // Count each transition into a DISTRACTED state as one distraction event.
  let distractionEvents = 0
  let prev: string | null = null
  for (const s of samples) {
    if (s.status === 'DISTRACTED' && prev !== 'DISTRACTED') distractionEvents += 1
    prev = s.status
  }

  const update = {
    endTime,
    averageAttention: round(mean(samples.map((s) => s.attentionScore))),
    averageBlinkRate: round(mean(samples.map((s) => s.blinkRate))),
    fatigueIndicator: samples.length ? samples[samples.length - 1].fatigueIndicator : 0,
    distractionEvents,
    focusDuration: Math.max(0, Math.round((endTime.getTime() - session.startTime.getTime()) / 1000)),
  }
  await sessions.updateOne({ _id }, { $set: update })
  res.json({ sessionId: req.params.id, ...session, ...update })
})
