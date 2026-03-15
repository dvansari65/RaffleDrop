'use client'

import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

// ── Holi color palette ─────────────────────────────────────────────────────
const HOLI_COLORS = [
  '#fd78f2', // brand pink
  '#9713fe', // brand violet
  '#ff6b35', // saffron orange
  '#ffd700', // turmeric yellow
  '#00e5ff', // electric cyan
  '#ff1493', // deep pink
  '#39ff14', // neon green
  '#ff4500', // vermillion red
  '#bf00ff', // electric purple
  '#ff69b4', // hot pink
]

function randomHoli() {
  return HOLI_COLORS[Math.floor(Math.random() * HOLI_COLORS.length)]
}

// ── Splash particle ────────────────────────────────────────────────────────
// A tiny colored dot that bursts outward from the letter when it lands
interface SplashProps {
  color: string
  angle: number // direction of burst in degrees
  distance: number // how far it travels
}

interface PowderCloudProps {
  id: number
  onDone: (id: number) => void
}

function PowderCloud({ id, onDone }: PowderCloudProps) {
  const color = randomHoli()

  // Random position across the full viewport
  const x = `${Math.random() * 100}vw`
  const y = `${Math.random() * 100}vh`

  // Random final drift direction — powder floats a little after burst
  const driftX = (Math.random() - 0.5) * 120
  const driftY = (Math.random() - 0.5) * 80 - 30 // slight upward bias

  // Random size: small tight puff to large wide cloud
  const size = 120 + Math.random() * 280 // 120px – 400px

  // Random blur: tighter burst vs soft cloud
  const blur = 40 + Math.random() * 80

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}55 0%, ${color}22 45%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.6, 1.2], // burst out then settle slightly
        opacity: [0, 0.85, 0.6, 0], // flash in, hold, fade out
        x: [0, driftX * 0.4, driftX], // drift outward
        y: [0, driftY * 0.4, driftY],
      }}
      transition={{
        duration: 3.5 + Math.random() * 2.5, // 3.5s – 6s lifetime
        ease: ['easeOut', 'easeOut', 'easeIn'],
        times: [0, 0.25, 0.6, 1],
        opacity: { times: [0, 0.15, 0.55, 1] },
      }}
      onAnimationComplete={() => onDone(id)}
    />
  )
}
// ── Powder cloud manager — continuously spawns new clouds ──────────────────
function HoliBackground() {
  const [clouds, setClouds] = useState<number[]>([])
  const counterRef = useRef(0)

  // Spawn a new cloud every 300–700ms
  useEffect(() => {
    function spawnCloud() {
      setClouds((prev) => [...prev, counterRef.current++])

      // Schedule next spawn at random interval
      const nextIn = 300 + Math.random() * 400
      timeoutRef.current = setTimeout(spawnCloud, nextIn)
    }

    const timeoutRef = { current: setTimeout(spawnCloud, 100) }

    return () => clearTimeout(timeoutRef.current)
  }, [])

  // Remove cloud from state once its animation completes
  const handleDone = (id: number) => {
    setClouds((prev) => prev.filter((c) => c !== id))
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <AnimatePresence>
        {clouds.map((id) => (
          <PowderCloud key={id} id={id} onDone={handleDone} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function SplashParticle({ color, angle, distance }: SplashProps) {
  const rad = (angle * Math.PI) / 180
  const tx = Math.cos(rad) * distance
  const ty = Math.sin(rad) * distance

  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{
        width: `${Math.random() * 5 + 3}px`,
        height: `${Math.random() * 5 + 3}px`,
        backgroundColor: color,
        top: '50%',
        left: '50%',
        translateX: '-50%',
        translateY: '-50%',
        zIndex: 50,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: tx,
        y: ty,
        opacity: 0,
        scale: 0.2,
      }}
      transition={{
        duration: 0.55 + Math.random() * 0.3,
        ease: [0.2, 0.8, 0.4, 1],
      }}
    />
  )
}

// ── Splash burst: fires N particles in all directions ──────────────────────
interface SplashBurstProps {
  active: boolean
  color: string
}

function SplashBurst({ active, color }: SplashBurstProps) {
  if (!active) return null

  // 8 particles spread around 360°
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: i * 45 + Math.random() * 20 - 10, // spread evenly + slight jitter
    distance: 18 + Math.random() * 22,
    color: Math.random() > 0.4 ? color : randomHoli(), // mix of same + random color
  }))

  return (
    <AnimatePresence>
      {particles.map((p, i) => (
        <SplashParticle key={i} {...p} />
      ))}
    </AnimatePresence>
  )
}

