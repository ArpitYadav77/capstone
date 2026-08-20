import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Radio } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { analyticsService, sessionService } from '@/services'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Stat } from '@/components/ui/Stat'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { AreaLineChart } from '@/components/charts/AreaLineChart'
import { fadeUp, staggerContainer } from '@/lib/motion'

/** Grid item wrapper: staggered fade-up entrance (hover handled by the cards). */
function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  )
}

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
    <motion.div
      className="mx-auto max-w-5xl"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Dashboard</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            Your cognitive state
          </h1>
          {week.isDemo && (
            <p className="mt-2 text-sm text-ink-soft">
              Showing sample data — run a session to see your own.
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/app/session')} leftIcon={<Radio className="h-4 w-4" />}>
          Start Cognitive Check
        </Button>
      </motion.div>

      <motion.div variants={staggerContainer} className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile>
          <Stat label="Cognitive Load" value={loadBand(currentLoad)} accent="warm" hint={`${currentLoad} / 100`} />
        </Tile>
        <Tile>
          <Stat label="Attention Stability" value={`${currentAttention}%`} accent="green" />
        </Tile>
        <Tile>
          <Stat label="Sessions · 7d" value={week.totalSessions} accent="cyan" />
        </Tile>
        <Tile>
          <Stat label="Focus · 7d" value={`${week.focusMinutes}m`} accent="plain" />
        </Tile>
      </motion.div>

      <motion.div variants={staggerContainer} className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Tile>
          <Panel chart className="h-full p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              Estimated load · last 7 days
            </p>
            <span className="text-[12px] text-ink-muted">
              trend {week.loadTrend > 0 ? '+' : ''}
              {week.loadTrend}%
            </span>
          </div>
          <div className="mt-3">
            <AreaLineChart
              data={week.summaries.map((s) => ({ date: s.date, load: s.avgLoad, attention: s.avgAttention }))}
              yMax={100}
              height={150}
              ariaLabel="Estimated cognitive load, last 7 days"
              series={[{ key: 'load', color: '#12AFC2', label: 'Cognitive Load', fill: true }]}
              tooltipFields={[
                { key: 'load', label: 'Cognitive Load', color: '#12AFC2' },
                { key: 'attention', label: 'Attention', unit: '%', color: '#55B889' },
              ]}
            />
          </div>
          </Panel>
        </Tile>

        <Tile>
          <Panel interactive className="h-full p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Recent sessions
          </p>
          <div className="mt-4 space-y-2.5">
            {sessions.length === 0 ? (
              <p className="text-sm text-ink-muted">No sessions yet.</p>
            ) : (
              sessions.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">
                    {new Date(s.startedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-mono text-ink-muted">{formatDuration(s.durationSec)}</span>
                  <span className="text-teal">load {s.avgLoad}</span>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/app/analytics')}
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-teal hover:text-[#0f9aab]"
          >
            View analytics <ArrowRight className="h-3.5 w-3.5" />
          </button>
          </Panel>
        </Tile>
      </motion.div>
    </motion.div>
  )
}
