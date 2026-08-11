import type { ReactNode } from 'react'
import { Panel } from './Panel'

interface StatProps {
  label: string
  value: ReactNode
  hint?: string
  accent?: 'cyan' | 'green' | 'warm' | 'plain'
}

const accentClass: Record<NonNullable<StatProps['accent']>, string> = {
  cyan: 'text-neon-cyan',
  green: 'text-neon-green',
  warm: 'text-warm',
  plain: 'text-white',
}

/** Compact KPI tile used on Dashboard / Analytics / Recovery. */
export function Stat({ label, value, hint, accent = 'plain' }: StatProps) {
  return (
    <Panel className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c8894]">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accentClass[accent]}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[12px] text-[#7c8894]">{hint}</p>}
    </Panel>
  )
}
