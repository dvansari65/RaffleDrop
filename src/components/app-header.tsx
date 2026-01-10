'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Search, Trophy, Sparkles, Ticket, Coins } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { Input } from '@/components/ui/input'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full">
  {/* Background */}
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950" />
  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

  <div className="relative container mx-auto px-4 lg:px-6">
    <div className="flex items-center justify-between h-16 lg:h-20">

      {/* LOGO */}
      <Link href="/" className="flex items-center gap-3 group relative">
        <div className="absolute -inset-2 bg-primary/10 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <Trophy className="h-8 w-8 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
          RAFFLE<span className="text-red-500">X</span>
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
                    ? "bg-primary/15 border border-primary/30"
                    : "opacity-0 group-hover:opacity-100 bg-slate-800/60"
                }`}
              />

              {/* Label */}
              <span
                className={`relative z-10 text-sm font-semibold tracking-wide transition-colors ${
                  active ? "text-white" : "text-slate-300 group-hover:text-white"
                }`}
              >
                {label}
              </span>

              {/* Energy Underline */}
              <span
                className={`absolute left-1/2 -bottom-1 h-[2px] w-0 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-300 ${
                  active ? "w-8" : "group-hover:w-6"
                }`}
              />

              {/* Subtle Energy Pulse */}
              {active && (
                <span className="absolute left-1/2 -bottom-1 h-[2px] w-8 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 blur-sm opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT SIDE (unchanged) */}
      <div className="hidden lg:flex items-center gap-3">
        <WalletButton />
      </div>

      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="lg:hidden relative p-2 rounded-lg bg-slate-800/60 border border-slate-700"
      >
        {showMenu ? <X /> : <Menu />}
      </button>
    </div>
  </div>

  {/* MOBILE MENU */}
  {showMenu && (
    <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
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
                  ? "bg-primary/20 border border-primary/30 text-white"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
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