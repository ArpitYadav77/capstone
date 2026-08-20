import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { HighlightUnderline } from '@/components/landing/HighlightUnderline'

export function CTA() {
  const navigate = useNavigate()
  return (
    <section id="start" className="relative overflow-hidden border-t border-ink/[0.07] bg-sand py-28 sm:py-32">
      {/* soft warm glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(198,232,90,0.14), rgba(15,181,181,0.05) 45%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="container-x relative flex flex-col items-center text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
            Begin with a single session
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink text-balance sm:text-5xl lg:text-6xl">
            Work <HighlightUnderline color="#C6E85A">smarter</HighlightUnderline>, not harder.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
            Run a short, private cognitive check right in your browser. See your estimated cognitive
            load, then decide what your focus needs next.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              variant="ink"
              size="lg"
              onClick={() => navigate('/app/session')}
              rightIcon={<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            >
              Start Cognitive Check
            </Button>
            <Button
              variant="light"
              size="lg"
              onClick={() =>
                document.querySelector('#technology')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Explore the Technology
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
            Camera access is requested only when you begin · No raw video is stored
          </p>
        </Reveal>
      </div>
    </section>
  )
}
