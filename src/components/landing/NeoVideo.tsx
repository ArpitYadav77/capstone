import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { cn } from '@/lib/cn'

interface NeoVideoProps {
  /** e.g. "/videos/neo-intro.mp4" — placed under public/videos/. */
  src: string
  poster?: string
  caption?: string
  className?: string
}

/**
 * Cinematic product-video container. Accepts a real video later; until then it
 * shows a premium placeholder naming the expected path. The caption overlays
 * both states. Autoplay is muted, looped, and disabled under reduced-motion.
 */
export function NeoVideo({ src, poster, caption, className }: NeoVideoProps) {
  const [errored, setErrored] = useState(false)
  const reduce = useReducedMotion()

  return (
    <div
      className={cn(
        'hover-media relative aspect-video w-full overflow-hidden rounded-[2rem] bg-sand shadow-[0_40px_100px_-45px_rgba(23,23,23,0.4)]',
        className,
      )}
    >
      {!errored ? (
        <video
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay={!reduce}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#E9E6DE] via-[#F0EDE6] to-[#F5F3EE]">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-white/70 text-ink shadow-sm">
            <Play className="ml-0.5 h-6 w-6" strokeWidth={1.6} />
          </div>
          <p className="font-mono text-[11px] text-ink-soft">{src.replace(/^\//, '')}</p>
        </div>
      )}

      {/* subtle vignette for caption legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      {caption && (
        <div className="absolute bottom-5 left-6 flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-teal" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/90">{caption}</span>
        </div>
      )}
    </div>
  )
}
