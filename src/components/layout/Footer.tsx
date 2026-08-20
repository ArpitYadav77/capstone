import { Logo } from './Logo'

const COLUMNS: { heading: string; links: string[] }[] = [
  { heading: 'Product', links: ['Cognitive Check', 'Dashboard', 'Analytics', 'Recovery'] },
  { heading: 'Technology', links: ['Eye Gaze', 'Facial Dynamics', 'Cognitive Load', 'On-device CV'] },
  { heading: 'Company', links: ['About', 'Privacy', 'Responsible Use', 'Contact'] },
]

export function Footer() {
  return (
    <footer className="border-t border-ink/[0.07] bg-ivory">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo theme="light" />
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              A privacy-conscious cognitive-wellness platform. DeskRobo turns behavioral signals
              into an understandable estimate of cognitive load.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft/70">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#top" className="text-sm text-ink-soft transition-colors hover:text-ink">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} DeskRobo. Neo is a wellness tool, not a medical device.
          </p>
          <p className="max-w-lg text-xs leading-relaxed text-ink-soft/70">
            DeskRobo estimates cognitive load from behavioral signals and does not diagnose stress,
            anxiety, depression or any medical condition.
          </p>
        </div>
      </div>
    </footer>
  )
}
