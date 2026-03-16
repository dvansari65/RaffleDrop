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

  // Shared input classes
  const inputClass =
    'w-full px-4 py-3 bg-[#0a0a0a] border border-[#ccff00]/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/40 focus:border-[#ccff00]/40 transition-all font-mono'

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid pattern */}
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />

      {/* Lime glows */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="pt-24 pb-12 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] backdrop-blur-sm rounded-full border border-[#ccff00]/20 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-sm font-semibold text-[#ccff00] uppercase tracking-wider font-mono">
              Create Your Raffle
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Launch Your</span>
            <br />
            <span className="text-gradient-brand">On-Chain Raffle</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 font-mono">
            Set up a transparent, verifiable raffle in minutes. All transactions are on-chain with guaranteed payouts.
          </p>

          <div className="flex justify-center gap-8 text-sm text-gray-600 font-mono flex-wrap">
            {['100% Secure', 'Transparent Odds', 'Instant Payouts'].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form card */}
      <section className="px-6 pb-24 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-[#ccff00]/5 rounded-2xl blur-xl pointer-events-none" />

            <div className="relative bg-[#0a0a0a] rounded-2xl border border-[#ccff00]/10 p-8 md:p-12">
              {/* Stepper */}
              <div className="mb-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  {[1, 2, 3].map((s, idx) => {
                    const label = s === 1 ? 'Item' : s === 2 ? 'Pricing' : 'Schedule'
                    const isActive = step === s
                    const isCompleted = step > s

                    return (
                      <div key={s} className="flex-1 flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center w-9 h-9 rounded-full border text-sm font-mono transition-all ${
                            isActive
                              ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                              : isCompleted
                                ? 'bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00]/50'
                                : 'bg-[#111] text-gray-600 border-[#222]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-wide text-gray-600 font-mono">Step {s}</span>
                          <span className={`text-sm font-mono ${isActive ? 'text-white' : 'text-gray-500'}`}>
                            {label}
                          </span>
                        </div>
                        {idx < 2 && <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* ── Step 1: Item Details ── */}
                {step === 1 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-xl" />
                        <div className="relative w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                          <Ticket className="w-5 h-5 text-[#ccff00]" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-semibold text-white">Item Details</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent" />
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
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
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
                          Description
                        </label>
                        <textarea
                          value={itemDescription}
                          onChange={(e) => setItemDescription(e.target.value)}
                          placeholder="Describe your item in detail..."
                          rows={4}
                          className={`${inputClass} resize-none`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
                          Item Image
                        </label>
                        <div className="space-y-3">
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setImage(file)
                              setImagePreview(URL.createObjectURL(file))
                            }}
                            className={inputClass}
                            required
                          />
                          {imagePreview ? (
                            <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-[#ccff00]/20">
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => setImagePreview('')}
                              />
                            </div>
                          ) : (
                            <div className="aspect-video w-full max-w-md rounded-xl bg-[#111] border-2 border-dashed border-[#ccff00]/10 flex items-center justify-center">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 font-mono">Image preview will appear here</p>
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
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-xl" />
                        <div className="relative w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                          <DollarSign className="w-5 h-5 text-[#ccff00]" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-semibold text-white">Pricing</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
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
                        <p className="mt-2 text-xs text-gray-600 font-mono">Total value of the item being raffled</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
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
                        <p className="mt-2 text-xs text-gray-600 font-mono">Price per raffle ticket</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Tickets + Duration ── */}
                {step === 3 && (
                  <>
                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-xl" />
                          <div className="relative w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                            <Users className="w-5 h-5 text-[#ccff00]" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-white">Ticket Configuration</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
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
                          <p className="mt-2 text-xs text-gray-600 font-mono">Minimum tickets to start the raffle</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
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
                          <p className="mt-2 text-xs text-gray-600 font-mono">Maximum tickets available</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#ccff00]/10 blur-md rounded-xl" />
                          <div className="relative w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center border border-[#ccff00]/20">
                            <Clock className="w-5 h-5 text-[#ccff00]" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-white">Duration</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#ccff00]/20 to-transparent" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wide">
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
                        <p className="mt-2 text-xs text-gray-600 font-mono">
                          When the raffle will end and winner will be selected
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation footer */}
                <div className="pt-8 border-t border-[#ccff00]/10 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={goBack}
                        className="w-full md:w-auto px-6 py-3 rounded-xl border border-[#ccff00]/10 bg-[#111] text-gray-300 font-mono text-sm hover:border-[#ccff00]/30 hover:text-white transition-all"
                      >
                        Back
                      </button>
                    )}

                    {step < 3 && (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                        className="btn-shine w-full md:w-auto px-6 py-3 rounded-xl bg-[#ccff00] hover:bg-[#dfff00] disabled:bg-[#1a1a1a] disabled:text-gray-600 disabled:cursor-not-allowed text-black font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {step === 3 && (
                      <button
                        type="submit"
                        disabled={!isFormValid || isPending}
                        className="btn-shine w-full md:w-auto px-8 py-3 rounded-xl bg-[#ccff00] hover:bg-[#dfff00] disabled:bg-[#1a1a1a] disabled:text-gray-600 disabled:cursor-not-allowed text-black font-bold text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(204,255,0,0.15)] hover:shadow-[0_0_40px_rgba(204,255,0,0.25)] transition-all"
                      >
                        {isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Creating Raffle...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Create Raffle
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Trust notice */}
                  <div className="mt-2 p-4 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-xl">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                      <p className="text-sm text-gray-500 text-center font-mono">
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
