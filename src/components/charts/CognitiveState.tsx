import { Component, Suspense, lazy, useMemo, type ReactNode } from 'react'
import { Boxes } from 'lucide-react'
import { isWebGLAvailable } from '@/components/hero/utils'
import { CognitiveDepth2D } from './CognitiveDepth2D'
import { STATE_COLORS, STATE_LABEL, type CognitiveState as State, type DepthPoint } from './chartUtils'

// Heavy Three.js scene — only downloaded when the 3D path actually renders.
const CognitiveDepthScene = lazy(() => import('./CognitiveDepthScene'))

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function Legend() {
  const order: State[] = ['focused', 'healthy', 'elevated', 'fatigue']
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {order.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft">
          <span className="h-2 w-2 rounded-full" style={{ background: STATE_COLORS[s] }} aria-hidden />
          {STATE_LABEL[s]}
        </span>
      ))}
    </div>
  )
}

interface Props {
  points: DepthPoint[]
  isSample?: boolean
  height?: number
}

/**
 * "Cognitive state" depth visualization. Renders an interactive 3D scatter
 * (Focus × Load × Time) on capable desktops, and gracefully falls back to a
 * lightweight 2.5D SVG scatter on mobile, reduced-motion or no-WebGL.
 */
export function CognitiveState({ points, isSample = false, height = 320 }: Props) {
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const isMobile = useMemo(
    () =>
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches),
    [],
  )
  const webgl = useMemo(() => isWebGLAvailable(), [])
  const use3D = webgl && !reducedMotion && !isMobile && points.length > 0

  const fallback = <CognitiveDepth2D points={points} height={height} />

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
            <Boxes className="h-3.5 w-3.5" strokeWidth={1.7} /> Cognitive state
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold text-ink">Focus × Load × Time</h3>
        </div>
        {isSample && (
          <span className="rounded-full border border-line bg-card-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Sample data
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card-soft/50" style={{ height }}>
        {use3D ? (
          <SceneErrorBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <CognitiveDepthScene points={points} />
            </Suspense>
          </SceneErrorBoundary>
        ) : (
          fallback
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Legend />
        <p className="text-[11px] text-ink-muted">
          {use3D ? 'Move your cursor to rotate · hover a point for detail' : 'Hover a point for detail'}
        </p>
      </div>
    </div>
  )
}
