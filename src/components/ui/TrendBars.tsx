interface TrendBarsProps {
  values: number[]
  /** Optional max; defaults to the data max (min 1). */
  max?: number
  height?: number
  color?: string
  highlightLast?: boolean
}

/** Lightweight inline-SVG bar chart. No dependencies, no animation loop. */
export function TrendBars({
  values,
  max,
  height = 120,
  color = '#57e0ff',
  highlightLast = true,
}: TrendBarsProps) {
  const n = Math.max(values.length, 1)
  const top = Math.max(max ?? Math.max(...values, 1), 1)
  const gap = 3
  const barW = (100 - gap * (n - 1)) / n

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-full w-full">
      {values.map((v, i) => {
        const h = Math.max(2, (v / top) * (height - 4))
        const x = i * (barW + gap)
        const last = highlightLast && i === values.length - 1
        return (
          <rect
            key={i}
            x={x}
            y={height - h}
            width={barW}
            height={h}
            rx={1.2}
            fill={last ? '#69f0b4' : color}
            opacity={last ? 0.95 : 0.5}
          />
        )
      })}
    </svg>
  )
}
