import { Shield, Zap, Globe, Lock, BarChart3, Wallet } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Provably Fair",
    description: "Every raffle uses Switchboard VRF for verifiable, tamper-proof randomness. Results are transparent and auditable.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Winners receive products immediately. Sellers get paid the moment the raffle concludes. No delays.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Participate from anywhere in the world. No geographic restrictions, just connect your wallet and play.",
  },
  {
    icon: Lock,
    title: "Non-Custodial",
    description: "Your funds remain in your wallet until the raffle executes. Full control, zero trust required.",
  },
  {
    icon: BarChart3,
    title: "Transparent Odds",
    description: "See exactly how many entries exist and your winning probability in real-time before entering.",
  },
  {
    icon: Wallet,
    title: "Low Entry Fees",
    description: "Micro-transactions make premium products accessible. Enter raffles for as low as $1.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative bg-card/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Built for the <span className="text-gradient">Future</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cutting-edge technology meets seamless user experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(204,255,0,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;