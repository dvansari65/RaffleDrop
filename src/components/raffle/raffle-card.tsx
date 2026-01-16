import React from "react";
import { Ticket, Clock, Users, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { getTimeLeftFromUnix } from "@/helpers/formatTimestamp";
import { LinearProgressWithLabel } from "../ui/progress-bar"
import { SMALLEST_TOKEN_UNIT } from "@/constants/smallest-token-unit";
import RaffleButton from "../ui/raffle-button";


interface RaffleCardProps {
    itemName: string;
    itemDescription: string;
    itemImage: string | null;
    sellingPrice: number;
    ticketPrice: number;
    totalCollected: number;
    maxTickets: number;
    deadline: number;
    status: "active" | "drawing" | "completed" | "cancelled" | "refunded" | "ended";
    sellerKey: string;
    raffleKey: string;
    entries: number;
    isSoldOut: boolean;
    progress: number | undefined;
    raffleId: number;
    onBuyTicket: ({
        maxTickets,
        raffleId
    }: {
        maxTickets: number;
        raffleId: number
    }) => void;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({
    itemName,
    itemDescription,
    itemImage,
    sellingPrice,
    ticketPrice,
    totalCollected,
    maxTickets,
    deadline,
    onBuyTicket,
    raffleId,
    isSoldOut,
    progress,
    entries
  }) => {
    const { days, hours, minutes, isExpired } = getTimeLeftFromUnix(deadline)
  
    const handleOpenModal = () => {
      onBuyTicket({ maxTickets, raffleId })
    }
   
    const formattedTicketPrice = ticketPrice / SMALLEST_TOKEN_UNIT
    const formattedTotalCollected = totalCollected / SMALLEST_TOKEN_UNIT
  
    return (
        <div className="group relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-red-600/40 to-amber-500/40 opacity-0 group-hover:opacity-100 blur transition duration-300" />
      
        <div className="relative h-[640px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
          
          {/* IMAGE */}
          <div className="relative h-60 shrink-0">
            {itemImage ? (
              <img
                src={itemImage}
                alt={itemName}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-800">
                <Trophy className="w-16 h-16 text-slate-600" />
              </div>
            )}
      
            {/* RETAIL */}
            <div className="absolute top-4 right-4 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur border border-amber-700/40">
              <p className="text-xs text-slate-400">Retail</p>
              <p className="text-lg font-bold text-amber-400">${sellingPrice}</p>
            </div>
      
            {/* PROGRESS */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent">
              <LinearProgressWithLabel value={progress || 0} />
              <div className="h-5 mt-2 text-center text-xs font-semibold">
                {isSoldOut ? (
                  <span className="text-red-400">SOLD OUT</span>
                ) : (
                  <span className="opacity-0">SOLD OUT</span>
                )}
              </div>
            </div>
          </div>
      
          {/* CONTENT */}
          <div className="flex flex-col justify-between p-5 h-[380px]">
            
            {/* TITLE + DESC */}
            <div className="min-h-[96px]">
              <h3 className="text-xl font-semibold text-white line-clamp-1">
                {itemName}
              </h3>
              <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                {itemDescription}
              </p>
            </div>
      
            {/* STATS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  Per Ticket
                </div>
                <p className="mt-1 text-lg font-bold text-amber-400">
                  ${formattedTicketPrice}
                </p>
              </div>
      
              <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-red-400" />
                  Ends In
                </div>
                <p className="mt-1 text-lg font-bold tabular-nums text-white">
                  {isExpired
                    ? "Ended"
                    : days > 0
                    ? `${days}d ${hours}h`
                    : `${hours}h ${minutes}m`}
                </p>
              </div>
            </div>
      
            {/* TOTAL */}
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/30 px-4 py-3">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Total Collected
              </span>
              <span className="text-lg font-bold text-emerald-400">
                ${formattedTotalCollected}
              </span>
            </div>
      
            {/* CTA */}
            <RaffleButton onClick={handleOpenModal} isSoldOut={isSoldOut} />
          </div>
        </div>
      </div>
      
    )
  }