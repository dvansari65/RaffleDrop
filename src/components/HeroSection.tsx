import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      
      {/* Floating Elements */}
      <div className="absolute top-40 left-20 w-3 h-3 bg-primary rounded-full animate-float opacity-60" />
      <div className="absolute top-60 right-32 w-2 h-2 bg-secondary rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-40 left-40 w-4 h-4 bg-primary/50 rounded-full animate-float" style={{ animationDelay: '3s' }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Switchboard VRF</span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-foreground">Win Big with</span>
            <br />
            <span className="text-gradient">Decentralized</span>
            <br />
            <span className="text-foreground">Raffles</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Enter raffles with micro-fees, get a chance to win premium products at a fraction of the price. 
            Provably fair, fully on-chain, powered by verifiable randomness.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg glow group">
              Start Winning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-muted px-8 py-6 text-lg group">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient">$2.4M+</div>
              <div className="text-sm text-muted-foreground mt-1">Total Volume</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient">12K+</div>
              <div className="text-sm text-muted-foreground mt-1">Raffles Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient">8.5K+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
