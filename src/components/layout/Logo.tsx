import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
  theme?: 'dark' | 'light'
}

/**
 * DeskRobo wordmark with a small neural glyph. "Neo" is the assistant persona.
 * `theme` adapts it for the light landing vs the dark app.
 */
export function Logo({ className, theme = 'light' }: LogoProps) {
  const light = theme === 'light'
  const accent = light ? '#12AFC2' : '#57e0ff'
  const accent2 = light ? '#12AFC2' : '#69f0b4'

  return (
    <a href="#top" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative grid h-8 w-8 place-items-center rounded-lg border',
          light ? 'border-ink/10 bg-ink/[0.03]' : 'border-white/10 bg-white/[0.02]',
        )}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke={accent} strokeWidth="1.2" opacity="0.55" />
          <circle cx="12" cy="12" r="2.1" fill={accent2} />
          <circle cx="5.5" cy="9" r="1.1" fill={accent} />
          <circle cx="18.5" cy="15" r="1.1" fill={accent} />
          <path d="M12 12 L5.5 9 M12 12 L18.5 15" stroke={accent} strokeWidth="0.7" opacity="0.5" />
        </svg>
      </span>
      <span
        className={cn(
          'font-display text-[17px] font-semibold tracking-tight',
          light ? 'text-ink' : 'text-white',
        )}
      >
        DeskRobo
        <span className={cn('ml-1.5 font-mono text-[11px] font-normal', light ? 'text-teal' : 'text-neon-cyan/70')}>
          Neo
        </span>
      </span>
    </a>
  )
}