// ── LetterConfig ───────────────────────────────────────────────────────────
interface LetterConfig {
  char: string
  delay: number
  fromY: number
  fromX: number
  fromRotate: number
  mass: number
  stiffness: number
  damping: number
  holiColor: string // each letter gets its own holi color
}

// ── FallingLetter ──────────────────────────────────────────────────────────
interface FallingLetterProps {
  cfg: LetterConfig
  baseClassName?: string // e.g. "text-foreground" or "text-gradient"
  isGradient?: boolean
}

function FallingLetter({ cfg, baseClassName = '', isGradient = false }: FallingLetterProps) {
  const controls = useAnimation()
  const [splashActive, setSplashActive] = useState(false)
  const [glowing, setGlowing] = useState(false)
  const hasLanded = useRef(false)

  useEffect(() => {
    async function sequence() {
      // 1. Fall with spring physics
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
          opacity: { delay: cfg.delay, duration: 0.15, ease: 'easeIn' },
        },
      })

      if (hasLanded.current) return
      hasLanded.current = true

      // 2. Letter lands → trigger splash + color glow simultaneously
      setSplashActive(true)
      setGlowing(true)

      // 3. Flash the letter color then fade back
      await controls.start({
        color: isGradient ? cfg.holiColor : cfg.holiColor,
        textShadow: `0 0 18px ${cfg.holiColor}, 0 0 40px ${cfg.holiColor}80`,
        scale: 1.25,
        transition: { duration: 0.18, ease: 'easeOut' },
      })

      await controls.start({
        color: '', // revert to CSS class color
        textShadow: 'none',
        scale: 1,
        transition: { duration: 0.55, ease: 'easeInOut' },
      })

      setGlowing(false)

      // 4. Remove splash particles after they've flown out
      setTimeout(() => setSplashActive(false), 900)
    }

    sequence()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="relative inline-block">
      {/* Splash particles burst from this letter */}
      <SplashBurst active={splashActive} color={cfg.holiColor} />

      <motion.span
        className={`inline-block ${isGradient ? '' : baseClassName}`}
        style={
          isGradient
            ? {
                // For gradient letters we control color via animation, fallback via gradient
                backgroundImage: glowing ? 'none' : 'linear-gradient(120deg, #fd78f2 0%, #bf00ff 50%, #9713fe 100%)',
                WebkitBackgroundClip: glowing ? 'unset' : 'text',
                backgroundClip: glowing ? 'unset' : 'text',
                WebkitTextFillColor: glowing ? cfg.holiColor : 'transparent',
              }
            : {}
        }
        animate={controls}
        initial={{
          y: cfg.fromY,
          x: cfg.fromX,
          rotate: cfg.fromRotate,
          opacity: 0,
        }}
      >
        {cfg.char}
      </motion.span>
    </span>
  )
}

// ── FallingText ────────────────────────────────────────────────────────────
interface FallingTextProps {
  text: string
  baseClassName?: string
  isGradient?: boolean
}

function FallingText({ text, baseClassName = '', isGradient = false }: FallingTextProps) {
  const [configs, setConfigs] = useState<LetterConfig[]>([])

  useEffect(() => {
    setConfigs(
      text.split('').map((char) => ({
        char,
        delay: Math.random() * 1.4,
        fromY: -(Math.random() * 500 + 200),
        fromX: (Math.random() - 0.5) * 160,
        fromRotate: (Math.random() - 0.5) * 60,
        mass: 0.6 + Math.random() * 0.5,
        stiffness: 70 + Math.random() * 40,
        damping: 12 + Math.random() * 6,
        holiColor: randomHoli(),
      })),
    )
  }, [text])

  if (configs.length === 0) {
    return <span style={{ opacity: 0 }}>{text}</span>
  }

  return (
    <span className="inline-flex flex-wrap justify-center">
      {configs.map((cfg, i) =>
        cfg.char === ' ' ? (
          <span key={i} style={{ width: '0.28em' }} />
        ) : (
          <FallingLetter key={i} cfg={cfg} baseClassName={baseClassName} isGradient={isGradient} />
        ),
      )}
    </span>
  )
}

// ── Hero ────────────────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <HoliBackground />
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
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-4 md:mb-6 leading-tight flex flex-col items-center gap-1">
            <span className="block overflow-visible">
              <FallingText text="Win Big with" baseClassName="text-foreground" />
            </span>
            <span className="block overflow-visible">
              <FallingText text="Decentralized" isGradient />
            </span>
            <span className="block overflow-visible">
              <FallingText text="Raffles" baseClassName="text-foreground" />
            </span>
          </h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Enter raffles with micro-fees, get a chance to win premium products at a fraction of the price. Provably
            fair, fully on-chain, powered by verifiable randomness.
          </motion.p>

          <motion.div
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-xs sm:max-w-xl mx-auto mt-10 md:mt-16"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
