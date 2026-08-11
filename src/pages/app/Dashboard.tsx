import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Radio } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { analyticsService, sessionService } from '@/services'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Stat } from '@/components/ui/Stat'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { TrendBars } from '@/components/ui/TrendBars'

function loadBand(load: number): string {
  if (load < 40) return 'LOW'
  if (load < 70) return 'MODERATE'
  return 'ELEVATED'
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function Dashboard() {
  const { user } = useAuth()
  const uid = user!.id
  const navigate = useNavigate()

  const week = useMemo(() => analyticsService.get7Day(uid), [uid])
  const sessions = useMemo(() => sessionService.listSessions(uid), [uid])
  const latest = sessions[0]

  const currentLoad = latest?.avgLoad ?? week.avgLoad
  const currentAttention = latest?.avgAttention ?? week.avgAttention

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Dashboard</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
            Your cognitive state
          </h1>
          {week.isDemo && (
            <p className="mt-2 text-sm text-[#7c8894]">
              Showing sample data — run a session to see your own.
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/app/session')} leftIcon={<Radio className="h-4 w-4" />}>
          Start Cognitive Check
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Cognitive Load" value={loadBand(currentLoad)} accent="warm" hint={`${currentLoad} / 100`} />
        <Stat label="Attention Stability" value={`${currentAttention}%`} accent="green" />
        <Stat label="Sessions · 7d" value={week.totalSessions} accent="cyan" />
        <Stat label="Focus · 7d" value={`${week.focusMinutes}m`} accent="plain" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c8894]">
              Estimated load · last 7 days
            </p>
            <span className="text-[12px] text-[#7c8894]">
              trend {week.loadTrend > 0 ? '+' : ''}
              {week.loadTrend}%
            </span>
          </div>
          <div className="mt-5 h-32">
            <TrendBars values={week.summaries.map((s) => s.avgLoad)} max={100} />
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c8894]">
            Recent sessions
          </p>
          <div className="mt-4 space-y-2.5">
            {sessions.length === 0 ? (
              <p className="text-sm text-[#7c8894]">No sessions yet.</p>
            ) : (
              sessions.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#c3ccd6]">
                    {new Date(s.startedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-mono text-[#8a97a5]">{formatDuration(s.durationSec)}</span>
                  <span className="text-neon-cyan">load {s.avgLoad}</span>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/app/analytics')}
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-neon-cyan/80 hover:text-neon-cyan"
          >
            View analytics <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Panel>
      </div>
    </div>
  )
}
