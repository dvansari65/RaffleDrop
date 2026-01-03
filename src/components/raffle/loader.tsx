import React from "react";

const RaffleCardLoader: React.FC = () => {
  return (
    <div className="bg-slate-800/50 rounded-2xl h-[420px] w-full border border-slate-700/50 overflow-hidden relative">
      {/* Glowing top */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-900 via-red-900/20 to-slate-800/90"></div>
      {/* Content skeleton */}
      <div className="p-6 space-y-3 mt-64">
        <div className="h-6 bg-red-900/40 rounded w-3/4"></div>
        <div className="h-4 bg-red-900/30 rounded w-full"></div>
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="h-16 bg-red-900/20 rounded"></div>
          <div className="h-16 bg-amber-900/20 rounded"></div>
          <div className="h-16 bg-red-900/20 rounded"></div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-700/50">
          <div className="h-full w-1/2 bg-gradient-to-r from-red-600 to-amber-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const RaffleCardLoaderGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RaffleCardLoader key={i} />
      ))}
    </div>
  );
};

export default RaffleCardLoader;