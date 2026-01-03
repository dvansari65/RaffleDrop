import React from "react";
import { Ticket, Clock, Users, Zap, Trophy, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { buyTicketProps } from "@/types/raffle";
import { toast } from "sonner";


interface RaffleCardProps {
    itemName: string;
    itemDescription: string;
    itemImageUri?: string;
    sellingPrice: number;
    ticketPrice: number;
    totalCollected: number;
    maxTickets: number;
    deadline: Date;
    status: "active" | "drawing" | "completed" | "cancelled" | "refunded";
    handleOpenModal:()=>void
}

const RaffleCard: React.FC<RaffleCardProps> = ({
    itemName,
    itemDescription,
    itemImageUri,
    sellingPrice,
    ticketPrice,
    totalCollected,
    maxTickets,
    deadline,
    status,
    handleOpenModal
}) => {
    // Compute time left
   
    const timeLeftMs = deadline.getTime() - Date.now();
    const daysLeft = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60 * 24)));
    const hoursLeft = Math.max(0, Math.floor((timeLeftMs / (1000 * 60 * 60)) % 24));

    // Compute progress %
    const progress = Math.min(100, (totalCollected / maxTickets) * 100);
    const statusMap = {
        active: { text: "Live Now", color: "text-red-400" },
        drawing: { text: "Drawing", color: "text-amber-400" },
        completed: { text: "Completed", color: "text-green-400" },
        cancelled: { text: "Cancelled", color: "text-slate-400" },
        refunded: { text: "Refunded", color: "text-slate-400" },
    };
    const currentStatus = statusMap[status];
   
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
                    {itemImageUri ? (
                        <img src={itemImageUri} alt={itemName} className="w-full h-full object-cover" />
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
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/90 backdrop-blur-sm rounded-full border border-red-800/50">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${currentStatus.color}`}>
                                {currentStatus.text}
                            </span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 bg-slate-950/90 backdrop-blur-sm rounded-lg border border-amber-800/50">
                            <div className="text-xs text-slate-400 font-mono">Retail</div>
                            <div className="text-lg font-bold text-amber-400">{sellingPrice} SOL</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Title & Description */}
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">{itemName}</h3>
                        <p className="text-sm text-slate-400 font-mono">{itemDescription}</p>
                    </div>

                    {/* Divider */}
                    <div className="relative h-px">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse opacity-50"></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Entries */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-red-800/50 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-slate-400 uppercase tracking-wide font-mono">Entries</span>
                            </div>
                            <div className="text-xl font-bold text-white">{totalCollected}/{maxTickets}</div>
                        </div>

                        {/* Ticket Price */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-amber-800/50 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Ticket className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-slate-400 uppercase tracking-wide font-mono">Price</span>
                            </div>
                            <div className="text-xl font-bold text-amber-400">{ticketPrice} SOL</div>
                        </div>

                        {/* Time Left */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-red-800/50 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-slate-400 uppercase tracking-wide font-mono">Ends</span>
                            </div>
                            <div className="text-xl font-bold text-white">{daysLeft}d {hoursLeft}h</div>
                        </div>
                    </div>

                    {/* Buy Ticket Button */}
                    <button className="w-full relative group/btn overflow-hidden rounded-lg bg-gradient-to-r from-red-900/20 via-red-800/20 to-amber-900/20 p-px border border-red-800/50 hover:border-red-600/50 transition-all duration-300">
                        {/* Button Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover/btn:opacity-20 blur transition duration-500"></div>

                        {/* Button Content */}
                        <div className="relative bg-slate-900 rounded-lg py-3 px-6">
                            <div className="flex items-center justify-center gap-3">
                                <Ticket className="w-5 h-5 text-amber-400 animate-pulse" />
                                <span onClick={handleOpenModal} className="text-lg font-bold bg-gradient-to-r from-red-400 via-red-300 to-amber-400 bg-clip-text text-transparent group-hover/btn:from-red-300 group-hover/btn:via-red-200 group-hover/btn:to-amber-300 transition-all duration-300">
                                    BUY TICKET
                                </span>
                                <Ticket className="w-5 h-5 text-amber-400 animate-pulse" />
                            </div>

                            {/* Button Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RaffleCard;
