import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChartTooltip } from './ChartTooltip'
import { clamp, formatDayLong, formatDayShort, smoothPath } from './chartUtils'
import { useMeasuredWidth } from './useMeasuredWidth'

export interface ChartDatum {
  date: string
  [key: string]: number | string
}

export interface SeriesDef {
  key: string
  color: string
  label: string
  /** Draw a soft filled area beneath the line. */
  fill?: boolean
}

export interface TooltipField {
  key: string
  label: string
  unit?: string
  color?: string
}

interface AreaLineChartProps {
  data: ChartDatum[]
  series: SeriesDef[]
  /** Fields shown in the tooltip; defaults to the series. */
  tooltipFields?: TooltipField[]
  yMax?: number
  height?: number
  ariaLabel?: string
}

const PAD = { top: 16, right: 16, bottom: 26, left: 16 }

/**
 * Responsive smooth area + line chart with an interactive hover guide,
 * nearest-point highlight and an animated premium tooltip. Pure SVG — no
 * charting dependency. Respects prefers-reduced-motion.
 */
export function AreaLineChart({
  data,
  series,
  tooltipFields,
  yMax = 100,
  height = 200,
  ariaLabel,
}: AreaLineChartProps) {
  const { ref, width } = useMeasuredWidth<HTMLDivElement>()
  const reduce = useReducedMotion()
  const [active, setActive] = useState<number | null>(null)

  const n = data.length
  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = Math.max(0, height - PAD.top - PAD.bottom)

  const xAt = (i: number) =>
    PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const yAt = (v: number) => PAD.top + (1 - clamp(v, 0, yMax) / yMax) * plotH

  const geom = useMemo(() => {
    if (width === 0 || n === 0) return null
    return series.map((s) => {
      const pts = data.map((d, i) => [xAt(i), yAt(Number(d[s.key]) || 0)] as [number, number])
      const line = smoothPath(pts)
      const area = `${line} L ${xAt(n - 1)} ${PAD.top + plotH} L ${xAt(0)} ${PAD.top + plotH} Z`
      return { s, pts, line, area }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, series, width, height, yMax])

  if (!geom) {
    return <div ref={ref} style={{ height }} className="w-full" />
  }

  const gridVals = [0, 25, 50, 75, 100].map((p) => (p / 100) * yMax)
  const fields: TooltipField[] =
    tooltipFields ?? series.map((s) => ({ key: s.key, label: s.label, color: s.color, unit: '' }))

  // Label indices: first, middle(s), last — avoids crowding on 30-day ranges.
  const labelStep = n <= 8 ? 1 : Math.ceil(n / 6)
  const showLabel = (i: number) => i === n - 1 || i % labelStep === 0

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - PAD.left
    const idx = n <= 1 ? 0 : clamp(Math.round((x / plotW) * (n - 1)), 0, n - 1)
    setActive(idx)
  }

  const tipHalf = 90
  const tipLeft = active != null ? Math.max(tipHalf, Math.min(width - tipHalf, xAt(active))) : 0
  const tipTop =
    active != null ? Math.min(...geom.map((g) => g.pts[active][1])) - 14 : 0

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible"
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {/* Subtle horizontal gridlines */}
        {gridVals.map((v) => (
          <line
            key={v}
            x1={PAD.left}
            x2={width - PAD.right}
            y1={yAt(v)}
            y2={yAt(v)}
            stroke="#DCD9D1"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
        ))}

        {/* Areas + lines */}
        {geom.map(({ s, area }) =>
          s.fill !== false ? (
            <motion.path
              key={`area-${s.key}`}
              d={area}
              fill={`url(#grad-${s.key})`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : null,
        )}
        {geom.map(({ s, line }) => (
          <motion.path
            key={`line-${s.key}`}
            d={line}
            fill="none"
            stroke={s.color}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        {/* Latest-value highlight dots */}
        {geom.map(({ s, pts }) => {
          const [lx, ly] = pts[n - 1]
          const dim = active != null && active !== n - 1
          return (
            <g key={`last-${s.key}`} opacity={dim ? 0.35 : 1} style={{ transition: 'opacity 150ms' }}>
              <circle cx={lx} cy={ly} r={5} fill="#FFFFFF" stroke={s.color} strokeWidth={2.4} />
            </g>
          )
        })}

        {/* Hover guide + active points */}
        {active != null && (
          <g>
            <line
              x1={xAt(active)}
              x2={xAt(active)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="#12AFC2"
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            {geom.map(({ s, pts }) => (
              <circle
                key={`act-${s.key}`}
                cx={pts[active][0]}
                cy={pts[active][1]}
                r={6}
                fill={s.color}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </g>
        )}

        {/* X labels */}
        {data.map((d, i) =>
          showLabel(i) ? (
            <text
              key={`lbl-${d.date}-${i}`}
              x={xAt(i)}
              y={height - 6}
              textAnchor="middle"
              fill="#8A8881"
              style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {formatDayShort(d.date)}
            </text>
          ) : null,
        )}

        {/* Pointer capture overlay */}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        />
      </svg>

      {/* Animated HTML tooltip */}
      <AnimatePresence>
        {active != null && (
          <motion.div
            className="absolute z-10"
            style={{ left: tipLeft, top: tipTop, transform: 'translate(-50%, -100%)' }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChartTooltip
              title={formatDayLong(data[active].date)}
              rows={fields.map((f) => ({
                label: f.label,
                color: f.color,
                value: `${Number(data[active][f.key]) || 0}${f.unit ?? ''}`,
              }))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
