import type { Variants } from 'framer-motion'

/**
 * Shared, deliberately subtle Motion presets for the app pages.
 * Small travel + short durations so nothing feels flashy.
 */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

/** Gentle spring used for hover lifts. */
export const hoverLift = {
  whileHover: { y: -3 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
}
