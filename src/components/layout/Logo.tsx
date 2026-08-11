import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
}

/**
 * DeskRobo wordmark with a small neural glyph. "Neo" is the assistant persona.
 */
export function Logo({ className }: LogoProps) {
  return (
    <a href="#top" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02]">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="#57e0ff" strokeWidth="1.2" opacity="0.55" />
          <circle cx="12" cy="12" r="2.1" fill="#69f0b4" />
          <circle cx="5.5" cy="9" r="1.1" fill="#57e0ff" />
          <circle cx="18.5" cy="15" r="1.1" fill="#57e0ff" />
          <path
            d="M12 12 L5.5 9 M12 12 L18.5 15"
            stroke="#57e0ff"
            strokeWidth="0.7"
            opacity="0.5"
          />
        </svg>
        <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 shadow-glow transition-opacity duration-300 group-hover:opacity-100" />
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight text-white">
        DeskRobo
        <span className="ml-1.5 font-mono text-[11px] font-normal text-neon-cyan/70">Neo</span>
      </span>
    </a>
  )
}
