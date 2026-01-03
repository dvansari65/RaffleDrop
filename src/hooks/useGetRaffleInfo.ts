import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { useQuery } from "@tanstack/react-query"

export const useRaffleAccount = () => {
  const { program } = useRaffleProgram()
  
  return useQuery({
    queryKey: ["raffle-accounts"],
    queryFn: async () => {
      try {
        const accountInfo = await program?.account.raffleAccount.all()
        console.log("raffle account info:", accountInfo)
        return accountInfo
      } catch (error) {
        console.error("error:", error)
        throw error
      }
    },
    enabled: !!program, // Only run query when program is available
  })
}