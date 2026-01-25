import { Package, Users, Shuffle, Trophy } from "lucide-react";

const steps = [
  {
    icon: Package,
    step: "01",
    title: "Sellers List Items",
    description: "Premium products are listed by verified sellers with transparent pricing and raffle details.",
  },
  {
    icon: Users,
    step: "02",
    title: "Buyers Enter Raffles",
    description: "Pay a small entry fee for a chance to win. The more entries, the bigger the prize pool.",
  },
  {
    icon: Shuffle,
    step: "03",
    title: "Randomness Picks Winner",
    description: "Switchboard VRF ensures provably fair, tamper-proof random selection on-chain.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Winner Gets the Product",
    description: "One lucky winner receives the product at a fraction of retail. Seller gets paid instantly.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Simple. Transparent. <span className="text-gradient">Fair.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to winning premium products at unbeatable prices
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl glass border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-display font-bold text-sm">{step.step}</span>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;