import { motion, useReducedMotion } from 'framer-motion'

interface RadialGaugeProps {
  /** Current value used to fill the ring. */
  value: number
  max: number
  color: string
  /** Big text in the centre (already formatted, e.g. "128"). */
  display: string
  /** Small caption beneath the number. */
  sub?: string
  /** Label under the ring. */
  label: string
  size?: number
  stroke?: number
}

/** Animated donut gauge — clean, honest (shows the real value in the centre). */
export function RadialGauge({
  value,
  max,
  color,
  display,
  sub,
  label,
  size = 108,
  stroke = 9,
}: RadialGaugeProps) {
  const reduce = useReducedMotion()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  const offset = c * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECEAE4" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-ink">{display}</span>
          {sub && <span className="mt-0.5 text-[11px] text-ink-muted">{sub}</span>}
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</span>
    </div>
  )
}
