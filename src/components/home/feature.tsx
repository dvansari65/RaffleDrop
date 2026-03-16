'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Zap, Globe, Lock, BarChart3, Wallet } from 'lucide-react'

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
  {
    icon: Wallet,
    title: 'Ticket Price',
    description: 'Ticket price will be decided by the creater of the raffle.',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

function TypingText({ text, isInView, delay = 0 }: { text: string; isInView: boolean; delay?: number }) {
  const letters = text.split('')

  return (
    <span className="inline-block">
      {letters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.05,
            delay: delay + index * 0.03,
            ease: 'linear',
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

export function Features() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      id="features"
      className="features-section py-16 md:py-32 relative bg-black overflow-hidden"
    >
      {/* Subtle lime glow right side */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-[#ccff00]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={headerVariants}
        >
          <motion.span
            variants={headerVariants}
            className="text-[#ccff00] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block"
          >
            Features
          </motion.span>

          <motion.h2
            variants={headerVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4"
          >
            Built for the <span className="text-gradient-brand">Future</span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2"
          >
            Cutting-edge technology meets seamless user experience
          </motion.p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div key={index} variants={cardVariants} className="group relative h-full">
                <div className="h-full p-6 md:p-8 rounded-2xl border border-[#ccff00]/10 bg-[#0a0a0a] hover:border-[#ccff00]/30 transition-colors duration-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                      className="w-12 h-12 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#ccff00]/20 transition-all duration-300 flex-shrink-0"
                    >
                      <Icon className="w-6 h-6 text-[#ccff00]" strokeWidth={1.5} />
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
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
          })}
        </motion.div>
      </div>
    </section>
  )
}
