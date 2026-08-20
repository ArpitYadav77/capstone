import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface HighlightUnderlineProps {
  children: ReactNode
  /** Stroke color — defaults to the soft lime positive accent. */
  color?: string
  className?: string
  delay?: number
}

/**
 * A hand-drawn brush underline for emphasizing a single word — NOT text
 * decoration. Rendered as an irregular SVG stroke that reveals on scroll into
 * view (respecting prefers-reduced-motion). Use sparingly, on important words.
 */
export function HighlightUnderline({
  children,
  color = '#C6E85A',
  className,
  delay = 0.15,
}: HighlightUnderlineProps) {
  const reduce = useReducedMotion()

  return (
    <span className={cn('relative inline-block whitespace-nowrap', className)}>
      <span className="relative z-[1]">{children}</span>
      <svg
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.14em] left-[-2%] h-[0.42em] w-[104%]"
        viewBox="0 0 300 22"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M5 14 C 55 5, 110 19, 165 11 C 210 5, 255 17, 296 12"
          stroke={color}
          strokeWidth={11}
          strokeLinecap="round"
          initial={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduce ? 0 : 0.75, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : delay }}
        />
      </svg>
    </span>
  )
}
