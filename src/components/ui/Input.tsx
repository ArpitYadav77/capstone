import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => {
    return (
      <label htmlFor={id} className="block">
        {label && (
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-11 w-full rounded-xl border border-line bg-card px-4 text-[15px] text-ink placeholder:text-ink-muted outline-none transition-colors focus:border-teal/60 focus:ring-2 focus:ring-teal/15',
            className,
          )}
          {...props}
        />
      </label>
    )
  },
)

Input.displayName = 'Input'
