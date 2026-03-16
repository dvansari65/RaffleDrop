'use client'

import React, { useRef, memo } from 'react'
import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useMobile } from '@/provider/mobile-provider'

// ── Static data — module level, never recreated ──────────────────────────
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

// ── Precomputed scroll ranges — calculated once at module load ───────────
const FAQ_SCROLL_RANGES = faqs.map((_, i) => {
  const start = 0.15 + i * 0.05
  return { start, end: start + 0.15 }
})

// ── Spring config — stable object reference, never recreated ─────────────
const SPRING_ITEM = { stiffness: 120, damping: 25 }
const SPRING_MAIN = { stiffness: 100, damping: 30 }

// ── FAQItem — memo prevents re-render when parent scroll state changes ───
const FAQItem = memo(function FAQItem({
  faq,
  index,
  scrollYProgress,
}: {
  faq: { question: string; answer: string }
  index: number
  scrollYProgress: MotionValue<number>
}) {
  const { start, end } = FAQ_SCROLL_RANGES[index]

  const x = useTransform(scrollYProgress, [start, end], [-60, 0])
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1])

  const smoothX = useSpring(x, SPRING_ITEM)
  const smoothOpacity = useSpring(opacity, SPRING_ITEM)

  return (
    <motion.div style={{ x: smoothX, opacity: smoothOpacity }}>
      <AccordionItem
        value={`item-${index}`}
        className="border border-[#ccff00]/10 rounded-xl px-4 md:px-6 bg-[#0a0a0a] data-[state=open]:border-[#ccff00]/30 transition-colors duration-300"
      >
        <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-white hover:text-[#ccff00] hover:no-underline py-4 md:py-5 transition-colors">
          {faq.question}
        </AccordionTrigger>
        <AccordionContent className="text-xs sm:text-sm text-gray-400 pb-4 md:pb-5 leading-relaxed">
          {faq.answer}
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  )
})

// ── Main component ───────────────────────────────────────────────────────
export function FAQ() {
  const { isMobile, isReducedMotion } = useMobile()
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // On mobile/reduced motion — skip spring physics entirely
  const y = useTransform(scrollYProgress, [0, 0.3], [isReducedMotion ? 0 : 200, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

  const smoothY = useSpring(y, isMobile ? { stiffness: 200, damping: 40 } : SPRING_MAIN)
  const smoothOpacity = useSpring(opacity, SPRING_MAIN)
  // Header parallax
  const headerY = useTransform(scrollYProgress, [0.1, 0.3], [50, 0])
  const headerOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1])

  return (
    <section ref={sectionRef} id="faq" className="relative bg-black min-h-screen py-16 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#ccff00]/5 rounded-full blur-[150px] pointer-events-none hidden md:block" />

      {/* Outer rise animation */}
      <motion.div
        className="container mx-auto px-4 sm:px-6 relative z-10"
        style={{ y: smoothY, opacity: smoothOpacity }}
      >
        {/* Header parallax */}
        <motion.div className="text-center mb-10 md:mb-16" style={{ y: headerY, opacity: headerOpacity }}>
          <span className="text-[#ccff00] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
            Got <span className="text-gradient-brand">Questions?</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Everything you need to know about RaffleDrop
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={faq.question} faq={faq} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </Accordion>
        </div>
      </motion.div>
    </section>
  )
}
