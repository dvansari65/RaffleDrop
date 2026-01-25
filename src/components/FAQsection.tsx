import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  
  const faqs = [
    {
      question: "How does the randomness work?",
      answer: "We use Switchboard VRF (Verifiable Random Function) to generate provably fair random numbers on-chain. This ensures that no one, including us, can predict or manipulate the outcome of any raffle.",
    },
    {
      question: "What happens if a raffle doesn't fill up?",
      answer: "If a raffle doesn't reach its minimum entry threshold before the deadline, all entries are automatically refunded to participants. Your funds are safe and returned to your wallet.",
    },
    {
      question: "How do sellers get verified?",
      answer: "Sellers go through a verification process that includes identity verification and proof of product ownership. We also hold funds in escrow until the winner confirms receipt of the product.",
    },
    {
      question: "What wallets are supported?",
      answer: "We support all major Solana wallets including Phantom, Solflare, Backpack, and more. Simply connect your preferred wallet to get started.",
    },
    {
      question: "Are there any fees?",
      answer: "We charge a small 2.5% platform fee on successful raffles. This is only charged when a raffle completes successfully. There are no fees for entering raffles beyond the entry price.",
    },
    {
      question: "How do I receive my winnings?",
      answer: "For digital items, delivery is instant to your wallet. For physical items, sellers coordinate shipping directly with winners. We hold the seller's payment in escrow until delivery is confirmed.",
    },
  ];
  
  const FAQSection = () => {
    return (
      <section id="faq" className="py-32 relative bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Got <span className="text-gradient">Questions?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about RaffleDrop
            </p>
          </div>
  
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-background border border-border rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    );
  };
  
  export default FAQSection;
  