/**
 * Small, dependency-free helpers shared by the SVG chart components.
 * Kept intentionally light so charts stay fast on low-end laptops.
 */

export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

/**
 * Smooth path through points using a Catmull-Rom → cubic-Bézier conversion.
 * `points` are [x, y] in pixel space. Produces a natural, non-overshooting curve.
 */
export function smoothPath(points: [number, number][], tension = 1): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`

  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension
    const cp1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension
    const cp2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension
    const cp2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d
}

/** 'YYYY-MM-DD' → 'Aug 21'. Falls back to the raw string if unparseable. */
export function formatDayShort(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** 'YYYY-MM-DD' → 'AUG 21' (tooltip title). */
export function formatDayLong(date: string): string {
  return formatDayShort(date).toUpperCase()
}

/** Semantic cognitive-state palette (matches the theme tokens). */
export const STATE_COLORS = {
  focused: '#12AFC2', // teal — high attention, low load
  healthy: '#55B889', // green — balanced
  elevated: '#F4C84A', // warm yellow — elevated load
  fatigue: '#E28560', // orange — high load + low attention
} as const

export type CognitiveState = keyof typeof STATE_COLORS

export function stateFor(load: number, attention: number): CognitiveState {
  if (load >= 70 && attention < 55) return 'fatigue'
  if (load >= 65) return 'elevated'
  if (attention >= 70 && load < 55) return 'focused'
  return 'healthy'
}

export const STATE_LABEL: Record<CognitiveState, string> = {
  focused: 'Focused',
  healthy: 'Healthy',
  elevated: 'Elevated load',
  fatigue: 'Fatigue',
}

/** One session-day plotted in the cognitive-state depth visualization. */
export interface DepthPoint {
  date: string
  load: number // 0..100  → Y
  attention: number // 0..100  → X (focus)
  sessions: number
}
