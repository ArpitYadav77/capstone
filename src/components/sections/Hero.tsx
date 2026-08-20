import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { HighlightUnderline } from '@/components/landing/HighlightUnderline'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export function Hero() {
  const navigate = useNavigate()

  return (
    <section id="top" className="relative overflow-hidden px-0 pb-16 pt-28 sm:pt-36">
      {/* soft warm glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 25%, rgba(15,156,156,0.08), transparent 70%), radial-gradient(40% 40% at 80% 10%, rgba(198,232,90,0.10), transparent 70%)',
        }}
        aria-hidden
      />

      <motion.div
        className="container-x relative text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p
          variants={item}
          className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft"
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" />
          Your desk, now a little smarter
        </motion.p>

        <motion.h1
          variants={item}
          className="mx-auto mt-6 max-w-4xl font-display text-6xl font-semibold leading-[0.98] tracking-tightest text-ink sm:text-7xl lg:text-[5.5rem]"
        >
          Meet NEO.
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-7 max-w-2xl text-lg text-ink-soft sm:text-xl"
        >
          Your intelligent companion for a{' '}
          <HighlightUnderline color="#C6E85A">better</HighlightUnderline> workday.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="ink"
            size="lg"
            onClick={() => navigate('/app/session')}
            rightIcon={<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          >
            Explore NEO
          </Button>
          <Button
            variant="light"
            size="lg"
            onClick={() => document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See how it works
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
