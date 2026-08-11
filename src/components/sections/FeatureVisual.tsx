import { memo } from 'react'
import type { FeatureKey } from '@/data/content'

const CYAN = '#57e0ff'
const GREEN = '#69f0b4'
const DIM = 'rgba(120,150,168,0.35)'

const VIEWBOX = '0 0 220 56'

/** Tiny animated technical vignette shown per feature card; brightens on hover. */
function FeatureVisualBase({ variant }: { variant: FeatureKey }) {
  return (
    <div className="mv-wrap mt-6 h-14 w-full">
      <svg viewBox={VIEWBOX} className="h-full w-full" fill="none" aria-hidden>
        {variant === 'gaze' && <GazeViz />}
        {variant === 'facial' && <FacialViz />}
        {variant === 'load' && <LoadViz />}
        {variant === 'recovery' && <RecoveryViz />}
        {variant === 'insights' && <InsightsViz />}
        {variant === 'privacy' && <PrivacyViz />}
      </svg>
    </div>
  )
}

function GazeViz() {
  return (
    <>
      {/* Eye almond */}
      <path d="M70 28 Q110 8 150 28 Q110 48 70 28 Z" stroke={DIM} strokeWidth="1" />
      <circle cx="110" cy="28" r="9" stroke={CYAN} strokeWidth="1" opacity="0.5" />
      {/* faint scan trajectory */}
      <path
        d="M84 30 C104 18, 122 40, 138 26 C150 16, 92 22, 84 30"
        stroke={GREEN}
        strokeWidth="0.8"
        strokeDasharray="2 3"
        opacity="0.4"
      />
      {/* moving pupil */}
      <circle className="mv-dot-gaze" r="3.4" fill={CYAN} />
      {/* tick markers */}
      <line x1="10" y1="46" x2="30" y2="46" stroke={DIM} strokeWidth="1" />
      <line x1="190" y1="46" x2="210" y2="46" stroke={DIM} strokeWidth="1" />
    </>
  )
}

function FacialViz() {
  // Face contour + landmark points (eyes, brows, nose, mouth).
  const dots: Array<[number, number]> = [
    [92, 18],
    [110, 15],
    [128, 18], // brow
    [95, 26],
    [125, 26], // eyes
    [110, 32], // nose
    [98, 40],
    [110, 42],
    [122, 40], // mouth
    [82, 30],
    [138, 30], // cheeks
    [110, 8],
    [88, 46],
    [132, 46], // outline
  ]
  return (
    <>
      <ellipse cx="110" cy="30" rx="34" ry="22" stroke={DIM} strokeWidth="1" />
      {/* faint mesh lines */}
      <path d="M92 18 L95 26 L98 40 M128 18 L125 26 L122 40 M110 15 L110 32 L110 42" stroke={DIM} strokeWidth="0.6" opacity="0.5" />
      {dots.map(([x, y], i) => (
        <circle
          key={i}
          className="mv-landmark"
          cx={x}
          cy={y}
          r="1.7"
          fill={i % 3 === 0 ? GREEN : CYAN}
          style={{ animationDelay: `${(i % 6) * 0.18}s` }}
        />
      ))}
    </>
  )
}

function LoadViz() {
  const d = 'M10 40 L44 26 L78 32 L112 16 L146 28 L180 12 L210 20'
  return (
    <>
      <line x1="10" y1="48" x2="210" y2="48" stroke={DIM} strokeWidth="0.8" />
      <path d={`${d} L210 48 L10 48 Z`} fill={CYAN} opacity="0.06" />
      <path d={d} stroke={CYAN} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="mv-dot-load" r="3.2" fill={GREEN} />
    </>
  )
}

function RecoveryViz() {
  const d = 'M10 18 C48 18, 62 44, 96 44 C140 44, 172 24, 210 16'
  return (
    <>
      {/* target band */}
      <line x1="10" y1="16" x2="210" y2="16" stroke={GREEN} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.45" />
      <path d={d} stroke={GREEN} strokeWidth="1.4" strokeLinecap="round" />
      {/* low point marker */}
      <circle cx="96" cy="44" r="2.2" fill={DIM} />
      <circle className="mv-dot-recovery" r="3.2" fill={CYAN} />
    </>
  )
}

function InsightsViz() {
  const heights = [16, 24, 18, 30, 22, 34, 40]
  const barW = 14
  const gap = 12
  const startX = 26
  return (
    <>
      <line x1="10" y1="48" x2="210" y2="48" stroke={DIM} strokeWidth="0.8" />
      {heights.map((h, i) => {
        const x = startX + i * (barW + gap)
        return (
          <rect
            key={i}
            className="mv-bar"
            x={x}
            y={48 - h}
            width={barW}
            height={h}
            rx="2"
            fill={i === heights.length - 1 ? GREEN : CYAN}
            opacity={i === heights.length - 1 ? 0.9 : 0.55}
            style={{ animationDelay: `${i * 0.14}s` }}
          />
        )
      })}
    </>
  )
}

function PrivacyViz() {
  return (
    <>
      {/* pulse rings emanating but staying contained */}
      <circle className="mv-ring" cx="110" cy="28" r="12" stroke={CYAN} strokeWidth="1" />
      <circle
        className="mv-ring"
        cx="110"
        cy="28"
        r="12"
        stroke={GREEN}
        strokeWidth="1"
        style={{ animationDelay: '1.3s' }}
      />
      {/* device / chip */}
      <rect x="98" y="18" width="24" height="20" rx="4" stroke={DIM} strokeWidth="1" fill="rgba(87,224,255,0.05)" />
      {/* lock glyph */}
      <rect x="106" y="27" width="8" height="7" rx="1.5" stroke={GREEN} strokeWidth="1" />
      <path d="M107.5 27 v-2 a2.5 2.5 0 0 1 5 0 v2" stroke={GREEN} strokeWidth="1" />
      {/* contained orbiting data dot */}
      <g className="mv-orbit">
        <circle cx="130" cy="28" r="2" fill={CYAN} />
      </g>
      {/* boundary markers implying "stays local" */}
      <line x1="150" y1="18" x2="150" y2="38" stroke={DIM} strokeWidth="1" strokeDasharray="2 3" />
      <line x1="70" y1="18" x2="70" y2="38" stroke={DIM} strokeWidth="1" strokeDasharray="2 3" />
    </>
  )
}

export const FeatureVisual = memo(FeatureVisualBase)
