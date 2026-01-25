import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Join 8,500+ winners</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
            Ready to <span className="text-gradient">Win Big?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of winners on the most transparent raffle platform. 
            Your next big win is just one entry away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 py-7 text-lg glow group">
              Launch App
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-muted px-10 py-7 text-lg">
              Read Docs
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 mt-16 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">SOL</span>
              </div>
              <span className="text-sm text-muted-foreground">Built on Solana</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">VRF</span>
              </div>
              <span className="text-sm text-muted-foreground">Switchboard VRF</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">🔒</span>
              </div>
              <span className="text-sm text-muted-foreground">Audited</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
