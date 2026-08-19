/**
 * NEO backend — Express + MongoDB + Gemini.
 * Connects (and pings) MongoDB first, then starts the HTTP server.
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import { chatRouter } from './routes/chat.js'
import { sessionsRouter } from './routes/sessions.js'

const app = express()
const PORT = Number(process.env.PORT ?? 5000)

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/chat', chatRouter)
app.use('/api/sessions', sessionsRouter)

async function main(): Promise<void> {
  // First make the MongoDB connection work (fail fast if it doesn't).
  await connectDB()

  app.listen(PORT, () => {
    console.log(`[NEO] backend on http://localhost:${PORT}`)
    console.log(`[NEO] Gemini: ${process.env.GEMINI_API_KEY ? 'enabled' : 'disabled (set GEMINI_API_KEY)'}`)
  })
}

main().catch((err) => {
  console.error('[NEO] startup failed:', (err as Error).message)
  process.exit(1)
})
