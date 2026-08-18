/**
 * WebSocket hub. Two roles on one server, distinguished by path:
 *   /cv         → producer (Python CV engine) pushing NeoMetrics
 *   /dashboard  → consumers (React app) receiving live metrics + events
 *
 * Metrics from /cv are ingested into state and relayed to every /dashboard
 * client. The hub also lets the backend broadcast events (e.g. ESP32 commands).
 */
import type { Server } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
import { ingestMetrics } from './state.js'
import type { NeoMetrics } from './types.js'

const dashboards = new Set<WebSocket>()

/** Broadcast an arbitrary event to all connected dashboards. */
export function broadcast(event: unknown): void {
  const data = JSON.stringify(event)
  for (const ws of dashboards) {
    if (ws.readyState === WebSocket.OPEN) ws.send(data)
  }
}

export function attachWebSocket(server: Server): void {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (req, socket, head) => {
    const path = (req.url ?? '').split('?')[0]
    if (path !== '/cv' && path !== '/dashboard') {
      socket.destroy()
      return
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, path)
    })
  })

  wss.on('connection', (ws: WebSocket, _req: unknown, path: string) => {
    if (path === '/dashboard') {
      dashboards.add(ws)
      ws.on('close', () => dashboards.delete(ws))
      return
    }

    // /cv producer
    console.log('[NEO] CV engine connected')
    ws.on('message', (raw) => {
      try {
        const metrics = JSON.parse(raw.toString()) as NeoMetrics
        ingestMetrics(metrics)
        broadcast({ type: 'metrics', payload: metrics })
      } catch {
        // ignore malformed frames
      }
    })
    ws.on('close', () => console.log('[NEO] CV engine disconnected'))
  })
}
