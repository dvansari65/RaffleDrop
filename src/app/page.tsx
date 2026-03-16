import Hero from '@/components/home/hero'
import { HowItWorks } from '@/components/home/how-it-works'
import { Features } from '@/components/home/feature'
import { FAQ } from '@/components/home/faq'
import { CTA } from '@/components/home/cta'

export default function Index() {
  return (
    <div className="relative overflow-hidden bg-background">
      <Hero />
      <HowItWorks />
      <Features />

      {/* 
        Outer div height = FAQ height + CTA height
        200vh gives each section 100vh of scroll travel 
      */}
      <div className="relative h-[200vh]">
        {/* FAQ sticks, has z-index above CTA */}
        <div className="sticky top-0 h-screen z-20 overflow-hidden">
          <FAQ />
        </div>

        {/* CTA is pulled up behind FAQ, revealed as FAQ scrolls away */}
        <div className="absolute top-[100vh] left-0 right-0 z-10">
          <CTA />
        </div>
      </div>
    </div>
  )
}
