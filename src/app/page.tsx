import Hero from '@/components/home/hero'
import { MobileProvider } from '@/provider/mobile-provider'
import dynamic from 'next/dynamic'

const HowItWorks = dynamic(() => import('@/components/home/how-it-works').then((m) => ({ default: m.HowItWorks })))
const Features = dynamic(() => import('@/components/home/feature').then((m) => ({ default: m.Features })))
const FAQ = dynamic(() => import('@/components/home/faq').then((m) => ({ default: m.FAQ })))
const CTA = dynamic(() => import('@/components/home/cta').then((m) => ({ default: m.CTA })))

export default function Index() {
  return (
    <MobileProvider>
      <div className="relative bg-black">
        <Hero />
        <HowItWorks />
        <Features />
        <div className="relative h-[200vh]">
          <div className="sticky top-0 h-screen z-10">
            <CTA />
          </div>
          <div className="absolute top-0 left-0 right-0 z-20">
            <FAQ />
          </div>
        </div>
      </div>
    </MobileProvider>
  )
}
