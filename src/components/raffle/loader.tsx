import React from 'react'

const RaffleCardLoader: React.FC = () => {
  return (
    <div className="bg-[#0a0a0a] rounded-2xl h-[420px] w-full border border-[#ccff00]/10 overflow-hidden relative">
      {/* Shimmer sweep animation */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-[#ccff00]/5 to-transparent z-10" />

      {/* Top image area skeleton */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#111] via-[#ccff00]/5 to-[#0a0a0a]" />

      {/* Lime glow top-center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#ccff00]/10 rounded-full blur-2xl" />

      {/* Content skeleton */}
      <div className="p-6 space-y-3 mt-64">
        {/* Title */}
        <div className="h-5 bg-[#ccff00]/10 rounded-lg w-3/4 animate-pulse" />
        {/* Description */}
        <div className="h-3.5 bg-white/5 rounded-lg w-full animate-pulse" />
        <div className="h-3.5 bg-white/5 rounded-lg w-5/6 animate-pulse" />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="h-16 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-xl animate-pulse" />
          <div className="h-16 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-xl animate-pulse" />
          <div className="h-16 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-xl animate-pulse" />
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-[#111] rounded-full overflow-hidden border border-[#ccff00]/10">
          <div className="h-full w-1/2 bg-gradient-to-r from-[#ccff00]/40 to-[#ccff00] rounded-full" />
        </div>
      </div>
    </div>
  )
}

export const RaffleCardLoaderGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RaffleCardLoader key={i} />
      ))}
    </div>
  )
}

export default RaffleCardLoader
