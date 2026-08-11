import { motion } from 'framer-motion'
import { Activity, Eye, ScanFace, Circle } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'

/** Circular gauge for Attention Stability. Animates on scroll into view. */
function AttentionRing({ value }: { value: number }) {
  const r = 34
  return (
    <svg viewBox="0 0 84 84" className="h-24 w-24 -rotate-90">
      <circle cx="42" cy="42" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
      <motion.circle
        cx="42"
        cy="42"
        r={r}
        stroke="#69f0b4"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: value }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(105,240,180,0.5))' }}
      />
    </svg>
  )
}

/** Small labelled sparkline used in the signal chips. */
function MiniSpark({ d, color }: { d: string; color: string }) {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20" fill="none">
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
    </svg>
  )
}

const CHIPS = [
  { icon: Eye, label: 'Gaze', d: 'M2 16 L14 10 L26 14 L38 6 L50 12 L62 8 L78 4', color: '#57e0ff' },
  { icon: ScanFace, label: 'Blink', d: 'M2 12 L12 12 L16 4 L20 20 L24 12 L40 12 L44 6 L48 18 L52 12 L78 12', color: '#57e0ff' },
  { icon: Activity, label: 'Facial', d: 'M2 14 L16 12 L30 16 L44 10 L58 15 L72 9 L78 12', color: '#69f0b4' },
]

export function DashboardPreview() {
  // Area chart for "Today's Pattern".
  const line = 'M8 68 L44 54 L80 60 L116 40 L152 48 L188 30 L224 38 L260 24 L296 34'
  const area = `${line} L296 92 L8 92 Z`

  return (
    <section id="preview" className="relative z-10 border-t border-line bg-base-950 py-24 sm:py-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <Reveal>
            <Eyebrow>Product preview</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              Your cognitive state, at a glance.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-[#a3afba] sm:text-lg">
              A calm, legible readout of your estimated cognitive load and attention stability — with
              the trend that got you here. A preview of the DeskRobo monitoring dashboard.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b7783]">
              Visual preview · Estimates, not diagnoses
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="glass relative rounded-3xl p-5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] sm:p-6">
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-display text-sm font-semibold text-white">DeskRobo</span>
                <span className="font-mono text-[10px] text-neon-cyan/70">Neo</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-neon-green/25 bg-neon-green/[0.06] px-2.5 py-1">
                <Circle className="h-2 w-2 animate-pulse-soft fill-neon-green text-neon-green" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-neon-green">
                  Live session
                </span>
              </div>
            </div>

            {/* Top stat row */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {/* Cognitive Load */}
              <div className="col-span-2 rounded-2xl border border-line bg-white/[0.02] p-4 sm:col-span-1">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#7c8894]">
                  Cognitive Load
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-warm">MODERATE</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-neon-green via-warm to-warm" />
                </div>
                <p className="mt-2 text-[11px] text-[#7c8894]">Confidence · 0.82</p>
              </div>

              {/* Attention Stability */}
              <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#7c8894]">
                  Attention Stability
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-display text-3xl font-semibold text-white">78%</span>
                  <div className="relative grid place-items-center">
                    <AttentionRing value={0.78} />
                  </div>
                </div>
              </div>

              {/* Session */}
              <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#7c8894]">
                  Session
                </p>
                <p className="mt-2 font-mono text-3xl font-medium tabular-nums text-white">42:18</p>
                <p className="mt-2 text-[11px] text-[#7c8894]">Focused · steady</p>
              </div>
            </div>

            {/* Today's Pattern trend */}
            <div className="mt-3 rounded-2xl border border-line bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#7c8894]">
                  Today's Pattern
                </p>
                <p className="font-mono text-[10px] text-[#7c8894]">09:00 — now</p>
              </div>
              <svg viewBox="0 0 304 96" className="mt-3 h-24 w-full" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pattern-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#57e0ff" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#57e0ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={area}
                  fill="url(#pattern-fill)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.path
                  d={line}
                  stroke="#57e0ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </div>

            {/* Signal chips */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {CHIPS.map((chip) => {
                const Icon = chip.icon
                return (
                  <div
                    key={chip.label}
                    className="flex items-center justify-between rounded-xl border border-line bg-white/[0.02] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#8a97a5]" strokeWidth={1.6} />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#8a97a5]">
                        {chip.label}
                      </span>
                    </div>
                    <MiniSpark d={chip.d} color={chip.color} />
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
