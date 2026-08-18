/**
 * NEO backend entry point.
 *   HTTP  → REST API (/api/neo/*) for the React app
 *   WS    → hub: /cv (Python producer) → /dashboard (React consumers)
 */
import 'dotenv/config'
import http from 'node:http'
import express from 'express'
import cors from 'cors'
import { neoRouter } from './routes/neo.js'
import { attachWebSocket } from './websocket.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8080)

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
app.use(express.json())

app.get('/', (_req, res) => res.json({ service: 'neo-backend', status: 'ok' }))
app.use('/api/neo', neoRouter)

const server = http.createServer(app)
attachWebSocket(server)

server.listen(PORT, () => {
  console.log(`[NEO] backend on http://localhost:${PORT}`)
  console.log(`[NEO] dashboard WS: ws://localhost:${PORT}/dashboard`)
  console.log(`[NEO] CV engine WS: ws://localhost:${PORT}/cv`)
  console.log(`[NEO] Gemini: ${process.env.GEMINI_API_KEY ? 'enabled' : 'disabled (set GEMINI_API_KEY)'}`)
})
