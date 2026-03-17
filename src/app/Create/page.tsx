'use client'
import { CreateRaffle } from '@/api/createRaffle'
import { initialiseCounter } from '@/api/initialise-counter'
import { CounterInitModal } from '@/components/modal/initialise-counter'
import { deadlineTimestamp } from '@/helpers/deadlineTimestamp'
import { CreateRaffleInputs } from '@/types/raffleType'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, Clock, DollarSign, ImageIcon, Ticket, Users, Zap } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'

function Page() {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [deadline, setDeadline] = useState('')
  const [sellingPrice, setSellingPrice] = useState<number | null>(null)
  const [ticketPrice, setTicketPrice] = useState<number | null>(null)
  const [minTickets, setMinTickets] = useState(1)
  const [maxTickets, setMaxTickets] = useState<number | null>(null)
  const [counterInitModal, setCounterInitModal] = useState(false)

  const { mutate, isPending } = CreateRaffle()
  const queryClient = useQueryClient()
  const { mutate: counterInit, isPending: counterInitLoading } = initialiseCounter()

  const isStep1Valid = useMemo(() => Boolean(itemName && itemDescription && image), [itemName, itemDescription, image])
  const isStep2Valid = useMemo(
    () => Boolean(sellingPrice !== null && sellingPrice > 0 && ticketPrice !== null && ticketPrice > 0),
    [sellingPrice, ticketPrice],
  )
  const isStep3Valid = useMemo(
    () => Boolean(deadline && minTickets > 0 && maxTickets !== null && maxTickets >= minTickets),
    [deadline, minTickets, maxTickets],
  )
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid

  const goNext = () => {
    if (step === 1 && !isStep1Valid) return
    if (step === 2 && !isStep2Valid) return
    setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev))
  }

  const goBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid || !image || sellingPrice == null || ticketPrice == null || maxTickets == null) return

    const timestamp = deadlineTimestamp(deadline)
    const payload: CreateRaffleInputs = {
      itemName,
      itemDescription,
      itemImage: image,
      sellingPrice,
      ticketPrice,
      minTickets,
      maxTickets,
      deadline: timestamp,
    }
    mutate(payload, {
      onSuccess: (tx) => {
        if (tx) {
          toast.success('Raffle created successfully!')
          queryClient.invalidateQueries({ queryKey: ['raffle-accounts'] })
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
        console.log('error from page:', error.message)
      },
    })
  }

  const handleCounterInit = () => {
    counterInit(undefined, {
      onSuccess: (tx) => {
        if (tx) toast.success('Counter initialise successfully!')
      },
      onError: (error) => {
        console.log('error:', error)
        toast.error(error.message)
      },
    })
  }

  // Shared input classes - responsive padding and text
  const inputClass =
    'w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0a0a0a] border border-[#ccff00]/10 rounded-lg sm:rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/40 focus:border-[#ccff00]/40 transition-all font-mono text-sm sm:text-base'

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid pattern */}
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />

      {/* Lime glows */}
      <div className="fixed top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0a0a0a] backdrop-blur-sm rounded-full border border-[#ccff00]/20 mb-4 sm:mb-6 md:mb-8">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-[#ccff00] uppercase tracking-wider font-mono">
              Create Your Raffle
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="text-white">Launch Your</span>
            <br />
            <span className="text-gradient-brand">On-Chain Raffle</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 font-mono px-2 sm:px-0">
            Set up a transparent, verifiable raffle in minutes. All transactions are on-chain with guaranteed payouts.
          </p>

          <div className="flex justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 font-mono flex-wrap">
            {['100% Secure', 'Transparent Odds', 'Instant Payouts'].map((t) => (
              <div key={t} className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#ccff00]" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form card */}
      <section className="px-3 sm:px-4 md:px-6 pb-16 sm:pb-20 md:pb-24 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-0.5 sm:-inset-1 bg-[#ccff00]/5 rounded-xl sm:rounded-2xl blur-xl pointer-events-none" />

            <div className="relative bg-[#0a0a0a] rounded-xl sm:rounded-2xl border border-[#ccff00]/10 p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Stepper */}
              <div className="mb-6 sm:mb-8 md:mb-10">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((s, idx) => {
                    const label = s === 1 ? 'Item' : s === 2 ? 'Pricing' : 'Schedule'
                    const isActive = step === s
                    const isCompleted = step > s

                    return (
                      <div key={s} className={`flex-1 flex items-center ${idx < 2 ? 'gap-1 sm:gap-2 md:gap-3' : ''}`}>
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div
                            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border text-xs sm:text-sm font-mono transition-all shrink-0 ${
                              isActive
                                ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] sm:shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                                : isCompleted
                                  ? 'bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00]/50'
                                  : 'bg-[#111] text-gray-600 border-[#222]'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s}
                          </div>
                          <div className="hidden sm:flex flex-col">
                            <span className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-600 font-mono">Step {s}</span>
                            <span className={`text-xs sm:text-sm font-mono ${isActive ? 'text-white' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </div>
                        </div>
                        {idx < 2 && (
                          <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent mx-1 sm:mx-2" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* ── Step 1: Item Details ── */}
                {step === 1 && (
                  <div className="mb-8 sm:mb-10 md:mb-12">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-lg sm:rounded-xl" />
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00]" />
                        </div>
                      </div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Item Details</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent ml-2" />
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g., Premium Wireless Headphones"
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                          Description
                        </label>
                        <textarea
                          value={itemDescription}
                          onChange={(e) => setItemDescription(e.target.value)}
                          placeholder="Describe your item in detail..."
                          rows={3}
                          className={`${inputClass} resize-none`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                          Item Image
                        </label>
                        <div className="space-y-2 sm:space-y-3">
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setImage(file)
                              setImagePreview(URL.createObjectURL(file))
                            }}
                            className={`${inputClass} text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-[#ccff00]/10 file:text-[#ccff00] hover:file:bg-[#ccff00]/20`}
                            required
                          />
                          {imagePreview ? (
                            <div className="relative aspect-video w-full max-w-md rounded-lg sm:rounded-xl overflow-hidden border border-[#ccff00]/20">
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => setImagePreview('')}
                              />
                            </div>
                          ) : (
                            <div className="aspect-video w-full max-w-md rounded-lg sm:rounded-xl bg-[#111] border-2 border-dashed border-[#ccff00]/10 flex items-center justify-center">
                              <div className="text-center px-4">
                                <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-700 mx-auto mb-1.5 sm:mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600 font-mono">Image preview will appear here</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Pricing ── */}
                {step === 2 && (
                  <div className="mb-8 sm:mb-10 md:mb-12">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-lg sm:rounded-xl" />
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00]" />
                        </div>
                      </div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Pricing</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent ml-2" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                          Item Value (USDC)
                        </label>
                        <input
                          type="number"
                          value={sellingPrice ?? ''}
                          onChange={(e) => setSellingPrice(e.target.value === '' ? null : Number(e.target.value))}
                          placeholder="599"
                          className={inputClass}
                          required
                        />
                        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600 font-mono">Total value of the item being raffled</p>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                          Ticket Price (USDC)
                        </label>
                        <input
                          type="number"
                          value={ticketPrice ?? ''}
                          onChange={(e) => setTicketPrice(e.target.value === '' ? null : Number(e.target.value))}
                          placeholder="5"
                          className={inputClass}
                          required
                        />
                        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600 font-mono">Price per raffle ticket</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Tickets + Duration ── */}
                {step === 3 && (
                  <>
                    <div className="mb-8 sm:mb-10 md:mb-12">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-lg sm:rounded-xl" />
                          <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00]" />
                          </div>
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Ticket Configuration</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent ml-2" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                            Minimum Tickets
                          </label>
                          <input
                            type="number"
                            value={minTickets}
                            onChange={(e) => setMinTickets(e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="10"
                            min="1"
                            className={inputClass}
                            required
                          />
                          <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600 font-mono">Minimum tickets to start the raffle</p>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                            Maximum Tickets
                          </label>
                          <input
                            type="number"
                            value={maxTickets ?? ''}
                            onChange={(e) => setMaxTickets(e.target.value === '' ? null : Number(e.target.value))}
                            placeholder="100"
                            min="1"
                            className={inputClass}
                            required
                          />
                          <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600 font-mono">Maximum tickets available</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8 sm:mb-10 md:mb-12">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-lg sm:rounded-xl" />
                          <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00]" />
                          </div>
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Duration</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent ml-2" />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 font-mono uppercase tracking-wide">
                          End Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className={inputClass}
                          required
                        />
                        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600 font-mono">
                          When the raffle will end and winner will be selected
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation footer */}
                <div className="pt-6 sm:pt-8 border-t border-[#ccff00]/10 flex flex-col gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={goBack}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[#ccff00]/10 bg-[#111] text-gray-300 font-mono text-xs sm:text-sm hover:border-[#ccff00]/30 hover:text-white transition-all"
                      >
                        Back
                      </button>
                    )}

                    {step < 3 && (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                        className="btn-shine w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#ccff00] hover:bg-[#dfff00] disabled:bg-[#1a1a1a] disabled:text-gray-600 disabled:cursor-not-allowed text-black font-bold font-mono text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all"
                      >
                        Continue
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}

                    {step === 3 && (
                      <button
                        type="submit"
                        disabled={!isFormValid || isPending}
                        className="btn-shine w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#ccff00] hover:bg-[#dfff00] disabled:bg-[#1a1a1a] disabled:text-gray-600 disabled:cursor-not-allowed text-black font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(204,255,0,0.15)] sm:shadow-[0_0_30px_rgba(204,255,0,0.15)] hover:shadow-[0_0_30px_rgba(204,255,0,0.25)] sm:hover:shadow-[0_0_40px_rgba(204,255,0,0.25)] transition-all"
                      >
                        {isPending ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span className="text-xs sm:text-sm">Creating Raffle...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Create Raffle</span>
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Trust notice */}
                  <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-lg sm:rounded-xl">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ccff00] animate-pulse" />
                      <p className="text-xs sm:text-sm text-gray-500 text-center font-mono">
                        Your raffle will be secured on-chain with transparent, verifiable randomness
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

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

export default Page