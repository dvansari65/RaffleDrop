'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import React from 'react'
import { SocketProvider } from '@/providers/SocketProvider'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
    
          <SolanaProvider>
            <SocketProvider>
            {children}
            </SocketProvider>
          </SolanaProvider>
     
    </ReactQueryProvider>
  )
}
