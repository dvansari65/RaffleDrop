'use client'

import React, { useRef } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { Shield, Zap, Globe, Lock, BarChart3, Wallet } from 'lucide-react'

// ── Static data ──────────────────────────────────────────────────────────
const features = [
  {
    icon: Shield,
    title: 'Provably Fair',
    description:
      'Every raffle uses Switchboard VRF for verifiable, tamper-proof randomness. Results are transparent and auditable.',
  },
  {
    icon: Zap,
    title: 'Settlement',
    description:
      'Settlement will happen when end user will recieve the product to the creater of the raffle which ensures reliability.',
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
  { icon: Wallet, title: 'Ticket Price', description: 'Ticket price will be decided by the creater of the raffle.' },
]

// ── Variants ─────────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

// ── Stable animate objects — no new refs on re-render ────────────────────
const iconHidden = { opacity: 0, scale: 0.8 as const }
const iconVisible = { opacity: 1, scale: 1 as const }
const titleHidden = { opacity: 0 }
const titleVisible = { opacity: 1 }

// ── Precomputed per-index transitions ────────────────────────────────────
const iconTransitions = features.map((_, i) => ({ delay: 0.3 + i * 0.1, duration: 0.4 }))
const titleTransitions = features.map((_, i) => ({ delay: 0.4 + i * 0.1, duration: 0.5 }))

// ── CSS typing animation — replaces 600 motion.spans ────────────────────
const TypingText = React.memo(function TypingText({
  text,
  isInView,
  delay = 0,
}: {
  text: string
  isInView: boolean
  delay?: number
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="block"
    >
      {text}
    </motion.span>
  )
})

// ── Memoized card ────────────────────────────────────────────────────────
const FeatureCard = React.memo(function FeatureCard({
  feature,
  index,
  isInView,
}: {
  feature: (typeof features)[0]
  index: number
  isInView: boolean
}) {
  const Icon = feature.icon
  return (
    <motion.div variants={cardVariants} className="group relative h-full">
      <div className="h-full p-6 md:p-8 rounded-2xl border border-[#ccff00]/10 bg-[#0a0a0a] hover:border-[#ccff00]/30 transition-colors duration-500 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <motion.div
            initial={iconHidden}
            animate={isInView ? iconVisible : iconHidden}
            transition={iconTransitions[index]}
            className="w-12 h-12 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#ccff00]/20 transition-all duration-300 flex-shrink-0"
          >
            <Icon className="w-6 h-6 text-[#ccff00]" strokeWidth={1.5} />
          </motion.div>

          <motion.h3
            initial={titleHidden}
            animate={isInView ? titleVisible : titleHidden}
            transition={titleTransitions[index]}
            className="text-lg md:text-xl font-bold text-white mb-4 flex-shrink-0"
          >
            {feature.title}
          </motion.h3>

          <div className="flex-grow">
            <p className="text-gray-400 text-sm leading-relaxed">
              <TypingText text={feature.description} isInView={isInView} delay={0.5 + index * 0.15} />
            </p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ccff00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-2xl pointer-events-none" />
      </div>
    </motion.div>
  )
})

// ── Main component ───────────────────────────────────────────────────────
export function Features() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} id="features" className="py-16 md:py-32 relative bg-black overflow-hidden">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-[#ccff00]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header — variants cascade, no need to repeat on children */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={headerVariants}
        >
          <span className="text-[#ccff00] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
            Built for the <span className="text-gradient-brand">Future</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Cutting-edge technology meets seamless user experience
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
