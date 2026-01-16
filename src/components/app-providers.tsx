'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { ClusterProvider } from '@/components/cluster/cluster-data-access'
import { SolanaProvider } from '@/components/solana/solana-provider'
import React from 'react'
import { SocketProvider } from '@/providers/SocketProvider'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ClusterProvider>
          <SolanaProvider>
            <SocketProvider>
            {children}
            </SocketProvider>
          </SolanaProvider>
        </ClusterProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
