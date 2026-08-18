import { useEffect, useRef, useState } from 'react'
import type { NeoCommand, NeoEvent, NeoMetrics } from '@/services/neoTypes'

const WS_URL = (import.meta.env.VITE_NEO_WS_URL as string | undefined) ?? 'ws://localhost:8080/dashboard'

export interface NeoLiveState {
  /** WebSocket to the backend is open. */
  wsConnected: boolean
  /** Backend has received CV metrics within the last ~3s (device streaming). */
  deviceConnected: boolean
  metrics: NeoMetrics | null
  /** Rolling attention history for the timeline (last ~60 samples). */
  history: number[]
  lastCommand: { command: NeoCommand; message?: string } | null
}

/**
 * Subscribes to the NEO backend dashboard WebSocket and exposes live metrics.
 * Only connects when `enabled` (i.e. LIVE mode). Auto-reconnects on drop.
 */
export function useNeoLive(enabled: boolean): NeoLiveState {
  const [wsConnected, setWsConnected] = useState(false)
  const [deviceConnected, setDeviceConnected] = useState(false)
  const [metrics, setMetrics] = useState<NeoMetrics | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [lastCommand, setLastCommand] = useState<NeoLiveState['lastCommand']>(null)
  const lastTsRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setWsConnected(false)
      setDeviceConnected(false)
      return
    }

    let ws: WebSocket | null = null
    let closed = false
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      ws = new WebSocket(WS_URL)
      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => {
        setWsConnected(false)
        if (!closed) reconnectTimer = setTimeout(connect, 1500)
      }
      ws.onerror = () => ws?.close()
      ws.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data as string) as NeoEvent
          if (ev.type === 'metrics') {
            setMetrics(ev.payload)
            setDeviceConnected(true)
            lastTsRef.current = Date.now()
            setHistory((h) => [...h, ev.payload.attentionScore].slice(-60))
          } else if (ev.type === 'command') {
            setLastCommand(ev.payload)
          }
        } catch {
          /* ignore malformed frames */
        }
      }
    }
    connect()

    const staleTimer = setInterval(() => {
      if (Date.now() - lastTsRef.current > 3000) setDeviceConnected(false)
    }, 1000)

    return () => {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      clearInterval(staleTimer)
      ws?.close()
    }
  }, [enabled])

  return { wsConnected, deviceConnected, metrics, history, lastCommand }
}
