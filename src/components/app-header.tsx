'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Hexagon, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WalletButton } from '@/components/solana/solana-provider'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl">
      {/* Subtle top line - lime accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ccff00]/30 to-transparent" />

      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* LOGO - Icon Only */}
          <Link href="/" className="relative group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="relative"
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute -inset-3 rounded-xl bg-[#ccff00]/0 blur-xl"
                whileHover={{ backgroundColor: 'rgba(204, 255, 0, 0.15)' }}
                transition={{ duration: 0.3 }}
              />

              {/* Icon container */}
              <div className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-[#ccff00]/20 bg-[#ccff00]/5 group-hover:border-[#ccff00]/50 transition-colors duration-300">
                <Hexagon className="w-6 h-6 text-[#ccff00] fill-[#ccff00]/10" strokeWidth={1.5} />
                <Zap className="w-3 h-3 text-[#ccff00] absolute" fill="currentColor" />
              </div>
            </motion.div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map(({ label, path }) => {
              const active = isActive(path)
              const isHovered = hoveredLink === path

              return (
                <Link
                  key={path}
                  href={path}
                  className="relative px-5 py-2"
                  onMouseEnter={() => setHoveredLink(path)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  {/* Background pill - slides in on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isHovered || active ? 1 : 0,
                      scale: isHovered || active ? 1 : 0.8,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />

                  {/* Active indicator - left bar */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#ccff00] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Label */}
                  <motion.span
                    className={`relative z-10 text-sm font-medium tracking-wide transition-colors duration-200 ${
                      active ? 'text-white' : 'text-gray-400'
                    }`}
                    animate={{
                      color: isHovered ? '#ccff00' : active ? '#ffffff' : '#9ca3af',
                    }}
                  >
                    {label}
                  </motion.span>

                  {/* Underline that expands from center */}
                  <motion.span
                    className="absolute bottom-1 left-1/2 h-[2px] bg-gradient-to-r from-[#ccff00] to-[#DFFF00] rounded-full"
                    initial={{ width: 0, x: '-50%' }}
                    animate={{
                      width: isHovered ? 20 : active ? 16 : 0,
                      x: '-50%',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                </Link>
              )
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-3">
            <WalletButton />
          </div>

          {/* MOBILE TOGGLE */}
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden relative p-2 rounded-lg border border-[#ccff00]/20 bg-[#ccff00]/5 text-[#ccff00]"
          >
            <AnimatePresence mode="wait">
              {showMenu ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden overflow-hidden bg-black/95 backdrop-blur-xl border-t border-[#ccff00]/10"
          >
            <nav className="container mx-auto px-4 py-6 space-y-1">
              {links.map(({ label, path }, index) => {
                const active = isActive(path)

                return (
                  <motion.div
                    key={path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={path}
                      onClick={() => setShowMenu(false)}
                      className={`relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-[#ccff00]/10 text-white border border-[#ccff00]/30'
                          : 'text-gray-400 hover:bg-[#ccff00]/5 hover:text-white'
                      }`}
                    >
                      <span className="font-medium tracking-wide">{label}</span>

                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-[#ccff00]"
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
