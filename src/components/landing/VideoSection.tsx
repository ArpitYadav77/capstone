import { Reveal } from '@/components/ui/Reveal'
import { NeoVideo } from './NeoVideo'

/** Cinematic product-video band right after the hero. */
export function VideoSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-x">
        <Reveal>
          <NeoVideo src="/videos/neo-intro.mp4" caption="Always paying attention." />
        </Reveal>
      </div>
    </section>
  )
}
