import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Square, ShieldCheck, Camera, Cpu, Send, CameraOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { recommendationService, sessionService, settingsService } from '@/services'
import type { Measurement, Recommendation, SessionRecord } from '@/services'
import type { NeoMetrics, PerceptionMode } from '@/services/neoTypes'
import { neoApi } from '@/services/neoApi'
import { useBrowserCV } from '@/cv/useBrowserCV'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Stat } from '@/components/ui/Stat'
import { TrendBars } from '@/components/ui/TrendBars'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/cn'

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/** Map a live NeoMetrics sample onto the existing Measurement model. */
function metricToMeasurement(m: NeoMetrics): Measurement {
  return {
    t: m.timestamp,
    cognitiveLoad: clamp(100 - m.attentionScore),
    attentionStability: clamp(m.attentionScore),
    confidence: m.faceDetected ? 0.85 : 0.4,
  }
}

const STATUS_COLOR: Record<NeoMetrics['status'], string> = {
  FOCUSED: 'text-neon-green',
  DISTRACTED: 'text-neon-cyan',
  FATIGUED: 'text-warm',
}

function pickRecommendation(status: NeoMetrics['status']): Recommendation {
  const list = recommendationService.list()
  const id = status === 'FATIGUED' ? 'rec-gaze' : 'rec-journal'
  return list.find((r) => r.id === id) ?? list[0]
}

