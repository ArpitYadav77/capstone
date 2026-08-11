/**
 * Static, GPU-light premium background for the landing page.
 *
 * Pure CSS — no canvas, no animation loop. Layered radial accent glows over a
 * deep charcoal base, a faint masked dot grid for deep-tech texture, and a
 * vignette. Keeps the DeskRobo cyan/green identity without any runtime cost.
 */
export function StaticBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* Restrained cyan glow from the top. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 620px at 50% -12%, rgba(87,224,255,0.10), transparent 62%)',
        }}
      />
      {/* Subtle green counter-glow from the lower left. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 520px at 12% 108%, rgba(105,240,180,0.07), transparent 60%)',
        }}
      />
      {/* Faint dot grid, faded out toward the edges. */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(143,233,255,0.10) 1px, transparent 1.4px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(120% 90% at 50% 0%, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 0%, black, transparent 70%)',
        }}
      />
      {/* Edge vignette to keep focus centered. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 100% at 50% 40%, transparent 55%, rgba(6,8,10,0.7) 100%)',
        }}
      />
    </div>
  )
}
