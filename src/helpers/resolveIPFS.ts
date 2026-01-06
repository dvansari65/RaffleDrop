export function resolveIpfs(cid?: string): string | null {
    if (!cid) return null;
  
    // backward compatibility (old URLs)
    if (cid.startsWith("http")) return cid;
  
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  