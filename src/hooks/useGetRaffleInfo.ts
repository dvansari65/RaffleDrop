"use client"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { useQuery } from "@tanstack/react-query"

export const useRaffleAccount = () => {
  const { program } = useRaffleProgram()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["raffle-accounts"],
    queryFn: async () => {
      try {
        const accounts = await program.account.raffleAccount.all()
        console.log("accounts:",accounts)
        if (!accounts || accounts.length === 0) {
          return []
        }
        console.log("dataaa:",accounts)
        return accounts
      } catch (error: any) {
        console.log("error:",error)
        if (
          error.message?.includes("Account does not exist") ||
          error.message?.includes("Invalid account discriminator") ||
          error.message?.includes("No accounts found")
        ) {
          return []
        }
        throw new Error(error.message || "Failed to fetch raffle accounts")
      }
    },
    enabled: true, // Always enabled, not dependent on program
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  })

  return {
    data: data || [],
    isLoading,
    error: error?.message || null,
    refetch,
  }
}