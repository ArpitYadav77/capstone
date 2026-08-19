import { Component, Suspense, lazy, useMemo, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NeoHeroText } from './NeoHeroText'
import { useNeoScroll } from './useNeoScroll'
import { isWebGLAvailable } from './utils'

// Heavy Three.js scene — only downloaded when actually rendered (desktop/mobile 3D).
const NeoScene = lazy(() => import('./NeoScene'))

/** Static, GPU-free premium poster: cyan LED ring + minimal type + CTA. */
function PosterContent() {
  const navigate = useNavigate()
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* soft volumetric glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(87,224,255,0.16), transparent 65%)' }}
      />
      {/* stylized NEO face ring */}
      <div className="relative mb-10 grid h-40 w-40 place-items-center">
        <div className="absolute inset-0 rounded-full border border-neon-cyan/40 shadow-[0_0_60px_-10px_rgba(87,224,255,0.6)]" />
        <div className="absolute inset-4 rounded-full border border-white/5 bg-black/40" />
        <div className="h-2.5 w-2.5 rounded-full bg-neon-cyan shadow-[0_0_16px_rgba(87,224,255,0.9)]" />
      </div>
      <p className="eyebrow mb-4">A premium desk companion</p>
      <h1 className="font-display text-5xl font-semibold tracking-tightest text-white sm:text-6xl">
        Meet NEO
      </h1>
      <p className="mt-4 max-w-md text-base text-[#a3afba] sm:text-lg">
        Understand your focus. Respond intelligently.
      </p>
      <Button
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

/** Catches WebGL runtime failures and swaps in the static poster. */
class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

/** Simple text overlay for the mobile (non-pinned) 3D hero. */
function MobileIntro() {
  const navigate = useNavigate()
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between py-16 text-center">
      <div className="px-6">
        <h1 className="font-display text-4xl font-semibold tracking-tightest text-white">Meet NEO</h1>
        <p className="mt-3 text-[#a3afba]">Your intelligent desk companion.</p>
      </div>
      <div className="px-6">
        <Button
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

  // No animation path: reduced-motion or no WebGL → clean static poster.
  if (reducedMotion || !webgl) {
    return (
      <section className="relative h-[100svh] w-full bg-base-950">
        <PosterContent />
      </section>
    )
  }

  // Mobile: a single static 3D screen (assembled NEO), no heavy pinned scroll.
  if (isMobile) {
    return (
      <section className="relative h-[100svh] w-full overflow-hidden bg-base-950">
        <SceneErrorBoundary fallback={<PosterContent />}>
          <Suspense fallback={<div className="absolute inset-0 bg-base-950" />}>
            <NeoScene progressRef={progressRef} quality="low" />
          </Suspense>
        </SceneErrorBoundary>
        <MobileIntro />
      </section>
    )
  }

  // Desktop: full scroll-driven hero. Tall section + pinned viewport.
  return (
    <section ref={heroRef} className="relative w-full bg-base-950" style={{ height: '520vh' }}>
      <div className="relative sticky top-0 h-[100svh] w-full overflow-hidden">
        <SceneErrorBoundary fallback={<PosterContent />}>
          <Suspense fallback={<div className="absolute inset-0 bg-base-950" />}>
            <NeoScene progressRef={progressRef} />
          </Suspense>
          <NeoHeroText progress={progressMV} />
        </SceneErrorBoundary>
      </div>
    </section>
  )
}
