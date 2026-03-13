import CTASection from '@/components/CtaSection'
import FAQSection from '@/components/FAQsection'
import FeaturesSection from '@/components/Feature'
import HeroSection from '@/components/HeroSection'
import HowItWorksSection from '@/components/HowItWorks'
import StatsSection from '@/components/StatsSection'

const Index = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative background for the landing content only.
          AppLayout already provides the global background + header/footer. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-pattern opacity-[0.12]" />
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[520px] h-[520px] bg-accent/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}

export default Index
