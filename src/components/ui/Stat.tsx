import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Panel } from './Panel'
import { cn } from '@/lib/cn'

type Accent = 'cyan' | 'teal' | 'green' | 'warm' | 'plain' | 'charcoal'

export interface StatTrend {
  /** Signed percentage change vs the previous period. */
  value: number
  /** Which direction counts as an improvement (drives the color). */
  goodDirection?: 'up' | 'down'
}

interface StatProps {
  label: string
  value: ReactNode
  hint?: string
  /** Small unit rendered next to the value (e.g. %, min). */
  unit?: string
  accent?: Accent
  /** Minimal Lucide icon shown in the corner. */
  icon?: LucideIcon
  /** Optional trend indicator; omit when no comparison data exists. */
  trend?: StatTrend
}

const accentClass: Record<Accent, string> = {
  cyan: 'text-teal',
  teal: 'text-teal',
  green: 'text-positive',
  warm: 'text-warm',
  plain: 'text-ink',
  charcoal: 'text-ink',
}

const iconTint: Record<Accent, string> = {
  cyan: 'bg-teal/10 text-teal',
  teal: 'bg-teal/10 text-teal',
  green: 'bg-positive/10 text-positive',
  warm: 'bg-warm/10 text-warm',
  plain: 'bg-ink/[0.05] text-ink-soft',
  charcoal: 'bg-ink/[0.05] text-ink-soft',
}

function Trend({ trend }: { trend: StatTrend }) {
  const { value, goodDirection = 'up' } = trend
  if (Math.round(value) === 0) {
    return <span className="text-[12px] font-medium text-ink-muted">— steady</span>
  }
  const up = value > 0
  const good = (up && goodDirection === 'up') || (!up && goodDirection === 'down')
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[12px] font-semibold',
        good ? 'text-positive' : 'text-danger',
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {Math.abs(Math.round(value * 10) / 10)}%
    </span>
  )
}

/** Compact KPI tile used on Dashboard / Analytics / Recovery. */
export function Stat({ label, value, hint, unit, accent = 'plain', icon: Icon, trend }: StatProps) {
  return (
    <Panel interactive className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</p>
        {Icon && (
          <span
            className={cn(
              'grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-110',
              iconTint[accent],
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
          </span>
        )}
      </div>
      <p className="mt-2 flex items-baseline gap-1">
        <span
          className={cn(
            'font-display text-3xl font-semibold transition-transform duration-200 group-hover:scale-[1.04]',
            accentClass[accent],
          )}
          style={{ transformOrigin: 'left center' }}
        >
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-ink-muted">{unit}</span>}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {trend && <Trend trend={trend} />}
        {hint && <p className="text-[12px] text-ink-muted">{hint}</p>}
      </div>
    </Panel>
  )
}
