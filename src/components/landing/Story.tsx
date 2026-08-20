import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { NeoImage } from './NeoImage'
import { HighlightUnderline } from './HighlightUnderline'
import { cn } from '@/lib/cn'

interface Beat {
  n: string
  title: ReactNode
  body: string
  img: string
  alt: string
}

const STORY: Beat[] = [
  {
    n: '01',
    title: 'NEO sees.',
    body:
      'Your camera stays on your device while NEO observes simple visual signals such as gaze and eye behavior. No raw video ever leaves your desk.',
    img: '/images/neo/neo-focus.png',
    alt: 'NEO observing gaze and focus on a warm desk',
  },
  {
    n: '02',
    title: 'NEO understands.',
    body:
      'Those behavioral signals become clear attention and fatigue-related indicators — a wellness estimate you can act on, never a medical diagnosis.',
    img: '/images/neo/neo-desk.png',
    alt: 'NEO beside a laptop translating signals into insight',
  },
  {
    n: '03',
    title: (
      <>
        NEO <HighlightUnderline color="#0F9C9C">responds</HighlightUnderline>.
      </>
    ),
    body:
      'Talk to NEO naturally and get useful, spoken feedback about your session — right when you could use a nudge to reset.',
    img: '/images/neo/neo-voice.png',
    alt: 'Person talking naturally to NEO',
  },
  {
    n: '04',
    title: 'NEO is there when you need it.',
    body:
      'A calm companion that sits beside your laptop and helps you notice the right moment to pause, breathe and refocus.',
    img: '/images/neo/neo-companion.png',
    alt: 'NEO as a friendly companion sitting beside a laptop',
  },
]

export function Story() {
  return (
    <section id="product" className="py-20 sm:py-28">
      <div className="container-x space-y-24 sm:space-y-32">
        {STORY.map((beat, i) => {
          const reversed = i % 2 === 1
          return (
            <Reveal key={beat.n}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={cn('max-w-md', reversed ? 'lg:order-2' : 'lg:order-1')}>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">/ {beat.n}</span>
                  <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                    {beat.title}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-ink-soft">{beat.body}</p>
                </div>
                <div className={cn(reversed ? 'lg:order-1' : 'lg:order-2')}>
                  <NeoImage src={beat.img} alt={beat.alt} className="aspect-[4/3]" />
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
