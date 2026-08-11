import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

export function CTA() {
  const navigate = useNavigate()
  return (
    <section id="start" className="relative z-10 overflow-hidden border-t border-line bg-base-950 py-28 sm:py-32">
      {/* Controlled central glow — the emotional peak of the page. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(87,224,255,0.14), rgba(105,240,180,0.05) 45%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="container-x relative flex flex-col items-center text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-neon-cyan/80">
            Begin with a single session
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-white text-balance sm:text-5xl lg:text-6xl">
            Notice the shift before it becomes the day.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[#a3afba] sm:text-lg">
            Run a short, private cognitive check right in your browser. See your estimated cognitive
            load, then decide what your focus needs next.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('/app/session')}
              rightIcon={<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            >
              Start Cognitive Check
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                document.querySelector('#pipeline')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Explore the Technology
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b7783]">
            Camera access is requested only when you begin · No raw video is stored
          </p>
        </Reveal>
      </div>
    </section>
  )
}
