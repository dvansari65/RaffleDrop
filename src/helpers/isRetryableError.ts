export function isRetryableError(error: any): boolean {
    const msg = error?.message ?? "";
  
    return (
      msg.includes("Blockhash not found") ||
      msg.includes("Transaction was not confirmed") ||
      msg.includes("Node is behind") ||
      msg.includes("Timed out") ||
      msg.includes("TransactionExpiredBlockheightExceededError") ||
      msg.includes("429") || // rate limit
      msg.includes("ECONNRESET") ||
      msg.includes("fetch failed")
    );
  }
  