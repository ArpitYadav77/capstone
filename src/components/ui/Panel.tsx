import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a subtle interactive hover treatment. */
  interactive?: boolean
}

/**
 * Restrained glass surface with a hairline border.
 */
export function Panel({ className, interactive = false, children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl',
        interactive &&
          'transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.045]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
