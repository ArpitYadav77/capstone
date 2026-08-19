import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StaticBackground } from '@/components/layout/StaticBackground'
import { NeoHero } from '@/components/hero/NeoHero'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Features } from '@/components/sections/Features'
import { DashboardPreview } from '@/components/sections/DashboardPreview'
import { Privacy } from '@/components/sections/Privacy'
import { CTA } from '@/components/sections/CTA'

export function Landing() {
  return (
    <>
      {/* Static premium background — no canvas, no animation loop. */}
      <StaticBackground />

      <div className="relative z-10">
        <Navbar />
        <main>
          <NeoHero />
          <HowItWorks />
          <Features />
          <DashboardPreview />
          <Privacy />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  )
}
