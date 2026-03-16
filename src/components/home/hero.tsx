'use client'

import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

// ── Configuration ───────────────────────────────────────────────────────────
const BRAND_COLORS = {
  lime: '#ccff00',
  yellow: '#FFFF00',
  chartreuse: '#DFFF00',
  black: '#000000',
}

// ── Letter Config ───────────────────────────────────────────────────────────
interface LetterConfig {
  char: string
  delay: number
  fromY: number
  fromX: number
  fromRotate: number
  mass: number
  stiffness: number
  damping: number
}

// ── Refined Falling Letter ─────────────────────────────────────────────────
interface FallingLetterProps {
  cfg: LetterConfig
  className?: string
  isGradient?: boolean
}

const FallingLetter = React.memo(function FallingLetter({
  cfg,
  className = '',
  isGradient = false,
}: FallingLetterProps) {
  const controls = useAnimation()
  const hasLanded = useRef(false)

  useEffect(() => {
    async function sequence() {
      await controls.start({
        y: 0,
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: {
          delay: cfg.delay,
          type: 'spring',
          stiffness: cfg.stiffness,
          damping: cfg.damping,
          mass: cfg.mass,
          opacity: { delay: cfg.delay, duration: 0.1 },
        },
      })
      hasLanded.current = true
    }
    sequence()
  }, [cfg, controls])

  return (
    <motion.span
      className={`inline-block ${isGradient ? 'text-gradient-brand' : className}`}
      animate={controls}
      initial={{
        y: cfg.fromY,
        x: cfg.fromX,
        rotate: cfg.fromRotate,
        opacity: 0,
      }}
    >
      {cfg.char === ' ' ? '\u00A0' : cfg.char}
    </motion.span>
  )
})

// ── Falling Text ────────────────────────────────────────────────────────────
interface FallingTextProps {
  text: string
  className?: string
  isGradient?: boolean
  baseDelay?: number
}

function FallingText({ text, className = '', isGradient = false, baseDelay = 0 }: FallingTextProps) {
  // useRef instead of useState — configs never need to trigger a re-render
  const configsRef = useRef<LetterConfig[]>([])

  if (configsRef.current.length === 0) {
    configsRef.current = text.split('').map((char, i) => ({
      char,
      delay: baseDelay + i * 0.03,
      fromY: -80 - Math.random() * 40,
      fromX: (Math.random() - 0.5) * 20,
      fromRotate: (Math.random() - 0.5) * 15,
      mass: 0.8 + Math.random() * 0.3,
      stiffness: 100 + Math.random() * 20,
      damping: 14 + Math.random() * 4,
    }))
  }

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {configsRef.current.map((cfg, i) => (
        <FallingLetter key={i} cfg={cfg} isGradient={isGradient} className={!isGradient ? 'text-white' : ''} />
      ))}
    </span>
  )
}

// ── Magnetic Button ─────────────────────────────────────────────────────────
function MagneticButton({
  children,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (clientX - left - width / 2) * 0.15
    const y = (clientY - top - height / 2) * 0.15
    setPosition({ x, y })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  const baseStyles =
    variant === 'primary'
      ? 'bg-[#ccff00] text-black font-semibold btn-shine hover:shadow-[0_0_30px_rgba(204,255,0,0.3)]'
      : 'border border-white/20 text-white hover:border-[#ccff00] hover:text-[#ccff00]'

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`px-8 py-4 rounded-sm transition-all duration-300 ${baseStyles} ${className}`}
    >
      {children}
    </motion.button>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center">
      {/* Static Background Grid - No Animation */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Subtle Gradient Overlay - Static */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80" />

      {/* Content Container - Asymmetric Layout */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-4xl">
          {/* Eyebrow Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="w-12 h-[1px] bg-[#ccff00]" />
            <span className="text-[#ccff00] text-xs uppercase tracking-[0.3em] font-medium">
              Decentralized Protocol
            </span>
          </motion.div>

          {/* Main Headline - Left Aligned */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-8">
            <div className="overflow-hidden">
              <FallingText text="Win Big" baseDelay={0.3} />
            </div>
            <div className="overflow-hidden">
              <FallingText text="With Web3" isGradient baseDelay={0.5} />
            </div>
            <div className="overflow-hidden">
              <FallingText text="Raffles" baseDelay={0.7} />
            </div>
          </h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
          >
            Enter raffles with micro-fees, get a chance to win premium products at a fraction of the price.
            <span className="text-white"> Provably fair, fully on-chain.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <MagneticButton variant="primary" className="group">
              <span className="flex items-center gap-2">
                Start Exploring
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </MagneticButton>

            <MagneticButton variant="secondary">View Documentation</MagneticButton>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/10 max-w-lg"
          >
            {[
              { value: '$0M', label: 'Total Volume' },
              { value: '0', label: 'Raffles' },
              { value: '0', label: 'Active Users' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side Decorative Element - Static */}
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative w-80 h-80"
        >
          {/* Static Rings */}
          <div className="absolute inset-0 border border-[#ccff00]/20 rounded-full" />
          <div className="absolute inset-8 border border-dashed border-[#ccff00]/10 rounded-full" />
          <div className="absolute inset-16 border border-[#ccff00]/5 rounded-full" />

          {/* Center Element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-[#ccff00]/10 to-transparent rounded-full blur-2xl" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-gray-600 uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#ccff00] to-transparent" />
      </motion.div>
    </section>
  )
}
