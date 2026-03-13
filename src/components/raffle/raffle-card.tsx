"use client"
import React, { useState } from "react";
import { Ticket, Clock, Users, Trophy, TrendingUp, Crown, CheckCircle2, XCircle, Loader2, Ban, RotateCcw, Flame, Copy, Check } from "lucide-react";
import { getTimeLeftFromUnix } from "@/helpers/formatTimestamp";
import { LinearProgressWithLabel } from "../ui/progress-bar";
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
  claimed: boolean;
  winner: string | undefined;
  raffleKey: string;
  entries: number;
  isSoldOut: boolean;
  progress: number | undefined;
  raffleId: number;
  onBuyTicket: ({ maxTickets, raffleId }: { maxTickets: number; raffleId: number }) => void;
}

function truncateAddress(address: string) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const STATUS_CONFIG = {
  active: {
    label: "Live",
    labelColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/25",
    cardBorder: "border-border hover:border-primary/40",
    cardShadow: "hover:shadow-[0_0_32px_hsl(var(--primary)/0.15)]",
    headerOverlay: null,
    pulse: true,
    dotColor: "bg-emerald-400",
    Icon: Flame,
  },
  drawing: {
    label: "Drawing",
    labelColor: "text-accent",
    badgeBg: "bg-accent/10 border-accent/25",
    cardBorder: "border-accent/40",
    cardShadow: "shadow-[0_0_28px_hsl(var(--accent)/0.12)]",
    headerOverlay: null,
    pulse: true,
    dotColor: "bg-accent",
    Icon: Loader2,
  },
  completed: {
    label: "Completed",
    labelColor: "text-primary",
    badgeBg: "bg-primary/10 border-primary/25",
    cardBorder: "border-primary/50",
    cardShadow: "shadow-[0_0_36px_hsl(var(--primary)/0.20)]",
    headerOverlay: "bg-primary/8",
    pulse: false,
    dotColor: "bg-primary",
    Icon: Crown,
  },
  cancelled: {
    label: "Cancelled",
    labelColor: "text-muted-foreground",
    badgeBg: "bg-muted/60 border-border",
    cardBorder: "border-border opacity-70",
    cardShadow: "",
    headerOverlay: "bg-background/50",
    pulse: false,
    dotColor: "bg-muted-foreground",
    Icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    labelColor: "text-muted-foreground",
    badgeBg: "bg-muted/60 border-border",
    cardBorder: "border-border opacity-70",
    cardShadow: "",
    headerOverlay: "bg-background/50",
    pulse: false,
    dotColor: "bg-muted-foreground",
    Icon: RotateCcw,
  },
  ended: {
    label: "Ended",
    labelColor: "text-muted-foreground",
    badgeBg: "bg-muted/60 border-border",
    cardBorder: "border-border opacity-70",
    cardShadow: "",
    headerOverlay: "bg-background/50",
    pulse: false,
    dotColor: "bg-muted-foreground",
    Icon: Ban,
  },
};

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
  entries,
  status,
  winner,
  claimed,
  sellerKey,
}) => {
  const { days, hours, minutes, isExpired } = getTimeLeftFromUnix(deadline);
  const [copied, setCopied] = useState(false);

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ended;
  const StatusIcon = cfg.Icon;

  const isActive = status === "active";
  const isDrawing = status === "drawing";
  const isCompleted = status === "completed";
  const isInactive = status === "cancelled" || status === "refunded" || status === "ended";
  const hasWinner = isCompleted && !!winner;

  const formattedTicketPrice = ticketPrice;
  const formattedTotalCollected = totalCollected / SMALLEST_TOKEN_UNIT;
  const formattedSellingPrice = sellingPrice / SMALLEST_TOKEN_UNIT;

  const handleCopy = () => {
    if (!winner) return;
    navigator.clipboard.writeText(winner);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-[var(--radius)] border bg-card flex flex-col overflow-hidden transition-all duration-300 ${cfg.cardBorder} ${cfg.cardShadow}`}>

      {/* ── IMAGE ── */}
      <div className="relative h-52 shrink-0 overflow-hidden bg-muted">
        {itemImage ? (
          <img
            src={itemImage}
            alt={itemName}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${isActive ? "hover:scale-105" : ""} ${isInactive ? "grayscale opacity-50" : ""}`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Trophy className="w-14 h-14 text-muted-foreground/20" />
          </div>
        )}

        {/* Status overlay tint */}
        {cfg.headerOverlay && (
          <div className={`absolute inset-0 ${cfg.headerOverlay}`} />
        )}

        {/* Fade to card at bottom so progress bar reads cleanly */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-card to-transparent" />

        {/* STATUS BADGE */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold backdrop-blur-sm ${cfg.badgeBg} ${cfg.labelColor}`}>
          {cfg.pulse ? (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${cfg.dotColor}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dotColor}`} />
            </span>
          ) : (
            <StatusIcon className={`w-3 h-3 ${isDrawing ? "animate-spin" : ""}`} />
          )}
          {cfg.label}
        </div>

        {/* RETAIL PRICE */}
        <div className="absolute top-3 right-3 rounded-lg bg-background/80 backdrop-blur px-3 py-1.5 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Retail</p>
          <p className="text-sm font-bold text-accent">${formattedSellingPrice}</p>
        </div>

        {/* PROGRESS */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
          <LinearProgressWithLabel value={progress || 0} />
        </div>
      </div>

      {/* ── WINNER BANNER — only when completed ── */}
      {isCompleted && (
        <div className={`mx-3 mt-3 rounded-xl border p-3 ${hasWinner ? "bg-primary/6 border-primary/30" : "bg-muted/40 border-border"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Crown className={`w-4 h-4 shrink-0 ${hasWinner ? "text-accent" : "text-muted-foreground"}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${hasWinner ? "text-foreground" : "text-muted-foreground"}`}>
              {hasWinner ? "Winner Selected" : "No Winner"}
            </span>
            {claimed && hasWinner && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3" />
                Prize Claimed
              </span>
            )}
          </div>

          {hasWinner ? (
            <button
              onClick={handleCopy}
              title="Click to copy full address"
              className="w-full flex items-center justify-between bg-background/50 hover:bg-background border border-border hover:border-primary/40 rounded-lg px-3 py-2 transition-all"
            >
              <span className="font-mono text-sm text-foreground/80">{truncateAddress(winner)}</span>
              <span className={`flex items-center gap-1 text-[11px] transition-colors ${copied ? "text-emerald-400" : "text-muted-foreground"}`}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">Raffle ended without a winner being drawn.</p>
          )}
        </div>
      )}

      {/* DRAWING NOTICE */}
      {isDrawing && (
        <div className="mx-3 mt-3 rounded-xl bg-accent/6 border border-accent/25 px-4 py-3 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
          <div>
            <p className="text-xs font-bold text-accent uppercase tracking-wider">Drawing in Progress</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Selecting winner from {entries} entries...</p>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="flex flex-col gap-3 p-4 flex-1">

        {/* Title + Description */}
        <div>
          <h3 className="text-base font-bold text-card-foreground line-clamp-1">{itemName}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{itemDescription}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <Ticket className="w-3.5 h-3.5 text-accent" />
              Per Ticket
            </div>
            <p className="text-sm font-bold text-accent">${formattedTicketPrice}</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {isExpired ? "Ended" : "Ends In"}
            </div>
            <p className="text-sm font-bold text-card-foreground tabular-nums">
              {isExpired
                ? <span className="text-muted-foreground">—</span>
                : days > 0
                ? `${days}d ${hours}h`
                : `${hours}h ${minutes}m`}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              Entries
            </div>
            <p className="text-sm font-bold text-card-foreground">
              {entries}
              <span className="text-xs font-normal text-muted-foreground"> / {maxTickets}</span>
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Collected
            </div>
            <p className="text-sm font-bold text-emerald-400">${formattedTotalCollected}</p>
          </div>
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border">
          <span className="text-[11px] text-muted-foreground">Seller</span>
          <span className="font-mono text-[11px] text-muted-foreground">{truncateAddress(sellerKey)}</span>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          {isCompleted ? (
            <div className="w-full rounded-lg bg-primary/8 border border-primary/30 py-2.5 text-center">
              <span className="text-sm font-semibold text-primary">Raffle Ended</span>
            </div>
          ) : isDrawing ? (
            <div className="w-full rounded-lg bg-accent/8 border border-accent/25 py-2.5 text-center">
              <span className="text-sm font-semibold text-accent">Drawing Winner...</span>
            </div>
          ) : isInactive ? (
            <div className="w-full rounded-lg bg-muted/50 border border-border py-2.5 text-center">
              <span className="text-sm font-semibold text-muted-foreground capitalize">{status}</span>
            </div>
          ) : (
            <RaffleButton onClick={() => onBuyTicket({ maxTickets, raffleId })} isSoldOut={isSoldOut} />
          )}
        </div>
      </div>
    </div>
  );
};