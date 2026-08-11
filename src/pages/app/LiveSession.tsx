import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Square, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { sessionService, settingsService } from '@/services'
import type { Measurement, SessionRecord } from '@/services'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Stat } from '@/components/ui/Stat'
import { TrendBars } from '@/components/ui/TrendBars'

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function band(load: number): string {
  if (load < 40) return 'LOW'
  if (load < 70) return 'MODERATE'
  return 'ELEVATED'
}

export function LiveSession() {
  const { user } = useAuth()
  const uid = user!.id
  const navigate = useNavigate()

  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [current, setCurrent] = useState<Measurement | null>(null)
  const [summary, setSummary] = useState<SessionRecord | null>(null)
  const [, forceRender] = useState(0)

  const samplesRef = useRef<Measurement[]>([])
  const intervalRef = useRef<number | null>(null)

  const interval = useMemo(
    () => Math.max(1, settingsService.get(uid).session.sampleIntervalSec),
    [uid],
  )

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [])

  const start = () => {
    samplesRef.current = []
    setSummary(null)
    setElapsed(0)
    sessionService.startSession(uid)
    const first = sessionService.generateSample(0)
    samplesRef.current.push(first)
    setCurrent(first)
    setRunning(true)

    let e = 0
    intervalRef.current = window.setInterval(() => {
      e += 1
      setElapsed(e)
      if (e % interval === 0) {
        const m = sessionService.generateSample(e)
        samplesRef.current.push(m)
        setCurrent(m)
        forceRender((v) => v + 1)
      }
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    const record = sessionService.endSession(uid, samplesRef.current)
    setSummary(record)
  }

  const load = current?.cognitiveLoad ?? 0
  const recentLoads = samplesRef.current.slice(-24).map((m) => m.cognitiveLoad)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Live session</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
            Cognitive check
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.05] px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neon-cyan/90">
            Demo Perception Mode · no camera
          </span>
        </div>
      </div>

      {!summary ? (
        <Panel className="mt-8 p-8">
          <div className="flex flex-col items-center text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7c8894]">
              {running ? 'Session in progress' : 'Ready when you are'}
            </p>
            <p className="mt-4 font-mono text-5xl font-medium tabular-nums text-white">
              {fmt(elapsed)}
            </p>

            {running && current && (
              <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8a97a5]">Estimated cognitive load</span>
                    <span className="text-warm">
                      {band(load)} · {load}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-green via-warm to-warm transition-all duration-500"
                      style={{ width: `${load}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Attention" value={`${current.attentionStability}%`} accent="green" />
                  <Stat label="Confidence" value={current.confidence.toFixed(2)} accent="cyan" />
                </div>
                {recentLoads.length > 1 && (
                  <div className="h-16">
                    <TrendBars values={recentLoads} max={100} highlightLast={false} />
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              {running ? (
                <Button variant="secondary" onClick={stop} leftIcon={<Square className="h-4 w-4" />}>
                  End session
                </Button>
              ) : (
                <Button onClick={start} leftIcon={<Play className="h-4 w-4" />}>
                  Start session
                </Button>
              )}
            </div>
          </div>
        </Panel>
      ) : (
        <Panel className="mt-8 p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon-green">
            Session saved
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Duration" value={fmt(summary.durationSec)} />
            <Stat label="Avg Load" value={summary.avgLoad} accent="warm" />
            <Stat label="Avg Attention" value={`${summary.avgAttention}%`} accent="green" />
            <Stat label="Confidence" value={summary.avgConfidence.toFixed(2)} accent="cyan" />
          </div>
          <div className="mt-8 flex gap-3">
            <Button onClick={() => navigate('/app/dashboard')}>Back to dashboard</Button>
            <Button variant="secondary" onClick={() => setSummary(null)}>
              New session
            </Button>
          </div>
        </Panel>
      )}
    </div>
  )
}
