const GATEWAY = "https://gateway.pinata.cloud/ipfs";

export function ipfsUrl(uri) {
  if (!uri) return "";
  const trimmed = uri.trim();
  if (trimmed.startsWith("ipfs://")) {
    const path = trimmed.slice(7);
    return `${GATEWAY}/${path}`;
  }
  if (trimmed.startsWith("Qm") || trimmed.startsWith("baf")) {
    return `${GATEWAY}/${trimmed}`;
  }
  return trimmed;
}
