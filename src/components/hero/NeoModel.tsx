import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { explodeAmount, lerp } from './utils'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  NeoModel — the NEO robot, as a set of named parts that explode/reassemble.
 *
 *  This is a PROCEDURAL PLACEHOLDER (no .glb in the repo yet). It is intentionally
 *  isolated so a real model can be dropped in later WITHOUT touching the scroll
 *  system: drop `public/models/neo.glb`, load it with useGLTF, map its nodes to
 *  the same parts (base / shell / speaker / board / camera / face), and keep the
 *  `PARTS` assembled→exploded targets. Everything else (scroll → explodeAmount →
 *  positions) stays the same.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface NeoModelProps {
  progressRef: RefObject<number>
  reducedMotion?: boolean
}

// Assembled (nested) and exploded (vertical stack) targets per part, in model space.
const PARTS = {
  base: { a: [0, -0.95, 0], e: [0, -2.7, 0] },
  shell: { a: [0, 0.05, 0], e: [0, -1.5, 0] },
  speaker: { a: [0, -0.35, 0], e: [0, -0.5, 0] },
  board: { a: [0, 0.1, -0.05], e: [0, 0.5, 0] },
  camera: { a: [0, 0.45, 0.3], e: [0, 1.4, 0.15] },
  face: { a: [0, 0.05, 0.62], e: [0, 2.4, 0.5] },
} as const

const GRAPHITE = '#12161b'
const SHELL = '#0c0f13'

export function NeoModel({ progressRef, reducedMotion = false }: NeoModelProps) {
  const base = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Group>(null)
  const speaker = useRef<THREE.Group>(null)
  const board = useRef<THREE.Group>(null)
  const camera = useRef<THREE.Group>(null)
  const face = useRef<THREE.Group>(null)

  const set = (
    ref: RefObject<THREE.Group>,
    cfg: { a: readonly number[]; e: readonly number[] },
    k: number,
  ) => {
    const g = ref.current
    if (!g) return
    g.position.set(
      lerp(cfg.a[0], cfg.e[0], k),
      lerp(cfg.a[1], cfg.e[1], k),
      lerp(cfg.a[2], cfg.e[2], k),
    )
  }

  useFrame(({ clock }) => {
    const p = progressRef.current ?? 0
    const k = explodeAmount(p)
    const t = reducedMotion ? 0 : clock.elapsedTime

    set(base, PARTS.base, k)
    set(shell, PARTS.shell, k)
    set(speaker, PARTS.speaker, k)
    set(board, PARTS.board, k)
    set(camera, PARTS.camera, k)
    set(face, PARTS.face, k)

    // Subtle drift on internal parts only while exploded (kept minimal).
    if (camera.current) camera.current.rotation.y = k * Math.sin(t * 0.3) * 0.18
    if (board.current) board.current.rotation.y = k * Math.sin(t * 0.25 + 1) * 0.12
    if (speaker.current) speaker.current.rotation.y = k * Math.sin(t * 0.28 + 2) * 0.1
  })

  return (
    <group>
      {/* Base / pedestal */}
      <group ref={base}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.82, 0.98, 0.4, 48]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.6} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <torusGeometry args={[0.7, 0.02, 12, 64]} />
          <meshStandardMaterial color="#57e0ff" emissive="#57e0ff" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      </group>

      {/* Main rounded body shell */}
      <group ref={shell}>
        <RoundedBox args={[1.7, 1.7, 1.35]} radius={0.42} smoothness={5} castShadow receiveShadow>
          <meshStandardMaterial color={SHELL} roughness={0.5} metalness={0.42} />
        </RoundedBox>
      </group>

      {/* Speaker / microphone */}
      <group ref={speaker}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.16, 48]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.7} metalness={0.3} />
        </mesh>
        {[0.2, 0.32, 0.44].map((r) => (
          <mesh key={r} position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.006, 8, 48]} />
            <meshStandardMaterial color="#2a3540" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Main internal board */}
      <group ref={board}>
        <RoundedBox args={[1.15, 0.07, 0.95]} radius={0.03} smoothness={3} castShadow>
          <meshStandardMaterial color="#12332a" roughness={0.75} metalness={0.2} />
        </RoundedBox>
        {[
          [-0.3, 0.08, 0.2],
          [0.25, 0.08, -0.15],
          [0.1, 0.08, 0.3],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <boxGeometry args={[0.16, 0.05, 0.16]} />
            <meshStandardMaterial color="#57e0ff" emissive="#57e0ff" emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Internal camera / lens */}
      <group ref={camera}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.24, 0.24]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.08, 32]} />
          <meshStandardMaterial color="#0a2230" emissive="#2aa0c8" emissiveIntensity={0.8} metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* Front circular display + cyan LED ring */}
      <group ref={face}>
        {/* glossy dark screen */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.09, 64]} />
          <meshStandardMaterial color="#05070b" roughness={0.15} metalness={0.3} />
        </mesh>
        {/* cyan LED ring */}
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.64, 0.045, 16, 96]} />
          <meshStandardMaterial color="#0a1418" emissive="#57e0ff" emissiveIntensity={2.4} toneMapped={false} roughness={0.4} />
        </mesh>
        {/* subtle inner glow dot */}
        <mesh position={[0, 0, 0.06]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#0a1418" emissive="#57e0ff" emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
