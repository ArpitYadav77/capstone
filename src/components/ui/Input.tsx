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
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-[#8a97a5]">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-11 w-full rounded-xl border border-line bg-white/[0.02] px-4 text-[15px] text-white placeholder:text-[#5b6672] outline-none transition-colors focus:border-neon-cyan/40 focus:bg-white/[0.04]',
            className,
          )}
          {...props}
        />
      </label>
    )
  },
)

Input.displayName = 'Input'
