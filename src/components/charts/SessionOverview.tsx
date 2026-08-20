import { RadialGauge } from './RadialGauge'

interface Props {
  totalSessions: number
  focusMinutes: number
}

/**
 * Compact session summary — three animated rings for sessions, focus minutes
 * and average session length. The real value always sits in the centre, so the
 * (relative) ring fill is decorative, never misleading.
 */
export function SessionOverview({ totalSessions, focusMinutes }: Props) {
  const avgMin = totalSessions > 0 ? Math.round(focusMinutes / totalSessions) : 0

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <RadialGauge
        value={totalSessions}
        max={Math.max(10, totalSessions)}
        color="#12AFC2"
        display={String(totalSessions)}
        label="Sessions"
      />
      <RadialGauge
        value={focusMinutes}
        max={Math.max(120, focusMinutes)}
        color="#55B889"
        display={String(focusMinutes)}
        sub="min"
        label="Focus"
      />
      <RadialGauge
        value={avgMin}
        max={60}
        color="#66645E"
        display={String(avgMin)}
        sub="min"
        label="Avg length"
      />
    </div>
  )
}
