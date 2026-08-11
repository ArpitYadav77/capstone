import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
}

/** Accessible on/off switch used across Settings. */
export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-[15px] text-white">{label}</p>
        {description && <p className="mt-0.5 text-[13px] text-[#8a97a5]">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-neon-cyan/50 bg-neon-cyan/25' : 'border-line bg-white/[0.03]',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all',
            checked ? 'left-6 bg-neon-cyan shadow-glow' : 'left-1 bg-[#8a97a5]',
          )}
        />
      </button>
    </div>
  )
}
