'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'
import { Package, Users, Shuffle, Trophy } from 'lucide-react'

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

// Animation variants for container
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

// Animation variants for each card - sliding from left
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
}

// Header animation variants - fixed ease type
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut', // Changed from array to string
    },
  },
}

export function HowItWorks() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} id="how-it-works" className="py-16 md:py-32 relative bg-black overflow-hidden">
      {/* Static grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Subtle lime glow top-left */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#ccff00]/5 rounded-full blur-[180px] pointer-events-none" />

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
            How It Works
          </motion.span>

          <motion.h2
            variants={headerVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4"
          >
            Simple. Transparent. <span className="text-gradient-brand">Fair.</span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2"
          >
            Four simple steps to winning premium products at unbeatable prices
          </motion.p>
        </motion.div>

        {/* Cards Grid with staggered left slide-in */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.div key={step.step} variants={cardVariants} className="relative">
                <div className="card-3d-parent">
                  <div className="card-3d">
                    {/* Glass overlay */}
                    <div className="card-3d-glass" />

                    {/* Content */}
                    <div className="card-3d-content">
                      <span className="card-3d-step">STEP {step.step}</span>
                      <h3 className="card-3d-title">{step.title}</h3>
                      <p className="card-3d-description">{step.description}</p>
                    </div>

                    {/* Bottom section with icon */}
                    <div className="card-3d-bottom">
                      <div className="card-3d-icon-circle">
                        <Icon strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Decorative circles (logo area) */}
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

                {/* Connector line between cards (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[#ccff00]/30 to-transparent" />
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
