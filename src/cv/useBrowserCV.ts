import { useCallback, useEffect, useRef, useState } from 'react'
import type { NeoMetrics } from '@/services/neoTypes'
import { AttentionEngine, BlinkDetector, GazeEstimator, type Point } from './analyzers'

// Pin the MediaPipe version so the WASM (CDN) matches the installed SDK.
const MP_VERSION = '0.10.14'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export type CvStatus = 'idle' | 'requesting' | 'loading' | 'running' | 'denied' | 'error'

export interface BrowserCV {
  videoRef: React.RefObject<HTMLVideoElement>
  status: CvStatus
  error: string | null
  metrics: NeoMetrics | null
  /** True when the app is running inside an iframe (e.g. an embedded preview). */
  embedded: boolean
  /** Re-request the camera (e.g. after a denied prompt). */
  retry: () => void
}

const isEmbedded = typeof window !== 'undefined' && window.self !== window.top

function buildMetrics(
  faceDetected: boolean,
  gaze: NeoMetrics['gaze']['direction'],
  blink: { eyesOpen: boolean; blink: boolean; blinkRate: number },
  attn: { attentionScore: number; fatigueIndicator: number; status: NeoMetrics['status'] },
): NeoMetrics {
  return {
    timestamp: Date.now(),
    faceDetected,
    gaze: { direction: gaze },
    eyes: { open: blink.eyesOpen, blink: blink.blink },
    blinkRate: blink.blinkRate,
    attentionScore: attn.attentionScore,
    fatigueIndicator: attn.fatigueIndicator,
    status: attn.status,
  }
}

/**
 * Runs the full CV pipeline locally in the browser: webcam (getUserMedia) →
 * MediaPipe Face Landmarker → blink/gaze/attention → NeoMetrics. Only active
 * when `active` is true. Raw video is processed in memory and never stored.
 */
export function useBrowserCV(active: boolean): BrowserCV {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<CvStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<NeoMetrics | null>(null)
  const [nonce, setNonce] = useState(0)

  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const landmarkerRef = useRef<{ detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: Array<Array<{ x: number; y: number }>> }; close: () => void } | null>(null)

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    landmarkerRef.current?.close()
    landmarkerRef.current = null
    setMetrics(null)
    setStatus('idle')
  }, [])

  useEffect(() => {
    if (!active) {
      stop()
      return
    }

    let cancelled = false
    const blink = new BlinkDetector()
    const gaze = new GazeEstimator()
    const attn = new AttentionEngine()
    let lastDetect = 0

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      const video = videoRef.current
      const lm = landmarkerRef.current
      if (!video || !lm || video.readyState < 2) return
      const now = performance.now()
      if (now - lastDetect < 60) return // ~16 fps
      lastDetect = now

      let result
      try {
        result = lm.detectForVideo(video, now)
      } catch {
        return
      }
      const w = video.videoWidth || 640
      const h = video.videoHeight || 480

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const pts: Point[] = result.faceLandmarks[0].map((p) => [p.x * w, p.y * h])
        const b = blink.update(pts)
        const g = gaze.estimate(pts)
        const a = attn.update(true, g, b)
        setMetrics(buildMetrics(true, g, b, a))
      } else {
        const b = { eyesOpen: false, blink: false, blinkRate: 0, closureDurationSec: 0, perclos: 0 }
        const a = attn.update(false, 'AWAY', b)
        setMetrics(buildMetrics(false, 'AWAY', b, a))
      }
    }

    const start = async () => {
      // Defer one macrotask so React StrictMode's double-invoke doesn't fire two
      // camera prompts — the first (cancelled) run bails out during this delay.
      await new Promise((r) => setTimeout(r, 0))
      if (cancelled) return

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error')
        setError(
          'Camera isn’t available here. Open the app in a normal browser tab (Chrome/Edge) over https or http://localhost — camera access is blocked inside embedded previews.',
        )
        return
      }

      try {
        setStatus('requesting')
        setError(null)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) throw new Error('Video element not ready.')
        video.srcObject = stream
        await video.play().catch(() => undefined)

        setStatus('loading')
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const resolver = await FilesetResolver.forVisionTasks(WASM_URL)
        const landmarker = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
        if (cancelled) {
          landmarker.close()
          return
        }
        landmarkerRef.current = landmarker as unknown as typeof landmarkerRef.current
        setStatus('running')
        rafRef.current = requestAnimationFrame(loop)
      } catch (e) {
        const name = (e as { name?: string }).name
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setStatus('denied')
        } else if (name === 'NotFoundError' || name === 'NotReadableError') {
          setStatus('error')
          setError('No camera available, or it is in use by another app.')
        } else {
          setStatus('error')
          setError((e as Error).message)
        }
      }
    }

    void start()
    return () => {
      cancelled = true
      stop()
    }
  }, [active, nonce, stop])

  const retry = useCallback(() => setNonce((n) => n + 1), [])

  return { videoRef, status, error, metrics, embedded: isEmbedded, retry }
}
