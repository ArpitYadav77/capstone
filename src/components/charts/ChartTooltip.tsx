export interface TooltipRow {
  label: string
  value: string
  color?: string
}

/**
 * Premium chart tooltip — white card, thin border, soft shadow, rounded.
 * Purely presentational; positioning/animation is handled by the caller.
 */
export function ChartTooltip({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div className="pointer-events-none min-w-[160px] rounded-xl border border-line bg-card px-3 py-2.5 shadow-card-hover">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{title}</p>
      <div className="mt-1.5 space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-6 text-[13px]">
            <span className="flex items-center gap-1.5 text-ink-soft">
              {r.color && (
                <span className="h-2 w-2 rounded-full" style={{ background: r.color }} aria-hidden />
              )}
              {r.label}
            </span>
            <span className="font-semibold tabular-nums text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
