import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChartTooltip } from './ChartTooltip'
import { useMeasuredWidth } from './useMeasuredWidth'
import {
  STATE_COLORS,
  STATE_LABEL,
  formatDayLong,
  smoothPath,
  stateFor,
  type DepthPoint,
} from './chartUtils'

interface Props {
  points: DepthPoint[]
  height?: number
}

const PAD = { top: 22, right: 26, bottom: 30, left: 30 }

/**
 * Lightweight 2.5D scatter used on mobile / reduced-motion / no-WebGL.
 * X = focus (attention), Y = cognitive load, depth (time) is encoded by dot
 * size + opacity. Points are connected in time order by a soft line.
 */
export function CognitiveDepth2D({ points, height = 300 }: Props) {
  const { ref, width } = useMeasuredWidth<HTMLDivElement>()
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<number | null>(null)

  const n = points.length
  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = Math.max(0, height - PAD.top - PAD.bottom)

  const laid = useMemo(() => {
    if (width === 0) return []
    return points.map((p, i) => {
      const t = n <= 1 ? 1 : i / (n - 1) // 0 = oldest, 1 = newest
      const x = PAD.left + (p.attention / 100) * plotW
      const y = PAD.top + (1 - p.load / 100) * plotH
      const state = stateFor(p.load, p.attention)
      return { p, i, x, y, t, state, color: STATE_COLORS[state] }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, width, height])

  if (width > 0 && n === 0) {
    return <div ref={ref} style={{ height }} className="w-full" />
  }

  const line = smoothPath(laid.map((l) => [l.x, l.y] as [number, number]))
  const tip = hover != null ? laid[hover] : null

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Axis frame */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={height - PAD.bottom} stroke="#DCD9D1" strokeWidth={1} />
        <line
          x1={PAD.left}
          y1={height - PAD.bottom}
          x2={width - PAD.right}
          y2={height - PAD.bottom}
          stroke="#DCD9D1"
          strokeWidth={1}
        />
        <text x={PAD.left} y={height - 8} fill="#8A8881" style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
          Focus →
        </text>
        <text
          x={-(PAD.top + plotH / 2)}
          y={14}
          transform="rotate(-90)"
          textAnchor="middle"
          fill="#8A8881"
          style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
        >
          Load ↑
        </text>

        {/* Time-ordered connector */}
        {n > 1 && (
          <motion.path
            d={line}
            fill="none"
            stroke="#12AFC2"
            strokeOpacity={0.28}
            strokeWidth={1.5}
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {/* Session points — size + opacity carry the time/depth axis */}
        {laid.map((l) => {
          const r = 4 + l.t * 6
          const dim = hover != null && hover !== l.i
          return (
            <motion.g
              key={l.p.date + l.i}
              opacity={dim ? 0.3 : 0.45 + l.t * 0.55}
              style={{ transition: 'opacity 150ms' }}
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: reduce ? 0 : l.t * 0.25, duration: 0.4 }}
            >
              <circle cx={l.x} cy={l.y + 3} r={r} fill="#171717" opacity={0.06} />
              <circle
                cx={l.x}
                cy={l.y}
                r={hover === l.i ? r + 2 : r}
                fill={l.color}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                style={{ transition: 'r 150ms' }}
                onPointerEnter={() => setHover(l.i)}
                onPointerLeave={() => setHover((h) => (h === l.i ? null : h))}
              />
            </motion.g>
          )
        })}
      </svg>

      <AnimatePresence>
        {tip && (
          <motion.div
            className="absolute z-10"
            style={{
              left: Math.max(90, Math.min(width - 90, tip.x)),
              top: tip.y - 14,
              transform: 'translate(-50%, -100%)',
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <ChartTooltip
              title={formatDayLong(tip.p.date)}
              rows={[
                { label: 'State', value: STATE_LABEL[tip.state], color: tip.color },
                { label: 'Attention', value: `${tip.p.attention}%` },
                { label: 'Cognitive Load', value: `${tip.p.load}` },
                { label: 'Sessions', value: `${tip.p.sessions}` },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
