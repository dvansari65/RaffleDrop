'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Ticket, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import ExploreHeading from '@/components/Explore/exploring-heading'
import { useRaffleAccount } from '@/hooks/useGetRaffleInfo'
import { RaffleCard } from '@/components/raffle/raffle-card'
import { RaffleCardLoaderGrid } from '@/components/raffle/loader'
import BuyTicketModal from '@/components/modal/buy-ticket-modal'
import { buyTicket } from '@/api/buyTicket'
import { buyTicketProps } from '@/types/raffleType'
import { toast } from 'sonner'
import { PublicKey } from '@solana/web3.js'
import { resolveIpfs } from '@/helpers/resolveIPFS'
import { SMALLEST_TOKEN_UNIT } from '@/constants/smallest-token-unit'
import { getRaffleStatus } from '@/helpers/getRaffleStatus'
import { CounterInitModal } from '@/components/modal/initialise-counter'
import { initialiseCounter } from '@/api/initialise-counter'
import { checkCounterInfo } from '@/utils/getAccountInfo'
import { useRaffleProgram } from '@/hooks/useRaffleProgram'
import { useConnection } from '@solana/wallet-adapter-react'
import { useQueryClient } from '@tanstack/react-query'

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('active')
  const { data, isLoading } = useRaffleAccount()
  const [numberOfTickets, setNumberOfTickets] = useState<number | null>(null)
  const [maxTicketsLimit, setMaxTicketsLimit] = useState<number | null>(null)
  const [ticketPrice, setTicketPrice] = useState<number | null>(null)
  const [sellerKey, setSellerKey] = useState('')
  const [raffleKey, setRaffleKey] = useState('')
  const [raffleId, setRaffleId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCheckCounterInit, setIsCheckCounterInit] = useState(false)
  const [error, setError] = useState('')
  const { mutate, isPending: buyTicketLoading, error: ticketError } = buyTicket()
  const [counterInitModal, setCounterInitModal] = useState(false)
  const { mutate: counterInit, isPending: counterInitLoading } = initialiseCounter()
  const { program } = useRaffleProgram()
  const { connection } = useConnection()
  const queryClient = useQueryClient()

  const handleBuyTicket = () => {
    const convertedSellerKey = new PublicKey(sellerKey)
    const payload: buyTicketProps = {
      numTickets: numberOfTickets ?? 0,
      sellerKey: convertedSellerKey,
      raffleKey: new PublicKey(raffleKey),
      raffleId: raffleId,
    }
    mutate(payload, {
      onSuccess: (tx) => {
        if (tx) {
          toast.success('Ticket bought successfully!')
          queryClient.invalidateQueries({ queryKey: ['raffle-accounts'] })
          setIsModalOpen(false)
        }
      },
      onError: (error) => {
        if (
          error.message.includes('0xbc4') ||
          error.message.includes('AccountNotInitialized') ||
          error.message.includes('Error Number: 3012')
        ) {
          setCounterInitModal(true)
          toast.error('Counter needs to be initialized first')
        } else {
          toast.error(error.message)
        }
        console.log('error:', error.message)
      },
    })
  }

  const handleCounterInit = async () => {
    setIsCheckCounterInit(true)
    try {
      const isCounterExist = await checkCounterInfo(program, connection)
      if (isCounterExist) {
        toast.success('Counter already exist!')
        setCounterInitModal(false)
        return
      }
      counterInit(undefined, {
        onSuccess: (tx) => {
          if (tx) {
            toast.success('Counter initialise successfully!')
          }
        },
        onError: (error) => {
          setError(error.message)
          console.log('error:', error)
          toast.error(error.message)
        },
      })
    } catch (error) {}
  }

  const handleOpenModal = ({
    maxTickets,
    ticketPrice,
    raffleKey,
    sellerKey,
    raffleId,
  }: {
    maxTickets: number | null
    ticketPrice: number | null
    raffleKey: string
    sellerKey: string
    raffleId: number
  }) => {
    setError('')
    if (!maxTickets) {
      setError('Max tickets not found!')
      return
    }
    setRaffleId(raffleId)
    setSellerKey(sellerKey)
    setRaffleKey(raffleKey)
    setMaxTicketsLimit(maxTickets)
    setNumberOfTickets(1)
    setTicketPrice(ticketPrice)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return <RaffleCardLoaderGrid />
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />

      {/* Lime glow top-left */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
      {/* Lime glow bottom-right */}
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] backdrop-blur-sm rounded-full border border-[#ccff00]/20 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-sm font-semibold text-[#ccff00] uppercase tracking-wider">
              Transparent On-Chain Raffles
            </span>
          </div>

          {/* Main Heading */}
          <ExploreHeading title1="Discover" title2="Exclusive Raffles" />

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Participate in verified, on-chain raffles with guaranteed payouts and transparent odds.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 flex-wrap">
            <div className="text-center relative group">
              <div className="absolute -inset-2 bg-[#ccff00]/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative text-3xl font-bold text-white mb-2">24</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Live Raffles</div>
            </div>
            <div className="text-center relative group">
              <div className="absolute -inset-2 bg-[#ccff00]/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative text-3xl font-bold text-[#ccff00] mb-2">$1.2M</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Total Prizes</div>
            </div>
            <div className="text-center relative group">
              <div className="absolute -inset-2 bg-[#ccff00]/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative text-3xl font-bold text-white mb-2">4.8K</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Participants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="px-6 pb-12 relative z-10">
        <div className="container mx-auto max-w-6xl">
          {/* Tab Buttons */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ccff00]/20 to-transparent" />
            <div className="inline-flex items-center gap-1 p-1 bg-[#0a0a0a] backdrop-blur-sm rounded-xl border border-[#ccff00]/10">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                  activeTab === 'active'
                    ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Active Raffles
                {activeTab === 'active' && <span className="ml-1 w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />}
              </button>
              <button
                onClick={() => setActiveTab('finished')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                  activeTab === 'finished'
                    ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4" />
                Finished
              </button>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ccff00]/20 to-transparent" />
          </div>

          {/* Content Area */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-[#ccff00]/5 rounded-2xl blur-xl pointer-events-none" />

            <div className="relative min-h-[500px] bg-[#0a0a0a] rounded-2xl border border-[#ccff00]/10 p-12">
              {/* Empty state */}
              {data?.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
                  {/* Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#ccff00]/10 blur-2xl rounded-2xl" />
                    <div className="relative w-24 h-24 mx-auto bg-[#111] rounded-2xl flex items-center justify-center border border-[#ccff00]/20">
                      <Ticket className="w-12 h-12 text-[#ccff00]" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white">No raffles found</h2>
                    <p className="text-gray-500 text-lg">
                      {activeTab === 'active'
                        ? 'Be the first to create an exciting raffle.'
                        : 'No finished raffles yet.'}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link href="/Create">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-[#ccff00]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Button
                        size="lg"
                        className="btn-shine relative bg-[#ccff00] hover:bg-[#dfff00] text-black font-bold px-10 py-6 text-base rounded-xl transition-all uppercase tracking-wider"
                      >
                        Create a Raffle
                        <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      </Button>
                    </div>
                  </Link>

                  {/* Trust elements */}
                  <div className="pt-8 border-t border-[#ccff00]/10 w-full">
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                        <span className="uppercase tracking-wide">100% On-Chain</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                        <span className="uppercase tracking-wide">Verified Randomness</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                        <span className="uppercase tracking-wide">Instant Payouts</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Raffle cards grid */}
              {data?.length && data?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.map((raffle) => (
                    <RaffleCard
                      claimed={raffle.account.claimed}
                      winner={raffle?.account?.winner?.toString()}
                      isSoldOut={raffle.account.isSoldOut}
                      progress={raffle?.account?.progress}
                      entries={raffle?.account.totalEntries.toNumber()}
                      key={raffle.publicKey.toString()}
                      itemName={raffle.account.itemName.toString()}
                      itemDescription={raffle?.account.itemDescription}
                      sellingPrice={Number(raffle?.account?.sellingPrice) / SMALLEST_TOKEN_UNIT}
                      ticketPrice={Number(raffle?.account?.ticketPrice) / SMALLEST_TOKEN_UNIT}
                      totalCollected={Number(raffle?.account?.totalCollected)}
                      maxTickets={raffle.account?.maxTickets}
                      deadline={raffle.account.deadline.toNumber()}
                      status={getRaffleStatus(raffle?.account?.status)}
                      sellerKey={raffle.account.seller.toString()}
                      itemImage={resolveIpfs(raffle.account.itemImageUri)}
                      raffleKey={raffle.publicKey.toString()}
                      raffleId={raffle.account.raffleId.toNumber()}
                      onBuyTicket={() =>
                        handleOpenModal({
                          maxTickets: raffle.account.maxTickets,
                          ticketPrice: Number(raffle.account.ticketPrice),
                          raffleKey: raffle.publicKey.toString(),
                          sellerKey: raffle?.account?.seller.toString(),
                          raffleId: raffle.account.raffleId.toNumber(),
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {isModalOpen && (
        <BuyTicketModal
          ticketCount={numberOfTickets}
          onTicketCountChange={setNumberOfTickets}
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          maxTickets={numberOfTickets}
          ticketPrice={ticketPrice}
          isLoading={buyTicketLoading}
          onBuyTickets={handleBuyTicket}
          buyTicketError={error || ''}
        />
      )}
      {counterInitModal && (
        <CounterInitModal
          isOpen={counterInitModal}
          onClose={() => setCounterInitModal(false)}
          onProceed={handleCounterInit}
          isPending={counterInitLoading}
        />
      )}

      {/* Bottom accent line */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ccff00]/30 to-transparent pointer-events-none" />
    </div>
  )
}
