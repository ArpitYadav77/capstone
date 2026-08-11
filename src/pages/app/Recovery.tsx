import { useState } from 'react'
import { Check, Clock } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { recommendationService } from '@/services'
import type { Recommendation } from '@/services'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Stat } from '@/components/ui/Stat'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function Recovery() {
  const { user } = useAuth()
  const uid = user!.id
  const [version, setVersion] = useState(0)

  const recommendations = recommendationService.list()
  const completed = recommendationService.getCompleted(uid)
  const stats = recommendationService.stats(uid)
  const completedToday = new Set(
    completed
      .filter((a) => new Date(a.completedAt).toDateString() === new Date().toDateString())
      .map((a) => a.recommendationId),
  )

  const onComplete = (rec: Recommendation) => {
    recommendationService.complete(uid, rec)
    setVersion((v) => v + 1)
  }

  return (
    <div className="mx-auto max-w-5xl" key={version}>
      <Eyebrow>Recovery</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
        Reset &amp; recover
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[#8a97a5]">
        Short, practical activities to ease possible elevated cognitive load. Completing one logs it
        to your recovery statistics.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Completed" value={stats.total} accent="green" />
        <Stat label="This Week" value={stats.thisWeek} accent="cyan" />
        <Stat label="Minutes" value={stats.minutes} />
        <Stat label="Day Streak" value={stats.streakDays} accent="warm" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec) => {
          const done = completedToday.has(rec.id)
          return (
            <Panel key={rec.id} className="flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neon-cyan/70">
                  {rec.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] text-[#7c8894]">
                  <Clock className="h-3 w-3" /> {rec.durationMin} min
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">{rec.title}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#98a4b0]">
                {rec.description}
              </p>
              <div className="mt-5">
                <Button
                  variant={done ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => onComplete(rec)}
                  leftIcon={done ? <Check className="h-4 w-4" /> : undefined}
                >
                  {done ? 'Completed today' : 'Mark complete'}
                </Button>
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
