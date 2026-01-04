"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ticket, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import ExploreHeading from '@/components/Explore/exploring-heading';
import { useRaffleAccount } from '@/hooks/useGetRaffleInfo';
import RaffleCard from '@/components/raffle/raffle-card';
import { getRaffleStatus } from '@/helpers/getRaffleStatus';
import { RaffleCardLoaderGrid } from '@/components/raffle/loader';
import BuyTicketModal from '@/components/modal/buy-ticket-modal';
import { buyTicket } from '@/api/buyTicket';
import { buyTicketProps } from '@/types/raffle';
import { toast } from 'sonner';
import {PublicKey} from "@solana/web3.js"
export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('active');
  const { data, isLoading } = useRaffleAccount();
  const [numberOfTickets, setNumberOfTickets] = useState<number | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null)
  const [deadline, setDeadline] = useState(0)
  const [sellerKey,setSellerkey] = useState("")
  const [raffleKey,setRaffleKey] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState("")
  const { mutate, isPending: buyTicketLoading, error: ticketError } = buyTicket()

  const handleBuyTicket = () => {
    console.log("hiting....")
    if(deadline > Date.now()){
      setError("Dead line passed!")
      return;
    }
    if(!sellerKey){
      setError("Seller of this Raffle not found!")
      return;
    }
    const payload:buyTicketProps = {
      numTickets:numberOfTickets ?? 0,
      sellingPrice:ticketPrice ?? 0,
      deadline,
      sellerPubKey:new PublicKey(sellerKey),
      rafflePubKey:new PublicKey(raffleKey)
    }
    console.log("deadline:",deadline.toString())
    mutate(payload,{
      onSuccess:(tx)=>{
        if(!tx){
          toast.success("Ticket bought successfully!")
          setIsModalOpen(false)
        }
      },
      onError:(error)=>{
       console.log("error:",error.message)
      }
    })
  }

  const handleOpenModal = ({ 
    maxTickets, 
    ticketPrice, 
    deadline,
    sellerKey,
    raffleKey
   }: { 
    maxTickets: number | null, 
    ticketPrice: number | null, 
    deadline: number,
    sellerKey:string,
    raffleKey:string
    }) => {

    if (!maxTickets) {
      setError("Max tickets not found!")
      return;
    }
    setRaffleKey(raffleKey)
    setSellerkey(sellerKey)
    setDeadline(deadline)
    setNumberOfTickets(maxTickets);
    setTicketPrice(ticketPrice)
    setIsModalOpen(true)
  }
  if (isLoading) {
    return <RaffleCardLoaderGrid />;
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Atmospheric Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-20 animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/50 backdrop-blur-sm rounded-full border border-red-800/50 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Transparent On-Chain Raffles</span>
          </div>

          {/* Main Heading */}
          <ExploreHeading title1='Discover' title2='Exclusive Raffles' />

          {/* Subtitle */}
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
            Participate in verified, on-chain raffles with guaranteed payouts and transparent odds.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12">
            <div className="text-center relative group">
              <div className="absolute -inset-2 bg-red-500/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative text-3xl font-bold text-white mb-2">24</div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">Live Raffles</div>
            </div>
            <div className="text-center relative group">
              <div className="absolute -inset-2 bg-amber-500/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative text-3xl font-bold text-amber-400 mb-2">$1.2M</div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">Total Prizes</div>
            </div>
            <div className="text-center relative group">
              <div className="absolute -inset-2 bg-red-500/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative text-3xl font-bold text-white mb-2">4.8K</div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">Participants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="px-6 pb-12 relative z-10">
        <div className="container mx-auto max-w-6xl">
          {/* Tab Buttons */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
            <div className="inline-flex items-center gap-1 p-1 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-red-900/50">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${activeTab === 'active'
                  ? 'bg-red-900/50 text-white shadow-lg shadow-red-500/10 border border-red-800/50'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/20'
                  }`}
              >
                <TrendingUp className="w-4 h-4" />
                Active Raffles
                {activeTab === 'active' && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('finished')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${activeTab === 'finished'
                  ? 'bg-red-900/50 text-white shadow-lg shadow-red-500/10 border border-red-800/50'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/20'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Finished
              </button>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
          </div>

          {/* Content Area */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 via-amber-600/10 to-red-600/10 rounded-2xl blur-xl"></div>

            <div className="relative min-h-[500px] bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-red-900/30 p-12">
              {/* When data is empty */}
              {data?.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
                  {/* Icon with Glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-2xl" />
                    <div className="relative w-24 h-24 mx-auto bg-slate-800/50 rounded-2xl flex items-center justify-center border border-red-800/50">
                      <Ticket className="w-12 h-12 text-red-400" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white">
                      No raffles found
                    </h2>
                    <p className="text-slate-400 text-lg">
                      {activeTab === 'active'
                        ? 'Be the first to create an exciting raffle.'
                        : 'No finished raffles yet.'}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link href="/create">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition"></div>
                      <Button
                        size="lg"
                        className="relative bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold px-10 py-6 text-base rounded-xl shadow-lg shadow-red-900/50 transition-all hover:shadow-xl hover:shadow-red-800/60 uppercase tracking-wider"
                      >
                        Create a Raffle
                        <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      </Button>
                    </div>
                  </Link>

                  {/* Trust Elements */}
                  <div className="pt-8 border-t border-red-900/30 w-full">
                    <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="uppercase tracking-wide">100% On-Chain</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="uppercase tracking-wide">Verified Randomness</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="uppercase tracking-wide">Instant Payouts</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* When data is present */}
              {data?.length && data?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.map((raffle) => (
                    <RaffleCard
                      key={raffle.publicKey.toString()}
                      itemName={raffle.account.itemName.toString()}
                      itemDescription={raffle?.account.itemDescription}
                      sellingPrice={Number(raffle?.account?.sellingPrice)}
                      ticketPrice={Number(raffle?.account?.ticketPrice)}
                      totalCollected={Number(raffle?.account?.totalCollected)}
                      maxTickets={raffle.account?.maxTickets}
                      deadline={(Number(raffle.account.deadline))}
                      status={getRaffleStatus(raffle?.account?.status)}
                      sellerKey={raffle.account.seller.toString()}
                      raffleKey={raffle.publicKey.toString()}
                      onBuyTicket={() => handleOpenModal({ 
                        maxTickets: raffle.account.maxTickets, 
                        ticketPrice: Number(raffle.account.ticketPrice),
                        deadline:Number(raffle.account.deadline),
                        sellerKey:raffle.account.seller.toString(),
                        raffleKey:raffle.publicKey.toString()
                       })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {
        isModalOpen &&
        <BuyTicketModal
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          maxTickets={numberOfTickets}
          ticketPrice={ticketPrice}
          isLoading={buyTicketLoading}
          onBuyTickets={handleBuyTicket}
          buyTicketError={error || ticketError?.message || ""}
        />
      }

      {/* Bottom atmospheric effect */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30"></div>
    </div>
  );
}