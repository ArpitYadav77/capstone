import { useEffect, useRef, type RefObject } from 'react'
import { useMotionValue, type MotionValue } from 'framer-motion'
import { clamp01 } from './utils'

export interface NeoScroll {
  /** 0..1 progress through the pinned hero. Read in useFrame — never re-renders. */
  progressRef: RefObject<number>
  /** Same value as a MotionValue, for driving text opacity without re-renders. */
  progressMV: MotionValue<number>
}

/**
 * Normalized scroll progress across a tall pinned section. Progress is the
 * single source of truth for the whole 3D timeline. Updated via a rAF-throttled
 * scroll listener (no per-frame React state), computed from the section's rect.
 */
export function useNeoScroll(targetRef: RefObject<HTMLElement>): NeoScroll {
  const progressRef = useRef(0)
  const progressMV = useMotionValue(0)

  useEffect(() => {
    const el = targetRef.current
    if (!el) return

    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? clamp01(-rect.top / total) : 0
      progressRef.current = p
      progressMV.set(p)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [targetRef, progressMV])

  return { progressRef, progressMV }
}
