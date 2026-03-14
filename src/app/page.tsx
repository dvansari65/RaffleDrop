import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion'
import {
  ArrowRight,
  BarChart3,
  Globe,
  Lock,
  Package,
  Shield,
  Shuffle,
  Sparkles,
  Trophy,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    question: 'How does the randomness work?',
    answer:
      'We use Switchboard VRF (Verifiable Random Function) to generate provably fair random numbers on-chain. This ensures that no one, including us, can predict or manipulate the outcome of any raffle.',
  },
  {
    question: "What happens if a raffle doesn't fill up?",
    answer:
      "If a raffle doesn't reach its minimum entry threshold before the deadline, all entries are automatically refunded to participants. Your funds are safe and returned to your wallet.",
  },
  {
    question: 'How do sellers get verified?',
    answer:
      'Sellers go through a verification process that includes identity verification and proof of product ownership. We also hold funds in escrow until the winner confirms receipt of the product.',
  },
  {
    question: 'What wallets are supported?',
    answer:
      'We support all major Solana wallets including Phantom, Solflare, Backpack, and more. Simply connect your preferred wallet to get started.',
  },
  {
    question: 'Are there any fees?',
    answer:
      'We charge a small 2.5% platform fee on successful raffles. This is only charged when a raffle completes successfully. There are no fees for entering raffles beyond the entry price.',
  },
  {
    question: 'How do I receive my winnings?',
    answer:
      "For digital items, delivery is instant to your wallet. For physical items, sellers coordinate shipping directly with winners. We hold the seller's payment in escrow until delivery is confirmed.",
  },
]

const stats = [
  { value: '$2.4M+', label: 'Total Volume', description: 'In raffle transactions' },
  { value: '12,847', label: 'Raffles Completed', description: 'Successfully executed' },
  { value: '8,523', label: 'Active Users', description: 'And growing daily' },
  { value: '99.9%', label: 'Uptime', description: 'Reliable infrastructure' },
]

const features = [
  {
    icon: Shield,
    title: 'Provably Fair',
    description:
      'Every raffle uses Switchboard VRF for verifiable, tamper-proof randomness. Results are transparent and auditable.',
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Winners receive products immediately. Sellers get paid the moment the raffle concludes. No delays.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description:
      'Participate from anywhere in the world. No geographic restrictions, just connect your wallet and play.',
  },
  {
    icon: Lock,
    title: 'Non-Custodial',
    description: 'Your funds remain in your wallet until the raffle executes. Full control, zero trust required.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Odds',
    description: 'See exactly how many entries exist and your winning probability in real-time before entering.',
  },
  {
    icon: Wallet,
    title: 'Low Entry Fees',
    description: 'Micro-transactions make premium products accessible. Enter raffles for as low as $1.',
  },
]

const steps = [
  {
    icon: Package,
    step: '01',
    title: 'Sellers List Items',
    description: 'Premium products are listed by verified sellers with transparent pricing and raffle details.',
  },
  {
    icon: Users,
    step: '02',
    title: 'Buyers Enter Raffles',
    description: 'Pay a small entry fee for a chance to win. The more entries, the bigger the prize pool.',
  },
  {
    icon: Shuffle,
    step: '03',
    title: 'Winner Is Drawn',
    description: 'Once the deadline passes, a winner is selected on-chain — provably fair and fully transparent.',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Winner Gets the Product',
    description: 'One lucky winner receives the product at a fraction of retail. Seller gets paid instantly.',
  },
]

const Index = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-pattern opacity-[0.12]" />
        <div className="absolute -top-40 -left-32 w-[280px] h-[280px] md:w-[420px] md:h-[420px] bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[320px] h-[320px] md:w-[520px] md:h-[520px] bg-accent/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-[280px] h-[280px] md:w-[500px] md:h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[220px] h-[220px] md:w-[400px] md:h-[400px] bg-secondary/15 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-40 left-20 w-3 h-3 bg-primary rounded-full animate-float opacity-60" />
        <div
          className="absolute top-60 right-32 w-2 h-2 bg-secondary rounded-full animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-40 left-40 w-4 h-4 bg-primary/50 rounded-full animate-float"
          style={{ animationDelay: '3s' }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-4 md:mb-6 animate-slide-up leading-tight"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="text-foreground">Win Big with</span>
              <br />
              <span className="text-gradient">Decentralized</span>
              <br />
              <span className="text-foreground">Raffles</span>
            </h1>

            <p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-2 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              Enter raffles with micro-fees, get a chance to win premium products at a fraction of the price. Provably
              fair, fully on-chain, powered by verifiable randomness.
            </p>

            <div
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-xs sm:max-w-xl mx-auto mt-10 md:mt-16 animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gradient">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Total Volume</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gradient">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Raffles Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gradient">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Active Users</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 md:py-32 relative">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-primary text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 md:mb-4">
              Simple. Transparent. <span className="text-gradient">Fair.</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Four simple steps to winning premium products at unbeatable prices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.step}
                  className="group relative p-5 md:p-8 rounded-2xl glass border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="absolute -top-3 -right-3 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="text-primary font-display font-bold text-xs md:text-sm">{step.step}</span>
                  </div>
                  <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                  </div>
                  <h3 className="text-base md:text-xl font-display font-semibold text-foreground mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 md:py-32 relative bg-card/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-primary text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 md:mb-4">
              Built for the <span className="text-gradient">Future</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Cutting-edge technology meets seamless user experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-5 md:p-8 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(204,255,0,0.1)]"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="text-base md:text-xl font-display font-semibold text-foreground mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="glass rounded-2xl md:rounded-3xl border border-primary/20 p-6 sm:p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-3 md:p-6 rounded-xl md:rounded-2xl hover:bg-primary/5 transition-colors"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gradient mb-1 md:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-lg font-semibold text-foreground mb-0.5 md:mb-1">{stat.label}</div>
                  <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-32 relative bg-card/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-primary text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 md:mb-4">
              Got <span className="text-gradient">Questions?</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Everything you need to know about RaffleDrop
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-background border border-border rounded-xl px-4 md:px-6 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left text-sm md:text-base font-display font-semibold text-foreground hover:text-primary hover:no-underline py-4 md:py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-4 md:pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-primary/10 rounded-full blur-[200px]" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass border border-primary/30 mb-6 md:mb-8">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">Join 8,500+ winners</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 md:mb-6">
              Ready to <span className="text-gradient">Win Big?</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-2">
              Join thousands of winners on the most transparent raffle platform. Your next big win is just one entry
              away.
            </p>

            <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
              <Button size="lg" className="gap-2 text-sm md:text-base px-5 md:px-6 py-2.5 md:py-3">
                Start Winning <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-sm md:text-base px-5 md:px-6 py-2.5 md:py-3">
                Browse Raffles
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-8 mt-10 md:mt-16 opacity-60 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-[10px] md:text-xs font-bold">SOL</span>
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">Built on Solana</span>
              </div>
              <div className="w-px h-5 md:h-6 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-[10px] md:text-xs font-bold">VRF</span>
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">Switchboard VRF</span>
              </div>
              <div className="w-px h-5 md:h-6 bg-border hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-[10px] md:text-xs font-bold">🔒</span>
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">Audited</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
