/**
 * Static, GPU-light premium background for the auth pages.
 *
 * Pure CSS — no canvas, no animation loop. Warm ivory base with restrained
 * teal / soft-green radial glows and a faint dot grid, so the sign-in screens
 * connect visually to the warm landing and application.
 */
export function StaticBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-ivory" aria-hidden>
      {/* Restrained teal glow from the top. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 620px at 50% -12%, rgba(18,175,194,0.10), transparent 62%)',
        }}
      />
      {/* Soft green counter-glow from the lower left. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 520px at 12% 108%, rgba(85,184,137,0.08), transparent 60%)',
        }}
      />
      {/* Faint dot grid, faded out toward the edges. */}
      <div
        className="absolute inset-0 opacity-[0.6]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(23,23,23,0.06) 1px, transparent 1.4px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(120% 90% at 50% 0%, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 0%, black, transparent 70%)',
        }}
      />
    </div>
  )
}
