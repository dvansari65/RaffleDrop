"use client"
import { CreateRaffle } from '@/api/createRaffle';
import { deadlineTimestamp } from '@/helpers/deadlineTimestamp';
import { CreateRaffleInputs } from '@/types/raffle';
import { ArrowRight, Clock, DollarSign, ImageIcon, Shield, Sparkles, Ticket, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

function page() {
  const [itemName, setItemName] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [url, setUrl] = useState("")
  const [imagePreview, setImagePreview] = useState('');
  const [deadline, setDeadline] = useState("")
  const [sellingPrice, setSellingPrice] = useState(0)
  const [ticketPrice, setTicketPrice] = useState(0)
  const [minTickets, setMinTickets] = useState(1)
  const [maxTickets, setMaxTickets] = useState(0)

  const {mutate,isPending} = CreateRaffle()

  const isFormValid = () => {
    return itemName &&
      itemDescription &&
      url &&
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
      itemImageUri:url,
      sellingPrice,
      ticketPrice,
      minTickets,
      maxTickets,
      deadline:timestamp
    }
    mutate(payload,{
      onSuccess:(tx)=>{
        if(tx){
          toast.success("Raffle created successfully!")
        }
      },
      onError:(error)=>{
        toast.error(error.message)
      }
    })
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <section className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Create Your Raffle</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Launch Your
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              On-Chain Raffle
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Set up a transparent, verifiable raffle in minutes. All transactions are on-chain with guaranteed payouts.
          </p>

          <div className="flex justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Transparent Odds</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Instant Payouts</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Item Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g., Rare NFT Collection #1234"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="itemDescription"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Describe your item in detail..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Image URL
                    </label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        name="itemImageUri"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        required
                      />
                      {imagePreview && (
                        <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-slate-700/50">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setImagePreview('')}
                          />
                        </div>
                      )}
                      {!imagePreview && (
                        <div className="aspect-video w-full max-w-md rounded-xl bg-slate-800/30 border-2 border-dashed border-slate-700/50 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Image preview will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Pricing</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Item Value (USDC)
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={(sellingPrice)}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      placeholder="Selling price in USDC"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500">Total value of the item being raffled</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ticket Price (USDC)
                    </label>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      placeholder="ticket price in USDC"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500">Price per raffle ticket</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Ticket Configuration</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Minimum Tickets
                    </label>
                    <input
                      type="number"
                      name="minTickets"
                      value={minTickets}
                      onChange={(e) => setMinTickets(Number(e.target.value))}
                      placeholder="10"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500">Minimum tickets to start the raffle</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Maximum Tickets
                    </label>
                    <input
                      type="number"
                      name="maxTickets"
                      value={maxTickets}
                      onChange={(e) => setMaxTickets(Number(e.target.value))}
                      placeholder="100"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500">Maximum tickets available</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Duration</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500">When the raffle will end and winner will be selected</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-700/30">
                <button
                  type="submit"
                  disabled={!isFormValid() || isPending}
                  className="w-full group bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-slate-900 disabled:text-slate-400 font-semibold px-10 py-4 text-lg rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-400/30 transition-all flex items-center justify-center gap-3"
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-3 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      Creating Raffle...
                    </>
                  ) : (
                    <>
                      Create Raffle
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm text-emerald-300/80 text-center">
                    🔒 Your raffle will be secured on-chain with transparent, verifiable randomness
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default page