export const config = {
  apiBase: import.meta.env.VITE_API_URL || "/api",
  vestingContractAddress: import.meta.env.VITE_VESTING_ADDRESS || "",
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 31337),
  rpcUrl: import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545",
};
