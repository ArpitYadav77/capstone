import { motion, useTransform, type MotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const LEFT_LABELS = ['Vision', 'AI Processing', 'Voice']
const RIGHT_LABELS = ['Connectivity', 'ESP32', 'Speaker', 'Attention Detection']

function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-1.5 w-1.5 rounded-full bg-teal shadow-[0_0_10px_rgba(15,181,181,0.6)]" />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">{text}</span>
    </div>
  )
}

/** Minimal charcoal typography stages layered over the light NEO reveal. */
export function NeoHeroText({ progress }: { progress: MotionValue<number> }) {
  const navigate = useNavigate()

  const introOpacity = useTransform(progress, [0, 0.06, 0.14], [1, 1, 0])
  const hintOpacity = useTransform(progress, [0, 0.05, 0.1], [1, 0.6, 0])
  const labelsOpacity = useTransform(progress, [0.5, 0.58, 0.72, 0.8], [0, 1, 1, 0])
  const ctaOpacity = useTransform(progress, [0.86, 0.94, 1], [0, 1, 1])
  const ctaPointer = useTransform(ctaOpacity, (o) => (o > 0.6 ? 'auto' : 'none'))

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Stage 1 — intro */}
      <motion.div
        style={{ opacity: introOpacity }}
        className="absolute inset-x-0 top-[13%] flex flex-col items-center px-6 text-center"
      >
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" />
          The engineering
        </p>
        <h2 className="font-display text-5xl font-semibold tracking-tightest text-ink sm:text-6xl">
          Inside NEO
        </h2>
        <p className="mt-4 max-w-md text-base text-ink-soft sm:text-lg">
          Premium hardware, thoughtfully engineered.
        </p>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: hintOpacity }}
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-ink-soft"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-float" />
      </motion.div>

      {/* Stage 5 — exploded labels */}
      <motion.div
        style={{ opacity: labelsOpacity }}
        className="absolute inset-0 flex items-center justify-between px-6 sm:px-12 lg:px-20"
      >
        <div className="flex flex-col gap-5">
          {LEFT_LABELS.map((l) => (
            <Label key={l} text={l} />
          ))}
        </div>
        <div className="flex flex-col items-end gap-5 text-right">
          {RIGHT_LABELS.map((l) => (
            <Label key={l} text={l} />
          ))}
        </div>
      </motion.div>

      {/* Stage 7 — final CTA (anchored above the robot, never overlapping it) */}
      <motion.div
        style={{ opacity: ctaOpacity, pointerEvents: ctaPointer }}
        className="absolute inset-x-0 top-[10%] flex flex-col items-center px-6 text-center"
      >
        <h2 className="font-display text-4xl font-semibold tracking-tightest text-ink sm:text-5xl">
          Meet NEO.
        </h2>
        <p className="mt-4 max-w-lg text-base text-ink-soft sm:text-lg">
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
      </motion.div>
    </div>
  )
}
