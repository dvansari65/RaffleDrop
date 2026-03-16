'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface MobileContextType {
  isMobile: boolean
  isReducedMotion: boolean
}

const MobileContext = createContext<MobileContextType>({
  isMobile: false,
  isReducedMotion: false,
})

export function MobileProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    // Check mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }

    // Check reduced motion preference
    const checkMotion = () => {
      setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }

    checkMobile()
    checkMotion()

    const resizeHandler = () => checkMobile()
    window.addEventListener('resize', resizeHandler, { passive: true })

    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  return <MobileContext.Provider value={{ isMobile, isReducedMotion }}>{children}</MobileContext.Provider>
}

export const useMobile = () => useContext(MobileContext)
