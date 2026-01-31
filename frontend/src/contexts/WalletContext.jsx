import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BrowserProvider } from "ethers";
import { config } from "../config/env";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Install MetaMask or another Web3 wallet.");
      }
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts?.length) throw new Error("No accounts returned");
      const signerInstance = await provider.getSigner();
      setSigner(signerInstance);
      setAddress(accounts[0]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to connect wallet";
      setError(message);
      setAddress(null);
      setSigner(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setError(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    const chainIdHex = "0x" + config.chainId.toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      return true;
    } catch (e) {
      if (e.code === 4902 && config.chainId === 31337) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: chainIdHex,
              chainName: "Localhost 8545",
              rpcUrls: [config.rpcUrl],
            }],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts) => {
      if (!accounts.length) disconnect();
      else setAddress(accounts[0]);
    };
    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
    };
  }, [disconnect]);

  const value = {
    address,
    signer,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
