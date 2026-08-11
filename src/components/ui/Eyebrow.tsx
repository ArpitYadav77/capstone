import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  className?: string
}

/**
 * Small monospaced kicker used above section headings.
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span className={cn('eyebrow', className)}>
      <span className="h-1 w-1 rounded-full bg-neon-cyan shadow-glow" aria-hidden />
      {children}
    </span>
  )
}
