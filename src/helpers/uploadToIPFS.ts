export async function uploadToIPFS(file: File): Promise<string> {
    try {
      if (!file) {
        throw new Error("No file provided");
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      console.log("data:",data)
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      // Return the CID for storing in your raffle
      return data.cid;
    } catch (error: any) {
      console.error("❌ IPFS Upload Error:", error.message);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }