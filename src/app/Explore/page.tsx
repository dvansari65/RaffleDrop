'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Ticket, Sparkles, TrendingUp, Shield } from 'lucide-react'
import Link from 'next/link'
import ExploreHeading from '@/components/Explore/exploring-heading'

type Tab = 'active' | 'finished'

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<Tab>('active')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Transparent On-Chain Raffles</span>
          </div>
          
          {/* Main Heading */}
          <ExploreHeading title1='Discover' title2='Exclusive Raffles'/>
          {/* Subtitle */}
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 ">
            Participate in verified, on-chain raffles with guaranteed payouts and transparent odds.
          </p>
        
          {/* Stats */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24</div>
              <div className="text-sm text-slate-400">Live Raffles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$1.2M</div>
              <div className="text-sm text-slate-400">Total Prizes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4.8K</div>
              <div className="text-sm text-slate-400">Participants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-6xl">
          {/* Tab Buttons */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <div className="inline-flex items-center gap-1 p-1 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-8 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'active'
                    ? 'bg-slate-800/80 text-white shadow-lg shadow-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/20'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Active Raffles
                {activeTab === 'active' && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('finished')}
                className={`px-8 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'finished'
                    ? 'bg-slate-800/80 text-white shadow-lg shadow-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/20'
                }`}
              >
                <Shield className="w-4 h-4" />
                Finished
              </button>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          {/* Content Area */}
          <div className="min-h-[500px] bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-12 flex flex-col items-center justify-center">
            {/* Empty State */}
            <div className="text-center space-y-8 max-w-md">
              {/* Icon with Glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/10 blur-xl rounded-2xl" />
                <div className="relative w-24 h-24 mx-auto bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50">
                  <Ticket className="w-12 h-12 text-emerald-400" />
                </div>
              </div>

              {/* Text */}
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold text-white">
                  No raffles found
                </h2>
                <p className="text-slate-400 text-lg">
                  {activeTab === 'active' 
                    ? 'Be the first to create an exciting raffle.' 
                    : 'No finished raffles yet.'}
                </p>
              </div>

              {/* CTA Button */}
              <Link href="/create">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-semibold px-10 py-6 text-base rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-400/30"
                >
                  Create a Raffle
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </Link>

              {/* Trust Elements */}
              <div className="pt-8 border-t border-slate-700/30">
                <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>100% On-Chain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Verified Randomness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Instant Payouts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}