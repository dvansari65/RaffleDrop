'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Trophy, Sparkles } from 'lucide-react'
import { WalletButton } from '@/components/solana/solana-provider'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="absolute -inset-2 bg-primary/15 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trophy className="h-8 w-8 text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.7)]" />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">
              RAFFLE<span className="text-primary">DROP</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-2">
            {links.map(({ label, path }) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  href={path}
                  className="relative px-5 py-2 group"
                >
                  {/* Hover / Active Glow */}
                  <div
                    className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                      active
                        ? "bg-primary/15 border border-primary/40 shadow-[0_0_24px_rgba(248,113,113,0.25)]"
                        : "opacity-0 group-hover:opacity-100 bg-muted/70 border border-border/40"
                    }`}
                  />

                  {/* Label */}
                  <span
                    className={`relative z-10 text-sm font-semibold tracking-wide transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {label}
                  </span>

                  {/* Energy Underline */}
                  <span
                    className={`absolute left-1/2 -bottom-1 h-[2px] w-0 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-300 ${
                      active ? "w-8" : "group-hover:w-6"
                    }`}
                  />

                  {/* Subtle Energy Pulse */}
                  {active && (
                    <span className="absolute left-1/2 -bottom-1 h-[2px] w-8 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-200 blur-sm opacity-70" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-3">
            <WalletButton />
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="lg:hidden relative p-2 rounded-lg bg-muted/70 border border-border/60"
          >
            {showMenu ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {showMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/70">
          <nav className="container mx-auto px-4 py-6 space-y-2">
            {links.map(({ label, path }) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setShowMenu(false)}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    active
                      ? "bg-primary/20 border border-primary/40 text-foreground"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <span className="font-semibold tracking-wide">{label}</span>

                  {active && (
                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>

  )
}