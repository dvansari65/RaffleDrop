"use client"
import { CreateRaffle } from '@/api/createRaffle';
import { deadlineTimestamp } from '@/helpers/deadlineTimestamp';
import { CreateRaffleInputs } from '@/types/raffle';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Clock, DollarSign, ImageIcon, Shield, Sparkles, Ticket, TrendingUp, Users, Zap } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

function page() {
  const [itemName, setItemName] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('');
  const [deadline, setDeadline] = useState("")
  const [sellingPrice, setSellingPrice] = useState(0)
  const [ticketPrice, setTicketPrice] = useState(0)
  const [minTickets, setMinTickets] = useState(1)
  const [maxTickets, setMaxTickets] = useState(0)

  const {mutate,isPending} = CreateRaffle()
  const queryClient = useQueryClient()
  const isFormValid = () => {
    return itemName &&
      itemDescription &&
      image &&
      sellingPrice &&
      ticketPrice &&
      minTickets &&
      maxTickets &&
      deadline &&
      maxTickets >= minTickets
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const timestamp = deadlineTimestamp(deadline)
    const payload:CreateRaffleInputs = {
      itemName,
      itemDescription,
      itemImage:image,
      sellingPrice,
      ticketPrice,
      minTickets,
      maxTickets,
      deadline:timestamp
    }
    mutate(payload,{
      onSuccess:(tx)=>{
        if(tx){
          toast.success("Raffle created successfully!");
          queryClient.invalidateQueries({queryKey:["raffle-accounts"]})
        }
      },
      onError:(error)=>{
        toast.error(error.message)
      }
    })
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
    {/* Flickering background effects */}
    <div className="fixed top-0 left-0 w-96 h-96 bg-red-900/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl animate-pulse"></div>

    <section className="pt-24 pb-12 px-6 relative">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/50 backdrop-blur-sm rounded-full border border-red-800/50 mb-8">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-sm font-bold text-red-400 uppercase tracking-wider font-mono">Create Your Raffle</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Launch Your
          </span>
          <br />
          <span className="bg-gradient-to-r from-red-500 via-red-400 to-amber-500 bg-clip-text text-transparent">
            On-Chain Raffle
          </span>
        </h1>

        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-mono">
          Set up a transparent, verifiable raffle in minutes. All transactions are on-chain with guaranteed payouts.
        </p>

        <div className="flex justify-center gap-8 text-sm text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <span>100% Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <span>Transparent Odds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <span>Instant Payouts</span>
          </div>
        </div>
      </div>
    </section>

    <section className="px-6 pb-24 relative">
      <div className="container mx-auto max-w-4xl">
        {/* Glowing border effect */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-amber-600/20 to-red-600/20 rounded-2xl blur-xl"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-red-900/50 p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              {/* Item Details Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-md rounded-xl"></div>
                    <div className="relative w-10 h-10 rounded-xl bg-red-950/50 flex items-center justify-center border border-red-800/50">
                      <Ticket className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Item Details</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-900/50 to-transparent"></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g., Premium Wireless Headphones"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                      Description
                    </label>
                    <textarea
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Describe your item in detail..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all resize-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                      Image URL
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                       
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return;
                          setImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-mono"
                        required
                      />
                      {imagePreview ? (
                        <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-red-800/30">
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setImagePreview('')}
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full max-w-md rounded-xl bg-slate-800/30 border-2 border-dashed border-red-800/30 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 font-mono">Image preview will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-xl"></div>
                    <div className="relative w-10 h-10 rounded-xl bg-amber-950/50 flex items-center justify-center border border-amber-800/50">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Pricing</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-900/50 to-transparent"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                      Item Value (USDC)
                    </label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      placeholder="599"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500 font-mono">Total value of the item being raffled</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                      Ticket Price (USDC)
                    </label>
                    <input
                      type="number"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      placeholder="5"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500 font-mono">Price per raffle ticket</p>
                  </div>
                </div>
              </div>

              {/* Ticket Configuration Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-md rounded-xl"></div>
                    <div className="relative w-10 h-10 rounded-xl bg-red-950/50 flex items-center justify-center border border-red-800/50">
                      <Users className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Ticket Configuration</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-900/50 to-transparent"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                      Minimum Tickets
                    </label>
                    <input
                      type="number"
                      value={minTickets}
                      onChange={(e) => setMinTickets(Number(e.target.value))}
                      placeholder="10"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-mono"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500 font-mono">Minimum tickets to start the raffle</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                      Maximum Tickets
                    </label>
                    <input
                      type="number"
                      value={maxTickets}
                      onChange={(e) => setMaxTickets(Number(e.target.value))}
                      placeholder="100"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-mono"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500 font-mono">Maximum tickets available</p>
                  </div>
                </div>
              </div>

              {/* Duration Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-md rounded-xl"></div>
                    <div className="relative w-10 h-10 rounded-xl bg-red-950/50 flex items-center justify-center border border-red-800/50">
                      <Clock className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Duration</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-900/50 to-transparent"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-mono uppercase tracking-wide">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-mono"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500 font-mono">When the raffle will end and winner will be selected</p>
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-8 border-t border-red-900/30">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition"></div>
                  <button
                    type="submit"
                    disabled={!isFormValid() || isPending}
                    className="relative w-full group bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-bold px-10 py-4 text-lg rounded-xl shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-800/60 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
                  >
                    {isPending ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Raffle...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Create Raffle
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-red-950/30 border border-red-800/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-sm text-red-300/80 text-center font-mono">
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
  </div>
  )
}

export default page