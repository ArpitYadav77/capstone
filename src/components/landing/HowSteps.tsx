import { Eye, Activity, MessageSquareText } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'

const STEPS = [
  {
    icon: Eye,
    title: 'Local vision',
    body: 'NEO watches simple visual signals on your device — gaze and eye behavior — with the camera never leaving your desk.',
  },
  {
    icon: Activity,
    title: 'On-device signals',
    body: 'Those signals become attention and fatigue-related indicators, smoothed over time into a clear wellness estimate.',
  },
  {
    icon: MessageSquareText,
    title: 'Helpful response',
    body: 'When it matters, NEO speaks up with a short, useful nudge — a moment to pause, reset and refocus.',
  },
]

export function HowSteps() {
  return (
    <section id="how" className="bg-sand py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">How it works</span>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Three quiet steps, all day.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.title} delay={i * 0.08}>
                <div className="rounded-3xl border border-ink/[0.07] bg-ivory p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/[0.04] text-teal">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <span className="font-mono text-[12px] text-ink-soft">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
