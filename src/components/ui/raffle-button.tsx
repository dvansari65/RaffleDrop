import React from "react"
import { Sparkles, Ticket } from "lucide-react"
import { Button } from "./button"

type RaffleButtonProps = {
  onClick: () => void
  isSoldOut?: boolean
  label?: string
  soldOutLabel?: string
  className?: string
}

function RaffleButton({
  onClick,
  isSoldOut = false,
  label = "BUY TICKETS",
  soldOutLabel = "🔒 SOLD OUT",
  className = "",
}: RaffleButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isSoldOut}
      className={`
        relative w-full rounded-xl px-6 py-4
        flex items-center justify-center gap-3
        font-semibold text-lg
        transition-all duration-200
        ${isSoldOut
          ? "cursor-not-allowed opacity-60 bg-slate-900 border border-slate-700 text-slate-500"
          : `
            cursor-pointer
            bg-gradient-to-r from-red-900/40 via-red-800/40 to-amber-900/40
            border border-red-700/60
            hover:border-red-500/80
            hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]
            active:scale-[0.98]
          `
        }
        ${className}
      `}
    >
      {!isSoldOut ? (
        <>
          <Ticket className="w-5 h-5 text-amber-400" />

          <span className="bg-gradient-to-r from-red-400 via-red-300 to-amber-400 bg-clip-text text-transparent">
            {label}
          </span>

          <Sparkles className="w-5 h-5 text-amber-400" />
        </>
      ) : (
        <span className="tracking-wide">{soldOutLabel}</span>
      )}
    </Button>
  )
}

export default RaffleButton
