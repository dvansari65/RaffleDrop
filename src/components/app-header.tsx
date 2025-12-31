'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Search } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { Input } from '@/components/ui/input'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            className="flex items-center space-x-2 group" 
            href="/"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              RAFFL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {links.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className={`text-sm font-medium transition-colors hover:text-primary relative group ${
                  isActive(path)
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
                {isActive(path) && (
                  <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary" />
                )}
                <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search raffles and prizes..."
                className="w-64 pl-10 bg-muted/50 border-border/50 focus:border-primary transition-colors"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                ⌘K
              </kbd>
            </div>

            {/* Wallet Connect Button */}
            <WalletButton />

            {/* Theme & Cluster Selects */}
            <div className="flex items-center space-x-2">
              <ClusterUiSelect />
              <ThemeSelect />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden">
          <div className="container mx-auto px-6 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search raffles..."
                className="w-full pl-10 bg-muted/50"
              />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-2">
              {links.map(({ label, path }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setShowMenu(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="flex flex-col space-y-3 pt-4 border-t border-border/40">
              <WalletButton />
              <div className="flex items-center space-x-2">
                <ClusterUiSelect />
                <ThemeSelect />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}