'use client'

import React, { useState, useCallback, useMemo, memo } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

// ── Chars defined at module level — never recreated ──────────────────────
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'

function useTextScramble(text: string) {
  const [displayText, setDisplayText] = useState(text)

  const scramble = useCallback(() => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((letter, index) => {
            if (letter === ' ') return ' '
            if (index < iteration) return text[index]
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join(''),
      )
      if (iteration >= text.length) clearInterval(interval)
      iteration += 0.5
    }, 30)
    return () => clearInterval(interval)
  }, [text])

  const reset = useCallback(() => setDisplayText(text), [text])
  return { displayText, scramble, reset }
}

// memo — ScrambleText only re-renders when text prop changes
const ScrambleText = memo(function ScrambleText({ text, className }: { text: string; className?: string }) {
  const { displayText, scramble, reset } = useTextScramble(text)
  return (
    <span className={`inline-block cursor-pointer ${className ?? ''}`} onMouseEnter={scramble} onMouseLeave={reset}>
      {displayText}
    </span>
  )
})

// memo — pure display component, no state, never needs to re-render
const StatItem = memo(function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1a1a1a] border border-[#ccff00]/20 flex items-center justify-center">
        <span className="text-[10px] md:text-xs font-bold text-[#ccff00]">{value}</span>
      </div>
      <span className="text-xs md:text-sm text-gray-400">{label}</span>
    </div>
  )
})

// ── Static data — defined once at module level ───────────────────────────
const STATS = [
  { label: 'Built on Solana', value: 'SOL' },
  { label: 'Switchboard VRF', value: 'VRF' },
  { label: 'Audited', value: '🔒' },
]

export function CTA() {
  return (
    <section id="cta" className="relative min-h-screen py-24 md:py-32 overflow-hidden bg-black">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full blur-[200px] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 70%)' }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex items-center min-h-screen">
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Badge — no state, fully static */}
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

          {/* Description — static, no component needed */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-10 md:mb-12 px-2 leading-relaxed">
            Join thousands of winners on the most transparent raffle platform. Your next big win is just one entry away.
          </p>

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

          {/* Stats — rendered from static array, each memoized */}
          <div className="flex items-center justify-center gap-6 md:gap-12 opacity-70 flex-wrap">
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <StatItem label={stat.label} value={stat.value} />
                {i < STATS.length - 1 && <div className="w-px h-6 bg-[#333] hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
