import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, BarChart3, Eye, Layers, Radio, Timer } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { analyticsService } from '@/services'
import type { DailySummary } from '@/services'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Stat, type StatTrend } from '@/components/ui/Stat'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { AreaLineChart } from '@/components/charts/AreaLineChart'
import { CognitiveState } from '@/components/charts/CognitiveState'
import { SessionOverview } from '@/components/charts/SessionOverview'
import type { DepthPoint } from '@/components/charts/chartUtils'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/cn'

const mean = (arr: number[]) =>
  arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

/**
 * First-half vs second-half % change across active days. Returns `undefined`
 * when there isn't enough data to make an honest comparison.
 */
function halfTrend(rows: DailySummary[], pick: (s: DailySummary) => number): number | undefined {
  const active = rows.filter((s) => s.sessions > 0)
  if (active.length < 2) return undefined
  const half = Math.floor(active.length / 2)
  const a = mean(active.slice(0, half).map(pick))
  const b = mean(active.slice(half).map(pick))
  if (!a) return undefined
  return Math.round(((b - a) / a) * 1000) / 10
}

export function Analytics() {
  const { user } = useAuth()
  const uid = user!.id
  const navigate = useNavigate()
  const [days, setDays] = useState<7 | 30>(7)

  const data = useMemo(() => analyticsService.getRange(uid, days), [uid, days])

  // Real sparse data can have empty days; only plot days that actually have
  // sessions so lines never dip to a misleading zero. Demo data is dense.
  const rows = useMemo(
    () => (data.isDemo ? data.summaries : data.summaries.filter((s) => s.sessions > 0)),
    [data],
  )

  const lineData = useMemo(
    () =>
      rows.map((s) => ({
        date: s.date,
        load: s.avgLoad,
        attention: s.avgAttention,
        focus: s.focusMinutes,
      })),
    [rows],
  )

  const depthPoints: DepthPoint[] = useMemo(
    () =>
      rows.map((s) => ({
        date: s.date,
        load: s.avgLoad,
        attention: s.avgAttention,
        sessions: s.sessions,
      })),
    [rows],
  )

  const trends = useMemo(
    () => ({
      load: halfTrend(rows, (s) => s.avgLoad),
      attention: halfTrend(rows, (s) => s.avgAttention),
      sessions: halfTrend(rows, (s) => s.sessions),
      focus: halfTrend(rows, (s) => s.focusMinutes),
    }),
    [rows],
  )

  const summarySentence = useMemo(() => {
    if (data.isDemo) {
      return 'This is sample data — your real patterns appear after a few sessions.'
    }
    const t = trends.attention
    if (t === undefined) {
      return 'Complete a few more sessions to unlock period-over-period trends.'
    }
    if (Math.round(t) === 0) {
      return 'Your attention held steady compared with the previous period.'
    }
    const dir = t > 0 ? 'improved' : 'dipped'
    return `Your attention has ${dir} ${Math.abs(t)}% compared with the previous period.`
  }, [data.isDemo, trends.attention])

  const mkTrend = (value: number | undefined, goodDirection: 'up' | 'down'): StatTrend | undefined =>
    value === undefined ? undefined : { value, goodDirection }

  return (
    <motion.div
      className="mx-auto max-w-5xl"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Analytics</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            Patterns &amp; trends
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink-soft">{summarySentence}</p>
        </div>

        {/* Period switcher with a sliding active indicator */}
        <div className="relative inline-flex rounded-full border border-line bg-card p-1">
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            >
              {days === d && (
                <motion.span
                  layoutId="periodPill"
                  className="absolute inset-0 -z-10 rounded-full bg-teal"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={cn(days === d ? 'text-white' : 'text-ink-soft hover:text-ink')}>
                {d} days
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Empty state — no real sessions yet */}
      {data.isDemo && (
        <motion.div variants={fadeUp} className="mt-6">
          <Panel className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal">
                <BarChart3 className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">No sessions yet</h2>
                <p className="mt-1 max-w-md text-sm text-ink-soft">
                  Start a cognitive check to build your attention history. The charts below use
                  sample data so you can preview what you&apos;ll see.
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/app/session')} leftIcon={<Radio className="h-4 w-4" />}>
              Start Cognitive Check
            </Button>
          </Panel>
        </motion.div>
      )}

      {/* Cognitive state depth visualization (near the top) */}
      <motion.div variants={fadeUp} className="mt-6">
        <Panel className="p-6">
          <CognitiveState key={days} points={depthPoints} isSample={data.isDemo} />
        </Panel>
      </motion.div>

      {/* KPI stat cards */}
      <motion.div variants={staggerContainer} className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <Stat
            label="Avg Load"
            value={data.avgLoad}
            unit="/100"
            accent="warm"
            icon={Activity}
            trend={mkTrend(trends.load, 'down')}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Stat
            label="Avg Attention"
            value={data.avgAttention}
            unit="%"
            accent="teal"
            icon={Eye}
            trend={mkTrend(trends.attention, 'up')}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Stat
            label="Sessions"
            value={data.totalSessions}
            accent="charcoal"
            icon={Layers}
            trend={mkTrend(trends.sessions, 'up')}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Stat
            label="Focus Minutes"
            value={data.focusMinutes}
            unit="min"
            accent="green"
            icon={Timer}
            trend={mkTrend(trends.focus, 'up')}
          />
        </motion.div>
      </motion.div>

      {/* Cognitive load — area + line */}
      <motion.div variants={fadeUp} className="mt-4">
        <Panel chart className="p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              Estimated cognitive load
            </p>
            <span className="text-[12px] text-ink-muted">
              trend {data.loadTrend > 0 ? '+' : ''}
              {data.loadTrend}%
            </span>
          </div>
          <div className="mt-3">
            <AreaLineChart
              key={days}
              data={lineData}
              yMax={100}
              height={210}
              ariaLabel="Estimated cognitive load over time"
              series={[{ key: 'load', color: '#12AFC2', label: 'Cognitive Load', fill: true }]}
              tooltipFields={[
                { key: 'load', label: 'Cognitive Load', color: '#12AFC2' },
                { key: 'attention', label: 'Attention', unit: '%', color: '#55B889' },
              ]}
            />
          </div>
        </Panel>
      </motion.div>

      {/* Attention stability — area + line */}
      <motion.div variants={fadeUp} className="mt-4">
        <Panel chart className="p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Attention stability
          </p>
          <div className="mt-3">
            <AreaLineChart
              key={days}
              data={lineData}
              yMax={100}
              height={210}
              ariaLabel="Attention stability over time"
              series={[{ key: 'attention', color: '#55B889', label: 'Attention', fill: true }]}
              tooltipFields={[{ key: 'attention', label: 'Attention', unit: '%', color: '#55B889' }]}
            />
          </div>
        </Panel>
      </motion.div>

      {/* Session overview — radial rings */}
      <motion.div variants={fadeUp} className="mt-4">
        <Panel chart className="p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Session overview
          </p>
          <div className="mt-5">
            <SessionOverview
              key={days}
              totalSessions={data.totalSessions}
              focusMinutes={data.focusMinutes}
            />
          </div>
        </Panel>
      </motion.div>
    </motion.div>
  )
}
