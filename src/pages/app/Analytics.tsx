import { useMemo, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { analyticsService } from '@/services'
import { Panel } from '@/components/ui/Panel'
import { Stat } from '@/components/ui/Stat'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { TrendBars } from '@/components/ui/TrendBars'
import { cn } from '@/lib/cn'

export function Analytics() {
  const { user } = useAuth()
  const uid = user!.id
  const [days, setDays] = useState<7 | 30>(7)

  const data = useMemo(() => analyticsService.getRange(uid, days), [uid, days])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Analytics</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
            Patterns &amp; trends
          </h1>
          {data.isDemo && (
            <p className="mt-2 text-sm text-[#7c8894]">Sample data — your trends appear after sessions.</p>
          )}
        </div>
        <div className="inline-flex rounded-full border border-line p-1">
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                days === d ? 'bg-white/[0.06] text-white' : 'text-[#8a97a5] hover:text-white',
              )}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Avg Load" value={data.avgLoad} accent="warm" hint="/ 100" />
        <Stat label="Avg Attention" value={`${data.avgAttention}%`} accent="green" />
        <Stat label="Sessions" value={data.totalSessions} accent="cyan" />
        <Stat label="Focus Minutes" value={data.focusMinutes} />
      </div>

      <Panel className="mt-4 p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c8894]">
            Estimated cognitive load
          </p>
          <span className="text-[12px] text-[#7c8894]">
            trend {data.loadTrend > 0 ? '+' : ''}
            {data.loadTrend}%
          </span>
        </div>
        <div className="mt-5 h-40">
          <TrendBars values={data.summaries.map((s) => s.avgLoad)} max={100} />
        </div>
      </Panel>

      <Panel className="mt-4 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c8894]">
          Attention stability
        </p>
        <div className="mt-5 h-40">
          <TrendBars values={data.summaries.map((s) => s.avgAttention)} max={100} color="#69f0b4" />
        </div>
      </Panel>
    </div>
  )
}
