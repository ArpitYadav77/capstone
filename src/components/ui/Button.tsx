import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'ink' | 'light'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  // Primary teal — the main call to action across the product.
  primary:
    'bg-teal text-white hover:bg-[#0f9aab] shadow-[0_6px_20px_-8px_rgba(18,175,194,0.55)]',
  // Quiet, white with a hairline border.
  secondary:
    'text-ink border border-line bg-card hover:bg-card-soft hover:border-ink/20 shadow-[0_2px_8px_rgba(30,30,20,0.04)]',
  ghost: 'text-ink-soft hover:text-ink hover:bg-ink/[0.04]',
  // ── High-contrast dark CTA (used sparingly on the landing) ──
  ink: 'bg-ink text-ivory hover:bg-black ring-offset-ivory shadow-[0_10px_30px_-12px_rgba(23,23,23,0.5)]',
  light:
    'text-ink border border-ink/15 bg-white/50 hover:bg-white hover:border-ink/30 ring-offset-ivory',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {leftIcon && (
          <span className="inline-flex transition-transform duration-300 group-hover:-translate-x-0.5">
            {leftIcon}
          </span>
        )}
        {children}
        {/* Trailing icon (e.g. an arrow) glides right on hover. */}
        {rightIcon && (
          <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1">
            {rightIcon}
          </span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
