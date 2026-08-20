import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { ChartTooltip } from './ChartTooltip'
import {
  STATE_COLORS,
  STATE_LABEL,
  formatDayLong,
  stateFor,
  type DepthPoint,
} from './chartUtils'

interface Props {
  points: DepthPoint[]
}

interface Placed {
  p: DepthPoint
  pos: [number, number, number]
  color: string
  state: ReturnType<typeof stateFor>
}

function place(points: DepthPoint[]): Placed[] {
  const n = points.length
  return points.map((p, i) => {
    const t = n <= 1 ? 0.5 : i / (n - 1)
    const state = stateFor(p.load, p.attention)
    return {
      p,
      state,
      color: STATE_COLORS[state],
      pos: [
        (p.attention / 100 - 0.5) * 4.2, // X = focus
        (p.load / 100 - 0.5) * 3.0, // Y = load
        (t - 0.5) * 4.2, // Z = time
      ],
    }
  })
}

function Scene({ points }: Props) {
  const group = useRef<THREE.Group>(null)
  const [hover, setHover] = useState<number | null>(null)
  const placed = place(points)

  // Gentle pointer-driven rotation + a very slow idle drift. No excessive spin.
  useFrame((state) => {
    const g = group.current
    if (!g) return
    const targetY = Math.sin(state.clock.elapsedTime * 0.18) * 0.14 + state.pointer.x * 0.4
    const targetX = -state.pointer.y * 0.2
    g.rotation.y += (targetY - g.rotation.y) * 0.05
    g.rotation.x += (targetX - g.rotation.x) * 0.05
  })

  const linePts = placed.map((p) => new THREE.Vector3(...p.pos))

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} />
      <group ref={group}>
        {linePts.length > 1 && (
          <Line points={linePts} color="#12AFC2" lineWidth={1.5} transparent opacity={0.32} />
        )}
        {placed.map((pt, i) => (
          <mesh
            key={pt.p.date + i}
            position={pt.pos}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHover(i)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHover((h) => (h === i ? null : h))
              document.body.style.cursor = 'auto'
            }}
            scale={hover === i ? 1.4 : 1}
          >
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial
              color={pt.color}
              emissive={pt.color}
              emissiveIntensity={hover === i ? 0.5 : 0.18}
              roughness={0.35}
              metalness={0.1}
            />
            {hover === i && (
              <Html center distanceFactor={9} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
                <div style={{ transform: 'translateY(-60px)' }}>
                  <ChartTooltip
                    title={formatDayLong(pt.p.date)}
                    rows={[
                      { label: 'State', value: STATE_LABEL[pt.state], color: pt.color },
                      { label: 'Attention', value: `${pt.p.attention}%` },
                      { label: 'Cognitive Load', value: `${pt.p.load}` },
                      { label: 'Sessions', value: `${pt.p.sessions}` },
                    ]}
                  />
                </div>
              </Html>
            )}
          </mesh>
        ))}
      </group>
    </>
  )
}

/** Default export so it can be lazy-loaded (code-split from the main bundle). */
export default function CognitiveDepthScene({ points }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 6.5], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene points={points} />
    </Canvas>
  )
}
