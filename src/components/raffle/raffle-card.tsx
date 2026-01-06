import React from "react";
import { Ticket, Clock, Users, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { getTimeLeftFromUnix } from "@/helpers/formatTimestamp";


interface RaffleCardProps {
    itemName: string;
    itemDescription: string;
    itemImage: string | null;
    sellingPrice: number;
    ticketPrice: number;
    totalCollected: number;
    maxTickets: number;
    deadline: number;
    status: "active" | "drawing" | "completed" | "cancelled" | "refunded";
    sellerKey: string;
    raffleKey: string;
    entries:string;
    isSoldOut:boolean,
    progress:number | undefined
    onBuyTicket: ({
        maxTickets,
    }: {
        maxTickets: number;
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
    status,
    onBuyTicket,
    isSoldOut,
    progress,
    entries
}) => {
    // Compute time left
    const { days, hours, minutes, isExpired } = getTimeLeftFromUnix(deadline);

    const statusMap = {
        active: { text: "Live Now", color: "text-red-400", bgColor: "bg-red-950/90", borderColor: "border-red-800/50" },
        drawing: { text: "Drawing", color: "text-amber-400", bgColor: "bg-amber-950/90", borderColor: "border-amber-800/50" },
        completed: { text: "Completed", color: "text-green-400", bgColor: "bg-green-950/90", borderColor: "border-green-800/50" },
        cancelled: { text: "Cancelled", color: "text-slate-400", bgColor: "bg-slate-950/90", borderColor: "border-slate-700/50" },
        refunded: { text: "Refunded", color: "text-slate-400", bgColor: "bg-slate-950/90", borderColor: "border-slate-700/50" },
    };
    const currentStatus = statusMap[status];

    const handleOpenModal = () => {
        onBuyTicket({ maxTickets });
    };
   
    return (
        <div className="group relative">
            {/* Glowing Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500"></div>

            {/* Main Card */}
            <div className="relative bg-slate-900 rounded-2xl border border-red-900/50 overflow-hidden">
                {/* Flickering Light */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>

                {/* Image */}
                <div className="relative h-64 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
                    {itemImage ? (
                        <img
                            src={itemImage}
                            alt={itemName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
                            <div className="text-center space-y-4">
                                <Trophy className="w-20 h-20 text-red-500 mx-auto opacity-50" />
                                <p className="text-slate-500 font-mono text-sm">Product Image</p>
                            </div>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 ${currentStatus.bgColor} backdrop-blur-sm rounded-full border ${currentStatus.borderColor}`}>
                            <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-red-500 animate-pulse' : status === 'drawing' ? 'bg-amber-500 animate-pulse' : status === 'completed' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${currentStatus.color}`}>
                                {currentStatus.text}
                            </span>
                        </div>
                    </div>

                    {/* Retail Value */}
                    <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 bg-slate-950/90 backdrop-blur-sm rounded-lg border border-amber-800/50">
                            <div className="text-xs text-slate-400 font-mono">Retail Value</div>
                            <div className="text-lg font-bold text-amber-400">${Number(sellingPrice.toFixed(2))}</div>
                        </div>
                    </div>

                    {/* Progress Bar Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/80 backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-500 relative overflow-hidden"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Title & Description */}
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                            {itemName}
                        </h3>
                        <p className="text-sm text-slate-400 font-mono line-clamp-2 min-h-[2.5rem]">
                            {itemDescription}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative h-px">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse opacity-50"></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Entries */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-red-800/50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Users className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide font-mono">Entries</span>
                            </div>
                            <div className="text-lg font-bold text-white">
                                {entries}
                                <span className="text-xs text-slate-500 font-normal">{entries}/{maxTickets}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {progress?.toFixed(0)}% filled
                            </div>
                        </div>

                        {/* Ticket Price */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-amber-800/50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide font-mono">Per Ticket</span>
                            </div>
                            <div className="text-lg font-bold text-amber-400">
                                ${Number((ticketPrice.toFixed(2)))}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                SOL/USDC
                            </div>
                        </div>

                        {/* Time Left */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-red-800/50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide font-mono">Ends In</span>
                            </div>
                            <div className="text-lg font-bold text-white">
                                {days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {isExpired ? "Ended" : "remaining"}
                            </div>
                        </div>
                    </div>

                    {/* Total Collected */}
                    <div className="bg-gradient-to-r from-slate-800/30 via-slate-800/50 to-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs text-slate-400 uppercase tracking-wide font-mono">Total Collected</span>
                            </div>
                            <div className="text-lg font-bold text-emerald-400">
                                ${totalCollected.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Buy Ticket Button */}
                    <Button
                        onClick={handleOpenModal}
                        disabled={isSoldOut}
                        className="w-full relative group/btn overflow-hidden rounded-lg bg-gradient-to-r from-red-900/20 via-red-800/20 to-amber-900/20 p-px border border-red-800/50 hover:border-red-600/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-red-800/50"
                    >
                        {/* Button Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover/btn:opacity-20 blur transition duration-500" />

                        {/* Button Content */}
                        <div className="relative bg-slate-900 rounded-lg py-3 px-6">
                            <div className="flex items-center justify-center gap-3">
                                <Ticket className="w-5 h-5 text-amber-400 group-hover/btn:animate-pulse" />

                                <span className="text-lg font-bold bg-gradient-to-r from-red-400 via-red-300 to-amber-400 bg-clip-text text-transparent group-hover/btn:from-red-300 group-hover/btn:via-red-200 group-hover/btn:to-amber-300 transition-all duration-300">
                                    {isSoldOut ? "SOLD OUT" :"BUY"}
                                </span>

                                <Sparkles className="w-5 h-5 text-amber-400 group-hover/btn:animate-pulse" />
                            </div>

                            {/* Button Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        </div>
                    </Button>

                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

