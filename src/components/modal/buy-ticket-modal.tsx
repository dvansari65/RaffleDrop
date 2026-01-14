import { SMALLEST_TOKEN_UNIT } from "@/constants/smallest-token-unit";
import { ChangeEvent, useState } from "react";

interface BuyTicketModalProps {
    maxTickets: number | null,
    ticketCount: number | null,
    onTicketCountChange: (count: number | null) => void,
    ticketPrice: number | null,
    onClose: () => void,
    onBuyTickets: (ticketCount: number | null) => void,
    isLoading: boolean,
    isOpen: boolean,
    buyTicketError: string
}

function BuyTicketModal({ maxTickets, ticketCount, ticketPrice, onTicketCountChange, onClose, onBuyTickets, isLoading, isOpen, buyTicketError }: BuyTicketModalProps) {

    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleTicketChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!value) {
            onTicketCountChange(null);  // CHANGED
            setError("");
            return;
        }
        if (!maxTickets) {
            setError("Provide how much ticket you have to buy!")
        }
        const num = Number(value);
        if (num < 1) {
            setError("You must buy at least 1 ticket");
        } else if (maxTickets && num > maxTickets) {
            setError(`You can buy a maximum of ${maxTickets} tickets`);
        } else {
            setError("");
        }
        onTicketCountChange(num);  // CHANGED
    };

    const handleBuy = async () => {
        onBuyTickets(ticketCount)
    };

    if (!ticketPrice) return

    const totalCost = ticketCount ? (Number(ticketCount) * (ticketPrice) / SMALLEST_TOKEN_UNIT).toFixed(2) : "0.00";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Glowing Border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 opacity-20 blur-xl"></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-md">
                {/* Outer Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-2xl opacity-30 blur transition duration-500"></div>

                {/* Modal Content */}
                <div className="relative bg-slate-900 rounded-2xl border border-red-900/50 overflow-hidden">
                    {/* Flickering Light */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-red-950/90 backdrop-blur-sm rounded-full border border-red-800/50 hover:border-red-600/50 transition-colors"
                    >
                        <span className="text-red-400 font-bold text-lg">×</span>
                    </button>

                    {/* Modal Header */}
                    <div className="p-6 border-b border-red-900/30">
                        <h3 className="text-2xl font-bold text-white">Buy Tickets</h3>
                        <p className="text-sm text-slate-400 font-mono mt-2">
                            Enter number of tickets to purchase
                        </p>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-6">
                        {/* Ticket Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-mono text-slate-400 uppercase tracking-wider">
                                Number of Tickets
                            </label>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-lg opacity-0 group-focus-within:opacity-30 blur transition duration-300"></div>
                                <input
                                    type="number"
                                    min="0"
                                    max={maxTickets || 0}
                                    value={ticketCount ?? ""}
                                    onChange={handleTicketChange}
                                    className="relative w-full bg-slate-800/50 border border-red-800/50 rounded-lg py-3 px-4 text-white font-mono text-lg focus:outline-none focus:border-red-500/50 transition-colors"
                                    placeholder="Enter number"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                    <p className="text-sm text-red-400 font-mono">{error}</p>
                                </div>
                            </div>
                        )}

                        {buyTicketError && (
                            <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                    <p className="text-sm text-red-400 font-mono">{buyTicketError}</p>
                                </div>
                            </div>
                        )}


                        {/* Price Summary */}
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400 font-mono">Ticket Price</p>
                                    <p className="text-lg font-bold text-amber-400">{ticketPrice / SMALLEST_TOKEN_UNIT} SOL</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 font-mono">Total Cost</p>
                                    <p className="text-lg font-bold text-amber-400">{totalCost} SOL</p>
                                </div>
                            </div>
                        </div>

                        {/* Buy Button */}
                        <button
                            onClick={handleBuy}
                            disabled={isLoading}
                            className="w-full relative group/btn overflow-hidden rounded-lg bg-gradient-to-r from-red-900/20 via-red-800/20 to-amber-900/20 p-px border border-red-800/50 hover:border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 opacity-0 group-hover/btn:opacity-20 blur transition duration-500"></div>
                            <div className="relative bg-slate-900 rounded-lg py-3 px-6">
                                <div className="flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="text-lg font-bold bg-gradient-to-r from-red-400 via-red-300 to-amber-400 bg-clip-text text-transparent transition-all duration-300">
                                            BUY TICKETS
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BuyTicketModal;
