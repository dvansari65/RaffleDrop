import { X } from 'lucide-react';
import React from 'react';

interface CounterInitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  isPending?: boolean;
}

export const CounterInitModal: React.FC<CounterInitModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  isPending = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Glowing border effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 via-amber-600/30 to-red-600/30 rounded-2xl blur-xl" />
        
        <div className="relative bg-slate-900 border border-red-900/50 rounded-2xl p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-950/50 backdrop-blur-sm rounded-full border border-red-800/50 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                Setup Required
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Initialize Counter
            </h2>
            <p className="text-slate-400 font-mono text-sm">
              Before creating your first raffle, we need to initialize the counter account on-chain. This is a one-time setup.
            </p>
          </div>

          {/* Info box */}
          <div className="mb-6 p-4 bg-red-950/30 border border-red-800/30 rounded-xl backdrop-blur-sm">
            <p className="text-sm text-red-300/80 font-mono">
              This transaction will create a counter account to track your raffles. You'll only need to do this once.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 disabled:bg-slate-800/30 border border-slate-700/50 text-white disabled:text-slate-500 rounded-xl transition-all font-mono uppercase tracking-wide text-sm disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={onProceed}
              disabled={isPending}
              className="flex-1 relative group bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-700 disabled:to-slate-600 text-white disabled:text-slate-400 font-bold px-4 py-3 rounded-xl shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-800/60 transition-all uppercase tracking-wide text-sm disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Proceed'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};