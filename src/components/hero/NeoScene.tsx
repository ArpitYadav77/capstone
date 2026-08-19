import { useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { NeoModel } from './NeoModel'
import { piecewise, smoothstep } from './utils'

interface NeoSceneProps {
  progressRef: RefObject<number>
  reducedMotion?: boolean
  quality?: 'high' | 'low'
}

const TAU = Math.PI * 2

/** Drives the camera directly from scroll progress (deterministic + reversible). */
function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  useFrame(({ camera }) => {
    const p = progressRef.current ?? 0
    const z = piecewise(p, [
      [0, 6],
      [0.2, 5.2],
      [0.5, 7.4],
      [0.8, 5.2],
      [1, 6],
    ])
    const y = piecewise(p, [
      [0, 0.4],
      [0.5, 1.0],
      [1, 0.4],
    ])
    camera.position.set(0, y, z)
    camera.lookAt(0, y * 0.5, 0)
  })
  return null
}

function SceneContents({ progressRef, reducedMotion, quality }: Required<NeoSceneProps>) {
  const root = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const p = progressRef.current ?? 0
    const t = reducedMotion ? 0 : clock.elapsedTime
    const g = root.current
    if (!g) return
    // One controlled Y revolution during the rotation/opening stage, then hold.
    g.rotation.y = smoothstep(0.03, 0.35, p) * TAU + Math.sin(t * 0.4) * 0.02
    g.position.y = Math.sin(t * 0.5) * 0.02
  })

  return (
    <>
      <color attach="background" args={['#070a0d']} />
      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#2a3b47', '#05070a', 0.35]} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-3.5, 1.5, -3]} intensity={8} distance={16} color="#57e0ff" />
      <pointLight position={[3, -1, 3]} intensity={2.4} distance={10} color="#9fd8ff" />

      <group ref={root}>
        <NeoModel progressRef={progressRef} reducedMotion={reducedMotion} />
      </group>

      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.5}
        scale={11}
        blur={2.6}
        far={4}
        color="#000000"
      />

      <Environment resolution={quality === 'high' ? 128 : 64} frames={1}>
        <Lightformer intensity={1.1} position={[0, 3, 3]} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer intensity={0.7} position={[-4, 1, -2]} scale={[4, 5, 1]} color="#57e0ff" />
        <Lightformer intensity={0.5} position={[4, 0, -3]} scale={[3, 4, 1]} color="#9fe6ff" />
      </Environment>

      <CameraRig progressRef={progressRef} />
    </>
  )
}

/**
 * The NEO WebGL scene. Default export so it can be lazy-loaded (code-split) —
 * the heavy Three.js bundle only downloads when the hero actually mounts it.
 */
export default function NeoScene({ progressRef, reducedMotion = false, quality = 'high' }: NeoSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6], fov: 38 }}
      dpr={[1, quality === 'high' ? 1.75 : 1.25]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      shadows
    >
      <SceneContents progressRef={progressRef} reducedMotion={reducedMotion} quality={quality} />
    </Canvas>
  )
}
