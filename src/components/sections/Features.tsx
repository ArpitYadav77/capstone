import { Panel } from '@/components/ui/Panel'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FEATURES } from '@/data/content'
import { FeatureVisual } from './FeatureVisual'

export function Features() {
  return (
    <section id="features" className="relative z-10 border-t border-line bg-base-950 py-24 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>The system</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              A quiet instrument for your attention.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-[#a3afba] sm:text-lg">
              Six capabilities work together to turn subtle behavioral signals into an
              understandable wellness indicator — with confidence, never certainty.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Reveal key={feature.title} delay={(i % 3) * 0.08}>
                <Panel interactive className="group flex h-full flex-col p-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-neon-cyan transition-colors duration-300 group-hover:border-neon-cyan/30">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-[#98a4b0]">
                    {feature.description}
                  </p>
                  <div className="mt-auto">
                    <FeatureVisual variant={feature.key} />
                  </div>
                </Panel>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
