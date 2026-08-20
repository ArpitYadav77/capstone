import { Component, Suspense, lazy, useMemo, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NeoHeroText } from './NeoHeroText'
import { useNeoScroll } from './useNeoScroll'
import { isWebGLAvailable } from './utils'

// Heavy Three.js scene — only downloaded when actually rendered (desktop/mobile 3D).
const NeoScene = lazy(() => import('./NeoScene'))

/** Static, GPU-free premium poster in the warm light direction. */
function PosterContent() {
  const navigate = useNavigate()
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(15,181,181,0.14), transparent 65%)' }}
      />
      {/* stylized NEO face ring */}
      <div className="relative mb-10 grid h-40 w-40 place-items-center">
        <div className="absolute inset-0 rounded-full border border-teal/50 shadow-[0_20px_60px_-20px_rgba(15,156,156,0.5)]" />
        <div className="absolute inset-4 rounded-full border border-ink/10 bg-ink" />
        <div className="h-2.5 w-2.5 rounded-full bg-teal shadow-[0_0_16px_rgba(15,181,181,0.9)]" />
      </div>
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft">The engineering</p>
      <h2 className="font-display text-5xl font-semibold tracking-tightest text-ink sm:text-6xl">Inside NEO</h2>
      <p className="mt-4 max-w-md text-base text-ink-soft sm:text-lg">
        Understand your focus. Respond intelligently.
      </p>
      <Button
        variant="ink"
        size="lg"
        className="mt-8"
        onClick={() => navigate('/app/session')}
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Explore NEO
      </Button>
    </div>
  )
}

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function MobileIntro() {
  const navigate = useNavigate()
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between py-16 text-center">
      <div className="px-6">
        <h2 className="font-display text-4xl font-semibold tracking-tightest text-ink">Inside NEO</h2>
        <p className="mt-3 text-ink-soft">Premium hardware, thoughtfully engineered.</p>
      </div>
      <div className="px-6">
        <Button
          variant="ink"
          size="lg"
          className="pointer-events-auto"
          onClick={() => navigate('/app/session')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Explore NEO
        </Button>
      </div>
    </div>
  )
}

export function NeoHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { progressRef, progressMV } = useNeoScroll(heroRef)

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

  if (reducedMotion || !webgl) {
    return (
      <section id="technology" className="relative h-[100svh] w-full bg-sand">
        <PosterContent />
      </section>
    )
  }

  if (isMobile) {
    return (
      <section id="technology" className="relative h-[100svh] w-full overflow-hidden bg-sand">
        <SceneErrorBoundary fallback={<PosterContent />}>
          <Suspense fallback={<div className="absolute inset-0 bg-sand" />}>
            <NeoScene progressRef={progressRef} quality="low" />
          </Suspense>
        </SceneErrorBoundary>
        <MobileIntro />
      </section>
    )
  }

  return (
    <section id="technology" ref={heroRef} className="relative w-full bg-sand" style={{ height: '520vh' }}>
      <div className="relative sticky top-0 h-[100svh] w-full overflow-hidden">
        <SceneErrorBoundary fallback={<PosterContent />}>
          <Suspense fallback={<div className="absolute inset-0 bg-sand" />}>
            <NeoScene progressRef={progressRef} />
          </Suspense>
          <NeoHeroText progress={progressMV} />
        </SceneErrorBoundary>
      </div>
    </section>
  )
}
