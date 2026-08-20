import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface NeoImageProps {
  /** e.g. "/images/neo/neo-desk.webp" — placed under public/images/neo/. */
  src: string
  alt: string
  /** Tailwind aspect + sizing classes for the frame. */
  className?: string
  /** rounded size */
  rounded?: string
  priority?: boolean
}

/**
 * Product/lifestyle image frame. When the asset isn't present yet (none are
 * shipped in the repo), it shows a premium placeholder that names the expected
 * file path — so the layout stays intact and the drop-in point is obvious.
 */
export function NeoImage({ src, alt, className, rounded = 'rounded-3xl', priority }: NeoImageProps) {
  const [errored, setErrored] = useState(false)

  return (
    <div
      className={cn(
        'hover-media relative overflow-hidden bg-sand shadow-[0_30px_80px_-40px_rgba(23,23,23,0.35)]',
        rounded,
        className,
      )}
    >
      {!errored ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#ECE9E1] to-[#F5F3EE] p-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-ink/10 bg-white/60 text-ink-soft">
            <ImageIcon className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <p className="font-mono text-[11px] text-ink-soft">{src.replace(/^\//, '')}</p>
          <p className="max-w-[16rem] text-xs text-ink-soft/70">{alt}</p>
        </div>
      )}
    </div>
  )
}