export function LiveSession() {
  const { user } = useAuth()
  const uid = user!.id
  const navigate = useNavigate()

  const [mode, setMode] = useState<PerceptionMode>(() =>
    settingsService.get(uid).session.demoPerception ? 'DEMO' : 'LIVE',
  )
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [demoCurrent, setDemoCurrent] = useState<Measurement | null>(null)
  const [summary, setSummary] = useState<SessionRecord | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [deviceMsg, setDeviceMsg] = useState<string | null>(null)

  const samplesRef = useRef<Measurement[]>([])
  const intervalRef = useRef<number | null>(null)
  const liveMetricsRef = useRef<NeoMetrics | null>(null)

  // In-browser camera + MediaPipe pipeline (LIVE mode only).
  const cv = useBrowserCV(mode === 'LIVE')

  // Keep a ref of the latest metric + a rolling attention timeline.
  useEffect(() => {
    liveMetricsRef.current = cv.metrics
    if (cv.metrics) setHistory((h) => [...h, cv.metrics!.attentionScore].slice(-60))
  }, [cv.metrics])

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
    setRunning(true)

    if (mode === 'DEMO') {
      const first = sessionService.generateSample(0)
      samplesRef.current.push(first)
      setDemoCurrent(first)
    } else {
      neoApi.startMonitoring().catch(() => undefined) // best-effort (backend optional)
    }

    let e = 0
    intervalRef.current = window.setInterval(() => {
      e += 1
      setElapsed(e)
      if (mode === 'DEMO') {
        const m = sessionService.generateSample(e)
        samplesRef.current.push(m)
        setDemoCurrent(m)
      } else if (liveMetricsRef.current) {
        samplesRef.current.push(metricToMeasurement(liveMetricsRef.current))
      }
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    if (mode === 'LIVE') neoApi.stopMonitoring().catch(() => undefined)
    const record = sessionService.endSession(uid, samplesRef.current)
    setSummary(record)
  }

  const sendBreak = async () => {
    try {
      await neoApi.command('BREAK')
      setDeviceMsg('Sent BREAK to NEO device.')
    } catch (err) {
      setDeviceMsg((err as Error).message)
    }
    window.setTimeout(() => setDeviceMsg(null), 3000)
  }

  const m = cv.metrics
  const recommendation = m && m.status !== 'FOCUSED' ? pickRecommendation(m.status) : null

  const cameraLabel: Record<typeof cv.status, string> = {
    idle: 'Camera idle',
    requesting: 'Requesting camera…',
    loading: 'Loading face model…',
    running: 'Live · processed locally',
    denied: 'Camera permission denied',
    error: cv.error ?? 'Camera error',
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Live session</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
            NEO monitor
          </h1>
        </div>
        {/* Mode toggle — selecting Live requests the camera */}
        <div className="inline-flex rounded-full border border-line p-1">
          {(['DEMO', 'LIVE'] as const).map((opt) => (
            <button
              key={opt}
              disabled={running}
              onClick={() => setMode(opt)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors disabled:opacity-50',
                mode === opt ? 'bg-white/[0.06] text-white' : 'text-[#8a97a5] hover:text-white',
              )}
            >
              {opt === 'DEMO' ? <Cpu className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
              {opt === 'DEMO' ? 'Demo' : 'Live'}
            </button>
          ))}
        </div>
      </div>

      {/* Status strip */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.05] px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neon-cyan/90">
            {mode === 'DEMO' ? 'Demo Perception · no camera' : 'Live Perception · webcam + MediaPipe (local)'}
          </span>
        </span>
        {mode === 'LIVE' && (
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]',
              cv.status === 'running'
                ? 'border-neon-green/25 bg-neon-green/[0.05] text-neon-green'
                : cv.status === 'denied' || cv.status === 'error'
                  ? 'border-warm/30 bg-warm/[0.06] text-warm'
                  : 'border-line bg-white/[0.02] text-[#8a97a5]',
            )}
          >
            {cv.status === 'requesting' || cv.status === 'loading' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : cv.status === 'running' ? (
              <Camera className="h-3.5 w-3.5" />
            ) : (
              <CameraOff className="h-3.5 w-3.5" />
            )}
            {cameraLabel[cv.status]}
          </span>
        )}
      </div>

      {summary ? (
        <Panel className="mt-6 p-8">
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
      ) : (
        <>
          {/* LIVE camera feed + metrics */}
          {mode === 'LIVE' && (
            <motion.div
              className="mt-6 grid gap-4 lg:grid-cols-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Camera feed */}
              <Panel className="relative overflow-hidden p-0">
                <div className="relative aspect-video w-full bg-black/40">
                  {/* Video is mirrored for a natural selfie view. */}
                  <video
                    ref={cv.videoRef}
                    muted
                    playsInline
                    autoPlay
                    className="h-full w-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {/* Overlays for non-running states */}
                  {cv.status !== 'running' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-base-950/80 px-6 text-center">
                      {cv.status === 'requesting' && (
                        <>
                          <Camera className="h-6 w-6 text-neon-cyan" />
                          <p className="text-sm text-[#c3ccd6]">Allow camera access to start the live feed.</p>
                        </>
                      )}
                      {cv.status === 'loading' && (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
                          <p className="text-sm text-[#c3ccd6]">Loading on-device face model…</p>
                        </>
                      )}
                      {cv.status === 'denied' && (
                        <>
                          <CameraOff className="h-6 w-6 text-warm" />
                          <p className="text-sm text-[#c3ccd6]">
                            Camera permission was blocked. Allow it in your browser, then retry.
                          </p>
                          <Button size="sm" variant="secondary" onClick={cv.retry}>
                            Retry camera
                          </Button>
                        </>
                      )}
                      {cv.status === 'error' && (
                        <>
                          <CameraOff className="h-6 w-6 text-warm" />
                          <p className="text-sm text-[#c3ccd6]">{cv.error}</p>
                          <Button size="sm" variant="secondary" onClick={cv.retry}>
                            Retry
                          </Button>
                        </>
                      )}
                      {cv.status === 'idle' && (
                        <p className="text-sm text-[#7c8894]">Starting camera…</p>
                      )}
                      {cv.embedded && (cv.status === 'denied' || cv.status === 'error') && (
                        <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-[#7c8894]">
                          You&apos;re viewing this inside an embedded preview, which blocks the camera.
                          Open <span className="text-neon-cyan">{`${location.origin}/app/session`}</span>{' '}
                          in a normal Chrome or Edge tab.
                        </p>
                      )}
                    </div>
                  )}
                  {/* Live badge + face indicator */}
                  {cv.status === 'running' && (
                    <>
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-base-950/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neon-green backdrop-blur">
                        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-neon-green" /> Live
                      </span>
                      <span
                        className={cn(
                          'absolute right-3 top-3 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur',
                          m?.faceDetected ? 'bg-neon-green/15 text-neon-green' : 'bg-warm/15 text-warm',
                        )}
                      >
                        {m?.faceDetected ? 'Face detected' : 'No face'}
                      </span>
                    </>
                  )}
                </div>
                <p className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b7783]">
                  Processed locally · no video is stored
                </p>
              </Panel>

              {/* Metrics */}
              <div className="flex flex-col gap-4">
                <Panel className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c8894]">
                      Attention
                    </p>
                    {m && (
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={m.status}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.25 }}
                          className={cn('font-mono text-[11px] uppercase tracking-[0.16em]', STATUS_COLOR[m.status])}
                        >
                          {m.status}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </div>
                  <p className="mt-2 font-display text-5xl font-semibold text-white">
                    {m ? <AnimatedNumber value={m.attentionScore} /> : '—'}
                    <span className="text-2xl text-[#7c8894]">/100</span>
                  </p>
                  {history.length > 1 && (
                    <div className="mt-4 h-16">
                      <TrendBars values={history} max={100} highlightLast={false} color="#69f0b4" />
                    </div>
                  )}
                </Panel>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Gaze" value={m ? m.gaze.direction : '—'} accent="cyan" />
                  <Stat label="Blink Rate" value={m ? `${Math.round(m.blinkRate)}/m` : '—'} />
                  <Stat label="Fatigue" value={m ? m.fatigueIndicator : '—'} accent="warm" />
                  <Stat label="Eyes" value={m ? (m.eyes.open ? 'Open' : 'Closed') : '—'} accent="green" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Timer + primary control */}
          <Panel className="mt-4 p-8">
            <div className="flex flex-col items-center text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7c8894]">
                {running ? 'Session in progress' : 'Ready when you are'}
              </p>
              <p className="mt-4 font-mono text-5xl font-medium tabular-nums text-white">
                {fmt(elapsed)}
              </p>
              <div className="mt-8">
                {running ? (
                  <Button variant="secondary" onClick={stop} leftIcon={<Square className="h-4 w-4" />}>
                    End session
                  </Button>
                ) : (
                  <Button
                    onClick={start}
                    disabled={mode === 'LIVE' && cv.status !== 'running'}
                    leftIcon={<Play className="h-4 w-4" />}
                  >
                    Start session
                  </Button>
                )}
              </div>
              {mode === 'LIVE' && cv.status !== 'running' && !running && (
                <p className="mt-4 max-w-sm text-[13px] text-[#7c8894]">
                  The live feed starts automatically. Allow camera access to begin.
                </p>
              )}
            </div>
          </Panel>

          {/* DEMO live readout */}
          {mode === 'DEMO' && running && demoCurrent && (
            <Panel className="mt-4 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a97a5]">Estimated cognitive load</span>
                <span className="text-warm">{demoCurrent.cognitiveLoad}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-green via-warm to-warm transition-all duration-500"
                  style={{ width: `${demoCurrent.cognitiveLoad}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Stat label="Attention" value={`${demoCurrent.attentionStability}%`} accent="green" />
                <Stat label="Confidence" value={demoCurrent.confidence.toFixed(2)} accent="cyan" />
              </div>
            </Panel>
          )}

          {/* Recommendation (LIVE, when not focused) */}
          {mode === 'LIVE' && recommendation && (
            <Panel className="mt-4 p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neon-cyan/70">
                Recommendation · {recommendation.category}
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                {recommendation.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#98a4b0]">
                {recommendation.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button size="sm" onClick={() => recommendationService.complete(uid, recommendation)}>
                  Mark complete
                </Button>
                <Button size="sm" variant="secondary" onClick={sendBreak} leftIcon={<Send className="h-4 w-4" />}>
                  Send BREAK to NEO
                </Button>
                {deviceMsg && <span className="text-[13px] text-[#8a97a5]">{deviceMsg}</span>}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}
