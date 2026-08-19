import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  className?: string
}

/**
 * Smoothly tweens between numeric values (updates the DOM directly, no per-frame
 * React re-render). Used for live metrics so they glide instead of jumping.
 */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const current = useRef(value)

  useEffect(() => {
    const controls = animate(current.current, value, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        current.current = v
        if (ref.current) ref.current.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [value])

  return (
    <span ref={ref} className={className}>
      {Math.round(value)}
    </span>
  )
}
