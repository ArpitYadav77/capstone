/** Small helpers for the NEO scroll hero. */

export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Piecewise-linear interpolation across [x, y] stops (x ascending). */
export function piecewise(x: number, stops: Array<[number, number]>): number {
  if (x <= stops[0][0]) return stops[0][1]
  const last = stops[stops.length - 1]
  if (x >= last[0]) return last[1]
  for (let i = 0; i < stops.length - 1; i++) {
    const [x0, y0] = stops[i]
    const [x1, y1] = stops[i + 1]
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0 || 1)
      return y0 + (y1 - y0) * t
    }
  }
  return last[1]
}

/**
 * Explode amount (0 assembled → 1 fully exploded) from scroll progress.
 * Single source of truth; naturally reversible when scrolling up.
 *   <0.30 assembled · 0.30–0.50 opening · 0.50–0.72 exploded · 0.72–0.90 reassemble
 */
export function explodeAmount(p: number): number {
  if (p < 0.3) return 0
  if (p < 0.5) return smoothstep(0.3, 0.5, p)
  if (p < 0.72) return 1
  if (p < 0.9) return 1 - smoothstep(0.72, 0.9, p)
  return 0
}
