import { RaffleStatus } from "@/types/raffleType";


export const getRaffleStatus = (status: any): RaffleStatus => {
    if (status.active) return "active";
    if (status.drawing) return "drawing";
    if (status.completed) return "completed";
    if (status.cancelled) return "cancelled";
    if (status.refunded) return "refunded";
    throw new Error("Invalid raffle status");
  };