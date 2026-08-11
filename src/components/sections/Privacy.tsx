import { Cpu, EyeOff, HardDriveDownload, ShieldCheck } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'

const PRINCIPLES = [
  {
    icon: Cpu,
    title: 'Local by default',
    body: 'Webcam frames are analyzed directly in your browser whenever possible — signals are computed on-device.',
  },
  {
    icon: EyeOff,
    title: 'No raw video stored',
    body: 'DeskRobo works from derived numeric signals. Your camera feed is never recorded, uploaded or retained.',
  },
  {
    icon: HardDriveDownload,
    title: 'You hold the data',
    body: 'Only the signals and estimates you choose to keep are saved — and you can clear them at any time.',
  },
  {
    icon: ShieldCheck,
    title: 'Consent, always',
    body: 'The camera only ever activates after you explicitly start a session. Nothing runs in the background.',
  },
]

export function Privacy() {
  return (
    <section id="privacy" className="relative z-10 border-t border-line bg-base-900 py-24 sm:py-28">
      <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Eyebrow>Privacy by architecture</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              Your signals stay yours.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-[#a3afba] sm:text-lg">
              Privacy isn't a setting we added — it's how DeskRobo is built. Processing happens
              close to you, and raw video never leaves your device.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 inline-flex items-start gap-3 rounded-xl border border-neon-green/20 bg-neon-green/[0.04] p-4 text-sm text-[#b8c4cf]">
              <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-neon-green" strokeWidth={1.6} />
              <p>
                DeskRobo is a wellness tool. It estimates cognitive load from behavioral signals and
                does <span className="text-white">not</span> diagnose stress, anxiety, depression or
                any medical condition.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => {
            const Icon = p.icon
            return (
              <Reveal key={p.title} delay={(i % 2) * 0.08}>
                <Panel className="h-full p-6">
                  <Icon className="h-5 w-5 text-neon-cyan" strokeWidth={1.6} />
                  <h3 className="mt-5 font-display text-base font-semibold text-white">{p.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#98a4b0]">{p.body}</p>
                </Panel>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
