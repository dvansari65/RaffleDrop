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
    entries: string;
    isSoldOut: boolean;
    progress: number | undefined;
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
    const { days, hours, minutes, isExpired } = getTimeLeftFromUnix(deadline);

    const statusMap = {
        active: { text: "Live Now", color: "text-red-400", bgColor: "bg-red-950/90", borderColor: "border-red-800/50" },
        drawing: { text: "Drawing", color: "text-amber-400", bgColor: "bg-amber-950/90", borderColor: "border-amber-800/50" },
        completed: { text: "Completed", color: "text-green-400", bgColor: "bg-green-950/90", borderColor: "border-green-800/50" },
        cancelled: { text: "Cancelled", color: "text-slate-400", bgColor: "bg-slate-950/90", borderColor: "border-slate-700/50" },
        refunded: { text: "Refunded", color: "text-slate-400", bgColor: "bg-slate-950/90", borderColor: "border-slate-700/50" },
    };
    
    const currentStatus = statusMap[status];
    const safeProgress = progress || 0;
    const numericEntries = parseInt(entries) || 0;
    const ticketsLeft = maxTickets - numericEntries;

    const handleOpenModal = () => {
        onBuyTicket({ maxTickets });
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 90) return "from-red-500 to-red-400";
        if (progress >= 70) return "from-amber-500 to-amber-400";
        if (progress >= 50) return "from-yellow-500 to-yellow-400";
        return "from-emerald-500 to-emerald-400";
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
                            <div className="text-lg font-bold text-amber-400">${sellingPrice.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 via-slate-900/70 to-transparent">
                        <div className="space-y-2">
                            {/* Progress Info */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-300 font-medium">
                                    {numericEntries} / {maxTickets} tickets sold
                                </span>
                                <span className="text-xs font-bold text-white">
                                    {safeProgress.toFixed(0)}%
                                </span>
                            </div>
                            
                            {/* Progress Bar Container */}
                            <div className="relative h-2.5 bg-slate-800/80 backdrop-blur-sm rounded-full overflow-hidden">
                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-amber-900/20 to-emerald-900/20"></div>
                                
                                {/* Progress Fill */}
                                <div 
                                    className={`h-full bg-gradient-to-r ${getProgressColor(safeProgress)} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
                                    style={{ width: `${Math.min(safeProgress, 100)}%` }}
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                                    
                                    {/* Pulsing Edge */}
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/60 animate-pulse"></div>
                                </div>
                                
                                {/* Progress Dots */}
                                <div className="absolute inset-0 flex justify-between px-1">
                                    {[0, 25, 50, 75, 100].map((mark) => (
                                        <div 
                                            key={mark}
                                            className={`w-1 h-1 rounded-full ${safeProgress >= mark ? 'bg-white/80' : 'bg-slate-600/60'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Tickets Left Indicator */}
                            <div className="text-xs text-slate-400 font-medium text-center">
                                {ticketsLeft > 0 ? (
                                    <span className="text-amber-300 font-bold">
                                        {ticketsLeft} ticket{ticketsLeft !== 1 ? 's' : ''} remaining
                                    </span>
                                ) : (
                                    <span className="text-red-300 font-bold">Fully Sold!</span>
                                )}
                            </div>
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
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                of {maxTickets} max
                            </div>
                        </div>

                        {/* Ticket Price */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-amber-800/50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide font-mono">Per Ticket</span>
                            </div>
                            <div className="text-lg font-bold text-amber-400">
                                ${ticketPrice.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                per entry
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

                    {/* Enhanced Buy Ticket Button */}
                    <Button
                        onClick={handleOpenModal}
                        disabled={isSoldOut || status !== 'active'}
                        className="w-full relative group/btn overflow-hidden rounded-xl bg-gradient-to-r from-red-900/20 via-red-800/20 to-amber-900/20 p-px border border-red-800/50 hover:border-red-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-red-800/50"
                    >
                        {/* Button Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover/btn:opacity-30 blur-xl transition-opacity duration-500" />

                        {/* Button Content */}
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl py-4 px-6">
                            {/* Pulse Effect */}
                            {status === 'active' && !isSoldOut && (
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-amber-500/5 animate-pulse rounded-xl"></div>
                            )}
                            
                            <div className="relative flex items-center justify-center gap-4">
                                <Ticket className="w-6 h-6 text-amber-400 group-hover/btn:scale-110 transition-transform duration-300" />
                                
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-bold bg-gradient-to-r from-red-400 via-red-300 to-amber-400 bg-clip-text text-transparent group-hover/btn:from-red-300 group-hover/btn:via-red-200 group-hover/btn:to-amber-300 transition-all duration-300">
                                        {isSoldOut ? "SOLD OUT" : "BUY TICKETS"}
                                    </span>
                                    
                                    {/* Price Display */}
                                    {!isSoldOut && (
                                        <span className="text-xs text-slate-400 mt-1">
                                            ${ticketPrice.toFixed(2)} per ticket
                                        </span>
                                    )}
                                </div>
                                
                                <Sparkles className="w-6 h-6 text-amber-400 group-hover/btn:rotate-180 transition-transform duration-500" />
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-xl" />
                        </div>
                        
                        {/* Status Indicator */}
                        <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse border-2 border-slate-900`} />
                    </Button>
                    
                    {/* Quick Info */}
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span>{numericEntries} sold</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                            <span>{ticketsLeft} available</span>
                        </div>
                    </div>
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