import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FLOW } from '@/data/content'

function IconRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-base-900 text-neon-cyan shadow-[0_0_30px_-14px_rgba(87,224,255,0.6)]">
      <span className="absolute inset-0 rounded-2xl animate-pulse-soft bg-neon-cyan/[0.04]" />
      {children}
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="pipeline" className="relative z-10 border-t border-line bg-base-900 py-24 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              One continuous path, from signal to reset.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-[#a3afba] sm:text-lg">
              Every stage runs in sequence — most of it on your device — turning raw behavior into
              a decision you can actually use.
            </p>
          </Reveal>
        </div>

        {/* Desktop rail */}
        <Reveal delay={0.1} className="mt-16 hidden md:block">
          <div className="relative">
            <div className="absolute inset-x-[9%] top-7 h-px bg-white/10" />
            <div className="absolute inset-x-[9%] top-7 h-px rail-x" />
            <ol className="relative grid grid-cols-5">
              {FLOW.map((stage, i) => {
                const Icon = stage.icon
                return (
                  <li key={stage.title} className="flex flex-col items-center px-3 text-center">
                    <IconRing>
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </IconRing>
                    <span className="mt-2 font-mono text-[11px] text-neon-cyan/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 font-display text-[15px] font-semibold leading-snug text-white">
                      {stage.title}
                    </h3>
                    <p className="mt-2 max-w-[15rem] text-[13px] leading-relaxed text-[#8a97a5]">
                      {stage.caption}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>
        </Reveal>

        {/* Mobile vertical rail */}
        <div className="mt-12 md:hidden">
          <ol className="relative flex flex-col gap-8">
            {FLOW.map((stage, i) => {
              const Icon = stage.icon
              const last = i === FLOW.length - 1
              return (
                <li key={stage.title} className="relative flex items-start gap-5">
                  <div className="relative flex flex-col items-center">
                    <IconRing>
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </IconRing>
                    {!last && (
                      <div className="relative mt-2 h-10 w-px">
                        <div className="absolute inset-0 bg-white/10" />
                        <div className="absolute inset-0 rail-y" />
                      </div>
                    )}
                  </div>
                  <div className="pt-1.5">
                    <span className="font-mono text-[11px] text-neon-cyan/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-1 font-display text-base font-semibold text-white">
                      {stage.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#8a97a5]">{stage.caption}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
