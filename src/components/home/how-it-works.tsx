'use client'

import React, { useRef } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { Package, Users, Shuffle, Trophy } from 'lucide-react'
import { useMobile } from '@/provider/mobile-provider'

// ── Static data ──────────────────────────────────────────────────────────
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

// ── Full animation variants — desktop ────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, x: -100, rotateY: -15 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

// ── Reduced/mobile variants — simple fade only ───────────────────────────
const containerVariantsSimple: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const cardVariantsSimple: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

const headerVariantsSimple: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// ── Memoized card ────────────────────────────────────────────────────────
const StepCard = React.memo(function StepCard({ step, isLast }: { step: (typeof steps)[0]; isLast: boolean }) {
  const Icon = step.icon
  return (
    <motion.div variants={cardVariants} className="relative">
      <div className="card-3d-parent">
        <div className="card-3d">
          <div className="card-3d-glass" />
          <div className="card-3d-content">
            <span className="card-3d-step">STEP {step.step}</span>
            <h3 className="card-3d-title">{step.title}</h3>
            <p className="card-3d-description">{step.description}</p>
          </div>
          <div className="card-3d-bottom">
            <div className="card-3d-icon-circle">
              <Icon strokeWidth={1.5} />
            </div>
          </div>
          <div className="card-3d-logo">
            <div className="circle circle1" />
            <div className="circle circle2" />
            <div className="circle circle3" />
            <div className="circle circle4" />
            <div className="circle circle5">
              <span>{step.step}</span>
            </div>
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[#ccff00]/30 to-transparent" />
      )}
    </motion.div>
  )
})

// Simple card — no 3D, no spring, just fade
const StepCardSimple = React.memo(function StepCardSimple({
  step,
  isLast,
}: {
  step: (typeof steps)[0]
  isLast: boolean
}) {
  const Icon = step.icon
  return (
    <motion.div variants={cardVariantsSimple} className="relative">
      <div className="card-3d-parent">
        <div className="card-3d">
          <div className="card-3d-glass" />
          <div className="card-3d-content">
            <span className="card-3d-step">STEP {step.step}</span>
            <h3 className="card-3d-title">{step.title}</h3>
            <p className="card-3d-description">{step.description}</p>
          </div>
          <div className="card-3d-bottom">
            <div className="card-3d-icon-circle">
              <Icon strokeWidth={1.5} />
            </div>
          </div>
          <div className="card-3d-logo">
            <div className="circle circle1" />
            <div className="circle circle2" />
            <div className="circle circle3" />
            <div className="circle circle4" />
            <div className="circle circle5">
              <span>{step.step}</span>
            </div>
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[#ccff00]/30 to-transparent" />
      )}
    </motion.div>
  )
})

// ── Main component ───────────────────────────────────────────────────────
export function HowItWorks() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const { isMobile, isReducedMotion } = useMobile()

  // Pick variant set based on device/preference
  const useSimple = isMobile || isReducedMotion

  return (
    <section ref={sectionRef} id="how-it-works" className="py-16 md:py-32 relative bg-black overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#ccff00]/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={useSimple ? headerVariantsSimple : headerVariants}
        >
          <span className="text-[#ccff00] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
            Simple. Transparent. <span className="text-gradient-brand">Fair.</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Four simple steps to winning premium products at unbeatable prices
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={useSimple ? containerVariantsSimple : containerVariants}
        >
          {steps.map((step, index) =>
            useSimple ? (
              <StepCardSimple key={step.step} step={step} isLast={index === steps.length - 1} />
            ) : (
              <StepCard key={step.step} step={step} isLast={index === steps.length - 1} />
            ),
          )}
        </motion.div>
      </div>
    </section>
  )
}
