import { Reveal } from '@/components/ui/Reveal'
import { NARRATIVE } from '@/data/content'

/**
 * The scroll narrative — three beats explaining how DeskRobo works. Each beat
 * carries a small system-style readout to reinforce the deep-tech identity.
 */
export function Narrative() {
  return (
    <section id="product" aria-label="How DeskRobo works" className="relative z-10">
      {NARRATIVE.map((step) => (
        <div key={step.index} className="flex min-h-[72svh] items-center">
          <div className="container-x">
            <div className="max-w-xl">
              <Reveal>
                <span className="font-mono text-sm text-neon-cyan/70">/ {step.index}</span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
                  {step.title}
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-5 text-pretty text-base leading-relaxed text-[#a3afba] sm:text-lg">
                  {step.body}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-line bg-white/[0.02] px-4 py-2 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-neon-green" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8a97a5]">
                    {step.readout.label}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-neon-green">
                    {step.readout.value}
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
