import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Story } from '@/components/landing/Story'
import { HowSteps } from '@/components/landing/HowSteps'
import { NeoHero } from '@/components/hero/NeoHero'
import { Privacy } from '@/components/sections/Privacy'
import { CTA } from '@/components/sections/CTA'

export function Landing() {
  return (
    <div className="relative min-h-screen bg-ivory text-ink">
      <Navbar />
      <main>
        <Hero />
        <Story />
        <HowSteps />
        {/* Premium hardware engineering reveal (scroll-driven 3D). */}
        <NeoHero />
        <Privacy />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
