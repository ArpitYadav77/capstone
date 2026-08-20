import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the premium lift + teal-border hover treatment. */
  interactive?: boolean
  /** Chart-container hover: a smaller 2px lift so charts stay readable. */
  chart?: boolean
}

/**
 * Premium light card surface — white fill, hairline border, soft warm shadow.
 * `interactive` / `chart` opt into the shared reusable hover system.
 */
export function Panel({ className, interactive = false, chart = false, children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'glass rounded-card',
        interactive && 'interactive-card group',
        chart && 'interactive-chart',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
