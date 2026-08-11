import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { HERO_ANNOTATIONS } from '@/data/content'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

// Positions for the four floating annotations (desktop/tablet only).
const ANNOTATION_POS: Record<string, string> = {
  gaze: 'left-[5%] top-[24%] xl:left-[10%]',
  blink: 'right-[6%] top-[30%] items-end text-right xl:right-[11%]',
  facial: 'left-[7%] bottom-[22%] xl:left-[12%]',
  load: 'right-[6%] bottom-[19%] items-end text-right xl:right-[12%]',
}

function HeroAnnotations() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      {HERO_ANNOTATIONS.map((a, i) => {
        const right = ANNOTATION_POS[a.id].includes('text-right')
        return (
          <motion.div
            key={a.id}
            className={`absolute flex flex-col ${ANNOTATION_POS[a.id]}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.15, duration: 0.9 }}
          >
            <div className={`flex items-center gap-2 ${right ? 'flex-row-reverse' : ''}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan/70 shadow-glow animate-pulse-soft" />
              <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.22em] text-[#8a97a5]">
                {a.line1}
                <br />
                {a.line2}
              </span>
            </div>
            <div
              className={`mt-2 h-px w-16 bg-gradient-to-r from-neon-cyan/50 to-transparent ${
                right ? 'self-end bg-gradient-to-l' : ''
              }`}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export function Hero() {
  const navigate = useNavigate()
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center pt-24"
      aria-label="Introduction"
    >
      <HeroAnnotations />

      <motion.div
        className="container-x relative z-10 flex flex-col items-center text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Eyebrow>Cognitive wellness, quantified responsibly</Eyebrow>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-balance sm:text-6xl lg:text-7xl"
        >
          <span className="text-gradient">Understand your cognitive load.</span>
          <br className="hidden sm:block" />
          <span className="text-white accent-glow"> Before it overwhelms you.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-[#a3afba] sm:text-lg"
        >
          DeskRobo uses privacy-conscious behavioral signals to help you understand changes in
          attention and cognitive load — and choose better moments to pause, reset and recover.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => navigate('/app/session')}
            rightIcon={<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          >
            Start Cognitive Check
          </Button>
          <Button size="lg" variant="secondary" onClick={() => scrollTo('#pipeline')}>
            Explore the Technology
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6b7783]"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-neon-green" />
            Local processing
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden sm:inline">No raw video stored</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden sm:inline">Not a medical device</span>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollTo('#product')}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[#6b7783] transition-colors hover:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        aria-label="Scroll to learn more"
      >
        <ArrowDown className="h-5 w-5 animate-float" />
      </motion.button>
    </section>
  )
}
