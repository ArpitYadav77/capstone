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
        <p className="text-[15px] text-ink">{label}</p>
        {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-teal bg-teal' : 'border-line bg-card-soft',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all',
            checked ? 'left-6 bg-white shadow-sm' : 'left-1 bg-ink-muted',
          )}
        />
      </button>
    </div>
  )
}
