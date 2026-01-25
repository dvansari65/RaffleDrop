import CTASection from "@/components/CtaSection";
import FAQSection from "@/components/FAQsection";
import FeaturesSection from "@/components/Feature";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorks";
import StatsSection from "@/components/StatsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection/>
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
