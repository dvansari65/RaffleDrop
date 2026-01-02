import { CreateRaffleInputs } from "@/types/raffle"

export function validateInputs(inputs: CreateRaffleInputs): void {
    const errors: string[] = []
  
    if (!inputs.itemName.trim()) errors.push("Item name is required")
    if (inputs.itemName.length > 32) errors.push("Item name must be ≤ 32 characters")
    if (inputs.itemDescription.length > 64) errors.push("Description must be ≤ 64 characters")
    if (inputs.itemImageUri.length > 64) errors.push("Image URI must be ≤ 64 characters")
    if (inputs.sellingPrice <= 0) errors.push("Selling price must be positive")
    if (inputs.ticketPrice <= 0) errors.push("Ticket price must be positive")
    if (inputs.minTickets <= 0) errors.push("Minimum tickets must be positive")
    if (inputs.maxTickets < inputs.minTickets) errors.push("Max tickets must be ≥ min tickets")
    
    const now = Math.floor(Date.now() / 1000)
    if (inputs.deadline <= now) errors.push("Deadline must be in the future")
  
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }
  }