'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

// Letter scramble hook
function useTextScramble(text: string) {
  const [displayText, setDisplayText] = useState(text)
  const chars = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*', [])

  const scramble = useCallback(() => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((letter, index) => {
            if (letter === ' ') return ' '
            if (index < iteration) return text[index]
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join(''),
      )
      if (iteration >= text.length) clearInterval(interval)
      iteration += 1 / 2
    }, 30)
    return () => clearInterval(interval)
  }, [text, chars])

  const reset = useCallback(() => setDisplayText(text), [text])

  return { displayText, scramble, reset }
}

const ScrambleText = ({ text, className }: { text: string; className?: string }) => {
  const { displayText, scramble, reset } = useTextScramble(text)
  return (
    <span className={`inline-block cursor-pointer ${className}`} onMouseEnter={scramble} onMouseLeave={reset}>
      {displayText}
    </span>
  )
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2 md:gap-3">
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1a1a1a] border border-[#ccff00]/20 flex items-center justify-center">
      <span className="text-[10px] md:text-xs font-bold text-[#ccff00]">{value}</span>
    </div>
    <span className="text-xs md:text-sm text-gray-400">{label}</span>
  </div>
)

export function CTA() {
  return (
    <section id="cta" className="relative min-h-screen py-24 md:py-32 overflow-hidden bg-black">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Centered glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full blur-[200px] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 70%)' }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex items-center min-h-screen">
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0a] border border-[#ccff00]/20 mb-8 md:mb-10">
            <Sparkles className="w-4 h-4 text-[#ccff00]" />
            <span className="text-xs md:text-sm text-gray-400">Join 8,500+ winners</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight">
            <ScrambleText text="Ready to" className="mr-3" />
            <span className="text-gradient-brand">
              <ScrambleText text="Win Big?" />
            </span>
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-10 md:mb-12 px-2 leading-relaxed">
            Join thousands of winners on the most transparent raffle platform. Your next big win is just one entry away.
          </p>

          {/* Buttons */}
          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap mb-16 md:mb-20">
            <Link
              href="/Explore"
              className="btn-shine inline-flex items-center gap-2 text-sm md:text-base px-6 md:px-8 py-3 md:py-4 bg-[#ccff00] text-black font-semibold hover:bg-[#dfff00] transition-colors duration-300 rounded-lg group"
            >
              <ScrambleText text="Start Winning" />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link
              href="/Explore"
              className="inline-flex items-center text-sm md:text-base px-6 md:px-8 py-3 md:py-4 border border-[#ccff00]/30 text-white hover:border-[#ccff00]/60 hover:bg-[#ccff00]/10 transition-all duration-300 rounded-lg"
            >
              <ScrambleText text="Browse Raffles" />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-12 opacity-70 flex-wrap">
            <StatItem label="Built on Solana" value="SOL" />
            <div className="w-px h-6 bg-[#333] hidden sm:block" />
            <StatItem label="Switchboard VRF" value="VRF" />
            <div className="w-px h-6 bg-[#333] hidden sm:block" />
            <StatItem label="Audited" value="🔒" />
          </div>
        </div>
      </div>
    </section>
  )
}
