import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  // Filled with a controlled cyan glow — the single loudest element on screen.
  primary:
    'bg-neon-cyan/95 text-base-950 hover:bg-neon-cyan shadow-[0_0_0_1px_rgba(87,224,255,0.4)] hover:shadow-glow',
  // Quiet, hairline-bordered.
  secondary:
    'text-[#e7edf2] hairline bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20',
  ghost: 'text-[#c3ccd6] hover:text-white hover:bg-white/[0.04]',
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
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    )
  },
)

Button.displayName = 'Button'
